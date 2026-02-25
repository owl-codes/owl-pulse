import { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { useCoinSearch } from "@/hooks/use-crypto";
import { type CoinSearchResult } from "@shared/schema";

interface AddTokenSearchProps {
  trackedIds: string[];
  onAdd: (coinId: string) => void;
  onClose: () => void;
}

export function AddTokenSearch({ trackedIds, onAdd, onClose }: AddTokenSearchProps) {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useCoinSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filteredResults = results?.filter(
    (coin: CoinSearchResult) => !trackedIds.includes(coin.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a cryptocurrency..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
          />
          {isLoading && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin shrink-0" />}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.length < 2 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Type at least 2 characters to search
            </p>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : filteredResults && filteredResults.length > 0 ? (
            <ul>
              {filteredResults.map((coin: CoinSearchResult) => (
                <li key={coin.id}>
                  <button
                    onClick={() => {
                      onAdd(coin.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <img
                      src={coin.thumb}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{coin.name}</p>
                      <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-primary text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Add
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No results found for "{query}"
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
