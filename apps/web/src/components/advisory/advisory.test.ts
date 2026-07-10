import { describe, expect, it } from "vitest";
import { CATEGORY_STYLE } from "./categoryStyle";
import { DEMO_ADVISORY_ZONES } from "./demoZones";
import type { AdvisoryCategory } from "./types";

const ALL_CATEGORIES: AdvisoryCategory[] = [
  "noFlyZone",
  "restrictedZone",
  "airportBuffer",
  "localGovZone",
  "nationalPark",
];

describe("advisory demo zones", () => {
  it("covers every AdvisoryCategory", () => {
    const present = new Set(DEMO_ADVISORY_ZONES.features.map((f) => f.properties.category));
    for (const category of ALL_CATEGORIES) {
      expect(present.has(category)).toBe(true);
    }
  });

  it("marks every zone as disclosed demo data with reference-language fields", () => {
    for (const feature of DEMO_ADVISORY_ZONES.features) {
      const p = feature.properties;
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.advisoryNote).toBeTruthy();
      // ADR 0008: V0 data is disclosed fake; never presented as authoritative.
      expect(p.source).toContain("示意");
      expect(p.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }
  });
});

describe("advisory category style", () => {
  it("has a colour for every category", () => {
    for (const category of ALL_CATEGORIES) {
      expect(CATEGORY_STYLE[category]).toBeDefined();
    }
  });
});
