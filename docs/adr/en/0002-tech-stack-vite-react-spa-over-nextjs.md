# Frontend: React + Vite SPA (not Vue/Nuxt, not Next.js)

_Last updated: 2026-06-19 · Translated from the canonical Chinese ([../0002-tech-stack-vite-react-spa-over-nextjs.md](../0002-tech-stack-vite-react-spa-over-nextjs.md)); the Chinese version is authoritative._

## Context

dronegohub's core is a WebGL interactive map (MapLibre + deck.gl); the product is fundamentally a client-side, interaction-heavy app. Frontend selection has two orthogonal axes: (1) UI framework (React vs Vue); (2) whether to adopt a meta-framework (plain SPA vs Next/Nuxt SSR). The developer already has production experience with React + deck.gl/luma.gl, and the project's growth goal is the "backend / DB / architecture" half — the frontend is the existing strength to leverage. The backend is already decided to be an independent service (TS backend + Python ETL, deployed independently, language-swappable).

## Decision

Use **React + Vite + TypeScript**, built as a pure client-side SPA. Do not use Vue/Nuxt, and do not use Next.js.

## Considered Options

- **React + Vite SPA (chosen)** — fast dev server, simple setup, consistent with the "independent backend" architecture, aligned with existing skills and the vis.gl map stack, and no complexity paid for unused SSR; also matches React's current guidance of "use Vite for SPAs."
- **Vue / Nuxt (rejected)** — technically viable, and deck.gl rendering performance is identical (`@deck.gl/core` and `MapboxOverlay` are framework-agnostic). But for this project it is "zero upside at real cost":
  - deck.gl's only official framework binding is `@deck.gl/react`; Vue has no official binding, requiring imperative `MapboxOverlay` wiring or a single-maintainer community package.
  - `react-map-gl` and `deck.gl` are both vis.gl and co-evolve; on Vue you assemble community wrappers plus your own glue, with weaker cohesion.
  - Switching to Vue discards the existing React + deck.gl experience and misallocates the learning budget to the frontend instead of the backend.
- **Next.js (rejected / deferred)** — its only real benefit for this product is SEO for the future community/content layer (v2's recommended spots / known-good spots are indexable, shareable content pages). But:
  - the core map is a GPU canvas that can only hydrate client-side, so SSR adds almost nothing to first paint;
  - using Next API routes as the backend would bypass the "independent backend" core learning goal;
  - the community layer is the most uncertain, last-built milestone, so carrying RSC and build conventions for it now is premature.

## Consequences

- No SSR/SSG: first paint and SEO rely on client rendering — acceptable for a tool-style map site. If marketing landing-page SEO is needed later, evaluate static prerendering separately.
- The backend must be an independent service (Milestone 2), not embedded in the frontend framework — consistent with ADR 0001.
