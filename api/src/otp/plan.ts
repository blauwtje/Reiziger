import { gql } from './client';

export interface StopHit {
  gtfsId: string;
  name: string;
  code: string | null;
  lat: number;
  lon: number;
  parentStation: { gtfsId: string; name: string } | null;
}

export interface RouteHit {
  gtfsId: string;
  shortName: string | null;
  longName: string | null;
  mode: string;
}

export interface ShapedLeg {
  mode: string;
  transit: boolean;
  routeShortName: string | null;
  routeLongName: string | null;
  routeGtfsId: string | null;
  tripGtfsId: string | null;
  headsign: string | null;
  fromName: string;
  fromStopGtfsId: string | null;
  toName: string;
  toStopGtfsId: string | null;
  startTime: number; // epoch ms
  endTime: number; // epoch ms
  realTime: boolean;
  departureDelaySec: number;
  arrivalDelaySec: number;
}

export interface ShapedTransfer {
  atStopName: string;
  fromRoute: string | null;
  toRoute: string | null;
  /** Gap between alighting the previous transit vehicle and the next one departing. */
  bufferSec: number;
}

export interface ShapedItinerary {
  startTime: number;
  endTime: number;
  durationSec: number;
  transfers: number;
  hasRealtime: boolean;
  legs: ShapedLeg[];
  transferDetails: ShapedTransfer[];
}

const PLAN_QUERY = `
query Plan($from: String!, $to: String!, $date: String!, $time: String!, $arriveBy: Boolean!, $num: Int!) {
  plan(
    fromPlace: $from
    toPlace: $to
    date: $date
    time: $time
    arriveBy: $arriveBy
    numItineraries: $num
    transportModes: [{ mode: TRANSIT }, { mode: WALK }]
  ) {
    routingErrors { code description }
    itineraries {
      startTime
      endTime
      duration
      numberOfTransfers
      legs {
        mode
        startTime
        endTime
        realTime
        departureDelay
        arrivalDelay
        from { name stop { gtfsId } }
        to { name stop { gtfsId } }
        route { gtfsId shortName longName mode }
        trip { gtfsId tripHeadsign }
      }
    }
  }
}`;

interface RawLeg {
  mode: string;
  startTime: number;
  endTime: number;
  realTime: boolean;
  departureDelay: number | null;
  arrivalDelay: number | null;
  from: { name: string; stop: { gtfsId: string } | null };
  to: { name: string; stop: { gtfsId: string } | null };
  route: { gtfsId: string; shortName: string | null; longName: string | null; mode: string } | null;
  trip: { gtfsId: string; tripHeadsign: string | null } | null;
}

interface RawPlan {
  plan: {
    routingErrors: Array<{ code: string; description: string }>;
    itineraries: Array<{
      startTime: number;
      endTime: number;
      duration: number;
      numberOfTransfers: number;
      legs: RawLeg[];
    }>;
  };
}

function splitDateTime(isoLocal: string): { date: string; time: string } {
  const [date, t = '00:00'] = isoLocal.split('T');
  const time = /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t;
  return { date, time };
}

function shapeLeg(leg: RawLeg): ShapedLeg {
  return {
    mode: leg.mode,
    transit: leg.mode !== 'WALK',
    routeShortName: leg.route?.shortName ?? null,
    routeLongName: leg.route?.longName ?? null,
    routeGtfsId: leg.route?.gtfsId ?? null,
    tripGtfsId: leg.trip?.gtfsId ?? null,
    headsign: leg.trip?.tripHeadsign ?? null,
    fromName: leg.from.name,
    fromStopGtfsId: leg.from.stop?.gtfsId ?? null,
    toName: leg.to.name,
    toStopGtfsId: leg.to.stop?.gtfsId ?? null,
    startTime: leg.startTime,
    endTime: leg.endTime,
    realTime: Boolean(leg.realTime),
    departureDelaySec: leg.departureDelay ?? 0,
    arrivalDelaySec: leg.arrivalDelay ?? 0,
  };
}

/** Buffer at each interchange = next transit departure - previous transit arrival. */
function transferDetails(legs: ShapedLeg[]): ShapedTransfer[] {
  const transit = legs.filter((l) => l.transit);
  const out: ShapedTransfer[] = [];
  for (let i = 1; i < transit.length; i++) {
    const prev = transit[i - 1];
    const next = transit[i];
    out.push({
      atStopName: prev.toName,
      fromRoute: prev.routeShortName,
      toRoute: next.routeShortName,
      bufferSec: Math.round((next.startTime - prev.endTime) / 1000),
    });
  }
  return out;
}

export async function planArriveBy(
  fromStopGtfsId: string,
  toStopGtfsId: string,
  arrivalIsoLocal: string,
  num = 6,
): Promise<ShapedItinerary[]> {
  const { date, time } = splitDateTime(arrivalIsoLocal);
  const data = await gql<RawPlan>(PLAN_QUERY, {
    from: fromStopGtfsId,
    to: toStopGtfsId,
    date,
    time,
    arriveBy: true,
    num,
  });
  const itineraries = data.plan?.itineraries ?? [];
  return itineraries.map((it) => {
    const legs = it.legs.map(shapeLeg);
    return {
      startTime: it.startTime,
      endTime: it.endTime,
      durationSec: it.duration,
      transfers: it.numberOfTransfers,
      hasRealtime: legs.some((l) => l.realTime),
      legs,
      transferDetails: transferDetails(legs),
    };
  });
}

const STOPS_QUERY = `
query Stops($name: String!) {
  stops(name: $name) {
    gtfsId
    name
    code
    lat
    lon
    parentStation { gtfsId name }
  }
}`;

export async function searchStops(name: string, limit = 15): Promise<StopHit[]> {
  const data = await gql<{ stops: StopHit[] }>(STOPS_QUERY, { name });
  return (data.stops ?? []).slice(0, limit);
}

const STOP_ROUTES_QUERY = `
query StopRoutes($id: String!) {
  stop(id: $id) {
    gtfsId
    name
    routes { gtfsId shortName longName mode }
  }
}`;

export async function routesAtStop(gtfsId: string): Promise<RouteHit[]> {
  const data = await gql<{ stop: { routes: RouteHit[] } | null }>(STOP_ROUTES_QUERY, { id: gtfsId });
  return data.stop?.routes ?? [];
}
