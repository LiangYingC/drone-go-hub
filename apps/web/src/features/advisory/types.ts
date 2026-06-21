/**
 * Advisory data model for no-fly / restricted airspace layers (ADR 0008).
 *
 * Planning-aid positioning is a hard invariant: the data model must not carry
 * verdict-like fields (no isLegal / canFly). Everything is named "advisory" and
 * presented in reference/suggestion language only.
 */

export type AdvisoryCategory =
  | "noFlyZone" // CAA-announced "prohibited" RPA airspace
  | "restrictedZone" // CAA-announced "restricted" (conditional) airspace
  | "airportBuffer" // distance-based restriction ring around airports
  | "nationalPark"; // national park

/** Properties of a single advisory zone (maps to a GeoJSON Feature's properties). */
export interface AdvisoryZoneProperties {
  id: string;
  name: string;
  category: AdvisoryCategory;
  /** Reference note, always in suggestion language; never a legality verdict. */
  advisoryNote: string;
  /** Data source (demo/fake data in V0). */
  source: string;
  sourceUrl?: string;
  /** Layer last-updated time (ISO 8601); must be shown persistently (ADR 0008). */
  lastUpdated: string;
}
