import { request } from "@/services/apiClient";

export function scanQr(qrCode) {
  return request("/api/v1/auth/scan-qr", {
    method: "POST",
    body: { qr_code: qrCode },
  });
}

export function paymentMock(sessionId, accessToken) {
  return request("/api/v1/auth/payment/mock", {
    method: "POST",
    token: accessToken,
    body: { session_id: sessionId },
  });
}

export function refreshToken() {
  return request("/api/v1/auth/refresh", {
    method: "POST",
  });
}

export function logout(accessToken) {
  return request("/api/v1/auth/logout", {
    method: "POST",
    token: accessToken,
  });
}
