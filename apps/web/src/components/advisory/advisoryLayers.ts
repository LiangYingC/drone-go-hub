import { GeoJsonLayer } from "@deck.gl/layers";
import { CATEGORY_STYLE } from "./categoryStyle";
import { DEMO_ADVISORY_ZONES } from "./demoZones";
import type { AdvisoryZoneProperties } from "./types";

/**
 * deck.gl layers for the advisory regulatory overlay (ADR 0003 mount point in MapView).
 * V0: one GeoJsonLayer over disclosed demo data, coloured by category. `pickable`
 * is on so a later PR can wire zone selection (selectionSlice) without restructuring.
 */
export function buildAdvisoryLayers() {
  return [
    new GeoJsonLayer<AdvisoryZoneProperties>({
      id: "advisory-zones",
      data: DEMO_ADVISORY_ZONES,
      filled: true,
      stroked: true,
      getFillColor: (f) => CATEGORY_STYLE[f.properties.category].fill,
      getLineColor: (f) => CATEGORY_STYLE[f.properties.category].line,
      lineWidthMinPixels: 1.5,
      pickable: true,
    }),
  ];
}
