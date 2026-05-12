import { Play, Pause, Square, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";

export default function AudioPlayerDock() {
  const {
    currentPoiId,
    language,
    status,
    collapsed,
    narrationText,
    ttsSupported,
    setCollapsed,
    setStatus,
  } = useAudioStore();
  const poiList = useVisitorExploreStore((s) => s.poiList);

  const poi = (poiList || []).find((entry) => entry.id === currentPoiId);
  const fallbackTranslation = (poi?.translations || []).find((item) => item.language === "vi")
    || poi?.translations?.[0]
    || null;
  const activeTranslation = (poi?.translations || []).find((item) => item.language === language)
    || fallbackTranslation;

  const runtimeDescription = (narrationText || activeTranslation?.description || poi?.description || "").trim();
  const canNarrate = ttsSupported && Boolean(runtimeDescription);
  const name = activeTranslation?.name || poi?.name || `POI #${currentPoiId}`;

  if (!currentPoiId) return null;

  if (collapsed) {
    return (
      <div className="audio-dock !bottom-[76px] rounded-full border border-slate-200 bg-white/95 px-4 py-2 shadow-[0_10px_24px_rgba(16,24,20,0.14)] backdrop-blur md:mx-auto md:mb-4 md:max-w-[520px]">
        <div className="audio-dock-info text-sm">
          <Volume2 size={14} />
          <span>{name}</span>
        </div>
        <div className="audio-dock-controls">
          {canNarrate ? (
            <button
              className="icon-btn !h-9 !w-9 !rounded-full"
              onClick={() => setStatus(status === "playing" ? "paused" : "playing")}
              aria-label="Phát hoặc tạm dừng"
            >
              {status === "playing" ? <Pause size={14} /> : <Play size={14} />}
            </button>
          ) : null}
          <button className="icon-btn !h-9 !w-9 !rounded-full" onClick={() => setStatus("idle")} aria-label="Dừng">
            <Square size={12} />
          </button>
          <button className="icon-btn !h-9 !w-9 !rounded-full" onClick={() => setCollapsed(false)} aria-label="Mở rộng trình phát">
            <ChevronUp size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="audio-dock !bottom-[76px] rounded-t-[24px] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_28px_rgba(16,24,20,0.14)] backdrop-blur md:mx-auto md:mb-4 md:max-w-[760px] md:rounded-[24px] md:border md:px-5">
      <div className="audio-dock-info text-base">
        <Volume2 size={16} />
        <span>{name}</span>
        {!ttsSupported && <span className="audio-unavailable-tag">Thiết bị không hỗ trợ TTS</span>}
        {ttsSupported && !canNarrate && <span className="audio-unavailable-tag">Không có mô tả để đọc</span>}
      </div>

      <div className="audio-dock-controls">
        {canNarrate ? (
          <button
            className="icon-btn !h-11 !w-11 !rounded-full"
            onClick={() => setStatus(status === "playing" ? "paused" : "playing")}
          >
            {status === "playing" ? <Pause size={16} /> : <Play size={16} />}
          </button>
        ) : null}
        <button className="icon-btn !h-11 !w-11 !rounded-full" onClick={() => setCollapsed(true)} aria-label="Thu gọn trình phát">
          <ChevronDown size={16} />
        </button>
        <button
          className="icon-btn !h-11 !w-11 !rounded-full"
          onClick={() => setStatus("idle")}
          aria-label="Dừng"
        >
          <Square size={14} />
        </button>
      </div>
    </div>
  );
}
