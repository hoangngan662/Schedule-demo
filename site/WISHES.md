# Kết nối lời nhắn wishes

Dùng project Supabase riêng trong site/wishes-config.js. Lịch trình/Project/Brand vẫn dùng site/config.js.
Bảng public.wishes có sẵn: id, name, message, x, y, size, created_at.
Không tạo bảng hoặc thay đổi policy của account này.

Góc Bạch hồng:
- Đọc 20 lời nhắn mới nhất, nút Xem thêm.
- Gửi name/message, x=0, y=0, size=1 (người dùng bỏ qua tọa độ cũ).
- Không dùng tọa độ khi hiển thị thẻ; không sửa các bản ghi cũ.
- name trống lưu null; id và created_at do DB tạo.
- Chỉ báo gửi thành công khi POST thành công; không gửi bản ghi thử tự động.
- Tránh nhấn gửi lặp trong lúc request đang chạy; lỗi giữ lại nội dung.
- Lời nhắn hiển thị công khai; không có trường duyệt trong schema hiện có.

Trang chủ đọc một lời nhắn mới nhất, không còn dùng lời nhắn minh họa.
Client cần quyền SELECT/INSERT hiện có trên wishes. Chưa thay đổi RLS/grants.
Kiểm tra mạng ở môi trường tác vụ gặp ENOTFOUND cho hostname Supabase;
chưa xác nhận truy cập project thực tế. Cần kiểm tra URL/project còn hoạt động nếu trình duyệt cũng lỗi.
Các kiểm tra gửi dùng request mock, không ghi dữ liệu thật.
