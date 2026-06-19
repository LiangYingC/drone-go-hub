# 地圖渲染棧：MapLibre GL + deck.gl + react-map-gl

_最後更新：2026-06-19_

## Context

dronegohub 的核心是一張承載大量地理向量資料（禁限航多邊形、收藏點）的互動地圖，未來還要 3D 地形。競品多用 Leaflet（無 WebGL），「地圖效能與質感」正是 dronegohub 的超車點之一。開發者已有 deck.gl/luma.gl 的 production 經驗（萬級軌跡 GPU 渲染、debug 過 luma.gl race condition），可直接遷移。

## Decision

- **底圖渲染**：MapLibre GL（BSD-3）。
- **業務資料圖層**（禁航區、收藏點）：deck.gl（MIT），**鎖定 v9+**。
- **React 封裝與 viewState 共享**：react-map-gl（MIT）。
- **deck.gl 與底圖整合**：用 `@deck.gl/mapbox` 的 `MapboxOverlay`，透過 react-map-gl 的 `useControl` 掛載。**V0 先 `interleaved: false`（overlaid）**，未來 3D 地形需要遮蔽時改 `true`（interleaved）。

## Considered Options

- **MapLibre GL + deck.gl + react-map-gl（採用）** — 開源、無授權費、可商用、GPU 硬體加速、資料與底圖解耦；deck.gl 處理大量多邊形/點不卡、可 3D，且與既有技能契合。
- **Leaflet（否決）** — 無 WebGL：大量多邊形會卡、向量在高縮放不夠銳利、無原生 3D。競品多用此，正是我們的超車點。
- **Google Maps（否決）** — 按流量計費、**禁止快取圖磚**、客製受限，與「不花真錢」及未來「PWA 離線」直接衝突。
- **Mapbox GL JS v2+（否決）** — 非開源、需 token、按載入計費。MapLibre 是其 v1 的開源 fork，能力足夠且無這些限制。

## 整合方式與 deck.gl v8 → v9（給未來理解用）

**為何用 `MapboxOverlay`，而非「DeckGL 為容器」**
- `MapboxOverlay`：MapLibre 的 `<Map>` 為 root（持有相機），deck 以 maplibre `IControl` 掛上、同步跟隨。**同一 API 同時支援 overlaid 與 interleaved**，差一個 `interleaved` prop。
- 「DeckGL 為容器」（`<DeckGL><Map/></DeckGL>`）：DeckGL 為 root、deck 主導相機，但**只支援 overlaid**；要升 interleaved 得改寫結構。
- 結論：選 `MapboxOverlay`，讓「V0 overlaid → 未來 interleaved」從「重寫一塊」變成「翻一個 flag」。

**deck.gl v8 → v9 整合 API 的演進（與我們直接相關）**
- **v8（舊）**：用 `MapboxLayer` 逐層掛入底圖——
  ```js
  map.addLayer(new MapboxLayer({ id, type: ScatterplotLayer, data }))
  ```
  每個 deck 圖層都個別加成一個底圖自訂圖層。
- **v9（新）**：`MapboxLayer` 已移除，改用 `MapboxOverlay`——
  ```js
  map.addControl(new MapboxOverlay({ interleaved: true, layers: [ new ScatterplotLayer({ ... }) ] }))
  ```
  把多個 deck 圖層**合併成單一 control**。
- **v9 改制的好處**：
  - **單一整合點**同時支援 overlaid 與 interleaved（一個 `interleaved` flag），不必維護兩套寫法。
  - interleaved 時，deck 圖層依 `beforeId` / `slot` **分組插進底圖的繪製順序**，使跨圖層 extension（如 `MaskExtension`、`CollisionFilterExtension`）能正確運作。
  - **framework-agnostic**、可用於任何 JS 環境（這也是 Vue 仍能跑 deck.gl 的原因，見 ADR 0002）。

**v9 更大的底層改動（背景脈絡，非本決策必需）**
- **luma.gl v9 重寫**成 WebGPU-compatible 介面、同時完整支援 WebGL2，為未來 WebGPU 鋪路（完整 WebGPU 於 v9.1 到位）。
- **捨棄 WebGL1**，WebGL2 成為 baseline。
- GPU context 從 `gl: WebGLRenderingContext` 抽象為 `device: Device`；GPU 參數改用 WebGPU 風格字串常數（`'add'` 取代 `GL.ADD`）。
- **TypeScript 成為預設**、移除 `/typed` 子套件（直接 `import { Deck } from '@deck.gl/core'`）。

## Consequences

- **overlaid（V0）→ interleaved（3D 里程碑）是一個 prop 的事**，非重寫；3D 山區遮蔽屆時才需要 interleaved。
- bundle 較大：以 code splitting 與圖層按需 import 緩解。
- 綁定 vis.gl 生態（react-map-gl + `@deck.gl/mapbox`），與 ADR 0002 的前端選型一致；日後若改 UI 框架會喪失此凝聚力。
