# Adopt React Compiler (automatic memoization)

_Last updated: 2026-06-23 · Translated from the canonical Chinese ([../0009-tech-stack-react-compiler.md](../0009-tech-stack-react-compiler.md)); the Chinese version is authoritative._

## Context

A React 19 project often needs hand-written `useMemo` / `useCallback` / `memo` to stabilize references and avoid extra re-renders (e.g. the disclaimer dialog wrapped `onClose` in `useCallback` just to keep its focus effect's dependency stable). Such hand-written memoization is easy to miss, easy to overdo, adds noise, and is often defensive rather than truly necessary — and it's hard to tell in review which cases actually need it.

React Compiler v1.0 went stable in 2025-10. It memoizes components and hooks **at compile time**, with no hand-written memoization; React 19 and Vite both support it.

## Decision

Adopt **React Compiler** for build-time automatic memoization; **stop hand-writing `useMemo` / `useCallback` / `memo`**, keeping them only as an escape hatch when precise control is needed.

- Integration (Vite 8 is rolldown-based): `@rolldown/plugin-babel` + the `reactCompilerPreset()` exported by `@vitejs/plugin-react`.
- React 19 needs no extra runtime package and no `target` option (works out of the box).
- Precondition: code must follow the rules of React for the compiler to memoize safely; non-conforming code is skipped automatically rather than breaking.

## Considered Options

- **React Compiler (adopted)** — automatic, no rewrites, has an escape hatch, officially stable and the current recommendation; removes the noise and gaps of hand-written memo and improves load/interaction performance. Cost: one extra babel transform step in the build.
- **Hand-written memoization (rejected / status quo)** — full control, zero extra build dependency; but easy to miss / overdo, is boilerplate noise, and is no longer the mainstream recommendation in 2026 (React officially says new code should rely on the compiler).
- **No memoization at all (rejected)** — possibly tolerable at V0 scale, but builds a bad habit and leads to avoidable re-renders once interactions and shared state grow.

## Consequences

- One extra babel transform step in the build (`@rolldown/plugin-babel`); output includes the compiler's memo cache (`react/compiler-runtime`), with no change to bundle behavior.
- Existing hand-written memo can be removed incrementally — this change removes the disclaimer's `useCallback` (`onClose` back to inline).
- **Lint gap**: React Compiler's lint rules currently live in `eslint-plugin-react-hooks`; this project uses Biome (ADR 0006), which has no equivalent yet. If strict compiler-conformance checking is wanted later, revisit adding ESLint or wait for Biome support.
- **Low lock-in**: removing the plugin reverts it; the escape hatch still allows manual memo.
