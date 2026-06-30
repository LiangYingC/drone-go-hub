import type { AdvisoryCategory } from "./types";

/** deck.gl colour as [r, g, b, a], each channel 0–255. */
export type RGBA = [number, number, number, number];

/**
 * Per-category fill/line colours for the advisory overlay.
 *
 * Every category is a *restriction* layer, so the palette stays warning-leaning.
 * Colours mark a zone's **type**, never a go/no-go verdict for the user's flight
 * (ADR 0008: the model and UI carry no isLegal/canFly judgement). Fills are kept
 * translucent so the basemap underneath stays readable.
 */
export const CATEGORY_STYLE: Record<AdvisoryCategory, { fill: RGBA; line: RGBA }> = {
  noFlyZone: { fill: [220, 38, 38, 80], line: [220, 38, 38, 220] }, // red
  restrictedZone: { fill: [234, 88, 12, 70], line: [234, 88, 12, 220] }, // orange
  airportBuffer: { fill: [217, 119, 6, 60], line: [217, 119, 6, 210] }, // amber
  localGovZone: { fill: [124, 58, 237, 70], line: [124, 58, 237, 220] }, // violet
  nationalPark: { fill: [22, 130, 90, 60], line: [22, 130, 90, 210] }, // teal-green
};
