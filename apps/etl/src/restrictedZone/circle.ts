/**
 * Generate a circle polygon from a centre and radius, for zones the eAIP
 * defines as plain circles (東沙／南沙) where the open-data KML is unusable.
 */

import type { Position } from "geojson";

const EARTH_RADIUS_M = 6_371_000;

/**
 * Approximate a geodesic circle as a closed ring of `steps` points, counter-
 * clockwise (RFC 7946 exterior-ring winding), first point repeated last.
 * Spherical-earth error at these radii (~18.5 km) is far below the zones' own
 * published precision (whole arc-seconds).
 */
export function circleRing(centre: [number, number], radiusM: number, steps = 64): Position[] {
  const [lng, lat] = centre;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const angular = radiusM / EARTH_RADIUS_M;

  const ring: Position[] = [];
  for (let i = 0; i <= steps; i++) {
    // Counter-clockwise: bearing decreases as i increases.
    const bearing = ((360 - (i % steps) * (360 / steps)) * Math.PI) / 180;
    const sinLat =
      Math.sin(latRad) * Math.cos(angular) +
      Math.cos(latRad) * Math.sin(angular) * Math.cos(bearing);
    const pLat = Math.asin(sinLat);
    const pLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(latRad),
        Math.cos(angular) - Math.sin(latRad) * sinLat,
      );
    ring.push([round6((pLng * 180) / Math.PI), round6((pLat * 180) / Math.PI)]);
  }
  return ring;
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
