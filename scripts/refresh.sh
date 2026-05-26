#!/usr/bin/env bash
# Refresh the NL GTFS feed, re-apply custom transfer rules, and rebuild the graph.
# Run from a shell with curl + unzip available (e.g. git-bash):  npm run refresh
set -euo pipefail
cd "$(dirname "$0")/.."
DATA="otp/data"

echo "==> Downloading NL GTFS (gtfs-nl.zip, ~190 MB)..."
curl -L --fail --retry 3 -o "$DATA/gtfs-nl.zip" https://gtfs.ovapi.nl/nl/gtfs-nl.zip

echo "==> Extracting to $DATA/gtfs ..."
rm -rf "$DATA/gtfs"
mkdir -p "$DATA/gtfs"
unzip -o -q "$DATA/gtfs-nl.zip" -d "$DATA/gtfs"

echo "==> Saving pristine transfers.txt baseline..."
cp "$DATA/gtfs/transfers.txt" "$DATA/transfers.orig.txt"

echo "==> Applying custom transfer rules to transfers.txt..."
npm -w api run compile

echo "==> Rebuilding OTP graph and restarting server..."
npm run otp:rebuild

echo "==> Done. Reiziger is using a fresh feed with your rules applied."
