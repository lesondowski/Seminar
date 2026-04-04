import React from 'react';
import { PlayIcon, PauseIcon } from '../common/Icons';

export default function AudioControlBar({
  isPlaying,
  onPlay,
  onPause,
  speechRate,
  onRateChange,
  disabled = false,
}) {
  return (
    <div className="rounded-xl border border-[#d1d5db] bg-white p-3 space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={isPlaying ? onPause : onPlay}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition disabled:opacity-50"
        >
          {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span className="text-xs text-[#6b7280]">Audio theo nội dung đang hiển thị</span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-[#6b7280]">Tốc độ đọc</label>
        <select
          value={speechRate}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="px-2 py-1 rounded border border-[#d1d5db] text-xs bg-white"
        >
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
        </select>
      </div>
    </div>
  );
}
