/**
 * Batch identity and the same-day cutoff.
 *
 * Everything is computed in Asia/Karachi regardless of server timezone —
 * a batch code must never roll over at the wrong midnight, and the cutoff
 * must mean 1pm in Lahore, not 1pm UTC.
 */

const TZ = "Asia/Karachi";

/**
 * The current epoch time, as a function.
 *
 * Wrapping it keeps `Date.now()` out of component bodies (React's purity lint
 * rule rightly objects to impure calls during render) and gives tests a single
 * place to freeze the clock.
 */
export function nowEpochMs() {
  return Date.now();
}

export function karachiNow(date = new Date()) {
  return new Date(date.toLocaleString("en-US", { timeZone: TZ }));
}

/** Batch codes read DD-MM-<letter>, e.g. "06-09-A". */
export function batchCode(date = new Date(), sequence = "A") {
  const local = karachiNow(date);
  const dd = String(local.getDate()).padStart(2, "0");
  const mm = String(local.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${sequence}`;
}

export function formatTime(date: Date) {
  return date
    .toLocaleTimeString("en-PK", {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

export function isBeforeCutoff(cutoffHour: number, date = new Date()) {
  return karachiNow(date).getHours() < cutoffHour;
}

export function hoursUntilCutoff(cutoffHour: number, date = new Date()) {
  const local = karachiNow(date);
  return cutoffHour - local.getHours() - local.getMinutes() / 60;
}

/**
 * The hero's freshness line. Until the admin panel is populated this derives a
 * plausible batch from the clock; once a Batch row exists for today it is read
 * from the database instead.
 */
export function todaysBatch(pressedAtHour = 6, pressedAtMinute = 40) {
  const local = karachiNow();
  const pressedAt = new Date(local);
  pressedAt.setHours(pressedAtHour, pressedAtMinute, 0, 0);

  return {
    code: batchCode(),
    pressedAt,
    pressedAtLabel: formatTime(pressedAt),
    city: "Lahore",
  };
}
