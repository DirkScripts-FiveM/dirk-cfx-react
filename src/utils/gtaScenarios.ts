// Curated list of GTA V scenario identifiers passed to
// TaskStartScenarioInPlace / TaskStartScenarioAtPosition. Sourced from
// https://wiki.rage.mp/wiki/Scenarios via the DurtyFree gta-v-data-dumps
// mirror (scenariosCompact.json).
//
// Scenarios are grouped by what the ped is *doing* so a picker can present
// section headings instead of one giant alphabetical list of ~250 entries.
// Add new entries by appending to the right group — the picker reflows
// automatically. Group order = the order they appear in a dropdown.

export type GtaScenario = {
  /** Scenario identifier passed to the TaskStartScenario* natives. Case-sensitive. */
  name: string;
  /** Friendly label for UI display. Falls back to the auto-formatted name. */
  label?: string;
  /** Group used for ordering and section headers. */
  group: GtaScenarioGroup;
};

export type GtaScenarioGroup =
  | "Sitting"
  | "Standing & Idle"
  | "Eating & Drinking"
  | "Smoking & Substances"
  | "Working"
  | "Sports & Fitness"
  | "Cops & Security"
  | "Crime & Streets"
  | "Tourists & Crowds"
  | "Props (Misc)"
  | "Movement"
  | "Animals"
  | "Vehicles"
  | "Code (Advanced)";

export const GTA_SCENARIO_GROUP_ORDER: GtaScenarioGroup[] = [
  "Sitting",
  "Standing & Idle",
  "Eating & Drinking",
  "Smoking & Substances",
  "Working",
  "Sports & Fitness",
  "Cops & Security",
  "Crime & Streets",
  "Tourists & Crowds",
  "Props (Misc)",
  "Movement",
  "Animals",
  "Vehicles",
  "Code (Advanced)",
];

export const GTA_SCENARIOS: GtaScenario[] = [
  // ── Sitting ────────────────────────────────────────────────────────────────
  { name: "PROP_HUMAN_SEAT_ARMCHAIR",                       group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BAR",                            group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BENCH",                          group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BENCH_FACILITY",                 group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BENCH_DRINK",                    group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BENCH_DRINK_FACILITY",           group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BENCH_DRINK_BEER",               group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BENCH_FOOD",                     group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BENCH_FOOD_FACILITY",            group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_BUS_STOP_WAIT",                  group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_CHAIR",                          group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_CHAIR_DRINK",                    group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_CHAIR_DRINK_BEER",               group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_CHAIR_FOOD",                     group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_CHAIR_UPRIGHT",                  group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_CHAIR_UPRIGHT_SHOWROOM",         group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_CHAIR_MP_PLAYER",                group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_COMPUTER",                       group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_COMPUTER_LOW",                   group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_DECKCHAIR",                      group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_DECKCHAIR_DRINK",                group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_SEWING",                         group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_STRIP_WATCH",                    group: "Sitting" },
  { name: "PROP_HUMAN_SEAT_SUNLOUNGER",                     group: "Sitting" },
  { name: "WORLD_HUMAN_SEAT_LEDGE",                         group: "Sitting" },
  { name: "WORLD_HUMAN_SEAT_LEDGE_EATING",                  group: "Sitting" },
  { name: "WORLD_HUMAN_SEAT_STEPS",                         group: "Sitting" },
  { name: "WORLD_HUMAN_SEAT_WALL",                          group: "Sitting" },
  { name: "WORLD_HUMAN_SEAT_WALL_EATING",                   group: "Sitting" },
  { name: "WORLD_HUMAN_SEAT_WALL_TABLET",                   group: "Sitting" },

  // ── Standing & Idle ────────────────────────────────────────────────────────
  { name: "Standing",                                       group: "Standing & Idle" },
  { name: "WORLD_HUMAN_HANG_OUT_STREET",                    group: "Standing & Idle" },
  { name: "WORLD_HUMAN_HANG_OUT_STREET_CLUBHOUSE",          group: "Standing & Idle" },
  { name: "WORLD_HUMAN_LEANING",                            group: "Standing & Idle" },
  { name: "WORLD_HUMAN_LEANING_CASINO_TERRACE",             group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_IMPATIENT",                    group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_IMPATIENT_CLUBHOUSE",          group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_IMPATIENT_FACILITY",           group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT",            group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT_FACILITY",   group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_MOBILE",                       group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_MOBILE_CLUBHOUSE",             group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_MOBILE_FACILITY",              group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_MOBILE_UPRIGHT",               group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_MOBILE_UPRIGHT_CLUBHOUSE",     group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_FIRE",                         group: "Standing & Idle" },
  { name: "WORLD_HUMAN_STAND_FISHING",                      group: "Standing & Idle" },
  { name: "PROP_HUMAN_STAND_IMPATIENT",                     group: "Standing & Idle" },

  // ── Eating & Drinking ──────────────────────────────────────────────────────
  { name: "WORLD_HUMAN_DRINKING",                           group: "Eating & Drinking" },
  { name: "WORLD_HUMAN_DRINKING_FACILITY",                  group: "Eating & Drinking" },
  { name: "WORLD_HUMAN_DRINKING_CASINO_TERRACE",            group: "Eating & Drinking" },
  { name: "WORLD_HUMAN_PICNIC",                             group: "Eating & Drinking" },

  // ── Smoking & Substances ───────────────────────────────────────────────────
  { name: "WORLD_HUMAN_AA_COFFEE",                          group: "Smoking & Substances" },
  { name: "WORLD_HUMAN_AA_SMOKE",                           group: "Smoking & Substances" },
  { name: "WORLD_HUMAN_SMOKING",                            group: "Smoking & Substances" },
  { name: "WORLD_HUMAN_SMOKING_CLUBHOUSE",                  group: "Smoking & Substances" },
  { name: "WORLD_HUMAN_SMOKING_POT",                        group: "Smoking & Substances" },
  { name: "WORLD_HUMAN_SMOKING_POT_CLUBHOUSE",              group: "Smoking & Substances" },
  { name: "WORLD_HUMAN_STUPOR",                             group: "Smoking & Substances" },
  { name: "WORLD_HUMAN_STUPOR_CLUBHOUSE",                   group: "Smoking & Substances" },

  // ── Working ────────────────────────────────────────────────────────────────
  { name: "WORLD_HUMAN_CAR_PARK_ATTENDANT",                 group: "Working" },
  { name: "WORLD_HUMAN_CLIPBOARD",                          group: "Working" },
  { name: "WORLD_HUMAN_CLIPBOARD_FACILITY",                 group: "Working" },
  { name: "WORLD_HUMAN_CONST_DRILL",                        group: "Working" },
  { name: "WORLD_HUMAN_GARDENER_LEAF_BLOWER",               group: "Working" },
  { name: "WORLD_HUMAN_GARDENER_PLANT",                     group: "Working" },
  { name: "WORLD_HUMAN_HAMMERING",                          group: "Working" },
  { name: "WORLD_HUMAN_JANITOR",                            group: "Working" },
  { name: "WORLD_HUMAN_MAID_CLEAN",                         group: "Working" },
  { name: "WORLD_HUMAN_MUSICIAN",                           group: "Working" },
  { name: "WORLD_HUMAN_VALET",                              group: "Working" },
  { name: "WORLD_HUMAN_VEHICLE_MECHANIC",                   group: "Working" },
  { name: "WORLD_HUMAN_WELDING",                            group: "Working" },

  // ── Sports & Fitness ───────────────────────────────────────────────────────
  { name: "WORLD_HUMAN_GOLF_PLAYER",                        group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_HIKER",                              group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_HIKER_STANDING",                     group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_JOG",                                group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_JOG_STANDING",                       group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_MUSCLE_FLEX",                        group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_MUSCLE_FREE_WEIGHTS",                group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_POWER_WALKER",                       group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_PUSH_UPS",                           group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_SIT_UPS",                            group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_SUNBATHE",                           group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_SUNBATHE_BACK",                      group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_SWIMMING",                           group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_TENNIS_PLAYER",                      group: "Sports & Fitness" },
  { name: "WORLD_HUMAN_YOGA",                               group: "Sports & Fitness" },
  { name: "PROP_HUMAN_MUSCLE_CHIN_UPS",                     group: "Sports & Fitness" },
  { name: "PROP_HUMAN_MUSCLE_CHIN_UPS_ARMY",                group: "Sports & Fitness" },
  { name: "PROP_HUMAN_MUSCLE_CHIN_UPS_PRISON",              group: "Sports & Fitness" },
  { name: "PROP_HUMAN_SEAT_MUSCLE_BENCH_PRESS",             group: "Sports & Fitness" },
  { name: "PROP_HUMAN_SEAT_MUSCLE_BENCH_PRESS_PRISON",      group: "Sports & Fitness" },

  // ── Cops & Security ────────────────────────────────────────────────────────
  { name: "WORLD_HUMAN_COP_IDLES",                          group: "Cops & Security" },
  { name: "WORLD_HUMAN_GUARD_PATROL",                       group: "Cops & Security" },
  { name: "WORLD_HUMAN_GUARD_STAND",                        group: "Cops & Security" },
  { name: "WORLD_HUMAN_GUARD_STAND_CASINO",                 group: "Cops & Security" },
  { name: "WORLD_HUMAN_GUARD_STAND_CLUBHOUSE",              group: "Cops & Security" },
  { name: "WORLD_HUMAN_GUARD_STAND_FACILITY",               group: "Cops & Security" },
  { name: "WORLD_HUMAN_GUARD_STAND_ARMY",                   group: "Cops & Security" },
  { name: "WORLD_HUMAN_SECURITY_SHINE_TORCH",               group: "Cops & Security" },

  // ── Crime & Streets ────────────────────────────────────────────────────────
  { name: "WORLD_HUMAN_DRUG_DEALER",                        group: "Crime & Streets" },
  { name: "WORLD_HUMAN_DRUG_DEALER_HARD",                   group: "Crime & Streets" },
  { name: "WORLD_HUMAN_DRUG_FIELD_WORKERS_RAKE",            group: "Crime & Streets" },
  { name: "WORLD_HUMAN_DRUG_FIELD_WORKERS_WEEDING",         group: "Crime & Streets" },
  { name: "WORLD_HUMAN_DRUG_PROCESSORS_COKE",               group: "Crime & Streets" },
  { name: "WORLD_HUMAN_DRUG_PROCESSORS_WEED",               group: "Crime & Streets" },
  { name: "WORLD_HUMAN_PROSTITUTE_HIGH_CLASS",              group: "Crime & Streets" },
  { name: "WORLD_HUMAN_PROSTITUTE_LOW_CLASS",               group: "Crime & Streets" },
  { name: "WORLD_HUMAN_BUM_FREEWAY",                        group: "Crime & Streets" },
  { name: "WORLD_HUMAN_BUM_SLUMPED",                        group: "Crime & Streets" },
  { name: "WORLD_HUMAN_BUM_STANDING",                       group: "Crime & Streets" },
  { name: "WORLD_HUMAN_BUM_WASH",                           group: "Crime & Streets" },
  { name: "PROP_HUMAN_BUM_BIN",                             group: "Crime & Streets" },
  { name: "PROP_HUMAN_BUM_SHOPPING_CART",                   group: "Crime & Streets" },

  // ── Tourists & Crowds ──────────────────────────────────────────────────────
  { name: "WORLD_HUMAN_BINOCULARS",                         group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_CHEERING",                           group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_HUMAN_STATUE",                       group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_INSPECT_CROUCH",                     group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_INSPECT_STAND",                      group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_MOBILE_FILM_SHOCKING",               group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_PAPARAZZI",                          group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_PARTYING",                           group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_STRIP_WATCH_STAND",                  group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_SUPERHERO",                          group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_TOURIST_MAP",                        group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_TOURIST_MOBILE",                     group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_WINDOW_SHOP_BROWSE",                 group: "Tourists & Crowds" },
  { name: "WORLD_HUMAN_WINDOW_SHOP_BROWSE_SHOWROOM",        group: "Tourists & Crowds" },

  // ── Props (Misc) ───────────────────────────────────────────────────────────
  { name: "PROP_HUMAN_ATM",                                 group: "Props (Misc)" },
  { name: "PROP_HUMAN_BBQ",                                 group: "Props (Misc)" },
  { name: "PROP_HUMAN_PARKING_METER",                       group: "Props (Misc)" },
  { name: "PROP_HUMAN_MOVIE_BULB",                          group: "Props (Misc)" },
  { name: "PROP_HUMAN_MOVIE_STUDIO_LIGHT",                  group: "Props (Misc)" },
  { name: "PROP_BIRD_IN_TREE",                              group: "Props (Misc)" },
  { name: "PROP_BIRD_TELEGRAPH_POLE",                       group: "Props (Misc)" },

  // ── Movement ───────────────────────────────────────────────────────────────
  { name: "Walk",                                           group: "Movement" },
  { name: "Walk_Facility",                                  group: "Movement" },

  // ── Animals ────────────────────────────────────────────────────────────────
  { name: "WORLD_BOAR_GRAZING",                             group: "Animals" },
  { name: "WORLD_CAT_SLEEPING_GROUND",                      group: "Animals" },
  { name: "WORLD_CAT_SLEEPING_LEDGE",                       group: "Animals" },
  { name: "WORLD_COW_GRAZING",                              group: "Animals" },
  { name: "WORLD_COYOTE_HOWL",                              group: "Animals" },
  { name: "WORLD_COYOTE_REST",                              group: "Animals" },
  { name: "WORLD_COYOTE_WANDER",                            group: "Animals" },
  { name: "WORLD_COYOTE_WALK",                              group: "Animals" },
  { name: "WORLD_CHICKENHAWK_FEEDING",                      group: "Animals" },
  { name: "WORLD_CHICKENHAWK_STANDING",                     group: "Animals" },
  { name: "WORLD_CORMORANT_STANDING",                       group: "Animals" },
  { name: "WORLD_CROW_FEEDING",                             group: "Animals" },
  { name: "WORLD_CROW_STANDING",                            group: "Animals" },
  { name: "WORLD_DEER_GRAZING",                             group: "Animals" },
  { name: "WORLD_DOG_BARKING_ROTTWEILER",                   group: "Animals" },
  { name: "WORLD_DOG_BARKING_RETRIEVER",                    group: "Animals" },
  { name: "WORLD_DOG_BARKING_SHEPHERD",                     group: "Animals" },
  { name: "WORLD_DOG_BARKING_SMALL",                        group: "Animals" },
  { name: "WORLD_DOG_SITTING_ROTTWEILER",                   group: "Animals" },
  { name: "WORLD_DOG_SITTING_RETRIEVER",                    group: "Animals" },
  { name: "WORLD_DOG_SITTING_SHEPHERD",                     group: "Animals" },
  { name: "WORLD_DOG_SITTING_SMALL",                        group: "Animals" },
  { name: "WORLD_DOLPHIN_SWIM",                             group: "Animals" },
  { name: "WORLD_FISH_FLEE",                                group: "Animals" },
  { name: "WORLD_FISH_IDLE",                                group: "Animals" },
  { name: "WORLD_GULL_FEEDING",                             group: "Animals" },
  { name: "WORLD_GULL_STANDING",                            group: "Animals" },
  { name: "WORLD_HEN_FLEE",                                 group: "Animals" },
  { name: "WORLD_HEN_PECKING",                              group: "Animals" },
  { name: "WORLD_HEN_STANDING",                             group: "Animals" },
  { name: "WORLD_MOUNTAIN_LION_REST",                       group: "Animals" },
  { name: "WORLD_MOUNTAIN_LION_WANDER",                     group: "Animals" },
  { name: "WORLD_ORCA_SWIM",                                group: "Animals" },
  { name: "WORLD_PIG_GRAZING",                              group: "Animals" },
  { name: "WORLD_PIGEON_FEEDING",                           group: "Animals" },
  { name: "WORLD_PIGEON_STANDING",                          group: "Animals" },
  { name: "WORLD_RABBIT_EATING",                            group: "Animals" },
  { name: "WORLD_RABBIT_FLEE",                              group: "Animals" },
  { name: "WORLD_RATS_EATING",                              group: "Animals" },
  { name: "WORLD_RATS_FLEEING",                             group: "Animals" },
  { name: "WORLD_SHARK_SWIM",                               group: "Animals" },
  { name: "WORLD_SHARK_HAMMERHEAD_SWIM",                    group: "Animals" },
  { name: "WORLD_STINGRAY_SWIM",                            group: "Animals" },
  { name: "WORLD_WHALE_SWIM",                               group: "Animals" },

  // ── Vehicles ───────────────────────────────────────────────────────────────
  { name: "DRIVE",                                          group: "Vehicles" },
  { name: "PARK_VEHICLE",                                   group: "Vehicles" },
  { name: "WORLD_VEHICLE_ATTRACTOR",                        group: "Vehicles" },
  { name: "WORLD_VEHICLE_AMBULANCE",                        group: "Vehicles" },
  { name: "WORLD_VEHICLE_BICYCLE_BMX",                      group: "Vehicles" },
  { name: "WORLD_VEHICLE_BICYCLE_BMX_BALLAS",               group: "Vehicles" },
  { name: "WORLD_VEHICLE_BICYCLE_BMX_FAMILY",               group: "Vehicles" },
  { name: "WORLD_VEHICLE_BICYCLE_BMX_HARMONY",              group: "Vehicles" },
  { name: "WORLD_VEHICLE_BICYCLE_BMX_VAGOS",                group: "Vehicles" },
  { name: "WORLD_VEHICLE_BICYCLE_MOUNTAIN",                 group: "Vehicles" },
  { name: "WORLD_VEHICLE_BICYCLE_ROAD",                     group: "Vehicles" },
  { name: "WORLD_VEHICLE_BIKE_OFF_ROAD_RACE",               group: "Vehicles" },
  { name: "WORLD_VEHICLE_BIKER",                            group: "Vehicles" },
  { name: "WORLD_VEHICLE_BOAT_IDLE",                        group: "Vehicles" },
  { name: "WORLD_VEHICLE_BOAT_IDLE_ALAMO",                  group: "Vehicles" },
  { name: "WORLD_VEHICLE_BOAT_IDLE_MARQUIS",                group: "Vehicles" },
  { name: "WORLD_VEHICLE_BROKEN_DOWN",                      group: "Vehicles" },
  { name: "WORLD_VEHICLE_BUSINESSMEN",                      group: "Vehicles" },
  { name: "WORLD_VEHICLE_CLUCKIN_BELL_TRAILER",             group: "Vehicles" },
  { name: "WORLD_VEHICLE_CONSTRUCTION_SOLO",                group: "Vehicles" },
  { name: "WORLD_VEHICLE_CONSTRUCTION_PASSENGERS",          group: "Vehicles" },
  { name: "WORLD_VEHICLE_DISTANT_EMPTY_GROUND",             group: "Vehicles" },
  { name: "WORLD_VEHICLE_DRIVE_PASSENGERS",                 group: "Vehicles" },
  { name: "WORLD_VEHICLE_DRIVE_PASSENGERS_LIMITED",         group: "Vehicles" },
  { name: "WORLD_VEHICLE_DRIVE_SOLO",                       group: "Vehicles" },
  { name: "WORLD_VEHICLE_EMPTY",                            group: "Vehicles" },
  { name: "WORLD_VEHICLE_FARM_WORKER",                      group: "Vehicles" },
  { name: "WORLD_VEHICLE_FIRE_TRUCK",                       group: "Vehicles" },
  { name: "WORLD_VEHICLE_HELI_LIFEGUARD",                   group: "Vehicles" },
  { name: "WORLD_VEHICLE_MARIACHI",                         group: "Vehicles" },
  { name: "WORLD_VEHICLE_MECHANIC",                         group: "Vehicles" },
  { name: "WORLD_VEHICLE_MILITARY_PLANES_BIG",              group: "Vehicles" },
  { name: "WORLD_VEHICLE_MILITARY_PLANES_SMALL",            group: "Vehicles" },
  { name: "WORLD_VEHICLE_PARK_PARALLEL",                    group: "Vehicles" },
  { name: "WORLD_VEHICLE_PARK_PERPENDICULAR_NOSE_IN",       group: "Vehicles" },
  { name: "WORLD_VEHICLE_PASSENGER_EXIT",                   group: "Vehicles" },
  { name: "WORLD_VEHICLE_POLICE_BIKE",                      group: "Vehicles" },
  { name: "WORLD_VEHICLE_POLICE_CAR",                       group: "Vehicles" },
  { name: "WORLD_VEHICLE_POLICE_NEXT_TO_CAR",               group: "Vehicles" },
  { name: "WORLD_VEHICLE_QUARRY",                           group: "Vehicles" },
  { name: "WORLD_VEHICLE_SALTON",                           group: "Vehicles" },
  { name: "WORLD_VEHICLE_SALTON_DIRT_BIKE",                 group: "Vehicles" },
  { name: "WORLD_VEHICLE_SECURITY_CAR",                     group: "Vehicles" },
  { name: "WORLD_VEHICLE_STREETRACE",                       group: "Vehicles" },
  { name: "WORLD_VEHICLE_TANDL",                            group: "Vehicles" },
  { name: "WORLD_VEHICLE_TOURBUS",                          group: "Vehicles" },
  { name: "WORLD_VEHICLE_TOURIST",                          group: "Vehicles" },
  { name: "WORLD_VEHICLE_TRACTOR",                          group: "Vehicles" },
  { name: "WORLD_VEHICLE_TRACTOR_BEACH",                    group: "Vehicles" },
  { name: "WORLD_VEHICLE_TRUCK_LOGS",                       group: "Vehicles" },
  { name: "WORLD_VEHICLE_TRUCKS_TRAILERS",                  group: "Vehicles" },

  // ── Code (Advanced) ────────────────────────────────────────────────────────
  // These are engine-internal scenarios — rarely the right pick for cinematic
  // ped placements, but exposed because the game-data dump includes them.
  { name: "CODE_HUMAN_COWER",                               group: "Code (Advanced)" },
  { name: "CODE_HUMAN_CROSS_ROAD_WAIT",                     group: "Code (Advanced)" },
  { name: "CODE_HUMAN_PARK_CAR",                            group: "Code (Advanced)" },
  { name: "CODE_HUMAN_MEDIC_KNEEL",                         group: "Code (Advanced)" },
  { name: "CODE_HUMAN_MEDIC_TEND_TO_DEAD",                  group: "Code (Advanced)" },
  { name: "CODE_HUMAN_MEDIC_TIME_OF_DEATH",                 group: "Code (Advanced)" },
  { name: "CODE_HUMAN_POLICE_CROWD_CONTROL",                group: "Code (Advanced)" },
  { name: "CODE_HUMAN_POLICE_INVESTIGATE",                  group: "Code (Advanced)" },
  { name: "CODE_HUMAN_STAND_COWER",                         group: "Code (Advanced)" },
  { name: "CHAINING_ENTRY",                                 group: "Code (Advanced)" },
  { name: "CHAINING_EXIT",                                  group: "Code (Advanced)" },
  { name: "EAR_TO_TEXT",                                    group: "Code (Advanced)" },
  { name: "EAR_TO_TEXT_FAT",                                group: "Code (Advanced)" },
  { name: "WORLD_LOOKAT_POINT",                             group: "Code (Advanced)" },
];

// ── Display helpers ──────────────────────────────────────────────────────────

// "PROP_HUMAN_SEAT_CHAIR_FOOD" → "Seat Chair Food". Strips the WORLD_/PROP_/
// CODE_ prefix and the redundant HUMAN_/BIRD_/VEHICLE_ infix so the label
// reads naturally, then title-cases each underscore-separated word.
const PREFIX_RE = /^(WORLD|PROP|CODE)_(HUMAN_|BIRD_|VEHICLE_|CAT_|DOG_|COYOTE_|FISH_|HEN_|GULL_|CROW_|RABBIT_|RATS_|SHARK_|PIGEON_|ORCA_|WHALE_|STINGRAY_|DOLPHIN_|MOUNTAIN_LION_|PIG_|COW_|DEER_|BOAR_|CHICKENHAWK_|CORMORANT_)?/;

export function formatGtaScenario(name: string): string {
  if (!name) return "";
  const stripped = name.replace(PREFIX_RE, "");
  const cleaned = stripped.length > 0 ? stripped : name;
  return cleaned
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
