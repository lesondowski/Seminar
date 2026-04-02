// README - Cấu trúc dự án Smart Food Tour App

## 📁 Cấu trúc thư mục

```
frontend/
├── assets/              # Tài nguyên tĩnh
│   ├── images/         # Hình ảnh, POI images
│   ├── icons/          # Các biểu tượng
│   └── audio/          # Tệp audio guide
├── components/         # React components
│   ├── common/         # Các component chung (Button, Input, Modal...)
│   ├── map/            # Map, POI, TourMode components
│   └── chatbot/        # Chatbot components
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   ├── auth/           # Login page
│   ├── explorer/       # Map, Chat pages
│   ├── admin/          # Admin dashboard
│   ├── tour/           # Tour mode
│   └── _app.js         # App wrapper
├── styles/             # CSS/Tailwind styles
├── utils/              # Utility functions
│   ├── api/            # API calls, mock data
│   ├── auth/           # Auth functions
│   ├── map/            # Map utilities
│   └── validation.js   # Validation functions
├── public/             # Static files
├── package.json        # Dependencies
├── next.config.js      # Next.js config
├── tailwind.config.js  # Tailwind config
└── .env.local          # Environment variables
```

## 🚀 Cách chạy

```bash
npm install      # Cài dependencies
npm run dev      # Chạy dev server (port 3001)
npm run build    # Build for production
npm run start    # Start production server
```

## 🔑 Tính năng MVP

### 1. Login & Authentication ✓
- Đăng nhập qua email
- Chọn ngôn ngữ (Tiếng Việt, English, 中文)
- Lưu user info vào localStorage

### 2. Map Screen ✓
- Hiển thị bản đồ với POI markers
- Zoom in/out
- Tìm POI gần nhất
- Chọn POI để xem chi tiết

### 3. POI Detail ✓
- Hiển thị thông tin chi tiết POI
- Audio player
- Xem hình ảnh
- Liên hệ quán

### 4. Tour Mode ✓
- Danh sách POI theo thứ tự
- GPS tracking
- Auto-play audio khi gần POI
- Điều hướng qua các POI

### 5. Chatbot ✓
- Chat UI với messages
- Gửi câu hỏi, nhận trả lời
- Loading states
- Simple Q&A logic

### 6. Admin Dashboard ✓
- Danh sách POI với status
- Thêm/sửa/xóa POI
- Form validation
- Table view

## 📋 Business Rules đã implement

- **BR-001**: Validation email trong login
- **BR-002**: POI pending approval (admin)
- **BR-003**: Display nearby POIs
- **BR-004**: Auto-trigger POI content khi gần trong tour

## 🎨 Design System

- **Colors**: Blue (#2563eb), Green (#16a34a), Red (#dc2626)
- **Spacing**: Tailwind 4px grid
- **Typography**: Bold headers, regular body
- **Responsive**: Mobile-first, tested on mobile

## 🔧 Công nghệ

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **State Management**: React hooks
- **APIs**: Next.js API routes

## 📱 Pages

| Page | Route | Purpose |
|------|-------|---------|
| Login | /auth/login | Đăng nhập |
| Map | /explorer/map | Khám phá bản đồ |
| Chat | /explorer/chat | Hỏi chatbot |
| Tour | /tour/tour-mode | Tour mode |
| Admin | /admin/dashboard | Quản lý POI |
| 404 | /404 | Page not found |

## 📚 Components

### Common
- Button, Input, Select, Modal, Loading, Navbar, Table

### Map
- MapComponent, POIDetail, TourMode

### Chatbot
- ChatbotComponent

## 🔐 Authentication

- Email validation
- localStorage for user data
- Role-based access (visitor, admin, restaurant)

## 🐛 Known Issues & Improvements

- [ ] Thay thế bản đồ giả bằng Google Maps / Leaflet
- [ ] Kết nối backend API thực
- [ ] Thêm real GPS tracking
- [ ] Kết nối AI chatbot backend
- [ ] Thêm payment integration
- [ ] Deploy lên server

## 📞 Support

Liên hệ: info@smartfoodtour.com

---

**Created**: April 1, 2026
**Version**: 0.1.0 (MVP)
