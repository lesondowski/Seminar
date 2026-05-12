import { request } from "@/services/apiClient";

export function postChat(payload, accessToken) {
  return request("/api/v1/chat", {
    method: "POST",
    token: accessToken,
    body: payload,
  });
}
