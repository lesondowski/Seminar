# Tài liệu Activity Diagram - Smart Food Tour App

## 1. Mục đích tài liệu

Tài liệu này tách riêng phần activity diagram ra khỏi PRD để PRD gọn hơn, đồng thời giúp nhóm dự án dễ theo dõi các luồng nghiệp vụ chính dưới dạng sơ đồ.

Tổng số activity diagram trong tài liệu này là 12, kèm 1 sequence diagram tổng hợp.

> Lưu ý: AD-001 và AD-002 mô tả luồng vào app theo PRD_01 (visitor-first, QR-based). Các AD còn lại mô tả luồng nghiệp vụ chung.

## 2. Danh mục activity diagram

| Mã | Tên lược đồ | Mô tả ngắn |
|---|---|---|
| AD-001 | Chọn cách truy cập | Mô tả luồng visitor mở app và chọn vào trang chủ hoặc quét QR |
| AD-002 | QR Access và khởi tạo session | Mô tả luồng quét QR, tạo session, bootstrap dữ liệu đầy đủ |
| AD-003 | Explore Mode | Mô tả luồng người dùng khám phá POI trên bản đồ |
| AD-004 | Tour Mode | Mô tả luồng người dùng chọn tour và đi theo hành trình |
| AD-005 | Quản lý POI theo vai trò | Mô tả quy trình admin hoặc manager tạo và cập nhật POI theo phạm vi quyền |
| AD-006 | Admin publish và theo dõi hệ thống | Mô tả quy trình publish snapshot và theo dõi người dùng hoạt động |
| AD-007 | Upload ảnh POI và cập nhật nội dung | Mô tả luồng upload ảnh và cập nhật translation/audio cho POI |
| AD-008 | Chọn vị trí trên bản đồ | Mô tả luồng geocode, chọn gợi ý, ghim map và reverse geocode |
| AD-009 | Manager cập nhật nội dung POI | Mô tả quy trình manager chỉnh sửa nội dung POI thuộc quyền sở hữu |
| AD-010 | Chatbot hỏi đáp | Mô tả quy trình gửi câu hỏi và nhận phản hồi chatbot |

## 3. Chi tiết từng activity diagram

### AD-001 - Chọn cách truy cập

Lược đồ này nói về quá trình visitor mở ứng dụng và lựa chọn cách vào app theo PRD_01: vào trang chủ để xem bản đồ và POI cơ bản mà không cần QR, hoặc quét QR để vào phiên trải nghiệm đầy đủ.

```mermaid
flowchart TD
    A[Visitor mở ứng dụng] --> B[Hiển thị màn hình chào]
    B --> C{Visitor chọn cách truy cập}
    C -->|Vào trang chủ| D[Tải bản đồ và POI cơ bản]
    D --> E[Hiển thị bản đồ khu phố ẩm thực]
    E --> F[Visitor khám phá POI ở mức cơ bản]
    C -->|Quét QR| G[Mở QR scanner]
    G --> H[POST /api/v1/auth/scan-qr]
    H --> I{QR hợp lệ?}
    I -->|Không| J[Hiển thị lỗi QR]
    J --> G
    I -->|Có - free| K[Tạo session active]
    I -->|Có - paid| L[POST /api/v1/auth/payment/mock]
    L --> K
    K --> M[GET /api/v1/bootstrap]
    M --> N[Lưu bootstrap data vào store]
    N --> O[Vào trải nghiệm đầy đủ]
```

### AD-002 - QR Access và khởi tạo session

Lược đồ này nói về quá trình quét QR, validate, tạo session, gọi bootstrap và chuẩn bị dữ liệu đầy đủ cho phiên trải nghiệm visitor theo PRD_01.

```mermaid
flowchart TD
    A[Visitor quét QR] --> B[POST /api/v1/auth/scan-qr]
    B --> C{Kết quả validate QR}
    C -->|QR invalid hoặc expired| D[Hiển thị lỗi]
    D --> E[Visitor quay lại màn hình chào]
    C -->|QR free| F[Tạo session active]
    C -->|QR paid| G[POST /api/v1/auth/payment/mock]
    G --> H{Payment thành công?}
    H -->|Không| I[Hiển thị lỗi payment]
    H -->|Có| F
    F --> J[Cấp access token và refresh token cookie]
    J --> K[GET /api/v1/bootstrap]
    K --> L{Bootstrap thành công?}
    L -->|Không| M[Hiển thị lỗi, không vào runtime]
    L -->|Có| N[Lưu payload vào Zustand store]
    N --> O[Khởi tạo bản đồ, GPS, audio queue]
    O --> P[Vào màn hình chính đầy đủ]
```

### AD-003 - Explore Mode

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

### AD-004 - Tour Mode

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

### AD-005 - Quản lý POI theo vai trò

Lược đồ này nói về quy trình admin hoặc manager tạo, cập nhật POI theo phạm vi quyền hiện hành.

```mermaid
flowchart TD
    A[Người vận hành mở POI Management] --> B{Vai trò hiện tại}
    B -->|Admin| C[Admin tạo hoặc cập nhật POI]
    B -->|Manager| D[Manager tạo hoặc cập nhật POI thuộc phạm vi sở hữu]
    C --> E[Lưu POI vào editable tables]
    D --> E
    E --> F{Hợp lệ dữ liệu?}
    F -->|Không| G[Hiển thị lỗi validate]
    F -->|Có| H[Ghi audit log]
    H --> I[POI sẵn sàng cho publish]
```

### AD-006 - Admin publish và theo dõi hệ thống

Lược đồ này nói về quy trình admin publish dữ liệu và theo dõi chỉ số online devices trên dashboard.

```mermaid
flowchart TD
    A[Admin mở Dashboard] --> B[Kiểm tra số liệu POI và online devices]
    B --> C[Nhấn Publish]
    C --> D[POST /api/v1/publish]
    D --> E{Có publish lock?}
    E -->|Có| F[Hiển thị lỗi PUBLISH_LOCKED]
    E -->|Không| G[Thực hiện publish snapshot atomic]
    G --> H[Hiển thị thông báo publish thành công]
    H --> I[GET /api/v1/monitor/online-devices]
    I --> J[Cập nhật card người dùng hoạt động]
```

### AD-007 - Upload ảnh POI và cập nhật nội dung

Lược đồ này nói về quy trình chọn ảnh POI, upload ảnh, sau đó cập nhật translation và audio_url trước khi lưu POI.

```mermaid
flowchart TD
    A[Mở POI Management] --> B[Chọn POI hoặc tạo POI mới]
    B --> C[Chọn upload ảnh quán]
    C --> D[Gửi file ảnh lên server]
    D --> E[Lưu URL ảnh vào POI]
    E --> F[Cập nhật translation theo ngôn ngữ]
    F --> G[Cập nhật audio_url nếu có]
    G --> H[Lưu toàn bộ nội dung POI]
```

### AD-008 - Chọn vị trí trên bản đồ

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

### AD-009 - Manager cập nhật nội dung POI

Lược đồ này nói về quy trình manager chỉnh sửa POI thuộc quyền sở hữu, bao gồm thông tin, dịch thuật, hình ảnh và vị trí.

```mermaid
flowchart TD
    A[Manager mở POI Management] --> B[Chọn POI cần chỉnh sửa]
    B --> C[Kiểm tra ownership theo owner_manager_user_id]
    C -->|Được phép| D[Cập nhật thông tin POI]
    D --> E[Cập nhật translation và audio_url]
    E --> F[Cập nhật hình ảnh hoặc vị trí]
    F --> G[Lưu thay đổi]
    G --> H[Ghi audit log]
    H --> I[Hệ thống cập nhật dữ liệu thành công]
    C -->|Không được phép| J[Trả lỗi 403 và hiển thị thông báo quyền]
```

### AD-010 - Chatbot hỏi đáp

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

1. Tài liệu này hiện có 12 activity diagram và 1 sequence diagram tổng hợp.
2. Đây là bộ diagram cần có để mô tả đầy đủ các luồng nghiệp vụ chính của Smart Food Tour App.
3. Nếu cần nộp học thuật hoặc báo cáo chính thức, có thể dùng trực tiếp file này làm phụ lục sơ đồ cho PRD.

## 5. Phần bổ sung Manager (Thay thế)

### AD-011 - Manager đăng nhập và quản lý POI

Lược đồ này mô tả manager đăng nhập riêng và chỉ thao tác POI thuộc phạm vi quản lý.

```mermaid
flowchart TD
    A[Manager mở trang đăng nhập] --> B[POST /api/v1/manager/login]
    B --> C{Đăng nhập hợp lệ?}
    C -->|Không| D[Hiển thị lỗi đăng nhập]
    C -->|Có| E[Vào manager POI list]
    E --> F[GET /api/v1/manager/pois]
    F --> G[Chọn POI để sửa hoặc tạo mới]
    G --> H[POST hoặc PUT manager POI API]
    H --> I{POI thuộc manager?}
    I -->|Không| J[403 Forbidden]
    I -->|Có| K[Lưu POI thành công]
```

### AD-012 - Manager upload POI image

Lược đồ này mô tả upload file ảnh trực tiếp cho POI manager sở hữu.

```mermaid
flowchart TD
    A[Manager mở POI editor] --> B[Chọn file ảnh]
    B --> C[POST /api/v1/manager/pois/{id}/image]
    C --> D{File hợp lệ?}
    D -->|Không| E[400 hoặc 413, hiển thị lỗi]
    D -->|Có| F[Lưu file và metadata]
    F --> G[Cập nhật image_url trên POI]
```

## 6. Lược đồ Sequence (Đã chuẩn hóa)

### SD-001 - Visitor QR Runtime và Admin Publish (Tổng thể)

Lược đồ sequence dưới đây được viết lại theo kiến trúc hiện tại: visitor vào app bằng QR, bootstrap dữ liệu, chat theo bootstrap version, admin cập nhật và publish snapshot, monitor cập nhật số lượng online devices.

```mermaid
sequenceDiagram
    autonumber
    actor V as Visitor
    actor A as Admin
    participant FE as Frontend (Next.js)
    participant BE as Backend (FastAPI)
    participant R as Redis
    participant DB as MySQL

    %% Visitor QR access
    V->>FE: Quét QR
    FE->>BE: POST /api/v1/auth/scan-qr
    BE->>DB: Validate qr_access_codes + ghi qr_access_events

    alt QR free hợp lệ
        BE->>DB: Tạo visitor_session state=active
        BE->>R: Lưu refresh token state
        BE-->>FE: access_token + session_id
    else QR paid hợp lệ
        BE->>DB: Tạo visitor_session state=created
        BE-->>FE: requires_payment=true
        FE->>BE: POST /api/v1/auth/payment/mock
        BE->>DB: Ghi payment_logs + state created->active
        BE->>R: Lưu refresh token state
        BE-->>FE: access_token
    else QR lỗi
        BE-->>FE: 400/404/410
    end

    %% Bootstrap
    FE->>BE: GET /api/v1/bootstrap (Bearer access_token)
    BE->>DB: Resolve site_id + load published snapshot
    BE->>DB: Ghi session.bootstrap_version
    BE-->>FE: Raw JSON bootstrap payload
    FE->>FE: Hydrate bootstrap store (map, poi, tours, config)

    %% Chatbot in runtime
    V->>FE: Gửi câu hỏi chatbot
    FE->>BE: POST /api/v1/chat (message + bootstrap_version)
    BE->>DB: Validate session active + bootstrap_version
    alt Version mismatch
        BE-->>FE: 409 BOOTSTRAP_VERSION_MISMATCH
    else Hợp lệ
        BE->>DB: Query published data theo snapshot
        BE->>DB: Ghi chatbot_logs
        BE-->>FE: answer / fallback
    end

    %% Admin CRUD and publish
    A->>FE: Đăng nhập admin dashboard
    FE->>BE: POST /api/v1/admin/login
    BE->>DB: Validate credentials
    BE-->>FE: admin_token

    A->>FE: CRUD POI/Tour
    FE->>BE: /api/v1/admin/pois, /api/v1/admin/tours
    BE->>DB: Read/Write editable data + audit_logs
    BE-->>FE: success

    A->>FE: Publish
    FE->>BE: POST /api/v1/publish
    BE->>R: Acquire publish_lock:{site_id}
    alt Lock conflict
        BE-->>FE: 409 PUBLISH_LOCKED
    else Lock success
        BE->>DB: BEGIN
        BE->>DB: Copy editable -> published_* tables
        BE->>DB: Update sites.current_publish_snapshot_id
        BE->>DB: COMMIT + audit_logs
        BE->>R: Release lock
        BE-->>FE: Publish success
    end

    %% Dashboard monitor
    FE->>BE: GET /api/v1/monitor/online-devices?window_minutes=5
    BE->>DB: Count active sessions by site
    BE-->>FE: total_online_devices + by_site
```

Ghi chú:

1. Sau bootstrap, visitor runtime không gọi GET /api/v1/pois hoặc GET /api/v1/tours.
2. Publish là atomic theo site_id, dùng Redis lock để tránh publish song song.
3. Chatbot chỉ được tra cứu dữ liệu published của đúng bootstrap_version.

