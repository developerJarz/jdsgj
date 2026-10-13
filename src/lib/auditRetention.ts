export const AUDIT_RETENTION_OPTIONS = [1, 3, 6, 12, 24] as const;
export const MAX_AUDIT_RETENTION_MONTHS = 24;

/** Entries created before the returned date are older than `months` calendar months. */
export function auditRetentionCutoff(months: unknown, now = new Date()): Date {
  if (typeof months !== 'number' || !Number.isInteger(months) || months < 1 || months > MAX_AUDIT_RETENTION_MONTHS) {
    throw new Error(`months must be a whole number from 1 to ${MAX_AUDIT_RETENTION_MONTHS}.`);
  }
  const cutoff = new Date(now);
  const day = cutoff.getUTCDate();
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
  cutoff.setUTCDate(Math.min(day, lastDay));
  return cutoff;
}
