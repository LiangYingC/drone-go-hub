# State management: Zustand (adopted in V0)

_Last updated: 2026-06-19 · Translated from the canonical Chinese ([../0007-tech-stack-zustand-state.md](../0007-tech-stack-zustand-state.md)); the Chinese version is authoritative._

## Context

V0 already has state shared across components (the clicked no-fly zone → info card, the map viewState). More will follow (saved spots, weather data, layer toggles, search). We must decide whether to adopt a shared-state solution now or later.

## Decision

**Adopt Zustand in V0.** Main reason: adoption cost is near zero, and putting it in place now makes later expansion very convenient and avoids a later prop-drilling refactor.

## Considered Options

- **Zustand (chosen)** — store-based, tiny (~1 KB), no Provider wrapping needed (the store lives at module level), selector-based slice subscriptions to avoid extra re-renders; near-zero boilerplate, best fit for "a small amount of shared app state."
- **Redux (with RTK) (rejected)** — the most structured, with the strongest devtools and middleware ecosystem, suited to large teams and complex state flows; but even with RTK there is notable boilerplate and ceremony, overkill for a solo small project.
- **Jotai (rejected)** — atom-based, bottom-up composition of small atoms with fine-grained re-renders, suited to state that naturally decomposes into many independent/derived pieces; this project has "a few shared values," for which a single store's mental model is simpler.
- **Plain React state / Context (rejected as the primary approach)** — barely enough for V0, but as state grows it leads to lifting state / prop-drilling, exactly what adopting Zustand avoids.

## Consequences

- Slightly "ahead of need": V0's state could be handled with local/lifted React state; but Zustand's near-zero cost buys smooth future expansion — a worthwhile trade-off.
- For server state (weather, saved-spot APIs) needing caching/retries later, pair with **TanStack Query**: Zustand for UI/client state, TanStack Query for server state — a common, non-conflicting combination.
- Establish store-slice and selector conventions from the start to avoid one giant junk store.
