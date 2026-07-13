import type { Position } from "geojson";
import { describe, expect, it } from "vitest";
import { EAIP_RESTRICTED_AREAS } from "./eaipCurrentList";
import type { ManifestEntry } from "./manifest";
import { zoneFromEaipCircle, zoneFromKml } from "./transform";

const RCR16 = EAIP_RESTRICTED_AREAS.find((a) => a.designation === "RCR16");
const DONGSHA = EAIP_RESTRICTED_AREAS.find((a) => a.designation === "DONGSHA");
if (!RCR16 || !DONGSHA) throw new Error("fixture zones missing from eAIP list");

const ENTRY: ManifestEntry = {
  name: "RCR16（陽明山）",
  version: "107年8月",
  date: "2018-08-31",
  url: "https://example.test/rcr16",
};

// Clockwise square — transform must flip it to counter-clockwise.
const CW_RING: Position[] = [
  [121, 25],
  [121, 25.1],
  [121.1, 25.1],
  [121.1, 25],
  [121, 25],
];

function windingArea(ring: Position[]): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return area;
}

describe("zoneFromKml", () => {
  it("maps zone data onto the advisory property shape", () => {
    const feature = zoneFromKml(RCR16, ENTRY, CW_RING);
    expect(feature.properties).toMatchObject({
      id: "restricted-rcr16",
      name: "RCR16（陽明山）",
      category: "restrictedZone",
      sourceUrl: "https://data.gov.tw/dataset/49021",
      lastUpdated: "2018-08-31",
    });
    expect(feature.properties.advisoryNote).toContain("4000 FT AMSL / SFC");
    expect(feature.properties.source).toContain("107年8月");
  });

  it("normalises winding to counter-clockwise", () => {
    const feature = zoneFromKml(RCR16, ENTRY, CW_RING);
    expect(windingArea(feature.geometry.coordinates[0])).toBeGreaterThan(0);
  });
});

describe("zoneFromEaipCircle", () => {
  it("generates the polygon and credits the eAIP as source", () => {
    const feature = zoneFromEaipCircle(DONGSHA);
    expect(feature.properties.id).toBe("restricted-dongsha");
    expect(feature.properties.name).toBe("東沙群島（DONGSHA）");
    expect(feature.properties.source).toContain("eAIP ENR 5.1");
    expect(feature.properties.lastUpdated).toBe("2026-05-14");
    expect(feature.geometry.coordinates[0]).toHaveLength(65);
  });

  it("refuses a zone marked eaipCircle without a circle definition", () => {
    expect(() => zoneFromEaipCircle({ ...DONGSHA, circle: undefined })).toThrow(
      /no circle is defined/,
    );
  });
});
