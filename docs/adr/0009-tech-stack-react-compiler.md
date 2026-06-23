# 採用 React Compiler（自動記憶化）

_最後更新：2026-06-23_

## Context

React 19 專案常需手寫 `useMemo` / `useCallback` / `memo` 來穩定參考、避免多餘 re-render（例如 disclaimer dialog 為了讓 focus effect 的依賴穩定，而對 `onClose` 包了 `useCallback`）。這類手寫記憶化容易漏、容易過度、增加雜訊，且常是「防禦性」而非真正必要，審查時也難判斷哪些真的需要。

React Compiler v1.0 已於 2025-10 穩定，於**編譯期自動記憶化**元件與 hooks，免手寫；React 19 與 Vite 皆已支援。

## Decision

採用 **React Compiler**，於 build 時自動記憶化；**不再手寫 `useMemo` / `useCallback` / `memo`**，僅在需要精準控制時當逃生艙保留。

- 整合（Vite 8 為 rolldown-based）：`@rolldown/plugin-babel` + `@vitejs/plugin-react` 匯出的 `reactCompilerPreset()`。
- React 19 免額外 runtime 套件、免 `target` 設定（開箱即用）。
- 前提：程式碼須遵循 React 規則（rules of React），compiler 才能安全記憶化；不合規處會自動略過、不致出錯。

## Considered Options

- **React Compiler（採用）** — 自動、無需改寫、有逃生艙、官方穩定且為現行建議；移除手寫 memo 的雜訊與漏網，並帶來載入／互動的效能提升。代價是 build 多一個 babel 轉換步驟。
- **手寫 memoization（否決／現狀）** — 完全控制、零額外 build 依賴；但易漏易過度、屬樣板雜訊，且 2026 已非主流建議（官方明言新程式碼應交給 compiler）。
- **完全不做記憶化（否決）** — 以 V0 規模或許勉強，但會養成壞習慣，待互動與共享狀態變多後會出現可避免的 re-render 問題。

## Consequences

- build 多一個 babel 轉換步驟（`@rolldown/plugin-babel`）；輸出含 compiler 的 memo cache（`react/compiler-runtime`），bundle 行為不變。
- 既有手寫 memo 可逐步移除——本次即移除 disclaimer 的 `useCallback`（`onClose` 回 inline）。
- **lint 缺口**：React Compiler 專用 lint 規則目前在 `eslint-plugin-react-hooks`，本專案用 Biome（ADR 0006）暫無對應；未來若要嚴格檢查 compiler 合規，再評估補 ESLint 或等 Biome 支援。
- **低 lock-in**：移除 plugin 即可回退；逃生艙仍可手動 memo。
