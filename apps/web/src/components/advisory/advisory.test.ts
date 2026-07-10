import { describe, expect, it } from "vitest";
import { CATEGORY_LABEL } from "./categoryLabel";
import { CATEGORY_STYLE, zoneFillColor, zoneLineColor, zoneLineWidth } from "./categoryStyle";
import { DEMO_ADVISORY_ZONES, getDemoZoneById } from "./demoZones";
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

describe("advisory category presentation", () => {
  it("has a colour for every category", () => {
    for (const category of ALL_CATEGORIES) {
      expect(CATEGORY_STYLE[category]).toBeDefined();
    }
  });

  it("has a label for every category", () => {
    for (const category of ALL_CATEGORIES) {
      expect(CATEGORY_LABEL[category]).toBeTruthy();
    }
  });
});

describe("zone selection styling", () => {
  it("returns the plain category style when not selected", () => {
    for (const category of ALL_CATEGORIES) {
      expect(zoneFillColor(category, false)).toEqual(CATEGORY_STYLE[category].fill);
      expect(zoneLineColor(category, false)).toEqual(CATEGORY_STYLE[category].line);
    }
  });

  it("emphasises the selected zone while keeping the category hue", () => {
    for (const category of ALL_CATEGORIES) {
      const base = CATEGORY_STYLE[category];
      const fill = zoneFillColor(category, true);
      const line = zoneLineColor(category, true);
      // Selection is emphasis, not a verdict — hue must not change, only alpha.
      expect(fill.slice(0, 3)).toEqual(base.fill.slice(0, 3));
      expect(line.slice(0, 3)).toEqual(base.line.slice(0, 3));
      expect(fill[3]).toBeGreaterThan(base.fill[3]);
      expect(line[3]).toBeGreaterThanOrEqual(base.line[3]);
    }
  });

  it("draws a thicker outline for the selected zone", () => {
    expect(zoneLineWidth(true)).toBeGreaterThan(zoneLineWidth(false));
  });
});

describe("getDemoZoneById", () => {
  it("returns the matching zone for a known id", () => {
    const zone = getDemoZoneById("demo-nofly-1");
    expect(zone?.properties.category).toBe("noFlyZone");
  });

  it("returns undefined for an unknown id", () => {
    expect(getDemoZoneById("does-not-exist")).toBeUndefined();
  });
});
