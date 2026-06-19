# Lint／Format：Biome

_最後更新：2026-06-19_

## Context

需要程式碼檢查（lint）與格式化（format）。專案為單人、新建的 Vite + React + TS（見 ADR 0002）。

## Decision

用 **Biome**——單一工具同時做 lint + format + import 排序，取代 ESLint + Prettier 組合。

## Considered Options

- **Biome（採用）** — Rust 寫成、速度快；單一 `biome.json`、設定少、近乎開箱即用；格式化與 Prettier 高度相容，適合單人新專案。
- **ESLint + Prettier（否決）** — 生態與 plugin 最成熟、Tailwind class 排序（`prettier-plugin-tailwindcss`）較穩；但要裝/設定兩套工具、且較慢。

## Consequences

- Biome 的 plugin 生態較 ESLint 小；若日後需要冷門 ESLint plugin 規則，可能要補回 ESLint 或找替代。
- Tailwind class 自動排序在 Biome 較新、偏實驗性；若很在意排序穩定度，未來可重評 Prettier plugin。
- 易反悔：之後想換回 ESLint + Prettier 成本低。
