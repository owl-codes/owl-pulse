import { motion, Reorder } from "framer-motion";
import { RefreshCw, Wallet, Edit2, Check, X, Plus, Trash2, Bell, GripVertical, Activity } from "lucide-react";
import { useCryptoPrices } from "@/hooks/use-crypto";
import { CryptoCard } from "@/components/CryptoCard";
import { AddTokenSearch } from "@/components/AddTokenSearch";
import { PriceAlertModal, type PriceAlert } from "@/components/PriceAlertModal";
import { OwlLogo } from "@/components/OwlLogo";
import { useState, useEffect, useCallback, useRef } from "react";
import { type Coin } from "@shared/schema";

const DEFAULT_COIN_IDS = [
  "bitcoin", "ethereum", "dogecoin", "ripple", "solana", "espresso", "pudgy-penguins", "edu-coin",
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    if (stored !== null) return stored;
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function Dashboard() {
  const [trackedCoins, setTrackedCoins] = useState<string[]>(() => loadFromStorage("trackedCoins", DEFAULT_COIN_IDS));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage("favorites", []));
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => loadFromStorage("priceAlerts", []));
  const { data: coins, isLoading, isError, refetch, isRefetching, dataUpdatedAt } = useCryptoPrices(trackedCoins);
  const [editingCoin, setEditingCoin] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const prevPricesRef = useRef<Record<string, number>>({});

  const [portfolio, setPortfolio] = useState<{ coinId: string, amount: string }[]>(() =>
    loadFromStorage("portfolio", [])
  );

  // Sort coins: favorites first, then in tracked order
  const sortedCoins = coins ? [...coins].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return trackedCoins.indexOf(a.id) - trackedCoins.indexOf(b.id);
  }) : undefined;

  const updateTrackedCoins = (newList: string[]) => {
    setTrackedCoins(newList);
    saveToStorage("trackedCoins", newList);
  };

  const addCoin = (coinId: string) => {
    if (trackedCoins.includes(coinId)) return;
    updateTrackedCoins([...trackedCoins, coinId]);
  };

  const removeCoin = (coinId: string) => {
    updateTrackedCoins(trackedCoins.filter(id => id !== coinId));
    setFavorites(prev => {
      const next = prev.filter(id => id !== coinId);
      saveToStorage("favorites", next);
      return next;
    });
  };

  const toggleFavorite = (coinId: string) => {
    setFavorites(prev => {
      const next = prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId];
      saveToStorage("favorites", next);
      return next;
    });
  };

  // Drag reorder handler
  const handleReorder = (newOrder: string[]) => {
    updateTrackedCoins(newOrder);
  };

  // Build the ordered ID list for the Reorder component (favorites first, then rest)
  const orderedIds = sortedCoins?.map(c => c.id) || [];

  const updatePortfolio = (coinId: string, amount: string) => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) return;
    const sanitized = String(parsed);
    const updated = [...portfolio.filter(p => p.coinId !== coinId), { coinId, amount: sanitized }];
    setPortfolio(updated);
    saveToStorage("portfolio", updated);
    setEditingCoin(null);
  };

  // --- Price Alerts ---
  const addAlert = useCallback((alert: Omit<PriceAlert, "id" | "createdAt">) => {
    const newAlert: PriceAlert = { ...alert, id: crypto.randomUUID(), createdAt: Date.now() };
    setAlerts(prev => {
      const next = [...prev, newAlert];
      saveToStorage("priceAlerts", next);
      return next;
    });
  }, []);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => {
      const next = prev.filter(a => a.id !== alertId);
      saveToStorage("priceAlerts", next);
      return next;
    });
  }, []);

  // Check alerts on each price update
  useEffect(() => {
    if (!coins || alerts.length === 0) return;

    const prevPrices = prevPricesRef.current;
    const triggeredIds: string[] = [];

    for (const alert of alerts) {
      const coin = coins.find(c => c.id === alert.coinId);
      if (!coin) continue;

      const prev = prevPrices[coin.id];
      // Only trigger if we have a previous price to compare (avoid triggering on first load)
      if (prev === undefined) continue;

      const triggered =
        (alert.direction === "above" && prev < alert.targetPrice && coin.price >= alert.targetPrice) ||
        (alert.direction === "below" && prev > alert.targetPrice && coin.price <= alert.targetPrice);

      if (triggered) {
        triggeredIds.push(alert.id);
        if (Notification.permission === "granted") {
          new Notification(`${coin.symbol} Price Alert`, {
            body: `${coin.name} is now ${alert.direction === "above" ? "above" : "below"} $${alert.targetPrice.toLocaleString()} — current: $${coin.price.toLocaleString()}`,
            icon: coin.image,
          });
        }
      }
    }

    // Remove triggered alerts
    if (triggeredIds.length > 0) {
      setAlerts(prev => {
        const next = prev.filter(a => !triggeredIds.includes(a.id));
        saveToStorage("priceAlerts", next);
        return next;
      });
    }

    // Update previous prices
    const newPrices: Record<string, number> = {};
    for (const coin of coins) newPrices[coin.id] = coin.price;
    prevPricesRef.current = newPrices;
  }, [coins, alerts]);

  // Request notification permission on first alert
  useEffect(() => {
    if (alerts.length > 0 && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [alerts.length]);

  const totalPortfolioValue = portfolio.reduce((acc, item) => {
    const coin = coins?.find(c => c.id === item.coinId);
    return acc + (coin ? coin.price * parseFloat(item.amount) : 0);
  }, 0);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
              <div className="absolute inset-0 rounded-2xl border border-primary/30 animate-ping opacity-20" />
              <OwlLogo className="w-9 h-9 text-primary relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground drop-shadow-sm">
                Owl<span className="text-primary">Pulse</span>
              </h1>
              <p className="text-muted-foreground font-bold mt-1 text-sm tracking-widest uppercase">LMAOWL</p>
              <p className="text-muted-foreground font-medium mt-0.5 text-lg">Live market overview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 text-sm font-medium text-muted-foreground bg-card/50 backdrop-blur-sm px-5 py-2.5 rounded-full border border-border shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
              </span>
              {lastUpdated ? `Updated at ${lastUpdated}` : 'Connecting...'}
            </div>

            <button
              onClick={() => setShowAlerts(true)}
              className="relative flex items-center justify-center p-3.5 rounded-full bg-card border border-border shadow-lg hover:border-primary/50 hover:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 group"
              aria-label="Price Alerts"
            >
              <Bell className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Token</span>
            </button>

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
            {/* Draggable Token Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Reorder.Group
                axis="y"
                values={orderedIds}
                onReorder={(newOrder) => {
                  // Separate favorites and non-favorites to preserve pinning
                  const favs = newOrder.filter(id => favorites.includes(id));
                  const rest = newOrder.filter(id => !favorites.includes(id));
                  handleReorder([...favs, ...rest]);
                }}
                as="div"
                style={{ display: "contents" }}
              >
                {sortedCoins?.map((coin) => (
                  <Reorder.Item
                    key={coin.id}
                    value={coin.id}
                    className="h-full relative group/card"
                    whileDrag={{ scale: 1.03, zIndex: 50, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {/* Drag handle */}
                    <div className="absolute top-3 left-3 z-20 p-1 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-60 hover:!opacity-100 transition-opacity text-muted-foreground">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <CryptoCard
                      coin={coin}
                      isFavorite={favorites.includes(coin.id)}
                      onToggleFavorite={() => toggleFavorite(coin.id)}
                    />
                    {/* Remove button */}
                    <button
                      onClick={() => removeCoin(coin.id)}
                      className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-destructive/80 text-white opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-destructive"
                      aria-label={`Remove ${coin.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Add Token Card (outside Reorder.Group to avoid errors) */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="h-full"
              >
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full h-full min-h-[280px] rounded-3xl border-2 border-dashed border-border hover:border-primary/50 bg-card/30 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:bg-card/50 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-foreground text-lg">Add Token</p>
                    <p className="text-sm text-muted-foreground">Search CoinGecko</p>
                  </div>
                </button>
              </motion.div>
            </div>

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
                {sortedCoins?.map((coin) => {
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

      {/* Modals */}
      {showSearch && (
        <AddTokenSearch
          trackedIds={trackedCoins}
          onAdd={addCoin}
          onClose={() => setShowSearch(false)}
        />
      )}
      {showAlerts && coins && (
        <PriceAlertModal
          coins={coins}
          alerts={alerts}
          onAdd={addAlert}
          onRemove={removeAlert}
          onClose={() => setShowAlerts(false)}
        />
      )}
    </div>
  );
}
