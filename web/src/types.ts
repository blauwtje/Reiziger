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
  fromPlatform: string | null;
  toName: string;
  toStopGtfsId: string | null;
  toPlatform: string | null;
  distanceM: number;
  startTime: number;
  endTime: number;
  realTime: boolean;
  departureDelaySec: number;
  arrivalDelaySec: number;
}

export interface ShapedTransfer {
  atStopName: string;
  fromRoute: string | null;
  toRoute: string | null;
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
  co2Grams: number;
  fareEuros: number | null;
  discountFareEuros: number | null;
}

export interface TransferRule {
  id: number;
  label: string;
  fromStopIds: string[];
  toStopIds: string[];
  fromRouteId: string | null;
  toRouteId: string | null;
  minBufferSec: number;
  enabled: boolean;
}

export interface Discount {
  id: 'dal-voordeel' | 'altijd-voordeel' | 'ov-jaarkaart' | 'dal-vrij';
  active: boolean;
}

export interface SavedRoute {
  id: string;
  label: string;
  fromGtfsId: string;
  fromName: string;
  toGtfsId: string;
  toName: string;
  daysOfWeek: number[];
}

export interface UserProfile {
  minTransferSec: number;
  walkSpeedKmh: number;
  bikeSpeedKmh: number;
  discounts: Discount[];
  savedRoutes: SavedRoute[];
  theme: 'dark' | 'light';
}

export interface Disruption {
  id: string;
  title: string;
  body: string;
  severity: 'low' | 'medium' | 'high';
  modality: string;
  area: string;
  until: string | null;
  affectsRoutes: string[];
}

export interface AddressHit {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
}

export type LocationHit = StopHit | AddressHit;

export function isStopHit(h: LocationHit): h is StopHit {
  return 'gtfsId' in h;
}
