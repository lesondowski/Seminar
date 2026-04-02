import { mockTours } from '../../../utils/api/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(mockTours);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
