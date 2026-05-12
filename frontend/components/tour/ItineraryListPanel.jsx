import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ListChecks, MapPin, Plus, Sparkles, Trash2, Play, SkipBack, SkipForward } from "lucide-react";
import { useVisitorExploreStore } from "@/stores/visitorExploreStore";

function SortableItineraryItem({ poi, index, onRemove, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: poi.id });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
      }}
      className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_22px_rgba(16,24,20,0.08)]"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          aria-label="Kéo thả sắp xếp"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>

        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
          {index + 1}
        </span>

        <img src={poi.image} alt="" className="h-16 w-20 rounded-[12px] object-cover" />

        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelect?.(poi.id)}>
          <div className="truncate text-base font-semibold text-slate-900">{poi.name}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} />
            {poi.distanceKm} km
          </div>
        </button>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-700"
          onClick={() => onRemove?.(poi.id)}
          aria-label="Xóa điểm đến"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

export default function ItineraryListPanel({
  onClose,
  onSelectPoi,
  onAddMore,
  onStartJourney,
  onNextPoi,
  onPreviousPoi,
}) {
  const poiList = useVisitorExploreStore((s) => s.poiList);
  const itineraryDraftPoiIds = useVisitorExploreStore((s) => s.itineraryDraftPoiIds);
  const userLocation = useVisitorExploreStore((s) => s.userLocation);
  const removePoiFromItinerary = useVisitorExploreStore((s) => s.removePoiFromItinerary);
  const optimizeItinerary = useVisitorExploreStore((s) => s.optimizeItinerary);
  const reorderItinerary = useVisitorExploreStore((s) => s.reorderItinerary);
  const setRouteBanner = useVisitorExploreStore((s) => s.setRouteBanner);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const itineraryPois = itineraryDraftPoiIds
    .map((poiId) => poiList.find((poi) => poi.id === poiId))
    .filter(Boolean);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!active?.id || !over?.id || active.id === over.id) return;
    reorderItinerary(active.id, over.id);
  }

  function handleOptimize() {
    if (!userLocation) {
      setRouteBanner({ type: "error", message: "Chưa có GPS, chưa thể tối ưu theo khoảng cách hiện tại." });
      return;
    }
    optimizeItinerary();
    setRouteBanner({ type: "success", message: "Đã sắp xếp lộ trình từ gần đến xa theo vị trí hiện tại." });
  }

  return (
    <div className="rounded-t-[28px] bg-white px-4 pb-24 pt-3 shadow-[0_-10px_28px_rgba(16,24,20,0.18)] md:rounded-[28px] md:px-5 md:pb-6">
      <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200 md:hidden" />

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
          onClick={onClose}
          aria-label="Đóng danh sách lộ trình"
        >
          <ListChecks size={18} />
        </button>
        <h3 className="m-0 text-2xl font-bold text-slate-900">Danh sách lộ trình</h3>
      </div>

      {itineraryPois.length === 0 ? (
        <div className="mt-5 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Bạn chưa thêm điểm đến nào. Hãy chọn "Thêm" trong POI để tạo lộ trình cá nhân.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itineraryDraftPoiIds} strategy={verticalListSortingStrategy}>
            <div className="mt-4 flex flex-col gap-3">
              {itineraryPois.map((poi, index) => (
                <SortableItineraryItem
                  key={poi.id}
                  poi={poi}
                  index={index}
                  onSelect={onSelectPoi}
                  onRemove={removePoiFromItinerary}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-teal-100 px-4 text-sm font-semibold text-teal-700"
        onClick={onAddMore}
      >
        <Plus size={16} />
        Thêm điểm đến khác
      </button>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
          onClick={onPreviousPoi}
          disabled={itineraryPois.length < 2}
        >
          <SkipBack size={14} />
          Quay về điểm trước
        </button>
        <button
          type="button"
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
          onClick={onNextPoi}
          disabled={itineraryPois.length < 2}
        >
          <SkipForward size={14} />
          Tới điểm tiếp theo
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
          onClick={handleOptimize}
          disabled={itineraryPois.length < 2}
        >
          <Sparkles size={16} />
          Tự động sắp xếp tối ưu
        </button>
        <button
          type="button"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-teal-700 text-sm font-bold text-white"
          onClick={onStartJourney}
          disabled={itineraryPois.length === 0}
        >
          <Play size={16} />
          Bắt đầu hành trình
        </button>
      </div>
    </div>
  );
}
