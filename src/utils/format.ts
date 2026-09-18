const dateFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDayFmt = new Intl.DateTimeFormat('es', { weekday: 'short' });

// Fechas tipo "YYYY-MM-DD" se parsean como locales (no UTC), mismo criterio
// que frontend/src/utils/format.js — si no, un date-only string corre el
// riesgo de mostrar el día anterior según el huso horario del dispositivo.
function toLocalDate(value: string): Date {
  return new Date(value.length <= 10 ? `${value}T00:00:00` : value);
}

export function formatDate(value: string): string {
  return dateFmt.format(toLocalDate(value));
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function tripDays(start: string, end: string): number {
  const ms = toLocalDate(end).getTime() - toLocalDate(start).getTime();
  return Math.round(ms / 86400000) + 1;
}

export function formatShortDay(value: string): string {
  const label = shortDayFmt.format(toLocalDate(value)).replace(/\.$/, '');
  const dayNumber = toLocalDate(value).getDate();
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${dayNumber}`;
}

export function formatEndTime(startTime: string | null, durationMinutes: number | null): string | null {
  if (!startTime || !durationMinutes) return null;
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = (h * 60 + m + durationMinutes) % (24 * 60);
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}
