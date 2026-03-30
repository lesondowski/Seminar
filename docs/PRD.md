# Smart Food Tour App – Khu phố ẩm thực Vĩnh Khánh

## 1. Overview

Smart Food Tour App là ứng dụng web hỗ trợ khách tham quan khám phá khu phố ẩm thực Vĩnh Khánh thông qua bản đồ GPS, nội dung đa ngôn ngữ, audio guide và chatbot AI.

Hệ thống đóng vai trò như một "tour guide ảo", giúp người dùng tự khám phá khu phố mà không cần hướng dẫn viên.

Ứng dụng hoạt động trực tiếp trên trình duyệt (mobile-first), không cần cài đặt.

---

## 2. Product Goals

### 2.1 Primary Goals
- Cung cấp trải nghiệm tham quan ẩm thực tự động
- Giảm phụ thuộc vào tour guide truyền thống
- Tăng thời gian tương tác của người dùng trong khu phố

### 2.2 Secondary Goals
- Tăng doanh thu cho các quán ăn
- Hỗ trợ khách quốc tế thông qua đa ngôn ngữ
- Chuẩn hóa dữ liệu về địa điểm và món ăn

---

## 3. Actors

- Visitor: Khách tham quan sử dụng ứng dụng
- Restaurant: Chủ quán
- Admin: Quản lý dữ liệu POI và tour
- System: Backend, AI services, database

### 3.1 Visitor (Khách tham quan)


- Sử dụng web app để khám phá
- Xem bản đồ, POI, audio, chatbot



### 3.2 Restaurant (Chủ quán)

1. Đăng ký / đăng nhập tài khoản

2. Tạo và quản lý cửa hàng của mình:

- Thêm POI ( Một chủ cửa hàng có thể có nhiều POI)

3. Cập nhật thông tin:

- Tên quán
- Phân loại ( chọn theo setup của admin)
- Mô tả món ăn
- Giá
- Hình ảnh
- Upload / chỉnh sửa nội dung

4. Xem thống kê cơ bản:
- Lượt xem
- Không được sửa dữ liệu của quán khác

### 3.3 Admin

- Quản lý toàn bộ hệ thống
- Duyệt / kiểm duyệt POI từ chủ quán
- Tạo và chỉnh sửa tour
- Quản lý nội dung đa ngôn ngữ
- Quản lý user (Merchant)

### 3.4 System

- Backend (FastAPI, DB, Redis)
- Payment service
- AI chatbot (RAG)
- GPS tracking


---

## 4. Business Flow

### 4.1 Entry

1. Người dùng quét QR code tại khu phố( quét để mở app )
2. Người dùng đăng nhập bằng Email
3. Trình duyệt mở web app
4. Hệ thống xác định ngôn ngữ thiết bị

---


### 4.2 Initialization

1. Login bằng Email
2. Sau khi xác thực thành công:
   - Hệ thống load toàn bộ dữ liệu POI
   - Lưu dữ liệu tại frontend
3. Bắt đầu tracking GPS của người dùng

---

### 4.3 Mode Selection

Người dùng chọn một trong hai chế độ:

- Explore Mode: tự do khám phá
- Food Tour Mode: đi theo lộ trình gợi ý( tìm đường đi ngắn nhất)

---

### 4.4 Experience

#### Explore Mode
- Người dùng chọn POI bất kỳ trên bản đồ
- Hệ thống hiển thị thông tin chi tiết
- Có thể tự động phát audio( không lưu audio vào db)


#### Tour Mode
- Hệ thống hiển thị danh sách POI theo thứ tự
- Khi người dùng di chuyển đến gần POI:
  - Nội dung tự động hiển thị
  - Có thể tự động phát audio

---
### 4.5 POI Creation Flow

1. Owner tạo POI
2. POI = pending
3. Admin review:
- approve → hiển thị
- reject → chỉnh sửa lại
4. Sau khi approved:
- xuất hiện trên map
- dùng trong tour




### 4.6 Chatbot

- Người dùng nhập câu hỏi tự nhiên
- Hệ thống trả lời dựa trên dữ liệu POI

---

### 4.7 Exit

- Người dùng kết thúc trải nghiệm
- (Optional) ghi nhận dữ liệu usage

---

## 5. Core Features

### 5.1 Map and Navigation

- Hiển thị toàn bộ POI trên bản đồ
- Hiển thị vị trí hiện tại của người dùng
- Highlight các POI gần nhất
- Không yêu cầu gọi API sau khi load ban đầu

---

### 5.2 POI Experience

Mỗi POI bao gồm:
- Tên quán
- Mô tả món ăn
- Khoảng giá
- Hình ảnh
- Nội dung audio

---

### 5.3 Audio System

- Phát audio theo ngôn ngữ người dùng
- Có thể play / pause / resume
- Audio được generate sẵn từ hệ thống

---

### 5.4 Tour System

- Tour là danh sách POI có thứ tự
- Người dùng di chuyển theo route
- Hệ thống trigger nội dung dựa trên khoảng cách


---

### 5.5 Chatbot

- Hỗ trợ hỏi đáp:
  - Quán ngon
  - Món nổi bật
  - Giá cả
- Sử dụng RAG từ dữ liệu POI
- Có thể ưu tiên thông tin gần vị trí user


### 5.6 Owner Dashboard


- CRUD POI
- Upload content
- Xem stats


---

## 6. Functional Requirements

### 6.1 Payment

- Tạo payment link
- Nhận webhook xác nhận
- Verify trạng thái thanh toán
- Hỗ trợ retry khi pending

---

### 6.2 Map

- Cập nhật vị trí mỗi 2–5 giây
- Render marker theo category
- Xác định POI gần nhất

---

### 6.3 POI

- Hiển thị thông tin đầy đủ
- Hỗ trợ đa ngôn ngữ
- Phát audio tương ứng

---

### 6.4 Tour

- Lưu danh sách POI theo thứ tự
- Trigger nội dung theo GPS
- Cho phép user follow route

---

### 6.5 Chatbot

- Nhận input text
- Trả lời trong < 3 giây
- Fallback khi không có dữ liệu

---

## 7. Data Model

### 7.1 POI

