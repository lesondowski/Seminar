# Development Guide - Smart Food Tour App

## ⚡ Quick Start

```bash
# 1. Navigate to frontend folder
cd d:\AUDIT_CUA_LEE_JONG_SON\Tengroup\Seminar\frontend

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:3001
```

---

## 🎮 Testing the App

### Test User Flows

#### 1. Login (BR-001)
- **Happy Path**: 
  - Enter email: `user@example.com`
  - Select language: `Tiếng Việt`
  - Click "Đăng nhập"
  - Should redirect to `/explorer/map`

- **Edge Cases**:
  - Invalid email (no @): Shows error "Email không hợp lệ"
  - Empty email: Shows error "Email không được để trống"
  - No language selected: Uses default "Tiếng Việt"

#### 2. Map Screen
- **Happy Path**:
  - View simulated map with POI markers
  - Click on a POI marker (red circles)
  - POI detail shows in right panel
  - See distance to POI
  - View POI info: name, description, price, image

- **Edge Cases**:
  - Zoom too far in (> 20): Shows warning
  - Zoom too far out (< 5): Shows warning
  - Click on area with no POIs: Shows "Không có POI gần đây"

#### 3. POI Detail
- **Happy Path**:
  - Select a POI from map
  - View all details (name, description, price, category)
  - Click "▶️ Phát" to play audio
  - Pause audio if needed

- **Edge Cases**:
  - POI without audio: Shows "Audio không khả dụng"
  - POI without image: Shows placeholder image

#### 4. Tour Mode
- **Happy Path**:
  - Go to `/tour/tour-mode`
  - Select a tour from available tours
  - See tour details and POI list
  - Navigate through POIs with "Tiếp theo" button
  - When close to POI (< 50m), POI info shows
  - Complete tour at the end

- **Edge Cases**:
  - GPS disabled: Shows "Không thể kết nối GPS"
  - Off the route: Shows message to get back on track
  - Complete tour: Shows success modal

#### 5. Chatbot
- **Happy Path**:
  - Go to `/explorer/chat`
  - Type a question (examples provided)
  - Click "📤" or press Enter to send
  - See bot response
  - Continue conversation

- **Edge Cases**:
  - Network error: Shows error message
  - Empty message: Can't send
  - Timeout: Shows loading state

#### 6. Admin Dashboard (Login with admin role)
- **Happy Path**:
  - Go to `/admin/dashboard`
  - Click "➕ Thêm POI mới"
  - Fill form:
    - Tên quán: "Bánh mì Ngon"
    - Loại: Select from dropdown
    - Mô tả: Enter description
    - Giá: "20,000 - 30,000"
    - Điện thoại: "0123456789"
  - Click "💾 Lưu"
  - See POI added with status "⏳ Chờ duyệt"

- **Edge Cases**:
  - Missing required fields: Shows validation error
  - Edit existing POI: Fill form and save
  - Delete POI: Click delete button
  - Non-admin user: Redirects to map

---

## 🔄 Component Usage

### Button Component
```jsx
import Button from '@/components/common/Button';

<Button variant="primary" onClick={() => {}}>
  Đăng nhập
</Button>

// Variants: primary, secondary, danger, success
// States: disabled, loading
```

### Modal Component
```jsx
import Modal from '@/components/common/Modal';

<Modal 
  isOpen={true}
  onClose={() => {}}
  title="Success"
  message="POI created!"
  type="success"
  actions={[{ label: 'OK', onClick: () => {} }]}
/>

// Types: success, error, warning, info
```

### Input Component
```jsx
import Input from '@/components/common/Input';

<Input 
  label="Name"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={nameError}
  required
/>
```

---

## 🧪 Testing Checklist

- [ ] Login with valid email
- [ ] Login with invalid email
- [ ] View map with POI markers
- [ ] Click POI to see detail
- [ ] Zoom in/out on map
- [ ] Play audio in POI detail
- [ ] Start tour and navigate
- [ ] Send message to chatbot
- [ ] Add POI in admin dashboard
- [ ] Edit existing POI
- [ ] Delete POI
- [ ] Test on mobile viewport
- [ ] Test loading states
- [ ] Test error states

---

## 📱 Responsive Testing

### Desktop (> 1024px)
- All features visible
- Sidebar layout for admin
- Full-width map

### Tablet (768px - 1024px)
- 2-column layout for map
- Responsive navbar

### Mobile (< 768px)
- Single-column layout
- Hamburger menu in navbar
- Full-width inputs
- Stacked buttons

---

## 🐛 Debugging Tips

### Common Issues

1. **"Port 3000 is in use"**
   - Solution: Server uses port 3001 automatically
   - Or: Kill process on port 3000: `lsof -ti:3000 | xargs kill -9`

2. **"Module not found" errors**
   - Solution: `npm install` to reinstall dependencies
   - Check import paths in code

3. **"Cannot GET /page" error**
   - Solution: Check page file exists in `/pages` folder
   - Verify file naming (use kebab-case for URLs)

4. **Styles not updating**
   - Solution: Hard refresh (Ctrl+Shift+R)
   - Restart dev server: `npm run dev`

5. **localStorage not working**
   - Solution: Clear browser cache
   - Check Privacy settings allow storage

### Debug Mode

Add console logs to see data flow:
```javascript
console.log('POI updated:', poi);
console.log('User location:', userLocation);
console.log('Tour status:', currentIndex);
```

---

## 📊 Mock Data

### POI Mock Data (3 restaurants)
1. **Quán Bánh Mì Ngon** - 15,000-25,000 VND
2. **Cơm Tấm Saigon** - 20,000-30,000 VND
3. **Phở Bò Hà Nội** - 25,000-35,000 VND

### Tour Mock Data (2 tours)
1. **Tour Sáng** - 2 hour tour, 2 POIs
2. **Tour Tối** - 3 hour tour, 2 POIs

### Test Emails
- Any email format works (email validation regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Example: `user@example.com`, `admin@test.vn`, etc.

---

## 🚀 Building for Production

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Environment Variables
Create `.env.local` file:
```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=Smart Food Tour
```

---

## 📚 File Structure By Feature

### Login Feature
- `/pages/auth/login.js`
- `/utils/validation.js`
- `/utils/auth/authService.js`
- `/components/common/Input.js`, `Select.js`, `Modal.js`

### Map Feature
- `/pages/explorer/map.js`
- `/components/map/MapComponent.js`
- `/components/map/POIDetail.js`
- `/utils/api/poiService.js`

### Tour Feature
- `/pages/tour/tour-mode.js`
- `/components/map/TourMode.js`
- `/utils/api/mockData.js`

### Admin Feature
- `/pages/admin/dashboard.js`
- `/components/common/Table.js`, `Button.js`
- `/utils/validation.js`

### Chat Feature
- `/pages/explorer/chat.js`
- `/components/chatbot/ChatbotComponent.js`
- `/pages/api/chat.js`

---

## 💻 VS Code Extensions Recommended

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- Thunder Client (for API testing)

---

## 📖 Next Steps (After MVP)

1. **Backend Integration**
   - Replace mock data with real API
   - Implement FastAPI backend
   - Set up database (PostgreSQL/MongoDB)

2. **Real Map**
   - Integrate Google Maps or Leaflet
   - Implement real GPS tracking
   - Add routing calculation

3. **Chatbot**
   - Integrate RAG (Retrieval Augmented Generation)
   - Connect to LLM backend (Claude, GPT, etc.)
   - Implement context awareness

4. **Deployment**
   - Deploy frontend to Vercel/Netlify
   - Deploy backend to Render/Railway/AWS
   - Set up CI/CD pipeline

5. **Monetization**
   - Payment integration
   - Restaurant subscription tiers
   - Ad revenue

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

**Last Updated**: April 1, 2026
**Version**: 0.1.0 (MVP)
