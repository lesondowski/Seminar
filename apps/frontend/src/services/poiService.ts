const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const getPOIs = async (): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/pois`)
  return res.json()
}

export const getPOI = async (id: number): Promise<any> => {
  const res = await fetch(`${API_BASE}/pois/${id}`)
  return res.json()
}

export const scanQR = async (qr: string): Promise<any> => {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qr_code: qr })
  })
  return res.json()
}

export const markProgress = async (userId: string, poiId: number): Promise<any> => {
  const res = await fetch(`${API_BASE}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, poi_id: poiId })
  })
  return res.json()
}

export const getProgress = async (userId: string): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/progress/${userId}`)
  return res.json()
}