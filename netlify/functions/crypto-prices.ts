import type { Context } from "@netlify/functions";

const DEFAULT_COINS =
  "bitcoin,ethereum,dogecoin,ripple,solana,espresso,pudgy-penguins,edu-coin";

interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
}

export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url);
    const ids = url.searchParams.get("ids")?.trim() || DEFAULT_COINS;

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

    return new Response(JSON.stringify(coins), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch crypto prices" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
