/**
 * Map rendering configuration (ADR 0003 / 0004).
 */

/** ADR 0004: OpenFreeMap public instance, positron (light grey) style, keyless, OSM data. */
export const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/**
 * ADR 0003: how deck.gl integrates with the basemap.
 * V0 stays overlaid (false); flip to true (interleaved) when future 3D terrain
 * needs occlusion. Using MapboxOverlay keeps this a one-flag change, not a rewrite.
 */
export const DECK_INTERLEAVED = false;

/** Rough bounds of main-island Taiwan [west, south, east, north], for future fitBounds. */
export const TAIWAN_BOUNDS = [119.3, 21.9, 122.0, 25.4] as const;
