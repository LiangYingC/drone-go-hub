import { DISCLAIMER_VERSION } from "@/config/disclaimer";

/**
 * Device-level acknowledgement record (ADR 0008). V0 has no login/DB, so consent
 * lives in localStorage as { disclaimerVersion, acknowledgedAt } — a per-device
 * record that survives until cache clear, migrated to an account once login exists.
 */
export interface DisclaimerConsent {
  disclaimerVersion: string;
  acknowledgedAt: string;
}

const STORAGE_KEY = "dgh.disclaimerConsent";

/** Read stored consent, tolerating absent / corrupt / blocked storage. */
export function readConsent(): DisclaimerConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DisclaimerConsent>;
    if (typeof parsed.disclaimerVersion !== "string" || typeof parsed.acknowledgedAt !== "string") {
      return null;
    }
    return { disclaimerVersion: parsed.disclaimerVersion, acknowledgedAt: parsed.acknowledgedAt };
  } catch {
    return null;
  }
}

/** Whether the current disclaimer version has been acknowledged on this device. */
export function hasAcknowledgedCurrent(): boolean {
  return readConsent()?.disclaimerVersion === DISCLAIMER_VERSION;
}

/** Persist acknowledgement of the current disclaimer version (best-effort). */
export function writeConsent(): void {
  const consent: DisclaimerConsent = {
    disclaimerVersion: DISCLAIMER_VERSION,
    acknowledgedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // storage blocked (e.g. private mode) — acknowledgement is best-effort this session
  }
}
