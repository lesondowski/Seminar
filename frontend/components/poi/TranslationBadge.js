import React from 'react';
import { languageLabel } from '../../utils/narration/languages';

export default function TranslationBadge({ from, to, isTranslated }) {
  if (!isTranslated) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        Ngôn ngữ gốc: {languageLabel(from)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
      Được dịch từ {languageLabel(from)} sang {languageLabel(to)}
    </span>
  );
}
