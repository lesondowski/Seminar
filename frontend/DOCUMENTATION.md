# Smart Food Tour App - Frontend Documentation

## 🎯 Project Overview

Smart Food Tour App là một web app dành cho khách tham quan khám phá khu phố ẩm thực Vĩnh Khánh. Ứng dụng cung cấp:

- 🗺️ **Bản đồ tương tác** với GPS tracking
- 🎫 **Tour mode** với danh sách POI theo thứ tự
- 🤖 **Chatbot AI** để tư vấn món ăn
- 🎙️ **Audio guide** cho từng POI
- ⚙️ **Admin dashboard** để quản lý quán ăn

**Status**: MVP (0.1.0)
**Tech Stack**: Next.js 14, React 18, Tailwind CSS
**Port**: http://localhost:3001

---

## 📁 Project Structure

### Folder Organization

```
frontend/
├── assets/              # Static assets (images, icons, audio)
├── components/
│   ├── common/         # Reusable UI components (Button, Input, Modal...)
│   ├── map/            # Map-related components
│   └── chatbot/        # Chatbot components
├── pages/
│   ├── api/            # Next.js API routes
│   ├── auth/           # Authentication pages
│   ├── explorer/       # User exploration pages (map, chat)
│   ├── admin/          # Admin management
│   ├── tour/           # Tour mode
│   └── _app.js         # App root wrapper
├── styles/             # CSS files (Tailwind)
├── utils/              # Utility functions
│   ├── api/            # API calls, mock data
│   ├── auth/           # Auth helpers
│   └── validation.js   # Input validation
└── public/             # Public static files
```

---

## 🎨 Components Guide

### Common Components

| Component | Props | Usage |
|-----------|-------|-------|
| **Button** | `children, onClick, variant, disabled` | CTAs mọi nơi |
| **Input** | `label, type, value, onChange, error` | Form inputs |
| **Select** | `label, value, onChange, options` | Dropdowns |
| **Modal** | `isOpen, onClose, title, message, type` | Alerts/confirmations |
| **Loading** | `fullScreen, text` | Loading states |
| **Navbar** | – | Navigation header |
| **Table** | `columns, data, actions, onRowClick` | Data tables |

### Map Components

- **MapComponent**: Hiển thị bản đồ tương tác với POI markers
- **POIDetail**: Chi tiết POI (tên, mô tả, audio, hình ảnh)
- **TourMode**: Tour navigation với GPS tracking

### Chatbot

- **ChatbotComponent**: Chat UI với message history

---

## 🔐 Pages & Routes

### Public Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | index.js | Home (redirect) |
| `/auth/login` | LoginForm | Đăng nhập |

### Protected Routes (Visitor)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/explorer/map` | MapScreen | Bản đồ POI |
| `/explorer/chat` | ChatPage | Chatbot |
| `/tour/tour-mode` | TourMode | Tour |

### Admin Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/dashboard` | AdminDashboard | Quản lý POI |

---

## 🧪 Features Implemented

### ✓ Login & Authentication
- Email validation (BR-001)
- Language selection (Tiếng Việt, English, 中文)
- User info stored in localStorage
- Role-based access (visitor, admin, restaurant)

### ✓ Map Screen
- Interactive map simulation
- POI markers rendering
- Zoom in/out controls
- Distance calculation
- Nearby POI list

### ✓ POI Detail
- Full POI information display
- Audio player with error handling
- Image with placeholder fallback
- Contact info

### ✓ Tour Mode
- GPS tracking (simulated)
- POI-by-POI navigation
- Auto-play audio when near POI
- Distance indicator
- Tour completion modal

### ✓ Chatbot
- Message history UI
- Typing indicators
- Simple Q&A logic
- Error handling

### ✓ Admin Dashboard
- POI CRUD operations (BR-002)
- Form validation
- POI approval status
- Table view with actions

---

## 🔄 Data Flow

### Login Flow
1. User enters email + language
2. Validation (email regex check)
3. API call to `/api/auth/login`
4. Save to localStorage
5. Redirect to `/explorer/map`

### Map Flow
1. Load POIs from mock data
2. Get user location (GPS)
3. Calculate distances
4. Display nearby POIs
5. On POI click → show detail modal

### Tour Flow
1. Select tour from list
2. Get POI list for tour
3. Get user location
4. Track distance to current POI
5. Auto-trigger audio when < 50m
6. Navigate to next POI

---

## 📊 Data Models

### POI Schema
```javascript
{
  id: number,
  name: string,
  description: string,
  price: string,
  category: string,
  image: string (URL),
  location: { lat, lng },
  audio: string (URL),
  rating: number,
  phone: string,
  website: string,
  status: 'pending' | 'approved'
}
```

### User Schema
```javascript
{
  email: string,
  language: string,
  role: 'visitor' | 'admin' | 'restaurant'
}
```

### Tour Schema
```javascript
{
  id: number,
  name: string,
  description: string,
  pois: number[], // POI IDs
  duration: string
}
```

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get profile

### POI
- `GET /api/pois` - Get all POIs
- `GET /api/pois/[id]` - Get POI by ID
- `POST /api/pois` - Create POI
- `PUT /api/pois/[id]` - Update POI
- `DELETE /api/pois/[id]` - Delete POI

### Tour
- `GET /api/tours` - Get all tours

### Chat
- `POST /api/chat` - Send message to chatbot

---

## 📝 Utility Functions

### Validation (`utils/validation.js`)
- `validateEmail(email)` - Check email format
- `validatePOI(poi)` - Validate POI data
- `validatePassword(password)` - Password validation

### Auth (`utils/auth/authService.js`)
- `loginUser(email, language)` - API login
- `getUserProfile()` - Get profile
- `logoutUser()` - Logout

### POI (`utils/api/poiService.js`)
- `fetchPOIs()` - Get all POIs
- `fetchPOIById(id)` - Get POI
- `createPOI(data)` - Create POI
- `updatePOI(id, data)` - Update POI
- `deletePOI(id)` - Delete POI

### Mock Data (`utils/api/mockData.js`)
- `mockPOIs` - Sample POI data
- `mockTours` - Sample tour data
- `mockUser` - Sample user data

---

## 🎨 Styling Guide

- **Colors**: 
  - Primary: Blue (#2563eb)
  - Success: Green (#16a34a)
  - Danger: Red (#dc2626)
  - Warning: Yellow (#d97706)

- **Design System**: Tailwind CSS
- **Responsive Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Typography**: 
  - H1: text-3xl, font-bold
  - H2: text-2xl, font-bold
  - Body: text-base, text-gray-700

---

## 🚀 Running the App

### Development
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3001
```

### Build for Production
```bash
npm run build
npm run start
```

### Test Login Credentials
- Email: любой email адрес (any email)
- Language: Select preferred language
- No actual authentication needed for MVP

---

## 🐛 Known Limitations & TODOs

### Current Limitations
- [ ] Map is simulated (need real Google Maps/Leaflet integration)
- [ ] GPS tracking is simulated
- [ ] Chatbot uses simple if/else logic (need real AI backend)
- [ ] Audio files are not included
- [ ] Images are placeholders
- [ ] Backend API is mocked with Next.js API routes

### Future Improvements
- [ ] Actual backend API (FastAPI/Node.js)
- [ ] Real map library (Leaflet/Google Maps)
- [ ] Real GPS tracking
- [ ] AI chatbot (RAG integration)
- [ ] Payment integration
- [ ] Restaurant dashboard
- [ ] Analytics & statistics
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Progressive Web App (PWA)

---

## 📱 Mobile Optimization

- Fully responsive (mobile-first)
- Touch-friendly buttons & inputs
- Optimized for landscape & portrait
- Mobile-friendly Navbar

---

## 🔒 Security Considerations

- Email validation on login
- Role-based access control
- localStorage for user data (not secure for passwords)
- Should use httpOnly cookies for production
- CORS enabled for API routes

---

## 📞 Support & Contact

- **Project**: Smart Food Tour App
- **Version**: 0.1.0 (MVP)
- **Last Updated**: April 1, 2026
- **Maintained by**: Development Team

---

## 📚 References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

