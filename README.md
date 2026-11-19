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
- **Từ v20, nội dung IELTS 1 lấy từ bộ tài liệu BTBT IELTS 1 của bạn** (thay hẳn 8 Unit tự soạn trước đây): 10 Unit (Relationships, Places and buildings, Education and employment, Food and drink, Consumerism, Leisure time, Fame and the media, Natural world, Language, Science and technology). Mỗi Unit chia theo kỹ năng: Vocabulary, Grammar, Reading, Listening, Speaking, Writing (Unit 6–10 gộp Vocabulary & Grammar). Unit 7 và 8 có thêm phần "(bản 2)" từ file UNIT 7_KEY / UNIT 8_KEY, Unit 6–8 có thêm Writing (bổ sung) từ các file Writing Unit 6/7/8. Reading/Listening dạng thi (Exam practice) lấy từ website lớp của bạn, tự chấm và đổi ra band.
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
Các bài Listening/Speaking có gắn sẵn track nghe và video (ví dụ "Track 1.1", "Unit 1 · Video 1"). Hãy chép nguyên hai thư mục **AUDIO** và **VIDEO** từ thư mục BTBT IELTS 1 (giữ tên thư mục UNIT 1…8 và tên file như đang có) vào `public/ielts/`, ví dụ `public/ielts/AUDIO/UNIT 1/Track 1.1.mp3` và `public/ielts/VIDEO/UNIT 1/Unit 1_Video 1.mp4`. Các file `Track 3.x` và `Track 4.x` hiện không có đuôi, hãy đổi tên thêm `.mp3` (hoặc để nguyên, trang cũng thử phát tên không đuôi). Danh sách file được khai báo trong `dev/gen_ielts.py` (biến `AUDIO`, `VIDEO`); nếu thêm file mới, báo mình để cập nhật. Tổng dung lượng audio và video khoảng 200MB, mỗi file dưới 100MB nên đẩy được qua GitHub.
- Bạn chịu trách nhiệm về quyền sử dụng các file nghe và video bạn tải lên.


## Cập nhật v12
- **Bài nối (matching)** nay là bài nối thật: chạm một ô rồi chạm ô tương ứng, hoặc **kéo từ chấm tròn** sang ô cần nối (chuột và cảm ứng đều dùng được). Đường nối được vẽ bằng SVG, mỗi cặp một màu. Chạm ô đã nối để gỡ, nút "Nối lại từ đầu" xóa hết. Sau khi nộp: đường xanh là đúng, đỏ là sai, nét đứt xanh chỉ đáp án đúng. Kết quả cũ đã lưu vẫn đọc được. Cần đẩy file mới `public/match.js`, `public/match.css` và `public/index.html`.
- **Lớp 3 (khối 8)**: khi tạo học sinh ghi khối **8** (hoặc chọn "Lớp 3"). Nội dung (từ vựng, mẫu câu, câu hỏi) do mình soạn lại theo danh mục Starter, Unit 1–20 của hai tập sách, không sao chép câu hỏi gốc, hình minh họa dùng emoji.
- **Giảm tải máy chủ**: trang tự hỏi máy chủ mỗi 90 giây (trước là 30 giây), tạm dừng khi ẩn tab hoặc khi 5 phút không thao tác. Việc này giảm số request và compute của Netlify.
- **Nén ảnh**: thư mục `public/img` (ảnh của bài Lớp 6) giảm từ 5,1 MB xuống 1,7 MB. Lớp 2 không dùng ảnh nên không cần nén.

## Cập nhật v13
Cần đẩy lại `netlify/functions/api.mjs` và `public/index.html` (các file khác không đổi).

- **Điểm lần đầu được khóa.** Học sinh nộp bài xong thì không làm lại để lấy điểm được nữa (nút "Làm lại" đã bỏ với học sinh). Khóa nằm ở máy chủ nên sửa trên trình duyệt cũng không đổi được. Nộp bài có bước xác nhận, báo còn bao nhiêu câu chưa trả lời.
  - Bài đã nộp luôn mở ra ở chế độ xem lại: thấy đáp án học sinh chọn, câu đúng sai và đáp án đúng.
  - Nút **"Luyện lại (không tính điểm)"** cho làm một bản mới để ôn, kết quả không được lưu. Bài thu âm, Writing và Speaking không có nút này.
  - Mỗi bài học có thêm tab **Kết quả** (bảng điểm lần đầu từng phần, bấm "Xem lại" để mở lại bài).
  - Kết quả đã có từ trước v13 được xem là lần đầu và bị khóa. Muốn cho một em làm lại: vào trang học sinh, bấm **"Cho làm lại"** ở phần bài đó (kết quả cũ bị xóa, lần làm tới là lần đầu mới).
  - Ngoại lệ: bài Writing/Speaking của IELTS vẫn được cập nhật số điểm khi AI chấm xong (đáp án vẫn không đổi được).
- **Báo điểm cho phụ huynh.** Khi học sinh làm xong **tất cả** các phần của một mục (ví dụ Unit 4 · Getting started), trang chi tiết học sinh hiện ô **"Báo điểm cho phụ huynh"**: điểm tính theo lần làm đầu, kèm ô nhận xét. Trang Tổng quan có thẻ "Chờ báo điểm cho phụ huynh" liệt kê các mục đã xong mà chưa báo. Nút **"Sao chép tin nhắn"** tạo sẵn đoạn tin để dán vào Zalo.
- **Liên kết cho phụ huynh.** Trong trang học sinh, bấm "Tạo liên kết" để có link dạng `…/#ph-xxxxxxxx`. Phụ huynh mở link (không cần đăng nhập) để xem: điểm các mục đã báo, nhận xét của giáo viên, điểm danh và **nhận xét thái độ** từng buổi. Có nút In / lưu PDF. Có thể "Tạo liên kết mới" (link cũ ngừng dùng) hoặc "Tắt". Link chỉ cho xem đúng một học sinh và không lộ mật khẩu hay dữ liệu bạn học.
- **Nhận xét thái độ khi điểm danh.** Trang Điểm danh có thêm cột nhận xét cho từng em (tự lưu khi bấm ra ngoài ô). Nhận xét hiện trên trang phụ huynh; học sinh không thấy.
- **Trợ giảng.** Trang **Trợ giảng** (chỉ giáo viên thấy) để tạo tài khoản, chọn lớp phụ trách, cấp lại mật khẩu, xóa. Trợ giảng đăng nhập ở link riêng `…/#tro-giang` (hoặc tab "Trợ giảng" ở màn đăng nhập), không đăng nhập được ở tab chính và ngược lại. Trợ giảng **chỉ thấy lớp mình phụ trách**: học sinh, bài giao, điểm danh, bản thu âm. Được: giao bài cho lớp mình, điểm danh (kể cả mở mã điểm danh theo lớp), viết nhận xét thái độ, nhận xét bản thu âm. Cũng được: báo điểm cho phụ huynh và tạo/gửi liên kết phụ huynh cho học sinh lớp mình. Không được: tạo/xóa học sinh, đổi mật khẩu học sinh, cho làm lại bài, xóa bản thu, chấm IELTS, sửa thông báo hay danh sách lớp. Mọi hạn chế kiểm tra ở máy chủ.
- Dữ liệu mới lưu trong hai Blobs store `parent` (link phụ huynh) và `reports` (báo cáo đã báo), tự tạo khi dùng.

## Cập nhật v17 · Tiếng Anh 4 (Lớp 4)
- Thêm khối **Lớp 4** (`public/lop4/lessons.json`, `public/lop4/img/`, `public/lop4/audio/`): Starter, Unit 1–10, Review 1, Review 2 (có phần Extension). Mỗi Unit chia Lesson 1 (từ vựng · ngữ pháp · bài tập), Lesson 2–3 (luyện tập) và phần Nghe có chấm điểm tự động (audio đã nhúng).
- Mã khối: **4**. Giáo viên chọn Lớp 4 trong danh sách khối; khi nhập học sinh hàng loạt dùng mã lớp `4`.
- Hình ảnh được cắt riêng từng hình, nền trắng; những hình phức tạp được tách ra hoặc soạn lại bằng bảng/văn bản.
- Đáp án do thầy/cô soạn lại (sách không kèm đáp án); đáp án phần nghe lấy từ file tape script. Các câu mở/vẽ/tô màu/viết về bản thân được bỏ qua.
- Cần đẩy lên GitHub: `public/index.html`, `netlify/functions/api.mjs`, `public/lop4/`, `README.md`.

## Cập nhật v16 · Quản lý học sinh cho giáo viên

- **Kết quả (trong bài học)**: giáo viên thấy bảng cả lớp (mỗi bé một dòng, mỗi phần bài tập một cột, có TB cả lớp). Bấm vào điểm của bé để xem bài làm.
- **Câu sai của từng bé**: trong hồ sơ học sinh, mỗi phần bài ghi rõ "Sai ở câu: 2, 5" và nút **Xem bài làm** (hiện đáp án bé chọn, đúng xanh, sai đỏ, kèm đáp án đúng).
- **Chọn khối**: 6 nút khối gộp thành một ô có mũi tên ▾ ở thanh trên cùng.
- **Nhập học sinh**: không còn giới hạn 4 bé; có bước *Kiểm tra danh sách* báo lỗi từng dòng, tạo theo từng nhóm 4 bé, dòng lỗi giữ lại trong ô nhập. Có ô *Lớp mặc định* và *Khối mặc định* (chỉ cần dán họ tên). Lớp mới tự được thêm vào danh sách lớp.
- **Mã khối khi nhập**: `2`, `3`, `5`, `6` (đúng số lớp), `A1.1` (A1+ Elementary), `IE1.1` (IELTS 1). Dữ liệu cũ không đổi (nội bộ vẫn giữ id cũ nên học sinh đã tạo không bị mất).
- Tên bài Lớp 5 trong hồ sơ học sinh có kèm tên Unit.

## Cập nhật v15 · Lớp 5 đủ 20 Unit + Review 1–4
Cần đẩy: `public/index.html`, `public/ielts.js`, `netlify/functions/api.mjs` và thư mục **`public/lop5/`** (`lessons.json`, `img/`, `audio/`).

- Có thêm **Học kỳ 1: Unit 1–10, Review 1 và Review 2** (Lớp 5 = khối **5**). Mỗi Unit chia 3 bài *Lesson 1 · Lesson 2 · Lesson 3* (Lesson 1 có từ vựng và ngữ pháp). Học kỳ 2 (Unit 11–20, Review 3–4) giữ nguyên như v14.
- **Bài nghe Học kỳ 1 (Track 1–56) đã chấm tự động**: đáp án lấy từ file *HK1 (Bản GV)* của bạn (bản giáo viên có đáp án phần nghe). Vài chỗ bản GV ghi sai so với đề/hình (ví dụ Unit 1 Lesson 3 bài 6, Unit 3 vài hình quốc kỳ) thì mình theo đề/hình cho hợp lý. Riêng **Unit 6 Track 37 và Unit 8 Track 43** bản GV không có đáp án nên chỉ phát audio, chưa chấm.
- **Unit 17–20 (học kỳ 2)** vẫn chưa có lời băng nên bài nghe chỉ phát audio, chưa chấm tự động.
- Đáp án các bài đọc/viết do mình soạn và đối chiếu với bản GV khi có. Bài mở ("Write about you"), tô màu/vẽ, ô chữ/ô chữ tìm từ, bài vài câu mơ hồ hoặc hình mâu thuẫn với đề đã được bỏ hoặc thay bằng dạng tương đương (ví dụ ô chữ → nhìn hình viết từ).
- Hình ảnh: mỗi hình trong sách cắt riêng, nén nhẹ, gắn đúng câu hỏi.

## Cập nhật v14 · Lớp 5 (Unit 11–20 và Review 3, 4)
Cần đẩy: `public/index.html`, `public/ielts.js`, `netlify/functions/api.mjs` và thư mục mới **`public/lop5/`** (khoảng 19 MB: `lessons.json`, `img/`, `audio/`).

- **Lớp 5** là khối **5**: khi tạo học sinh ghi khối 5 (hoặc chọn "Lớp 5"). Nội dung theo sách *Extra Workbook 5, học kỳ 2*: mỗi Unit có 3 phần là *Từ vựng · Ngữ pháp*, *Luyện tập ngữ pháp* và *Listening Skill*; thêm Review 3 (Unit 11–15) và Review 4 (Unit 16–20).
- **Hình ảnh**: mỗi hình trong sách được **cắt riêng** và nén (JPEG nhỏ), gắn đúng vào câu hỏi/từ vựng của nó, không dùng ảnh gộp cả trang.
- **Bài nghe**: các file nghe của bạn đã chuyển sang mp3 nhẹ (`public/lop5/audio/`) và phát ngay trong bài. Unit 11–16 chấm tự động theo lời băng. **Unit 17–20 chưa có lời băng nên bài nghe chỉ phát audio + hiện đề, chưa chấm tự động.**
- Đáp án do mình soạn (bản sách học sinh không có đáp án). Một số bài mở ("Write about you"), bài đánh dấu ngữ điệu, ô chữ và vài câu mà hình trong sách mâu thuẫn với đề đã được bỏ hoặc chuyển thành bài nghe/đọc to.
- Học kỳ 1 (Unit 1–10) chưa có trong bản này.

## Cập nhật v18 · Tiếng Anh 7 + liên hệ

- **Lớp 7 (mã khối `7`)**: `public/lop7/lessons.json` (+ `public/lop7/img/`). 6 Unit (Hobbies, Healthy living, Community service, Music and arts, Food and drink, A visit to a school) × 7 bài (Getting Started, A Closer Look 1+2, Communication, Skills 1+2, Looking Back, Practice 1, Practice 2) và "Ôn tập giữa kì 1" (Đề cương + Đề số 1–5) và "Ôn tập cuối kì 1" (Đề số 1–5). Đáp án lấy từ phần ĐÁP ÁN trong tài liệu; bài hình, bài nối cột, bài chỉ có phiên âm IPA, bài mở (tự trả lời) không chấm tự động.
- Bài viết lại câu (Rewrite) chấm theo đáp án mẫu (đã tự thêm dạng viết tắt/đầy đủ: don't ↔ do not…).
- Đã bỏ dòng thông báo nhỏ dưới "Chờ báo điểm cho phụ huynh".
- Chân trang: mục **Liên hệ · Zalo / SĐT** → hiện QR Zalo (`public/zalo-qr.png`) và 0923 880 442 / 0941 741 420.
- `netlify/functions/api.mjs`: cho phép khối "7".


## Cập nhật v20 · IELTS 1 thay bằng tài liệu BTBT IELTS 1
- `public/ielts/lessons.json` được tạo lại từ các file Unit 1–10 (Student + Key), UNIT 7/8 KEY, Writing Unit 6–8, Writing của Unit 1–5, Model text và website lớp. Đáp án lấy từ file Key; câu nào không có đáp án (sắp xếp từ không có lời giải, nối ● không có đáp án, bảng phân loại, câu hỏi theo hình/biểu đồ) thì không đưa vào bài tự chấm.
- Writing Task 1/2 chấm bằng AI, có **bài mẫu của giám khảo** hiện sau khi AI chấm xong (nút "Xem bài mẫu của giám khảo"). Biểu đồ/bản đồ của đề Writing nằm trong `public/ielts/img/`.
- Cần đẩy: `public/ielts/` (lessons.json, img/), `public/ielts.js`. Hai thư mục AUDIO và VIDEO vẫn tự chép vào `public/ielts/` như cũ (Unit 3 và 4 file không có đuôi .mp3 vẫn phát được).

## Cập nhật v21 · Đưa thêm ~200 bài tập IELTS 1 còn thiếu (tự soạn đáp án)
- Các bài trước đây bị bỏ vì không có đáp án (nối tranh, nối ● không có key, bảng phân loại, sắp xếp từ/đoạn, câu hỏi theo biểu đồ, Yes/No/Not Given, điền nhãn sơ đồ…) nay đã được đọc lại và soạn đáp án, đưa vào bài tự chấm. Tổng IELTS 1 hiện: 70 bài học, 464 bài tập, 2125 câu.
- Ảnh trong các bài tập nối tranh/biểu đồ/sơ đồ nằm trong `public/ielts/img/` (đã che đáp án trong ảnh chụp LMS; biểu đồ được vẽ lại từ dữ liệu trong file Word).
- Những đáp án **suy ra** (không có trong key) gồm: bài nghe có script thì lấy từ script; tranh/sơ đồ thì lấy theo hình; một số câu key bị lỗi chính tả hoặc mâu thuẫn đã sửa (ví dụ Unit 8 Ex 6 'can swim' = ability; Unit 10 biểu đồ Line A 2030 = 65%). Thầy nên xem lại các bài này.
- 3 bài chưa chuyển: Unit 1 E.Listening Ex 5 (chỉ là phần giới thiệu), UNIT 7 KEY Listening Ex 2 (track 7.7–7.12) và UNIT 9 KEY Listening Ex 1 (track 9.1–9.8) vì không có script/đáp án.
- Khi có bài Reading/Listening đầy đủ từ file Word, không còn thay bằng bản web nữa; bản web chỉ thêm các bài "Exam practice".
- Cần đẩy: `public/ielts/` (lessons.json, img/), `public/ielts.js`, README.md. AUDIO/VIDEO vẫn tự chép vào `public/ielts/`.

### Bài nghe chưa có file audio (đã lọc khỏi web)
23 bài tập cần nghe nhưng chưa có file audio nên không đưa lên web: Unit 4 (Ex 8, 9), Unit 5 (Ex 5, 6), Unit 6 (Ex 6), Unit 7 L&S (Ex 1, 2, 3, 7, 8), Unit 8 L&S (Ex 2, 3, 4, 7), Unit 9 L&S (Ex 1–4), Unit 10 L&S (Ex 1, 2, 3, 5, 6).
Khi có audio thì báo lại để thêm vào. Audio hiện có: Unit 1–8 phần Listening của IELTS (Unit 8 lấy từ file nhúng trong unit 8 - Listening.docx).

## Cập nhật v22
**Cần đẩy lên GitHub:** toàn bộ thư mục (chép đè), gồm `netlify/functions/api.mjs`, `public/index.html`, `public/extras.js`, `public/extras.css`, `public/ef/lessons.json`, `public/ielts/`.
- **Đánh số lại bài tập** 1-2-3-4 theo đúng thứ tự trong từng Unit (cả khối A1 và IELTS 1). Ở khối A1 số 17 dành cho "Kết quả", Unit test là 18.
- **Bỏ bài "Practical English"** (ví dụ Checking in at a hotel) khỏi các Unit lẻ của A1 (Unit 1, 3, 5, 7, 9, 11).
- **Bài thu âm "Listen, repeat and record"**: học viên đã thu âm xong thì tự tính đúng hết (15/15) và đánh dấu đã làm; kết quả cũ 0/15 của loại bài này được tự sửa khi mở lại.
- **Nút "← Bài trước"** trong màn hình làm bài. Nút "Bài kế tiếp →" bị khóa cho đến khi học viên bấm **Nộp bài** (giáo viên/trợ giảng không bị khóa).
- **Chuông thông báo** (góc phải thanh trên): học viên nhận khi có bài được giao và khi giáo viên nhận xét bản thu; giáo viên và trợ giảng nhận khi học viên nộp bài (trợ giảng chỉ thấy học viên lớp mình). Trạng thái "đã xem" lưu trên máy chủ nên không hiện lại sau khi tải trang.
- **Trợ giảng** xem bài như giáo viên (xem đáp án, nội dung bài). Trang Giao bài có thêm liên kết "👁 Xem bài" để xem trước khi giao.
- **Trang Bản thu âm của giáo viên**: lọc theo học sinh (bấm tên A, B, C… chỉ hiện bản thu của các bạn đó, hoặc "Hiện tất cả"), gom bản thu theo học sinh rồi theo bài, có nút "Nhận xét cả bài" để chấm một lần cho nhiều bản thu.
- **Bảng nhận xét Speaking** (Phát âm / Sử dụng từ vựng / Trả lời câu hỏi × Xuất sắc / Tốt / Đạt / Cần cải thiện) tick nhanh, bấm lại để bỏ tick; ô nhận xét đánh máy vẫn giữ. Nhận xét hiện trực tiếp trong bài làm của học viên và ở trang "Bản thu", kèm chuông báo.
- Chưa làm trong bản này: mascot Baby Dragon và hướng dẫn lần đầu đăng nhập (để bản sau).
- Lưu ý: Unit 3 Ex 6 nhắc "Video 3" nhưng thư mục chỉ có Video 1 và 2 (đã dùng ở Ex 2 và Ex 5).

## Cập nhật v23 · Linh vật Baby Dragon
- **Rồng Baby Dragon** (tay chân, đầu, mắt… vẽ bằng SVG, chuyển động 2D: bay lơ lửng, vẫy tay, vỗ cánh nhỏ, chớp mắt, vẫy đuôi). Màu lấy theo theme web.
- **Lần đầu học sinh đăng nhập** rồng tự hướng dẫn 5 bước: chào → Bài được giao → chuông thông báo → Bản thu (nhận xét) → cách làm bài, Nộp bài, Bài kế tiếp/Bài trước. Chỉ hiện một lần (lưu theo tài khoản). Bấm vào rồng ở góc phải để xem lại.
- Học sinh có thể ẩn rồng (nút ✕ khi rê chuột/chạm vào rồng) và bật lại bằng nút tròn nhỏ.
- **Giáo viên** bật/tắt rồng cho tất cả học sinh ở trang *Giao bài → Linh vật Baby Dragon*. Rồng chỉ hiện ở tài khoản học sinh.
- **Cách gỡ hẳn:** xóa 2 dòng `mascot.css` và `mascot.js` trong `public/index.html` (hai file này nằm riêng), hoặc dùng "Revert" commit trong GitHub Desktop.
- File mới: `public/mascot.js`, `public/mascot.css`. Có sửa: `public/index.html`, `netlify/functions/api.mjs` (cờ `mascotOff` trong cấu hình).

## Cập nhật v24 · Lớp 12 giải đề THPT + công cụ làm bài + Kho từ vựng
**Cần đẩy lên GitHub:** toàn bộ thư mục (chép đè). File mới: `public/thpt.js`, `public/thpt.css`, `public/thpt12/lessons.json`. Có sửa: `public/index.html`, `netlify/functions/api.mjs`.
- **Khối 12 · Luyện đề THPT** (tên khối "Lớp 12"; khi tạo học sinh chọn khối 12). Hiện có 3 đề × 40 câu: Đề 01 (Sở GD Ninh Bình L1) và Đề 02 (Chuyên KHTN L2) chuyển từ hai file bạn gửi, kèm đáp án, lời giải từng đáp án và bản dịch; Đề 03 là đề tự soạn theo ma trận. Mỗi đề chia thành 6 phần nhỏ; **nộp phần trước mới mở phần sau** (cả nút Bài kế tiếp lẫn danh sách bài). Sau khi nộp, **mọi câu** (đúng hoặc sai) đều hiện lời giải: vì sao đúng, vì sao từng đáp án còn lại sai, bản dịch. Có tổng kết số câu đúng và điểm /10 khi nộp đủ.
- **Giao diện chia đôi**: bài đọc bên trái (rộng hơn, cuộn riêng), câu hỏi bên phải. Điện thoại: hai tab "Bài đọc" / "Câu hỏi".
- **Thanh công cụ làm bài** (mọi khối): bút highlight xanh lá / vàng pastel + tẩy; **Dịch từ**; nút **A▾ A▴** chỉnh cỡ chữ (nhớ theo thiết bị). Highlight lưu trên máy học sinh, không mất sau khi nộp bài.
- **Dịch từ** (mọi khối): bật nút Dịch từ rồi chạm/bấm vào từ bất kỳ (bài đọc, câu hỏi, đáp án, lời giải). Máy tính: rê chuột thấy kính lúp và ô sáng quanh từ. Hiện nghĩa tiếng Việt + loại từ + phiên âm + nút nghe; khối 10-11-12 có nút **Thêm vào kho từ vựng** (lưu kèm câu chứa từ đó). Tra từ chạy qua máy chủ (`GET /api/tr?w=`), dùng Google Translate (dữ liệu loại từ) + dictionaryapi.dev (phiên âm), dự phòng MyMemory. Không cần khóa API.
- **Kho từ vựng cá nhân** (menu "Kho từ vựng", chỉ khối 10-11-12): danh sách từ đã lưu, tìm kiếm, lọc đã thuộc / chưa thuộc, ôn bằng thẻ lật, kiểm tra nhanh 10 câu chọn nghĩa. Lưu trên máy chủ theo tài khoản (kho dữ liệu mới `vocab`, API `GET/PUT /api/vocab`), tự xóa khi xóa học sinh.
- Khối 10 và 11 đã có trong danh sách khối (hiện chỉ có trang "đang cập nhật" + Kho từ vựng). Muốn thêm nội dung sau chỉ cần thêm `public/thpt10/` hoặc tương tự và một dòng nạp file giống `thpt12`.
- Chưa làm trong bản này: 7 đề mới còn lại (sẽ bổ sung theo từng đợt, mỗi đợt chỉ cần thay `public/thpt12/lessons.json`).
- Lưu ý: nếu máy chủ Netlify chặn gọi ra ngoài thì nút Dịch từ báo "Chưa tra được từ", các tính năng khác vẫn dùng bình thường.
- **Rồng hướng dẫn công cụ làm bài** (thêm vào v24, sửa `public/mascot.js`): lần đầu học sinh mở một bài có thanh công cụ, rồng tự giới thiệu 7 bước (bút highlight, Dịch từ, Kho từ vựng, cỡ chữ, chia đôi bài đọc/câu hỏi, Nộp bài). Chỉ hiện một lần (lưu `tour_ex_v1`); bấm vào rồng ở trang làm bài để xem lại. Ở trang chủ, hướng dẫn thêm bước Kho từ vựng cho khối 10-12.

## Cập nhật v25 · Lớp 8, Lớp 9 (Học kì 1), Lớp 6 (Unit 1-2-3) + sửa báo cáo phụ huynh
**Cần đẩy lên GitHub:** chép đè các file/thư mục sau: `public/index.html`, `netlify/functions/api.mjs`, `README.md`, và 3 thư mục mới `public/lop6/`, `public/lop8/`, `public/lop9/` (mỗi thư mục có `lessons.json` và `img/`).
- **Lớp 9 · Global Success (HK1)**: 6 unit × 7 phần (Getting Started, A Closer Look 1+2, Communication, Skills 1+2, Looking Back, Practice 1, Practice 2) + Practice 3 (Unit 2), "Chuyển đổi câu: hiện tại hoàn thành" (Unit 5), "To V hay V-ing" (Unit 6), 5 đề ôn giữa kì 1, 6 đề ôn cuối kì 1. Khoảng 5.200 câu, 56 bộ bài.
- **Lớp 8 · Global Success (HK1)**: 6 unit × 7 phần + Practice 3 (Unit 5), 5 đề ôn giữa kì 1, 5 đề ôn cuối kì 1. Khoảng 4.800 câu, 53 bộ bài.
- **Lớp 6 · Unit 1-2-3 (HK1)**: 3 unit × 7 phần + 2 bài ngữ pháp Simple present (to be / động từ thường) + 5 đề ôn giữa kì 1. Khoảng 2.600 câu, 28 bộ bài. Hiện ở đầu danh sách Lớp 6 (trước Unit 4-5-6 cũ).
- Cách tạo học sinh: khối **8** = Lớp 8 mới, khối **9** = Lớp 9 mới (Lớp 3 vẫn là khối "3", IELTS là "IE1.1"; trong web, Lớp 8/9 dùng mã nội bộ 108/109 nên không trùng dữ liệu cũ). Có trong ô chọn khối và import danh sách học sinh.
- Mỗi bài có: từ vựng + phiên âm + nghĩa, bài nghe-đọc theo từ vựng (bấm ♪), bài tập chấm tự động (trắc nghiệm, điền từ, Đúng/Sai, viết câu…) lấy từ file Word của bạn; đáp án lấy từ phần "ĐÁP ÁN" (chữ in đậm/gạch chân) trong file.
- Bỏ qua: bài tập dạng nhìn hình rồi viết/nối (không có hình dùng được), tự luận mở (được chuyển thành ghi chú tham khảo), file "HKI.8 LUYỆN TẬP" / "HKI.1 (BÀI TẬP LUYỆN TẬP)" dung lượng rất lớn, bản "To V - Ving" không có đáp án, file tạm `~$…`.
- **Báo cáo phụ huynh**: không còn liệt kê từng bài; chỉ hiện **tổng điểm** của mỗi báo cáo + nhận xét của giáo viên (mục "Điểm các bài").
- Chưa làm: website riêng khối 10 trọng tâm từ vựng (Quizlet) — chờ bạn gửi file bài tập bổ trợ (thư mục Google Drive không đọc được từ đây).
- **Thanh menu giáo viên gọn hơn** (thêm vào v25, chỉ sửa `public/index.html`): Tổng quan, Học sinh, Điểm danh, Giao bài, Bản thu âm, Chấm IELTS, Trợ giảng, Bài học gom vào một nút "☰ …" bấm mở ra như mục chọn khối. Danh sách chọn khối ngắn lại (cao tối đa ~380px), cuộn được; trên điện thoại hai menu mở vừa màn hình.

## Cập nhật v25b · Khóa bài chưa giao + Baby Dragon nhắc làm đủ bài
Chép đè: `public/index.html`, `public/mascot.js`, `public/mascot.css`, `netlify/functions/api.mjs`, `README.md` (cùng các thư mục `lop6`, `lop8`, `lop9` của v25).
- **Giáo viên giao bài nào thì học sinh chỉ làm bài đó.** Học sinh có bài được giao (theo lớp) chỉ mở được các phần/bài tập đúng trong bài giao; bài khác hiện 🔒 "Chưa được giao", gõ đường dẫn trực tiếp cũng bị chặn. Nút Bài kế tiếp/Bài trước chỉ nhảy qua các bài được giao. Học sinh chưa có bài giao nào (hoặc lớp khác chưa được giao) vẫn làm tự do. Các bài đã làm xong vẫn xem lại được.
- Công tắc **"Khóa bài chưa giao"** ở trang Giao bài (mặc định bật; tắt thì mọi học sinh làm tự do như trước). Mới có thêm trường `lockOff` trong cấu hình và thao tác `lock` ở máy chủ.
- **Baby Dragon nhắc nhở:** sau khi nộp một bài mà sau ~3 giây học sinh chưa bấm Bài kế tiếp, và vẫn còn bài được giao chưa làm, rồng hiện lời nhắc "Còn N bài thầy giao chưa xong!" kèm nút "Làm bài kế tiếp →". Mở trang chủ khi còn bài chưa làm rồng cũng nhắc. Làm đủ bài được giao thì rồng thôi nhắc và các bài khác vẫn khóa. Học sinh ẩn rồng hoặc giáo viên tắt rồng thì không có nhắc nhở.
- Lưu ý: việc khóa nằm ở giao diện (trang web); đủ dùng cho học sinh bình thường.

## v26 – Lớp 12: thêm Đề 04–10
- 7 đề mới (t12-04 … t12-10), mỗi đề 40 câu, 6 phần; thứ tự các dạng bài (điền từ, sắp xếp câu, chọn câu điền vào đoạn, đọc hiểu) được đảo khác nhau giữa các đề.
- Đề tự soạn bám cấu trúc đề tham khảo THPT 2025–2026; có giải thích cả 4 đáp án.
- File thay đổi: public/thpt12/lessons.json

## v27
- Lớp 12: thêm Đề 11–30 (20 đề, mỗi đề 40 câu, có lời giải; thứ tự các dạng bài được đảo).
- Giao diện làm bài: khung đoạn văn rộng hơn; thanh công cụ ghim bên phải/trái/trên (nút 📌, nhớ lựa chọn); cỡ chữ áp dụng cho mọi khối lớp.
- Dịch: bôi chọn một câu/vùng khi bật "Dịch từ" để dịch cả câu (API mới `GET /api/trs?s=`).
- Lời băng (Listening script) chỉ hiện sau khi học sinh nộp bài.
- Ảnh trong bài to hơn, chạm vào để phóng to.
- Header: nút chọn lớp nằm sát nút "Bài học"; trang đăng nhập bỏ dòng "tiếng Anh lớp 6".

## v28
- Baby Dragon chuyển sang góc trái dưới (bong bóng lời nhắc cũng đổi hướng).
- Nút "← Quay lại" ở góc trái phía trên nội dung của mọi mục (quay về trang trước; nếu không có thì về mục cha).

## v28b
- Sửa: bấm vào ảnh trong bài nối (match) giờ phóng to đúng (trước đây bài nối vẽ lại làm mất sự kiện). Bấm ảnh chỉ để phóng to, không chọn ô.

## v29
- Đoạn đục lỗ (cloze) của đề 04–30 lớp 12 được kéo dài (~150–190 từ, 3–4 đoạn), văn phong tin/thông báo như tài liệu "GIẢI ĐỀ BUỔI 1" (nội dung tự soạn, không chép lại).
- Chỉ cần ghi đè `public/thpt12/lessons.json` (chọn Merge).

## v30
- Phóng to ảnh: chạm/bấm vào bất kỳ ảnh nội dung nào (mọi lớp, kể cả lớp thêm sau này) đều phóng to; chỉ bỏ qua logo, rồng, mã QR, thanh công cụ.
- Thanh công cụ highlight mặc định ở bên trái (lưu lựa chọn mới; vẫn đổi được Trái/Phải/Trên bằng nút 📌).
- Đoạn đục lỗ đề 03 cũng được kéo dài (đề 01–02 là đề thật nên giữ nguyên).

## v31
- Nút Quay lại: luôn về Thư viện (Bài học) / Trang chủ, cuộn theo trang; trên điện thoại nằm ngay trong thanh công cụ.
- Baby Dragon: "trợ lý của Mr. Phi Long"; giữ nguyên màu ở chế độ tối; bấm vào rồng có 2 mục Hướng dẫn / Q&A.
- Q&A (chỉ Lớp 10, 11, 12 và IELTS): hỏi AI → học sinh chấm 1–5 sao → dưới 3 sao báo thầy, thầy trả lời trong khung chat (mục "Giải đáp" trong menu giáo viên, có lịch sử). Tự xóa sau 48 giờ. Nhắc mở Q&A sau ~1 phút làm bài. Cần ANTHROPIC_API_KEY trên Netlify (đã dùng cho chấm IELTS).
- Điện thoại: menu 1 khung có mũi tên; làm bài thì tiêu đề cuộn đi, thanh công cụ dính trên; bài đọc (trên) và câu hỏi (dưới) chia đôi, mỗi phần cuộn riêng.

## v31b
- Sửa: menu "Tổng quan" của giáo viên bị ẩn trên điện thoại.
- Sửa: xoay ngang điện thoại — trang cuộn bình thường, bài đọc bên trái dính khi cuộn, câu hỏi bên phải; không còn chồng chữ.
- Chia đôi dọc (bài đọc trên / câu hỏi dưới): cuộn hết khung thì trang cuộn tiếp.

## v32
- Lớp 12, đề 05–30: nâng từ vựng trong bài đọc/đoạn đục lỗ lên dải A2→C1 (≈10 chỗ mỗi đề: numerous, crucial, tackle, owing to, nevertheless…). Không đụng tới từ được hỏi trong câu hỏi/đáp án/lời giải.
- Mục Giải đáp (giáo viên): thêm nút "Kiểm tra AI" để thử khóa ANTHROPIC_API_KEY.

## v32b
- Q&A: bỏ tham số temperature (một số mô hình mới không nhận), tự thử nhiều mô hình (haiku → sonnet), và khi lỗi thì hiện "mã lỗi" ngắn để dễ chẩn đoán.

## v32c
- Sửa lỗi "`temperature` is deprecated for this model": bỏ tham số này ở cả Q&A và chấm IELTS bằng AI.

## v33 (gộp v31 → v32c)
- Thanh tiêu đề gọn một hàng ở mọi kích thước: menu dạng ô có mũi tên (không còn hiện trùng 2 menu).
- Gồm toàn bộ thay đổi v31, v31b, v32, v32b, v32c (Q&A, giao diện điện thoại, từ vựng đề 05–30, sửa lỗi temperature).
