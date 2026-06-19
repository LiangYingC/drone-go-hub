# 前端選型：React + Vite SPA（不選 Vue/Nuxt 與 Next.js）

_最後更新：2026-06-19_

## Context

dronegohub 的核心是一張 WebGL 互動地圖（MapLibre + deck.gl），產品本質是 client-side 重互動應用。前端選型有兩條正交的軸：①UI 框架（React vs Vue）；②是否上 meta-framework（純 SPA vs Next/Nuxt 的 SSR）。開發者既有 React + deck.gl/luma.gl 的 production 經驗，且專案的成長目標是補「後端／DB／架構」那一半，前端是用來借力的強項。後端架構已定為獨立服務（TS 後端 + Python ETL、各自獨立部署、語言可抽換）。

## Decision

前端用 **React + Vite + TypeScript**，建置成純 client-side SPA。不採用 Vue/Nuxt，亦不採用 Next.js。

## Considered Options

- **React + Vite SPA（採用）** — dev server 快、設定簡單、與「後端獨立」一致、契合既有技能與 vis.gl 地圖棧，不為用不到的 SSR 付複雜度；亦符合 React 官方「SPA 就用 Vite」的現行建議。
- **Vue / Nuxt（否決）** — 技術上可行、deck.gl 渲染效能也完全相同（`@deck.gl/core` 與 `MapboxOverlay` 為 framework-agnostic，可在任何 JS 環境跑）。但對本專案是「零上檔利益、卻有實質代價」：
  - deck.gl 唯一官方框架綁定是 `@deck.gl/react`；Vue 無官方綁定，須以命令式 `MapboxOverlay` 自接，或賭單一維護者的社群包。
  - `react-map-gl` 與 `deck.gl` 同屬 vis.gl、設計上共同演進；Vue 端是拼裝社群 wrapper + 自寫膠水，凝聚力較弱。
  - 改 Vue 會丟掉既有的 React+deck.gl 經驗，並把學習預算錯置到前端而非後端。
- **Next.js（否決／暫緩）** — 唯一真正打中本產品的好處是「未來社群／內容層的 SEO」（v2 的推薦點／已知好飛點是可索引、可分享的內容頁）。但：
  - 核心地圖是 GPU canvas、只能 client hydrate，SSR 對首屏近乎零收益。
  - 用 Next API routes 當後端會繞過「獨立後端」這個核心學習目標。
  - 社群層是路線圖中最不確定、最後做的里程碑，現在為它背 RSC 與 build 慣例的複雜度過早。

## Consequences

- 無 SSR/SSG：首屏與 SEO 靠 client 渲染；對工具型地圖站可接受。
- 後端必須是獨立服務（里程碑 2），不寄生於前端框架——與 ADR 0001 一致。
- **Revisit trigger**：若社群／內容層（v2）成為重點且其頁面需要 SEO，再評估遷移到 Next。此遷移有界（React 元件可照搬、重組路由、地圖包成 `dynamic(ssr:false)` island），非打掉重練。
- UI 框架綁定了 vis.gl 一等公民工具（`react-map-gl` + `@deck.gl/react`）；日後若改 UI 框架會喪失此凝聚力，成本高。
