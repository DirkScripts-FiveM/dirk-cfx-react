import { create } from "zustand";
import { fetchNui } from "./fetchNui";

// Bellow function will create a zustand store and return it like normal but we will do a fetch in there first to fill default 
export const createStaticStore = <T extends object>(
  filePath: string,
  storeInitializer: (set: (partial: T | ((state: T) => T)) => void, get: () => T) => T
) => {
  const useStore = create<T>((set, get) => {
    // Initial empty state  
    const data = fetchNui<Partial<T>>('GET_STATIC_STORE_DATA', { filePath }).then((fetchedData) => {
      // Once data is fetched, we set it in the store
      set({ ...fetchedData } as T);
    }).catch(() => {});
    const initialState = {} as T;

    return {
      ...initialState,
      ...storeInitializer(set, get),
    };
  });

  return useStore;
};

// Example usage:
// type StoreProps = {
//   animals: any[];
// };

// export const useAnimals = createStaticStore<StoreProps>('settings.basic', (set) => ({
//   animals: [],
//   setAnimals: (animals: any[]) => set({ animals }),
// }));
