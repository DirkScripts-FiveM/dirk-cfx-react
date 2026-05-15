// Curated list of GTA V AnimPostFX screen effects passed to AnimpostfxPlay().
// Sourced from https://docs.altv.mp/gta/articles/references/animpost-fx.html
// plus a handful of community-known effects (ULP_*, common cutscene overlays)
// that ship in scene defaults across dirk_multichar / fishing / drug labs.
//
// Effects are grouped by what they're commonly used for so a picker can
// present them with section headings instead of one giant alphabetical list.
// Add new entries by appending to the right group — the picker reflows
// automatically.

export type GtaAnimPostFx = {
  /** Effect name passed to AnimpostfxPlay(). Case-sensitive. */
  name: string;
  /** Friendly label for UI display. Defaults to the name if absent. */
  label?: string;
  /** Group used for ordering and section headers. */
  group: GtaAnimPostFxGroup;
};

export type GtaAnimPostFxGroup =
  | "Wake Up / Sleep"
  | "Character Switch"
  | "Cinematic Push-In"
  | "Death / Fail"
  | "Heist"
  | "Minigame"
  | "Drug / Trip"
  | "Color Filter / Tint"
  | "Multiplayer"
  | "Misc";

export const GTA_ANIM_POST_FX_GROUP_ORDER: GtaAnimPostFxGroup[] = [
  "Wake Up / Sleep",
  "Character Switch",
  "Cinematic Push-In",
  "Death / Fail",
  "Heist",
  "Minigame",
  "Drug / Trip",
  "Color Filter / Tint",
  "Multiplayer",
  "Misc",
];

export const GTA_ANIM_POST_FX: GtaAnimPostFx[] = [
  // ── Wake Up / Sleep (community-known; not in altV docs) ────────────────────
  { name: "ULP_PlayerWakeUp",         label: "Player Wake Up",        group: "Wake Up / Sleep" },
  { name: "MinigameEndNeutral",       label: "Minigame End — Neutral", group: "Wake Up / Sleep" },
  { name: "MinigameEndFranklin",      label: "Minigame End — Franklin", group: "Wake Up / Sleep" },
  { name: "MinigameEndMichael",       label: "Minigame End — Michael", group: "Wake Up / Sleep" },
  { name: "MinigameEndTrevor",        label: "Minigame End — Trevor", group: "Wake Up / Sleep" },

  // ── Character Switch (Franklin / Michael / Trevor / Neutral variants) ─────
  { name: "SwitchHUDIn",              group: "Character Switch" },
  { name: "SwitchHUDOut",             group: "Character Switch" },
  { name: "SwitchHUDFranklinIn",      group: "Character Switch" },
  { name: "SwitchHUDFranklinOut",     group: "Character Switch" },
  { name: "SwitchHUDMichaelIn",       group: "Character Switch" },
  { name: "SwitchHUDMichaelOut",      group: "Character Switch" },
  { name: "SwitchHUDTrevorIn",        group: "Character Switch" },
  { name: "SwitchHUDTrevorOut",       group: "Character Switch" },
  { name: "SwitchOpenFranklin",      group: "Character Switch" },
  { name: "SwitchOpenFranklinIn",    group: "Character Switch" },
  { name: "SwitchOpenFranklinOut",   group: "Character Switch" },
  { name: "SwitchOpenMichaelIn",     group: "Character Switch" },
  { name: "SwitchOpenMichaelMid",    group: "Character Switch" },
  { name: "SwitchOpenMichaelOut",    group: "Character Switch" },
  { name: "SwitchOpenTrevorIn",      group: "Character Switch" },
  { name: "SwitchOpenTrevorOut",     group: "Character Switch" },
  { name: "SwitchOpenNeutralFIB5",   group: "Character Switch" },
  { name: "SwitchOpenNeutralOutHeist", group: "Character Switch" },
  { name: "SwitchSceneFranklin",     group: "Character Switch" },
  { name: "SwitchSceneMichael",      group: "Character Switch" },
  { name: "SwitchSceneNeutral",      group: "Character Switch" },
  { name: "SwitchSceneTrevor",       group: "Character Switch" },
  { name: "SwitchShortFranklinIn",   group: "Character Switch" },
  { name: "SwitchShortFranklinMid",  group: "Character Switch" },
  { name: "SwitchShortMichaelIn",    group: "Character Switch" },
  { name: "SwitchShortMichaelMid",   group: "Character Switch" },
  { name: "SwitchShortNeutralIn",    group: "Character Switch" },
  { name: "SwitchShortNeutralMid",   group: "Character Switch" },
  { name: "SwitchShortTrevorIn",     group: "Character Switch" },
  { name: "SwitchShortTrevorMid",    group: "Character Switch" },
  { name: "switch_cam_1",            group: "Character Switch" },
  { name: "switch_cam_2",            group: "Character Switch" },

  // ── Cinematic Push-In (slow zoom intro to a character) ────────────────────
  { name: "CamPushInFranklin",       group: "Cinematic Push-In" },
  { name: "CamPushInMichael",        group: "Cinematic Push-In" },
  { name: "CamPushInTrevor",         group: "Cinematic Push-In" },
  { name: "CamPushInNeutral",        group: "Cinematic Push-In" },
  { name: "BeastIntroScene",         label: "Beast Intro",           group: "Cinematic Push-In" },
  { name: "BeastLaunch",             group: "Cinematic Push-In" },
  { name: "BeastTransition",         group: "Cinematic Push-In" },

  // ── Death / Fail (red tint, slow-mo blur) ─────────────────────────────────
  { name: "DeathFailNeutralIn",      group: "Death / Fail" },
  { name: "DeathFailFranklinIn",     group: "Death / Fail" },
  { name: "DeathFailMichaelIn",      group: "Death / Fail" },
  { name: "DeathFailTrevorIn",       group: "Death / Fail" },
  { name: "DeathFailMPIn",           label: "Death Fail — MP",       group: "Death / Fail" },
  { name: "DeathFailMPDark",         label: "Death Fail — MP Dark",  group: "Death / Fail" },
  { name: "DeathFailOut",            group: "Death / Fail" },
  { name: "Rampage",                 group: "Death / Fail" },
  { name: "RampageOut",              group: "Death / Fail" },

  // ── Heist (celebration / locate / pass) ───────────────────────────────────
  { name: "HeistCelebEnd",           group: "Heist" },
  { name: "HeistCelebPass",          group: "Heist" },
  { name: "HeistCelebPassBW",        label: "Heist Celeb Pass (B/W)", group: "Heist" },
  { name: "HeistCelebToast",         group: "Heist" },
  { name: "HeistLocate",             group: "Heist" },
  { name: "HeistTripSkipFade",       group: "Heist" },

  // ── Minigame / Menu ───────────────────────────────────────────────────────
  { name: "MenuMGIn",                group: "Minigame" },
  { name: "MenuMGHeistIn",           group: "Minigame" },
  { name: "MenuMGHeistIntro",        group: "Minigame" },
  { name: "MenuMGHeistOut",          group: "Minigame" },
  { name: "MenuMGHeistTint",         group: "Minigame" },
  { name: "MenuMGSelectionIn",       group: "Minigame" },
  { name: "MenuMGSelectionTint",     group: "Minigame" },
  { name: "MenuMGTournamentIn",      group: "Minigame" },
  { name: "MenuMGTournamentTint",    group: "Minigame" },
  { name: "MinigameTransitionIn",    group: "Minigame" },
  { name: "MinigameTransitionOut",   group: "Minigame" },

  // ── Drug / Trip (psychedelic, blur, distortion) ───────────────────────────
  { name: "DMT_flight",              group: "Drug / Trip" },
  { name: "DMT_flight_intro",        group: "Drug / Trip" },
  { name: "PeyoteIn",                group: "Drug / Trip" },
  { name: "PeyoteOut",               group: "Drug / Trip" },
  { name: "PeyoteEndIn",             group: "Drug / Trip" },
  { name: "PeyoteEndOut",            group: "Drug / Trip" },
  { name: "DrugsDrivingIn",          group: "Drug / Trip" },
  { name: "DrugsDrivingOut",         group: "Drug / Trip" },
  { name: "DrugsMichaelAliensFight", group: "Drug / Trip" },
  { name: "DrugsMichaelAliensFightIn", group: "Drug / Trip" },
  { name: "DrugsMichaelAliensFightOut", group: "Drug / Trip" },
  { name: "DrugsTrevorClownsFight",  group: "Drug / Trip" },
  { name: "DrugsTrevorClownsFightIn",group: "Drug / Trip" },
  { name: "DrugsTrevorClownsFightOut", group: "Drug / Trip" },
  { name: "ChopVision",              label: "Chop Vision (dog)",     group: "Drug / Trip" },

  // ── Color Filter / Tint (one-off and biker formation filters) ─────────────
  { name: "PPFilter",                group: "Color Filter / Tint" },
  { name: "PPFilterOut",             group: "Color Filter / Tint" },
  { name: "PPGreen",                 group: "Color Filter / Tint" },
  { name: "PPGreenOut",              group: "Color Filter / Tint" },
  { name: "PPOrange",                group: "Color Filter / Tint" },
  { name: "PPOrangeOut",             group: "Color Filter / Tint" },
  { name: "PPPink",                  group: "Color Filter / Tint" },
  { name: "PPPinkOut",               group: "Color Filter / Tint" },
  { name: "PPPurple",                group: "Color Filter / Tint" },
  { name: "PPPurpleOut",             group: "Color Filter / Tint" },
  { name: "BikerFilter",             group: "Color Filter / Tint" },
  { name: "BikerFilterOut",          group: "Color Filter / Tint" },
  { name: "BikerFormation",          group: "Color Filter / Tint" },
  { name: "BikerFormationOut",       group: "Color Filter / Tint" },
  { name: "InchOrange",              group: "Color Filter / Tint" },
  { name: "InchOrangeOut",           group: "Color Filter / Tint" },
  { name: "InchPurple",              group: "Color Filter / Tint" },
  { name: "InchPurpleOut",           group: "Color Filter / Tint" },
  { name: "InchPickup",              group: "Color Filter / Tint" },
  { name: "InchPickupOut",           group: "Color Filter / Tint" },
  { name: "TinyRacerGreen",          group: "Color Filter / Tint" },
  { name: "TinyRacerGreenOut",       group: "Color Filter / Tint" },
  { name: "TinyRacerPink",           group: "Color Filter / Tint" },
  { name: "TinyRacerPinkOut",        group: "Color Filter / Tint" },
  { name: "TinyRacerIntroCam",       group: "Color Filter / Tint" },
  { name: "DeadlineNeon",            group: "Color Filter / Tint" },

  // ── Multiplayer (celeb, killstreak, race, etc.) ───────────────────────────
  { name: "MP_Celeb_Win",            group: "Multiplayer" },
  { name: "MP_Celeb_Win_Out",        group: "Multiplayer" },
  { name: "MP_Celeb_Lose",           group: "Multiplayer" },
  { name: "MP_Celeb_Lose_Out",       group: "Multiplayer" },
  { name: "MP_Celeb_Preload",        group: "Multiplayer" },
  { name: "MP_Celeb_Preload_Fade",   group: "Multiplayer" },
  { name: "MP_Bull_tost",            group: "Multiplayer" },
  { name: "MP_Bull_tost_Out",        group: "Multiplayer" },
  { name: "MP_Killstreak",           group: "Multiplayer" },
  { name: "MP_Killstreak_Out",       group: "Multiplayer" },
  { name: "MP_Loser_Streak_Out",     group: "Multiplayer" },
  { name: "MP_OrbitalCannon",        group: "Multiplayer" },
  { name: "MP_Powerplay",            group: "Multiplayer" },
  { name: "MP_Powerplay_Out",        group: "Multiplayer" },
  { name: "MP_SmugglerCheckpoint",   group: "Multiplayer" },
  { name: "MP_TransformRaceFlash",   group: "Multiplayer" },
  { name: "MP_WarpCheckpoint",       group: "Multiplayer" },
  { name: "MP_corona_switch",        group: "Multiplayer" },
  { name: "MP_intro_logo",           group: "Multiplayer" },
  { name: "MP_job_load",             group: "Multiplayer" },
  { name: "MP_race_crash",           group: "Multiplayer" },

  // ── Misc (success notifs, special weapons, sniper / pause / explosions) ───
  { name: "SuccessFranklin",         group: "Misc" },
  { name: "SuccessMichael",          group: "Misc" },
  { name: "SuccessNeutral",          group: "Misc" },
  { name: "SuccessTrevor",           group: "Misc" },
  { name: "FocusIn",                 group: "Misc" },
  { name: "FocusOut",                group: "Misc" },
  { name: "CrossLine",               group: "Misc" },
  { name: "CrossLineOut",            group: "Misc" },
  { name: "SniperOverlay",           group: "Misc" },
  { name: "ExplosionJosh3",          group: "Misc" },
  { name: "WeaponUpgrade",           group: "Misc" },
  { name: "Dont_tazeme_bro",         label: "Don't Taze Me Bro",     group: "Misc" },
  { name: "LostTimeDay",             group: "Misc" },
  { name: "LostTimeNight",           group: "Misc" },
  { name: "PauseMenuOut",            group: "Misc" },
  { name: "pennedIn",                group: "Misc" },
  { name: "PennedInOut",             group: "Misc" },
  { name: "RaceTurbo",               group: "Misc" },
  { name: "DefaultFlash",            group: "Misc" },
];

export function formatGtaAnimPostFx(name: string): string {
  const entry = GTA_ANIM_POST_FX.find((fx) => fx.name === name);
  return entry?.label ?? name;
}
