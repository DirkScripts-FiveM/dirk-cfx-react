/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useMemo, useRef } from "react";
import { createStore, StoreApi, useStore } from "zustand";

/* ======================================================
   Type Utilities
====================================================== */

type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PathValue<T[K], R>
    : never
  : never;

type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? T[K] extends any[] | Date | Function
            ? K
            : K | `${K}.${Paths<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type LoosePaths<T> = Paths<T> | (string & {});

/* ======================================================
   Utilities
====================================================== */

function getNested(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setNested(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : { ...obj };
  let current = root;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const isIndex = !isNaN(Number(nextKey));

    const existing = current[key];

    current[key] =
      existing != null
        ? Array.isArray(existing)
          ? [...existing]
          : { ...existing }
        : isIndex
        ? []
        : {};

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return root;
}

function deleteNested(obj: any, path: string): any {
  const keys = path.split(".");
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) return obj;
    current[key] = { ...current[key] };
    current = current[key];
  }

  delete current[keys[keys.length - 1]];
  return newObj;
}

function isPlainObject(value: any): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function collectChangedPaths(values: any, initial: any, prefix = ""): string[] {
  if (Object.is(values, initial)) return [];

  const valuesIsObj = isPlainObject(values);
  const initialIsObj = isPlainObject(initial);
  const valuesIsArr = Array.isArray(values);
  const initialIsArr = Array.isArray(initial);

  if (valuesIsArr || initialIsArr) {
    const maxLen = Math.max(values?.length ?? 0, initial?.length ?? 0);
    const fields: string[] = [];
    for (let i = 0; i < maxLen; i++) {
      const nextPrefix = prefix ? `${prefix}.${i}` : `${i}`;
      fields.push(...collectChangedPaths(values?.[i], initial?.[i], nextPrefix));
    }
    return fields;
  }

  if (valuesIsObj || initialIsObj) {
    const keys = new Set([
      ...Object.keys(values ?? {}),
      ...Object.keys(initial ?? {}),
    ]);
    const fields: string[] = [];
    for (const key of keys) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      fields.push(...collectChangedPaths(values?.[key], initial?.[key], nextPrefix));
    }
    return fields;
  }

  return prefix ? [prefix] : [];
}

function computeChangedState<T>(
  values: Partial<T>,
  initialVals: Partial<T>
): { fields: string[]; partial: Partial<T> } {
  const fields = collectChangedPaths(values, initialVals);
  let partial: Partial<T> = {};

  for (const path of fields) {
    partial = setNested(partial, path, getNested(values, path));
  }

  return { fields, partial };
}

function flattenRules(
  rules: any,
  prefix = ""
): Record<string, ValidatorFn> {
  const result: Record<string, ValidatorFn> = {};

  for (const key in rules) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const val = rules[key];

    if (typeof val === "function") result[fullPath] = val;
    else if (typeof val === "object")
      Object.assign(result, flattenRules(val, fullPath));
  }

  return result;
}

async function runRule(
  rule: ValidatorFn,
  value: any,
  values: any
): Promise<string | null> {
  const result = rule(value, values);
  return result instanceof Promise ? await result : result;
}

/* ======================================================
   Types
====================================================== */

export type ValidatorFn<T = any> =
  | ((value: any, values: Partial<T>) => string | null)
  | ((value: any, values: Partial<T>) => Promise<string | null>);

export type ValidationRules<T> = {
  [K in keyof T]?: T[K] extends object
    ? ValidationRules<T[K]>
    : ValidatorFn<T>;
};

export type FormState<T> = {
  values: Partial<T>;
  initialValues: Partial<T>;
  errors: Record<string, string>;

  partialChanged: Partial<T>;

  getInputProps: (path: string) => {
    value: any;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };

  setValue: (path: string, value: any, options?: { validate?: boolean }) => void;
  setInitialValues: (newInitialValues: Partial<T>) => void;

  setError: (path: string, message: string) => void;
  clearError: (path: string) => void;

  validate: () => Promise<boolean>;
  validateField: (path: string) => Promise<boolean>;

  reset: () => void;
  reinitialize: (newValues: Partial<T>) => void;

  back: () => void;
  forward: () => void;
  canBack: boolean;
  canForward: boolean;

  changedFields: string[];
  changedCount: number;
  resetChangeCount: () => void;

  onSubmit?: (form: FormState<T>) => void;
  submit: () => Promise<void>;
};

/* ======================================================
   Store
====================================================== */

export function createFormStore<T>(
  initialValues: Partial<T>,
  validationRules?: ValidationRules<T>,
  onSubmit?: (form: FormState<T>) => void
) {
  const flatRules = validationRules ? flattenRules(validationRules) : {};

  const history: Partial<T>[] = [];
  const future: Partial<T>[] = [];
  const changed = new Set<string>();

  return createStore<FormState<T>>((set, get) => ({
    initialValues,
    values: initialValues,
    errors: {},
    partialChanged: {},
    canBack: false,
    canForward: false,
    changedFields: [],
    changedCount: 0,
    onSubmit,

    submit: async () => {
      const state = get();
      const isValid = await state.validate();
      if (isValid && state.onSubmit) {
        state.onSubmit(get());
      }
    },

    getInputProps: (path: string) => {
      return {
        value: getNested(get().values, path) ?? "",
        error: get().errors[path],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          get().setValue(path, e.target.value, { validate: true });
        },
      };
    },

    resetChangeCount: () => {
      changed.clear();
      set({ changedFields: [], changedCount: 0, partialChanged: {} });
    },

    setInitialValues: (newInitialValues) =>
      set({ initialValues: newInitialValues }),

    setValue: (path, value, options) => {
      const state = get();
      const currentValues = state.values;
      const newValues = setNested(currentValues, path, value);

      const oldValue = getNested(state.initialValues, path);
      const hasChanged = value !== oldValue;

      history.push(currentValues);
      future.length = 0;

      let newPartial = state.partialChanged;

      if (hasChanged) {
        changed.add(path);
        newPartial = setNested(newPartial, path, value);
      } else {
        changed.delete(path);
        newPartial = deleteNested(newPartial, path);
      }

      set({
        values: newValues,
        partialChanged: newPartial,
        canBack: history.length > 0,
        canForward: false,
        changedFields: Array.from(changed),
        changedCount: changed.size,
      });

      if (!options?.validate) return;

      const rule = flatRules[path];
      if (!rule) return;

      Promise.resolve(runRule(rule, value, newValues)).then((error) => {
        if (error)
          set((s) => ({ errors: setNested(s.errors, path, error) }));
        else
          set((s) => ({ errors: deleteNested(s.errors, path) }));
      });
    },

    setError: (path, message) =>
      set((s) => ({ errors: setNested(s.errors, path, message) })),

    clearError: (path) =>
      set((s) => ({ errors: deleteNested(s.errors, path) })),

    validateField: async (path) => {
      const state = get();
      const rule = flatRules[path];
      if (!rule) return true;

      const value = getNested(state.values, path);
      const error = await runRule(rule, value, state.values);

      if (error) {
        set((s) => ({ errors: setNested(s.errors, path, error) }));
        return false;
      }

      set((s) => ({ errors: deleteNested(s.errors, path) }));
      return true;
    },

    validate: async () => {
      const state = get();
      let isValid = true;
      let newErrors: Record<string, string> = {};

      for (const path in flatRules) {
        const rule = flatRules[path];
        const value = getNested(state.values, path);
        const error = await runRule(rule, value, state.values);

        if (error) {
          isValid = false;
          newErrors = setNested(newErrors, path, error);
        }
      }

      set({ errors: newErrors });
      return isValid;
    },

    reset: () => {
      history.length = 0;
      future.length = 0;
      changed.clear();

      set({
        values: get().initialValues,
        errors: {},
        partialChanged: {},
        canBack: false,
        canForward: false,
        changedFields: [],
        changedCount: 0,
      });
    },

    reinitialize: (newValues) => {
      history.length = 0;
      future.length = 0;
      changed.clear();

      set({
        values: newValues,
        initialValues: newValues,
        errors: {},
        partialChanged: {},
        canBack: false,
        canForward: false,
        changedFields: [],
        changedCount: 0,
      });
    },

    back: () => {
      if (!history.length) return;

      const prev = history.pop()!;
      future.push(get().values);

      const { fields, partial } = computeChangedState(prev, get().initialValues);

      set({
        values: prev,
        partialChanged: partial,
        canBack: history.length > 0,
        canForward: true,
        changedFields: fields,
        changedCount: fields.length,
      });
    },

    forward: () => {
      if (!future.length) return;

      const next = future.pop()!;
      history.push(get().values);

      const { fields, partial } = computeChangedState(next, get().initialValues);

      set({
        values: next,
        partialChanged: partial,
        canBack: true,
        canForward: future.length > 0,
        changedFields: fields,
        changedCount: fields.length,
      });
    },
  }));
}

/* ======================================================
   Context + Hook
====================================================== */

const FormContext = createContext<StoreApi<FormState<any>> | null>(null);

export function FormProvider<T>({
  initialValues,
  validate,
  onSubmit,
  children,
}: {
  initialValues: Partial<T>;
  validate?: ValidationRules<T>;
  onSubmit?: (form: FormState<T>) => void;
  children: React.ReactNode;
}) {
  const storeRef = useRef(
    createFormStore<T>(initialValues, validate, onSubmit)
  );

  return (
    <FormContext.Provider value={storeRef.current}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm<T>() {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useForm must be used inside <FormProvider>");
  }
  const state = useStore(store) as FormState<T>;

  const changedFields = useMemo(() => {
    return collectChangedPaths(state.values, state.initialValues);
  }, [state.values, state.initialValues]);

  return { ...state, changedFields, changedCount: changedFields.length } as FormState<T>;
}

export function useFormField<T, P extends LoosePaths<T> = LoosePaths<T>>(
  path: P
): P extends Paths<T> ? PathValue<T, P> | undefined : any {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useFormField must be used inside <FormProvider>");
  }
  return useStore(store, (s) => getNested(s.values, path));
}

export function useFormFields<T, P extends LoosePaths<T> = LoosePaths<T>>(
  ...paths: P[]
): { [K in P]: K extends Paths<T> ? PathValue<T, K> | undefined : any } {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useFormFields must be used inside <FormProvider>");
  }
  
  return useStore(store, (s) => {
    const result = {} as { [K in P]: K extends Paths<T> ? PathValue<T, K> | undefined : any };
    for (const path of paths) {
      result[path] = getNested(s.values, path);
    }
    return result;
  });
}

export function useFormError(path: string) {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useFormError must be used inside <FormProvider>");
  }
  return useStore(store, (s) => s.errors[path]);
}

export function useFormErrors(...paths: string[]) {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useFormErrors must be used inside <FormProvider>");
  }
  return useStore(store, (s) => {
    const result: Record<string, string | undefined> = {};
    for (const path of paths) {
      result[path] = s.errors[path];
    }
    return result;
  });
}

export function useFormActions<T>() {
  const store = useContext(FormContext);
  if (!store) {
    throw new Error("useFormActions must be used inside <FormProvider>");
  }
  return store.getState() as Pick<
    FormState<T>,
    | "setValue"
    | "setError"
    | "clearError"
    | "validate"
    | "validateField"
    | "reset"
    | "reinitialize"
    | "back"
    | "forward"
    | "canBack"
    | "canForward"
    | "submit"
  >;
}