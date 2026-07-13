/**
 * Reconcile the open-data manifest (2018 vintage) against the pinned eAIP
 * current list, deciding which files to ingest and surfacing the difference.
 */

import type { EaipRestrictedArea } from "./eaipCurrentList";
import { EAIP_RESTRICTED_AREAS } from "./eaipCurrentList";
import type { ManifestEntry } from "./manifest";
import { designationOf } from "./manifest";

export interface CrossCheckResult {
  /** Current zones matched to their open-data KML file, in eAIP order. */
  matched: { area: EaipRestrictedArea; entry: ManifestEntry }[];
  /** Current zones whose polygon is generated from the eAIP circle definition. */
  circles: EaipRestrictedArea[];
  /** Manifest zones absent from the current eAIP list — abolished, not emitted. */
  stale: ManifestEntry[];
  /** Manifest rows that are not zone files (aggregate file, 東、南沙 CAD file). */
  ignored: ManifestEntry[];
}

export function crossCheck(entries: ManifestEntry[]): CrossCheckResult {
  const byDesignation = new Map<string, ManifestEntry>();
  const stale: ManifestEntry[] = [];
  const ignored: ManifestEntry[] = [];

  const current = new Set(EAIP_RESTRICTED_AREAS.map((a) => a.designation));

  for (const entry of entries) {
    const designation = designationOf(entry);
    if (designation === null) {
      // The aggregate 限航區範圍 file and the 東、南沙群島 file (whose zones are
      // generated from the eAIP circle definitions instead).
      ignored.push(entry);
    } else if (current.has(designation)) {
      byDesignation.set(designation, entry);
    } else {
      stale.push(entry);
    }
  }

  const matched: CrossCheckResult["matched"] = [];
  const circles: EaipRestrictedArea[] = [];
  const missing: string[] = [];

  for (const area of EAIP_RESTRICTED_AREAS) {
    if (area.geometrySource === "eaipCircle") {
      circles.push(area);
      continue;
    }
    const entry = byDesignation.get(area.designation);
    if (entry) {
      matched.push({ area, entry });
    } else {
      missing.push(area.designation);
    }
  }

  // A current zone without source geometry would silently vanish from the map;
  // that is a data problem a human must resolve, never a partial output.
  if (missing.length > 0) {
    throw new Error(`Current eAIP zones missing from open-data manifest: ${missing.join(", ")}`);
  }

  return { matched, circles, stale, ignored };
}
