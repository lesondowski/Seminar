import { usePOIs } from '../hooks/usePOI'

const POIList = () => {
  const { pois, loading, error } = usePOIs()

  if (loading) return <div>Loading POIs...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Points of Interest</h2>
      <ul>
        {pois.map(poi => (
          <li key={poi.id}>
            <strong>{poi.name}</strong>: {poi.description}
            <br />
            Location: {poi.latitude}, {poi.longitude}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default POIList