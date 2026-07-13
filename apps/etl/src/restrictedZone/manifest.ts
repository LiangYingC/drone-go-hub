/**
 * Parser for the CAA open-data "manifest" CSV.
 *
 * The dataset's single distribution on data.gov.tw is not the map data itself
 * but a CSV listing one downloadable file per zone (名稱,版本,時間,路徑). Values
 * never contain commas or quotes, so a plain split is safe and avoids a CSV
 * dependency; the header is asserted so a format change fails loudly instead
 * of producing garbage rows.
 */

export interface ManifestEntry {
  /** Zone label as published, e.g. "RCR16（陽明山）" or "（總）限航區範圍". */
  name: string;
  /** Publication version, e.g. "107年8月" (ROC calendar). */
  version: string;
  /** Source-side file date, ISO 8601 date, e.g. "2018-08-31". */
  date: string;
  /** Download URL of the per-zone KML. */
  url: string;
}

const EXPECTED_HEADER = "名稱,版本,時間,路徑";

export function parseManifest(csv: string): ManifestEntry[] {
  // The CAA file starts with a UTF-8 BOM.
  const lines = csv
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const [header, ...rows] = lines;
  if (header !== EXPECTED_HEADER) {
    throw new Error(`Unexpected manifest header: "${header}" (expected "${EXPECTED_HEADER}")`);
  }

  return rows.map((row) => {
    const cols = row.split(",");
    if (cols.length !== 4) {
      throw new Error(`Unexpected manifest row (${cols.length} columns): "${row}"`);
    }
    const [name, version, date, url] = cols;
    return { name, version, date, url };
  });
}

/**
 * Extract the "RCRnn[A|B]" designation from a manifest zone label, or null for
 * rows that are not individual RCR zones (the aggregate file, 東、南沙群島).
 */
export function designationOf(entry: ManifestEntry): string | null {
  const m = entry.name.match(/^RCR\d+[AB]?/);
  return m ? m[0] : null;
}
