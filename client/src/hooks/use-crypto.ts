import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useCryptoPrices(coinIds: string[]) {
  const idsParam = coinIds.join(",");

  return useQuery({
    queryKey: [api.crypto.prices.path, idsParam],
    queryFn: async () => {
      const url = idsParam
        ? `${api.crypto.prices.path}?ids=${encodeURIComponent(idsParam)}`
        : api.crypto.prices.path;
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        throw new Error("Failed to fetch crypto prices");
      }

      const data = await res.json();

      // Strict runtime validation & logging
      const parsed = api.crypto.prices.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] crypto.prices validation failed:", parsed.error.format());
        throw parsed.error;
      }

      return parsed.data;
    },
    // Auto-refresh every 30 seconds
    refetchInterval: 30000,
    // Keep data fresh while tab is in focus
    refetchOnWindowFocus: true,
  });
}

export function useCoinSearch(query: string) {
  return useQuery({
    queryKey: [api.crypto.search.path, query],
    queryFn: async () => {
      const res = await fetch(
        `${api.crypto.search.path}?q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Failed to search coins");
      const data = await res.json();
      const parsed = api.crypto.search.responses[200].safeParse(data);
      if (!parsed.success) throw parsed.error;
      return parsed.data;
    },
    enabled: query.length >= 2,
    staleTime: 60000,
  });
}
