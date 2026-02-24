import { TrendingUp, TrendingDown } from "lucide-react";
import { type Coin } from "@shared/schema";
import { SparklineChart } from "./SparklineChart";

interface CryptoCardProps {
  coin: Coin;
}

export function CryptoCard({ coin }: CryptoCardProps) {
  const isPositive = (coin.change24h ?? 0) >= 0;
  
  // Format price beautifully
  const formattedPrice = coin.price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: coin.price < 1 ? 6 : 2, // Show more decimals for cheap coins
  });

  const formattedChange = Math.abs(coin.change24h ?? 0).toFixed(2);

  return (
    <div className="group relative bg-card rounded-3xl p-6 border border-border shadow-lg shadow-black/20 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full">
      
      {/* Subtle glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      {/* Header: Icon, Name, Symbol & Badge */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:blur-lg transition-all" />
            <img 
              src={coin.image} 
              alt={coin.name} 
              className="w-12 h-12 rounded-full relative z-10 border border-white/10 shadow-sm" 
            />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground leading-tight">{coin.name}</h2>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{coin.symbol}</span>
          </div>
        </div>
        
        {/* Trend Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${
          isPositive 
            ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
            : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {formattedChange}%
        </div>
      </div>

      {/* Price Display */}
      <div className="mb-6 relative z-10 flex-grow">
        <h3 className="text-4xl font-mono font-bold tracking-tighter text-foreground drop-shadow-sm">
          {formattedPrice}
        </h3>
      </div>

      {/* Bleeding Sparkline Chart */}
      <div className="h-28 -mx-6 -mb-6 relative z-0 mt-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300">
        <SparklineChart 
          data={coin.sparkline} 
          isPositive={isPositive} 
          coinId={coin.id} 
        />
      </div>
    </div>
  );
}
