# Web App Báo Giá Sơn Xe Ô Tô

Ứng dụng báo giá sơn xe ô tô bằng tiếng Việt, gồm:
- Trang báo giá công khai cho cố vấn dịch vụ.
- Trang quản trị để quản lý hạng mục sơn và bảng giá theo phân khúc xe.

## 1. Công nghệ
- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite (local dev)
- Zod validation

## 2. Tính năng chính
- Báo giá theo 5 phân khúc xe: Hatchback, Sedan, SUV, MPV, Pickup.
- 2 nhóm báo giá độc lập:
  - Hạng mục lẻ (checkbox, tính tổng).
  - Gói sơn quay (radio card, không cộng tự động với hạng mục lẻ).
- Định dạng tiền VND theo dạng `1.250.000 đ`.
- Trang admin:
  - Đăng nhập
  - CRUD hạng mục lẻ
  - CRUD gói sơn quay
  - Bật/tắt active
  - Sắp xếp `sortOrder`
  - Bảng giá matrix theo 5 phân khúc, sửa inline và lưu nhanh
- Validation nghiệp vụ:
  - Không cho giá âm
  - Không cho trùng code
  - Không cho bỏ trống tên hạng mục

## 3. Cài đặt
Yêu cầu:
- Node.js 20+
- npm

Cài dependency:

```bash
npm install
```

## 4. Biến môi trường
Tạo file `.env` từ `.env.example`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="thay-secret-khi-deploy"
```

## 5. Database migrate / seed
Generate Prisma Client:

```bash
npm run prisma:generate
```

Chạy migrate schema SQLite:

```bash
npm run db:migrate
```

Nạp dữ liệu demo:

```bash
npm run db:seed
```

> Lưu ý: `db:seed` là idempotent, có thể chạy lại nhiều lần để cập nhật dữ liệu mẫu.

## 6. Chạy local

```bash
npm run dev
```

Mở trình duyệt:
- Public quote: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## 7. Tài khoản admin demo
- Email: `admin@baogia.local`
- Mật khẩu: `Admin@123`

## 8. Kiểm tra chất lượng code

```bash
npm run lint
npm run typecheck
npm run build
```

## 9. Cấu trúc thư mục chính

```text
prisma/
  schema.prisma
  schema-sql.ts
  seed.ts
scripts/
  migrate.ts
src/
  app/
    page.tsx                    # Trang báo giá công khai
    admin/                      # Trang quản trị
    api/                        # Route handlers (auth/admin)
  components/
    quote/                      # Component UI báo giá
    admin/                      # Component UI quản trị
  lib/
    auth.ts                     # Session auth đơn giản cho admin
    paint-items.ts              # Query dữ liệu
    validation.ts               # Zod schemas
    format.ts                   # Format VND
```

## 10. Ghi chú
- Dữ liệu seed mẫu đã gồm:
  - 20 hạng mục lẻ mặc định
  - 6 gói sơn quay mặc định
  - Bảng giá cho đủ 5 phân khúc xe
  - 1 tài khoản admin demo
- Thiết kế dữ liệu hiện tại dùng SQLite local, có thể chuyển sang PostgreSQL sau này bằng cách đổi `provider` và `DATABASE_URL`.
