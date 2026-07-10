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

/**
 * Selected-zone emphasis: same category hue, stronger fill alpha, opaque thicker
 * outline. The map never renders a go/no-go verdict, so a selected zone must not
 * change colour (which could read as a different judgement) — it only gains contrast.
 */
const SELECTED_FILL_ALPHA = 140; // above every category default (60–80)
const LINE_WIDTH_PX = 1.5;
const SELECTED_LINE_WIDTH_PX = 3;

export function zoneFillColor(category: AdvisoryCategory, isSelected: boolean): RGBA {
  const [r, g, b, a] = CATEGORY_STYLE[category].fill;
  return [r, g, b, isSelected ? SELECTED_FILL_ALPHA : a];
}

export function zoneLineColor(category: AdvisoryCategory, isSelected: boolean): RGBA {
  const [r, g, b, a] = CATEGORY_STYLE[category].line;
  return [r, g, b, isSelected ? 255 : a];
}

export function zoneLineWidth(isSelected: boolean): number {
  return isSelected ? SELECTED_LINE_WIDTH_PX : LINE_WIDTH_PX;
}
