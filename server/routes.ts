import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.crypto.prices.path, async (req, res) => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&sparkline=true"
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      const coins = data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        sparkline: coin.sparkline_in_7d?.price || []
      }));

      res.status(200).json(coins);
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      res.status(500).json({ message: "Failed to fetch crypto prices" });
    }
  });

  // Seed the database with a dummy user if none exists
  const existingUser = await storage.getUserByUsername("admin");
  if (!existingUser) {
    await storage.createUser({ username: "admin" });
  }

  return httpServer;
}
