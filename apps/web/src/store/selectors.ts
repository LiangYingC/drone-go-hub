import { useAppStore } from "./index";

/** Selector hooks: subscribe at slice granularity; the only conventional way to read the store. */
export const useViewState = () => useAppStore((s) => s.viewState);
export const useSelectedZoneId = () => useAppStore((s) => s.selectedZoneId);
