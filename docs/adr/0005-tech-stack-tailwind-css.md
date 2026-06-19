# 樣式方案：Tailwind CSS v4

_最後更新：2026-06-19_

## Context

V0 的 UI 表面積不大——主體是全螢幕地圖，UI 是浮在其上的卡片/面板（Go/No-Go 卡、搜尋框、資訊卡、免責）。需要一致且快速刻出這些 overlay 元件的方式。前端為 Vite + React + TS（見 ADR 0002）。

## Decision

用 **Tailwind CSS v4**，搭配官方 `@tailwindcss/vite` plugin。

## Considered Options

- **Tailwind CSS v4（採用）** — utility-first，刻 overlay 元件又快又一致；v4 的 Vite plugin 與 Oxide 引擎啟動快、CSS-first 設定；社群大、查找容易。
- **CSS Modules（否決）** — 零依賴、scoped，但間距/色彩等設計系統要自己建立，速度較慢。
- **vanilla-extract（否決）** — 型別安全的 CSS-in-TS，不錯但設定較多，對這麼小的 UI 表面 overkill。
- **styled-components / emotion（否決）** — 有 runtime 成本、2026 偏退流行。

## Consequences

- Tailwind 只管 React overlay UI；**管不到地圖 canvas 與 MapLibre 內建控制項/popup**——那些走 `maplibre-gl.css`（import 後必要時輕量覆寫）。
- 若日後 UI 長大、需要無障礙的 dialog/dropdown 等原語，再搭 shadcn/ui（Radix + Tailwind）；V0 先手刻。
