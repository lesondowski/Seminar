import { apiClient } from './apiClient'
import { POI } from '@wander/shared'

export const getPOIs = (): Promise<POI[]> => apiClient.get<POI[]>('/pois')

export const getPOI = (id: number): Promise<POI> => apiClient.get<POI>(`/pois/${id}`)

export const scanQR = (qr: string): Promise<POI> => apiClient.post<POI>('/scan', { qr_code: qr })

export const markProgress = (userId: string, poiId: number): Promise<any> => apiClient.post('/progress', { user_id: userId, poi_id: poiId })

export const getProgress = (userId: string): Promise<any[]> => apiClient.get(`/progress/${userId}`)