import type { StateCreator } from "zustand";
import type { AppState } from "./index";

/** The clicked advisory zone -> drives the info card (an initial shared state, ADR 0007). */
export interface SelectionSlice {
  selectedZoneId: string | null;
  selectZone: (id: string) => void;
  clearSelection: () => void;
}

export const createSelectionSlice: StateCreator<AppState, [], [], SelectionSlice> = (set) => ({
  selectedZoneId: null,
  // Return the same state when unchanged so Zustand skips the no-op notify.
  selectZone: (id) => set((s) => (s.selectedZoneId === id ? s : { selectedZoneId: id })),
  clearSelection: () => set((s) => (s.selectedZoneId === null ? s : { selectedZoneId: null })),
});
