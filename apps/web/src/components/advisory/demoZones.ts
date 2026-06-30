import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { AdvisoryCategory, AdvisoryZoneProperties } from "./types";

/**
 * V0 demo (示意) advisory zones — NOT real regulatory data.
 *
 * ADR 0008 decides V0 renders disclosed fake data; geometry here is illustrative
 * only and `source` is marked 示意資料. The shape matches AdvisoryZoneProperties,
 * so swapping in real ETL output (ADR 0010: open data 49021 / 45701 / 174421 +
 * digitised localGov announcements) later is a data swap, not a code change.
 */
export type AdvisoryFeature = Feature<Polygon, AdvisoryZoneProperties>;
export type AdvisoryFeatureCollection = FeatureCollection<Polygon, AdvisoryZoneProperties>;

const DEMO_LAST_UPDATED = "2026-06-30";

/** A simple axis-aligned square polygon centred on (lng, lat), half-size `d` degrees. */
function square(lng: number, lat: number, d: number): Polygon {
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng - d, lat - d],
        [lng + d, lat - d],
        [lng + d, lat + d],
        [lng - d, lat + d],
        [lng - d, lat - d],
      ],
    ],
  };
}

function zone(
  id: string,
  name: string,
  category: AdvisoryCategory,
  advisoryNote: string,
  geometry: Polygon,
): AdvisoryFeature {
  return {
    type: "Feature",
    geometry,
    properties: {
      id,
      name,
      category,
      advisoryNote,
      source: "示意資料（demo）",
      lastUpdated: DEMO_LAST_UPDATED,
    },
  };
}

/** Five illustrative zones, one per category, spread across Taiwan to stay visible at the initial zoom. */
export const DEMO_ADVISORY_ZONES: AdvisoryFeatureCollection = {
  type: "FeatureCollection",
  features: [
    zone(
      "demo-nofly-1",
      "示意禁航區（臺北）",
      "noFlyZone",
      "示意資料：此區可能屬禁航範圍，飛行前請以官方公告為準。",
      square(121.515, 25.04, 0.03),
    ),
    zone(
      "demo-restricted-1",
      "示意限航區（中部）",
      "restrictedZone",
      "示意資料：此區可能為有條件限航，飛行前請查詢官方公告。",
      square(120.68, 23.78, 0.06),
    ),
    zone(
      "demo-airport-1",
      "示意機場周邊（高雄）",
      "airportBuffer",
      "示意資料：機場周邊一定距離可能限制飛航，請參考官方範圍。",
      square(120.35, 22.57, 0.05),
    ),
    zone(
      "demo-localgov-1",
      "示意地方公告區（臺中）",
      "localGovZone",
      "示意資料：地方政府可能就此區公告管理事項，請查當地公告。",
      square(120.67, 24.16, 0.04),
    ),
    zone(
      "demo-park-1",
      "示意國家公園（太魯閣）",
      "nationalPark",
      "示意資料：園區內操作無人機原則須事先申請許可，請洽管理處。",
      square(121.42, 24.18, 0.07),
    ),
  ],
};

/** Look up a demo zone by id (V0 only; real data will later come from the layer's data source). */
export function getDemoZoneById(id: string): AdvisoryFeature | undefined {
  return DEMO_ADVISORY_ZONES.features.find((f) => f.properties.id === id);
}
