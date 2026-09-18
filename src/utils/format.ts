import { useSettings } from "./useSettings";

/**
 * Money, weight and distance for every dirk UI, in one place.
 *
 * The SETTINGS were already central -- dirk_lib's Basic tab owns `currency`,
 * `weightUnit`, `distanceUnit` and `language`, and hands them to every UI
 * through useSettings. The FUNCTIONS were not: fishing had its own money and
 * weight helpers, multichar grew another, phone and projectCars formatted
 * inline, traphouses showed the symbol but never grouped the digits, and a few
 * of dirk_lib's own screens hardcoded "$". Same server setting, five different
 * readings of it.
 *
 * Everything here reads the settings at call time, so a plain function works
 * anywhere (stores, formatters, callbacks). Components that must re-render
 * when an admin changes a unit mid-session use `useFormat()`.
 */

// ── locale ──────────────────────────────────────────────────────────────────

/**
 * dirk_lib's language codes -> the locale used for digit grouping.
 *
 * Grouping follows the server's language rather than always being en-US:
 * a German server reads 1.272.000, a French one 1 272 000. Getting that right
 * once here is the point of having one formatter.
 */
const LOCALES: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  ja: "ja-JP",
  lt: "lt-LT",
  nl: "nl-NL",
  no: "nb-NO",
  pl: "pl-PL",
  pt: "pt-BR",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
};

function locale(): string {
  const lang = useSettings.getState().language ?? "en";
  return LOCALES[lang] ?? LOCALES[lang.split("-")[0]] ?? "en-US";
}

/** Intl.NumberFormat, falling back to en-US if the runtime rejects a locale. */
function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale(), options);
  } catch {
    return new Intl.NumberFormat("en-US", options);
  }
}

// ── settings, read directly ─────────────────────────────────────────────────

/** The server's currency symbol from /dirk_lib, falling back to "$". */
export const currencySymbol = (): string => useSettings.getState().currency || "$";

/**
 * The server's weight unit. `?? "lb"` because an older dirk_lib does not send
 * it -- fall back rather than assume, and lb is what scripts shipped with.
 */
export const weightUnit = (): "kg" | "lb" => useSettings.getState().weightUnit ?? "lb";

/** The server's distance unit, "m" when an older dirk_lib does not send one. */
export const distanceUnit = (): "m" | "ft" => useSettings.getState().distanceUnit ?? "m";

// ── numbers ─────────────────────────────────────────────────────────────────

export type NumberFormatOptions = {
  /** Most decimal places to show. Default 0. */
  decimals?: number;
  /** Short form: 1.2K, 2.9M. */
  compact?: boolean;
};

/** A plain number, grouped for the server's language. */
export function formatNumber(value: number | null | undefined, options: NumberFormatOptions = {}): string {
  const n = Number(value) || 0;
  const { decimals = 0, compact = false } = options;
  return numberFormat(
    compact
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { maximumFractionDigits: decimals, minimumFractionDigits: 0 },
  ).format(n);
}

// ── money ───────────────────────────────────────────────────────────────────

export type MoneyFormatOptions = NumberFormatOptions & {
  /** Round DOWN to the whole unit instead of to nearest. For prices a player pays. */
  floor?: boolean;
  /** Show negatives as zero. Off by default: debt is information. */
  clampZero?: boolean;
  /** Leave the symbol off, for places that style it separately. Default true. */
  symbol?: boolean;
};

export type MoneyParts = {
  /** "-" for a negative amount, otherwise "". Goes BEFORE the symbol. */
  sign: string;
  symbol: string;
  amount: string;
};

/**
 * Money split into its parts, for UIs that style the symbol differently from
 * the amount (a coloured "$" beside white digits).
 *
 * The sign is its own part and goes before the symbol: "-$76,630", never
 * "$ -76630". A qbx bank balance can go negative, and net worth is where that
 * shows up.
 */
export function formatMoneyParts(value: number | null | undefined, options: MoneyFormatOptions = {}): MoneyParts {
  let n = Number(value) || 0;
  if (options.floor) n = Math.floor(n);
  if (options.clampZero && n < 0) n = 0;
  return {
    sign: n < 0 ? "-" : "",
    symbol: options.symbol === false ? "" : currencySymbol(),
    amount: formatNumber(Math.abs(n), options),
  };
}

/** Money as one string: "$239,350", "-R$76,630", "$2.9M". */
export function formatMoney(value: number | null | undefined, options: MoneyFormatOptions = {}): string {
  const { sign, symbol, amount } = formatMoneyParts(value, options);
  return `${sign}${symbol}${amount}`;
}

// ── weight ──────────────────────────────────────────────────────────────────

const GRAMS_PER_LB = 453.59;

/**
 * A weight given in GRAMS, in the server's unit.
 *
 * lb servers: under a pound shows ounces ("12.3oz"), otherwise pounds
 * ("2.45lb"). kg servers: under a kilo shows grams ("640.0g"), otherwise kilos
 * ("1.20kg"). These are dirk_fishing's rules, which shipped first and read
 * well; every script now gets the same ones.
 */
export function formatWeight(grams: number | null | undefined): string {
  const g = Number(grams) || 0;
  if (weightUnit() === "lb") {
    const lb = g / GRAMS_PER_LB;
    return lb < 1 ? `${(lb * 16).toFixed(1)}oz` : `${lb.toFixed(2)}lb`;
  }
  return g >= 1000 ? `${(g / 1000).toFixed(2)}kg` : `${g.toFixed(1)}g`;
}

// ── distance ────────────────────────────────────────────────────────────────

const FEET_PER_METRE = 3.28084;
const FEET_PER_MILE = 5280;

/**
 * A distance given in METRES, in the server's unit.
 *
 * m servers: "240m", then "1.25km". ft servers: "790ft", then "0.78mi" -- the
 * switch happens at a mile, as a US reader expects.
 */
export function formatDistance(metres: number | null | undefined): string {
  const m = Number(metres) || 0;
  if (distanceUnit() === "ft") {
    const ft = m * FEET_PER_METRE;
    return ft < FEET_PER_MILE
      ? `${formatNumber(ft)}ft`
      : `${formatNumber(ft / FEET_PER_MILE, { decimals: 2 })}mi`;
  }
  return m < 1000 ? `${formatNumber(m)}m` : `${formatNumber(m / 1000, { decimals: 2 })}km`;
}

// ── React ───────────────────────────────────────────────────────────────────

const FORMAT = {
  currencySymbol,
  weightUnit,
  distanceUnit,
  number: formatNumber,
  money: formatMoney,
  moneyParts: formatMoneyParts,
  weight: formatWeight,
  distance: formatDistance,
} as const;

/**
 * The formatters, re-rendering the component when a display setting changes.
 *
 * Each setting is selected on its own, as a primitive, so an admin switching
 * currency or units in /dirk_lib updates open UIs straight away -- and nothing
 * re-renders for settings the formatters do not read.
 */
export function useFormat(): typeof FORMAT {
  useSettings((s) => s.currency);
  useSettings((s) => s.weightUnit);
  useSettings((s) => s.distanceUnit);
  useSettings((s) => s.language);
  return FORMAT;
}
