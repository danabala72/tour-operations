export const BUSINESS_TIME_ZONE = "Asia/Makassar";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Returns the requested WITA calendar day as a UTC-midnight Date.
 * Reservation dates are stored as MySQL DATE values, so UTC midnight is used
 * only as a stable representation of the WITA calendar date.
 */
export function getBusinessDate(offsetDays = 0, now = new Date()): Date {
  const parts = dateFormatter.formatToParts(now);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  return new Date(
    Date.UTC(values.year, values.month - 1, values.day + offsetDays)
  );
}
