import { usePOI } from '../../hooks/usePOI'

interface Props {
  id: number
}

export const POIDetail = ({ id }: Props) => {
  const { poi, loading } = usePOI(id)
  if (loading) return <div>Loading...</div>
  if (!poi) return <div>Not found</div>
  return (
    <div>
      <h1>{poi.name}</h1>
      <p>{poi.description}</p>
      <img src={poi.image} alt={poi.name} />
    </div>
  )
}