import React, { useMemo, useState } from 'react';
import LanguageSelector from './LanguageSelector';
import TranslateToggle from './TranslateToggle';
import TranslationBadge from './TranslationBadge';
import AudioPlayer from './AudioPlayer';
import { translateNarration } from '../../utils/narration/translateClient';
import { languageLabel } from '../../utils/narration/languages';

export default function NarrationBlock({ narration, deviceLanguage = 'vi' }) {
  const sourceLanguage = narration?.sourceLanguage || 'vi';
  const sourceText = narration?.content || '';

  const [targetLanguage, setTargetLanguage] = useState(deviceLanguage || 'en');
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedByLang, setTranslatedByLang] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  const translatedText = translatedByLang[targetLanguage] || '';

  const activeText = useMemo(() => {
    if (showTranslated && translatedText) return translatedText;
    return sourceText;
  }, [showTranslated, translatedText, sourceText]);

  const activeLanguage = showTranslated && translatedText ? targetLanguage : sourceLanguage;

  const handleLanguageChange = (lang) => {
    setTargetLanguage(lang);
    setShowTranslated(false);
    setTranslateError('');
  };

  const handleTranslate = async () => {
    setTranslateError('');

    if (!sourceText?.trim()) {
      setTranslateError('Chưa có nội dung thuyết minh.');
      return;
    }

    try {
      setIsTranslating(true);
      const data = await translateNarration({
        text: sourceText,
        from: sourceLanguage,
        to: targetLanguage,
      });
      setTranslatedByLang((prev) => ({
        ...prev,
        [targetLanguage]: data.translatedText || '',
      }));
      setShowTranslated(true);
    } catch (err) {
      setTranslateError(err.message || 'Không thể dịch lúc này');
      setShowTranslated(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const shouldSuggestTranslation =
    sourceLanguage &&
    deviceLanguage &&
    sourceLanguage !== deviceLanguage &&
    !showTranslated;

  return (
    <section className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-lg text-[#111827]">Thuyết minh</h2>
        <TranslationBadge
          from={sourceLanguage}
          to={targetLanguage}
          isTranslated={showTranslated && Boolean(translatedText)}
        />
      </div>

      {sourceText ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSelector value={targetLanguage} onChange={handleLanguageChange} className="min-w-[180px]" />
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="px-3 py-2 rounded-lg bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition disabled:opacity-60"
            >
              {isTranslating ? 'Đang dịch...' : 'Dịch'}
            </button>
            <TranslateToggle
              showTranslated={showTranslated}
              onChange={setShowTranslated}
              disabled={!translatedText}
            />
          </div>

          <p className="text-xs text-[#6b7280]">
            Đang hiển thị: <span className="font-semibold">{languageLabel(activeLanguage)}</span>
            {showTranslated && translatedText ? ' (bản dịch)' : ' (bản gốc)'}
          </p>

          {shouldSuggestTranslation && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
              Ngôn ngữ thiết bị khác ngôn ngữ gốc. Bạn có thể bấm "Dịch" để xem bản dịch nhanh.
            </p>
          )}

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-4 leading-7 text-[#1f2937] whitespace-pre-wrap min-h-[120px]">
            {showTranslated ? (translatedText || 'Chưa có bản dịch cho ngôn ngữ đã chọn.') : sourceText}
          </div>

          {translateError && <p className="text-sm text-rose-600">{translateError}</p>}

          <AudioPlayer text={activeText} languageCode={activeLanguage} />
        </div>
      ) : (
        <div className="text-sm text-[#6b7280]">Chưa có nội dung thuyết minh.</div>
      )}
    </section>
  );
}
