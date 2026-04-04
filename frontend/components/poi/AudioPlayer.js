import React, { useMemo, useRef, useState } from 'react';
import AudioControlBar from './AudioControlBar';
import { toSpeechLang } from '../../utils/narration/languages';

export default function AudioPlayer({ text, languageCode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const utteranceRef = useRef(null);

  const canSpeak = useMemo(() => typeof window !== 'undefined' && 'speechSynthesis' in window, []);

  const handlePlay = () => {
    if (!canSpeak || !text?.trim()) return;

    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = toSpeechLang(languageCode);
    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
  };

  return (
    <div className="space-y-2">
      <AudioControlBar
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        speechRate={speechRate}
        onRateChange={setSpeechRate}
        disabled={!text?.trim() || !canSpeak}
      />
      {!canSpeak && (
        <p className="text-xs text-rose-600">Trình duyệt hiện tại không hỗ trợ speech synthesis.</p>
      )}
    </div>
  );
}
