import { useCallback, useState } from "react";
import { DisclaimerDialog } from "./DisclaimerDialog";
import { useDisclaimerConsent } from "./useDisclaimerConsent";

/**
 * Disclaimer surface (ADR 0008): a lightweight first-visit banner (auto-shown,
 * dismissible) plus a persistent entry that can reopen the full disclaimer any
 * time. Both coexist; the banner disappears once acknowledged for this version.
 */
export function Disclaimer() {
  const { needsAcknowledgement, acknowledge } = useDisclaimerConsent();
  const [dialogOpen, setDialogOpen] = useState(false);
  // Stable identity so the dialog's focus effect doesn't re-run on re-renders.
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return (
    <>
      {needsAcknowledgement && (
        <div className="fixed inset-x-0 top-0 z-20 flex justify-center p-3">
          <div className="flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-amber-200 bg-white/95 px-4 py-2.5 text-sm shadow-md backdrop-blur">
            <span aria-hidden className="text-amber-600">
              ⚠️
            </span>
            <p className="min-w-0 flex-1 text-neutral-700">
              本站僅供飛行<strong className="font-medium text-neutral-900">規劃參考</strong>
              ，非官方法規判定；禁限航資訊可能過期，請以民航局為準。
            </p>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="shrink-0 font-medium text-sky-700 hover:underline"
            >
              完整說明
            </button>
            <button
              type="button"
              onClick={acknowledge}
              className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white transition-colors hover:bg-neutral-800"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-black/5 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-600 shadow-md backdrop-blur transition-colors hover:text-neutral-900"
      >
        <span aria-hidden>ⓘ</span>
        免責聲明
      </button>

      <DisclaimerDialog open={dialogOpen} onClose={closeDialog} />
    </>
  );
}

export default Disclaimer;
