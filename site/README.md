# Các trang đang sử dụng

- index.html: Home, tổng hợp các phần chính.
- profile.html: Profile, banner cá nhân và các dải nội dung.
- schedule.html: lịch trình và chi tiết sự kiện.
- gallery.html: album sự kiện, xem ảnh trong modal.
- brand.html: Brands & Campaigns, chế độ Ring/List và modal campaign.
- goc-bach-hong.html: WR Frequency, đọc và gửi lời nhắn.
- project.html: WR Projects, bộ lọc, băng trôi/List và modal kèm ảnh.
- resources.html: WR Resources, tìm kiếm, lọc chủ đề và đọc bài trong modal.

## Dữ liệu và tệp hỗ trợ

Giữ nguyên assets/, site/ và supabase/ khi triển khai. Các cấu hình kết nối nằm trong site/config.js, site/project-config.js và site/wishes-config.js. WR Projects dùng Supabase riêng và đọc dữ liệu qua site/project-data.js; WR Frequency dùng wishes-client.js. Xem WISHES.md và ../supabase/README.md cho thông tin cấu hình liên quan.

Home, Profile, Brands và Resources hiện có nội dung minh họa. Schedule, Gallery, Projects và Frequency sử dụng kết nối dữ liệu hiện có. Việc dọn trang không thay đổi cơ sở dữ liệu.

## Dọn các trang cũ

Đã bỏ ba trang chi tiết riêng trước đây vì nội dung hiện được mở bằng modal ở trang chính. Đã bỏ hai script Home cũ không còn được trang nào gọi và phần xử lý các trang chi tiết cũ. site/pages.js hiện chỉ phục vụ Gallery; site/brand-demo.js vẫn được Home sử dụng.
