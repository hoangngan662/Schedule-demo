# Database bổ sung cho giao diện hiện tại

## File cần chạy

`migrations/202611190001_website_content.sql` dành cho database Schedule có bốn bảng events, event_images, event_links, event_hashtags như schema đã cung cấp. Không chạy lại schema.sql để bổ sung trên database đang có dữ liệu. File mới chỉ tạo bảng nội dung và bổ sung cột của brands / brand_campaigns nếu hai bảng này đã được tạo từ migration cũ trong repo. Không chạy file này trên database Projects hoặc Frequency.

Chưa áp dụng SQL lên Supabase thật. Cần chạy thử trên bản sao database, sau đó mở SQL Editor của database Schedule và chạy file migration mới. Các bảng brands / brand_campaigns đã tồn tại cần có cấu trúc tương thích migration cũ của repo; IF NOT EXISTS không tự chuyển đổi bảng khác cấu trúc. Không tự chèn tiểu sử, giải thưởng hoặc dữ liệu mẫu vào database.

## Giao diện → nguồn dữ liệu

| Phần giao diện | Bảng / trường |
|---|---|
| Banner từng trang | site_banners: page, image_url, mobile_image_url, title, subtitle, alt_text, image_position, starts_at, ends_at, sort_order |
| About BEX và banner Profile | artist_profiles: slug, full_name, stage_name, birth_date, height_cm, zodiac, introduction, biography, portrait_url, illustration_url |
| Journey / Music / Film & Game / Show / Press / Awards | profile_entries: profile_id, section, title, summary, content, cover_image_url, timeline_label, starts_on, ends_on, award_result, tags, source_url |
| Lịch tháng, lịch gần nhất, danh sách Schedule | events và các bảng con hiện tại |
| Gallery, ảnh trong modal | events + event_images hiện tại; drive_folder_url tiếp tục do bộ đọc Drive xử lý |
| Brand trên Home | brands: title, logo_url, summary, cover_image_url, website_url |
| Campaign ở trang Brands | brand_campaigns: brand_id, title, description, starts_on, ends_on, cover_image_url, participation_type, credit, tags |
| Ảnh và liên kết trong modal campaign | campaign_images / campaign_links: campaign_id |
| Resources và 4 bài mới trên Home | resources: slug, title, category, summary, content, cover_image_url, author_name, tags, published_at, source_url |
| Ảnh bổ sung bài viết | resource_images: resource_id, image_url, caption, alt_text |
| WR Projects | Giữ bảng projects và gallery trong database riêng hiện tại |
| WR Frequency | Giữ bảng wishes trong database riêng hiện tại |

Một artist_profiles có nhiều profile_entries. Một brands có nhiều brand_campaigns; mỗi campaign có nhiều ảnh và liên kết. Một resources có nhiều resource_images. Campaign độc lập với lịch trình; không bắt buộc event_id. Không tạo bảng Gallery trùng ảnh sự kiện.

Các bảng mới có sort_order, is_published, created_at và updated_at. Section Profile dùng journey/music/film_game/show/press/award; award_result dùng won/nominated. Category Resources dùng guide/analysis/sharing, giao diện dịch thành Hướng dẫn/Phân tích/Chia sẻ. Tags dùng text[] để lọc và hiển thị nhãn. content là văn bản thuần; frontend phải hiển thị dưới dạng text.

## Hiển thị và quyền truy cập

Mặc định nội dung là bản nháp (is_published=false). Chỉ công khai sau khi nhập và kiểm tra. RLS cho khách đọc nội dung đã công khai; ảnh, liên kết và các mục con cũng yêu cầu bản ghi cha được công khai. Banner còn phải nằm trong khoảng thời gian hiển thị nếu có đặt starts_at/ends_at. Người xem không có quyền ghi những bảng nội dung mới; quản lý dữ liệu bằng Table Editor hoặc backend có quyền phù hợp. Không đưa service_role key vào frontend.

Home lấy bài mới bằng published_at desc nullslast, created_at desc và limit 4; project mới dùng created_at từ database Project. Ring/List, băng trôi, bộ lọc đang chọn và trạng thái modal là trạng thái giao diện, không cần bảng riêng. Navigation và footer dùng chung hiện chưa cần CMS.

## Trạng thái tích hợp

Đã chuyển Home, Profile, Brands, Resources và banner sang đọc database bằng anon/publishable key. Cần chạy migration và nhập dữ liệu công khai để hiển thị. Hồ sơ chính được chọn bằng slug=bex. Không dùng dữ liệu mẫu khi thiếu bảng, dữ liệu trống hoặc lỗi mạng. Schedule/Gallery và kết nối Projects/Frequency giữ nguyên. Wishes hiện có quyền gửi lời nhắn riêng; migration không sửa quyền của wishes.

Kiểm tra sau khi chạy: bản nháp không xuất hiện khi đọc bằng anon; bản công khai xuất hiện; ẩn brand thì campaign và ảnh/link con không xuất hiện; ẩn resource thì ảnh con không xuất hiện; khách không thêm/sửa/xóa được bảng nội dung mới; banner hết hạn không xuất hiện. Các kiểm tra này nên thực hiện trên database thử trước khi dùng dữ liệu thật.
