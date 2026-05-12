import { Compass, Route, List } from "lucide-react";

const NAV_ITEMS = [
  { key: "explore", label: "Tự khám phá", icon: Compass },
  { key: "tour", label: "Tour", icon: Route },
  { key: "poi", label: "Danh sách POI", icon: List },
];

export default function BottomNavigation({ activeTab, onChange }) {
  return (
    <nav
      className="absolute left-2 right-2 z-[56] grid h-[62px] grid-cols-3 gap-1 rounded-[22px] border border-white/75 bg-white/95 p-1.5 shadow-[0_10px_24px_rgba(16,24,20,0.16)] md:left-1/2 md:right-auto md:h-[66px] md:w-[520px] md:-translate-x-1/2 md:p-2 xl:left-1/2 xl:translate-x-0"
      style={{ bottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Visitor tabs"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition active:scale-95 md:text-[11px] ${
              isActive ? "bg-teal-100 text-teal-700" : "text-slate-500"
            }`}
          >
            <Icon size={15} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
