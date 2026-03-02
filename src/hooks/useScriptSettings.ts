

// This is a function that you will call and it will return liek so 
// const {useScriptSettings, useScriptSettingHooks} = createScriptSettings<YourTypeHere>({
//   key1: 'your_unique_value1',
//   key2: {}
//     subKey1: 'your_unique_value2',
//     subKey2: 'your_unique_value3'
//   }
// })

import { useNuiEvent } from "@/hooks";
import { fetchNui } from "@/utils";
import { create } from "zustand";
type NuiResponse = { success: boolean; message: string };

// it will basically rturn a zustand store aswell as aset of hooks required to operate/update this store 
export function createScriptSettings<T>(defaultValue: T) {
  const store = create<T>(() => defaultValue);

  const useScriptSettingHooks = () => {
    useNuiEvent<Partial<T>>("UPDATE_SCRIPT_SETTINGS", (newSettings) => {
      store.setState((prev) => ({ ...prev, ...newSettings }));
    });
  };

  // below returns {success, message} from the nui event

  const updateScriptSettings = async (newSettings: Partial<T>): Promise<NuiResponse> => {
    store.setState((prev) => ({ ...prev, ...newSettings }));
    return await fetchNui<NuiResponse>("UPDATE_SCRIPT_SETTINGS", newSettings);
  };

  return {store, updateScriptSettings, useScriptSettingHooks}
} 


