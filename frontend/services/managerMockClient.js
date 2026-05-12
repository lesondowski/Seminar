import {
  createAdminPoi,
  deleteAdminPoi,
  getAdminPois,
  loginAdmin,
  updateAdminPoi,
} from "@/services/adminClient";

function tokenOrThrow() {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("managerToken") : null;
  if (!token) {
    throw { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập lại" } };
  }
  return token;
}

function toManagerPoi(row) {
  const vi = (row.translations || []).find((t) => t.language === "vi") || row.translations?.[0] || null;
  return {
    id: row.id,
    site_id: row.site_id,
    name: vi?.name || `POI #${row.id}`,
    narration: vi?.description || "",
    lat: row.lat,
    lng: row.lng,
    display_lat: row.lat,
    display_lng: row.lng,
    trigger_radius: row.trigger_radius || 5,
    images: row.image_url ? [row.image_url] : [],
    address: "Khu trung tâm",
    category: "POI",
    rating: 4.5,
    status: "active",
    updated_at: new Date().toISOString().slice(0, 10),
    translations: row.translations || [],
  };
}

function toAdminPoiPayload(payload) {
  return {
    lat: Number(payload.lat),
    lng: Number(payload.lng),
    trigger_radius: Number(payload.trigger_radius || 5),
    translations: [
      {
        language: "vi",
        name: payload.name || "",
        description: payload.narration || payload.description || "",
        audio_url: "",
      },
      {
        language: "en",
        name: payload.name || "",
        description: "",
        audio_url: "",
      },
    ],
  };
}

export const managerMockClient = {
  async login(username, password) {
    // Map manager login form to current backend admin auth for local integration.
    if (!(username === "manager_a" && password === "demo")) {
      throw { error: { code: "INVALID_CREDENTIALS", message: "Sai tài khoản hoặc mật khẩu" } };
    }

    const response = await loginAdmin({ username: "admin", password: "admin" });
    return {
      access_token: response.data.access_token,
      username: "manager_a",
      display_name: "Store Manager",
      session_scope: "manager",
    };
  },

  async listPois() {
    const token = tokenOrThrow();
    const response = await getAdminPois(token);
    return (response.data.pois || []).map(toManagerPoi);
  },

  async getPoi(id) {
    const items = await this.listPois();
    const poi = items.find((p) => p.id === id);
    if (!poi) {
      throw { error: { code: "NOT_FOUND", message: "Không tìm thấy địa điểm" } };
    }
    return poi;
  },

  async createPoi(payload) {
    const token = tokenOrThrow();
    const response = await createAdminPoi(toAdminPoiPayload(payload), token);
    return toManagerPoi(response.data.poi);
  },

  async updatePoi(id, payload) {
    const token = tokenOrThrow();
    const response = await updateAdminPoi(id, toAdminPoiPayload(payload), token);
    return toManagerPoi(response.data.poi);
  },

  async deletePoi(id) {
    const token = tokenOrThrow();
    await deleteAdminPoi(id, token);
    return { success: true };
  },

  async stats() {
    const items = await this.listPois();
    return {
      total: items.length,
      active: items.filter((p) => p.status === "active").length,
      draft: items.filter((p) => p.status === "draft").length,
      recent: [...items].slice(0, 5),
    };
  },
};
