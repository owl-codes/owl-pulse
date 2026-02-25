import { z } from "zod";

export const coinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  change24h: z.number().nullable(),
  sparkline: z.array(z.number()),
});

export type Coin = z.infer<typeof coinSchema>;

export const coinSearchResultSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  thumb: z.string(),
  large: z.string(),
});

export type CoinSearchResult = z.infer<typeof coinSearchResultSchema>;
