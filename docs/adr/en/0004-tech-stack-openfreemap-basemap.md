# Basemap tiles: OpenFreeMap (no leeching Carto's CDN, no commercial tiles)

_Last updated: 2026-06-19 · Translated from the canonical Chinese ([../0004-tech-stack-openfreemap-basemap.md](../0004-tech-stack-openfreemap-basemap.md)); the Chinese version is authoritative._

## Context

The map needs basemap vector tiles (roads, coastlines, place names). A basemap's "style" and "tile data" are often licensed separately, and leeching someone's CDN is a licensing gray area. This project is public as a portfolio, broadly "spends no real money," and will go offline (PWA) later.

## Decision

- The basemap uses the **OpenFreeMap public instance** (OSM data, no API key, free, no view/request limits).
- Style: **positron (light gray)**.
- Attribution is added automatically by MapLibre (OpenFreeMap © OpenMapTiles, data from OpenStreetMap).

## Considered Options

- **OpenFreeMap (chosen)** — free, no key, public-OK, OSM data, self-hostable, with selectable styles.
- **Carto CDN (rejected)** — its styles are free under BSD-3, but **the tile data itself needs an enterprise agreement**; leeching its CDN is a licensing gray area, unacceptable for a public portfolio.
- **Mapbox GL (rejected)** — not open source, requires a token, billed per load.
- **Google Maps (rejected)** — usage-based billing and **tile caching forbidden**, conflicting directly with "spend no real money" and the future "PWA offline."

## Consequences

- **Style positron (light gray)**: makes the overlaid red/yellow/green no-fly zones and annotations pop and easiest to read (the cartographic convention when data is the star); easy to change (one style URL), so not a separate ADR.
- ⚠️ **The public instance has no SLA**: accepted for V0 (fine for prototyping). The risk is a service outage during a demo or in the field.
- **Mitigation path (Milestone 4)**: extract Taiwan's vector tiles into a single `.pmtiles` file, self-host on static storage (e.g. Cloudflare R2), and have MapLibre read it directly via `pmtiles://` with no tile server; it can also be cached by the PWA's Service Worker, solving offline at the same time. A Taiwan extract is small, free of the range-request latency that OpenFreeMap's planet-scale (90 GB) file has.
- Must persistently show attribution and the "map data last-updated time" (consistent with the planning-aid positioning; see the later ADR).
