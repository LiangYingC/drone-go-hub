# Lint/Format: Biome

_Last updated: 2026-06-19 · Translated from the canonical Chinese ([../0006-tech-stack-biome.md](../0006-tech-stack-biome.md)); the Chinese version is authoritative._

## Context

We need code linting and formatting. The project is a solo, freshly created Vite + React + TS app (see ADR 0002).

## Decision

Use **Biome** — a single tool doing lint + format + import sorting — replacing the ESLint + Prettier combination.

## Considered Options

- **Biome (chosen)** — written in Rust and fast; a single `biome.json`, minimal config, near zero-config; formatting is highly Prettier-compatible. A good fit for a solo new project.
- **ESLint + Prettier (rejected)** — the most mature ecosystem and plugins, and more stable Tailwind class sorting (`prettier-plugin-tailwindcss`); but requires installing/configuring two tools and is slower.

## Consequences

- Biome's plugin ecosystem is smaller than ESLint's; if a niche ESLint plugin rule is needed later, you may add ESLint back or find an alternative.
- Tailwind class auto-sorting in Biome is newer and more experimental; if sort stability matters a lot, re-evaluate the Prettier plugin later.
- Easy to reverse: switching back to ESLint + Prettier later is cheap.
