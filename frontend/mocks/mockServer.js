import { bootstrapFixture } from "@/mocks/bootstrapFixture";

const FALLBACK_MESSAGE = "Toi chi ho tro thong tin tham quan tai day.";
const DEFAULT_LATENCY_MS = 420;
const ADMIN_CREDENTIALS = { username: "admin", password: "admin" };
const SHARED_DATA_KEY = "gps_mock_shared_data";

let visitorSession = null;
let adminSession = null;
let publishedBootstrap = cloneBootstrap(bootstrapFixture);
let draftAdminState = buildDraftState(bootstrapFixture);

function loadSharedData() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SHARED_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSharedData() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      SHARED_DATA_KEY,
      JSON.stringify({
        publishedBootstrap,
        draftAdminState,
      })
    );
  } catch {
    // Ignore storage errors in mock mode
  }
}

function syncSharedData() {
  const shared = loadSharedData();
  if (shared?.publishedBootstrap && shared?.draftAdminState) {
    publishedBootstrap = shared.publishedBootstrap;
    draftAdminState = shared.draftAdminState;
    return;
  }

  saveSharedData();
}

function getMockScenarios() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem("gps_mock_scenarios");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function success(data) {
  return { success: true, data, error: null };
}

function error(code, message) {
  return { success: false, data: null, error: { code, message } };
}

function wait(ms = 400) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function makeToken() {
  return `mock-token-${Date.now()}`;
}

function makeAdminToken() {
  return `mock-admin-token-${Date.now()}`;
}

function cloneBootstrap(source) {
  return JSON.parse(JSON.stringify(source));
}

function buildDraftState(source) {
  const cloned = cloneBootstrap(source);
  return {
    site: cloned.site,
    app_config: cloned.app_config,
    pois: cloned.pois.map((poi) => ({
      ...poi,
      translations: cloned.translations.filter((translation) => translation.poi_id === poi.id),
    })),
    tours: cloned.tours.map((tour) => ({ ...tour })),
  };
}

function buildPublishedPayload() {
  return cloneBootstrap(publishedBootstrap);
}

function normalizePoiInput(input) {
  const translations = (input.translations || [])
    .filter((translation) => translation.name || translation.description || translation.audio_url)
    .map((translation) => ({
      language: translation.language,
      name: translation.name || "",
      description: translation.description || "",
      audio_url: translation.audio_url || null,
    }));

  return {
    id: input.id,
    site_id: 101,
    lat: Number(input.lat),
    lng: Number(input.lng),
    trigger_radius: Number(input.trigger_radius || 5),
    translations,
  };
}

function normalizeTourInput(input) {
  return {
    id: input.id,
    site_id: 101,
    name: input.name?.trim() || "",
    poi_ids: (input.poi_ids || []).map(Number).filter(Boolean),
  };
}

function assertAuthorized(headers) {
  const token = headers?.Authorization?.replace("Bearer ", "");
  return Boolean(token && visitorSession && visitorSession.access_token === token);
}

function assertAdminAuthorized(headers) {
  const token = headers?.Authorization?.replace("Bearer ", "");
  return Boolean(token && adminSession && adminSession.access_token === token);
}

async function handleScanQr(body) {
  const scenarios = getMockScenarios();
  const qrCode = body?.qr_code?.trim();

  if (scenarios.qrStatus === "INVALID") {
    return { status: 400, body: error("QR_INVALID", "QR code is invalid") };
  }

  if (scenarios.qrStatus === "NOT_FOUND") {
    return { status: 404, body: error("QR_NOT_FOUND", "QR code not found") };
  }

  if (scenarios.qrStatus === "EXPIRED") {
    return { status: 410, body: error("QR_EXPIRED", "QR code has expired") };
  }

  if (!qrCode) {
    return { status: 400, body: error("QR_INVALID", "QR code is invalid") };
  }

  if (qrCode === "INVALID") {
    return { status: 400, body: error("QR_INVALID", "QR code is invalid") };
  }

  if (qrCode === "NOT_FOUND") {
    return { status: 404, body: error("QR_NOT_FOUND", "QR code not found") };
  }

  if (qrCode === "EXPIRED") {
    return { status: 410, body: error("QR_EXPIRED", "QR code has expired") };
  }

  const requiresPayment = qrCode === "SITE-PAID-XYZ789";
  visitorSession = {
    session_id: crypto.randomUUID(),
    site_id: 101,
    requires_payment: requiresPayment,
    session_state: requiresPayment ? "created" : "active",
    access_token: makeToken(),
  };

  return {
    status: 200,
    body: success({
      access_token: visitorSession.access_token,
      token_type: "bearer",
      session_id: visitorSession.session_id,
      site_id: visitorSession.site_id,
      requires_payment: visitorSession.requires_payment,
      session_state: visitorSession.session_state,
      access_token_expires_in_seconds: 1800,
    }),
  };
}

async function handlePayment() {
  if (!visitorSession) {
    return { status: 401, body: error("UNAUTHORIZED", "Session not initialized") };
  }

  visitorSession.session_state = "active";
  return {
    status: 200,
    body: success({
      session_id: visitorSession.session_id,
      payment_status: "paid",
      session_state: "active",
    }),
  };
}

async function handleBootstrap(headers) {
  const scenarios = getMockScenarios();

  if (scenarios.bootstrapStatus === 401) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  if (scenarios.bootstrapStatus === 409) {
    return { status: 409, body: error("BOOTSTRAP_INCONSISTENT", "Bootstrap snapshot is inconsistent") };
  }

  if (scenarios.bootstrapStatus === 413) {
    return { status: 413, body: error("BOOTSTRAP_TOO_LARGE", "Bootstrap payload too large") };
  }

  if (!assertAuthorized(headers) || visitorSession?.session_state !== "active") {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const payload = buildPublishedPayload();
  visitorSession.bootstrap_version = payload.bootstrap_version;
  return { status: 200, body: payload, raw: true };
}

async function handleChat(body, headers) {
  const scenarios = getMockScenarios();

  if (!assertAuthorized(headers) || visitorSession?.session_state !== "active") {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const message = body?.message?.trim();
  if (!message) {
    return {
      status: 400,
      body: error("VALIDATION_ERROR", "message is required"),
    };
  }

  if (body?.bootstrap_version !== visitorSession?.bootstrap_version) {
    return {
      status: 409,
      body: error(
        "BOOTSTRAP_VERSION_MISMATCH",
        "Bootstrap version does not match session"
      ),
    };
  }

  if (scenarios.chatMode === "mismatch") {
    return {
      status: 409,
      body: error(
        "BOOTSTRAP_VERSION_MISMATCH",
        "Bootstrap version does not match session"
      ),
    };
  }

  if (scenarios.chatMode === "rateLimit") {
    return {
      status: 429,
      body: error("RATE_LIMITED", "Too many requests"),
    };
  }

  if (scenarios.chatMode === "timeoutFallback") {
    return {
      status: 200,
      body: success({
        answer: FALLBACK_MESSAGE,
        source_type: "published_data",
        latency_ms: DEFAULT_LATENCY_MS,
      }),
    };
  }

  if (message.toLowerCase().includes("rate")) {
    return {
      status: 429,
      body: error("RATE_LIMITED", "Too many requests"),
    };
  }

  const isFallback = message.toLowerCase().includes("timeout");
  return {
    status: 200,
    body: success({
      answer: isFallback
        ? FALLBACK_MESSAGE
        : "Ban dang o khu tham quan chinh. Hay mo POI de nghe audio.",
      source_type: "published_data",
      latency_ms: DEFAULT_LATENCY_MS,
    }),
  };
}

async function handleRefresh() {
  if (!visitorSession || visitorSession.session_state !== "active") {
    return { status: 401, body: error("SESSION_EXPIRED", "Session expired") };
  }

  visitorSession.access_token = makeToken();
  return {
    status: 200,
    body: success({
      access_token: visitorSession.access_token,
      token_type: "bearer",
      session_id: visitorSession.session_id,
      session_state: visitorSession.session_state,
      access_token_expires_in_seconds: 1800,
    }),
  };
}

async function handleLogout() {
  if (visitorSession) {
    visitorSession.session_state = "revoked";
  }

  return {
    status: 200,
    body: success({
      message: "Logged out",
    }),
  };
}

async function handleAdminLogin(body) {
  const username = body?.username?.trim();
  const password = body?.password;

  if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
    return {
      status: 401,
      body: error("INVALID_CREDENTIALS", "Sai ten dang nhap hoac mat khau"),
    };
  }

  adminSession = {
    username,
    access_token: makeAdminToken(),
  };

  return {
    status: 200,
    body: success({
      access_token: adminSession.access_token,
      username: adminSession.username,
    }),
  };
}

async function handleAdminPois(headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  return {
    status: 200,
    body: success({ pois: draftAdminState.pois }),
  };
}

async function handleAdminCreatePoi(body, headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const nextId = Math.max(0, ...draftAdminState.pois.map((poi) => poi.id)) + 1;
  const poi = normalizePoiInput({ ...body, id: nextId });
  draftAdminState.pois.push(poi);
  saveSharedData();

  return { status: 201, body: success({ poi }) };
}

async function handleAdminUpdatePoi(path, body, headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const poiId = Number(path.split("/").pop());
  const index = draftAdminState.pois.findIndex((poi) => poi.id === poiId);
  if (index === -1) {
    return { status: 404, body: error("POI_NOT_FOUND", "POI not found") };
  }

  const poi = normalizePoiInput({ ...body, id: poiId });
  draftAdminState.pois[index] = poi;
  draftAdminState.tours = draftAdminState.tours.map((tour) => ({
    ...tour,
    poi_ids: tour.poi_ids.filter((id) => draftAdminState.pois.some((draftPoi) => draftPoi.id === id)),
  }));
  saveSharedData();

  return { status: 200, body: success({ poi }) };
}

async function handleAdminDeletePoi(path, headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const poiId = Number(path.split("/").pop());
  draftAdminState.pois = draftAdminState.pois.filter((poi) => poi.id !== poiId);
  draftAdminState.tours = draftAdminState.tours.map((tour) => ({
    ...tour,
    poi_ids: tour.poi_ids.filter((id) => id !== poiId),
  }));
  saveSharedData();

  return { status: 200, body: success({ deleted: true }) };
}

async function handleAdminTours(headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  return {
    status: 200,
    body: success({
      tours: draftAdminState.tours,
      pois: draftAdminState.pois,
    }),
  };
}

async function handleAdminCreateTour(body, headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const nextId = Math.max(0, ...draftAdminState.tours.map((tour) => tour.id)) + 1;
  const tour = normalizeTourInput({ ...body, id: nextId });
  draftAdminState.tours.push(tour);
  saveSharedData();

  return { status: 201, body: success({ tour }) };
}

async function handleAdminUpdateTour(path, body, headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const tourId = Number(path.split("/").pop());
  const index = draftAdminState.tours.findIndex((tour) => tour.id === tourId);
  if (index === -1) {
    return { status: 404, body: error("TOUR_NOT_FOUND", "Tour not found") };
  }

  const tour = normalizeTourInput({ ...body, id: tourId });
  draftAdminState.tours[index] = tour;
  saveSharedData();
  return { status: 200, body: success({ tour }) };
}

async function handleAdminDeleteTour(path, headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const tourId = Number(path.split("/").pop());
  draftAdminState.tours = draftAdminState.tours.filter((tour) => tour.id !== tourId);
  saveSharedData();
  return { status: 200, body: success({ deleted: true }) };
}

async function handleAdminPublish(body, headers) {
  if (!assertAdminAuthorized(headers)) {
    return { status: 401, body: error("UNAUTHORIZED", "Unauthorized") };
  }

  const scenarios = getMockScenarios();

  if (scenarios.publishLock) {
    return { status: 409, body: error("PUBLISH_LOCKED", "Publish is locked by another session") };
  }

  if (body?.simulate === "PUBLISH_LOCKED") {
    return { status: 409, body: error("PUBLISH_LOCKED", "Publish is locked by another session") };
  }

  await wait(800);
  const publishedAt = new Date().toISOString();
  publishedBootstrap = {
    site: cloneBootstrap(draftAdminState.site),
    app_config: cloneBootstrap(draftAdminState.app_config),
    pois: draftAdminState.pois.map(({ translations, ...poi }) => ({ ...poi })),
    translations: draftAdminState.pois.flatMap((poi) =>
      poi.translations.map((translation) => ({
        ...translation,
        poi_id: poi.id,
      }))
    ),
    tours: draftAdminState.tours.map((tour) => ({ ...tour })),
    published_at: publishedAt,
    bootstrap_version: `site-101-published-${publishedAt.replace(/[:.]/g, "-")}`,
  };
  saveSharedData();

  return {
    status: 200,
    body: success({
      bootstrap_version: publishedBootstrap.bootstrap_version,
      published_at: publishedBootstrap.published_at,
    }),
  };
}

export async function mockRequest({ path, method, body, headers }) {
  syncSharedData();
  await wait();

  if (path === "/api/v1/admin/login" && method === "POST") {
    return handleAdminLogin(body);
  }

  if (path === "/api/v1/admin/pois" && method === "GET") {
    return handleAdminPois(headers);
  }

  if (path === "/api/v1/admin/pois" && method === "POST") {
    return handleAdminCreatePoi(body, headers);
  }

  if (path.startsWith("/api/v1/admin/pois/") && method === "PUT") {
    return handleAdminUpdatePoi(path, body, headers);
  }

  if (path.startsWith("/api/v1/admin/pois/") && method === "DELETE") {
    return handleAdminDeletePoi(path, headers);
  }

  if (path === "/api/v1/admin/tours" && method === "GET") {
    return handleAdminTours(headers);
  }

  if (path === "/api/v1/admin/tours" && method === "POST") {
    return handleAdminCreateTour(body, headers);
  }

  if (path.startsWith("/api/v1/admin/tours/") && method === "PUT") {
    return handleAdminUpdateTour(path, body, headers);
  }

  if (path.startsWith("/api/v1/admin/tours/") && method === "DELETE") {
    return handleAdminDeleteTour(path, headers);
  }

  if (path === "/api/v1/admin/publish" && method === "POST") {
    return handleAdminPublish(body, headers);
  }

  if (path === "/api/v1/auth/scan-qr" && method === "POST") {
    return handleScanQr(body);
  }

  if (path === "/api/v1/auth/payment/mock" && method === "POST") {
    return handlePayment();
  }

  if (path === "/api/v1/bootstrap" && method === "GET") {
    return handleBootstrap(headers);
  }

  if (path === "/api/v1/chat" && method === "POST") {
    return handleChat(body, headers);
  }

  if (path === "/api/v1/auth/refresh" && method === "POST") {
    return handleRefresh();
  }

  if (path === "/api/v1/auth/logout" && method === "POST") {
    return handleLogout();
  }

  return {
    status: 404,
    body: error("RESOURCE_NOT_FOUND", `No mock route for ${method} ${path}`),
  };
}
