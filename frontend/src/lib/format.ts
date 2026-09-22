const currency = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

// Deadlines are stored at UTC midnight, so they must be read back in UTC —
// formatting in local time would show the previous day west of Greenwich.
const date = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatBudget = (amount: number) => currency.format(amount);
export const formatDate = (iso: string) => date.format(new Date(iso));

/** Whole days from today to the given date; negative once the date has passed. */
export function daysUntil(iso: string): number {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  return Math.round((new Date(iso).getTime() - startOfToday.getTime()) / 86_400_000);
}

export function describeDeadline(iso: string): string {
  const days = daysUntil(iso);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 0) return `in ${days} days`;
  if (days === -1) return "1 day overdue";
  return `${Math.abs(days)} days overdue`;
}
