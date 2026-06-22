import type { StateCreator } from "zustand";
import type { AppState } from "./index";

/** Map camera state (ADR 0003: viewState is shared state across components). */
export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface MapSlice {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
}

/** Initial camera framing the main island of Taiwan. */
export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 120.96,
  latitude: 23.8,
  zoom: 7,
  pitch: 0,
  bearing: 0,
};

export const createMapSlice: StateCreator<AppState, [], [], MapSlice> = (set) => ({
  // Copy so the store owns its state: external in-place mutation can't alias the
  // exported constant (or a caller's object) and silently skip subscriber updates.
  viewState: { ...INITIAL_VIEW_STATE },
  setViewState: (viewState) => set({ viewState: { ...viewState } }),
});
