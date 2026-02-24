import { motion } from "framer-motion";
import { Activity, RefreshCw } from "lucide-react";
import { useCryptoPrices } from "@/hooks/use-crypto";
import { CryptoCard } from "@/components/CryptoCard";

export default function Dashboard() {
  const { data: coins, isLoading, isError, refetch, isRefetching, dataUpdatedAt } = useCryptoPrices();

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
            {[1, 2, 3].map(i => (
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
        )}
      </div>
    </div>
  );
}
