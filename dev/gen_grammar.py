#!/usr/bin/env python3
"""Viết lại phần Ngữ pháp (lý thuyết) của lớp 9 cho dễ đọc: bảng, ví dụ, mẹo ghi nhớ.
Chạy: python3 dev/gen_grammar.py   (ghi đè mục "grammar" của các bài l9-u4-cl, l9-u6-cl, l9-u6-x2 trong public/lop9/lessons.json)
"""
import json, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, "..", "public", "lop9", "lessons.json")
E = html.escape


def tbl(head, rows, widths=None):
    th = "".join(f"<th>{h}</th>" for h in head)
    body = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f"<table><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>"


def grid(items, cols=3):
    """Danh sách ngắn (từ – nghĩa) xếp thành bảng nhiều cột."""
    rows = []
    for i in range(0, len(items), cols):
        chunk = items[i:i + cols] + [""] * (cols - len(items[i:i + cols]))
        rows.append("<tr>" + "".join(f"<td>{c}</td>" for c in chunk) + "</tr>")
    return "<table><tbody>" + "".join(rows) + "</tbody></table>"


def ex(*lines):
    return '<div class="exm" style="margin-top:12px">' + "".join(f"<p>{l}</p>" for l in lines) + "</div>"


def tip(t):
    return f'<div class="exm" style="margin-top:12px"><p>💡 <b>Mẹo nhớ:</b> {t}</p></div>'


# ---------------------------------------------------------------- WISH
WISH = [{
    "title": "WISH – Câu ước (Wish sentences)",
    "html":
    "<p><b>Wish</b> (ước gì) dùng để nói về điều <b>không có thật</b> hoặc <b>khó xảy ra</b>. "
    "<b>If only</b> có nghĩa giống wish nhưng nhấn mạnh hơn: <i>If only I had a bike.</i> = <i>I wish I had a bike.</i></p>"
    "<h3>1. Ba loại câu ước</h3>"
    + tbl(["Loại ước", "Nói về", "Cấu trúc", "Ví dụ"], [
        ["<b>Hiện tại</b>", "Điều không có thật ở hiện tại", "S + wish(es) + S + <b>V2/ed</b><br>(be → <b>were</b> cho mọi chủ ngữ)",
         "I wish I <b>had</b> a car. (Thật ra: I don't have a car.)<br>She wishes she <b>were</b> taller."],
        ["<b>Tương lai</b>", "Mong điều gì đó sẽ xảy ra hoặc thay đổi trong tương lai", "S + wish(es) + S + <b>would / could / might + V</b>",
         "I wish it <b>would stop</b> raining.<br>I wish I <b>could go</b> on a trip with my friends."],
        ["<b>Quá khứ</b>", "Tiếc nuối về điều đã xảy ra", "S + wish(es) + S + <b>had + V3/ed</b>",
         "I wish I <b>had studied</b> harder last year.<br>I wish I <b>hadn't got</b> a bad mark yesterday."],
    ])
    + tip("Nhìn dấu hiệu thời gian: <b>now, at the moment</b> → hiện tại (V2/ed); <b>tomorrow, next…, soon</b> → tương lai (would + V); <b>yesterday, last…, ago</b> → quá khứ (had + V3).")
    + "<h3>2. Lưu ý quan trọng</h3>"
    "<ul>"
    "<li>Sau <b>wish</b> <b>không dùng will</b>: dùng <b>would</b>. Sai: I wish I will study well. Đúng: I wish I <b>would</b> study well.</li>"
    "<li>Động từ <b>be</b> trong câu ước ở hiện tại dùng <b>were</b> với mọi chủ ngữ: I wish I <b>were</b> rich. / He wishes he <b>were</b> here.</li>"
    "<li><b>Wish</b> còn là một động từ thường, nghĩa là <b>want / would like</b>: <b>wish + to V</b>. Ví dụ: He <b>wishes to go</b> home now.</li>"
    "</ul>"
    "<h3>3. Viết lại câu thật thành câu với wish – làm theo 4 bước</h3>"
    "<ol>"
    "<li><b>Đổi khẳng định ↔ phủ định.</b> Câu thật khẳng định → câu wish phủ định; câu thật phủ định → câu wish khẳng định.</li>"
    "<li><b>Lùi thì:</b> hiện tại đơn → quá khứ đơn; can → could; will → would; quá khứ đơn (hoặc hiện tại hoàn thành) → quá khứ hoàn thành (had + V3/ed).</li>"
    "<li><b>Bỏ</b> các cụm mở đầu như <i>I'm sorry, It's a pity, What a pity</i>.</li>"
    "<li>Câu phủ định có <b>any</b> (anything, anyone…) → đổi thành <b>some</b> (something, someone…).</li>"
    "</ol>"
    + tbl(["Câu thật", "Câu với wish", "Giải thích"], [
        ["I'm sorry I don't have a bike.", "I wish I <b>had</b> a bike.", "Bỏ I'm sorry; phủ định → khẳng định; don't have → had"],
        ["She is not tall.", "She wishes she <b>were</b> tall.", "Phủ định → khẳng định; is → were"],
        ["I don't know his telephone number.", "I wish I <b>knew</b> his telephone number.", "don't know → knew"],
        ["It's a pity I can't swim.", "I wish I <b>could</b> swim.", "Bỏ It's a pity; can't → could"],
        ["I don't know anything about him.", "I wish I <b>knew something</b> about him.", "any → some"],
        ["I didn't study well last year.", "I wish I <b>had studied</b> well last year.", "Quá khứ đơn → had + V3/ed"],
        ["It rained heavily yesterday.", "I wish it <b>hadn't rained</b> heavily yesterday.", "Khẳng định → phủ định; quá khứ → had + V3/ed"],
        ["Lan is bad at English.", "Lan wishes she <b>were good</b> at English.<br>= Lan would like <b>to be good</b> at English.", "Đổi sang nghĩa trái ngược; có thể dùng would like + to V"],
    ])
    + "<h3>4. Bài tập chia động từ trong ngoặc</h3>"
    "<p>Tìm dấu hiệu thời gian rồi chọn dạng đúng. Ví dụ: <i>She wishes she (be) <b>would be</b> in London next year.</i> (có <b>next year</b> → tương lai → would + V).</p>"
}]

# ------------------------------------------------ CÁC DẠNG CỦA ĐỘNG TỪ (u6-cl)
VERBS_CL = [{
    "title": "CÁC DẠNG CỦA ĐỘNG TỪ: to V – V-ing – V (nguyên mẫu)",
    "html":
    "<p>Khi hai động từ đi liền nhau, động từ thứ hai phải đổi dạng. Có <b>3 dạng</b>: <b>to V</b> (to-infinitive), <b>V-ing</b> (gerund) và <b>V</b> (nguyên mẫu không to). Dạng nào đúng phụ thuộc vào <b>động từ đứng trước</b>.</p>"
    + tbl(["Công thức", "Dùng sau", "Ví dụ"], [
        ["<b>V + to V</b>", "afford, agree, decide, hope, plan, want, manage, refuse, promise…", "I decided <b>to study</b> English."],
        ["<b>V + O + to V</b>", "advise, allow, ask, encourage, invite, order, tell, warn…", "My mother told me <b>to wash</b> the dishes."],
        ["<b>V + V-ing</b>", "enjoy, avoid, finish, mind, practise, suggest, keep…", "She enjoys <b>listening</b> to music."],
        ["<b>V (nguyên mẫu)</b>", "modal verbs, had better, would rather, make / let + O…", "You should <b>stay</b> at home."],
    ])
    + "<h3>1. Động từ + to V</h3>"
    "<p>Công thức: <b>S + V + to V</b></p>"
    + grid(["afford (đủ khả năng)", "agree (đồng ý)", "appear (có vẻ)", "arrange (sắp xếp)", "attempt (cố gắng)", "care (quan tâm)",
            "claim (khẳng định)", "decide (quyết định)", "demand (đòi hỏi)", "desire (mong muốn)", "expect (mong đợi)", "fail (thất bại)",
            "hesitate (do dự)", "help (giúp)", "hope (hy vọng)", "intend (dự định)", "learn (học)", "manage (xoay sở được)",
            "mean (có ý định)", "need (cần)", "offer (đề nghị)", "plan (lên kế hoạch)", "prepare (chuẩn bị)", "pretend (giả vờ)",
            "promise (hứa)", "refuse (từ chối)", "seem (dường như)", "strive (nỗ lực)", "tend (có xu hướng)", "threaten (đe dọa)",
            "want (muốn)", "wish (ước, muốn)", "would like (muốn)", ""], 3)
    + ex("Cũng dùng <b>to V</b> sau: <b>(be) able, (be) allowed, (be) willing, (be) ready</b> và sau <b>the first / second / third / last / only</b>.",
         "He is <b>ready to help</b> us. · She was <b>the first to arrive</b>.")
    + "<h3>2. Động từ + O + to V</h3>"
    "<p>Công thức: <b>S + V + O (người) + to V</b></p>"
    + grid(["advise (khuyên)", "allow (cho phép)", "ask (yêu cầu)", "beg (van nài)", "encourage (khuyến khích)", "invite (mời)",
            "order (ra lệnh)", "request (yêu cầu)", "tell (bảo)", "want (muốn)", "warn (cảnh báo)", ""], 3)
    + ex("The doctor <b>advised me to rest</b>. · Our teacher <b>encouraged us to read</b> more.",
         "<b>help + O + to V</b> (hoặc V): She <b>helped me (to) carry</b> the bag.")
    + "<h3>3. Động từ + V-ing (danh động từ)</h3>"
    "<p>Công thức: <b>S + V + V-ing</b></p>"
    + grid(["admit (thừa nhận)", "advise (khuyên – khi không có O)", "avoid (tránh)", "appreciate (đánh giá cao)", "can't bear / can't stand (không chịu nổi)", "can't help (không thể không)",
            "consider (cân nhắc)", "delay (trì hoãn)", "deny (phủ nhận)", "detest (ghét cay ghét đắng)", "dislike (không thích)", "enjoy (thích)",
            "feel like (muốn)", "finish (hoàn thành)", "imagine (tưởng tượng)", "keep (on) (cứ tiếp tục)", "mention (đề cập)", "mind (phiền)",
            "miss (nhớ, lỡ)", "postpone (hoãn)", "practise (luyện tập)", "quit (bỏ)", "recall (nhớ lại)", "resent (bực bội)",
            "resist (cưỡng lại)", "resume (tiếp tục lại)", "risk (liều)", "suggest (đề nghị)", "spend (dành – thời gian)", "go (đi + V-ing: go swimming)"], 3)
    + "<p><b>Cũng dùng V-ing sau:</b></p>"
    "<ul>"
    "<li>Các cụm: <b>It's no use / It's no good</b>, <b>(be) worth</b>, <b>(be) busy</b>, <b>have difficulty / trouble (in)</b>, <b>look forward to</b>, <b>(be / get) used to</b>, <b>(be) accustomed to</b>.</li>"
    "<li><b>Sau giới từ</b> (in, on, at, by, to, without, of, about…): She is good <b>at singing</b>. · He left <b>without saying</b> goodbye.</li>"
    "</ul>"
    + ex("It's no use <b>crying</b>. · This film is worth <b>watching</b>. · I'm looking forward to <b>seeing</b> you.")
    + "<h3>4. Cả to V và V-ing đều đúng – nghĩa KHÔNG đổi</h3>"
    + grid(["begin", "start", "continue", "like", "love", "hate", "dread", "prefer"], 4)
    + ex("It <b>started to rain</b>. = It <b>started raining</b>. · I <b>prefer to walk</b>. = I <b>prefer walking</b>.")
    + "<h3>5. Cả to V và V-ing đều đúng – nghĩa THAY ĐỔI</h3>"
    + tbl(["Động từ", "+ to V", "+ V-ing"], [
        ["<b>remember</b>", "nhớ phải làm (việc chưa làm): <i>Remember <b>to lock</b> the door.</i>", "nhớ là đã làm (việc đã làm): <i>I remember <b>locking</b> the door.</i>"],
        ["<b>forget</b>", "quên phải làm: <i>Don't forget <b>to call</b> me.</i>", "quên là đã làm: <i>I'll never forget <b>meeting</b> her.</i>"],
        ["<b>regret</b>", "tiếc phải báo tin xấu: <i>I regret <b>to tell</b> you that…</i>", "hối tiếc việc đã làm: <i>I regret <b>buying</b> this phone.</i>"],
        ["<b>stop</b>", "dừng lại để làm việc khác: <i>He stopped <b>to buy</b> water.</i>", "ngừng hẳn việc đang làm: <i>He stopped <b>smoking</b>.</i>"],
        ["<b>try</b>", "cố gắng: <i>I tried <b>to open</b> the door.</i>", "thử xem sao: <i>Try <b>adding</b> some salt.</i>"],
    ])
    + tip("<b>to V</b> thường chỉ việc <b>chưa xảy ra / có mục đích</b>; <b>V-ing</b> thường chỉ việc <b>đã xảy ra / đang xảy ra</b>.")
    + "<h3>6. Động từ nguyên mẫu (không to)</h3>"
    "<ul>"
    "<li><b>Modal verbs</b> (can, could, may, might, must, will, would, should) + <b>V</b>; <b>had better / would rather + V</b>.</li>"
    "<li><b>make / let + O + V</b>: The film <b>made me cry</b>. · Mum <b>let me go</b> out. (Bị động: <b>be made + to V</b>: I was made <b>to wait</b>.)</li>"
    "<li><b>Động từ giác quan</b> (see, notice, watch, look at, observe, hear, listen to, feel, smell, taste) + O + <b>V</b>: chứng kiến <b>toàn bộ</b> hành động. · + O + <b>V-ing</b>: chứng kiến <b>một phần</b> hành động đang diễn ra.</li>"
    "</ul>"
    + ex("I saw him <b>cross</b> the road. (thấy cả hành động từ đầu đến cuối)", "I saw him <b>crossing</b> the road. (thấy lúc anh ấy đang băng qua)")
    + "<h3>7. Các mẫu khác cần nhớ</h3>"
    + tbl(["Mẫu câu", "Nghĩa", "Ví dụ"], [
        ["It takes / took + (O) + thời gian + <b>to V</b>", "mất bao lâu để làm gì", "It took me two hours <b>to finish</b> the test."],
        ["S + spend + thời gian + <b>V-ing</b>", "dành thời gian làm gì", "She spends an hour <b>reading</b> every night."],
        ["S (người) + need / want / require + <b>to V</b>", "ai đó cần làm gì", "I need <b>to buy</b> a new bike."],
        ["S (vật) + need / want / require + <b>V-ing</b>", "vật cần được (làm gì)", "My bike needs <b>repairing</b>."],
    ])
    + "<h3>8. Thể truyền khiến (nhờ / bảo ai làm gì)</h3>"
    + tbl(["Dạng", "Công thức", "Ví dụ"], [
        ["<b>Chủ động</b> (nhờ người)", "have + O (người) + <b>V</b><br>get + O (người) + <b>to V</b><br>make + O (người) + <b>V</b>", "I <b>had</b> him <b>repair</b> my bike.<br>I <b>got</b> him <b>to repair</b> my bike."],
        ["<b>Bị động</b> (nhờ làm việc gì)", "have / get + O (vật) + <b>V3/ed</b>", "I <b>had my bike repaired</b>.<br>She <b>got her hair cut</b>."],
    ])
}]

# ------------------------------------------------ TO V hay V-ing (u6-x2)
X2 = [
    {"title": "Tổng quan: chọn to V, V-ing hay V?",
     "html":
     "<p>Câu hỏi đầu tiên luôn là: <b>động từ đứng trước là gì?</b> Mỗi động từ đòi một dạng riêng, nên cần học theo nhóm. Bảng dưới là bản đồ tổng quát, các mục sau giải thích từng nhóm.</p>"
     + tbl(["Nhóm", "Dạng theo sau", "Ví dụ ngắn"], [
         ["A. Danh động từ", "<b>V-ing</b>", "enjoy <b>reading</b> · avoid <b>being</b> late · interested in <b>learning</b>"],
         ["B. Động từ nguyên mẫu có to", "<b>to V</b>", "decide <b>to study</b> · tell me <b>to go</b> · happy <b>to see</b> you"],
         ["C. Động từ nguyên mẫu không to", "<b>V</b>", "must <b>go</b> · make them <b>laugh</b> · had better <b>stay</b>"],
         ["D. Đi được với cả hai, nghĩa không đổi", "<b>to V</b> hoặc <b>V-ing</b>", "start <b>to rain</b> = start <b>raining</b>"],
         ["E. Đi được với cả hai, nghĩa thay đổi", "<b>to V</b> ≠ <b>V-ing</b>", "stop <b>to get</b> ≠ stop <b>smoking</b>"],
     ])
     + tip("Học theo thứ tự: nhớ <b>nhóm V-ing</b> trước, rồi nhóm <b>to V</b>, còn lại gần như là <b>V nguyên mẫu</b> sau modal / make / let / giác quan.")},

    {"title": "A. Gerund – Danh động từ (V-ing)",
     "html":
     "<h3>1. Bốn vị trí của V-ing</h3>"
     + tbl(["Vị trí", "Ví dụ"], [
         ["<b>a. Chủ ngữ của câu</b>", "<b>Driving</b> fast causes accidents. · <b>Swimming</b> is her hobby."],
         ["<b>b. Bổ ngữ</b> (sau động từ <i>be</i>)", "My hobby is <b>reading</b> comic books. · Her habit is <b>getting up</b> early."],
         ["<b>c. Tân ngữ của giới từ</b> (V / adj / noun + giới từ + V-ing)", "She is fond of <b>dancing</b>. · I'm interested in <b>learning</b> English."],
         ["<b>d. Tân ngữ trực tiếp của động từ</b>", "They enjoy <b>teaching</b>. · I usually avoid <b>driving</b> in the rush hour."],
     ])
     + "<h3>2. Động từ + V-ing</h3>"
     + grid(["admit: thừa nhận", "advise: khuyên", "avoid: tránh", "complete: hoàn thành", "consider: xem xét", "delay / defer: hoãn lại",
             "deny: phủ nhận", "discuss: thảo luận", "enjoy: thích", "escape: trốn thoát", "face: đối mặt", "feel like: cảm thấy muốn",
             "finish: hoàn tất", "forgive: tha thứ", "imagine: tưởng tượng", "keep (on): tiếp tục", "mention: đề cập", "(not) mind: (không) phiền",
             "miss: nhớ, bỏ lỡ", "postpone: hoãn lại", "practise: luyện tập", "quit = give up: bỏ", "recollect: hồi tưởng", "resist: cưỡng lại",
             "suggest: đề nghị", "understand: hiểu", "anticipate: đoán trước", "appreciate: đánh giá cao", "detest / dislike: không thích", "prevent: ngăn chặn",
             "cease: ngừng, dừng", ""], 3)
     + ex("She <b>avoids eating</b> sweets. · We <b>finished cleaning</b> at six. · Would you <b>mind opening</b> the window?")
     + "<h3>3. Động từ / tính từ + giới từ + V-ing</h3>"
     "<p>Sau giới từ luôn dùng <b>V-ing</b> (không dùng to V).</p>"
     + grid(["approve of: chấp thuận", "argue about: tranh cãi về", "complain about: phàn nàn về", "concentrate on: tập trung vào", "contribute to: đóng góp vào", "depend on: tùy thuộc vào",
             "decide on: quyết định", "forget about: quên", "look forward to: mong đợi", "insist on: nài nỉ", "object to: phản đối", "plan on: dự tính",
             "rely on: dựa vào", "succeed in: thành công trong", "think about / of: nghĩ về", "worry about: lo lắng về", "confess to: thú nhận", "be busy with: bận với",
             "be accustomed to: quen với", "be afraid of: sợ", "be ashamed of: xấu hổ về", "be capable of: có khả năng", "be bored with: chán", "be disappointed in / with: thất vọng về",
             "be fond of: thích", "be hopeful of: hy vọng", "be intent on: chăm chú vào", "be interested in: quan tâm đến", "be opposed to: phản đối", "be proud of = take pride in: tự hào về",
             "be responsible for: chịu trách nhiệm về", "be sorry about: hối tiếc về", "be successful in: thành công trong", "be surprised at: ngạc nhiên về", "be tired of: chán", "be tired from: mệt vì",
             "be worried about: lo lắng về", "be / get used to: quen với", ""], 3)
     + ex("Ví dụ trắc nghiệm: She doesn't approve of her husband ______. (A. to gamble B. <b>gambling</b>)")
     + "<h3>4. Các cấu trúc cố định + V-ing</h3>"
     + tbl(["Cấu trúc", "Nghĩa", "Ví dụ"], [
         ["It's no use / It's no good", "vô ích", "It's no use <b>crying</b>."],
         ["There is no point (in) / What's the point of", "chẳng có lý do gì", "There's no point <b>arguing</b>."],
         ["be (not) worth", "(không) đáng", "This book is worth <b>reading</b>."],
         ["can't help = can't bear = can't stand", "không thể chịu nổi / không thể không", "I can't help <b>laughing</b>."],
         ["have difficulty (in)", "gặp khó khăn khi", "He has difficulty <b>sleeping</b>."],
         ["a waste of money / time", "tốn tiền / mất thời gian", "It's a waste of time <b>waiting</b>."],
         ["be / get used to", "quen với", "I'm used to <b>getting up</b> early."],
     ])},

    {"title": "B. Infinitive – Động từ nguyên mẫu có to (to V)",
     "html":
     "<h3>1. Sáu cách dùng của to V</h3>"
     + tbl(["Cách dùng", "Ví dụ"], [
         ["<b>1. Chủ ngữ của câu</b>", "<b>To help</b> her is my duty."],
         ["<b>2. Động từ + to V</b>", "I decided <b>to study</b> engineering at university."],
         ["<b>3. Động từ + O + to V</b>", "He told <b>me to send</b> this letter."],
         ["<b>4. Be / look / seem / feel + tính từ + to V</b>", "I'm afraid <b>to drive</b> alone at night."],
         ["<b>5. Sau động từ to be</b>", "My purpose is <b>to win</b> the next English competition. · We are <b>to pass</b> the next exam."],
         ["<b>6. Chỉ mục đích</b> (to / in order to / so as to + V)", "He studies hard <b>so as to pass</b> the entrance exam. · There are lots of things <b>to do</b> today."],
     ])
     + "<h3>2. Động từ + to V</h3>"
     + grid(["afford: đủ khả năng", "agree: đồng ý", "appear: có vẻ", "arrange: sắp xếp", "attempt: cố gắng", "ask: yêu cầu",
             "choose: chọn", "decide: quyết định", "demand: đòi hỏi", "expect: mong đợi", "fail: thất bại", "happen: tình cờ",
             "hope: hy vọng", "learn: học", "manage: xoay sở được", "offer: đề nghị", "plan: dự định", "pretend: giả vờ",
             "promise: hứa", "refuse: từ chối", "seem: dường như", "threaten: đe dọa", "want, wish: muốn", "would like: muốn",
             "intend: dự định", "tend: có xu hướng", "claim: khẳng định", "desire: mong muốn", "hesitate: do dự", ""], 3)
     + ex("We can't afford <b>to build</b> a new house. · Mary learned <b>to swim</b> when she was young. · Bob refused <b>to lend</b> me his car.")
     + "<h3>3. Động từ + O + to V</h3>"
     + grid(["want: muốn", "ask: yêu cầu", "tell: bảo", "request: yêu cầu", "order: ra lệnh", "beg: nài nỉ",
             "remind: nhắc", "invite: mời", "advise: khuyên", "warn: cảnh báo", "promise: hứa", "encourage: khuyến khích",
             "teach: dạy", "forbid: cấm", "force: bắt buộc", "persuade: thuyết phục", "expect: mong đợi", ""], 3)
     + ex("He tells <b>me to send</b> this letter. · The teacher encouraged <b>Lan to join</b> the English club.")
     + "<h3>4. Tính từ + to V</h3>"
     + grid(["afraid: sợ", "ashamed: xấu hổ", "considerate: chu đáo", "disappointed: thất vọng", "eager: háo hức", "foolish: dại dột",
             "fortunate / unfortunate: (không) may", "happy / unhappy: vui / buồn", "lucky / unlucky: may / xui", "pleased: hài lòng", "proud: tự hào", "qualified: đủ khả năng",
             "ready: sẵn sàng", "sorry: xin lỗi", "surprised: ngạc nhiên", "angry: giận", "prepared: chuẩn bị", "glad: vui"], 3)
     + ex("Were you disappointed <b>not to win</b> the race? · The actress seems eager <b>to go</b> on stage. · He was not surprised <b>to hear</b> the news.")},

    {"title": "C. Bare infinitive – Nguyên mẫu không to (V)",
     "html":
     "<p>Ở nhóm này động từ thứ hai giữ <b>nguyên mẫu, không có to</b>.</p>"
     + tbl(["Sau…", "Công thức", "Ví dụ"], [
         ["<b>Modal verbs</b> (can, may, must, should…)", "modal + V", "I <b>must go</b> home now."],
         ["<b>had better, would rather, do nothing but</b>", "+ V", "You'd better <b>stay</b> at home. · He did nothing but <b>complain</b>."],
         ["<b>make / let + O</b>", "+ O + V", "The clowns made them <b>laugh</b>. · Mum let me <b>go</b> out."],
         ["<b>Động từ giác quan</b> (see, hear, watch, notice, feel, smell, taste, observe, overhear) – <b>thấy trọn hành động</b>", "+ O + V", "I saw someone <b>get</b> into Tom's house yesterday."],
         ["Động từ giác quan – <b>thấy một phần hành động đang diễn ra</b>", "+ O + V-ing", "She heard him <b>playing</b> the guitar."],
     ])
     + tip("Bị động của <b>make</b> lại dùng <b>to V</b>: <i>They made him wait.</i> → <i>He was made <b>to wait</b>.</i>")},

    {"title": "D + E. Nghĩa không đổi và nghĩa thay đổi",
     "html":
     "<h3>D. Đi với cả to V và V-ing, nghĩa KHÔNG đổi</h3>"
     + grid(["begin", "start", "continue", "like", "dislike", "can't stand", "prefer", "hate", "dread"], 3)
     + ex("I like <b>to swim</b>. = I like <b>swimming</b>. · It began <b>to rain</b>. = It began <b>raining</b>.")
     + "<h3>E. Đi với cả to V và V-ing, nghĩa THAY ĐỔI</h3>"
     + tbl(["Động từ", "+ to V", "+ V-ing"], [
         ["<b>stop</b>", "dừng lại để làm việc khác<br><i>I stopped <b>to get</b> a drink.</i>", "ngừng hẳn việc đang làm<br><i>He stopped <b>smoking</b>.</i>"],
         ["<b>remember / forget</b>", "nhớ / quên phải làm (chưa làm)<br><i>Remember <b>to post</b> the letter.</i>", "nhớ / quên đã làm (đã làm rồi)<br><i>I remember <b>posting</b> it.</i>"],
         ["<b>regret</b>", "tiếc phải báo tin xấu<br><i>I regret <b>to inform</b> you…</i>", "hối tiếc đã làm<br><i>I regret <b>saying</b> that.</i>"],
         ["<b>try</b>", "cố gắng<br><i>I tried <b>to study</b> harder.</i>", "thử làm xem sao<br><i>Try <b>taking</b> a deep breath.</i>"],
         ["<b>go on</b>", "chuyển sang làm việc tiếp theo<br><i>She went on <b>to explain</b> the rule.</i>", "tiếp tục việc đang làm<br><i>He went on <b>talking</b>.</i>"],
         ["<b>would like</b> / <b>feel like</b>", "would like <b>to V</b>: muốn (lịch sự)<br><i>I'd like <b>to go</b>.</i>", "feel like <b>V-ing</b>: thấy muốn<br><i>I feel like <b>going</b>.</i>"],
     ])
     + "<h3>Allow, permit, advise, recommend</h3>"
     + tbl(["Có tân ngữ (O)", "Không có tân ngữ", "Bị động"], [
         ["allow / permit / advise / recommend + <b>O + to V</b><br><i>I permit <b>you to go</b> out.</i>", "allow / permit / advise / recommend + <b>V-ing</b><br><i>I permit <b>going</b> out.</i>", "be allowed / permitted / advised / recommended + <b>to V</b><br><i>You are allowed <b>to go</b> out.</i>"],
     ])
     + "<h3>Suggest (đề nghị)</h3>"
     + tbl(["Cấu trúc", "Ví dụ"], [
         ["suggest + <b>V-ing</b>", "I suggest <b>going</b> to the cinema."],
         ["suggest + that + S (người) + (should) + <b>V</b>", "She suggested that he (should) <b>see</b> a doctor."],
         ["suggest + that + S (vật) + should + be + <b>V3/ed</b>", "He suggested that the report should be <b>finished</b> today."],
     ])
     + tip("<b>suggest</b> <u>không</u> đi với <b>to V</b>. Sai: He suggested to go. Đúng: He suggested <b>going</b>.")},
]


# ------------------------------------------------ LỚP 8 (Global Success 8)
PATH8 = os.path.join(HERE, "..", "public", "lop8", "lessons.json")

L8_U1 = [{
    "title": "Động từ chỉ sự yêu thích + V-ing / to V",
    "html":
    "<p>Sau các động từ chỉ sự yêu thích, ta dùng <b>V-ing</b> hoặc <b>to V</b> để nói về hành động đi kèm. Nhóm nào đi với dạng nào xem bảng sau.</p>"
    + tbl(["Động từ", "Dạng theo sau", "Ví dụ"], [
        ["<b>enjoy, adore, fancy, dislike, detest, don't mind, can't stand</b>", "chỉ + <b>V-ing</b>", "I enjoy <b>reading</b> comic books."],
        ["<b>like, love, hate, prefer</b>", "<b>V-ing</b> hoặc <b>to V</b> (nghĩa gần như không đổi)", "She likes <b>to swim</b>. = She likes <b>swimming</b>."],
        ["<b>would like, would love, would prefer</b>", "<b>to V</b>", "I would like <b>to visit</b> Hue."],
    ])
    + "<h3>Cách dùng với PREFER (thích hơn)</h3>"
    + tbl(["Ý nghĩa", "Cấu trúc", "Ví dụ"], [
        ["Thích làm một việc", "S + prefer + <b>to V</b> / <b>V-ing</b>", "She prefers <b>to drink</b> tea. (Cô ấy thích uống trà.)"],
        ["Thích làm việc này hơn việc kia", "S + prefer + <b>V-ing</b> + <b>to</b> + <b>V-ing</b>", "I prefer <b>flying</b> to <b>travelling</b> by train."],
        ["Thích vật này hơn vật kia", "S + prefer + <b>N</b> + <b>to</b> + <b>N</b>", "I prefer <b>this dress</b> to <b>the one</b> you wore yesterday."],
    ])
    + "<h3>Những cụm diễn tả sự yêu thích khác</h3>"
    + tbl(["Cấu trúc", "Nghĩa", "Ví dụ"], [
        ["be a big fan of + <b>N</b>", "rất hâm mộ, rất thích", "I am a big fan of classical music."],
        ["be interested in + <b>V-ing</b>", "quan tâm, thích thú", "I am interested in <b>reading</b> books."],
    ])
    + tip("Sau giới từ (in, of, to…) luôn dùng <b>V-ing</b>: be interested <b>in reading</b>, prefer flying <b>to travelling</b>.")
}]

L8_U4 = [{
    "title": "Câu hỏi: Wh-questions và Yes/No questions",
    "html":
    "<h3>A. Yes / No questions (hỏi để trả lời Yes hoặc No)</h3>"
    "<p>Công thức: <b>Trợ động từ / to be / modal + S + V …?</b></p>"
    + tbl(["Câu hỏi", "Trả lời"], [
        ["<b>Are</b> you a student?", "Yes, I am. / No, I am not."],
        ["<b>Do</b> you like English?", "Yes, I do. / No, I don't."],
        ["<b>Does</b> she play badminton?", "Yes, she does. / No, she doesn't."],
        ["<b>Did</b> they go to school yesterday?", "Yes, they did. / No, they didn't."],
    ])
    + "<h3>B. Wh-questions (hỏi bằng từ để hỏi)</h3>"
    "<p>Từ để hỏi: <b>who, whom, what, which, whose, where, when, why, how</b>…</p>"
    "<p>Công thức: <b>Wh-word + trợ động từ + S + V …?</b> — Ví dụ: Who <b>are</b> you <b>talking</b> about? · When <b>will</b> the war <b>be</b> over?</p>"
    "<h3>Các bước đổi câu kể thành câu hỏi cho phần gạch chân</h3>"
    "<ol>"
    "<li>Xác định <b>phần cần hỏi</b> và chọn <b>từ để hỏi</b> phù hợp (bảng bên dưới).</li>"
    "<li>Nếu câu có <b>to be</b> hoặc <b>modal</b>: đảo nó lên trước chủ ngữ. <i>She is planting trees now. → What <b>is she</b> planting now?</i></li>"
    "<li>Nếu câu có <b>động từ thường</b>: mượn <b>do / does / did</b>, động từ trở về nguyên mẫu. <i>They play football every day. → What <b>do they play</b> every day?</i></li>"
    "<li>Nếu từ để hỏi là <b>chủ ngữ</b> (who, what, which…): <b>không</b> mượn trợ động từ. <i>Who <b>phoned</b> you last night? · Which bus <b>goes</b> to the city centre?</i></li>"
    "</ol>"
    + tbl(["Hỏi về", "Từ để hỏi", "Câu kể → Câu hỏi"], [
        ["người (tân ngữ)", "who / whom", "I met <u>my uncle</u> yesterday. → <b>Whom</b> did you meet yesterday?"],
        ["người (chủ ngữ)", "who", "<u>Peter</u> gives me this gift. → <b>Who</b> gives you this gift?"],
        ["thời gian", "when / what time", "Our train is arriving <u>in the evening</u>. → <b>When</b> is your train arriving?"],
        ["vật / sự việc", "what", "I had <u>a cup of coffee and a slice of bread</u> for breakfast. → <b>What</b> did you have for breakfast?"],
        ["lý do", "why", "Peter didn't come because <u>he was ill</u>. → <b>Why</b> didn't Peter come to the party?"],
        ["sở hữu", "whose", "It's <u>Jane's</u> car. → <b>Whose</b> car is it?"],
    ])
    + tip("Khi đổi câu có <b>some / any</b> thành câu hỏi, nhớ đổi <b>some → any</b> (hoặc bỏ đi): <i>I had some coffee. → What did you have?</i>")
    + "<h3>C. Một số cụm hỏi hay gặp</h3>"
    + tbl(["Cụm hỏi", "Hỏi về", "Ví dụ"], [
        ["What time", "giờ", "What time is your friend arriving?"],
        ["What kind of / sort of", "loại", "What kind of music do you like?"],
        ["What colour", "màu sắc", "What colour is your bag?"],
        ["How often / long / far / high", "tần suất / thời gian / khoảng cách / độ cao", "How often do you exercise?"],
        ["How much / many / old", "số lượng, tuổi", "How many students are there?"],
    ])
    + "<h3>D. Câu hỏi gián tiếp (lịch sự)</h3>"
    "<p>Khi bắt đầu bằng <b>Do you know …? / Could you tell me …?</b>, phần sau trở về <b>trật tự câu kể</b> (S + V), không đảo trợ động từ.</p>"
    + ex("Where has Tom gone? → Do you know <b>where Tom has gone</b>?")
}]

L8_U5 = [{
    "title": "MẠO TỪ (Articles): a / an – the – không dùng mạo từ",
    "html":
    "<p>Có 3 trường hợp: dùng <b>a / an</b>, dùng <b>the</b>, hoặc <b>không dùng mạo từ</b>.</p>"
    "<h3>1. A / AN (mạo từ không xác định)</h3>"
    + tbl(["Dùng khi", "Ví dụ"], [
        ["Trước danh từ <b>số ít đếm được</b>, nhắc đến lần đầu hoặc nói chung. <b>An</b> dùng trước âm nguyên âm (a, e, i, o, u).", "We need <b>a</b> microcomputer. · He eats <b>an</b> ice-cream."],
        ["Trong các cụm chỉ số lượng nhất định", "<b>a</b> lot (of), <b>a</b> couple (of), <b>a</b> dozen, <b>a</b> hundred, <b>a</b> quarter, <b>a</b> third"],
    ])
    + "<h3>2. THE (mạo từ xác định)</h3>"
    + tbl(["Dùng the khi", "Ví dụ"], [
        ["Vật là <b>duy nhất</b>", "<b>the</b> sun, <b>the</b> sea, <b>the</b> world, <b>the</b> earth"],
        ["Danh từ <b>đã được nhắc đến</b> trước đó", "I saw <b>a</b> beggar. <b>The</b> beggar looked curiously at me."],
        ["Danh từ được <b>xác định bằng cụm từ / mệnh đề</b>", "<b>The</b> girl in uniform · <b>The</b> mechanic that I met · <b>The</b> place where I waited"],
        ["Trước <b>so sánh nhất</b>, <b>first, second, only</b>", "<b>the</b> first day · <b>the</b> best time · <b>the</b> only way"],
        ["<b>The + tính từ</b> chỉ một nhóm người", "<b>the</b> old (người già) · <b>the</b> rich and <b>the</b> poor"],
        ["Tên <b>biển, sông, quần đảo, dãy núi, sa mạc</b>, và tên nước ở <b>số nhiều</b>", "<b>The</b> Pacific · <b>the</b> Alps · <b>the</b> Netherlands"],
        ["<b>The + họ (số nhiều)</b> = cả gia đình", "<b>The</b> Smiths = gia đình Smith"],
    ])
    + "<h3>3. KHÔNG dùng mạo từ</h3>"
    + tbl(["Trường hợp", "Ví dụ"], [
        ["Danh từ <b>số nhiều</b> hoặc <b>không đếm được</b> nói chung", "I like <b>dogs</b>. · He gave us good <b>advice</b>. · What you need is <b>love</b>."],
        ["Tên <b>quốc gia, châu lục, thành phố, núi (đơn), hồ, đường</b>", "<b>Vietnam, France, Europe, Paris, Downing Street</b>"],
        ["Tên <b>ngôn ngữ</b>", "She speaks <b>English</b> and <b>French</b>."],
        ["Tên <b>bữa ăn</b> (trừ khi có tính từ đứng trước)", "They have <b>lunch</b> at eleven. — But: You gave me <b>a delicious dinner</b>."],
        ["<b>Môn thể thao, mùa, phương tiện</b> (by + phương tiện)", "play <b>football</b> · in <b>spring</b> · <b>by</b> bus"],
        ["Nơi chốn dùng với <b>mục đích chính</b>: go to bed / school / work / prison / church", "He goes <b>to school</b> at 7. — But: They went to <b>the school</b> to see the teacher. (chỉ tòa nhà)"],
        ["Sau tính từ sở hữu hoặc sở hữu cách", "<b>My</b> friend (không nói my the friend) · <b>The girl's</b> mother"],
    ])
}]


def main():
    data = json.load(open(PATH, encoding="utf-8"))
    by = {L["id"]: L for L in data}
    by["l9-u4-cl"]["grammar"] = WISH
    by["l9-u6-cl"]["grammar"] = VERBS_CL
    by["l9-u6-x2"]["grammar"] = X2
    json.dump(data, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    d8 = json.load(open(PATH8, encoding="utf-8"))
    b8 = {L["id"]: L for L in d8}
    b8["l8-u1-cl"]["grammar"] = L8_U1
    b8["l8-u4-cl"]["grammar"] = L8_U4
    b8["l8-u5-cl"]["grammar"] = L8_U5
    json.dump(d8, open(PATH8, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("ok:", {k: len(by[k]["grammar"]) for k in ("l9-u4-cl", "l9-u6-cl", "l9-u6-x2")})


if __name__ == "__main__":
    main()
