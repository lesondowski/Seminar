import { ChevronDown } from "lucide-react";

export default function SuggestionBar({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-[84px] left-1/2 z-[56] inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-5 py-1.5 text-xs font-semibold tracking-wide text-slate-500 shadow-[0_8px_22px_rgba(16,24,20,0.14)] active:scale-95"
    >
      <ChevronDown size={14} />
      XEM THÊM GỢI Ý
    </button>
  );
}
