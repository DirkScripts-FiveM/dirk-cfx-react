import { create } from "zustand";
import { registerInitialFetch } from "./fetchNui";

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

// Auto-fetch on module load — runs once, populates the store, and is also
// re-fired via useAutoFetcher() on App mount as a safety net.
registerInitialFetch<FrameworkGroupsBundle>("GET_FRAMEWORK_GROUPS", undefined)
  .then((data) => {
    useFrameworkGroups.setState({
      jobs: Array.isArray(data?.jobs) ? data.jobs : [],
      gangs: Array.isArray(data?.gangs) ? data.gangs : [],
      loaded: true,
    });
  })
  .catch(() => {
    useFrameworkGroups.setState({ loaded: true });
  });

// Helper for components that don't care about the job/gang split.
export function selectAllGroups(state: FrameworkGroupsStore): FrameworkGroup[] {
  return [...state.jobs, ...state.gangs];
}
