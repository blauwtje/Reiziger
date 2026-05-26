# Reiziger

Arrive-by journey planning for Dutch public transport (train, bus, tram, metro) with **custom
minimum transfer buffers at specific transfer points** — the one thing NS Reisplanner and 9292
won't let you do.

Tell it *"at this station, when I change from this train to that bus, give me at least 15
minutes"* and it bakes that rule into the routing graph as a GTFS constrained transfer. Journeys
that violate your buffer are never offered — and OTP still finds the correct slower alternative,
because the constraint lives in the graph, not in a post-filter.

- **Data:** OVapi / NDOV open GTFS + GTFS-realtime (all NL operators, free, no key).
- **Routing:** self-hosted OpenTripPlanner 2 (Docker).
- **Custom buffers:** stored as rules → compiled into `transfers.txt` → graph rebuild.
- **Stack:** Node + TypeScript (Fastify) BFF · React + Vite + Tailwind front · all local.

> Status: v1, single-user, local-first. See [Limitations](#limitations).

---

## How it works

```
React + Vite + Tailwind  (web, :5173)
        │  /api  (Vite dev proxy)
        ▼
Node + TS BFF (Fastify, :3001)
   • rules CRUD (JSON file)
   • compile: rules → transfers.txt (merged into the feed dir)
   • rebuild: stop OTP → build graph → start OTP
   • plan proxy → arrive-by + shaped itineraries/buffers
        │  GTFS GraphQL (arriveBy: true)
        ▼
OpenTripPlanner 2  (Docker, :8080)
   • builds from otp/data/gtfs/  (+ injected transfers.txt)
   • GTFS-RT updaters poll OVapi every 60s
        │
OVapi / NDOV:  gtfs-nl.zip · tripUpdates.pb · alerts.pb · vehiclePositions.pb
```

The differentiator is **graph-baked, not post-filtered**: a rule becomes a `transfer_type=2`
(`min_transfer_time`) row in `transfers.txt`, which OTP imports as a constrained transfer and the
Raptor algorithm enforces while searching.

---

## Prerequisites

- **Docker Desktop** with **≥ 8 GB** available to its VM. The all-NL graph needs an ~8 GB JVM
  heap to build. On Windows/WSL2 this repo includes a `.wslconfig` step — see below.
- **Node 20+** (developed on Node 22).
- A shell with `curl` + `unzip` for the feed refresh (git-bash on Windows is fine).

### One-time: give Docker/WSL2 enough memory (Windows)

The default WSL2 memory (~50% of host) is too small and the graph build OOMs. Create
`C:\Users\<you>\.wslconfig`:

```ini
[wsl2]
memory=10GB
swap=2GB
```

then `wsl --shutdown` (Docker Desktop restarts its backend automatically). Revert by deleting the
file and shutting down again. On macOS/Linux, set the memory limit in Docker Desktop → Resources.

---

## First run

```bash
# 1) Install workspace deps (api + web)
npm install

# 2) Download the NL feed, extract it, save the pristine transfers baseline,
#    apply any rules, and build + start the OTP graph. Takes a few minutes.
npm run refresh          # curl + unzip + compile + otp:rebuild

# (refresh also starts OTP. To start/stop OTP on its own:)
#   npm run otp:up    /   npm run otp:down    /   npm run otp:logs

# 3) In two more terminals:
npm run dev:api          # Fastify BFF on http://localhost:3001
npm run dev:web          # Vite on http://localhost:5173
```

Open **http://localhost:5173**. The header shows a green dot when the BFF can reach OTP.

> If you'd rather do the feed steps by hand the first time: `npm run otp:build` builds the graph
> from whatever is in `otp/data/gtfs/`, and `npm run otp:up` serves it.

---

## Daily use

- **Plan:** pick origin + destination (stop search), set an arrival time, hit **Find departures**.
  The hero card is the *latest you can leave and still arrive in time*; expand any option to see the
  full timeline and every transfer's buffer (color-coded; live delays shown when present).
- **Transfer buffers:** the **Transfer buffers** tab manages your rules. Add one, then click
  **Apply rules & rebuild graph** (a few minutes) to make it live.

### Adding a buffer rule

1. **Transfer buffers → New rule.**
2. Give it a label (*"weak Bunnik train → bus 341"*).
3. Add the **alight** stop(s) and the **board** stop(s). A station is many GTFS stops — add the
   specific platform/quay you use. (Use the planner once to see the exact stop names.)
4. Set the minimum buffer in minutes. Save.
5. **Apply rules & rebuild graph.**

Rules are stored in `api/data/rules.json`; the compile step merges them into
`otp/data/gtfs/transfers.txt` (over the pristine `otp/data/transfers.orig.txt` baseline, so it's
idempotent), then the graph is rebuilt.

---

## Refreshing the feed

The OVapi feed rebuilds nightly. To pull a fresh copy, re-apply your rules, and rebuild:

```bash
npm run refresh
```

---

## Project layout

```
docker-compose.yml          # otp (serve) + otp-build (one-shot build) services
otp/data/
  build-config.json         # GTFS feedId + timezone (builds from ./gtfs)
  router-config.json        # GTFS-RT updaters (OVapi .pb, 60s)
  gtfs/                      # unzipped feed OTP builds from (gitignored)
  transfers.orig.txt        # pristine transfers baseline (gitignored)
  graph.obj                 # built graph (gitignored)
api/                        # Node + TS (Fastify) BFF
  src/compile/transfers.ts  # rules → transfers.txt rows (unit-tested)
  src/compile/gtfs.ts       # merge + write into the feed dir
  src/otp/{client,plan,rebuild}.ts
  src/rules/{store,types}.ts
  src/cli/{compile,spike}.ts
  src/server.ts
web/                        # React + Vite + Tailwind
scripts/refresh.sh          # download → extract → compile → rebuild
```

Run the BFF unit tests: `npm test`.

---

## Verifying the differentiator (the spike)

`api/src/cli/spike.ts` proves buffers actually change routing end-to-end:

```bash
# explore: find a journey with a transfer and validate the live plan query
npm -w api exec tsx src/cli/spike.ts explore "Amsterdam Centraal" "Wijk bij Duurstede"

# run: add a rule demanding +30 min at that transfer, rebuild, re-plan, report PASS/FAIL
npm -w api exec tsx src/cli/spike.ts run "Amsterdam Centraal" "Wijk bij Duurstede"
```

On this machine, `Amsterdam Centraal → Wijk bij Duurstede` returns train→train→train→**bus 341**,
with a tight ~9-minute Sprinter→bus transfer at **Bunnik**. Adding a ≥39-minute rule there and
rebuilding removes that connection from every offered itinerary — exactly the intended behavior.

---

## Limitations

- **Single-user**, no auth. Rules are global, in a JSON file.
- **Transit-only graph (no OSM street data).** Origin/destination are *stops* (use the search),
  not arbitrary addresses; transfers come from the feed's `transfers.txt` + our rules. Adding a NL
  OSM extract to `otp/data/` and rebuilding would enable door-to-door walking.
- **Rules apply on rebuild** (~3-4 min), not instantly. Fine for a small, rarely-changing rule set.
- **Route-level rules** (`from_route_id`/`to_route_id`) are supported by the data model and
  compiler but the v1 UI creates stop-level rules only.
- **OVapi has no SLA** (community-run). A known-good `gtfs-nl.zip` stays cached locally between
  refreshes.

---

## Data & licensing

GTFS + GTFS-RT from **OVapi / NDOV Loket** (open data). You compute and serve *journeys*, not the
raw feed. Routing by **OpenTripPlanner**. No scraping of NS.nl / 9292.nl anywhere.
```
