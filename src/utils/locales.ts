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


export const localeStore = create<LocaleStoreProps>((set, get) => {
  return {
    locales: {
      "OccupantsDesc": "Here you can view and manage the occupants of your traphouse. These occupants can be used mainly for selling drugs to the NPCs surrounding your traphouse. However they have other uses to so be careful who you add as an occupant.",
    },
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
  localeStore.setState({ locales: data });
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
    localeStore.setState({ locales: msg.data as LocalesProps });
  });
}