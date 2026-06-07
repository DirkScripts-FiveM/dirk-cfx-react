// Fetches normalised player lists from dirk_lib's admin tool subsystem.
//
// Two modes, controlled by `includeOffline`:
//   • false (default) → online-only. Fast, cheap, refreshed every ~5s.
//   • true            → DB-backed search across online + offline players.
//                       Filtered server-side by `search`. Cap of 50.
//
// Caching: react-query handles dedupe + stale-while-revalidate, keyed on
// (mode, search, limit). Multiple <PlayerSelect>s on screen share one
// fetch. Typing "j" → "jo" → "joh" creates separate cache entries — each
// stays cached for 5 minutes (gcTime) so re-typing reuses instantly.
//
// Admin gating: lives behind the ADMIN_TOOL_QUERY perm check on the
// server. Outside an open admin panel, fetches return empty arrays.

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNui } from "../utils/fetchNui";

export type Player = {
  /** Server id when online, null when offline. */
  id: number | null;
  /** Persistent identifier — citizenid (qb/qbx) or license (esx). */
  citizenId: string;
  /** Steam/Discord display name from GetPlayerName(src). Blank for some
   *  framework + offline combos (ESX users table doesn't store it). */
  name: string;
  /** First name + last name from the framework's character data. */
  charName: string;
  online: boolean;
};

export type UsePlayersOptions = {
  /** When true, hits the DB and returns offline + online matches.
   *  When false (default), returns only currently-connected players. */
  includeOffline?: boolean;
  /** Required when includeOffline=true; ignored otherwise. Server-side
   *  filtered (LIKE) across char name, citizenId, account name. */
  search?: string;
  /** Default 50, max 50 (capped server-side). */
  limit?: number;
  /** Override staleTime — how long the cache stays fresh before background
   *  refetch. Default 5s for online, 30s for search. */
  staleTimeMs?: number;
  /** Set to e.g. 10000 to auto-refresh every 10s. Off by default. */
  refetchIntervalMs?: number;
};

export type UsePlayersResult = {
  players: Player[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refresh: () => void;
};

export function usePlayers(opts: UsePlayersOptions = {}): UsePlayersResult {
  const {
    includeOffline = false,
    search = "",
    limit = 50,
    staleTimeMs,
    refetchIntervalMs,
  } = opts;

  const query = useQuery<Player[]>({
    queryKey: includeOffline
      ? ["dirk:players", "search", search.trim().toLowerCase(), limit]
      : ["dirk:players", "online"],
    queryFn: async () => {
      const toolId = includeOffline ? "searchPlayers" : "getOnlinePlayers";
      const payload = includeOffline
        ? { id: toolId, value: { search: search.trim(), limit } }
        : { id: toolId };
      const result = await fetchNui<Player[] | null>(
        "ADMIN_TOOL_QUERY",
        payload,
        // Browser-dev fallback. Returns a couple of mock players so the
        // dev shell isn't blank.
        includeOffline
          ? [
              { id: 1,  citizenId: "ABC12345", name: "Dev User", charName: "John Doe",   online: true  },
              { id: null, citizenId: "DEF67890", name: "",       charName: "Jane Offline", online: false },
            ]
          : [
              { id: 1,  citizenId: "ABC12345", name: "Dev User", charName: "John Doe",   online: true  },
            ],
      );
      return Array.isArray(result) ? result : [];
    },
    staleTime: staleTimeMs ?? (includeOffline ? 30_000 : 5_000),
    gcTime: 5 * 60_000,
    refetchInterval: refetchIntervalMs ?? false,
    refetchOnWindowFocus: false,
    placeholderData: includeOffline ? keepPreviousData : undefined,
  });

  return {
    players: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: (query.error as Error | null) ?? null,
    refresh: () => query.refetch(),
  };
}
