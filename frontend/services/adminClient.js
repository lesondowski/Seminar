import { request } from "@/services/apiClient";

export async function loginAdmin(credentials) {
  return request("/api/v1/admin/login", {
    method: "POST",
    body: credentials,
  });
}

export async function getAdminPois(token) {
  return request("/api/v1/admin/pois", {
    method: "GET",
    token,
  });
}

export async function createAdminPoi(poi, token) {
  return request("/api/v1/admin/pois", {
    method: "POST",
    body: poi,
    token,
  });
}

export async function updateAdminPoi(id, poi, token) {
  return request(`/api/v1/admin/pois/${id}`, {
    method: "PUT",
    body: poi,
    token,
  });
}

export async function deleteAdminPoi(id, token) {
  return request(`/api/v1/admin/pois/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminTours(token) {
  return request("/api/v1/admin/tours", {
    method: "GET",
    token,
  });
}

export async function createAdminTour(tour, token) {
  return request("/api/v1/admin/tours", {
    method: "POST",
    body: tour,
    token,
  });
}

export async function updateAdminTour(id, tour, token) {
  return request(`/api/v1/admin/tours/${id}`, {
    method: "PUT",
    body: tour,
    token,
  });
}

export async function deleteAdminTour(id, token) {
  return request(`/api/v1/admin/tours/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function publishAdminSite(token, payload) {
  return request("/api/v1/admin/publish", {
    method: "POST",
    token,
    body: payload || {},
  });
}

export async function getMonitorOnlineDevices(windowMinutes = 5) {
  return request(`/api/v1/monitor/online-devices?window_minutes=${windowMinutes}`, {
    method: "GET",
  });
}