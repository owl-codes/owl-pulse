import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useCryptoPrices() {
  return useQuery({
    queryKey: [api.crypto.prices.path],
    queryFn: async () => {
      const res = await fetch(api.crypto.prices.path, { credentials: "include" });
      
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
