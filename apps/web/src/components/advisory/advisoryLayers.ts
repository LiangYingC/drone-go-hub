import { GeoJsonLayer } from "@deck.gl/layers";
import { zoneFillColor, zoneLineColor, zoneLineWidth } from "./categoryStyle";
import { DEMO_ADVISORY_ZONES } from "./demoZones";
import type { AdvisoryZoneProperties } from "./types";

export interface AdvisoryLayersOptions {
  /** Receives the clicked zone's id so the caller can drive selection (selectionSlice). */
  onZoneClick?: (id: string) => void;
  /** Zone to emphasise (stronger fill, opaque thicker outline); null shows all as default. */
  selectedZoneId?: string | null;
}

/**
 * deck.gl layers for the advisory regulatory overlay (ADR 0003 mount point in MapView).
 * V0: one GeoJsonLayer over disclosed demo data, coloured by category.
 */
export function buildAdvisoryLayers({
  onZoneClick,
  selectedZoneId = null,
}: AdvisoryLayersOptions = {}) {
  return [
    new GeoJsonLayer<AdvisoryZoneProperties>({
      id: "advisory-zones",
      data: DEMO_ADVISORY_ZONES,
      filled: true,
      stroked: true,
      getFillColor: (f) => zoneFillColor(f.properties.category, f.properties.id === selectedZoneId),
      getLineColor: (f) => zoneLineColor(f.properties.category, f.properties.id === selectedZoneId),
      getLineWidth: (f) => zoneLineWidth(f.properties.id === selectedZoneId),
      lineWidthUnits: "pixels",
      pickable: true,
      onClick: (info) => {
        const id = info.object?.properties?.id;
        if (!id) return false;
        onZoneClick?.(id);
        // Mark handled so Deck's root onClick (deselect-on-empty in MapView) skips it.
        return true;
      },
      // Accessors close over selectedZoneId; deck re-evaluates them only when told to.
      updateTriggers: {
        getFillColor: selectedZoneId,
        getLineColor: selectedZoneId,
        getLineWidth: selectedZoneId,
      },
    }),
  ];
}
