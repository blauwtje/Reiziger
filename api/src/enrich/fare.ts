import type { ShapedLeg } from '../otp/plan';

const EUR_PER_KM: Record<string, number> = {
  RAIL:   0.196,
  BUS:    0.17,
  TRAM:   0.17,
  SUBWAY: 0.17,
  FERRY:  0.20,
  WALK:   0,
};

function isPeak(startTimeMs: number): boolean {
  const d = new Date(startTimeMs);
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const mins = d.getHours() * 60 + d.getMinutes();
  return (mins >= 390 && mins < 540) || (mins >= 960 && mins < 1110);
}

export function calcFare(
  legs: ShapedLeg[],
  activeDiscounts: string[],
  startTimeMs: number,
): { base: number; discounted: number } {
  const base = Math.round(
    legs.reduce((s, l) => s + (l.distanceM / 1000) * (EUR_PER_KM[l.mode] ?? 0), 0) * 100,
  ) / 100;

  const peak = isPeak(startTimeMs);
  let factor = 0;

  if (activeDiscounts.includes('ov-jaarkaart')) {
    factor = 1.0;
  } else if (activeDiscounts.includes('altijd-voordeel')) {
    factor = 0.4;
  } else if (!peak && activeDiscounts.includes('dal-vrij')) {
    factor = 1.0;
  } else if (!peak && activeDiscounts.includes('dal-voordeel')) {
    factor = 0.4;
  }

  return { base, discounted: Math.round(base * (1 - factor) * 100) / 100 };
}
