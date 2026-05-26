import { ShapedItinerary, LocationHit } from '../types';

function formatTime(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function exportIcs(it: ShapedItinerary, origin: LocationHit, dest: LocationHit): void {
  const startTime = formatTime(it.startTime);
  const endTime = formatTime(it.endTime);
  const durationMin = Math.floor(it.durationSec / 60);
  const summary = `Reis ${origin.name} → ${dest.name}`;
  const description = `${it.transfers}x overstap · ${durationMin} min`;

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Reiziger//NL
BEGIN:VEVENT
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${summary}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const encoded = encodeURIComponent(ics);
  const dataUri = `data:text/calendar;charset=utf-8,${encoded}`;

  const a = document.createElement('a');
  a.href = dataUri;
  a.download = 'reis.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
