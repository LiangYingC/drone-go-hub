/**
 * Planning-aid disclaimer configuration (ADR 0008).
 */

/** Bump when the disclaimer copy or data policy changes -> re-prompts acknowledgement. */
export const DISCLAIMER_VERSION = "2026-06-22";

/** Official authority for no-fly / restricted airspace; users must verify against it. */
export const OFFICIAL_SOURCE = {
  label: "交通部民航局 遙控無人機管理資訊系統",
  url: "https://drone.caa.gov.tw/",
} as const;
