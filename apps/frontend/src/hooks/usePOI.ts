import { useState, useEffect } from 'react'
import { POI, Progress } from '@wander/shared'
import * as poiService from '../services/poiService'

export const usePOIs = () => {
  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    poiService.getPOIs()
      .then(setPois)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { pois, loading, error }
}

export const usePOI = (id: number) => {
  const [poi, setPoi] = useState<POI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    poiService.getPOI(id)
      .then(setPoi)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  return { poi, loading, error }
}

export const useScanQR = () => {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const scan = async (qr: string) => {
    setScanning(true)
    setError(null)
    try {
      const poi = await poiService.scanQR(qr)
      return poi
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setScanning(false)
    }
  }

  return { scan, scanning, error }
}

export const useProgress = (userId: string) => {
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    poiService.getProgress(userId)
      .then(setProgress)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  const mark = async (poiId: number) => {
    try {
      const p = await poiService.markProgress(userId, poiId)
      setProgress(prev => [...prev, p])
    } catch (err) {
      setError(err as Error)
    }
  }

  return { progress, loading, error, mark }
}