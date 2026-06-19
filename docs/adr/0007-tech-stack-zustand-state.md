# 狀態管理：Zustand（V0 即採用）

_最後更新：2026-06-19_

## Context

V0 已有需跨元件共享的狀態（被點選的禁航區 → 資訊卡、地圖 viewState）。未來會再增加（收藏點、天氣資料、圖層開關、搜尋）。需決定「現在就上共享狀態方案」還是「之後再上」。

## Decision

**V0 即採用 Zustand。** 主因：導入成本極低，先放好之後擴充非常方便、可免去後續 prop-drilling 的重構。

## Considered Options

- **Zustand（採用）** — store-based、極小（1KB 量級）、無需 Provider 包裹（store 在模組層）、以 selector 訂閱切片避免多餘 re-render；近乎零樣板，最貼合「少量 app 共享狀態」的需求。
- **Redux（含 RTK）（否決）** — 最結構化、devtools 與中介層生態最強，適合大型團隊與複雜狀態流；但即使有 RTK 仍有可觀樣板與儀式，對單人小專案 overkill。
- **Jotai（否決）** — atom-based、由下而上組合小原子、細粒度 re-render，適合「狀態天然碎成很多獨立/衍生片段」的情境；本專案是「少數共享值」，單一 store 的心智模型更單純。
- **純 React state / Context（否決作為主力）** — V0 勉強夠用，但狀態一長大就要 lift state／prop-drilling，正是想用 Zustand 先避開的。

## Consequences

- 略為「超前需求」：V0 的狀態其實 React 本地/提升 state 也能撐；但 Zustand 成本近乎零，換得後續擴充的平滑，取捨划算。
- server 狀態（天氣、收藏點 API）日後若需快取/重試，建議搭 **TanStack Query** 分工：Zustand 管 UI/client 狀態、TanStack Query 管 server 狀態——常見組合、不互斥。
- store 切片與 selector 慣例要一開始就立好，避免變成一個巨大雜物 store。
