import { CATEGORY_LABEL } from "./categoryLabel";
import { CATEGORY_STYLE, rgba } from "./categoryStyle";
import type { AdvisoryCategory } from "./types";

/** Derived from the palette so a new category can never be missing from the legend. */
export const LEGEND_CATEGORIES = Object.keys(CATEGORY_STYLE) as AdvisoryCategory[];

/**
 * Map legend for the advisory layers: one swatch per category, drawn with the
 * same fill/line colours the map uses, plus a note that V0 data is demo-only.
 */
export function AdvisoryLegend() {
  return (
    <div className="fixed top-3 right-3 z-10 rounded-xl border border-black/5 bg-white/95 px-3 py-2.5 shadow-md backdrop-blur">
      <h2 className="text-xs font-medium text-neutral-500">法規圖層</h2>
      <ul className="mt-1.5 space-y-1.5">
        {LEGEND_CATEGORIES.map((category) => (
          <li key={category} className="flex items-center gap-2 text-xs text-neutral-700">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-sm border-2"
              style={{
                backgroundColor: rgba(CATEGORY_STYLE[category].fill),
                borderColor: rgba(CATEGORY_STYLE[category].line),
              }}
            />
            {CATEGORY_LABEL[category]}
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-neutral-200 pt-1.5 text-[10px] text-neutral-400">
        示意資料（demo）
      </p>
    </div>
  );
}

export default AdvisoryLegend;
