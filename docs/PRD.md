# Smart Food Tour App - PRD

## 1. Mục đích tài liệu

Tài liệu này mô tả yêu cầu sản phẩm cho Smart Food Tour App tại khu phố ẩm thực Vĩnh Khánh. Bản PRD được viết lại nhằm phục vụ 4 mục tiêu sau:

1. Thể hiện đầy đủ các chức năng nghiệp vụ của hệ thống.
2. Gán mã ID rõ ràng cho yêu cầu chức năng, use case và activity diagram.
3. Cho phép kiểm đếm chính xác số lượng ID và số lượng lược đồ activity.
4. Giải thích mỗi lược đồ activity dùng để mô tả luồng nghiệp vụ nào.

## 2. Tổng quan sản phẩm

Smart Food Tour App là ứng dụng web mobile-first hỗ trợ khách tham quan khám phá khu phố ẩm thực Vĩnh Khánh thông qua bản đồ GPS, nội dung đa ngôn ngữ, audio guide, chatbot hỏi đáp và các tour đề xuất.

Sản phẩm đóng vai trò như một hướng dẫn viên ảo, giúp người dùng:

1. Xác định vị trí hiện tại và các điểm POI gần mình.
2. Xem thông tin quán ăn, món ăn, hình ảnh và nội dung thuyết minh.
3. Tự di chuyển theo chế độ Explore hoặc Tour.
4. Tương tác với chatbot để hỏi đáp về quán, món ăn và điểm đến.
5. Hỗ trợ chủ quán và quản trị viên quản lý dữ liệu nội dung trên hệ thống.

## 3. Mục tiêu sản phẩm

### 3.1 Mục tiêu chính

1. Cung cấp trải nghiệm tham quan ẩm thực tự động trên trình duyệt.
2. Giảm phụ thuộc vào hướng dẫn viên truyền thống.
3. Tăng khả năng khám phá POI, tour và món ăn trong khu phố.

### 3.2 Mục tiêu phụ

1. Tăng khả năng hiển thị và tiếp cận khách hàng cho các quán ăn.
2. Hỗ trợ khách quốc tế bằng nội dung đa ngôn ngữ.
3. Chuẩn hóa dữ liệu về POI, menu, tour và thông tin quảng bá.
4. Hỗ trợ quản trị viên kiểm duyệt và vận hành nội dung nhanh hơn.

## 4. Phạm vi

### 4.1 Trong phạm vi

1. Đăng nhập bằng email và OTP.
2. Quản lý user theo vai trò admin, moderator, owner, visitor.
3. Hiển thị POI trên bản đồ và tìm POI gần người dùng.
4. Tạo, sửa, xóa, duyệt và từ chối POI.
5. Quản lý menu món ăn và hình ảnh cho quán.
6. Chọn vị trí bằng gõ địa chỉ hoặc ghim trực tiếp trên bản đồ.
7. Upload ảnh cho thông tin quán và món ăn.
8. Tạo và quản lý tour.
9. Tương tác chatbot hỏi đáp.
10. Nội dung thuyết minh và audio guide.

### 4.2 Ngoài phạm vi hoặc triển khai sau

1. Thanh toán trực tuyến hiện được ghi nhận là planned, chưa có độ phủ rõ ràng trong code hiện tại.
2. Tích hợp email provider thực tế cho OTP.
3. Tối ưu hóa sản xuất audio TTS ở quy mô lớn.
4. Hệ thống thông báo đa kênh cho owner khi POI được duyệt hoặc từ chối.

## 5. Tác nhân

### 5.1 Visitor

Visitor là khách tham quan sử dụng web app để khám phá khu phố ẩm thực.

Quyền chính:

1. Đăng nhập và chọn ngôn ngữ.
2. Xem bản đồ, xem chi tiết POI, nghe audio.
3. Sử dụng Explore Mode và Tour Mode.
4. Hỏi đáp với chatbot.

### 5.2 Owner

Owner là chủ quán hoặc đơn vị quản lý nội dung của quán.

Quyền chính:

1. Tạo POI của quán mình.
2. Cập nhật thông tin quán, menu, hình ảnh, nội dung.
3. Upload ảnh cho quán và món ăn.
4. Xem trạng thái pending, approved, rejected của POI do mình quản lý.
5. Không được sửa dữ liệu của quán khác.

### 5.3 Moderator

Moderator là vai trò vận hành nội dung có phạm vi trung gian.

Quyền chính:

1. Tạo và chỉnh sửa POI do chính moderator tạo.
2. Duyệt hoặc từ chối POI theo phạm vi vận hành.
3. Tạo và cập nhật tour.
4. Sử dụng geocoding, upload ảnh, quản lý nội dung bổ sung.

### 5.4 Admin

Admin là vai trò quản trị hệ thống cao nhất.

Quyền chính:

1. Quản lý toàn bộ user, owner, moderator.
2. Tạo, sửa, xóa mọi POI.
3. Duyệt và từ chối mọi POI.
4. Tạo, sửa, xóa tour.
5. Upload ảnh, cập nhật menu, cập nhật nội dung đa ngôn ngữ.

### 5.5 System

System bao gồm frontend, backend, database, Redis, dịch vụ geocode, chatbot và các thành phần xử lý GPS.

Vai trò của System:

1. Xác thực và phân quyền.
2. Tải dữ liệu, xử lý nghiệp vụ, lưu dữ liệu.
3. Gọi geocoding và reverse geocoding.
4. Lưu trữ ảnh upload.
5. Trả lời chatbot.

## 6. Ma trận bao phủ chức năng

| Chức năng | Visitor | Owner | Moderator | Admin | System |
|---|---|---|---|---|---|
| Đăng nhập và xác thực | Có | Có | Có | Có | Có |
| Xem bản đồ và POI | Có | Có | Có | Có | Có |
| Explore Mode | Có | Có | Có | Có | Có |
| Tour Mode | Có | Có | Có | Có | Có |
| Tạo POI | Không | Có | Có | Có | Có |
| Sửa POI | Không | Chỉ POI của mình | Chỉ POI do mình tạo | Tất cả | Có |
| Duyệt hoặc từ chối POI | Không | Không | Có | Có | Có |
| Quản lý menu | Không | Có | Có | Có | Có |
| Upload ảnh quán và menu | Không | Có | Có | Có | Có |
| Quản lý tour | Không | Không | Có | Có | Có |
| Quản lý user | Không | Không | Không | Có | Có |
| Chatbot hỏi đáp | Có | Có | Có | Có | Có |

## 7. Yêu cầu chức năng

Phần này sử dụng mã `FR-###`. Tổng số functional requirement trong PRD là 18.

### 7.1 Xác thực và kiểm soát truy cập

#### FR-001 - Đăng nhập bằng email
Hệ thống phải cho phép người dùng đăng nhập bằng email để bắt đầu sử dụng ứng dụng.

#### FR-002 - Xác minh OTP
Hệ thống phải hỗ trợ xác minh OTP trước khi cấp access token cho người dùng.

#### FR-003 - Phân quyền theo vai trò
Hệ thống phải phân quyền theo 4 vai trò visitor, owner, moderator, admin.

#### FR-004 - Quản lý user cho admin
Hệ thống phải cho phép admin tạo hoặc cập nhật owner, moderator và visitor.

### 7.2 Bản đồ và trải nghiệm vị trí

#### FR-005 - Hiển thị POI trên bản đồ
Hệ thống phải hiển thị danh sách POI hợp lệ trên bản đồ.

#### FR-006 - Theo dõi vị trí người dùng
Hệ thống phải xác định hoặc cập nhật vị trí người dùng để phục vụ Explore Mode và Tour Mode.

#### FR-007 - Xác định POI lân cận
Hệ thống phải hỗ trợ xác định POI gần người dùng theo bán kính.

#### FR-008 - Chọn địa chỉ và ghim bản đồ
Hệ thống phải cho phép admin, moderator, owner chọn địa chỉ bằng gõ tìm kiếm hoặc ghim trực tiếp trên bản đồ.

### 7.3 Quản lý POI và nội dung

#### FR-009 - Tạo POI
Hệ thống phải cho phép owner, moderator và admin tạo POI mới với đầy đủ thông tin quán.

#### FR-010 - Cập nhật và xóa POI
Hệ thống phải cho phép cập nhật và xóa POI theo đúng quyền của từng vai trò.

#### FR-011 - Quy trình duyệt POI
Hệ thống phải hỗ trợ trạng thái pending, approved, rejected cho POI và lưu lý do reject.

#### FR-012 - Upload ảnh cho POI
Hệ thống phải cho phép upload ảnh cho thông tin quán và lưu đường dẫn ảnh để hiển thị lại.

#### FR-013 - Quản lý menu
Hệ thống phải cho phép thêm, sửa, xóa các món ăn trong menu của POI.

#### FR-014 - Upload ảnh cho món ăn
Hệ thống phải cho phép upload ảnh cho từng món ăn trong menu.

#### FR-015 - Nội dung thuyết minh đa ngôn ngữ
Hệ thống phải lưu nội dung thuyết minh, ngôn ngữ gốc và phục vụ hiển thị nội dung đa ngôn ngữ.

### 7.4 Tour và trải nghiệm dẫn đường

#### FR-016 - Quản lý tour
Hệ thống phải cho phép moderator và admin tạo, sửa, xóa tour gồm danh sách POI có thứ tự.

#### FR-017 - Trải nghiệm tour
Hệ thống phải hỗ trợ người dùng đi theo tour và kích hoạt nội dung theo vị trí hoặc thứ tự hành trình.

### 7.5 AI và hỗ trợ người dùng

#### FR-018 - Chatbot hỏi đáp
Hệ thống phải cho phép người dùng nhập câu hỏi tự nhiên và nhận phản hồi về POI, món ăn hoặc khu vực ẩm thực.

## 8. Use Cases

Phần này sử dụng mã `UC-###`. Tổng số use case trong PRD là 9.

### UC-001 - Visitor đăng nhập và bắt đầu phiên làm việc
Người dùng mở app, nhập email, xác minh OTP, nhận token và vào hệ thống.

### UC-002 - Khám phá POI lân cận
Visitor sử dụng bản đồ để xem danh sách POI, chọn POI bất kỳ và xem thông tin chi tiết.

### UC-003 - Đi theo một food tour
Visitor chọn tour, đi theo thứ tự POI và nhận nội dung khi đến khu vực gần POI.

### UC-004 - Owner tạo và cập nhật POI
Owner tạo POI mới, cập nhật thông tin quán, menu, hình ảnh và gửi lên hệ thống.

### UC-005 - Moderator quản lý POI do mình tạo
Moderator tạo POI, sửa POI do mình tạo và sử dụng công cụ hỗ trợ nội dung.

### UC-006 - Admin duyệt hoặc từ chối POI
Admin mở dashboard, xem danh sách POI, phê duyệt hoặc từ chối và cập nhật trạng thái.

### UC-007 - Admin quản lý user
Admin tạo hoặc cập nhật owner, moderator, visitor trong dashboard.

### UC-008 - Nhân sự vận hành upload ảnh và cập nhật menu
Admin, moderator hoặc owner upload ảnh quán, ảnh món ăn và cập nhật menu của POI.

### UC-009 - Người dùng hỏi chatbot
Visitor hoặc user đã đăng nhập gửi câu hỏi tự nhiên và nhận câu trả lời từ chatbot.

## 9. Luồng nghiệp vụ

### 9.1 Luồng vào hệ thống và khởi tạo

1. Người dùng mở app qua URL hoặc QR code.
2. Người dùng đăng nhập bằng email.
3. Hệ thống xác minh OTP và role.
4. Hệ thống tải dữ liệu cần thiết cho session.
5. Hệ thống bắt đầu xử lý vị trí và bản đồ.

### 9.2 Luồng Explore

1. Hệ thống hiển thị map và danh sách POI hợp lệ.
2. Người dùng chọn một POI.
3. Hệ thống hiển thị thông tin, hình ảnh, menu, nội dung và audio nếu có.

### 9.3 Luồng gửi POI để kiểm duyệt

1. Owner, moderator hoặc admin tạo POI.
2. Hệ thống lưu POI kèm vị trí, hình ảnh, menu, narration.
3. POI mới mặc định ở trạng thái pending nếu cần kiểm duyệt.
4. Admin hoặc moderator phê duyệt hoặc từ chối.
5. POI approved được hiển thị trong map và các luồng khám phá.

### 9.4 Luồng cập nhật nội dung

1. Người quản lý mở POI Management.
2. Cập nhật thông tin quán, menu, hình ảnh và vị trí.
3. Hệ thống lưu thay đổi vào database.
4. Giao diện cập nhật kết quả sau khi lưu thành công.

### 9.5 Luồng chatbot

1. Người dùng nhập câu hỏi.
2. Frontend gửi request tới backend chatbot.
3. System trả về câu trả lời hoặc fallback nếu lỗi.

## 10. Tóm tắt mô hình dữ liệu

PRD mô tả các thực thể nghiệp vụ chính, không đi sâu vào cấp API field-by-field.

### 10.1 Thực thể cốt lõi

1. User  
Vai trò: visitor, owner, moderator, admin.

2. POI  
Chứa tên quán, mô tả, danh mục, vị trí, hình ảnh, nội dung, audio, trạng thái, người tạo, người sở hữu.

3. MenuItem  
Thuộc một POI, chứa tên món, mô tả, giá, ảnh, loại món.

4. Tour  
Chứa tên tour, mô tả, ngôn ngữ, trạng thái và danh sách POI theo thứ tự.

5. UploadAsset  
Tài nguyên ảnh được upload để dùng cho ảnh quán hoặc ảnh menu.

6. Chat Session hoặc Chat Interaction  
Mô tả request và response chatbot ở mức nghiệp vụ.

### 10.2 Quan hệ chính

1. Một User có thể sở hữu nhiều POI.
2. Một POI có thể được tạo bởi một owner, moderator hoặc admin.
3. Một POI có nhiều MenuItem.
4. Một Tour chứa nhiều POI theo thứ tự sắp xếp.
5. Ảnh upload có thể được liên kết với POI hoặc MenuItem.

## 11. Tài liệu activity diagram

Phần activity diagram đã được tách riêng để PRD gọn hơn.

Tài liệu tham chiếu: [docs/ACTIVITY_DIAGRAMS.md](d:/AUDIT_CUA_LEE_JONG_SON/Tengroup/Seminar/docs/ACTIVITY_DIAGRAMS.md)

Tóm tắt nhanh:

1. Tổng số activity diagram: 9.
2. Các mã diagram: AD-001 đến AD-009.
3. Nội dung chi tiết, mô tả mục đích và sơ đồ Mermaid nằm trong tài liệu riêng.

## 12. Bảng tổng hợp số lượng ID

Để tránh nhầm lẫn khi đánh giá, PRD thống kê ID theo 3 nhóm riêng.

| Nhóm ID | Prefix | Số lượng |
|---|---|---|
| Functional Requirements | FR | 18 |
| Use Cases | UC | 9 |
| Activity Diagrams | AD | 9 |
| Tổng số ID có đánh số | All | 36 |

## 13. Tóm tắt phục vụ review

### 13.1 PRD thể hiện những chức năng gì

PRD hiện tại đã thể hiện 10 nhóm chức năng chính:

1. Đăng nhập và xác thực OTP.
2. Phân quyền theo role.
3. Hiển thị map, vị trí người dùng và POI gần đây.
4. Explore Mode.
5. Tour Mode.
6. Tạo, sửa, xóa và duyệt POI.
7. Quản lý menu và hình ảnh của quán.
8. Upload ảnh quán và ảnh món.
9. Quản lý user cho admin.
10. Chatbot hỏi đáp.

### 13.2 Có bao nhiêu ID

1. 18 Functional Requirement IDs.
2. 9 Use Case IDs.
3. 9 Activity Diagram IDs.
4. Tổng cộng 36 ID có đánh số.

### 13.3 Có bao nhiêu lược đồ activity và cần bổ sung lược đồ nào

1. Cần có 9 lược đồ activity cho hệ thống.
2. Các lược đồ này đã được tách sang tài liệu riêng tại [docs/ACTIVITY_DIAGRAMS.md](d:/AUDIT_CUA_LEE_JONG_SON/Tengroup/Seminar/docs/ACTIVITY_DIAGRAMS.md).

### 13.4 Các lược đồ activity nói về điều gì

Mỗi lược đồ activity dùng để mô tả một luồng nghiệp vụ nhiều bước giữa actor và system, gồm: đăng nhập, khám phá POI, đi theo tour, tạo và duyệt POI, quản lý user, upload ảnh và cập nhật menu, chọn vị trí trên map, cập nhật nội dung quán và hỏi đáp chatbot. Nội dung chi tiết của từng lược đồ nằm trong [docs/ACTIVITY_DIAGRAMS.md](d:/AUDIT_CUA_LEE_JONG_SON/Tengroup/Seminar/docs/ACTIVITY_DIAGRAMS.md).
