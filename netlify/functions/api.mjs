// Little Learners - API (Netlify Functions v2 + Netlify Blobs)
// Routes: /api/*  -> this single function. Data lives in Netlify Blobs (no external database).
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
import { REC_MS, fkey, purgeUser } from "../lib/rec.mjs";
import { aiStore, jobSig, cleanFb, AI_KEEP_MS, MAX_PER_DAY, askClaudeQA, gradeSpeakPractice } from "../lib/ai.mjs";

export const config = { path: "/api/*" };

const TZ = process.env.TZ_NAME || "Asia/Ho_Chi_Minh";
const store = (name) => getStore({ name, consistency: "strong" });
const DB = { users: () => store("users"), progress: () => store("progress"), attendance: () => store("attendance"), config: () => store("config"), recmeta: () => store("recmeta"), recfiles: () => store("recfiles"), parent: () => store("parent"), reports: () => store("reports"), vocab: () => store("vocab") };
const MAX_AUDIO = 4 * 1024 * 1024, MAX_RECS = 150;
const RUBRIC_KEYS = ["pron", "vocab", "answer"], RUBRIC_LV = ["A", "B", "C", "D"];
const isEx = (v) => typeof v === "string" && /^[a-z0-9-]{3,40}$/.test(v);
const isIdx = (v) => /^\d{1,3}$/.test(String(v));

const J = (status, data) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const fail = (status, error) => J(status, { error });
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ });
const isDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
const isUser = (u) => typeof u === "string" && /^[a-z0-9._-]{3,32}$/.test(u);
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* ---------- crypto ---------- */
const scrypt = (pw, salt) => new Promise((res, rej) => crypto.scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k.toString("hex")))));
async function hashPw(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  return { salt, hash: await scrypt(pw, salt) };
}
async function checkPw(user, pw) {
  const h = await scrypt(String(pw), user.salt);
  const a = Buffer.from(h, "hex"), b = Buffer.from(user.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
let SECRET = null;
async function secret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (SECRET) return SECRET;
  const c = DB.config();
  let s = await c.get("secret");
  if (!s) { s = crypto.randomBytes(32).toString("hex"); await c.set("secret", s); }
  return (SECRET = s);
}
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
async function signToken(payload) {
  const h = b64({ alg: "HS256", typ: "JWT" }), p = b64(payload);
  const s = crypto.createHmac("sha256", await secret()).update(h + "." + p).digest("base64url");
  return `${h}.${p}.${s}`;
}
async function verifyToken(tok) {
  const parts = String(tok || "").split(".");
  if (parts.length !== 3) return null;
  const s = crypto.createHmac("sha256", await secret()).update(parts[0] + "." + parts[1]).digest("base64url");
  const a = Buffer.from(s), b = Buffer.from(parts[2]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return p.exp > Date.now() / 1000 ? p : null;
  } catch { return null; }
}
async function auth(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.get("authorization") || "");
  if (!m) return null;
  const p = await verifyToken(m[1]);
  if (!p) return null;
  const user = await DB.users().get(p.u, { type: "json" });
  return user && user.role === p.r ? user : null;
}

/* ---------- helpers ---------- */
const pub = (u) => ({ username: u.username, role: u.role, name: u.name, cls: u.cls || "", grade: u.grade || "", nseen: u.nseen || 0, ...(u.role === "ta" ? { classes: u.classes || [] } : {}) });
const cleanClasses = (v) => [...new Set((Array.isArray(v) ? v : []).map((c) => str(c, 20)).filter(Boolean))].slice(0, 40);
const cleanGrade = (g) => (["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "108", "109"].includes(String(g)) ? String(g) : "");
const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
function baseUsername(name) {
  const parts = strip(name).toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "hs";
  return parts[parts.length - 1] + parts.slice(0, -1).map((p) => p[0]).join("");
}
async function freeUsername(name) {
  const users = DB.users();
  const base = baseUsername(name).padEnd(3, "x").slice(0, 26);
  for (let i = 1; i < 500; i++) {
    const u = i === 1 ? base : base + i;
    if (!(await users.get(u, { type: "json" }))) return u;
  }
  return base + crypto.randomInt(1000, 9999);
}
const PW_ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
const genPw = () => Array.from({ length: 6 }, () => PW_ALPHA[crypto.randomInt(PW_ALPHA.length)]).join("");

const DEFAULT_CFG = { classes: [], assignments: [], announcement: "", checkin: null, ciByCls: {}, mascotOff: false, lockOff: false };
async function getCfg() {
  const c = (await DB.config().get("main", { type: "json" })) || {};
  return { ...DEFAULT_CFG, ...c };
}
const taOk = (user, cls) => user.role === "teacher" || (user.role === "ta" && !!cls && (user.classes || []).includes(cls));
function cfgFor(cfg, user) {
  const td = today();
  if (user.role === "teacher") return cfg;
  if (user.role === "ta") {
    const mine = user.classes || [];
    return { classes: mine, assignments: cfg.assignments.filter((a) => a.cls && mine.includes(a.cls)), announcement: cfg.announcement, mascotOff: !!cfg.mascotOff, lockOff: !!cfg.lockOff, taught: cfg.taught || {}, checkin: null, ciByCls: Object.fromEntries(Object.entries(cfg.ciByCls || {}).filter(([c]) => mine.includes(c))) };
  }
  const open = (cfg.checkin && cfg.checkin.date === td) || (user.cls && cfg.ciByCls && cfg.ciByCls[user.cls] && cfg.ciByCls[user.cls].date === td);
  return { classes: cfg.classes, assignments: cfg.assignments, announcement: cfg.announcement, mascotOff: !!cfg.mascotOff, lockOff: !!cfg.lockOff, taught: cfg.taught || {}, checkin: open ? { date: td } : null, ciByCls: {} };
}
const cleanAssign = (a) => ({
  id: str(a.id, 30) || Date.now().toString(36), title: str(a.title, 120), cls: str(a.cls, 20), due: isDate(a.due) ? a.due : "",
  lessons: (Array.isArray(a.lessons) ? a.lessons : []).map((x) => str(x, 30)).filter(Boolean).slice(0, 40),
  ex: (Array.isArray(a.ex) ? a.ex : []).map((x) => str(x, 40)).filter(Boolean).slice(0, 400),
});
/* Mọi thay đổi cấu hình đi qua "op" để giáo viên và trợ giảng sửa cùng lúc không ghi đè lẫn nhau */
function applyCfgOp(cfg, user, b) {
  const op = b.op, teacher = user.role === "teacher";
  if (op === "addas") {
    const a = cleanAssign(b.a || {});
    a.at = Date.now();
    if (!a.title) throw new Error("Nhập tiêu đề bài giao.");
    if (!teacher && !taOk(user, a.cls)) throw new Error("Trợ giảng chỉ giao bài cho lớp mình phụ trách.");
    cfg.assignments = [...cfg.assignments.filter((x) => x.id !== a.id), a].slice(-100);
  } else if (op === "delas") {
    const a = cfg.assignments.find((x) => x.id === str(b.id, 30));
    if (a && !teacher && !taOk(user, a.cls)) throw new Error("Bạn không có quyền xóa bài giao này.");
    cfg.assignments = cfg.assignments.filter((x) => x.id !== str(b.id, 30));
  } else if (op === "ci") {
    const code = String(b.code || ""), on = /^\d{4,6}$/.test(code);
    if (teacher) cfg.checkin = on ? { date: today(), code } : null;
    else {
      const want = cleanClasses(b.classes).filter((c) => taOk(user, c)), cl = want.length ? want : user.classes || [];
      cfg.ciByCls = { ...(cfg.ciByCls || {}) };
      for (const c of cl) { if (on) cfg.ciByCls[c] = { date: today(), code }; else delete cfg.ciByCls[c]; }
    }
  } else if (op === "taught") {
    const id = str(b.id, 40); cfg.taught = { ...(cfg.taught || {}) };
    if (id) { if (b.on) cfg.taught[id] = 1; else delete cfg.taught[id]; }
  } else if (op === "taughtreset") {
    cfg.taught = {};
  } else if (op === "delover") {
    const td = today();
    cfg.assignments = cfg.assignments.filter((a) => !(a.due && String(a.due) < td && (teacher || taOk(user, a.cls))));
  } else if (!teacher) throw new Error("Bạn không có quyền thực hiện thao tác này.");
  else if (op === "classes") cfg.classes = cleanClasses(b.classes);
  else if (op === "ann") cfg.announcement = str(b.text, 500);
  else if (op === "mascot") cfg.mascotOff = !b.on;
  else if (op === "lock") cfg.lockOff = !b.on;
  else throw new Error("Thao tác không hợp lệ.");
  return cfg;
}
function cleanProgress(b, old) {
  const out = { ex: {}, lv: {}, days: [], ci: (old && old.ci) || {}, last: Date.now() };
  const ex = b && typeof b.ex === "object" && b.ex ? b.ex : {};
  const oldEx = (old && old.ex) || {};
  // Điểm lần làm đầu tiên được khóa: bài đã có kết quả thì không ghi đè được nữa.
  // Ngoại lệ: bài Writing/Speaking của IELTS (id bắt đầu bằng "ie-") được cập nhật số điểm khi AI chấm xong, với điều kiện đáp án không đổi.
  for (const id of Object.keys(oldEx)) {
    const o = oldEx[id], r = ex[id];
    out.ex[id] = o;
    if (/^ie-/.test(id) && r && typeof r === "object" && JSON.stringify(r.a || []) === JSON.stringify(o.a || []))
      out.ex[id] = { ...o, c: Math.max(0, Math.min(500, r.c | 0)), n: Math.max(0, Math.min(500, r.n | 0)) };
    // Bài chỉ có thu âm: lần trước chấm 0 điểm do lỗi cũ, nay tính đủ điểm (chỉ nâng lên đủ, không đổi số câu).
    else if (r && typeof r === "object" && r.fx === 1 && o.n > 0 && o.c < o.n) out.ex[id] = { ...o, c: o.n };
  }
  for (const id of Object.keys(ex).slice(0, 800)) {
    const r = ex[id];
    if (oldEx[id]) continue;
    if (!r || typeof r !== "object" || !/^[\w.-]{1,40}$/.test(id)) continue;
    out.ex[id] = { c: Math.max(0, Math.min(500, r.c | 0)), n: Math.max(0, Math.min(500, r.n | 0)), t: Number(r.t) || Date.now(), a: Array.isArray(r.a) ? r.a : [] };
  }
  const lv = b && typeof b.lv === "object" && b.lv ? b.lv : {};
  for (const id of Object.keys(lv).slice(0, 100)) if (/^[\w.-]{1,40}$/.test(id)) out.lv[id] = Number(lv[id]) || Date.now();
  /* flashcard từ vựng: key = từ viết thường, giá trị bit 1 = đã thuộc, 2 = đặt câu được */
  out.fc = {};
  if (b && b.fc && typeof b.fc === "object") for (const k of Object.keys(b.fc).slice(0, 3000)) { const v = Number(b.fc[k]) & 3; if (v && /^[a-z0-9][a-z0-9 '’.,&-]{0,49}$/.test(k)) out.fc[k] = v; }
  out.days = (Array.isArray(b && b.days) ? b.days : []).filter(isDate).slice(-120);
  return out;
}
async function listAll(store) {
  const { blobs } = await store.list();
  return Promise.all(blobs.map(async (x) => [x.key, await store.get(x.key, { type: "json" })]));
}


/* ---------- tra từ (dịch từ đơn Anh → Việt) + kho từ vựng cá nhân ---------- */
const TRC = new Map();
const WORD_RE = /^[A-Za-z][A-Za-z'’-]{0,38}$/;
async function getJ(url, ms = 5000) {
  const r = await fetch(url, { signal: AbortSignal.timeout(ms), headers: { "user-agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error("http " + r.status);
  return r.json();
}
async function lookupWord(w) {
  const key = w.toLowerCase();
  if (TRC.has(key)) return TRC.get(key);
  const out = { w: key, ipa: "", vi: "", items: [] };
  const [g, d] = await Promise.allSettled([
    getJ("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=" + encodeURIComponent(key)),
    getJ("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(key), 4000),
  ]);
  if (g.status === "fulfilled" && Array.isArray(g.value)) {
    const j = g.value;
    out.vi = (j[0] || []).map((x) => (x && x[0]) || "").join("").trim();
    for (const e of Array.isArray(j[1]) ? j[1] : []) {
      const vi = (Array.isArray(e[1]) ? e[1] : []).filter((x) => typeof x === "string").slice(0, 5);
      if (e[0] && vi.length) out.items.push({ pos: String(e[0]).slice(0, 20), vi });
    }
  }
  if (d.status === "fulfilled" && Array.isArray(d.value) && d.value[0]) {
    const e = d.value[0];
    out.ipa = String(e.phonetic || ((e.phonetics || []).find((p) => p.text) || {}).text || "").slice(0, 40);
    if (!out.items.length) {
      const seen = new Set();
      for (const mn of e.meanings || []) if (mn.partOfSpeech && !seen.has(mn.partOfSpeech)) { seen.add(mn.partOfSpeech); out.items.push({ pos: mn.partOfSpeech, vi: [], en: String(((mn.definitions || [])[0] || {}).definition || "").slice(0, 160) }); }
    }
  }
  if (!out.vi) {
    try {
      const j = await getJ("https://api.mymemory.translated.net/get?langpair=en|vi&q=" + encodeURIComponent(key));
      out.vi = String((j.responseData || {}).translatedText || "").trim();
    } catch {}
  }
  if (!out.vi && !out.items.length) return null;
  if (!out.vi && out.items[0] && out.items[0].vi[0]) out.vi = out.items[0].vi[0];
  if (TRC.size > 3000) TRC.clear();
  TRC.set(key, out);
  return out;
}
function cleanVocab(arr) {
  const out = [], seen = new Set();
  for (const x of Array.isArray(arr) ? arr : []) {
    if (!x || typeof x !== "object") continue;
    const w = String(x.w || "").trim().toLowerCase().slice(0, 40);
    if (!WORD_RE.test(w) || seen.has(w)) continue;
    seen.add(w);
    out.push({ w, pos: String(x.pos || "").slice(0, 20), vi: String(x.vi || "").slice(0, 200), ctx: String(x.ctx || "").slice(0, 260), ipa: String(x.ipa || "").slice(0, 40), t: Number(x.t) || Date.now(), g: Number(x.g) || 0, k: x.k ? 1 : 0 });
    if (out.length >= 1500) break;
  }
  return out;
}

/* ---------- router ---------- */
export default async (req) => {
  try { return await route(req); } catch (e) { console.error(e); return fail(500, "Lỗi máy chủ, vui lòng thử lại."); }
};

async function route(req) {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [a, b, c] = parts, m = req.method;
  let body = {};
  if (m !== "GET" && m !== "DELETE" && !(a === "rec" && b === "audio")) { try { body = (await req.json()) || {}; } catch { body = {}; } }

  /* public */
  if (a === "status" && m === "GET") {
    const has = await DB.config().get("hasTeacher");
    return J(200, { setup: !has, needsCode: !has && !!process.env.SETUP_CODE });
  }
  if (a === "setup" && m === "POST") {
    if (await DB.config().get("hasTeacher")) return fail(403, "Tài khoản giáo viên đã được tạo.");
    if (process.env.SETUP_CODE && str(body.code, 100) !== process.env.SETUP_CODE) return fail(403, "Mã cài đặt chưa đúng.");
    const name = str(body.name, 60), username = str(body.username, 32).toLowerCase(), pw = String(body.password || "");
    if (name.length < 2) return fail(400, "Nhập họ tên giáo viên.");
    if (!isUser(username)) return fail(400, "Tên đăng nhập gồm 3-32 ký tự: chữ thường, số, dấu . _ -");
    if (pw.length < 8) return fail(400, "Mật khẩu cần ít nhất 8 ký tự.");
    const user = { username, role: "teacher", name, cls: "", ...(await hashPw(pw)), created: Date.now() };
    await DB.users().setJSON(username, user);
    await DB.config().set("hasTeacher", "1");
    return J(200, { token: await signToken({ u: username, r: "teacher", exp: Math.floor(Date.now() / 1000) + 7 * 86400 }), user: pub(user) });
  }
  if (a === "login" && m === "POST") {
    const username = str(body.username, 32).toLowerCase(), pw = String(body.password || "");
    const users = DB.users();
    const user = isUser(username) ? await users.get(username, { type: "json" }) : null;
    if (user && user.lockUntil && user.lockUntil > Date.now()) return fail(429, "Đăng nhập sai nhiều lần. Thử lại sau vài phút.");
    if (!user || !(await checkPw(user, pw))) {
      if (user) {
        user.fails = (user.fails || 0) + 1;
        if (user.fails >= 8) { user.lockUntil = Date.now() + 10 * 60000; user.fails = 0; }
        await users.setJSON(username, user);
      }
      return fail(401, "Sai tên đăng nhập hoặc mật khẩu.");
    }
    if (body.mode === "ta" && user.role !== "ta") return fail(403, "Đây không phải tài khoản trợ giảng. Hãy đăng nhập ở mục chính.");
    if (body.mode !== "ta" && user.role === "ta") return fail(403, "Tài khoản trợ giảng đăng nhập ở mục \"Trợ giảng\".");
    if (user.fails || user.lockUntil) { user.fails = 0; delete user.lockUntil; await users.setJSON(username, user); }
    return J(200, { token: await signToken({ u: username, r: user.role, exp: Math.floor(Date.now() / 1000) + 7 * 86400 }), user: pub(user) });
  }

  /* phụ huynh xem báo cáo bằng liên kết riêng (không cần đăng nhập) */
  if (a === "parent" && b && m === "GET") {
    const token = String(b);
    const uname = /^[a-f0-9]{32}$/.test(token) ? await DB.parent().get(token) : null;
    const su = uname ? await DB.users().get(uname, { type: "json" }) : null;
    if (!su || su.role !== "student" || su.ptoken !== token) return fail(404, "Liên kết không còn hiệu lực. Hãy xin giáo viên liên kết mới.");
    const rep = (await DB.reports().get(uname, { type: "json" })) || {};
    const attendance = [];
    for (const [d, doc] of await listAll(DB.attendance())) {
      const mk = doc && doc.marks && doc.marks[uname], nt = doc && doc.notes && doc.notes[uname];
      if (mk || nt) attendance.push({ date: d, status: mk || "", note: nt || "" });
    }
    attendance.sort((x, y) => (x.date < y.date ? 1 : -1));
    return J(200, { student: { name: su.name, cls: su.cls || "", grade: su.grade || "" }, reports: Object.values(rep).sort((x, y) => y.at - x.at), attendance: attendance.slice(0, 80) });
  }

  /* authenticated */
  const user = await auth(req);
  if (!user) return fail(401, "Phiên đăng nhập đã hết hạn.");
  const teacher = user.role === "teacher", ta = user.role === "ta", staff = teacher || ta;

  if (a === "me" && m === "GET") {
    const out = { user: pub(user), config: cfgFor(await getCfg(), user) };
    if (!staff) {
      out.progress = (await DB.progress().get(user.username, { type: "json" })) || {};
      out.mine = {};
      for (const [d, doc] of await listAll(DB.attendance())) if (doc && doc.marks && doc.marks[user.username]) out.mine[d] = doc.marks[user.username];
    }
    return J(200, out);
  }
  if (a === "password" && m === "POST") {
    if (!(await checkPw(user, body.old))) return fail(400, "Mật khẩu hiện tại chưa đúng.");
    const pw = String(body.password || "");
    if (pw.length < 6) return fail(400, "Mật khẩu mới cần ít nhất 6 ký tự.");
    Object.assign(user, await hashPw(pw));
    await DB.users().setJSON(user.username, user);
    return J(200, { ok: true });
  }
  if (a === "tr" && m === "GET") {
    const w = String(url.searchParams.get("w") || "").trim();
    if (!WORD_RE.test(w)) return fail(400, "Từ không hợp lệ.");
    const r = await lookupWord(w);
    if (!r) return fail(404, "Chưa tra được từ này. Thử lại sau nhé.");
    return J(200, r);
  }
  if (a === "trs" && m === "GET") {
    const s = String(url.searchParams.get("s") || "").replace(/\s+/g, " ").trim().slice(0, 600);
    if (s.length < 2 || !/[A-Za-z]/.test(s)) return fail(400, "Đoạn cần dịch không hợp lệ.");
    const ck = "S:" + s.toLowerCase();
    if (TRC.has(ck)) return J(200, TRC.get(ck));
    let vi = "";
    try {
      const j = await getJ("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=" + encodeURIComponent(s), 7000);
      vi = (Array.isArray(j) && Array.isArray(j[0]) ? j[0] : []).map((x) => (x && x[0]) || "").join("").trim();
    } catch {}
    if (!vi) {
      try {
        const j = await getJ("https://api.mymemory.translated.net/get?langpair=en|vi&q=" + encodeURIComponent(s), 7000);
        vi = String((j.responseData || {}).translatedText || "").trim();
      } catch {}
    }
    if (!vi) return fail(404, "Chưa dịch được đoạn này. Thử lại sau nhé.");
    const out = { s, vi };
    if (TRC.size > 3000) TRC.clear();
    TRC.set(ck, out);
    return J(200, out);
  }
  if (a === "vocab" && m === "GET") {
    if (staff) return J(200, { words: [] });
    const v = (await DB.vocab().get(user.username, { type: "json" })) || { words: [] };
    return J(200, { words: cleanVocab(v.words) });
  }
  if (a === "vocab" && m === "PUT") {
    if (staff) return fail(403, "Chỉ học sinh có kho từ vựng cá nhân.");
    const words = cleanVocab(body.words);
    await DB.vocab().setJSON(user.username, { words, at: Date.now() });
    return J(200, { ok: true, n: words.length });
  }
  if (a === "notif" && b === "seen" && m === "PUT") {
    user.nseen = Date.now();
    await DB.users().setJSON(user.username, user);
    return J(200, { nseen: user.nseen });
  }
  /* ---------- Q&A bé rồng (dữ liệu tự xóa sau 48 giờ) ---------- */
  if (a === "qa") {
    const QA = store("qa"), KEEP = 48 * 3600 * 1000, live = (arr) => (Array.isArray(arr) ? arr : []).filter((t) => t && Date.now() - t.t < KEEP);
    const load = async (u) => live(((await QA.get(u, { type: "json" })) || {}).th);
    const save = (u, th) => (th.length ? QA.setJSON(u, { th }) : QA.delete(u));
    const cleanMsg = (s, n) => String(s || "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, n);
    if (b === "mine" && m === "GET") {
      if (staff) return J(200, { threads: [] });
      return J(200, { threads: await load(user.username) });
    }
    if (b === "ask" && m === "POST") {
      if (staff) return fail(403, "Chỉ học sinh mới đặt câu hỏi cho Baby Dragon.");
      const q = cleanMsg(body.q, 500);
      if (q.length < 2) return fail(400, "Bạn hãy gõ câu hỏi nhé.");
      const th = await load(user.username);
      if (th.filter((t) => Date.now() - t.t < 24 * 3600 * 1000).length >= 20) return fail(429, "Hôm nay bạn đã hỏi nhiều rồi, mai hỏi tiếp nhé!");
      let ans;
      try { ans = await askClaudeQA(q, cleanMsg(body.ctx, 160)); }
      catch (e) { return fail(503, e.message === "NO_KEY" ? "Baby Dragon chưa được cài khóa AI, bạn hãy hỏi thầy trực tiếp nhé." : "Baby Dragon đang bận, bạn thử lại sau ít phút nhé. (mã lỗi: " + String(e.message).replace(/sk-[A-Za-z0-9_-]+/g, "").slice(0, 90) + ")"); }
      const t = { id: Date.now().toString(36) + crypto.randomBytes(2).toString("hex"), t: Date.now(), q, ctx: cleanMsg(body.ctx, 160), rate: 0, st: "ai", msgs: [{ r: "ai", x: ans.text, t: Date.now() }] };
      th.push(t);
      await save(user.username, th.slice(-30));
      return J(200, { thread: t });
    }
    if (b === "speak" && m === "POST") {
      if (staff) return fail(403, "Chỉ học viên mới luyện nói.");
      if (Number(user.grade) !== 9 && String(user.grade) !== "9") return fail(403, "Luyện nói bằng giọng nói chỉ dành cho khóa IELTS.");
      const q = cleanMsg(body.q, 300), text = cleanMsg(body.text, 3000), secs = Math.min(300, Math.max(0, Number(body.secs) || 0));
      if (q.length < 5) return fail(400, "Bạn hãy nhập câu hỏi speaking muốn luyện nhé.");
      if ((text.match(/[A-Za-z']+/g) || []).length < 8) return fail(400, "Chưa nhận dạng đủ lời nói (cần ít nhất 8 từ). Hãy nói to, rõ và thử lại (dùng Chrome hoặc Safari).");
      const LIM = Number(process.env.QA_SPEAK_LIMIT || 3);
      const th = await load(user.username);
      const used = th.filter((t) => t.sp && Date.now() - t.t < 24 * 3600 * 1000).length;
      if (used >= LIM) return fail(429, "Mỗi ngày bạn được luyện nói với AI " + LIM + " lần. Hôm nay đã hết lượt, mai luyện tiếp nhé!");
      let fb;
      try { fb = await gradeSpeakPractice(q, text, secs); }
      catch (e) { return fail(503, e.message === "NO_KEY" ? "Chưa cài khóa AI, bạn hãy nhờ thầy." : "AI đang bận, bạn thử lại sau ít phút nhé. (mã lỗi: " + String(e.message).replace(/sk-[A-Za-z0-9_-]+/g, "").slice(0, 90) + ")"); }
      const t = { id: Date.now().toString(36) + crypto.randomBytes(2).toString("hex"), t: Date.now(), q, ctx: "Luyện nói IELTS", rate: 5, st: "done", sp: { text, secs, fb }, msgs: [] };
      th.push(t);
      await save(user.username, th.slice(-30));
      return J(200, { thread: t, left: LIM - used - 1 });
    }
    if (b === "rate" && m === "POST") {
      if (staff) return fail(403, "Chỉ học sinh đánh giá.");
      const th = await load(user.username), t = th.find((x) => x.id === str(body.id, 30));
      if (!t) return fail(404, "Câu hỏi này đã hết hạn.");
      const n = Math.round(Number(body.stars));
      if (!(n >= 1 && n <= 5)) return fail(400, "Số sao từ 1 đến 5.");
      t.rate = n; t.rateAt = Date.now();
      if (t.st !== "replied") t.st = n < 3 ? "wait" : "done";
      await save(user.username, th);
      return J(200, { thread: t });
    }
    if (b === "seen" && m === "PUT") {
      if (staff) return J(200, { ok: true });
      const th = await load(user.username);
      let ch = false;
      for (const t of th) if (t.st === "replied" && !t.seen) { t.seen = true; ch = true; }
      if (ch) await save(user.username, th);
      return J(200, { ok: true });
    }
    if (b === "health" && m === "GET") {
      if (!staff) return fail(403, "Chỉ giáo viên/trợ giảng.");
      if (!process.env.ANTHROPIC_API_KEY) return J(200, { ok: false, hasKey: false, msg: "Chưa có ANTHROPIC_API_KEY trên Netlify (hoặc chưa deploy lại sau khi thêm)." });
      try { const r = await askClaudeQA("Say hello in one short Vietnamese sentence.", ""); return J(200, { ok: true, hasKey: true, model: r.model, msg: "AI hoạt động bình thường." }); }
      catch (e) { return J(200, { ok: false, hasKey: true, msg: "Có khóa nhưng gọi AI lỗi: " + String(e.message).slice(0, 200) + " (kiểm tra khóa còn hiệu lực và tài khoản API còn tiền)." }); }
    }
    if (b === "all" && m === "GET") {
      if (!staff) return fail(403, "Chỉ giáo viên/trợ giảng.");
      const { blobs } = await QA.list();
      const out = [];
      for (const bl of blobs) {
        const th = await load(bl.key);
        if (!th.length) { await QA.delete(bl.key); continue; }
        const u = await DB.users().get(bl.key, { type: "json" });
        if (!u || !taOk(user, u.cls || "")) { if (user.role === "teacher" && !u) { /* học sinh đã xóa */ } continue; }
        for (const t of th) out.push({ ...t, user: u.username, name: u.name, cls: u.cls || "" });
      }
      out.sort((x, y) => y.t - x.t);
      return J(200, { threads: out });
    }
    if (b === "reply" && m === "POST") {
      if (!staff) return fail(403, "Chỉ giáo viên/trợ giảng.");
      const uid = str(body.user, 32), text = cleanMsg(body.text, 1500);
      if (!isUser(uid) || text.length < 1) return fail(400, "Hãy nhập nội dung trả lời.");
      const stu = await DB.users().get(uid, { type: "json" });
      if (!stu || !taOk(user, stu.cls || "")) return fail(403, "Bạn không có quyền trả lời học sinh này.");
      const th = await load(uid), t = th.find((x) => x.id === str(body.id, 30));
      if (!t) return fail(404, "Câu hỏi này đã hết hạn (dữ liệu tự xóa sau 48 giờ).");
      t.msgs.push({ r: "teacher", x: text, t: Date.now(), by: user.name || "Thầy" });
      t.st = "replied"; t.seen = false; t.repAt = Date.now();
      await save(uid, th);
      return J(200, { thread: { ...t, user: stu.username, name: stu.name, cls: stu.cls || "" } });
    }
    return fail(404, "Không có thao tác này.");
  }
  if (a === "config" && m === "GET") return J(200, { config: cfgFor(await getCfg(), user) });
  if (a === "progress" && m === "PUT") {
    if (staff) return fail(403, "Tài khoản giáo viên/trợ giảng không có tiến trình học.");
    const old = (await DB.progress().get(user.username, { type: "json" })) || {};
    const next = cleanProgress(body, old);
    if (JSON.stringify(next).length > 450000) return fail(413, "Dữ liệu quá lớn.");
    await DB.progress().setJSON(user.username, next);
    return J(200, { ok: true });
  }
  if (a === "checkin" && m === "POST") {
    if (staff) return fail(403, "Chỉ học sinh mới điểm danh bằng mã.");
    const cfg = await getCfg(), td = today(), code = String(body.code).trim();
    const okG = cfg.checkin && cfg.checkin.date === td && code === cfg.checkin.code;
    const cc = user.cls && cfg.ciByCls && cfg.ciByCls[user.cls];
    if (!okG && !(cc && cc.date === td && code === cc.code)) return fail(400, "Mã điểm danh chưa đúng hoặc chưa mở.");
    const p = (await DB.progress().get(user.username, { type: "json" })) || { ex: {}, lv: {}, days: [], ci: {} };
    p.ci = { ...(p.ci || {}), [today()]: Date.now() };
    await DB.progress().setJSON(user.username, p);
    return J(200, { ci: p.ci });
  }

  /* voice recordings (student) */
  if (a === "rec" && b === "audio" && m === "PUT") {
    if (staff) return fail(403, "Chỉ học sinh mới gửi bản thu.");
    const exId = c, idx = parts[3];
    if (!isEx(exId) || !isIdx(idx)) return fail(400, "Bài không hợp lệ.");
    const buf = Buffer.from(await req.arrayBuffer());
    if (!buf.length) return fail(400, "Bản thu rỗng.");
    if (buf.length > MAX_AUDIO) return fail(413, "Bản thu quá dài. Hãy thu ngắn hơn rồi thử lại.");
    const mime = (req.headers.get("content-type") || "audio/webm").split(";")[0].trim();
    if (!/^audio\/(webm|ogg|mp4|mpeg|wav|x-m4a|aac)$/.test(mime)) return fail(400, "Định dạng âm thanh không được hỗ trợ.");
    let label = ""; try { label = decodeURIComponent(req.headers.get("x-label") || ""); } catch {}
    const meta = (await purgeUser(DB.recmeta(), DB.recfiles(), user.username)) || {};
    const key = exId + ":" + Number(idx);
    if (!meta[key] && Object.values(meta).filter((v) => !v.expired).length >= MAX_RECS) return fail(429, "Bạn đã gửi quá nhiều bản thu. Hãy đợi các bản cũ tự xóa.");
    const now = Date.now();
    await DB.recfiles().set(fkey(user.username, key), buf, { metadata: { mime } });
    meta[key] = { t: now, exp: now + REC_MS, mime, size: buf.length, label: str(label, 200), comment: "", commentAt: 0, seen: true };
    await DB.recmeta().setJSON(user.username, meta);
    return J(200, { key, meta: meta[key] });
  }
  if (a === "rec" && b === "mine" && m === "GET") {
    if (staff) return J(200, { recs: {} });
    return J(200, { recs: (await purgeUser(DB.recmeta(), DB.recfiles(), user.username)) || {} });
  }
  if (a === "rec" && b === "seen" && m === "PUT") {
    if (staff) return J(200, { ok: true });
    const meta = await DB.recmeta().get(user.username, { type: "json" });
    if (meta) {
      for (const k of Array.isArray(body.keys) ? body.keys.slice(0, 300) : []) if (meta[k]) meta[k].seen = true;
      await DB.recmeta().setJSON(user.username, meta);
    }
    return J(200, { ok: true });
  }
  if (a === "recfile" && m === "GET") {
    const [, who, exId, idx] = parts;
    if (!isUser(who) || !isEx(exId) || !isIdx(idx)) return fail(400, "Yêu cầu không hợp lệ.");
    if (!staff && who !== user.username) return fail(403, "Bạn không có quyền nghe bản thu này.");
    if (ta) { const su = await DB.users().get(who, { type: "json" }); if (!su || !taOk(user, su.cls)) return fail(403, "Bạn không có quyền nghe bản thu này."); }
    const key = exId + ":" + Number(idx);
    const meta = await purgeUser(DB.recmeta(), DB.recfiles(), who);
    const mt = meta && meta[key];
    if (!mt) return fail(404, "Không tìm thấy bản thu.");
    if (mt.expired) return fail(410, "Bản thu đã hết hạn 7 ngày và đã bị xóa.");
    const data = await DB.recfiles().get(fkey(who, key), { type: "arrayBuffer" });
    if (!data) return fail(404, "Không tìm thấy bản thu.");
    return new Response(data, { status: 200, headers: { "content-type": mt.mime || "audio/webm", "cache-control": "private, no-store" } });
  }

  /* IELTS AI feedback (student) */
  if (a === "ai" && b === "submit" && m === "POST") {
    if (staff) return fail(403, "Chỉ học viên mới nộp bài để AI chấm.");
    const kind = body.kind === "sp" ? "sp" : body.kind === "wr" ? "wr" : "";
    const exId = str(body.exId, 40), idx = Number(body.idx);
    if (!kind || !isEx(exId) || !isIdx(idx)) return fail(400, "Bài không hợp lệ.");
    const text = String(body.text || "").replace(/\r/g, "").trim().slice(0, kind === "wr" ? 5000 : 3500);
    const wc = (text.match(/[A-Za-z0-9\u00C0-\u024F'’-]+/g) || []).length;
    if (kind === "wr" && wc < 20) return fail(400, "Bài viết còn quá ngắn (cần ít nhất 20 từ) để chấm.");
    if (kind === "sp" && wc < 5) return fail(400, "Chưa nhận dạng được lời nói. Hãy nói to, rõ và thử lại (dùng Chrome hoặc Safari).");
    const store = aiStore();
    const doc = (await store.get(user.username, { type: "json" })) || {};
    const now = Date.now(), day = today();
    for (const k of Object.keys(doc)) if (k !== "_day" && now - (doc[k].t || 0) > AI_KEEP_MS) delete doc[k];
    const d0 = doc._day && doc._day.date === day ? doc._day : { date: day, n: 0 };
    if (d0.n >= MAX_PER_DAY) return fail(429, "Hôm nay bạn đã dùng hết " + MAX_PER_DAY + " lượt chấm AI. Hãy quay lại vào ngày mai nhé.");
    const key = exId + ":" + idx;
    if (doc[key] && doc[key].status === "pending" && now - doc[key].t < 5 * 60000) return fail(409, "Bài này đang được chấm, vui lòng đợi.");
    d0.n++; doc._day = d0;
    doc[key] = { kind, status: "pending", t: now, text, wc, prompt: str(body.prompt, 1500), task: Number(body.task) === 1 ? 1 : 2, minWords: Math.min(400, Math.max(0, Number(body.minWords) || 0)), part: str(body.part, 20), secs: Math.min(600, Math.max(0, Number(body.secs) || 0)), seen: true, fb: null };
    await store.setJSON(user.username, doc);
    let ok = false;
    try {
      const r = await fetch(new URL(req.url).origin + "/.netlify/functions/ai-grade-background", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ who: user.username, key, sig: await jobSig(user.username + "|" + key) }) });
      ok = r.ok || r.status === 202;
    } catch {}
    if (!ok) { doc[key].status = "error"; doc[key].err = "Không gọi được máy chủ chấm bài. Hãy thử lại."; await store.setJSON(user.username, doc); }
    return J(200, { key, entry: doc[key] });
  }
  if (a === "ai" && b === "mine" && m === "GET") {
    if (staff) return J(200, { ai: {} });
    const doc = (await aiStore().get(user.username, { type: "json" })) || {};
    delete doc._day;
    for (const e of Object.values(doc)) delete e.ai;
    return J(200, { ai: doc });
  }
  if (a === "ai" && b === "seen" && m === "PUT") {
    if (staff) return J(200, { ok: true });
    const store = aiStore(), doc = await store.get(user.username, { type: "json" });
    if (doc && doc[str(body.key, 60)]) { doc[str(body.key, 60)].seen = true; await store.setJSON(user.username, doc); }
    return J(200, { ok: true });
  }

  /* ---------- chấm phát âm (mỗi bé đọc 1 lần / mục, không lưu file âm thanh, tự xóa sau 3 ngày) ---------- */
  const SPK = store("speak"), SPK_KEEP = 30 * 24 * 3600 * 1000;
  const spLive = (d) => Object.fromEntries(Object.entries((d && d.r) || {}).filter(([, v]) => v && Date.now() - v.t < SPK_KEEP));
  if (a === "speak" && b === "mine" && m === "GET") {
    if (staff) return J(200, { r: {} });
    return J(200, { r: spLive(await SPK.get(user.username, { type: "json" })) });
  }
  if (a === "speak" && b === "result" && m === "POST") {
    if (staff) return fail(403, "Chỉ học sinh mới nộp kết quả đọc.");
    const key = str(body.key, 60);
    if (!/^[\w.-]{3,50}:\d{1,3}$/.test(key)) return fail(400, "Yêu cầu không hợp lệ.");
    const cur = spLive(await SPK.get(user.username, { type: "json" }));
    if (cur[key]) return J(200, { already: true, rec: cur[key] });
    const sc = Math.max(50, Math.min(100, Math.round(Number(body.score) || 50)));
    cur[key] = { s: sc, h: str(body.heard, 80), w: str(body.target, 80), t: Date.now() };
    await SPK.setJSON(user.username, { r: cur });
    return J(200, { rec: cur[key] });
  }

  /* ---------- giáo viên và trợ giảng (trợ giảng chỉ thấy lớp mình phụ trách) ---------- */
  if (!staff) return fail(403, "Bạn không có quyền thực hiện thao tác này.");
  const myStudents = async () => (await listAll(DB.users())).map(([, u]) => u).filter((u) => u && u.role === "student" && taOk(user, u.cls));
  const studentOf = async (who) => { const su = isUser(who) ? await DB.users().get(who, { type: "json" }) : null; return su && su.role === "student" && taOk(user, su.cls) ? su : null; };

  if (a === "recs" && m === "GET") {
    const { blobs } = await DB.recmeta().list();
    const items = [];
    for (const bl of blobs) {
      const u = await DB.users().get(bl.key, { type: "json" });
      if (!u || !taOk(user, u.cls)) continue;
      const meta = await purgeUser(DB.recmeta(), DB.recfiles(), bl.key);
      if (!meta) continue;
      for (const [key, v] of Object.entries(meta)) items.push({ user: bl.key, name: u.name, cls: u.cls || "", grade: u.grade || "", key, ...v });
    }
    items.sort((x, y) => y.t - x.t);
    return J(200, { items: items.slice(0, 600) });
  }
  if (a === "rec" && b === "comment" && m === "PUT") {
    const [, , who, exId, idx] = parts;
    if (!isUser(who) || !isEx(exId) || !isIdx(idx)) return fail(400, "Yêu cầu không hợp lệ.");
    if (!(await studentOf(who))) return fail(403, "Học sinh này không thuộc lớp bạn phụ trách.");
    const meta = await DB.recmeta().get(who, { type: "json" });
    const key = exId + ":" + Number(idx);
    if (!meta || !meta[key]) return fail(404, "Không tìm thấy bản thu.");
    const text = str(body.comment, 1000);
    const rubric = {};
    for (const k of RUBRIC_KEYS) { const v = body.rubric && body.rubric[k]; if (RUBRIC_LV.includes(v)) rubric[k] = v; }
    const has = !!text || Object.keys(rubric).length > 0;
    Object.assign(meta[key], { comment: text, rubric, commentAt: has ? Date.now() : 0, seen: !has, by: has ? user.name : "" });
    await DB.recmeta().setJSON(who, meta);
    return J(200, { ok: true, meta: meta[key] });
  }
  if (a === "config" && m === "PUT") {
    let cfg;
    try { cfg = applyCfgOp(await getCfg(), user, body); } catch (e) { return fail(400, e.message); }
    await DB.config().setJSON("main", cfg);
    return J(200, { config: cfgFor(cfg, user) });
  }
  if (a === "attendance" && m === "GET") {
    const mine = ta ? new Set((await myStudents()).map((u) => u.username)) : null;
    const dates = {}, notes = {};
    for (const [d, doc] of await listAll(DB.attendance())) {
      if (!doc) continue;
      dates[d] = Object.fromEntries(Object.entries(doc.marks || {}).filter(([u]) => !mine || mine.has(u)));
      notes[d] = Object.fromEntries(Object.entries(doc.notes || {}).filter(([u]) => !mine || mine.has(u)));
    }
    return J(200, { dates, notes });
  }
  if (a === "attendance" && isDate(b) && m === "PUT") {
    const allowed = ta ? new Set((await myStudents()).map((u) => u.username)) : null;
    const inScope = (u) => !allowed || allowed.has(u);
    const old = (await DB.attendance().get(b, { type: "json" })) || {};
    const marks = {}, notes = {};
    for (const [u, v] of Object.entries(old.marks || {})) if (!inScope(u) || body.marks === undefined) marks[u] = v;
    for (const [u, v] of Object.entries(old.notes || {})) notes[u] = v;
    if (body.marks) for (const [u, v] of Object.entries(body.marks)) if (isUser(u) && inScope(u) && ["P", "L", "E", "A"].includes(v)) marks[u] = v;
    if (body.notes) for (const [u, v] of Object.entries(body.notes)) { const t = str(v, 400); if (!isUser(u) || !inScope(u)) continue; if (t) notes[u] = t; else delete notes[u]; }
    await DB.attendance().setJSON(b, { date: b, marks, notes });
    return J(200, { ok: true });
  }
  if (a === "speak" && b === "all" && m === "GET") {
    const out = {};
    for (const u of await myStudents()) { const r = spLive(await SPK.get(u.username, { type: "json" })); if (Object.keys(r).length) out[u.username] = r; }
    return J(200, { all: out });
  }
  if (a === "students" && !b && m === "GET") {
    const prog = Object.fromEntries(await listAll(DB.progress()));
    const reps = Object.fromEntries(await listAll(DB.reports()));
    const students = (await myStudents()).map((u) => ({
      username: u.username, name: u.name, cls: u.cls || "", grade: u.grade || "", progress: prog[u.username] || {},
      ptoken: u.ptoken || "", reports: Object.fromEntries(Object.entries(reps[u.username] || {}).map(([k, r]) => [k, { at: r.at, c: r.c, n: r.n, note: r.note || "" }])),
    }));
    return J(200, { students });
  }

  /* link phụ huynh và báo điểm: giáo viên và trợ giảng (trợ giảng chỉ với học sinh lớp mình) */
  if (a === "students" && isUser(b) && (c === "ptoken" || c === "report")) {
    const users = DB.users(), u = await studentOf(b);
    if (!u) return fail(403, "Học sinh này không thuộc lớp bạn phụ trách.");
  if (c === "ptoken" && m === "POST") {
    if (u.ptoken) { try { await DB.parent().delete(u.ptoken); } catch {} }
    u.ptoken = crypto.randomBytes(16).toString("hex");
    await users.setJSON(b, u);
    await DB.parent().set(u.ptoken, b);
    return J(200, { ptoken: u.ptoken });
  }
  if (c === "ptoken" && m === "DELETE") {
    if (u.ptoken) { try { await DB.parent().delete(u.ptoken); } catch {} }
    u.ptoken = "";
    await users.setJSON(b, u);
    return J(200, { ok: true });
  }
  if (c === "report" && m === "POST") {
    const lessonId = str(body.lessonId, 30), label = str(body.label, 140), note = str(body.note, 800);
    const exs = (Array.isArray(body.exs) ? body.exs : []).slice(0, 60).map((x) => ({ id: str(x && x.id, 40), title: str(x && x.title, 100) })).filter((x) => x.id);
    if (!/^[\w.-]{1,30}$/.test(lessonId) || !exs.length) return fail(400, "Thiếu thông tin phần bài cần báo điểm.");
    const p = (await DB.progress().get(b, { type: "json" })) || {};
    const rows = []; let cc = 0, nn = 0;
    const fixEx = new Set((Array.isArray(body.fixEx) ? body.fixEx : []).map((x) => str(x, 40)));
    for (const x of exs) {
      const r = p.ex && p.ex[x.id];
      if (!r) return fail(400, "Học sinh chưa làm xong mục \"" + x.title + "\", chưa thể báo điểm.");
      const c = fixEx.has(x.id) && r.n > 0 ? r.n : r.c;
      rows.push({ id: x.id, title: x.title, c, n: r.n, t: r.t });
      cc += c; nn += r.n;
    }
    const rep = (await DB.reports().get(b, { type: "json" })) || {};
    rep[lessonId] = { lessonId, label, unit: str(body.unit, 80), rows, c: cc, n: nn, pct: nn ? cc / nn : null, note, at: Date.now(), by: user.name };
    await DB.reports().setJSON(b, rep);
    return J(200, { report: { at: rep[lessonId].at, c: cc, n: nn } });
  }
  if (c === "report" && m === "DELETE") {
    const rep = (await DB.reports().get(b, { type: "json" })) || {};
    delete rep[str(parts[3], 30)];
    await DB.reports().setJSON(b, rep);
    return J(200, { ok: true });
  }
  }

  /* ---------- chỉ giáo viên ---------- */
  if (!teacher) return fail(403, "Chức năng này chỉ dành cho giáo viên.");

  if (a === "rec" && m === "DELETE") {
    const [, who, exId, idx] = parts;
    if (!isUser(who) || !isEx(exId) || !isIdx(idx)) return fail(400, "Yêu cầu không hợp lệ.");
    const meta = await DB.recmeta().get(who, { type: "json" });
    const key = exId + ":" + Number(idx);
    if (meta && meta[key]) {
      try { await DB.recfiles().delete(fkey(who, key)); } catch {}
      delete meta[key];
      if (Object.keys(meta).length) await DB.recmeta().setJSON(who, meta); else await DB.recmeta().delete(who);
    }
    return J(200, { ok: true });
  }
  if (a === "ai" && b === "list" && m === "GET") {
    const store = aiStore();
    const { blobs } = await store.list();
    const items = [];
    for (const bl of blobs) {
      const doc = await store.get(bl.key, { type: "json" });
      const u = doc && (await DB.users().get(bl.key, { type: "json" }));
      if (!doc || !u) continue;
      for (const [key, e] of Object.entries(doc)) if (key !== "_day") items.push({ user: bl.key, name: u.name, cls: u.cls || "", grade: u.grade || "", key, ...e });
    }
    items.sort((x, y) => y.t - x.t);
    return J(200, { items: items.slice(0, 400) });
  }
  if (a === "ai" && b === "edit" && m === "PUT") {
    const [, , who, exId, idx] = parts;
    if (!isUser(who) || !isEx(exId) || !isIdx(idx)) return fail(400, "Yêu cầu không hợp lệ.");
    const store = aiStore(), doc = await store.get(who, { type: "json" }), key = exId + ":" + Number(idx);
    const e = doc && doc[key];
    if (!e || !e.fb) return fail(404, "Chưa có nhận xét AI để sửa.");
    const f = body.fb || {};
    const fb = cleanFb(e.kind, f, e.text);
    // teacher may also add corrections whose quote is in the text; keep teacher comments even if AI-empty
    fb.summary = str(f.summary, 1200); fb.improved = str(f.improved, 4000);
    e.fb = fb; e.edited = true; e.editedAt = Date.now(); e.seen = false;
    await store.setJSON(who, doc);
    return J(200, { ok: true, entry: e });
  }
  if (a === "ai" && b === "regrade" && m === "POST") {
    const [, , who, exId, idx] = parts;
    if (!isUser(who) || !isEx(exId) || !isIdx(idx)) return fail(400, "Yêu cầu không hợp lệ.");
    const store = aiStore(), doc = await store.get(who, { type: "json" }), key = exId + ":" + Number(idx);
    if (!doc || !doc[key]) return fail(404, "Không tìm thấy bài.");
    doc[key].status = "pending"; doc[key].t = Date.now(); doc[key].err = "";
    await store.setJSON(who, doc);
    let ok = false;
    try {
      const r = await fetch(new URL(req.url).origin + "/.netlify/functions/ai-grade-background", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ who, key, sig: await jobSig(who + "|" + key) }) });
      ok = r.ok || r.status === 202;
    } catch {}
    return ok ? J(200, { ok: true }) : fail(502, "Không gọi được máy chủ chấm bài.");
  }

  if (a === "students" && !b && m === "POST") {
    const list = (Array.isArray(body.list) ? body.list : []).slice(0, 50);
    const created = [], errors = [];
    for (const [idx, it] of list.entries()) {
      const name = str(it && it.name, 60);
      if (name.length < 2) { errors.push({ i: idx, name, msg: "Họ tên quá ngắn" }); continue; }
      try {
        const username = await freeUsername(name), password = genPw();
        const u = { username, role: "student", name, cls: str(it.cls, 20), grade: cleanGrade(it.grade), ...(await hashPw(password)), created: Date.now() };
        await DB.users().setJSON(username, u);
        created.push({ username, password, name, cls: u.cls, grade: u.grade });
      } catch (e) { errors.push({ i: idx, name, msg: "Không tạo được tài khoản" }); }
    }
    const newCls = [...new Set(created.map((x) => x.cls).filter(Boolean))];
    if (newCls.length) {
      try {
        const cfg = await getCfg();
        const miss = newCls.filter((c) => !cfg.classes.includes(c));
        if (miss.length) { cfg.classes = cleanClasses([...cfg.classes, ...miss]); await DB.config().setJSON("main", cfg); }
      } catch (e) { /* lớp sẽ được thêm thủ công */ }
    }
    return J(200, { created, errors });
  }
  if (a === "students" && isUser(b)) {
    const users = DB.users();
    const u = await users.get(b, { type: "json" });
    if (!u || u.role !== "student") return fail(404, "Không tìm thấy học sinh.");
    if (!c && m === "PATCH") {
      if (typeof body.cls === "string") u.cls = str(body.cls, 20);
      if (body.grade !== undefined) u.grade = cleanGrade(body.grade);
      if (typeof body.name === "string" && str(body.name, 60).length >= 2) u.name = str(body.name, 60);
      await users.setJSON(b, u);
      return J(200, { ok: true });
    }
    if (!c && m === "DELETE") {
      await users.delete(b);
      await DB.progress().delete(b);
      try { await DB.reports().delete(b); } catch {}
      try { await DB.vocab().delete(b); } catch {}
      if (u.ptoken) { try { await DB.parent().delete(u.ptoken); } catch {} }
      const rm = await DB.recmeta().get(b, { type: "json" });
      if (rm) { for (const k of Object.keys(rm)) { try { await DB.recfiles().delete(fkey(b, k)); } catch {} } await DB.recmeta().delete(b); }
      return J(200, { ok: true });
    }
    if (c === "password" && m === "POST") {
      const password = genPw();
      Object.assign(u, await hashPw(password), { fails: 0 });
      delete u.lockUntil;
      await users.setJSON(b, u);
      return J(200, { username: b, password });
    }
    if (c === "progress" && m === "PUT") {
      const p = (await DB.progress().get(b, { type: "json" })) || { ex: {}, lv: {}, days: [], ci: {} };
      if (body.resetEx && p.ex) delete p.ex[String(body.resetEx)];
      await DB.progress().setJSON(b, p);
      return J(200, { ok: true });
    }
  }

  /* quản lý tài khoản trợ giảng */
  if (a === "staff" && !b && m === "GET") {
    const list = (await listAll(DB.users())).map(([, u]) => u).filter((u) => u && u.role === "ta").map((u) => ({ username: u.username, name: u.name, classes: u.classes || [] }));
    return J(200, { staff: list });
  }
  if (a === "staff" && !b && m === "POST") {
    const name = str(body.name, 60);
    if (name.length < 2) return fail(400, "Nhập họ tên trợ giảng.");
    const username = await freeUsername(name), password = genPw();
    const u = { username, role: "ta", name, cls: "", classes: cleanClasses(body.classes), ...(await hashPw(password)), created: Date.now() };
    await DB.users().setJSON(username, u);
    return J(200, { created: { username, password, name, classes: u.classes } });
  }
  if (a === "staff" && isUser(b)) {
    const users = DB.users(), u = await users.get(b, { type: "json" });
    if (!u || u.role !== "ta") return fail(404, "Không tìm thấy trợ giảng.");
    if (!c && m === "PATCH") {
      if (body.classes !== undefined) u.classes = cleanClasses(body.classes);
      if (typeof body.name === "string" && str(body.name, 60).length >= 2) u.name = str(body.name, 60);
      await users.setJSON(b, u);
      return J(200, { ok: true });
    }
    if (!c && m === "DELETE") { await users.delete(b); return J(200, { ok: true }); }
    if (c === "password" && m === "POST") {
      const password = genPw();
      Object.assign(u, await hashPw(password), { fails: 0 });
      delete u.lockUntil;
      await users.setJSON(b, u);
      return J(200, { username: b, password });
    }
  }
  return fail(404, "Không tìm thấy.");
}
