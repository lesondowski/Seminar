import { useRef, useEffect } from "react";
import { useAudioStore } from "@/stores/audioStore";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";

const BCP47_MAP = {
  vi: "vi-VN",
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
  th: "th-TH",
  ru: "ru-RU",
  it: "it-IT",
  pt: "pt-PT",
  ar: "ar-SA",
  hi: "hi-IN",
  nl: "nl-NL",
  pl: "pl-PL",
  tr: "tr-TR",
  id: "id-ID",
  ms: "ms-MY",
  sv: "sv-SE",
  uk: "uk-UA",
  cs: "cs-CZ",
  he: "he-IL",
  da: "da-DK",
  fi: "fi-FI",
};

function mapSpeechLanguage(lang) {
  return BCP47_MAP[lang] || lang;
}

export function useAudioRuntime() {
  const {
    currentPoiId,
    language,
    status,
    narrationText,
    setStatus,
    setTtsSupported,
  } = useAudioStore();
  const poiList = useVisitorExploreStore((s) => s.poiList);
  const utteranceRef = useRef(null);
  const lastSpeechKeyRef = useRef("");

  const poi = (poiList || []).find((entry) => entry.id === currentPoiId);
  const fallbackTranslation = (poi?.translations || []).find((item) => item.language === "vi")
    || poi?.translations?.[0]
    || null;
  const activeTranslation = (poi?.translations || []).find((item) => item.language === language)
    || fallbackTranslation;

  const runtimeText = (narrationText || activeTranslation?.description || poi?.description || "").trim();
  const speechKey = `${currentPoiId || "none"}:${language}:${runtimeText}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTtsSupported(Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

    const synth = window.speechSynthesis;

    if (!currentPoiId || !runtimeText) {
      synth.cancel();
      utteranceRef.current = null;
      lastSpeechKeyRef.current = "";
      return;
    }

    if (status === "paused") {
      if (synth.speaking && !synth.paused) {
        synth.pause();
      }
      return;
    }

    if (status === "idle" || status === "ended" || status === "error") {
      synth.cancel();
      utteranceRef.current = null;
      lastSpeechKeyRef.current = "";
      return;
    }

    if (status !== "playing") return;

    if (synth.paused && lastSpeechKeyRef.current === speechKey) {
      synth.resume();
      return;
    }

    if (synth.speaking && !synth.paused && lastSpeechKeyRef.current === speechKey) {
      return;
    }

    synth.cancel();

    const utterance = new window.SpeechSynthesisUtterance(runtimeText);
    utterance.lang = mapSpeechLanguage(language);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setStatus("ended");
    utterance.onerror = () => setStatus("error");

    utteranceRef.current = utterance;
    lastSpeechKeyRef.current = speechKey;
    synth.speak(utterance);

    return () => {
      if (status !== "paused") {
        synth.cancel();
      }
    }
  }, [currentPoiId, language, runtimeText, speechKey, status]);
}
