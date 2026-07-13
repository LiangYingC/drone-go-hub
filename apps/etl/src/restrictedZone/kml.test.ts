import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractClosedRing } from "./kml";

// Real CAA download (RCR2, since abolished — format-identical to current zones):
// one closed boundary LineString plus decorative Point markers.
const RCR2_KML = readFileSync(new URL("fixtures/rcr2.kml", import.meta.url), "utf-8");

function wrapKml(placemarks: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>${placemarks}</Document></kml>`;
}

const OPEN_LINE = `<Placemark><LineString><coordinates>
121.0,25.0,0 121.1,25.0,0 121.1,25.1,0
</coordinates></LineString></Placemark>`;

describe("extractClosedRing", () => {
  it("extracts the single closed boundary ring from a real CAA KML", () => {
    const ring = extractClosedRing(RCR2_KML, "RCR2");
    expect(ring.length).toBeGreaterThanOrEqual(4);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
    for (const position of ring) {
      expect(position).toHaveLength(2); // altitude stripped
    }
  });

  it("rounds coordinates to 6 decimal places", () => {
    const ring = extractClosedRing(RCR2_KML, "RCR2");
    for (const [lng, lat] of ring) {
      expect(lng).toBe(Math.round(lng * 1e6) / 1e6);
      expect(lat).toBe(Math.round(lat * 1e6) / 1e6);
    }
  });

  it("rejects a KML whose boundary is not closed", () => {
    expect(() => extractClosedRing(wrapKml(OPEN_LINE), "X")).toThrow(/not a closed ring/);
  });

  it("rejects a KML with more than one LineString", () => {
    expect(() => extractClosedRing(wrapKml(OPEN_LINE + OPEN_LINE), "X")).toThrow(
      /expected exactly 1 boundary LineString/,
    );
  });

  it("rejects a KML with no LineString at all", () => {
    const pointOnly = `<Placemark><Point><coordinates>121,25,0</coordinates></Point></Placemark>`;
    expect(() => extractClosedRing(wrapKml(pointOnly), "X")).toThrow(/found 0/);
  });
});
