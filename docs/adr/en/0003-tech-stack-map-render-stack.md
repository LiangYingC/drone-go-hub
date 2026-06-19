# Map rendering stack: MapLibre GL + deck.gl + react-map-gl

_Last updated: 2026-06-19 · Translated from the canonical Chinese ([../0003-tech-stack-map-render-stack.md](../0003-tech-stack-map-render-stack.md)); the Chinese version is authoritative._

## Context

dronegohub's core is an interactive map carrying large amounts of geospatial vector data (no-fly polygons, saved spots), with 3D terrain planned later. Competitors mostly use Leaflet (no WebGL), so "map performance and quality" is one of dronegohub's overtaking points. The developer already has production deck.gl/luma.gl experience (GPU rendering of tens-of-thousands of tracks, debugging a luma.gl race condition) that transfers directly.

## Decision

- **Basemap rendering**: MapLibre GL (BSD-3).
- **Business data layers** (no-fly zones, saved spots): deck.gl (MIT), **pinned to v9+**.
- **React wrapper and viewState sharing**: react-map-gl (MIT).
- **deck.gl ↔ basemap integration**: use `MapboxOverlay` from `@deck.gl/mapbox`, mounted via react-map-gl's `useControl`. **V0 starts with `interleaved: false` (overlaid)**; switch to `true` (interleaved) when 3D terrain needs occlusion.

## Considered Options

- **MapLibre GL + deck.gl + react-map-gl (chosen)** — open source, no license fee, commercial use OK, GPU-accelerated, data decoupled from basemap; deck.gl handles large polygon/point counts without lag and supports 3D, and fits existing skills.
- **Leaflet (rejected)** — no WebGL: large polygon counts lag, vectors aren't crisp at high zoom, no native 3D. Competitors mostly use it — exactly our overtaking point.
- **Google Maps (rejected)** — usage-based billing, **tile caching forbidden**, limited customization; conflicts with "spend no real money" and the future "PWA offline."
- **Mapbox GL JS v2+ (rejected)** — not open source, requires a token, billed per load. MapLibre is the open-source fork of its v1 and is capable enough without these constraints.

## Integration approach and deck.gl v8 → v9 (for future understanding)

**Why `MapboxOverlay` rather than "DeckGL as container"**
- `MapboxOverlay`: MapLibre's `<Map>` is the root (owns the camera); deck mounts as a MapLibre `IControl` and follows in sync. **The same API supports both overlaid and interleaved**, differing by one `interleaved` prop.
- "DeckGL as container" (`<DeckGL><Map/></DeckGL>`): DeckGL is the root and drives the camera, but **supports overlaid only**; upgrading to interleaved requires restructuring.
- Conclusion: choose `MapboxOverlay` so "V0 overlaid → future interleaved" becomes a flag flip rather than a rewrite.

**Evolution of the Mapbox/MapLibre integration API, v8 → v9 (directly relevant)**
- **v8 (old)**: add deck layers one by one with `MapboxLayer` —
  ```js
  map.addLayer(new MapboxLayer({ id, type: ScatterplotLayer, data }))
  ```
  each deck layer is added individually as a custom basemap layer.
- **v9 (new)**: `MapboxLayer` was removed in favor of `MapboxOverlay` —
  ```js
  map.addControl(new MapboxOverlay({ interleaved: true, layers: [ new ScatterplotLayer({ ... }) ] }))
  ```
  multiple deck layers are consolidated into a single control.
- **Benefits of the v9 change**:
  - a **single integration point** supports both overlaid and interleaved (one `interleaved` flag); no need to maintain two styles.
  - in interleaved mode, deck layers render in groups by `beforeId` / `slot`, slotting into the basemap's draw order so cross-layer extensions (e.g. `MaskExtension`, `CollisionFilterExtension`) work correctly.
  - it is **framework-agnostic** and usable in any JS environment (also why deck.gl can still run under Vue; see ADR 0002).

**Larger v9 changes underneath (background, not required by this decision)**
- **luma.gl v9 rewrite** to a WebGPU-compatible interface while fully supporting WebGL2, paving the way for WebGPU (full WebGPU landed in v9.1).
- **WebGL1 dropped**; WebGL2 is the baseline.
- the GPU context changed from `gl: WebGLRenderingContext` to a `device: Device` abstraction; GPU parameters use WebGPU-style string constants (`'add'` instead of `GL.ADD`).
- **TypeScript is now the default**; the `/typed` subpackages were removed (import `{ Deck } from '@deck.gl/core'` directly).

## Consequences

- **overlaid (V0) → interleaved (3D milestone) is a one-prop change**, not a rewrite; 3D mountain occlusion needs interleaved only then.
- larger bundle: mitigate with code splitting and on-demand layer imports.
- binds to the vis.gl ecosystem (react-map-gl + `@deck.gl/mapbox`), consistent with ADR 0002's frontend choice; switching UI framework later would forfeit this cohesion.
