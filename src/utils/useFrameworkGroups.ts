import { create } from "zustand";
import { fetchNui } from "./fetchNui";

// Shape mirrors lib.framework.Group / lib.framework.Grade in dirk_lib.
// payment is QB/qbx `payment` ⊕ ESX `salary`; nil on ND core.
// bankAuth is qbx-native; defaults to isBoss on frameworks without it.
export type FrameworkGrade = {
  grade: number;
  name: string;
  label: string;
  payment?: number;
  isBoss: boolean;
  bankAuth: boolean;
};

export type FrameworkGroup = {
  name: string;
  label: string;
  type: "job" | "gang";
  category?: string;
  whitelisted?: boolean;
  defaultDuty?: boolean;
  offDutyPay?: boolean;
  grades: FrameworkGrade[];
};

type FrameworkGroupsBundle = {
  jobs: FrameworkGroup[];
  gangs: FrameworkGroup[];
};

type FrameworkGroupsStore = FrameworkGroupsBundle & {
  loaded: boolean;
};

export const useFrameworkGroups = create<FrameworkGroupsStore>(() => ({
  jobs: [],
  gangs: [],
  loaded: false,
}));

// Lazy fetch — only fires when a group picker actually mounts (GroupName /
// GroupRank call ensureFrameworkGroups() in an effect). This used to run at
// module load in EVERY consumer NUI, so every player hit the
// dirk_lib:getFrameworkGroups server callback on resource start even when no
// group picker was ever shown — pure wasted work for gameplay-only UIs.
//
// `frameworkGroupsRequested` is a module-scoped (shared, singleton) guard set
// synchronously before the await, so any number of pickers mounting at once
// collapse to a SINGLE round-trip. On success it stays set (never refetches).
// On failure it is reset so a later picker-mount can retry a transient error;
// picker mounts are sparse + user-driven, so this can't spam the callback.
let frameworkGroupsRequested = false;
export function ensureFrameworkGroups(): void {
  if (frameworkGroupsRequested) return;
  frameworkGroupsRequested = true;
  fetchNui<FrameworkGroupsBundle>("GET_FRAMEWORK_GROUPS", undefined)
    .then((data) => {
      useFrameworkGroups.setState({
        jobs: Array.isArray(data?.jobs) ? data.jobs : [],
        gangs: Array.isArray(data?.gangs) ? data.gangs : [],
        loaded: true,
      });
    })
    .catch(() => {
      frameworkGroupsRequested = false; // allow a later picker-mount to retry
      useFrameworkGroups.setState({ loaded: true });
    });
}

// Helper for components that don't care about the job/gang split.
export function selectAllGroups(state: FrameworkGroupsStore): FrameworkGroup[] {
  return [...state.jobs, ...state.gangs];
}
