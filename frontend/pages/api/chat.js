export default function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    // Simple chatbot responses (in real app, connect to AI backend)
    let response = 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại.';

    if (message.toLowerCase().includes('quán') || message.toLowerCase().includes('ăn')) {
      response = 'Có nhiều quán ăn ngon ở khu phố ẩm thực Vĩnh Khánh. Hãy xem bản đồ để khám phá!';
    } else if (message.toLowerCase().includes('giá') || message.toLowerCase().includes('bao nhiêu')) {
      response = 'Giá cả các quán khác nhau, từ 15,000 đến 50,000 VND tùy theo quán. Xem chi tiết trên bản đồ!';
    } else if (message.toLowerCase().includes('gần') || message.toLowerCase().includes('gợi ý')) {
      response = 'Món ăn nổi tiếng: Bánh mì, Cơm tấm, Phở. Bạn muốn biết thêm về món nào?';
    }

    return res.status(200).json({ response });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
