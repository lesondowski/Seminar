import { request } from "@/services/apiClient";

export function getBootstrap(accessToken) {
  return request("/api/v1/bootstrap", {
    method: "GET",
    token: accessToken,
  });
}
