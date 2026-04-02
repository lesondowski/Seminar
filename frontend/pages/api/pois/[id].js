import { mockPOIs } from '../../../../utils/api/mockData';

export default function handler(req, res) {
  const { id } = req.query;
  const poi = mockPOIs.find((p) => p.id === parseInt(id));

  if (!poi) {
    return res.status(404).json({ error: 'POI not found' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(poi);
  }

  if (req.method === 'PUT') {
    // Update POI
    Object.assign(poi, req.body);
    return res.status(200).json(poi);
  }

  if (req.method === 'DELETE') {
    // Delete POI
    const index = mockPOIs.findIndex((p) => p.id === parseInt(id));
    mockPOIs.splice(index, 1);
    return res.status(200).json({ message: 'POI deleted' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
