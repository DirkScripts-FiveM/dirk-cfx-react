import { create } from "zustand";
import { registerInitialFetch } from "../utils/fetchNui";


type localeType = (key: string, ...args: string[]) => string;

type LocalesProps = {
  [key: string]: string;
}

type LocaleStoreProps = {
  locale: localeType;
  locales: LocalesProps;
};


export const localeStore = create<LocaleStoreProps>((set, get) => {
  return {
    locales: {
      "OccupantsDesc": "Here you can view and manage the occupants of your traphouse. These occupants can be used mainly for selling drugs to the NPCs surrounding your traphouse. However they have other uses to so be careful who you add as an occupant.", 
    },
    locale: (key: string, ...args: (string|number)[]): string => {
      const exists = get().locales[key];
      if (!exists){
        // add to a jsonfile called missing_locales.json within src of project 
     
      }
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
})