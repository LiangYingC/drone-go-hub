# Architecture Decision Records

_最後更新：2026-06-27_

本資料夾記錄 dronegohub 的架構與技術決策。每份 ADR 記下「做了什麼決定、為什麼、考慮過哪些替代案」。領域詞彙見根目錄 [`CONTEXT.md`](../../CONTEXT.md)。

## 現有 ADR

### 技術選型（`tech-stack-`）
- [0001 — Monorepo（pnpm workspace）](0001-tech-stack-monorepo-pnpm-workspace.md) — 單一 workspace，V0 先只放 `apps/web`。
- [0002 — 前端選型：React + Vite SPA](0002-tech-stack-vite-react-spa-over-nextjs.md) — 用 React+Vite，不用 Next.js、不用 Vue/Nuxt。
- [0003 — 地圖渲染棧](0003-tech-stack-map-render-stack.md) — MapLibre + deck.gl + react-map-gl；整合用 `MapboxOverlay`（overlaid，未來一個 flag 切 interleaved）。
- [0004 — 底圖：OpenFreeMap](0004-tech-stack-openfreemap-basemap.md) — `positron` 樣式，不蹭 Carto/商用圖磚；no-SLA 以未來自托管 PMTiles 緩解。
- [0005 — 樣式：Tailwind CSS v4](0005-tech-stack-tailwind-css.md)
- [0006 — Lint/Format：Biome](0006-tech-stack-biome.md) — 取代 ESLint + Prettier。
- [0007 — 狀態管理：Zustand](0007-tech-stack-zustand-state.md) — V0 即採用，對比 Redux/Jotai。
- [0009 — React Compiler（自動記憶化）](0009-tech-stack-react-compiler.md) — 編譯期自動 memo，免手寫 useMemo/useCallback/memo。

### 產品／法規（`product-`）
- [0008 — 規劃輔助定位](0008-product-planning-aid-positioning.md) — 規劃輔助非權威判定；免責不變量、localStorage 同意、匿名優先。

### 資料來源／處理（`data-`）
- [0010 — 禁限航圖資的資料來源策略（法規驅動）](0010-data-regulatory-layers-sourcing.md) — 依法規（民航法 99-13、規則 §12、國家公園法）分層取得：開放資料 ETL（國家公園、機場）＋官方公告數位化（禁限航、地方公告區）；不反解 CAA。新增 `localGovZone`。

## 慣例

### 編號與檔名
- `NNNN-<前綴>-<slug>.md`，依建立順序遞增。
- 前綴分類：`tech-stack-`（基礎技術選型）、`product-`（產品/法規/定位）、`data-`（資料來源/處理）。出現新類別可再加前綴。

### 格式
- 結構：**Context → Decision → Considered Options → Consequences**。
- Considered Options：**採用置頂、否決在後**；單一選項有多個理由時用**巢狀子點**。
- 易反悔／無取捨的子決策（如 overlaid↔interleaved、底圖樣式）記成 **Consequence**，不單獨開 ADR。

### 何時該寫 ADR
- 本專案為**作品集導向**，ADR 兼具「展示選型思路」用途，故覆蓋面刻意比一般「只記難回頭的硬仗」更廣——**多數技術選型都記**。
- 但仍須有**真實取捨**；純瑣碎、無取捨、照慣例的（如 TS strict、icon 套件）不寫。
- 未驗證／未定案的未來決策標 `status: proposed`，不寫成已定案。

### 語言
- 以**台灣繁體中文**為唯一真實來源（SSOT），禁支語。
- 英文版位於 [`en/`](en/)，為中文的衍生翻譯；每份英文檔頭註明「譯自中文、以中文版為準」。

### 維護（修改 ADR／文件時必做）
- **同步所有語系**：改了中文 canonical，務必一併更新對應的 `en/` 翻譯（目前語系：中文〔為準〕、英文）。日後若再加語系，同樣全數同步。
- **bump「最後更新」日期**：更新被改檔案標題下的日期。
- 英文為衍生版，**不得只改英文**（中文恆為準）。

## 未來 ADR 待寫清單（roadmap）

依里程碑，避免遺漏；現在不寫成空殼，到對應階段才落地（未驗證者先標 `proposed`）。

| 里程碑 | 待寫 ADR | 備註 |
|---|---|---|
| M1 | 天氣資料來源（CWA API；另評估 Open-Meteo） | 金鑰/額度；Open-Meteo 免金鑰，列為候選 |
| M1 | 地點搜尋 geocoding 選型 | licensing/cost 取捨，性質類似底圖 |
| M1 | 點面判斷用 turf.js | 為 M3 搬 PostGIS 鋪路 |
| M1 | 適宜度評分演算法 | 原則已記於 0008，屆時定公開公式/門檻 |
| M2 | 後端服務（NestJS vs Hono）、REST + OpenAPI、身分驗證、Supabase vs 自寫後端 | 0008 已記 auth 的 proposed 形狀 |
| M3 | Postgres + PostGIS；turf.js → PostGIS 遷移 | 「前端算 → 搬後端」的架構故事 |
| M4 | PWA 離線（vite-plugin-pwa + 台灣 PMTiles） | 緩解路徑已記於 0004 |
| 未定時 | 部署目標（Cloudflare Pages vs Vercel） | 低 lock-in，部署時再定 |
| v2 | 社群層資料模型、是否引入 GraphQL | 6.6 說資料關聯變複雜再評估 |
