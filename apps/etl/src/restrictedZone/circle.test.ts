import { describe, expect, it } from "vitest";
import { circleRing } from "./circle";

const DONGSHA_CENTRE: [number, number] = [116.716667, 20.7];
const RADIUS_M = 18520; // 10 NM

/** Haversine distance in metres, for verifying generated points. */
function distanceM(a: [number, number], b: number[]): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

describe("circleRing", () => {
  it("produces a closed ring of steps + 1 positions", () => {
    const ring = circleRing(DONGSHA_CENTRE, RADIUS_M, 64);
    expect(ring).toHaveLength(65);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it("keeps every point at the requested radius from the centre", () => {
    const ring = circleRing(DONGSHA_CENTRE, RADIUS_M, 64);
    for (const position of ring) {
      // 6-decimal rounding moves points by well under 1 m.
      expect(Math.abs(distanceM(DONGSHA_CENTRE, position) - RADIUS_M)).toBeLessThan(1);
    }
  });

  it("winds counter-clockwise as RFC 7946 requires for exterior rings", () => {
    const ring = circleRing(DONGSHA_CENTRE, RADIUS_M, 64);
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    }
    expect(area).toBeGreaterThan(0);
  });
});
