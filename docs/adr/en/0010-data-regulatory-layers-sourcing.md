# Regulatory-layer data sourcing strategy (regulation-driven)

_Last updated: 2026-06-27 · Translated from the canonical Chinese ([../0010-data-regulatory-layers-sourcing.md](../0010-data-regulatory-layers-sourcing.md)); the Chinese version is authoritative._

## Context

dronegohub's core is to show Taiwan's drone "regulatory layers" (`regulatoryLayers`) on a map for pre-flight reference. To do that we must first answer: **which control zones actually exist in law, who announces them, and where we can legally obtain the data**. This ADR defines the layer taxonomy and data-sourcing strategy from current regulations. The advisory naming of the data model and the "planning aid" positioning are in [ADR 0008](0008-product-planning-aid-positioning.md).

### Regulatory basis (verified article-by-article; sources at the end)

- **Civil Aviation Act, Art. 99-13(1)**: flight is prohibited within no-fly zones, restricted zones, and a "certain distance" around airports/airfields; the airport/airfield distance is **announced by the CAA**. → no-fly zone, restricted zone, and airport buffer are the core prohibited areas.
- **Art. 99-13(2)**: outside those areas, below 400 ft above ground, **municipal / county (city) governments** may announce drone activity zones, times, and other management matters. → **local-government-announced zones** are a distinct class of control.
- **Art. 99-14**: operating limits — actual height must not exceed 400 ft above ground/water, no flight from sunset to sunrise, and visual line of sight required. → these are *operating limits*, not geographic layers, but are regulatory inputs to the future "suitability score / flyable hours."
- **RPA Management Rules, Art. 12**: an RPA with max take-off weight ≥ 1 kg and navigation equipment must carry geofencing map software that prevents entering no-fly zones, restricted zones, and the airport/airfield buffer. → **the regulation itself mandates a regulatory-layer dataset**; this product is effectively the "pre-flight query" version of it.
- **National parks**: under the National Park Act and each park authority's announcements, operating a drone inside a park generally requires prior permit — a different legal basis from the Civil Aviation Act, so it is its own class.

### Open-data status (verified)

- Core **no-fly / restricted zones**: the CAA [RPA management system](https://drone.caa.gov.tw/) offers **only an interactive query, with no API or file download**; the open-data portal request [#136966](https://data.gov.tw/suggests/136966) ("release no-fly/restricted zones as SHP/KMZ") remains unfulfilled. → **no official downloadable open data**.
- **Airports**: [Domestic civil-airport building-restriction control zones (35876)](https://data.gov.tw/dataset/35876) exist (KMZ, Government Open Data License v1). ⚠️ But the title explicitly says "building-restriction" (obstacle/height control), which is **semantically not** the drone airport buffer (the Art. 99-13 "certain distance").
- **National parks**: [National park GIS layer compilation (174421)](https://data.gov.tw/dataset/174421) exists (SHP/WMS, Government Open Data License v1, MOI National Parks Administration), including boundary layers.

## Decision

Adopt a **tiered data-sourcing strategy**, choosing each layer's source by "regulation type × open-data availability"; the data model follows the regulatory taxonomy.

### 1. Layer taxonomy (aligned to regulations → `AdvisoryCategory`)

| Regulatory basis | Layer | `AdvisoryCategory` | Sourcing strategy |
|---|---|---|---|
| Civil Aviation Act 99-13(1) | No-fly zone | `noFlyZone` | Digitize official announcements |
| Civil Aviation Act 99-13(1) | Restricted zone (conditional) | `restrictedZone` | Digitize official announcements |
| Civil Aviation Act 99-13(1), Rules §12 | Airport buffer (certain distance) | `airportBuffer` | Digitize CAA-announced geometry; the open-data KMZ is only an "airport-vicinity reference," labelled "building-restriction ≠ drone buffer" |
| **Civil Aviation Act 99-13(2)** | **Local-government zone** | **new `localGovZone`** | Digitize each city/county announcement (V0 may list the category with empty data) |
| National Park Act + park authorities | National park | `nationalPark` | **Open-data ETL (174421 SHP/WMS)** |

### 2. Acquisition methods (ordered by legality and stability)

- **Open-data ETL (preferred)**: national parks (174421) and airport reference (35876) → ETL into static GeoJSON served to the frontend, refreshed periodically via GitHub Actions. Coordinate conversion: SHP is usually TWD97 (EPSG:3826) and must be reprojected to WGS84 (EPSG:4326); KMZ is already WGS84 per the KML spec, no conversion needed.
- **Digitize official announcements**: no-fly, restricted, and local-government zones have no open files, so digitize the **official announcements** (public information that the CAA / local governments must publish under the Administrative Procedure Act) into GeoJSON, tagging each with its **announcement number / source URL / announcement date** (aligned to the existing `source` / `sourceUrl` / `lastUpdated` fields of `AdvisoryZoneProperties`).
- **Do not use reverse-engineered CAA map endpoints** as a data source: the system is marked "reference only," offers no API/download licence, is ToS-grey, and is technically fragile; this aligns with ADR 0008's liability boundary and the product's "not pursuing authority" stance. (At most a private cross-check during manual digitization, never wired into the data pipeline.)

### 3. Impact on the data model

- `AdvisoryCategory` **gains `localGovZone`** (zones announced by local governments under 99-13(2)).
- The `airportBuffer` `advisoryNote` / `source` must state "this data is the airport building-restriction control zone, not a drone-flight buffer; for vicinity reference only."
- Operating limits (400 ft, daytime, VLOS) are stored as **config / rule data** as regulatory inputs to the future suitability score, not mixed into the geographic layers.

## Considered Options

- **Tiered (open data + digitized announcements) + no reverse-engineering (chosen)**
  - Clear licensing (Government Open Data License v1 allows commercial use), attributable sources, offline-capable, consistent with the "planning aid" positioning.
  - Cost: no-fly/restricted zones need manual digitization and maintenance; data may be incomplete/delayed — absorbed by "reference + source + last-updated" (see ADR 0008).
- **Reverse-engineer CAA endpoints (rejected)**
  - Seems to yield the most complete, real-time data; peer sites (earthbook, boggy) effectively do this.
  - But it has no licence, is ToS-grey, the endpoints are undocumented and may change anytime, and it conflicts with the "not pursuing authority" positioning with high liability risk.
- **Wait for official open data (rejected)**
  - Cleanest, but request [#136966](https://data.gov.tw/suggests/136966) shows no short-term release plan, which would indefinitely block the product's core.

## Consequences

- This ADR **supersedes** the M1 roadmap direction "no-fly layer pipeline (reverse-engineer CAA)," and **amends [ADR 0008](0008-product-planning-aid-positioning.md)**'s early assumption that the layer data is reverse-engineered from CAA (its data-uncertainty reasoning still holds: digitized announcements can also be stale/incomplete, so the "planning aid" positioning is unchanged).
- After adding `localGovZone`, the data model (`AdvisoryCategory`) and the `CONTEXT.md` glossary must gain the corresponding entries in the implementation PR.
- The "regulation → sourcing" table above is the **checklist for future amendments**: when the 99-13 airport distance announcement, local announcements, or national-park zoning change, the corresponding layers and sourcing must be revisited.
- V0 still renders demo/fake data (already disclosed in ADR 0008); this ADR establishes the path to real data after V0. The airport layer, due to the semantic gap, must keep its caveat even once wired to open data.

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

Open data (data.gov.tw):

- [Domestic civil-airport building-restriction control zones (35876)](https://data.gov.tw/dataset/35876) (CAA · KMZ · Government Open Data License v1)
- [National park GIS layer compilation (174421)](https://data.gov.tw/dataset/174421) (MOI National Parks Administration · SHP/WMS · Government Open Data License v1)
- [Open-data request #136966 (no-fly/restricted SHP/KMZ, not yet released)](https://data.gov.tw/suggests/136966)
