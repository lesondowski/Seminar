# Tài liệu Activity Diagram - Smart Food Tour App

## 1. Mục đích tài liệu

Tài liệu này tách riêng phần activity diagram ra khỏi PRD để PRD gọn hơn, đồng thời giúp nhóm dự án dễ theo dõi các luồng nghiệp vụ chính dưới dạng sơ đồ.

Tổng số activity diagram trong tài liệu này là 9.

## 2. Danh mục activity diagram

| Mã | Tên lược đồ | Mô tả ngắn |
|---|---|---|
| AD-001 | Đăng nhập và khởi tạo | Mô tả luồng mở app, đăng nhập, xác minh OTP, tải dữ liệu ban đầu |
| AD-002 | Explore Mode | Mô tả luồng người dùng khám phá POI trên bản đồ |
| AD-003 | Tour Mode | Mô tả luồng người dùng chọn tour và đi theo hành trình |
| AD-004 | Gửi POI và kiểm duyệt | Mô tả quy trình tạo POI, gửi duyệt, approve hoặc reject |
| AD-005 | Admin quản lý user | Mô tả quy trình admin tạo, cập nhật, xem user |
| AD-006 | Upload ảnh POI và cập nhật menu | Mô tả luồng upload ảnh và quản lý menu |
| AD-007 | Chọn vị trí trên bản đồ | Mô tả luồng geocode, chọn gợi ý, ghim map và reverse geocode |
| AD-008 | Owner hoặc Moderator cập nhật nội dung | Mô tả quy trình chỉnh sửa nội dung quán |
| AD-009 | Chatbot hỏi đáp | Mô tả quy trình gửi câu hỏi và nhận phản hồi chatbot |

## 3. Chi tiết từng activity diagram

### AD-001 - Đăng nhập và khởi tạo

Lược đồ này nói về quá trình người dùng mở ứng dụng, xác thực, nhận quyền và chuẩn bị dữ liệu ban đầu để bắt đầu sử dụng hệ thống.

```mermaid
flowchart TD
    A[Mở ứng dụng] --> B{Có đăng nhập chưa?}
    B -->|Chưa| C[Nhập email]
    C --> D[Gửi OTP]
    D --> E[Nhập OTP]
    E --> F[Xác minh OTP]
    F -->|Hợp lệ| G[Đăng nhập thành công]
    F -->|Không hợp lệ| E
    B -->|Đã có phiên| G
    G --> H[Tải hồ sơ người dùng và role]
    H --> I[Tải dữ liệu ban đầu]
    I --> J[Khởi tạo bản đồ và vị trí]
    J --> K[Vào màn hình chính]
```

### AD-002 - Explore Mode

Lược đồ này nói về cách visitor duyệt POI trên bản đồ, xem chi tiết và tương tác với nội dung liên quan đến điểm đến.

```mermaid
flowchart TD
    A[Vào Explore Mode] --> B[Tải danh sách POI hợp lệ]
    B --> C[Hiển thị POI trên bản đồ]
    C --> D[Người dùng chọn một POI]
    D --> E[Hiển thị thông tin chi tiết]
    E --> F[Hiển thị hình ảnh, menu, mô tả]
    F --> G{Có audio không?}
    G -->|Có| H[Phát audio]
    G -->|Không| I[Kết thúc xem POI]
    H --> I
```

### AD-003 - Tour Mode

Lược đồ này nói về cách người dùng chọn một tour, di chuyển theo lộ trình và nhận nội dung theo thứ tự hành trình.

```mermaid
flowchart TD
    A[Chọn Tour Mode] --> B[Hiển thị danh sách tour]
    B --> C[Người dùng chọn một tour]
    C --> D[Tải danh sách POI theo thứ tự]
    D --> E[Bắt đầu theo dõi vị trí]
    E --> F{Đã đến gần POI tiếp theo?}
    F -->|Chưa| E
    F -->|Rồi| G[Hiển thị nội dung POI]
    G --> H[Phát audio hoặc hiển thị narration]
    H --> I{Còn POI tiếp theo không?}
    I -->|Có| E
    I -->|Không| J[Kết thúc tour]
```

### AD-004 - Gửi POI và kiểm duyệt

Lược đồ này nói về quy trình owner, moderator hoặc admin tạo POI và quy trình kiểm duyệt POI bởi admin hoặc moderator.

```mermaid
flowchart TD
    A[Tạo POI mới] --> B[Nhập thông tin quán]
    B --> C[Nhập menu, hình ảnh, vị trí]
    C --> D[Lưu POI]
    D --> E[POI ở trạng thái pending]
    E --> F[Admin hoặc Moderator mở danh sách kiểm duyệt]
    F --> G{Kết quả kiểm duyệt}
    G -->|Approve| H[POI chuyển sang approved]
    G -->|Reject| I[POI chuyển sang rejected]
    I --> J[Người tạo cập nhật lại nội dung]
    J --> D
    H --> K[POI hiển thị trên map và các luồng trải nghiệm]
```

### AD-005 - Admin quản lý user

Lược đồ này nói về quy trình admin tạo hoặc cập nhật tài khoản vận hành trong dashboard.

```mermaid
flowchart TD
    A[Admin mở User Management] --> B[Xem danh sách user]
    B --> C[Nhập email, role, ngôn ngữ]
    C --> D[Gửi yêu cầu tạo hoặc cập nhật user]
    D --> E{Yêu cầu hợp lệ?}
    E -->|Có| F[Lưu user]
    E -->|Không| G[Hiển thị lỗi]
    F --> H[Cập nhật lại danh sách user]
```

### AD-006 - Upload ảnh POI và cập nhật menu

Lược đồ này nói về quy trình chọn file ảnh, upload ảnh cho quán hoặc món ăn, sau đó thêm, sửa, xóa menu trước khi lưu POI.

```mermaid
flowchart TD
    A[Mở POI Management] --> B[Chọn POI hoặc tạo POI mới]
    B --> C[Chọn upload ảnh quán]
    C --> D[Gửi file ảnh lên server]
    D --> E[Lưu URL ảnh vào POI]
    E --> F[Thêm hoặc sửa món ăn]
    F --> G{Có upload ảnh món ăn không?}
    G -->|Có| H[Upload ảnh món ăn]
    H --> I[Lưu URL ảnh vào menu item]
    G -->|Không| I
    I --> J{Có xóa món không?}
    J -->|Có| K[Xóa menu item]
    J -->|Không| L[Lưu toàn bộ menu]
    K --> L
```

### AD-007 - Chọn vị trí trên bản đồ

Lược đồ này nói về quy trình nhập địa chỉ, nhận gợi ý geocode, ghim điểm trên bản đồ và cập nhật vị trí POI.

```mermaid
flowchart TD
    A[Mở form chọn vị trí] --> B{Chọn cách nhập vị trí}
    B -->|Gõ địa chỉ| C[Nhập từ khóa địa chỉ]
    C --> D[Gọi geocode search]
    D --> E[Hiển thị danh sách gợi ý]
    E --> F[Người dùng chọn một gợi ý]
    F --> G[Cập nhật lat/lng và địa chỉ]
    B -->|Ghim trên bản đồ| H[Người dùng click hoặc kéo pin]
    H --> I[Gọi reverse geocode]
    I --> G
    G --> J[Lưu vị trí vào POI]
```

### AD-008 - Owner hoặc Moderator cập nhật nội dung

Lược đồ này nói về quy trình chỉnh sửa nội dung quán hiện có, bao gồm thông tin quán, narration, menu, hình ảnh và vị trí.

```mermaid
flowchart TD
    A[Mở POI Management] --> B[Chọn POI cần chỉnh sửa]
    B --> C[Kiểm tra quyền chỉnh sửa]
    C -->|Được phép| D[Cập nhật thông tin quán]
    D --> E[Cập nhật narration]
    E --> F[Cập nhật menu và hình ảnh]
    F --> G[Cập nhật vị trí nếu cần]
    G --> H[Lưu thay đổi]
    H --> I[Hệ thống cập nhật dữ liệu]
    C -->|Không được phép| J[Hiển thị thông báo lỗi quyền]
```

### AD-009 - Chatbot hỏi đáp

Lược đồ này nói về quy trình người dùng đặt câu hỏi bằng ngôn ngữ tự nhiên và hệ thống trả phản hồi chatbot.

```mermaid
flowchart TD
    A[Người dùng nhập câu hỏi] --> B[Frontend gửi request tới backend]
    B --> C[Backend xử lý câu hỏi]
    C --> D{Có dữ liệu phù hợp không?}
    D -->|Có| E[Tạo phản hồi chatbot]
    D -->|Không| F[Trả về câu trả lời fallback]
    E --> G[Hiển thị câu trả lời]
    F --> G
```

## 4. Tóm tắt phục vụ review

1. Tài liệu này hiện có 9 activity diagram.
2. Đây là bộ diagram cần có để mô tả đầy đủ các luồng nghiệp vụ chính của Smart Food Tour App.
3. Nếu cần nộp học thuật hoặc báo cáo chính thức, có thể dùng trực tiếp file này làm phụ lục sơ đồ cho PRD.
