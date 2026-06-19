# Monorepo（pnpm workspace）

_最後更新：2026-06-19_

## Context

dronegohub 是單人全端作品集專案，需在同一處容納前端、未來的後端與圖資 ETL 腳本。專案刻意設計成走完「前端 → 後端 → DB → 架構 → 部署」一輪，前後端的型別與部署整合本身就是展示點。V0 階段只有前端、尚無後端。

## Decision

採用單一 pnpm workspace。V0 先放 `apps/web` 一個套件；後端與 ETL 套件待對應里程碑出現時，加入同一 workspace。

## Considered Options

- **Monorepo 現在就開（採用）** — 以極低前期成本鎖定架構形狀、避免日後重構，並讓「全端整合」的架構意圖一開始就到位。
- **單套件，之後再升 monorepo（否決）** — V0 只有前端，monorepo 唯一理由「前後端共用型別」此刻並不存在，單套件更簡單；但日後回頭改 monorepo 需搬檔、改 import 路徑、改 CI，成本高於現在多開兩個設定檔。

## Consequences

- 型別共用紅利要到里程碑 2（後端出現）才兌現；V0 期間 monorepo 不發揮其主要好處。
- 型別共用紅利只在「前端 ↔ 主後端 API」之間發生；只有**主後端 API** 改用 Python（待決策，與 baseline 的 Python 圖資 ETL 無關）時此紅利才消失，屆時改以 OpenAPI 從後端 schema 產生前端型別。
- workspace 設定須保留「前後端各自獨立部署」的能力，不可讓套件互相耦合。
