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

export const DEFAULT_PROFILE: UserProfile = {
  minTransferSec: 300,
  walkSpeedKmh: 4.5,
  bikeSpeedKmh: 16,
  discounts: [
    { id: 'dal-voordeel',    active: false },
    { id: 'altijd-voordeel', active: false },
    { id: 'ov-jaarkaart',    active: false },
    { id: 'dal-vrij',        active: false },
  ],
  savedRoutes: [],
  theme: 'dark',
};
