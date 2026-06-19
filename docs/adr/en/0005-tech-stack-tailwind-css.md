# Styling: Tailwind CSS v4

_Last updated: 2026-06-19 · Translated from the canonical Chinese ([../0005-tech-stack-tailwind-css.md](../0005-tech-stack-tailwind-css.md)); the Chinese version is authoritative._

## Context

V0's UI surface is small — the body is a full-screen map, and the UI is cards/panels floating on top (Go/No-Go card, search box, info card, disclaimer). We need a consistent, fast way to build these overlay components. The frontend is Vite + React + TS (see ADR 0002).

## Decision

Use **Tailwind CSS v4** with the official `@tailwindcss/vite` plugin.

## Considered Options

- **Tailwind CSS v4 (chosen)** — utility-first, fast and consistent for overlay components; v4's Vite plugin and Oxide engine start fast with CSS-first config; large community, easy to look things up.
- **CSS Modules (rejected)** — zero dependency and scoped, but you must build your own spacing/color design system, which is slower.
- **vanilla-extract (rejected)** — type-safe CSS-in-TS, nice but more setup, overkill for such a small UI surface.
- **styled-components / emotion (rejected)** — runtime cost and waning popularity by 2026.

## Consequences

- Tailwind only styles the React overlay UI; **it does not style the map canvas or MapLibre's built-in controls/popups** — those use `maplibre-gl.css` (import it and lightly override as needed).
- If the UI grows and needs accessible dialogs/dropdowns, pair with shadcn/ui (Radix + Tailwind); V0 hand-rolls them first.
