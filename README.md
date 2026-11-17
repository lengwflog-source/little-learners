# Little Learners – Bài tập Tiếng Anh 6

Website độc lập cho học sinh và giáo viên: đăng nhập, làm bài tập, lưu tiến trình, điểm danh, giao bài.
Không cần cơ sở dữ liệu ngoài: dữ liệu nằm trong **Netlify Blobs** (có sẵn trong Netlify), API chạy bằng **Netlify Functions**.

## Cấu trúc
- `public/` – giao diện (index.html)
- `public/lessons.json` + `public/img/` – Tiếng Anh lớp 6 (26 bài, 272 bộ bài tập, 2.191 câu)
- `public/lop2/lessons.json` – Tiếng Anh lớp 2 (16 Unit + 4 Review, mỗi bài đủ 16 mục, 300 bộ bài tập). Hình minh họa dùng emoji và hình vẽ đơn giản, phần Listen dùng giọng đọc của trình duyệt.
- `public/lop3/lessons.json` – Tiếng Anh lớp 3 (khối **8**): Starter + Unit 1–20 + 4 bài Review, mỗi bài 15 mục. Tạo bằng `dev/gen_l3.py` từ dữ liệu `dev/l3_data.py` (sửa từ vựng/câu trong `l3_data.py` rồi chạy `python3 dev/gen_l3.py`).
- `public/match.js`, `public/match.css` – bài nối tương tác (nối bằng đường kẻ)
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

- Học viên bấm thu ở mục "Listen, repeat and record" → bản thu tự gửi lên (tối đa khoảng 40 giây ở bài phát âm; bài Speaking IELTS tối đa 2 phút, 4MB).
- Giáo viên: menu "Bản thu âm" → nghe, viết nhận xét, lưu. Học viên thấy nhận xét ở bài tập, mục "Bản thu" (có huy hiệu đỏ) và trang chủ.
- File âm thanh tự xóa sau 7 ngày (hàm định kỳ `netlify/functions/cleanup-recs.mjs` chạy mỗi ngày + xóa khi có API gọi). Nhận xét được giữ thêm tới 60 ngày.
- Lưu trong Netlify Blobs (`recmeta`, `recfiles`). Cần đảm bảo cả 2 file mới `netlify/lib/rec.mjs` và `netlify/functions/cleanup-recs.mjs` được đẩy lên GitHub.
- Học viên phải cho phép trình duyệt dùng micro.

## Giao bài theo từng phần
- Ở mục Giao bài, giáo viên chọn từng phần bài tập (ví dụ chỉ Vocabulary: Match hoặc Grammar), không bắt buộc giao cả Unit. Tích ô cạnh tên Unit để chọn cả Unit, bấm vào Unit để mở danh sách các phần.
- Nút "Chọn nhanh" (Vocabulary, Grammar, Listening, Pronunciation, Speaking, Unit test...) chọn mục đó trong tất cả các Unit của khối đang xem.
- Học sinh thấy số phần đã làm, nút "Làm bài" mở thẳng phần chưa làm tiếp theo, và danh sách các phần được giao kèm dấu ✅.
- Bài đã giao theo cách cũ (cả Unit) vẫn hoạt động bình thường. File api.mjs đã được cập nhật để lưu danh sách phần (`ex`).


## Lớp IELTS 1 (khối 9)
- Học sinh/giáo viên chọn khối **IELTS 1** ở thanh chọn khối. Khi tạo học sinh, cột khối ghi **9** (hoặc chọn "IELTS 1" trong trang học sinh).
- 8 Unit (Relationships … Natural World), mỗi Unit 11 bài: Vocabulary ×3, Grammar ×2, Reading, Listening, Audio và Video, Writing, Speaking Part 1, Speaking Part 2. Nội dung do mình soạn mới theo cấu trúc và chủ đề của lớp.
- **Listening/Reading**: tự chấm, đổi ra band bằng bảng quy đổi tham khảo cho bài 40 câu (tỉ lệ đúng × 40). Trang Tiến độ và Trang chủ hiện Band ước tính 4 kỹ năng và Overall (làm tròn 0,5 theo quy tắc IELTS). Bảng nằm ở đầu `public/ielts.js` (`BL`, `BR`) nếu muốn đổi.
- **Writing**: ô viết có đếm từ trực tiếp và gạch đỏ chính tả của trình duyệt. Khi nộp, AI chấm theo 4 tiêu chí (Task Response/Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy), đánh dấu lỗi ngay trong bài, giải thích bằng tiếng Việt và đưa bài viết đã cải thiện (giao diện 2 cột giống ảnh mẫu).
- **Speaking**: học viên thu âm (lưu 7 ngày như bài phát âm), trình duyệt chuyển giọng nói thành chữ (Chrome/Safari), học viên sửa lỗi nhận dạng rồi gửi. AI chấm Fluency, Lexical Resource, Grammar, Pronunciation. **Pronunciation chỉ là ước lượng từ bản chữ**, giáo viên nên nghe lại và chỉnh.
- **Giáo viên**: menu **Chấm IELTS** → xem bài, sửa điểm từng tiêu chí, nhận xét, lỗi đã chữa, bài cải thiện, lời khuyên → "Lưu và gửi cho học viên" (học viên thấy dòng "Giáo viên đã xem và chỉnh sửa"). Có nút "Chấm lại bằng AI". Bản thu giọng nghe ở đây hoặc ở menu "Bản thu âm". Phần chữ và nhận xét giữ 90 ngày, file ghi âm xóa sau 7 ngày.

### Cài khóa AI (bắt buộc để chấm Writing/Speaking)
1. Vào console.anthropic.com → API keys → tạo khóa, nạp một khoản nhỏ (khoảng 5–10 USD).
2. Netlify → Site configuration → Environment variables → thêm `ANTHROPIC_API_KEY` = khóa vừa tạo.
3. (Tùy chọn) `AI_MODEL` (mặc định `claude-haiku-5-5`), `AI_DAILY_LIMIT` (số lượt chấm AI mỗi học viên mỗi ngày, mặc định 12).
4. Bấm **Deploy site** lại. Cần đẩy đủ file mới: `netlify/lib/ai.mjs`, `netlify/functions/ai-grade-background.mjs`, `public/ielts.js`, `public/ielts.css`, `public/ielts/lessons.json`.
- Chi phí tham khảo với Haiku 5.5 khoảng 30 đồng mỗi bài Writing (giá niêm yết 0,10 USD đầu vào và 0,50 USD đầu ra mỗi triệu token).
- Hàm chấm chạy nền (Netlify background function, tối đa 15 phút), học viên thấy "AI đang chấm…" rồi kết quả tự hiện sau khoảng 10–40 giây.

### Audio và video của lớp
Mỗi Unit có bài "Audio và Video của lớp". Hãy chép nguyên hai thư mục **AUDIO** và **VIDEO** (giữ tên thư mục UNIT 1…8 và tên file như đang có) vào `public/ielts/`, ví dụ `public/ielts/AUDIO/UNIT 1/Track 1.1.mp3` và `public/ielts/VIDEO/UNIT 1/Unit 1_Video 1.mp4`. Các file `Track 3.x` và `Track 4.x` hiện không có đuôi, hãy đổi tên thêm `.mp3` (hoặc để nguyên, trang cũng thử phát tên không đuôi). Danh sách file được khai báo trong `dev/gen_ielts.py` (biến `AUDIO`, `VIDEO`); nếu thêm file mới, báo mình để cập nhật. Tổng dung lượng audio và video khoảng 200MB, mỗi file dưới 100MB nên đẩy được qua GitHub.
- Bạn chịu trách nhiệm về quyền sử dụng các file nghe và video bạn tải lên.


## Cập nhật v12
- **Bài nối (matching)** nay là bài nối thật: chạm một ô rồi chạm ô tương ứng, hoặc **kéo từ chấm tròn** sang ô cần nối (chuột và cảm ứng đều dùng được). Đường nối được vẽ bằng SVG, mỗi cặp một màu. Chạm ô đã nối để gỡ, nút "Nối lại từ đầu" xóa hết. Sau khi nộp: đường xanh là đúng, đỏ là sai, nét đứt xanh chỉ đáp án đúng. Kết quả cũ đã lưu vẫn đọc được. Cần đẩy file mới `public/match.js`, `public/match.css` và `public/index.html`.
- **Lớp 3 (khối 8)**: khi tạo học sinh ghi khối **8** (hoặc chọn "Lớp 3"). Nội dung (từ vựng, mẫu câu, câu hỏi) do mình soạn lại theo danh mục Starter, Unit 1–20 của hai tập sách, không sao chép câu hỏi gốc, hình minh họa dùng emoji.
- **Giảm tải máy chủ**: trang tự hỏi máy chủ mỗi 90 giây (trước là 30 giây), tạm dừng khi ẩn tab hoặc khi 5 phút không thao tác. Việc này giảm số request và compute của Netlify.
- **Nén ảnh**: thư mục `public/img` (ảnh của bài Lớp 6) giảm từ 5,1 MB xuống 1,7 MB. Lớp 2 không dùng ảnh nên không cần nén.
