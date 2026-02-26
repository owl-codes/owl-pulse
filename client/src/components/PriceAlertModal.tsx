import { useState } from "react";
import { Bell, X, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { type Coin } from "@shared/schema";

export interface PriceAlert {
  id: string;
  coinId: string;
  targetPrice: number;
  direction: "above" | "below";
  createdAt: number;
}

interface PriceAlertModalProps {
  coins: Coin[];
  alerts: PriceAlert[];
  onAdd: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  onRemove: (alertId: string) => void;
  onClose: () => void;
}

export function PriceAlertModal({ coins, alerts, onAdd, onRemove, onClose }: PriceAlertModalProps) {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]?.id || "");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0 || !selectedCoin) return;
    onAdd({ coinId: selectedCoin, targetPrice: price, direction });
    setTargetPrice("");
  };

  const coin = coins.find(c => c.id === selectedCoin);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg">Price Alerts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Add Alert Form */}
        <div className="px-6 py-4 border-b border-border space-y-3">
          <div className="flex gap-3">
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
            >
              {coins.map(c => (
                <option key={c.id} value={c.id}>{c.symbol} — ${c.price.toLocaleString()}</option>
              ))}
            </select>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setDirection("above")}
                className={`px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors ${
                  direction === "above" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Above
              </button>
              <button
                onClick={() => setDirection("below")}
                className={`px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors ${
                  direction === "below" ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Below
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              step="any"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder={coin ? `Current: $${coin.price.toLocaleString()}` : "Target price"}
              className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Add Alert
            </button>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No active alerts. Add one above.
            </p>
          ) : (
            <ul>
              {alerts.map(alert => {
                const alertCoin = coins.find(c => c.id === alert.coinId);
                return (
                  <li key={alert.id} className="flex items-center justify-between px-6 py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      {alertCoin && <img src={alertCoin.image} alt={alertCoin.name} className="w-6 h-6 rounded-full" />}
                      <div>
                        <p className="text-sm font-bold">
                          {alertCoin?.symbol || alert.coinId}
                          <span className={`ml-2 text-xs font-medium ${alert.direction === "above" ? "text-green-400" : "text-red-400"}`}>
                            {alert.direction === "above" ? "above" : "below"} ${alert.targetPrice.toLocaleString()}
                          </span>
                        </p>
                        {alertCoin && (
                          <p className="text-xs text-muted-foreground">
                            Current: ${alertCoin.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
