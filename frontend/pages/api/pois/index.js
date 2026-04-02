import { mockPOIs } from '../../../utils/api/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return all POIs
    return res.status(200).json(mockPOIs);
  }

  if (req.method === 'POST') {
    // Create new POI
    const newPOI = {
      id: Math.max(...mockPOIs.map((p) => p.id), 0) + 1,
      ...req.body,
      status: 'pending', // BR-002
    };

    mockPOIs.push(newPOI);
    return res.status(201).json(newPOI);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
