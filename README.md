# Little Learners – Bài tập Tiếng Anh 6

Website độc lập cho học sinh và giáo viên: đăng nhập, làm bài tập, lưu tiến trình, điểm danh, giao bài.
Không cần cơ sở dữ liệu ngoài: dữ liệu nằm trong **Netlify Blobs** (có sẵn trong Netlify), API chạy bằng **Netlify Functions**.

## Cấu trúc
- `public/` – giao diện (index.html), nội dung bài (lessons.json, 26 bài / 272 bộ bài tập / 2.191 câu) và ảnh (img/)
- `netlify/functions/api.mjs` – đăng nhập, tiến trình, điểm danh, giao bài, quản lý học sinh
- `netlify.toml`, `package.json` – cấu hình Netlify

## Đưa lên Netlify (khuyên dùng: qua GitHub)
1. Tạo repository GitHub mới và đẩy toàn bộ thư mục này lên.
2. Vào app.netlify.com → **Add new site → Import an existing project** → chọn repository. Giữ nguyên cài đặt (Netlify tự đọc `netlify.toml`) → **Deploy**.
3. **Trước khi chia sẻ link**, vào *Site configuration → Environment variables* và thêm:
   - `SETUP_CODE` = một mã bí mật do bạn tự đặt (ngăn người lạ tạo tài khoản giáo viên đầu tiên)
   - `JWT_SECRET` = một chuỗi ngẫu nhiên dài (không bắt buộc; nếu bỏ trống hệ thống tự sinh và lưu trong Blobs)
   Sau đó **Deploys → Trigger deploy** để áp dụng.
4. Mở website, màn hình đầu tiên là **Tạo tài khoản giáo viên** (nhập mã cài đặt nếu có). Chỉ tạo được một lần.
5. Đăng nhập giáo viên → **Học sinh → Thêm học sinh**: dán danh sách `Họ tên; lớp`, hệ thống sinh tên đăng nhập và mật khẩu (tải CSV để phát cho học sinh).

Cách khác: cài Netlify CLI, chạy `npm install` rồi `netlify deploy --prod`. Kéo-thả thư mục lên Netlify không phù hợp vì phần API cần cài `@netlify/blobs`.

Tên miền riêng: *Domain management → Add a domain*.

## Chạy thử trên máy
`npm install` rồi `npx netlify dev` (cần Node 18+). Dữ liệu cục bộ được Netlify CLI giả lập.

## Quyền và bảo mật
- Mật khẩu được băm bằng scrypt; phiên đăng nhập 7 ngày (token ký HMAC); khóa 10 phút sau 8 lần sai.
- Học sinh chỉ đọc/ghi dữ liệu của chính mình. Mọi thao tác quản lý kiểm tra quyền giáo viên ở phía máy chủ.
- Học sinh đổi mật khẩu ở mục *Tài khoản*; giáo viên cấp lại mật khẩu trong trang chi tiết học sinh.

## Lưu ý
- Đáp án của 2.191 câu được soạn tự động từ file Word (không có đáp án gốc) nên cần giáo viên rà soát. Sửa trực tiếp trong `public/lessons.json` (mỗi câu có trường `a` là đáp án).
- Hai hình định dạng .wmf trong đề ôn không hiển thị được.
- Giới hạn gói miễn phí của Netlify áp dụng cho Functions và Blobs; một lớp học thông thường nằm trong giới hạn này.
