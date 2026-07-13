/**
 * Current restricted-area list, hand-pinned from the CAA eAIP ENR 5.1 page.
 *
 * The CAA open-data KML set (dataset 49021) dates from 2018 and still contains
 * zones that have since been abolished, so the eAIP — the authoritative,
 * AIRAC-amended publication — is the gate for what the ETL may emit: zones
 * missing here are dropped as stale, and zones listed here but absent from the
 * open data fail the run. Pinning the list as data (instead of scraping the
 * eAIP at run time) keeps the pipeline deterministic; the eAIP URL changes
 * every amendment cycle anyway, so a refresh is a deliberate re-verification
 * of this file against the newest amendment, not an automatic fetch.
 */

/** The eAIP amendment this list was verified against. */
export const EAIP_AMENDMENT = {
  id: "AIRAC AIP AMDT 02-26",
  effectiveDate: "2026-05-14",
  retrievedDate: "2026-07-13",
  sourceUrl:
    "https://ais.caa.gov.tw/eaip/AIRAC%20AIP%20AMDT%2002-26_2026_05_14/eAIP/RC-ENR%205.1-zh-TW.html",
} as const;

export interface EaipCircle {
  /** [longitude, latitude] in WGS84 degrees. */
  centre: [number, number];
  radiusM: number;
}

export interface EaipRestrictedArea {
  /** eAIP designation, e.g. "RCR16", "DONGSHA". */
  designation: string;
  /** Chinese name as published in the eAIP, when it has one. */
  zhName?: string;
  /** Vertical limits string as published (upper / lower). */
  verticalLimits: string;
  /**
   * Where the geometry comes from:
   * - "openData49021": closed-ring KML from CAA open dataset 49021.
   * - "eaipCircle": the open-data file for this zone is unusable CAD line
   *   fragments, but the eAIP defines the zone as a plain circle, so the
   *   polygon is generated from the published centre and radius instead.
   */
  geometrySource: "openData49021" | "eaipCircle";
  circle?: EaipCircle;
}

const NM_IN_M = 1852;

/** Convert eAIP "DDMMSSN DDDMMSSE" coordinate pair to [lng, lat] degrees. */
function dms(lat: string, lng: string): [number, number] {
  const parse = (s: string, degDigits: number): number => {
    const deg = Number(s.slice(0, degDigits));
    const min = Number(s.slice(degDigits, degDigits + 2));
    const sec = Number(s.slice(degDigits + 2, degDigits + 4));
    return deg + min / 60 + sec / 3600;
  };
  return [parse(lng, 3), parse(lat, 2)];
}

export const EAIP_RESTRICTED_AREAS: EaipRestrictedArea[] = [
  {
    designation: "DONGSHA",
    zhName: "東沙群島",
    verticalLimits: "5000 FT AMSL / SFC",
    geometrySource: "eaipCircle",
    // eAIP: Circle, radius 10NM, centre 204200N 1164300E.
    circle: { centre: dms("204200", "1164300"), radiusM: 10 * NM_IN_M },
  },
  {
    designation: "NANSHA",
    zhName: "南沙群島",
    verticalLimits: "6000 FT AMSL / SFC",
    geometrySource: "eaipCircle",
    // eAIP: Circle, radius 10NM, centre 102300N 1142300E.
    circle: { centre: dms("102300", "1142300"), radiusM: 10 * NM_IN_M },
  },
  { designation: "RCR5", verticalLimits: "FL370 / SFC", geometrySource: "openData49021" },
  {
    designation: "RCR6",
    zhName: "佳冬",
    verticalLimits: "12000 FT AMSL / SFC",
    geometrySource: "openData49021",
  },
  {
    designation: "RCR7",
    zhName: "石礁",
    // Two sub-areas in the eAIP; both reach the surface, so the zone matters
    // to drone operations regardless of which sub-area one is under.
    verticalLimits: "FL150 / SFC（內圈 2.6NM）；4000 FT AMSL / SFC（外圈 6.5NM）",
    geometrySource: "openData49021",
  },
  { designation: "RCR8", verticalLimits: "FL370 / SFC", geometrySource: "openData49021" },
  { designation: "RCR9", verticalLimits: "FL370 / SFC", geometrySource: "openData49021" },
  { designation: "RCR11", verticalLimits: "FL370 / SFC", geometrySource: "openData49021" },
  { designation: "RCR12", verticalLimits: "FL290 / SFC", geometrySource: "openData49021" },
  {
    designation: "RCR16",
    zhName: "陽明山",
    verticalLimits: "4000 FT AMSL / SFC",
    geometrySource: "openData49021",
  },
  { designation: "RCR17", verticalLimits: "FL370 / SFC", geometrySource: "openData49021" },
  { designation: "RCR18A", verticalLimits: "FL180 / SFC", geometrySource: "openData49021" },
  // Same footprint as RCR18A but starting at FL181 — far above drone altitudes.
  // Kept because this layer mirrors the official list; relevance filtering is a
  // presentation decision, not a data one.
  { designation: "RCR18B", verticalLimits: "FL400 / FL181", geometrySource: "openData49021" },
  { designation: "RCR22", verticalLimits: "2000 FT AMSL / SFC", geometrySource: "openData49021" },
  { designation: "RCR25", verticalLimits: "4000 FT AMSL / SFC", geometrySource: "openData49021" },
  { designation: "RCR27", verticalLimits: "1000 FT AMSL / SFC", geometrySource: "openData49021" },
  {
    designation: "RCR30",
    zhName: "大福",
    verticalLimits: "5000 FT AMSL / SFC",
    geometrySource: "openData49021",
  },
  {
    designation: "RCR34",
    zhName: "枋山",
    verticalLimits: "FL240 / SFC",
    geometrySource: "openData49021",
  },
  {
    designation: "RCR38",
    zhName: "水溪",
    verticalLimits: "FL150 / SFC",
    geometrySource: "openData49021",
  },
  { designation: "RCR39", verticalLimits: "FL400 / SFC", geometrySource: "openData49021" },
  {
    designation: "RCR40",
    zhName: "小蘭嶼",
    verticalLimits: "FL140 / SFC",
    geometrySource: "openData49021",
  },
  {
    designation: "RCR41",
    zhName: "太麻里",
    verticalLimits: "FL140 / SFC",
    geometrySource: "openData49021",
  },
  {
    designation: "RCR42",
    zhName: "恆春A區",
    verticalLimits: "FL370 / SFC",
    geometrySource: "openData49021",
  },
  {
    designation: "RCR43",
    zhName: "恆春B區",
    verticalLimits: "FL370 / SFC",
    geometrySource: "openData49021",
  },
  { designation: "RCR45", verticalLimits: "3000 FT AMSL / SFC", geometrySource: "openData49021" },
  { designation: "RCR46", verticalLimits: "3000 FT AMSL / SFC", geometrySource: "openData49021" },
  { designation: "RCR47", verticalLimits: "3000 FT AMSL / SFC", geometrySource: "openData49021" },
  { designation: "RCR48", verticalLimits: "4000 FT AMSL / SFC", geometrySource: "openData49021" },
  { designation: "RCR50", verticalLimits: "FL200 / SFC", geometrySource: "openData49021" },
];
