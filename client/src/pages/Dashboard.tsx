import { motion } from "framer-motion";
import { Activity, RefreshCw, Wallet, Edit2, Check, X } from "lucide-react";
import { useCryptoPrices } from "@/hooks/use-crypto";
import { CryptoCard } from "@/components/CryptoCard";
import { useState } from "react";

export default function Dashboard() {
  const { data: coins, isLoading, isError, refetch, isRefetching, dataUpdatedAt } = useCryptoPrices();
  const [editingCoin, setEditingCoin] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState("");

  const [portfolio, setPortfolio] = useState<{ coinId: string, amount: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("portfolio") || "[]");
    } catch { return []; }
  });

  const updatePortfolio = (coinId: string, amount: string) => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) return;
    const sanitized = String(parsed);
    const updated = [...portfolio.filter(p => p.coinId !== coinId), { coinId, amount: sanitized }];
    setPortfolio(updated);
    localStorage.setItem("portfolio", JSON.stringify(updated));
    setEditingCoin(null);
  };

  const totalPortfolioValue = portfolio.reduce((acc, item) => {
    const coin = coins?.find(c => c.id === item.coinId);
    return acc + (coin ? coin.price * parseFloat(item.amount) : 0);
  }, 0);

  const lastUpdated = dataUpdatedAt 
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : '';

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-border/50 pb-8">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.15)] relative">
              {/* Pulsing ring behind the icon container */}
              <div className="absolute inset-0 rounded-2xl border border-primary/30 animate-ping opacity-20" />
              <Activity className="text-primary w-7 h-7 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground drop-shadow-sm">
                Crypto<span className="text-primary">Pulse</span>
              </h1>
              <p className="text-muted-foreground font-medium mt-1.5 text-lg">Live market overview</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-sm font-medium text-muted-foreground bg-card/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-border shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
              </span>
              {lastUpdated ? `Updated at ${lastUpdated}` : 'Connecting...'}
            </div>
            
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex items-center justify-center p-3.5 rounded-full bg-card border border-border shadow-lg hover:border-primary/50 hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label="Refresh Prices"
            >
              <RefreshCw className={`w-5 h-5 text-foreground group-hover:text-primary transition-colors ${isRefetching ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </header>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[280px] rounded-3xl bg-card border border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full animate-shimmer" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">Connection Error</h3>
            <p className="text-muted-foreground mb-6 max-w-md">We couldn't reach the crypto market data. Please check your connection and try again.</p>
            <button 
              onClick={() => refetch()} 
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {coins?.map((coin) => (
                <motion.div key={coin.id} variants={itemVariants} className="h-full">
                  <CryptoCard coin={coin} />
                </motion.div>
              ))}
            </motion.div>

            {/* Portfolio Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-[2rem] p-8 md:p-12 border border-border/50 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Wallet className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold">Portfolio Tracker</h2>
                    <p className="text-muted-foreground text-sm font-medium">Manage your crypto assets</p>
                  </div>
                </div>
                <div className="bg-card px-8 py-4 rounded-2xl border border-border shadow-xl">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Total Balance</p>
                  <p className="text-3xl font-display font-extrabold text-primary">
                    ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coins?.map((coin) => {
                  const item = portfolio.find(p => p.coinId === coin.id);
                  const amount = item?.amount || "0";
                  const value = parseFloat(amount) * coin.price;
                  const isEditing = editingCoin === coin.id;

                  return (
                    <div key={coin.id} className="bg-card/30 backdrop-blur-sm border border-border p-6 rounded-2xl group transition-all duration-300 hover:border-primary/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <span className="font-bold">{coin.symbol}</span>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updatePortfolio(coin.id, tempAmount)}
                              className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingCoin(null)}
                              className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingCoin(coin.id);
                              setTempAmount(amount);
                            }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-muted border border-border"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Holdings</p>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="any"
                            autoFocus
                            value={tempAmount}
                            onChange={(e) => setTempAmount(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") updatePortfolio(coin.id, tempAmount); }}
                            className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        ) : (
                          <p className="text-xl font-extrabold">{parseFloat(amount).toLocaleString()} {coin.symbol}</p>
                        )}
                        <p className="text-sm text-primary font-medium">
                          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          </div>
        )}
      </div>
    </div>
  );
}
