/**
 * Restricted-zone (限航區) ETL: CAA open dataset 49021 → static advisory GeoJSON.
 *
 * Flow: resolve the dataset's manifest CSV via the data.gov.tw API (so a CAA
 * file-id reshuffle doesn't break us) → reconcile the manifest against the
 * pinned eAIP current list → fetch each current zone's KML and convert its
 * boundary ring to a polygon → generate the 東沙／南沙 circles from their eAIP
 * definitions → validate → write one feature per line for reviewable diffs.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { fetchText, sleep } from "../shared/download";
import { crossCheck } from "./crossCheck";
import { extractClosedRing } from "./kml";
import { parseManifest } from "./manifest";
import type { AdvisoryFeature } from "./transform";
import { zoneFromEaipCircle, zoneFromKml } from "./transform";

const DATASET_API_URL = "https://data.gov.tw/api/v2/rest/dataset/49021";

// Sanity envelope: Taipei FIR incl. 東沙／南沙, far wider than any real zone drift.
const BOUNDS = { lngMin: 105, lngMax: 125, latMin: 9, latMax: 28 };

const OUTPUT_PATH = fileURLToPath(
  new URL("../../../web/public/data/advisory/restrictedZone.geojson", import.meta.url),
);

async function resolveManifestUrl(): Promise<string> {
  const api = JSON.parse(await fetchText(DATASET_API_URL)) as {
    result?: { distribution?: { resourceDownloadUrl?: string }[] };
  };
  const distributions = api.result?.distribution ?? [];
  const url = distributions[0]?.resourceDownloadUrl;
  if (distributions.length !== 1 || !url) {
    throw new Error(`Dataset 49021: expected exactly 1 distribution with a download URL`);
  }
  return url;
}

function validate(features: AdvisoryFeature[]): void {
  for (const feature of features) {
    const { id } = feature.properties;
    for (const ring of feature.geometry.coordinates) {
      const [first] = ring;
      const last = ring[ring.length - 1];
      if (ring.length < 4 || first[0] !== last[0] || first[1] !== last[1]) {
        throw new Error(`${id}: ring is not closed`);
      }
      for (const [lng, lat] of ring) {
        if (
          lng < BOUNDS.lngMin ||
          lng > BOUNDS.lngMax ||
          lat < BOUNDS.latMin ||
          lat > BOUNDS.latMax
        ) {
          throw new Error(`${id}: position [${lng}, ${lat}] outside the Taipei FIR envelope`);
        }
      }
    }
  }
}

/** One feature per line, so a single zone's change is a single-line git diff. */
function serialize(features: AdvisoryFeature[]): string {
  const lines = features.map((f) => JSON.stringify(f));
  return `{"type":"FeatureCollection","features":[\n${lines.join(",\n")}\n]}\n`;
}

async function main(): Promise<void> {
  const manifestUrl = await resolveManifestUrl();
  const manifest = parseManifest(await fetchText(manifestUrl));
  const { matched, circles, stale, ignored } = crossCheck(manifest);

  const features: AdvisoryFeature[] = [];
  for (const { area, entry } of matched) {
    const ring = extractClosedRing(await fetchText(entry.url), entry.name);
    features.push(zoneFromKml(area, entry, ring));
    await sleep(200); // be polite to the CAA file server
  }
  features.push(...circles.map(zoneFromEaipCircle));

  // Keep output ordering independent of manifest/eAIP list order.
  features.sort((a, b) => a.properties.id.localeCompare(b.properties.id));
  validate(features);

  await mkdir(new URL(".", `file://${OUTPUT_PATH}`), { recursive: true });
  await writeFile(OUTPUT_PATH, serialize(features), "utf-8");

  console.log(`限航區 ETL 完成 → ${OUTPUT_PATH}`);
  console.log(`  輸出 ${features.length} 區（KML ${matched.length}、eAIP 圓形 ${circles.length}）`);
  console.log(`  已剔除（不在 eAIP 現行清單）：${stale.map((e) => e.name).join("、") || "無"}`);
  console.log(`  略過（非單一區檔案）：${ignored.map((e) => e.name).join("、") || "無"}`);
}

await main();
