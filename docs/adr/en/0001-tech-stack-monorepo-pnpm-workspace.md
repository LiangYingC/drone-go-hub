# Monorepo (pnpm workspace)

_Last updated: 2026-06-19 · Translated from the canonical Chinese ([../0001-tech-stack-monorepo-pnpm-workspace.md](../0001-tech-stack-monorepo-pnpm-workspace.md)); the Chinese version is authoritative._

## Context

dronegohub is a solo full-stack portfolio project that needs to host the frontend, the (future) backend, and the map-data ETL in one place. The project is deliberately designed to traverse the full "frontend → backend → DB → architecture → deployment" loop, and sharing types and deployment across front and back is itself a showcase point. V0 has only the frontend; there is no backend yet.

## Decision

Use a single pnpm workspace. V0 starts with just one package, `apps/web`; the backend and ETL packages join the same workspace when their milestones arrive.

## Considered Options

- **Adopt a monorepo now (chosen)** — locks the architectural shape at near-zero upfront cost, avoids a later restructure, and puts the "full-stack integration" intent in place from the start.
- **Single package, upgrade to a monorepo later (rejected)** — V0 has only the frontend, so the monorepo's sole rationale ("shared types between front and back") does not yet exist, and a single package is simpler. But later converting a single package into a monorepo means moving files, fixing import paths, and reworking CI — costlier than adding two config files now.

## Consequences

- The shared-types benefit applies only to "frontend ↔ main backend API" and only materializes at Milestone 2 (when the backend API appears); during V0 the monorepo does not deliver its main benefit.
- The benefit disappears only if the **main backend API** itself is rewritten in Python (a pending decision, unrelated to the baseline Python map-data ETL); in that case frontend types would be generated from the backend schema via OpenAPI.
- The workspace setup must preserve "deploy front and back independently"; packages must not become coupled.
