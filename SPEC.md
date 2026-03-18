# SPEC.md - Web app báo giá sơn xe ô tô

## 1. Mục tiêu
Xây dựng web app báo giá sơn xe ô tô cho garage/xưởng dịch vụ.

App phải hỗ trợ:
- Báo giá theo phân khúc xe:
  - Hatchback
  - Sedan
  - SUV
  - MPV
  - Pickup (Bán tải)

- Báo giá hạng mục lẻ theo từng bộ phận xe
- Báo giá gói sơn quay / toàn xe
- Quản trị để:
  - thêm hạng mục sơn
  - sửa tên hạng mục
  - bật/tắt hạng mục
  - chỉnh sửa giá theo từng phân khúc xe

## 2. Người dùng
### 2.1. Người dùng báo giá

- Chọn phân khúc xe
- Chọn hạng mục cần sơn
- Xem đơn giá từng hạng mục
- Xem tổng tiền
- Có thể in/tải màn hình báo giá

### 2.2. Quản trị viên
- Đăng nhập vào trang admin
- CRUD hạng mục sơn
- CRUD gói sơn quay
- Chỉnh sửa bảng giá theo từng phân khúc xe
- Xem trước dữ liệu ngoài trang báo giá

## 3. Quy tắc nghiệp vụ
### 3.1. Phân khúc xe
Giá của cùng một hạng mục sẽ khác nhau theo phân khúc xe.

### 3.2. Nhóm báo giá
Có 2 nhóm độc lập:
1. Hạng mục lẻ
2. Gói sơn quay / toàn xe

### 3.3. Hạng mục lẻ mặc định
Seed sẵn các hạng mục sau:
- Cản trước
- Nửa cản trước
- Cản sau
- Nửa cản sau
- Cửa trước bên tài
- Cửa trước bên phụ
- Cửa sau bên tài
- Cửa sau bên phụ
- Tai xe trước bên tài
- Tai xe trước bên phụ
- Hông sau bên tài
- Hông sau bên phụ
- Nắp capo
- Cốp sau
- Nóc xe
- Gương bên tài
- Gương bên phụ
- Ốp hông bên tài
- Ốp hông bên phụ
- Bệ bước / bậc cửa

### 3.4. Gói sơn quay mặc định
Seed sẵn các gói:
- Sơn quay nguyên xe
- Sơn quay trừ cốp
- Sơn quay trừ nắp capo
- Sơn quay trừ nóc
- Sơn trong ngoài
- Sơn đổi màu

## 4. Chức năng giao diện
### 4.1. Trang báo giá công khai
- Header tiêu đề
- Bộ chọn phân khúc xe
- Tab 1: Báo giá hạng mục lẻ
- Tab 2: Báo giá gói sơn quay
- Trong tab hạng mục lẻ:
  - danh sách checkbox hạng mục
  - hiển thị đơn giá theo phân khúc đã chọn
  - hiển thị danh sách mục đã chọn
  - tính tổng tiền
- Trong tab gói sơn quay:
  - danh sách gói dạng radio card
  - hiển thị giá theo phân khúc đã chọn
- Có nút:
  - Làm mới lựa chọn
  - In báo giá

### 4.2. Trang quản trị
- Dashboard đơn giản
- Menu:
  - Quản lý hạng mục lẻ
  - Quản lý gói sơn quay
  - Bảng giá theo phân khúc
- Màn hình hạng mục:
  - thêm mới
  - sửa
  - bật/tắt active
  - sắp xếp thứ tự hiển thị
- Màn hình bảng giá:
  - hiển thị matrix:
    - dòng = hạng mục
    - cột = Hatchback, Sedan, SUV, MPV, Pickup
  - cho phép sửa inline
  - lưu nhanh
- Màn hình gói sơn quay:
  - CRUD tương tự hạng mục lẻ

## 5. Yêu cầu kỹ thuật
- Dùng Next.js App Router + TypeScript
- Dùng Tailwind CSS cho UI
- Dùng Prisma ORM
- Dùng SQLite cho local dev
- Thiết kế để dễ chuyển sang PostgreSQL sau này
- Dùng server actions hoặc route handlers
- Có validation bằng Zod
- Có định dạng tiền VND
- Có responsive cho desktop và mobile
- Có thông báo thành công/thất bại khi lưu

## 6. Xác thực
- Làm auth đơn giản cho admin
- Có thể dùng 1 tài khoản admin seed sẵn để demo
- Không cần phân quyền phức tạp ở phiên bản đầu

## 7. Dữ liệu
Thiết kế model để:
- quản lý danh sách hạng mục
- quản lý danh sách gói sơn quay
- lưu giá theo phân khúc xe
- tùy chọn: lưu lịch sử báo giá

## 8. Gợi ý mô hình dữ liệu
### Enum
- VehicleSegment = HATCHBACK | SEDAN | SUV | MPV | PICKUP
- ItemType = PART | PACKAGE

### Bảng chính
1. PaintItem
- id
- code
- name
- type
- description
- active
- sortOrder
- createdAt
- updatedAt

2. SegmentPrice
- id
- itemId
- segment
- price
- unique(itemId, segment)

3. User
- id
- email
- passwordHash
- role
- createdAt
- updatedAt

4. Quote (optional)
- id
- segment
- quoteType
- totalAmount
- notes
- createdAt

5. QuoteLine (optional)
- id
- quoteId
- itemId
- itemNameSnapshot
- unitPriceSnapshot
- quantity
- lineTotal

## 9. UX yêu cầu
- Giao diện tiếng Việt
- Dễ bấm, dễ nhìn trong xưởng/dịch vụ
- Dòng tiền nổi bật
- Chọn phân khúc xe là bước đầu tiên
- Nếu chưa chọn phân khúc xe thì disable phần chọn hạng mục

## 10. Acceptance criteria
- Chạy local thành công
- Có dữ liệu seed mẫu
- Có trang báo giá công khai
- Có trang admin
- Admin thêm hạng mục mới xong có thể set giá theo 5 phân khúc
- Admin sửa giá và ngoài trang báo giá cập nhật đúng
- Không có lỗi lint/typecheck
- README đầy đủ
