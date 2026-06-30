import type { AdvisoryCategory } from "./types";

/** Display label per category — canonical terms from the CONTEXT.md glossary. */
export const CATEGORY_LABEL: Record<AdvisoryCategory, string> = {
  noFlyZone: "禁航區",
  restrictedZone: "限航區",
  airportBuffer: "機場緩衝",
  localGovZone: "地方政府公告區",
  nationalPark: "國家公園",
};
