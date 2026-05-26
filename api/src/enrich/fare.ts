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

export function discountFactor(discountId: string, peak: boolean): number {
  if (discountId === 'ov-jaarkaart') return 1.0;
  if (discountId === 'altijd-voordeel') return 0.4;
  if (!peak && discountId === 'dal-vrij') return 1.0;
  if (!peak && discountId === 'dal-voordeel') return 0.4;
  return 0;
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
  for (const id of activeDiscounts) {
    const f = discountFactor(id, peak);
    if (f > factor) factor = f;
  }

  return { base, discounted: Math.round(base * (1 - factor) * 100) / 100 };
}
