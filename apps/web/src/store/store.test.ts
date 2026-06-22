import { afterEach, describe, expect, it } from "vitest";
import { useAppStore } from "./index";
import { INITIAL_VIEW_STATE } from "./mapSlice";

// Smoke test for the store skeleton: verifies the slice composition and the
// selection actions wire up. Real feature tests arrive with M1 logic (turf.js).
afterEach(() => {
  useAppStore.getState().clearSelection();
});

describe("app store", () => {
  it("starts with the Taiwan initial view state and no selection", () => {
    const state = useAppStore.getState();
    expect(state.viewState).toEqual(INITIAL_VIEW_STATE);
    expect(state.selectedZoneId).toBeNull();
  });

  it("selects and clears an advisory zone", () => {
    useAppStore.getState().selectZone("demo-zone-1");
    expect(useAppStore.getState().selectedZoneId).toBe("demo-zone-1");

    useAppStore.getState().clearSelection();
    expect(useAppStore.getState().selectedZoneId).toBeNull();
  });
});
