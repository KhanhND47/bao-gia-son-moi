# AGENTS.md

Mục tiêu:
Xây dựng web app báo giá sơn xe ô tô bằng tiếng Việt, dễ dùng cho cố vấn dịch vụ và có trang quản trị để thêm hạng mục sơn, chỉnh sửa giá theo từng phân khúc xe.

Nguyên tắc:
- Dùng TypeScript cho toàn bộ code.
- UI tiếng Việt.
- Ưu tiên code đơn giản, dễ bảo trì, không over-engineer.
- Tách rõ phần báo giá công khai và phần quản trị.
- Dữ liệu phải seed sẵn để chạy demo ngay.
- Luôn chạy lint, typecheck và fix lỗi trước khi kết thúc mỗi task.
- Viết README hướng dẫn cài đặt, chạy local, seed dữ liệu.
- Không xóa dữ liệu seed mẫu nếu không thật sự cần.
- Với tiền tệ, hiển thị dạng VND, ví dụ: 1.250.000 đ.
- Không cho phép giá âm.
- Không cho phép trùng mã hạng mục.
- Khi sửa giá, phải cập nhật theo từng phân khúc xe.
- Gói sơn quay là một nhóm riêng, không cộng lẫn tự động với báo giá hạng mục lẻ.
