# Supabase database khớp giao diện hiện tại

## Cài đặt
Project mới: chạy schema.sql trong SQL Editor, sau đó seed.sql nếu muốn demo.
Không chạy schema.sql cùng chuỗi migration vì chúng cùng tạo bảng.

Nếu đã chạy migrations/202610060001_schedule.sql và 002_event_images.sql:
chỉ chạy 003_current_ui.sql để chuyển event_type sang event_types, giữ dữ liệu.
Nếu mới chạy 001 thì chạy thêm 002 rồi 003.
Nếu đã dùng bản rất cũ có event_topics/events.hashtags, cần đối chiếu schema trước;
003 dành cho bản event_hashtags gần nhất, không tự xóa/chuyển bảng topic cũ.

Chạy verify.sql sau khi tạo/nâng cấp để kiểm tra quyền bằng fixture rồi rollback.
Website đã kết nối qua REST API bằng publishable key trong event-client.mjs.
index.html chứa trực tiếp client và adapter để chạy cả khi mở bằng file://, không tải module cục bộ.
Khi sửa event-client.mjs hoặc event-adapter.mjs, cập nhật phần tương ứng trong index.html.
Chỉ sự kiện is_published=true xuất hiện; không dùng dữ liệu demo khi kết nối lỗi.

## Bảng
- events: thông tin sự kiện, event_types text[] (nhiều loại), threads_topic text, keyword text,
  notes text[], is_published, thời gian và nguồn.
- event_hashtags: event_id, platform, hashtag, sort_order; không trùng cùng sự kiện/platform.
- event_links: event_id, title, url, sort_order; gồm link livestream và các link khác.
- event_images: event_id, image_url, caption, sort_order; caption chỉ làm mô tả trợ năng,
  không hiển thị tên dưới ảnh. Nhận URL http/https hoặc đường dẫn assets/ của demo.

Khóa chính UUID; legacy_id giữ mã dữ liệu cũ/demo.
Các bảng con tham chiếu events.id, ON DELETE CASCADE.
sort_order số nhỏ đứng trước; updated_at tự thay đổi khi sửa.
Ảnh lưu ở assets hoặc Supabase Storage, không lưu binary trong DB. Chưa dựng bucket/upload.

## Quy tắc giao diện
All: Threads Topic, Keyword, toàn bộ hashtag (khử trùng).
Facebook/TikTok: Keyword và hashtag của nền tảng tương ứng.
Threads: Threads Topic và Keyword; không hiển thị hashtag.
Không có bảng topic riêng, nút copy tổng hợp hoặc tag trạng thái sự kiện.
Nhãn Hôm nay tính theo Asia/Ho_Chi_Minh; event_date <= hôm nay <= end_date
(end_date null nghĩa là event_date). UI ghim trong danh sách tháng đang xem.
Không lưu is_today/is_pinned: ngày thay đổi thì kết quả tự đổi.
Sự kiện có địa điểm và livestream vẫn là một bản ghi với nhiều loại/link.

## Demo và cập nhật
Seed có 6 sự kiện, gồm demo ngày 2026-10-06; không tự dời ngày demo.
Demo hôm nay được ghim chỉ khi ngày hiện tại trùng thời gian diễn ra.
Ảnh dùng các file assets/ trong repo, nguồn example.com chỉ là placeholder.
Hashtag cũ chưa chia platform: seed sao chép cho Facebook/TikTok để khớp demo web.
Seed mặc định nháp (is_published=false); chuyển true trong Dashboard khi muốn hiển thị.
Seed không ghi đè bản ghi có legacy_id: nếu đã seed cũ, phải sửa các bản ghi đó trong Dashboard
để thêm loại, hashtag hoặc ảnh mới. Không tự ghi đè dữ liệu đã chỉnh.

## Quyền
RLS cả 4 bảng. anon/authenticated chỉ SELECT sự kiện đã xuất bản và dữ liệu con.
Đăng nhập không tự có quyền quản trị. Tạm ghi bằng Dashboard/SQL Editor.
service_role chỉ dùng phía server. Không đưa khóa này vào web.

## Query và mapping
.select('*, event_hashtags(*), event_links(*), event_images(*)')
Lọc tháng với event_date; lọc loại bằng .contains('event_types', ['Livestream']).
Sắp xếp theo event_date/start_time/sort_order; UI đưa sự kiện hôm nay lên trước.
Dùng toWebEvent() trong event-adapter.mjs để đổi tên trường và sắp xếp các mảng con.
Hàm này được nhúng vào index.html để chuyển dữ liệu lấy từ Supabase.

Tài liệu: https://supabase.com/docs/guides/database/postgres/row-level-security

## Google Drive và ảnh bìa
Project mới dùng schema.sql đã bao gồm trường Drive.
Project đã chạy tới migration 003: chạy thêm 004_drive_images.sql.
events.drive_folder_url: link folder nguồn.
event_images.drive_file_id: ID file Drive để chống nhập trùng theo sự kiện.
event_images.file_name: tên file gốc.
event_images.is_cover: đánh dấu ảnh bìa, DB cho tối đa một ảnh bìa/sự kiện.
Bộ đồng bộ sẽ chọn tên chứa main (không phân biệt hoa/thường); nếu nhiều ảnh main
chọn đầu theo tên, nếu không có chọn ảnh đầu theo tên. Ảnh bìa vẫn nằm trong gallery.
Adapter ưu tiên image_url của ảnh is_cover; thumbnail_url là ảnh dự phòng.

Các trường này chuẩn bị cho đồng bộ. Chưa triển khai Google Drive API/Edge Function;
dán link folder vào DB hiện chưa tự lấy ảnh. is_cover không tự tính bằng trigger.
Bộ đồng bộ phải lấy danh sách file với quyền đọc, cập nhật ảnh và ảnh bìa trong transaction.
image_url phải là URL hiển thị ảnh, không phải trang xem folder/file.
