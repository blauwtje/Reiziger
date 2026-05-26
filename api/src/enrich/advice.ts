import type { SavedRoute } from '../profile/types';
import { planArriveBy } from '../otp/plan';
import { discountFactor } from './fare';

const MONTHLY_EUR: Record<string, number> = {
  none:              0,
  'dal-voordeel':    5.10,
  'altijd-voordeel': 26.30,
  'dal-vrij':        115,
  'ov-jaarkaart':    346,
};

// Assumption: ~60% of saved-route trips fall in peak hours (commuter pattern).
const PEAK_SHARE = 0.6;

export interface AdviceOption {
  subscriptionId: string;
  label: string;
  monthlyEur: number;
}

export interface Advice {
  recommended: string | null;
  options: AdviceOption[];
  assumptions: {
    peakShare: number;
    weeksPerMonth: number;
  };
}

const SUBSCRIPTION_LABELS: Record<string, string> = {
  none:              'Geen abonnement',
  'dal-voordeel':    'Dal Voordeel',
  'altijd-voordeel': 'Altijd Voordeel',
  'dal-vrij':        'Dal Vrij',
  'ov-jaarkaart':    'OV-jaarkaart',
};

export async function computeAdvice(routes: SavedRoute[]): Promise<Advice> {
  if (routes.length === 0) {
    return { recommended: null, options: [], assumptions: { peakShare: PEAK_SHARE, weeksPerMonth: 4.33 } };
  }

  const baseFares: number[] = [];
  const tripsPerMonth: number[] = [];

  for (const route of routes) {
    const arriveBy = '2026-06-02T09:00';

    const from = route.fromGtfsId.startsWith('addr:')
      ? route.fromGtfsId.slice(5)
      : route.fromGtfsId;
    const to = route.toGtfsId.startsWith('addr:')
      ? route.toGtfsId.slice(5)
      : route.toGtfsId;

    try {
      const itineraries = await planArriveBy(from, to, arriveBy, 3, []);
      if (itineraries.length > 0) {
        const cheapest = itineraries.reduce((a, b) =>
          (a.fareEuros ?? Infinity) <= (b.fareEuros ?? Infinity) ? a : b,
        );
        baseFares.push(cheapest.fareEuros ?? 0);
      } else {
        baseFares.push(0);
      }
    } catch {
      baseFares.push(0);
    }

    tripsPerMonth.push(route.daysOfWeek.length * 2 * 4.33);
  }

  const subscriptions = Object.keys(MONTHLY_EUR);
  const options: AdviceOption[] = subscriptions.map((subId) => {
    const monthlyBase = MONTHLY_EUR[subId];
    let totalTicketCost = 0;
    for (let i = 0; i < routes.length; i++) {
      const base = baseFares[i];
      const trips = tripsPerMonth[i];
      const peakFactor = discountFactor(subId, true);
      const offPeakFactor = discountFactor(subId, false);
      const effectiveFactor = PEAK_SHARE * peakFactor + (1 - PEAK_SHARE) * offPeakFactor;
      totalTicketCost += trips * base * (1 - effectiveFactor);
    }
    return {
      subscriptionId: subId,
      label: SUBSCRIPTION_LABELS[subId] ?? subId,
      monthlyEur: Math.round((monthlyBase + totalTicketCost) * 100) / 100,
    };
  });

  const recommended = options.reduce((a, b) => a.monthlyEur <= b.monthlyEur ? a : b);

  return {
    recommended: recommended.subscriptionId,
    options,
    assumptions: { peakShare: PEAK_SHARE, weeksPerMonth: 4.33 },
  };
}
