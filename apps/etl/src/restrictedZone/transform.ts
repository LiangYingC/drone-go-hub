/**
 * Build advisory GeoJSON features from reconciled zone data.
 *
 * Property shape must stay assignable to the web app's AdvisoryZoneProperties;
 * the type-only import keeps that single-sourced (it erases at compile time,
 * so the ETL gains no runtime or build coupling to the web package).
 */

import type { Feature, Polygon, Position } from "geojson";
import type { AdvisoryZoneProperties } from "../../../web/src/components/advisory/types";
import { circleRing } from "./circle";
import type { EaipRestrictedArea } from "./eaipCurrentList";
import { EAIP_AMENDMENT } from "./eaipCurrentList";
import type { ManifestEntry } from "./manifest";

export type AdvisoryFeature = Feature<Polygon, AdvisoryZoneProperties>;

const DATASET_URL = "https://data.gov.tw/dataset/49021";

function advisoryNote(area: EaipRestrictedArea): string {
  return (
    `民航局公告之限航區（有條件飛航），垂直範圍：${area.verticalLimits}。` +
    `區內飛航須符合公告條件，飛行前請以官方最新公告為準` +
    `（現行清單依 eAIP ENR 5.1，${EAIP_AMENDMENT.id}）。`
  );
}

/** A zone whose polygon comes from its open-data KML boundary ring. */
export function zoneFromKml(
  area: EaipRestrictedArea,
  entry: ManifestEntry,
  ring: Position[],
): AdvisoryFeature {
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ccw(ring)] },
    properties: {
      id: `restricted-${area.designation.toLowerCase()}`,
      name: entry.name,
      category: "restrictedZone",
      advisoryNote: advisoryNote(area),
      source: `民航局開放資料「臺北飛航情報區限航區範圍圖資」（${entry.version}版）`,
      sourceUrl: DATASET_URL,
      lastUpdated: entry.date,
    },
  };
}

/** A zone whose polygon is generated from the eAIP circle definition. */
export function zoneFromEaipCircle(area: EaipRestrictedArea): AdvisoryFeature {
  const circle = area.circle;
  if (!circle) {
    throw new Error(`${area.designation}: geometrySource is eaipCircle but no circle is defined`);
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [circleRing(circle.centre, circle.radiusM)] },
    properties: {
      id: `restricted-${area.designation.toLowerCase()}`,
      name: `${area.zhName}（${area.designation}）`,
      category: "restrictedZone",
      advisoryNote: advisoryNote(area),
      source: `依 eAIP ENR 5.1（${EAIP_AMENDMENT.id}）公告之圓形範圍產製`,
      sourceUrl: EAIP_AMENDMENT.sourceUrl,
      lastUpdated: EAIP_AMENDMENT.effectiveDate,
    },
  };
}

/**
 * Ensure counter-clockwise winding (RFC 7946 exterior rings). The KML rings
 * are drawn by hand upstream, so either direction shows up in practice.
 */
function ccw(ring: Position[]): Position[] {
  // Shoelace sum over lng/lat; negative means clockwise.
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return area < 0 ? [...ring].reverse() : ring;
}
