# Regulatory-layer data sourcing strategy (regulation-driven)

_Last updated: 2026-06-28 · Translated from the canonical Chinese ([../0010-data-regulatory-layers-sourcing.md](../0010-data-regulatory-layers-sourcing.md)); the Chinese version is authoritative._

## Context

dronegohub's core is to show Taiwan's drone "regulatory layers" (`regulatoryLayers`) on a map for pre-flight reference. To do that we must first answer: **which control zones actually exist in law, who announces them, and where we can legally obtain the data**. This ADR defines the layer taxonomy and data-sourcing strategy from current regulations. The advisory naming of the data model and the "planning aid" positioning are in [ADR 0008](0008-product-planning-aid-positioning.md).

### Regulatory basis (verified article-by-article; sources at the end)

- **Civil Aviation Act, Art. 99-13(1)**: flight is prohibited within no-fly zones, restricted zones, and a "certain distance" around airports/airfields; the airport/airfield distance is **announced by the CAA (Civil Aviation Administration, MOTC)**, adopting the Art. 34 "objects hazardous to flight safety near airports" range (see below). → no-fly zone, restricted zone, and airport buffer are the core prohibited areas.
- **Art. 99-13(2)**: outside those areas, below 400 ft above ground, **municipal / county (city) governments** may announce drone activity zones, times, and other management matters. → **local-government-announced zones** are a distinct class of control.
- **Art. 99-14**: operating limits — actual height must not exceed 400 ft above ground/water, no flight from sunset to sunrise, and visual line of sight required. → these are *operating limits*, not geographic layers, but are regulatory inputs to the future "suitability score / flyable hours."
- **RPA Management Rules, Art. 12**: an RPA with max take-off weight ≥ 1 kg and navigation equipment must carry geofencing map software that prevents entering no-fly zones, restricted zones, and the airport/airfield buffer. → **the regulation itself mandates a regulatory-layer dataset**; this product is effectively the "pre-flight query" version of it.
- **National parks**: under the National Park Act and each park authority's announcements, operating a drone inside a park generally requires prior permit — a different legal basis from the Civil Aviation Act, so it is its own class.

### Open-data status (verified, 2026-06)

The CAA [RPA management system](https://drone.caa.gov.tw/) (hereafter the "CAA interactive map") is primarily an **interactive online query** (click the map for details); **some announcements (e.g. city/county government notices) include PDF attachments (notice text / a schematic map)**, but there is **no public API and no bulk or GIS-ready vector download (SHP/KMZ/GeoJSON)**; request [#136966](https://data.gov.tw/suggests/136966) ("release no-fly/restricted zones as SHP/KMZ"), aimed at that gap, was **closed as released in 2025-06**, and the CAA has published GIS-friendly files for several layers on the open-data platform and its own site:

- **Restricted zones**: [Taipei FIR restricted-airspace map data (49021)](https://data.gov.tw/dataset/49021) (CAA, Government Open Data License v1); downloadable as **KML / coordinate Excel / PDF** from the [CAA site (a=243)](https://www.caa.gov.tw/Article.aspx?a=243&lang=1). The current authoritative list is the **24 R-areas** in [eAIP `ENR 5.1`](https://ais.caa.gov.tw/eaip/AIRAC%20AIP%20AMDT%2002-26_2026_05_14/eAIP/RC-ENR%205.1-zh-TW.html) (with coordinates).
- **Airport / airfield "certain distance"**: [Airport-vicinity hazardous-object range map data (45701)](https://data.gov.tw/dataset/45701) (under Civil Aviation Act **Art. 34**, CAA, Open Data License v1; KML / SHP / coordinate Excel etc.), which **explicitly covers "aerial cameras and remote-controlled unmanned aircraft."** The [99-13 explainer](https://www.caa.gov.tw/Article.aspx?a=2429&lang=1) confirms the **99-13 airport "certain distance" adopts the Art. 34 range** (an arc of 5 km radius ±35° from each runway end; a 1 km circle for airfields), so 45701 is this layer's dataset.
- **National parks**: [National park GIS layer compilation (174421)](https://data.gov.tw/dataset/174421) (MOI National Parks Administration, SHP/WMS, Open Data License v1), including boundary layers.
- **No-fly zones**: a statutory category, but the current eAIP `ENR 5.1` lists prohibited (P) and danger (D) areas as **NIL** (none standing), so there is **no geographic data yet**.
- **Local-government zones**: **no centralized open data**; the CAA states these are "within each municipal / county (city) government's authority … please query each local government's announcement site," so they must be gathered per county.

> ⚠️ **Freshness**: the open data above is "**updated irregularly**" and some download files date back to 2018, so the current list is validated against **eAIP `ENR 5.1`**; cross-validate from multiple sources when actually wiring up data (presentation is an implementation / UX-design concern).
> ℹ️ A separate [domestic civil-airport building-restriction control dataset (35876)](https://data.gov.tw/dataset/35876) exists, but it is **building-height control (禁限建)**, unrelated to drone flight — **not used**.

## Decision

Adopt a **tiered data-sourcing strategy**, choosing each layer's source by "regulation type × open-data availability"; the data model follows the regulatory taxonomy.

### 1. Layer taxonomy (aligned to regulations → `AdvisoryCategory`)

| Regulatory basis | Layer | `AdvisoryCategory` | Sourcing strategy |
|---|---|---|---|
| Civil Aviation Act 99-13(1) | No-fly zone | `noFlyZone` | Keep the category; current eAIP is NIL (no geographic data yet), pending CAA announcement |
| Civil Aviation Act 99-13(1) | Restricted zone (conditional) | `restrictedZone` | **Open-data ETL (49021)**, validated against eAIP `ENR 5.1` |
| Civil Aviation Act 99-13(1) (certain distance = Art. 34), Rules §12 | Airport buffer (certain distance) | `airportBuffer` | **Open-data ETL (45701, Art. 34, covers drones)** |
| **Civil Aviation Act 99-13(2)** | **Local-government zone** | **new `localGovZone`** | Digitize each city/county announcement (no centralized open data; V0 may list the category with empty data) |
| National Park Act + park authorities | National park | `nationalPark` | **Open-data ETL (174421 SHP/WMS)** |

### 2. Acquisition methods (ordered by legality and stability)

- **Open-data ETL (preferred)**: restricted zones (49021), airport "certain distance" (45701), and national parks (174421) → ETL into static GeoJSON served to the frontend, refreshed periodically via GitHub Actions and **validated against the current eAIP list**. Coordinate conversion: SHP is usually TWD97 (EPSG:3826) and must be reprojected to WGS84 (EPSG:4326); KML is already WGS84 per spec; CSV/Excel coordinate files must have their coordinate system confirmed first.
- **Digitize official announcements**: **local-government zones** (`localGovZone`) have no centralized open data, so digitize them per county from the **official announcements** (public information each city/county government publishes under the Administrative Procedure Act) into GeoJSON, tagging each with its **announcement number / source URL / announcement date** (aligned to the existing `source` / `sourceUrl` / `lastUpdated` fields of `AdvisoryZoneProperties`). No-fly zones currently have no standing areas (eAIP NIL); handle the same way once the CAA announces any.
- **Do not use reverse-engineered CAA map endpoints** as a data source: the regulatory-layer geometry can already be compiled legitimately from public official documents (see above), so this route is **unnecessary**; moreover, this product prioritizes data with **clear licensing and attributable provenance**, and pulling data from a third-party system without authorization is inconsistent with that principle and with the system's terms of use (full rationale in Considered Options). At most a private cross-check during manual digitization, never wired into the data pipeline.

### 3. Impact on the data model

- `AdvisoryCategory` **gains `localGovZone`** (zones announced by local governments under 99-13(2)).
- `airportBuffer` uses 45701 (the Art. 34 "objects hazardous to flight safety near airports" range, which explicitly covers drones); its `source` records the legal basis (Civil Aviation Act Art. 34) and dataset 45701. Dataset 35876 (building-restriction / building height) is **not used**.
- Operating limits (400 ft, daytime, VLOS) are stored as **config / rule data** as regulatory inputs to the future suitability score, not mixed into the geographic layers.

## Considered Options

- **Tiered (open data + digitized announcements) + no reverse-engineering (chosen)**
  - Clear licensing (Government Open Data License v1 allows commercial use), attributable sources, offline-capable, consistent with the "planning aid" positioning.
  - Restricted zones, airports, and national parks use open data; only local-government zones need per-county digitization. Cost: open data is updated irregularly and the local-government layer needs manual maintenance, so data may be incomplete/delayed — absorbed by "reference + source + last-updated" (see ADR 0008).
- **Reverse-engineer CAA endpoints (rejected)**
  - Some peer products obtain integrated, current layers this way, seemingly saving the assembly work; but for this product the regulatory-layer geometry is already obtainable legitimately from public official documents (eAIP `ENR 5.1`, CAA and city/county announcements), so this is not a necessary means of acquiring the data.
  - The main reason for not adopting it is a **sourcing principle**: this product prioritizes data with clear licensing and attributable provenance; pulling data from a third-party system without authorization is inconsistent with that principle and the system's terms of use. Digitizing public documents keeps the source and licensing clear and traceable, consistent with the "planning aid" positioning.
  - The endpoints are undocumented and may change or be shut off anytime, making them an unstable data pipeline.
  - The cost of digitizing public documents (weaker completeness/freshness) is absorbed by this "tiered" option and disclosed via "reference + source + last-updated" (see ADR 0008).
- **Wait for official open data (partly already happened)**
  - Restricted zones (49021) and airports (45701) have been published by the CAA as open data (request [#136966](https://data.gov.tw/suggests/136966) was closed as released in 2025-06), so that part no longer needs waiting; but **local-government zones** are, by the CAA's own statement, each county's responsibility and not centralized, so they still must be gathered per county.

## Consequences

- This ADR **supersedes** the M1 roadmap direction "no-fly layer pipeline (reverse-engineer CAA)," and **amends [ADR 0008](0008-product-planning-aid-positioning.md)**'s early assumption that the layer data is reverse-engineered from CAA (its data-uncertainty reasoning still holds: open data is updated irregularly and digitized announcements can also be stale/incomplete, so the "planning aid" positioning is unchanged).
- After adding `localGovZone`, the data model (`AdvisoryCategory`) and the `CONTEXT.md` glossary must gain the corresponding entries in the implementation PR.
- The "regulation → sourcing" table above is the **checklist for future amendments**: when the 99-13 airport distance announcement, local announcements, or national-park zoning change, the corresponding layers and sourcing must be revisited.
- V0 still renders demo/fake data (already disclosed in ADR 0008); this ADR establishes the path to real data after V0. Open data is updated irregularly and some files are older, so wiring up real data requires cross-validation against the current eAIP list (presentation left to the UX-design stage).

### Leads to explore later (each to be evaluated separately)

- **Supplementary government layer source**: the National Land Surveying and Mapping Center (NLSC) public map service (`maps.nlsc.gov.tw`) can be evaluated as a supplementary source for government layers and basemap (related to [ADR 0004](0004-tech-stack-openfreemap-basemap.md)); licensing and layer suitability TBD.
- **Weather data-source candidate**: weather is a separate M1 ADR; besides the Central Weather Administration (CWA), **Open-Meteo** (keyless) is a candidate worth evaluating, with licensing and data suitability left to that ADR.
- **Architecture validation**: peer products commonly "ingest the layers once and serve them from their own infrastructure (a GIS server / backend API), rather than calling the official system at runtime," consistent with this ADR's "ETL → static GeoJSON, self-served" approach; the difference is that this product deliberately chooses legitimate ingestion sources (open data + digitized announcements).

## Sources (Taiwan official / trustworthy)

Statutory text (Laws & Regulations Database, Ministry of Justice):

- [Civil Aviation Act, Art. 99-13](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=K0090001&flno=99-13)
- [Civil Aviation Act, Art. 99-14](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=K0090001&flno=99-14)
- [RPA Management Rules, Art. 12](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=K0090083&flno=12)

Competent-authority explainers (CAA):

- [99-13 activity-zone notes](https://www.caa.gov.tw/Article.aspx?a=2429&lang=1), [99-14 operating-rules notes](https://www.caa.gov.tw/Article.aspx?a=2430&lang=1)
- [RPA management system (official query)](https://drone.caa.gov.tw/)
- [eAIP `ENR 5.1` no-fly, restricted and danger areas (with coordinates, current AMDT 02-26)](https://ais.caa.gov.tw/eaip/AIRAC%20AIP%20AMDT%2002-26_2026_05_14/eAIP/RC-ENR%205.1-zh-TW.html)
- [Restricted-zone & airport map downloads (CAA site a=243)](https://www.caa.gov.tw/Article.aspx?a=243&lang=1)

Open data (data.gov.tw):

- [Taipei FIR restricted-airspace map data (49021)](https://data.gov.tw/dataset/49021) (CAA · KML/coordinates · Government Open Data License v1)
- [Airport-vicinity hazardous-object range map data (45701)](https://data.gov.tw/dataset/45701) (CAA · Civil Aviation Act Art. 34 · KML/SHP/coordinates · Government Open Data License v1 · covers drones)
- [National park GIS layer compilation (174421)](https://data.gov.tw/dataset/174421) (MOI National Parks Administration · SHP/WMS · Government Open Data License v1)
- [Open-data request #136966 (restricted zones + airports released; local-government zones are each county's responsibility)](https://data.gov.tw/suggests/136966)
- [Domestic civil-airport building-restriction control zones (35876)](https://data.gov.tw/dataset/35876) (CAA · KMZ · **not used**: building-height control, not drones)
