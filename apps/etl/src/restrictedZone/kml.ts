/**
 * Extract a zone polygon from a CAA per-zone KML file.
 *
 * The KMLs (Google My Maps exports) draw each restricted zone as one closed
 * LineString for the boundary plus decorative Point markers — there are no
 * Polygon elements. Every current zone's boundary is a single LineString whose
 * first and last coordinates coincide, so conversion is: take the one
 * LineString, verify closure, use it as a polygon's exterior ring. Anything
 * else (several LineStrings, an open ring) means the upstream drawing style
 * changed and needs human eyes, so it is a hard error rather than a guess.
 */

import { kml as kmlToGeoJson } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import type { Position } from "geojson";

export function extractClosedRing(kmlText: string, zoneLabel: string): Position[] {
  const doc = new DOMParser().parseFromString(kmlText, "text/xml");
  // @tmcw/togeojson accepts any DOM-compatible Document; @xmldom/xmldom's own
  // Document type is structurally close enough but not nominally identical
  // (and this Node package deliberately compiles without the DOM lib).
  const collection = kmlToGeoJson(doc as unknown as Parameters<typeof kmlToGeoJson>[0]);

  const lineStrings = collection.features.filter((f) => f.geometry?.type === "LineString");
  if (lineStrings.length !== 1) {
    throw new Error(
      `${zoneLabel}: expected exactly 1 boundary LineString in KML, found ${lineStrings.length}`,
    );
  }

  const geometry = lineStrings[0].geometry;
  if (geometry?.type !== "LineString") throw new Error(`${zoneLabel}: unreachable`);

  // Drop the altitude component (always 0 in these files) and round to 6
  // decimal places (~0.1 m) so the committed output stays byte-stable across
  // runs and small enough to diff.
  const ring = geometry.coordinates.map(([lng, lat]): Position => [round6(lng), round6(lat)]);

  const [first] = ring;
  const last = ring[ring.length - 1];
  if (ring.length < 4 || first[0] !== last[0] || first[1] !== last[1]) {
    throw new Error(`${zoneLabel}: boundary LineString is not a closed ring`);
  }

  return ring;
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
