import { useState } from "react";
import { hasAcknowledgedCurrent, writeConsent } from "./consent";

/** First-visit acknowledgement state for the current disclaimer version (ADR 0008). */
export function useDisclaimerConsent() {
  const [acknowledged, setAcknowledged] = useState(hasAcknowledgedCurrent);

  const acknowledge = () => {
    writeConsent();
    setAcknowledged(true);
  };

  return { needsAcknowledgement: !acknowledged, acknowledge };
}
