const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
}