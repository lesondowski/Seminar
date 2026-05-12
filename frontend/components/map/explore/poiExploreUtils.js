import { isPoiHiddenByName } from "@/utils/poiVisibility";

export const CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "cafe", label: "Cà phê" },
  { key: "hotel", label: "Khách sạn" },
  { key: "shopping", label: "Mua sắm" },
];

const CATEGORY_ROTATION = ["cafe", "hotel", "shopping"];
const VISUAL_TYPE_ROTATION = ["landmark", "food", "cafe"];
const IMAGE_LIBRARY = [
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
];

const CATEGORY_LABELS = {
  cafe: "Ẩm thực",
  hotel: "Lưu trú",
  shopping: "Mua sắm",
};

function formatDistanceForPoi(poiId) {
  const distance = 0.4 + (Number(poiId) - 1) * 0.7;
  return Number(distance.toFixed(1));
}

function formatWalkMinutes(distanceKm) {
  return Math.max(3, Math.round(distanceKm * 4));
}

function getAddressByName(name, category) {
  if (name.toLowerCase().includes("văn miếu") || name.toLowerCase().includes("bảo tàng")) {
    return "Quận Đống Đa, Hà Nội";
  }
  if (name.toLowerCase().includes("công viên")) {
    return "Hai Bà Trưng, Hà Nội";
  }
  if (category === "hotel") {
    return "Hoàn Kiếm, Hà Nội";
  }
  return "Khu phố trung tâm";
}

function getTags(category, visualType) {
  if (visualType === "landmark") return ["Di tích lịch sử", "Check-in đẹp"];
  if (visualType === "food") return ["Đặc sản địa phương", "Phù hợp buổi sáng"];
  if (category === "shopping") return ["Mua sắm", "Nhiều quà lưu niệm"];
  return ["Không gian đẹp", "Gần trung tâm"];
}

function getQuickActions(visualType) {
  if (visualType === "food") return ["Xem menu", "Giờ mở cửa", "Lịch sử tòa nhà"];
  if (visualType === "landmark") return ["Lịch sử", "Giờ mở cửa", "Điểm nổi bật"];
  return ["Không gian", "Giờ mở cửa", "Điểm chụp đẹp"];
}

export function inferCategoryByPoiId(poiId) {
  if (!poiId) return "cafe";
  return CATEGORY_ROTATION[(Number(poiId) - 1) % CATEGORY_ROTATION.length];
}

export function normalizePoiForExplore(poi, translations = []) {
  const translation = translations.find((item) => item.poi_id === poi.id && item.language === "vi")
    || translations.find((item) => item.poi_id === poi.id)
    || null;

  const normalizedName = translation?.name || `POI #${poi.id}`;
  if (isPoiHiddenByName(normalizedName)) {
    return null;
  }

  const lowerName = (translation?.name || "").toLowerCase();
  const visualType = lowerName.includes("pho")
    ? "food"
    : lowerName.includes("bao tang") || lowerName.includes("cong vien")
      ? "landmark"
      : VISUAL_TYPE_ROTATION[(Number(poi.id) - 1) % VISUAL_TYPE_ROTATION.length];

  const distanceKm = formatDistanceForPoi(poi.id);
  const walkMinutes = formatWalkMinutes(distanceKm);
  const image = IMAGE_LIBRARY[(Number(poi.id) - 1) % IMAGE_LIBRARY.length];
  const address = getAddressByName(translation?.name || `POI #${poi.id}`, inferCategoryByPoiId(poi.id));
  const rating = Number((4.2 + ((Number(poi.id) % 5) * 0.15)).toFixed(1));
  const reviewCount = 430 + Number(poi.id) * 170;
  const openingHours = visualType === "food" ? "07:00 - 22:00" : "08:00 - 18:00";
  const ticketLabel = visualType === "landmark" ? "Miễn phí tham quan" : "Phù hợp ghé nhanh";
  const category = inferCategoryByPoiId(poi.id);

  return {
    ...poi,
    name: normalizedName,
    description: translation?.description || "",
    category,
    visualType,
    categoryLabel: CATEGORY_LABELS[category] || "Khám phá",
    image,
    heroImage: image,
    address,
    distanceKm,
    walkMinutes,
    rating,
    reviewCount,
    openingHours,
    ticketLabel,
    tags: getTags(category, visualType),
    quickActions: getQuickActions(visualType),
  };
}

export function filterPoiList(poiList, filters) {
  const query = (filters?.query || "").trim().toLowerCase();
  const category = filters?.category || "all";

  return poiList.filter((poi) => {
    const categoryMatch = category === "all" || poi.category === category;
    const queryMatch = !query
      || poi.name.toLowerCase().includes(query)
      || poi.description.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
}

export function getPoiById(poiList, poiId) {
  return (poiList || []).find((poi) => poi.id === poiId) || null;
}

export function buildPoiRecommendationText(poi) {
  if (!poi) return "Tôi có thể gợi ý thêm các điểm gần bạn.";

  if (poi.visualType === "food") {
    return `Một lựa chọn tuyệt vời là ${poi.name} cách bạn khoảng ${poi.distanceKm} km. Không gian ở đây phù hợp để nghỉ chân và thưởng thức đặc sản địa phương.`;
  }

  if (poi.visualType === "landmark") {
    return `${poi.name} là điểm đến nổi bật gần bạn, rất phù hợp nếu bạn muốn tìm hiểu câu chuyện lịch sử và chụp ảnh check-in.`;
  }

  return `${poi.name} là một gợi ý phù hợp cho hành trình hiện tại của bạn, đặc biệt nếu bạn muốn trải nghiệm không gian đẹp gần trung tâm.`;
}
