import { create } from "zustand";
import { createMapSlice, type MapSlice } from "./mapSlice";
import { createSelectionSlice, type SelectionSlice } from "./selectionSlice";

/**
 * Single app store composed of slices (ADR 0007).
 * Convention: one slice per file via createXxxSlice; always read through
 * selectors so subscriptions stay slice-grained and the store never turns
 * into one giant grab-bag.
 */
export type AppState = MapSlice & SelectionSlice;

export const useAppStore = create<AppState>()((...args) => ({
  ...createMapSlice(...args),
  ...createSelectionSlice(...args),
}));
