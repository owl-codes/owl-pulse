import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";

const DEFAULT_COINS = "bitcoin,ethereum,dogecoin,ripple,solana,espresso,pudgy-penguins,edu-coin";

interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
}

interface CoinGeckoSearchCoin {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
  large: string;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Prices endpoint — accepts ?ids=bitcoin,ethereum,... query param
  app.get(api.crypto.prices.path, async (req, res) => {
    try {
      const ids = typeof req.query.ids === "string" && req.query.ids.trim()
        ? req.query.ids.trim()
        : DEFAULT_COINS;

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&sparkline=true`,
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoMarketCoin[] = await response.json();

      const coins = data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        sparkline: coin.sparkline_in_7d?.price || [],
      }));

      res.status(200).json(coins);
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      res.status(500).json({ message: "Failed to fetch crypto prices" });
    }
  });

  // Search endpoint — searches CoinGecko coin list by query
  app.get(api.crypto.search.path, async (req, res) => {
    try {
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (!query) {
        return res.status(200).json([]);
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error(`CoinGecko search error: ${response.status}`);
      }

      const data: { coins: CoinGeckoSearchCoin[] } = await response.json();

      const results = data.coins.slice(0, 20).map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        thumb: coin.thumb,
        large: coin.large,
      }));

      res.status(200).json(results);
    } catch (error) {
      console.error("Error searching coins:", error);
      res.status(500).json({ message: "Failed to search coins" });
    }
  });

  return httpServer;
}
