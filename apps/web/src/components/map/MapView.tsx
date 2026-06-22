import { MapboxOverlay } from "@deck.gl/mapbox";
import MapGL, { useControl } from "react-map-gl/maplibre";
import { BASEMAP_STYLE_URL, DECK_INTERLEAVED } from "@/config/map";
import { useAppStore } from "@/store";
import { useViewState } from "@/store/selectors";

/**
 * deck.gl overlay mounted as a MapLibre IControl (ADR 0003: MapboxOverlay, overlaid).
 * V0 carries no layers yet — this proves the overlaid integration and stays the single
 * mount point for future business layers (no-fly polygons, saved spots). Flip
 * DECK_INTERLEAVED to switch overlaid -> interleaved without restructuring.
 */
function DeckGLOverlay() {
  useControl(() => new MapboxOverlay({ interleaved: DECK_INTERLEAVED, layers: [] }));
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
