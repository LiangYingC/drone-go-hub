# 底圖圖磚：OpenFreeMap（不蹭 Carto CDN、不用商用圖磚）

_最後更新：2026-06-19_

## Context

地圖需要底圖向量圖磚（道路、海岸線、地名）。底圖的「樣式」與「圖磚資料」授權常分離，蹭他人 CDN 屬授權灰色地帶。本專案要公開作為作品集、原則上「不花真錢」、且未來要離線（PWA）。

## Decision

- 底圖用 **OpenFreeMap 公用實例**（OSM 資料、無金鑰、免費、對 views/requests 無上限）。
- 樣式用 **positron（淺灰）**。
- Attribution 由 MapLibre 自動帶上（OpenFreeMap © OpenMapTiles，資料來自 OpenStreetMap）。

## Considered Options

- **OpenFreeMap（採用）** — 免費、無金鑰、可公開、OSM 資料、可自托管，樣式可選。
- **Carto CDN（否決）** — 樣式為 BSD-3 可免費，但**圖磚資料本身需企業協定**；直接蹭其 CDN 是授權灰色地帶，公開作品集不可取。
- **Mapbox GL（否決）** — 非開源、需 token、按載入計費。
- **Google Maps（否決）** — 按流量計費、**禁止快取圖磚**，與「不花真錢」及未來「PWA 離線」直接衝突。

## Consequences

- **樣式 positron（淺灰）**：讓疊加的紅/黃/綠禁限航區與標注最跳、判讀最清楚（資料為主角時的製圖慣例）；易改（換一個 style URL），故不另開 ADR。
- ⚠️ **公用實例無 SLA**：V0 接受（prototyping 足夠）。風險＝demo/現場當下服務中斷。
- **緩解路徑（里程碑 4）**：把台灣範圍的向量圖磚抽成單一 `.pmtiles` 檔、自托管於靜態儲存（如 Cloudflare R2），MapLibre 以 `pmtiles://` 直接讀、無需圖磚伺服器；並可被 PWA 的 Service Worker 快取，一併解決離線。台灣 extract 體積小，無 OpenFreeMap 那種行星級大檔（90GB）的 range-request 延遲問題。
- 必須常駐標示 attribution 與「圖資最後更新時間」（與規劃輔助定位一致，見後續 ADR）。
