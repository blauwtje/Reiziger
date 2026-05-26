import type { ShapedLeg } from '../otp/plan';

const GRAMS_PER_KM: Record<string, number> = {
  RAIL:    14,
  BUS:     89,
  TRAM:     7,
  SUBWAY:   8,
  FERRY:  130,
  WALK:     0,
};

export function calcCo2(legs: ShapedLeg[]): number {
  return Math.round(
    legs.reduce((sum, l) => sum + (l.distanceM / 1000) * (GRAMS_PER_KM[l.mode] ?? 0), 0),
  );
}
