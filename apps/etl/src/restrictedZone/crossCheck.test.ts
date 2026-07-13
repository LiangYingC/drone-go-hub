import { describe, expect, it } from "vitest";
import { crossCheck } from "./crossCheck";
import { EAIP_RESTRICTED_AREAS } from "./eaipCurrentList";
import type { ManifestEntry } from "./manifest";

function entry(name: string): ManifestEntry {
  return { name, version: "107年8月", date: "2018-08-31", url: `https://example.test/${name}` };
}

/** Manifest rows for every current KML-sourced zone, as the real CSV names them. */
function currentEntries(): ManifestEntry[] {
  return EAIP_RESTRICTED_AREAS.filter((a) => a.geometrySource === "openData49021").map((a) =>
    entry(a.zhName ? `${a.designation}（${a.zhName}）` : a.designation),
  );
}

describe("crossCheck", () => {
  it("matches every current KML-sourced zone and routes circles separately", () => {
    const result = crossCheck(currentEntries());
    expect(result.matched.map(({ area }) => area.designation)).toEqual(
      EAIP_RESTRICTED_AREAS.filter((a) => a.geometrySource === "openData49021").map(
        (a) => a.designation,
      ),
    );
    expect(result.circles.map((a) => a.designation)).toEqual(["DONGSHA", "NANSHA"]);
    expect(result.stale).toEqual([]);
  });

  it("drops manifest zones that are no longer in the eAIP list", () => {
    const abolished = [entry("RCR2（考潭）"), entry("RCR49")];
    const result = crossCheck([...currentEntries(), ...abolished]);
    expect(result.stale.map((e) => e.name)).toEqual(["RCR2（考潭）", "RCR49"]);
    expect(result.matched.some(({ area }) => area.designation === "RCR2")).toBe(false);
  });

  it("ignores the aggregate file and the 東、南沙群島 CAD file", () => {
    const extras = [entry("（總）限航區範圍"), entry("東、南沙群島")];
    const result = crossCheck([...currentEntries(), ...extras]);
    expect(result.ignored.map((e) => e.name)).toEqual(["（總）限航區範圍", "東、南沙群島"]);
  });

  it("fails hard when a current zone has no open-data geometry", () => {
    const withoutRcr16 = currentEntries().filter((e) => !e.name.startsWith("RCR16"));
    expect(() => crossCheck(withoutRcr16)).toThrow(/missing from open-data manifest: RCR16/);
  });
});
