# Product positioning: planning aid, not authoritative determination (incl. disclaimer and consent record)

_Last updated: 2026-06-27 · Translated from the canonical Chinese ([../0008-product-planning-aid-positioning.md](../0008-product-planning-aid-positioning.md)); the Chinese version is authoritative._

## Context

The no-fly/restricted map data may be stale or incomplete (for the sourcing strategy see [ADR 0010](0010-data-regulatory-layers-sourcing.md): primarily open data plus digitizing official announcements, not reverse-engineering the CAA frontend). Presenting it as an "authoritative determination" would put too much liability on the site if a user follows it and breaks the law or has an accident; hence the "planning aid" positioning. If this positioning stops at copywriting it has no force, so it must become hard invariants in the data model and UI. V0 has no login, no backend, no DB.

## Decision

The product is positioned as a **planning aid**, not an **authoritative determination**. Realized as the following invariants:

- Wording is always "reference / advisory," **never** "legal / guaranteed flyable."
- The red/yellow/green signal carries **advisory semantics** and is always shown with a "reference" framing.
- The data model **must not contain a field that reads like a verdict** (no `isLegal`/`canFly`); use advisory-style naming.
- The disclaimer's **persistent entry point is non-removable** (fixed location, re-openable anytime); on first visit it **shows automatically and is dismissible** (consent recorded in the browser's localStorage). Signal cards always keep the "reference" wording and link to the full disclaimer in one tap.
- "Flyability is not binary": V0's red/yellow/green is a simplification "assuming general recreational flight," and this assumption must be stated in the UI, with a **warning / link to the official source** for verification.
- Persistently show the **data source** and the **map-data last-updated time**.
- Record the user's **consent to the disclaimer and its time** (approach below).

## Disclaimer consent and authentication

**Consent record (how, without login)**
- V0 (no login/DB): on first visit, obtain consent via a **lightweight one-time confirmation**, stored in **localStorage**: `{ disclaimerVersion, acknowledgedAt }` — keeping a "consent + time" record without an account (per device).
- When the disclaimer text / data policy changes (`disclaimerVersion` bumps), request confirmation again.
- The passive persistent disclaimer entry point **coexists** with this one-time confirmation.

**Authentication model (forward-looking, not a V0 decision)**
- **Anonymous-first**: address search, querying no-fly/restricted zones, and viewing weather / Go-No-Go **require no login** (low friction, instant value).
- **Login required**: personalization features (saved spots, daily suitability, community reports), Milestone 2+.
- After login, associate/migrate the localStorage consent record to the account (DB-persisted); anonymous users rely on localStorage.
- The full authentication decision awaits a dedicated Milestone 2 ADR (marked `status: proposed` then).

## Considered Options

- **Planning-aid positioning (chosen)** — both wording and UI converge on "reference," giving a clear liability boundary that matches the uncertainty of reverse-engineered data; also consistent with "not chasing authority for monetization."
- **Authoritative-determination positioning (rejected)** — a crisper experience (directly stating "can/can't fly"), but reverse-engineered data may be stale, making liability too heavy and legal risk high.

## Consequences

- **Green is most dangerous** (most likely mistaken for permission), so signal cards still mark "reference" and must link to the full disclaimer in one tap.
- The first-visit consent prompt must be **lightweight, non-blocking** to the "read it in three seconds" instant value, and **dismissible** — not a blocking modal.
- The localStorage consent is **device-level, not person-level**: clearing cache / switching devices loses it, acceptable for V0.
- **Suitability score (Milestone 1)**: a concrete numeric score is not required (it may be qualitative); if a scoring algorithm is used, **the algorithm must be public and transparent** (publish the formula and thresholds, e.g. a "wind speed × craft weight" difficulty threshold). Actual thresholds/weights need research (possibly official assessment methods); for now only this principle is recorded, with no algorithm fixed.
- The community layer (v2) adds its own disclaimer to user-contributed content: it is experience sharing, not official permission.
