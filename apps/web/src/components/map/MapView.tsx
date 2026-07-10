import { MapboxOverlay } from "@deck.gl/mapbox";
import { useEffect } from "react";
import MapGL, { useControl } from "react-map-gl/maplibre";
import { buildAdvisoryLayers } from "@/components/advisory/advisoryLayers";
import { BASEMAP_STYLE_URL, DECK_INTERLEAVED } from "@/config/map";
import { useAppStore } from "@/store";
import { useSelectedZoneId, useViewState } from "@/store/selectors";

/**
 * deck.gl overlay mounted as a MapLibre IControl (ADR 0003: MapboxOverlay, overlaid).
 * V0 renders the advisory regulatory layers from disclosed demo data (ADR 0008);
 * this stays the single mount point for business layers (no-fly polygons, saved
 * spots). Flip DECK_INTERLEAVED to switch overlaid -> interleaved without restructuring.
 */
function DeckGLOverlay() {
  const selectZone = useAppStore((s) => s.selectZone);
  const selectedZoneId = useSelectedZoneId();
  const overlay = useControl(() => new MapboxOverlay({ interleaved: DECK_INTERLEAVED }));

  // Layers follow selection state, so push them via setProps in an effect
  // (render stays pure — the deck.gl docs' render-time setProps predates that rule).
  useEffect(() => {
    overlay.setProps({
      layers: buildAdvisoryLayers({ onZoneClick: selectZone, selectedZoneId }),
    });
  }, [overlay, selectZone, selectedZoneId]);

  return null;
}

/** Full-screen MapLibre basemap (OpenFreeMap positron), camera shared via the store. */
export function MapView() {
  const viewState = useViewState();
  const setViewState = useAppStore((s) => s.setViewState);

  return (
    <MapGL
      {...viewState}
      onMove={(event) => setViewState(event.viewState)}
      mapStyle={BASEMAP_STYLE_URL}
      style={{ width: "100%", height: "100%" }}
    >
      <DeckGLOverlay />
    </MapGL>
  );
}

export default MapView;
