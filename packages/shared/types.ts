export interface POI {
  id: number
  name: string
  description: string
  latitude: number
  longitude: number
  image: string
  qrcodes: QRCode[]
}

export interface QRCode {
  id: number
  code: string
  poi_id: number
}

export interface Progress {
  id: number
  user_id: string
  poi_id: number
  completed_at: string
}

export interface ScanRequest {
  qr_code: string
}

export interface ProgressRequest {
  user_id: string
  poi_id: number
}