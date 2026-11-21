#!/usr/bin/env python3
"""Ghép câu Word form bổ sung (dev/wordform_extra_*.py) vào public/lop9/lessons.json.
Mỗi lesson có WORDFORM được đưa lên đúng 100 câu độc nhất (giữ câu cũ, thêm câu mới). Chạy: python3 dev/gen_wordform.py
"""
import json, re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from wordform_extra_h import EXTRA
try:
    from wordform_extra_i import EXTRA as EXTRA2   # phần bổ sung cuối (nếu có)
    for k, v in EXTRA2.items(): EXTRA.setdefault(k, []).extend(v)
except ImportError:
    pass

TARGET = 100
POS_TIP = {
 "n": "<b>Danh từ (N)</b>: đứng sau a/an/the, tính từ sở hữu (my, his…), tính từ (adj + N) hoặc sau giới từ (of, in, on, for…). Đuôi hay gặp: -tion, -ment, -ness, -ity, -er/-or (người).",
 "v": "<b>Động từ (V)</b>: sau chủ ngữ (S + V), sau to (to + V), sau modal (can/should/will + V). Chia theo thì và chủ ngữ.",
 "adj": "<b>Tính từ (adj)</b>: đứng trước danh từ (a/an/the + adj + N) hoặc sau be/look/seem/feel (be + adj). Đuôi hay gặp: -ful, -ous, -ive, -al, -able, -ic.",
 "adv": "<b>Trạng từ (adv)</b>: bổ nghĩa cho động từ (V + adv), tính từ (adv + adj) hoặc cả câu (Adv, S + V). Thường là adj + -ly.",
}
POS_NAME = {"n": "N", "v": "V", "adj": "adj", "adv": "adv"}

def tip(sentence, pos):
    body = re.sub(r"\s*\([^)]*\)\s*$", "", sentence)
    m = re.search(r"(\S+\s+)?___(\s+\S+)?", body)
    ctx = re.sub(r"[.,;:!?]", "", m.group(0)).strip() if m else "___"
    return f"Mẫu: <b>{ctx}</b> → chỗ trống cần <b>{POS_NAME[pos]}</b>.<br>{POS_TIP[pos]}"

def norm(q): return re.sub(r"\W+", " ", q.lower()).strip()

def main():
    path = os.path.join(HERE, "..", "public", "lop9", "lessons.json")
    basef = os.path.join(HERE, "wordform_base.json")   # bản sao pool câu gốc (tạo 1 lần), để chạy lại không bị nhân đôi
    data = json.load(open(path, encoding="utf-8"))
    if not os.path.exists(basef):
        json.dump({L["id"]: L["wordform"]["pool"] for L in data if L.get("wordform")}, open(basef, "w", encoding="utf-8"), ensure_ascii=False)
    base_all = json.load(open(basef, encoding="utf-8"))
    report = []
    for L in data:
        wf = L.get("wordform")
        if not wf: continue
        seen, pool = set(), []
        for q in base_all[L["id"]]:
            k = norm(q["q"])
            if k in seen: continue
            seen.add(k); pool.append(q)
        for sent, hint, ans, pos in EXTRA.get(L["id"], []):
            k = norm(sent)
            if k in seen or sent.count("___") != 1: continue
            seen.add(k)
            pool.append({"q": sent, "a": [x.strip() for x in ans.split("|")], "tip": tip(sent, pos)})
        report.append((L["id"], len(pool)))
        wf["pool"] = pool[:TARGET]
    json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    for r in report: print(r[0], r[1], "OK" if r[1] >= TARGET else "THIẾU %d" % (TARGET - r[1]))

if __name__ == "__main__":
    main()
