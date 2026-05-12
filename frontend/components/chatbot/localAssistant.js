import { buildPoiRecommendationText } from "@/components/map/explore/poiExploreUtils";

function findBestPoi(query, poiList, contextPoiId) {
  const normalizedQuery = query.toLowerCase();
  const directMatch = (poiList || []).find((poi) => `${poi.name} ${poi.description} ${poi.categoryLabel}`.toLowerCase().includes(normalizedQuery));
  if (directMatch) return directMatch;

  if (normalizedQuery.includes("cà phê") || normalizedQuery.includes("ca phe") || normalizedQuery.includes("kiến trúc") || normalizedQuery.includes("kian truc")) {
    return (poiList || []).find((poi) => poi.visualType === "food") || poiList?.[0] || null;
  }

  if (normalizedQuery.includes("lịch sử") || normalizedQuery.includes("lich su") || normalizedQuery.includes("điểm nổi bật") || normalizedQuery.includes("di tích") || normalizedQuery.includes("di tich")) {
    return (poiList || []).find((poi) => poi.visualType === "landmark") || poiList?.[0] || null;
  }

  if (contextPoiId) {
    return (poiList || []).find((poi) => poi.id === contextPoiId) || null;
  }

  return poiList?.[0] || null;
}

export function buildAssistantReply({ query, poiList, contextPoiId }) {
  const poi = findBestPoi(query, poiList, contextPoiId);
  const normalizedQuery = query.toLowerCase();

  if (!poi) {
    return {
      text: "Tôi đang sẵn sàng gợi ý các điểm tham quan và trải nghiệm gần bạn.",
      poi: null,
      actions: [],
    };
  }

  if (normalizedQuery.includes("giờ mở cửa") || normalizedQuery.includes("gio mo cua")) {
    return {
      text: `${poi.name} hiện mở cửa từ ${poi.openingHours}. Đây là khoảng thời gian phù hợp để bạn ghé thăm hôm nay.`,
      poi,
      actions: poi.quickActions,
    };
  }

  if (normalizedQuery.includes("lịch sử") || normalizedQuery.includes("lich su")) {
    return {
      text: `${poi.name} mang nhiều giá trị văn hóa và lịch sử. ${poi.description || "Đây là một địa điểm rất phù hợp để bắt đầu hành trình khám phá của bạn."}`,
      poi,
      actions: poi.quickActions,
    };
  }

  return {
    text: buildPoiRecommendationText(poi),
    poi,
    actions: poi.quickActions,
  };
}
