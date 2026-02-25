import type { Context } from "@netlify/functions";

interface CoinGeckoSearchCoin {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
  large: string;
}

export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q")?.trim() || "";

    if (!query) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
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

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error searching coins:", error);
    return new Response(
      JSON.stringify({ message: "Failed to search coins" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
