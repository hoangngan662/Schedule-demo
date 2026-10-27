# Các trang trong cùng website
- index.html: Lịch trình hiện tại; chỉ thêm điều hướng chung.
- profile.html: giới thiệu; chưa nhập tiểu sử chưa có nguồn.
- gallery.html: ảnh sự kiện công khai, ảnh lớn không crop, có lọc sự kiện.
- project.html và project-detail.html?id=UUID: dữ liệu bảng projects.
- brand.html và brand-detail.html?id=UUID: dữ liệu bảng brands.

Projects và brands hoàn toàn độc lập với events, không có event_id/khóa ngoại lịch trình.
Dùng chung project Supabase hiện tại nhưng là bảng dữ liệu riêng.
Chạy migrations/202610270001_independent_content.sql trên DB đã có,
hoặc schema.sql trên project mới. Nhập nội dung trong Table Editor và bật is_published.
RLS chỉ cho người xem đọc nội dung công khai; không có quyền ghi trên web.
Không tạo bản ghi giả. Trang mới trống trước khi nhập dữ liệu.
Ảnh bìa dùng cover_image_url; content là văn bản thuần có xuống dòng.
Đường dẫn tương đối dùng được khi host dưới thư mục GitHub Pages.
Điều hướng tới trang HTML riêng, không mở modal. Deploy tất cả trang cùng site/ và assets/.
Chưa chạy migration trên Supabase thực tế.

## Gallery dạng album
gallery.html hiển thị 1 card/sự kiện: ảnh bìa, tên, ngày và số ảnh.
Bấm card đi tới gallery-album.html?id=UUID; trang album hiển thị tất cả ảnh,
không giới hạn 5 ảnh và không dùng modal. Ảnh trong album giữ tỷ lệ gốc.
Ảnh bìa ưu tiên is_cover, sau đó tên có main, sau đó ảnh đầu.

## Trang chủ
index.html là Trang chủ, tổng hợp 3 lịch trình, Profile ngắn, 3 album, 3 Project và 3 Brand.
schedule.html giữ trang Lịch trình trước đây và toàn bộ chức năng của nó.
Nội dung Project/Brand tiếp tục đọc bảng riêng projects/brands; không suy ra từ sự kiện.
Homepage không mở modal; nút đưa tới các trang và trang chi tiết có URL riêng.

## Góc Bạch hồng (chỉ giao diện)
goc-bach-hong.html: trang lời nhắn màu hồng nhạt, form và lời nhắn minh họa.
Nút Xem trước chỉ thêm một bản xem trước vào DOM, không gửi mạng hoặc lưu dữ liệu.
Tải lại trang xóa bản xem trước. Chưa tạo/chỉnh bất kỳ bảng database nào cho mục này.

## Kết nối Góc Bạch hồng hiện tại
Đã thay bản xem trước bằng đọc/gửi bảng wishes ở Supabase riêng.
Xem WISHES.md để biết cấu hình, quyền cần có và kiểm tra kết nối.

## Project dùng Supabase riêng (cập nhật)
Cấu hình site/project-config.js; database uevefacjuhituefgkbmz.
Dùng bảng projects hiện có với các cột:
id,title,type,by_name,actor,status,descr,region,date,budget,target,link,img,gallery,created_at.
Không truy vấn is_published/sort_order ở account Project vì schema không có các cột đó.
Quyền đọc do RLS/grants đã có tại project này quyết định; không sửa DB hoặc policy.
site/project-data.js map img → ảnh bìa, descr → mô tả, link → liên kết project.
gallery nhận JSON dạng chuỗi hoặc mảng; hỗ trợ URL string hoặc object image_url/url/src.
Project list, project detail và mục Project trên home đều dùng account riêng.
Brand vẫn dùng site/config.js. Bảng projects trong schema cũ không còn là nguồn của web.
Không chạy migration independent_content lên DB Project hiện có.
Kiểm tra UI/mapping dùng request giả lập, không ghi dữ liệu thật.
