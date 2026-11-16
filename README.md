# Little Learners – Bài tập Tiếng Anh 6

Website độc lập cho học sinh và giáo viên: đăng nhập, làm bài tập, lưu tiến trình, điểm danh, giao bài.
Không cần cơ sở dữ liệu ngoài: dữ liệu nằm trong **Netlify Blobs** (có sẵn trong Netlify), API chạy bằng **Netlify Functions**.

## Cấu trúc
- `public/` – giao diện (index.html)
- `public/lessons.json` + `public/img/` – Tiếng Anh lớp 6 (26 bài, 272 bộ bài tập, 2.191 câu)
- `public/lop2/lessons.json` – Tiếng Anh lớp 2 (16 Unit + 4 Review, mỗi bài đủ 16 mục, 300 bộ bài tập). Hình minh họa dùng emoji và hình vẽ đơn giản, phần Listen dùng giọng đọc của trình duyệt.
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

## Lớp 2 và chọn khối
- Giáo viên có nút **Lớp 6 | Lớp 2** ở đầu trang để chuyển khối (tiến độ, học sinh, giao bài đều theo khối đang chọn).
- Khi thêm học sinh, ghi `Họ tên; lớp; khối` (khối là 2 hoặc 6). Học sinh đã có khối chỉ thấy khối của mình. Bỏ trống khối thì học sinh tự chuyển được. Đổi khối trong trang chi tiết học sinh.
- Muốn thêm khối khác, thêm thư mục `public/lopX/` cùng cấu trúc (lessons.json + img/) rồi nhờ tôi nối vào giao diện.
- Bài lớp 2 được tạo tự động từ danh sách từ vựng và mẫu câu của từng Unit (file `public/lop2/lessons.json`); đã chạy thử toàn bộ 300 bài để chắc chắn đáp án chấm đúng. Muốn sửa từ vựng hay câu, sửa trực tiếp trong file này.


## Cấp A1+ (English File Elementary)
- Nội dung nằm ở `public/ef/lessons.json`: 12 Unit và 6 bài tổng hợp Revise and Check, mỗi bài gồm từ vựng, ngữ pháp, nghe, phát âm, nói và bài kiểm tra cuối.
- Mỗi Unit có khoảng 46–48 từ vựng (gồm cả từ khó lấy theo chủ đề Vocabulary Bank của sách, có phiên âm, nghĩa và câu ví dụ), hiển thị đầy đủ ở tab Từ vựng. Unit test cuối mỗi Unit và mỗi bài Revise có 40 câu, trong đó khoảng 17–20 câu là nghe (chọn đáp án, gõ lại câu/từ, nghe hội thoại).
- Đây là bài tập tự soạn, bám theo chủ điểm từ vựng, ngữ pháp và phát âm của từng Unit trong sách. Không chép nội dung sách.
- **Thu âm:** học sinh bấm Thu âm, đọc to rồi nghe lại và so với giọng mẫu. Bản thu chỉ nằm trong trình duyệt của học sinh, không được gửi lên máy chủ. Cần dùng HTTPS (Netlify mặc định có) và cho phép micro.
- **Nghe:** giọng mẫu là giọng đọc có sẵn của trình duyệt (Chrome, Safari, Edge). Chất lượng phụ thuộc máy. Muốn dùng giọng thật, thay bằng file mp3 là việc có thể làm thêm.
- Khi tạo học sinh, ghi khối là 3 để học sinh vào thẳng cấp A1+ (ví dụ `Trần An; E1; 3`).


## Bản thu âm của học viên + nhận xét của giáo viên

- Học viên bấm thu ở mục "Listen, repeat and record" → bản thu tự gửi lên (tối đa 40 giây, 2MB).
- Giáo viên: menu "Bản thu âm" → nghe, viết nhận xét, lưu. Học viên thấy nhận xét ở bài tập, mục "Bản thu" (có huy hiệu đỏ) và trang chủ.
- File âm thanh tự xóa sau 7 ngày (hàm định kỳ `netlify/functions/cleanup-recs.mjs` chạy mỗi ngày + xóa khi có API gọi). Nhận xét được giữ thêm tới 60 ngày.
- Lưu trong Netlify Blobs (`recmeta`, `recfiles`). Cần đảm bảo cả 2 file mới `netlify/lib/rec.mjs` và `netlify/functions/cleanup-recs.mjs` được đẩy lên GitHub.
- Học viên phải cho phép trình duyệt dùng micro.

## Giao bài theo từng phần
- Ở mục Giao bài, giáo viên chọn từng phần bài tập (ví dụ chỉ Vocabulary: Match hoặc Grammar), không bắt buộc giao cả Unit. Tích ô cạnh tên Unit để chọn cả Unit, bấm vào Unit để mở danh sách các phần.
- Nút "Chọn nhanh" (Vocabulary, Grammar, Listening, Pronunciation, Speaking, Unit test...) chọn mục đó trong tất cả các Unit của khối đang xem.
- Học sinh thấy số phần đã làm, nút "Làm bài" mở thẳng phần chưa làm tiếp theo, và danh sách các phần được giao kèm dấu ✅.
- Bài đã giao theo cách cũ (cả Unit) vẫn hoạt động bình thường. File api.mjs đã được cập nhật để lưu danh sách phần (`ex`).
