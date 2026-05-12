import { useState, useCallback } from "react";
import { X, Play, Pause, VolumeX, Share2, Route, Plus, Check, Clock3, Ticket, Languages, Loader2 } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";
import { useBootstrapStore } from "@/stores/bootstrapStore";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";
import { useGpsStore } from "@/stores/gpsStore";
import { planVisitorRoute } from "@/services/visitorRoutePlanner";
import { buildPoiCanonicalUrl } from "@/utils/poiLinks";
import { translateText } from "@/utils/translate";

async function sharePoi(poi, link) {
  const text = `${poi.name} - ${poi.address}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: poi.name, text, url: link });
      return;
    } catch {
      // Ignore and fall back.
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(link);
  }
}

const ALL_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "th", label: "ภาษาไทย" },
  { code: "ru", label: "Русский" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "tr", label: "Türkçe" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "sv", label: "Svenska" },
  { code: "uk", label: "Українська" },
  { code: "cs", label: "Čeština" },
  { code: "he", label: "עברית" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
];

export default function POIDetail({ poiId, onClose }) {
  const appConfig = useBootstrapStore((s) => s.appConfig);
  const {
    status,
    currentPoiId,
    language,
    setLanguage,
    setCurrentPoiId,
    setStatus,
    setNarrationText,
    ttsSupported,
  } = useAudioStore();
  const poiList = useVisitorExploreStore((s) => s.poiList);
  const itineraryDraftPoiIds = useVisitorExploreStore((s) => s.itineraryDraftPoiIds);
  const addPoiToItinerary = useVisitorExploreStore((s) => s.addPoiToItinerary);
  const setActiveRoute = useVisitorExploreStore((s) => s.setActiveRoute);
  const setRouteBanner = useVisitorExploreStore((s) => s.setRouteBanner);
  const permission = useGpsStore((s) => s.permission);
  const currentPosition = useGpsStore((s) => s.currentPosition);

  // Local state for auto-translation
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);
  const [translatedForLang, setTranslatedForLang] = useState(null);

  const poi = (poiList || []).find((entry) => entry.id === poiId);
  if (!poi) return null;

  const selectedLanguage = language || "vi";

  const fallbackTranslation = (poi.translations || []).find((item) => item.language === "vi")
    || poi.translations?.[0]
    || null;

  // Stored translation from DB (highest priority)
  const storedTranslation = (poi.translations || []).find((item) => item.language === selectedLanguage)
    || null;

  // Effective description: storedTranslation → auto-translated → fallback
  const storedDescription = (storedTranslation?.description || "").trim();
  const fallbackDescription = (fallbackTranslation?.description || poi.description || "").trim();
  const localizedDescription = storedDescription
    || (translatedForLang === selectedLanguage ? translatedText || "" : "")
    || (selectedLanguage === "vi" ? fallbackDescription : "");

  const localizedName = storedTranslation?.name
    || (storedTranslation ? storedTranslation.name : null)
    || fallbackTranslation?.name
    || poi.name;

  const canonicalLink = buildPoiCanonicalUrl(
    poi.id,
    typeof window !== "undefined" ? window.location.origin : ""
  );

  const isThisPoi = currentPoiId === poiId;
  const isPlaying = isThisPoi && status === "playing";
  const canNarrate = !isTranslating && Boolean(localizedDescription);
  const isAdded = itineraryDraftPoiIds.includes(poiId);

  // Trigger translation when language changes and no stored translation exists
  const handleLanguageChange = useCallback(async (newLang) => {
    setLanguage(newLang);
    setTranslateError(false);

    // Check if DB already has a translation for this language
    const stored = (poi.translations || []).find((item) => item.language === newLang);
    if (stored || newLang === "vi") {
      // No need to translate
      setTranslatedText(null);
      setTranslatedForLang(null);
      // If this POI is actively playing, restart with stored/fallback text
      if (isThisPoi && status === "playing") {
        const newText = (stored?.description || fallbackDescription).trim();
        setNarrationText(newText);
        setStatus("idle");
        setTimeout(() => setStatus("playing"), 50);
      }
      return;
    }

    // Need auto-translation
    setIsTranslating(true);
    setTranslatedText(null);
    setTranslatedForLang(null);
    try {
      const result = await translateText(fallbackDescription, newLang);
      setTranslatedText(result);
      setTranslatedForLang(newLang);
      // If this POI is actively playing, restart TTS with translated text
      if (isThisPoi) {
        setNarrationText(result);
        if (status === "playing" || status === "paused") {
          setStatus("idle");
          setTimeout(() => setStatus("playing"), 50);
        }
      }
    } catch {
      setTranslateError(true);
    } finally {
      setIsTranslating(false);
    }
  }, [poi, fallbackDescription, isThisPoi, status, setLanguage, setNarrationText, setStatus]);

  function handlePlay() {
    if (!ttsSupported || !canNarrate) return;
    if (isThisPoi && status === "playing") {
      setStatus("paused");
      return;
    }

    if (isThisPoi && status === "paused") {
      setStatus("playing");
      return;
    }

    setCurrentPoiId(poiId);
    setNarrationText(localizedDescription);
    setStatus("playing");
  }

  async function handleNavigate() {
    setRouteBanner({ type: "info", message: "Đang tìm đường tới địa điểm..." });
    onClose?.();

    try {
      const result = await planVisitorRoute({
        permission,
        currentPosition,
        targetPoi: poi,
        allPois: poiList,
      });

      if (!result.ok) {
        setActiveRoute(null);
        setRouteBanner({ type: "error", message: result.message });
        return;
      }

      setActiveRoute(result.route);
      setRouteBanner({ type: "success", message: result.message });
    } catch {
      setActiveRoute(null);
      setRouteBanner({ type: "error", message: "Không thể tìm đường lúc này. Vui lòng thử lại." });
    }
  }

  function handleAddPoi() {
    if (isAdded) return;
    addPoiToItinerary(poiId);
  }

  return (
    <div className="max-h-[92vh] overflow-y-auto rounded-t-[30px] bg-white pb-8 shadow-[0_-10px_28px_rgba(16,24,20,0.18)] md:max-h-[88vh] md:rounded-[30px]">
      <div className="relative h-64 overflow-hidden rounded-t-[30px] md:h-72">
        <img src={poi.heroImage || poi.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_8px_20px_rgba(16,24,20,0.16)]" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
          <div className="flex gap-2">
            <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_8px_20px_rgba(16,24,20,0.16)]" onClick={() => sharePoi(poi, canonicalLink)} aria-label="Chia sẻ">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-3xl font-bold leading-tight text-slate-900 md:text-[2.1rem]">{localizedName}</h2>
            <p className="m-0 mt-2 text-base text-slate-500 md:text-lg">{poi.address}</p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
            <Languages size={14} />
            <select
              className="bg-transparent text-sm font-semibold outline-none"
              value={selectedLanguage}
              onChange={(event) => handleLanguageChange(event.target.value)}
              aria-label="Ngôn ngữ thuyết minh"
            >
              {ALL_LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="m-0 text-lg leading-8 text-slate-700 md:text-xl md:leading-9">{localizedDescription}</p>

        <div className="flex flex-wrap gap-2.5 md:gap-3">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full bg-teal-700 px-5 text-base font-semibold text-white md:h-14 md:gap-3 md:px-7 md:text-xl" onClick={handleNavigate}>
            <Route size={20} />
            Đường đi
          </button>
          <button
            type="button"
            className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-base font-semibold md:h-14 md:gap-3 md:px-7 md:text-xl ${isAdded ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700"}`}
            onClick={handleAddPoi}
            disabled={isAdded}
          >
            {isAdded ? <Check size={20} /> : <Plus size={20} />}
            {isAdded ? "Đã thêm" : "Thêm"}
          </button>
        </div>

        <div className="rounded-[20px] bg-slate-50 p-3 shadow-[inset_0_0_0_1px_rgba(220,228,226,0.9)] md:rounded-[24px] md:p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-white md:h-14 md:w-14 disabled:opacity-60"
              onClick={handlePlay}
              disabled={!ttsSupported || !canNarrate || isTranslating}
            >
              {isTranslating ? <Loader2 size={22} className="animate-spin" /> : isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold text-slate-900 md:text-xl">Thuyết minh: {localizedName}</div>
              <div className="mt-1 text-base text-slate-500">0:00 / 3:45</div>
            </div>
          </div>
          {!ttsSupported && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-500">
              <VolumeX size={14} />
              Trình duyệt chưa hỗ trợ thuyết minh tự động
            </div>
          )}
          {ttsSupported && isTranslating && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-500">
              <Loader2 size={14} className="animate-spin" />
              Đang dịch mô tả...
            </div>
          )}
          {ttsSupported && translateError && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-red-500">
              <VolumeX size={14} />
              Không thể dịch mô tả. Kiểm tra kết nối mạng.
            </div>
          )}
          {ttsSupported && !isTranslating && !translateError && !canNarrate && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-500">
              <VolumeX size={14} />
              Chưa có mô tả để chuyển giọng đọc
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 md:gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 md:px-4 md:py-3 md:text-lg">
            <Clock3 size={18} />
            Mở cửa: {poi.openingHours}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 md:px-4 md:py-3 md:text-lg">
            <Ticket size={18} />
            {poi.ticketLabel}
          </span>
          {(poi.tags || []).map((tag) => (
            <span key={tag} className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 md:px-4 md:py-3 md:text-lg">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
