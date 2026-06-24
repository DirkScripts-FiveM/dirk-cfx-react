import { create } from "zustand";
import { fetchNui, registerInitialFetch } from "../utils/fetchNui";


type localeType = (key: string, ...args: string[]) => string;

type LocalesProps = {
  [key: string]: string;
}

type LocaleStoreProps = {
  locale: localeType;
  locales: LocalesProps;
};

const reportedMissing = new Set<string>();
function reportMissingLocale(key: string) {
  if (!key || reportedMissing.has(key)) return;
  reportedMissing.add(key);
  fetchNui('REPORT_MISSING_LOCALE', { key }).catch(() => {});
}


// Package-level locale defaults for dirk-cfx-react's own chrome (the ConfigPanel
// buttons, modals, etc.). Merged UNDER the consumer's locale dict on every
// load/update, so a consumer that doesn't define these keys still renders
// English (never the raw key), and any consumer CAN override them (e.g. a
// Spanish es.json that provides the same keys).
const PACKAGE_DEFAULTS: LocalesProps = {
  "OccupantsDesc": "Here you can view and manage the occupants of your traphouse. These occupants can be used mainly for selling drugs to the NPCs surrounding your traphouse. However they have other uses to so be careful who you add as an occupant.",
  "cfgpanel_discard": "Discard",
  "cfgpanel_manual_edit": "Manual Edit",
  "cfgpanel_reset_defaults": "Reset Defaults",
  "cfgpanel_version": "Version",
  "cfgpanel_back_title": "Back to script list",
  "cfgpanel_undo": "Undo",
  "cfgpanel_redo": "Redo",
  "cfgpanel_save": "Save",
  "cfgpanel_saving": "Saving...",
  "cfgpanel_history": "History",
  "cfgpanel_reset_title": "Reset to Defaults",
  "cfgpanel_reset_desc": "This will permanently reset ALL config back to the defaults. Every value you have configured will be overwritten. This cannot be undone.",
  "cfgpanel_reset_confirm": "Reset Config",
  "cfgpanel_discard_title": "Discard Unsaved Changes?",
  "cfgpanel_discard_desc_back": "You have unsaved changes. Going back now will discard them.",
  "cfgpanel_discard_desc_close": "You have unsaved changes. Closing now will discard them.",
  "cfgpanel_discard_confirm_back": "Go Back Without Saving",
  "cfgpanel_discard_confirm_close": "Close Without Saving",
  "cfgpanel_json_title": "Config JSON",
  "cfgpanel_cancel": "Cancel",
  "cfgpanel_apply": "Apply",
  "cfgpanel_history_title": "Config History",
  "cfgpanel_close": "Close",
};

export const localeStore = create<LocaleStoreProps>((set, get) => {
  return {
    locales: { ...PACKAGE_DEFAULTS },
    locale: (key: string, ...args: (string|number)[]): string => {
      const exists = get().locales[key];
      if (!exists) reportMissingLocale(key);
      let translation = exists || key;
      if (args.length) {
        // convert the arg to a string and replace the %s in the translation
  

        translation = translation.replace(/%s/g, () => String(args.shift() || ''));
      }
      return translation;
    },
  };
});

// export locale as a standalone function
export const locale = localeStore.getState().locale;

registerInitialFetch<LocalesProps>('GET_LOCALES', undefined).then((data) => {
  localeStore.setState({ locales: { ...PACKAGE_DEFAULTS, ...data } });
}).catch(() => {})

// dirk_lib broadcasts UPDATE_DIRK_LIB_LOCALES whenever an admin changes the
// `language` setting, so the dict updates live without a resource restart.
if (typeof window !== "undefined") {
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg || msg.action !== "UPDATE_DIRK_LIB_LOCALES") return;
    if (!msg.data || typeof msg.data !== "object") return;
    // Defensive: never overwrite a populated dict with an empty one. dirk_lib
    // and consumer dui.lua listeners can both fire mid-table.wipe/repopulate
    // inside lib.locale(), and a stray {} broadcast would silently snap the
    // whole NUI back to raw keys (e.g. "ModifyRod" instead of the translation).
    if (Object.keys(msg.data).length === 0) return;
    localeStore.setState({ locales: { ...PACKAGE_DEFAULTS, ...(msg.data as LocalesProps) } });
  });
}