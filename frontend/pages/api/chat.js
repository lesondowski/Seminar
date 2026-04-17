export default function handler(req, res) {
  if (req.method === 'POST') {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const nearby = Array.isArray(context?.nearbyPOIs) ? context.nearbyPOIs : [];

    // Simple chatbot responses (in real app, connect to AI backend)
    let response = 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại.';

    if (message.toLowerCase().includes('quán') || message.toLowerCase().includes('ăn')) {
      if (nearby.length > 0) {
        const top3 = nearby
          .slice(0, 3)
          .map((poi) => `${poi.name} (${(poi.distanceKm || 0).toFixed(2)} km)`)
          .join(', ');
        response = `Gan ban nhat hien co: ${top3}. Ban muon toi goi y theo mon hay theo gia?`;
      } else {
        response = 'Có nhiều quán ăn ngon ở khu phố ẩm thực Vĩnh Khánh. Hãy xem bản đồ để khám phá!';
      }
    } else if (message.toLowerCase().includes('giá') || message.toLowerCase().includes('bao nhiêu')) {
      response = 'Giá cả các quán khác nhau, từ 15,000 đến 50,000 VND tùy theo quán. Xem chi tiết trên bản đồ!';
    } else if (message.toLowerCase().includes('gần') || message.toLowerCase().includes('gợi ý')) {
      if (nearby.length > 0) {
        const nearbyNames = nearby.slice(0, 3).map((poi) => poi.name).join(', ');
        response = `Mon goi y gan ban: ${nearbyNames}. Ban can them thong tin ve duong di khong?`;
      } else {
        response = 'Món ăn nổi tiếng: Bánh mì, Cơm tấm, Phở. Bạn muốn biết thêm về món nào?';
      }
    }

    return res.status(200).json({ response });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
