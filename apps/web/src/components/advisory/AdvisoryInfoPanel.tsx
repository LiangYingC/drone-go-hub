import { useAppStore } from "@/store";
import { useSelectedZoneId } from "@/store/selectors";
import { CATEGORY_LABEL } from "./categoryLabel";
import { CATEGORY_STYLE, rgba } from "./categoryStyle";
import { getDemoZoneById } from "./demoZones";

/**
 * Reference card for the selected advisory zone (ADR 0008): reference language only,
 * source + last-updated shown persistently, and never a can-fly / legality verdict.
 */
export function AdvisoryInfoPanel() {
  const selectedZoneId = useSelectedZoneId();
  const clearSelection = useAppStore((s) => s.clearSelection);

  if (!selectedZoneId) return null;
  const zone = getDemoZoneById(selectedZoneId);
  if (!zone) return null;

  const { name, category, advisoryNote, source, sourceUrl, lastUpdated } = zone.properties;

  return (
    <div className="fixed right-3 bottom-3 z-10 max-w-80 rounded-xl border border-black/5 bg-white/95 p-4 shadow-md backdrop-blur">
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className="mt-1 size-3 shrink-0 rounded-full"
          style={{ backgroundColor: rgba(CATEGORY_STYLE[category].line) }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-500">{CATEGORY_LABEL[category]}</p>
          <h2 className="truncate text-sm font-semibold text-neutral-900">{name}</h2>
        </div>
        <button
          type="button"
          aria-label="關閉"
          onClick={clearSelection}
          className="shrink-0 rounded-md px-1.5 text-neutral-400 transition-colors hover:text-neutral-700"
        >
          ✕
        </button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{advisoryNote}</p>

      <p className="mt-2 text-xs text-amber-700">⚠️ 僅供飛行前參考，請以官方公告為準。</p>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
        <div className="flex gap-1">
          <dt>來源</dt>
          <dd className="text-neutral-700">
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-700 hover:underline"
              >
                {source} ↗
              </a>
            ) : (
              source
            )}
          </dd>
        </div>
        <div className="flex gap-1">
          <dt>更新</dt>
          <dd className="text-neutral-700">{lastUpdated}</dd>
        </div>
      </dl>
    </div>
  );
}

export default AdvisoryInfoPanel;
