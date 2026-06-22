import { useEffect, useRef } from "react";
import { OFFICIAL_SOURCE } from "@/config/disclaimer";

interface DisclaimerDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full disclaimer, openable any time from the persistent entry (ADR 0008).
 * Hand-rolled per ADR 0005 (shadcn/ui deferred): role=dialog + Esc + focus + a
 * backdrop button for click-to-close.
 */
export function DisclaimerDialog({ open, onClose }: DisclaimerDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    // Trap focus: pull it back if it escapes the dialog (Tab / Shift+Tab).
    const onFocusIn = (event: FocusEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        closeButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      previouslyFocused?.focus(); // restore focus to the opener on close
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="關閉免責聲明"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-neutral-900/40 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        className="relative w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-xl"
      >
        <h2 id="disclaimer-title" className="text-lg font-semibold text-neutral-900">
          規劃輔助 · 免責聲明
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600">
          <p>
            本站定位為
            <strong className="font-medium text-neutral-800">飛行規劃輔助</strong>
            ，提供參考性資訊，
            <strong className="font-medium text-neutral-800">
              不對「是否合法、可否飛行」做最終裁定
            </strong>
            。
          </p>
          <p>
            禁航區、限航區等圖資為彙整資料、
            <strong className="font-medium text-neutral-800">可能過期或不完整</strong>
            ；任何評估與建議皆為參考性呈現。請以官方最新公告為準，並自行確認當地法規、天氣與空域限制。
          </p>
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
            ⚠️ V0 為展示版本，地圖上的禁限航範圍為<strong className="font-medium">示意假資料</strong>
            ，非真實圖資。
          </p>
        </div>
        <a
          href={OFFICIAL_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800 hover:underline"
        >
          官方來源：{OFFICIAL_SOURCE.label} ↗
        </a>
        <div className="mt-6 flex justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            我了解
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerDialog;
