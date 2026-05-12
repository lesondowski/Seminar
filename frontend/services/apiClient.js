import { mockRequest } from "@/mocks/mockServer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK || "true") === "true";

function buildHeaders({ token, headers }) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };
}

export async function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body || null;
  const headers = buildHeaders({ token: options.token, headers: options.headers });

  if (USE_MOCK) {
    const mockResponse = await mockRequest({ path, method, body, headers });
    if (mockResponse.status >= 400) {
      throw {
        status: mockResponse.status,
        ...mockResponse.body,
      };
    }

    return mockResponse.body;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      ...data,
    };
  }

  return data;
}
