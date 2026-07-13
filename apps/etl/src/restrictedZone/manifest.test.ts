import { describe, expect, it } from "vitest";
import { designationOf, parseManifest } from "./manifest";

// Mirrors the real CAA CSV: UTF-8 BOM, zh header, one file per zone.
const SAMPLE =
  "﻿名稱,版本,時間,路徑\n" +
  "（總）限航區範圍,107年8月,2018-08-31,https://www.caa.gov.tw/FileAtt.ashx?lang=1&id=5617\n" +
  "RCR16（陽明山）,107年8月,2018-08-31,https://www.caa.gov.tw/FileAtt.ashx?lang=1&id=5608\n" +
  "RCR18A,107年8月,2018-08-31,https://www.caa.gov.tw/FileAtt.ashx?lang=1&id=5606\n" +
  "東、南沙群島,107年8月,2018-08-31,https://www.caa.gov.tw/FileAtt.ashx?lang=1&id=5587\n";

describe("parseManifest", () => {
  it("parses rows and strips the BOM", () => {
    const entries = parseManifest(SAMPLE);
    expect(entries).toHaveLength(4);
    expect(entries[1]).toEqual({
      name: "RCR16（陽明山）",
      version: "107年8月",
      date: "2018-08-31",
      url: "https://www.caa.gov.tw/FileAtt.ashx?lang=1&id=5608",
    });
  });

  it("rejects an unexpected header so format drift fails loudly", () => {
    expect(() => parseManifest("name,version\nfoo,bar")).toThrow(/Unexpected manifest header/);
  });

  it("rejects rows with the wrong column count", () => {
    expect(() => parseManifest("﻿名稱,版本,時間,路徑\nRCR5,107年8月\n")).toThrow(
      /Unexpected manifest row/,
    );
  });
});

describe("designationOf", () => {
  it("extracts plain and lettered designations", () => {
    const entries = parseManifest(SAMPLE);
    expect(designationOf(entries[1])).toBe("RCR16");
    expect(designationOf(entries[2])).toBe("RCR18A");
  });

  it("returns null for the aggregate file and 東、南沙群島", () => {
    const entries = parseManifest(SAMPLE);
    expect(designationOf(entries[0])).toBeNull();
    expect(designationOf(entries[3])).toBeNull();
  });
});
