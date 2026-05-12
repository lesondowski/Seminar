import { useEffect, useRef } from "react";
import { useUiStore } from "@/stores/uiStore";
import { MapPin, X, ChevronRight } from "lucide-react";

const TIMEOUT_MS = 7000;

export default function SuggestionCard({ onSelect }) {
  const { suggestionCard, activeSurface, setSuggestionCard } = useUiStore();
  const timerRef = useRef(null);

  // Auto-dismiss after 7s
  useEffect(() => {
    if (suggestionCard) {
      timerRef.current = setTimeout(() => setSuggestionCard(null), TIMEOUT_MS);
    }
    return () => clearTimeout(timerRef.current);
  }, [suggestionCard?.poiId]);

  // Suppress when chatbot or POI surface is open
  if (!suggestionCard || activeSurface === "chat" || activeSurface === "poi") return null;

  const { poiName, distance } = suggestionCard;

  return (
    <div className="suggestion-card" role="status" aria-live="polite">
      <div className="suggestion-card-body">
        <MapPin size={18} className="suggestion-card-icon" />
        <div>
          <p className="suggestion-card-name">{poiName}</p>
          {distance != null && (
            <p className="suggestion-card-dist">{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`} gần đây</p>
          )}
        </div>
      </div>
      <div className="suggestion-card-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            setSuggestionCard(null);
            if (onSelect) onSelect(suggestionCard.poiId);
          }}
        >
          Xem chi tiết
          <ChevronRight size={14} />
        </button>
        <button
          className="icon-btn"
          onClick={() => setSuggestionCard(null)}
          aria-label="Bỏ qua"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
