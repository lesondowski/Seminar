import { LocateFixed, MessageCircle, ListChecks } from "lucide-react";

export default function FloatingButtons({ onLocate, onChat, onOpenItinerary }) {
  return (
    <div className="absolute bottom-[92px] right-3 z-[56] flex flex-col gap-2 md:bottom-32 xl:right-6">
      <button
        type="button"
        onClick={onLocate}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-teal-700 shadow-[0_10px_24px_rgba(16,24,20,0.18)] transition hover:-translate-y-0.5 active:scale-95 md:h-12 md:w-12"
        aria-label="Center map"
      >
        <LocateFixed size={18} />
      </button>
      <button
        type="button"
        onClick={onChat}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white shadow-[0_10px_24px_rgba(15,118,110,0.38)] transition hover:-translate-y-0.5 active:scale-95 md:h-12 md:w-12"
        aria-label="Hoi AI"
      >
        <MessageCircle size={18} />
      </button>
      <button
        type="button"
        onClick={onOpenItinerary}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-700 shadow-[0_10px_24px_rgba(16,24,20,0.18)] transition hover:-translate-y-0.5 active:scale-95 md:h-11 md:w-11"
        aria-label="Danh sách lộ trình"
      >
        <ListChecks size={16} />
      </button>
    </div>
  );
}
