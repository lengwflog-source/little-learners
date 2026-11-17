// Little Learners - API (Netlify Functions v2 + Netlify Blobs)
// Routes: /api/*  -> this single function. Data lives in Netlify Blobs (no external database).
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
import { REC_MS, fkey, purgeUser } from "../lib/rec.mjs";
import { aiStore, jobSig, cleanFb, AI_KEEP_MS, MAX_PER_DAY } from "../lib/ai.mjs";

export const config = { path: "/api/*" };

const TZ = process.env.TZ_NAME || "Asia/Ho_Chi_Minh";
const store = (name) => getStore({ name, consistency: "strong" });
const DB = { users: () => store("users"), progress: () => store("progress"), attendance: () => store("attendance"), config: () => store("config"), recmeta: () => store("recmeta"), recfiles: () => store("recfiles") };
const MAX_AUDIO = 4 * 1024 * 1024, MAX_RECS = 150;
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
const pub = (u) => ({ username: u.username, role: u.role, name: u.name, cls: u.cls || "", grade: u.grade || "" });
const cleanGrade = (g) => (["2", "3", "6", "8", "9"].includes(String(g)) ? String(g) : "");
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

const DEFAULT_CFG = { classes: [], assignments: [], announcement: "", checkin: null };
async function getCfg() {
  const c = (await DB.config().get("main", { type: "json" })) || {};
  return { ...DEFAULT_CFG, ...c };
}
const cfgFor = (cfg, user) =>
  user.role === "teacher" ? cfg : { ...cfg, checkin: cfg.checkin ? { date: cfg.checkin.date } : null };

function cleanCfg(b) {
  const classes = (Array.isArray(b.classes) ? b.classes : []).map((c) => str(c, 20)).filter(Boolean).slice(0, 40);
  const assignments = (Array.isArray(b.assignments) ? b.assignments : []).slice(0, 100).map((a) => ({
    id: str(a.id, 30), title: str(a.title, 120), cls: str(a.cls, 20), due: isDate(a.due) ? a.due : "",
    lessons: (Array.isArray(a.lessons) ? a.lessons : []).map((x) => str(x, 30)).filter(Boolean).slice(0, 40),
    ex: (Array.isArray(a.ex) ? a.ex : []).map((x) => str(x, 40)).filter(Boolean).slice(0, 400),
  })).filter((a) => a.title);
  let checkin = null;
  if (b.checkin && isDate(b.checkin.date) && /^\d{4,6}$/.test(String(b.checkin.code))) checkin = { date: b.checkin.date, code: String(b.checkin.code) };
  return { classes, assignments, announcement: str(b.announcement, 500), checkin };
}
function cleanProgress(b, old) {
  const out = { ex: {}, lv: {}, days: [], ci: (old && old.ci) || {}, last: Date.now() };
  const ex = b && typeof b.ex === "object" && b.ex ? b.ex : {};
  for (const id of Object.keys(ex).slice(0, 800)) {
    const r = ex[id];
    if (!r || typeof r !== "object" || !/^[\w.-]{1,40}$/.test(id)) continue;
    out.ex[id] = { c: Math.max(0, Math.min(500, r.c | 0)), n: Math.max(0, Math.min(500, r.n | 0)), t: Number(r.t) || Date.now(), a: Array.isArray(r.a) ? r.a : [] };
  }
  const lv = b && typeof b.lv === "object" && b.lv ? b.lv : {};
  for (const id of Object.keys(lv).slice(0, 100)) if (/^[\w.-]{1,40}$/.test(id)) out.lv[id] = Number(lv[id]) || Date.now();
  out.days = (Array.isArray(b && b.days) ? b.days : []).filter(isDate).slice(-120);
  return out;
}
async function listAll(store) {
  const { blobs } = await store.list();
  return Promise.all(blobs.map(async (x) => [x.key, await store.get(x.key, { type: "json" })]));
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
    if (user.fails || user.lockUntil) { user.fails = 0; delete user.lockUntil; await users.setJSON(username, user); }
    return J(200, { token: await signToken({ u: username, r: user.role, exp: Math.floor(Date.now() / 1000) + 7 * 86400 }), user: pub(user) });
  }

  /* authenticated */
  const user = await auth(req);
  if (!user) return fail(401, "Phiên đăng nhập đã hết hạn.");
  const teacher = user.role === "teacher";

  if (a === "me" && m === "GET") {
    const out = { user: pub(user), config: cfgFor(await getCfg(), user) };
    if (!teacher) {
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
  if (a === "config" && m === "GET") return J(200, { config: cfgFor(await getCfg(), user) });
  if (a === "progress" && m === "PUT") {
    if (teacher) return fail(403, "Giáo viên không có tiến trình học.");
    const old = (await DB.progress().get(user.username, { type: "json" })) || {};
    const next = cleanProgress(body, old);
    if (JSON.stringify(next).length > 450000) return fail(413, "Dữ liệu quá lớn.");
    await DB.progress().setJSON(user.username, next);
    return J(200, { ok: true });
  }
  if (a === "checkin" && m === "POST") {
    if (teacher) return fail(403, "Chỉ học sinh mới điểm danh bằng mã.");
    const cfg = await getCfg();
    if (!cfg.checkin || cfg.checkin.date !== today() || String(body.code).trim() !== cfg.checkin.code) return fail(400, "Mã điểm danh chưa đúng hoặc chưa mở.");
    const p = (await DB.progress().get(user.username, { type: "json" })) || { ex: {}, lv: {}, days: [], ci: {} };
    p.ci = { ...(p.ci || {}), [today()]: Date.now() };
    await DB.progress().setJSON(user.username, p);
    return J(200, { ci: p.ci });
  }

  /* voice recordings (student) */
  if (a === "rec" && b === "audio" && m === "PUT") {
    if (teacher) return fail(403, "Chỉ học sinh mới gửi bản thu.");
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
    if (teacher) return J(200, { recs: {} });
    return J(200, { recs: (await purgeUser(DB.recmeta(), DB.recfiles(), user.username)) || {} });
  }
  if (a === "rec" && b === "seen" && m === "PUT") {
    if (teacher) return J(200, { ok: true });
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
    if (!teacher && who !== user.username) return fail(403, "Bạn không có quyền nghe bản thu này.");
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
    if (teacher) return fail(403, "Chỉ học viên mới nộp bài để AI chấm.");
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
    if (teacher) return J(200, { ai: {} });
    const doc = (await aiStore().get(user.username, { type: "json" })) || {};
    delete doc._day;
    for (const e of Object.values(doc)) delete e.ai;
    return J(200, { ai: doc });
  }
  if (a === "ai" && b === "seen" && m === "PUT") {
    if (teacher) return J(200, { ok: true });
    const store = aiStore(), doc = await store.get(user.username, { type: "json" });
    if (doc && doc[str(body.key, 60)]) { doc[str(body.key, 60)].seen = true; await store.setJSON(user.username, doc); }
    return J(200, { ok: true });
  }

  /* teacher only */
  if (!teacher) return fail(403, "Bạn không có quyền thực hiện thao tác này.");

  if (a === "recs" && m === "GET") {
    const { blobs } = await DB.recmeta().list();
    const items = [];
    for (const bl of blobs) {
      const meta = await purgeUser(DB.recmeta(), DB.recfiles(), bl.key);
      if (!meta) continue;
      const u = await DB.users().get(bl.key, { type: "json" });
      if (!u) continue;
      for (const [key, v] of Object.entries(meta)) items.push({ user: bl.key, name: u.name, cls: u.cls || "", grade: u.grade || "", key, ...v });
    }
    items.sort((x, y) => y.t - x.t);
    return J(200, { items: items.slice(0, 600) });
  }
  if (a === "rec" && b === "comment" && m === "PUT") {
    const [, , who, exId, idx] = parts;
    if (!isUser(who) || !isEx(exId) || !isIdx(idx)) return fail(400, "Yêu cầu không hợp lệ.");
    const meta = await DB.recmeta().get(who, { type: "json" });
    const key = exId + ":" + Number(idx);
    if (!meta || !meta[key]) return fail(404, "Không tìm thấy bản thu.");
    const text = str(body.comment, 1000);
    Object.assign(meta[key], { comment: text, commentAt: text ? Date.now() : 0, seen: !text });
    await DB.recmeta().setJSON(who, meta);
    return J(200, { ok: true, meta: meta[key] });
  }
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

  if (a === "config" && m === "PUT") {
    const cfg = cleanCfg(body);
    await DB.config().setJSON("main", cfg);
    return J(200, { config: cfg });
  }
  if (a === "attendance" && m === "GET") {
    const dates = {};
    for (const [d, doc] of await listAll(DB.attendance())) if (doc) dates[d] = doc.marks || {};
    return J(200, { dates });
  }
  if (a === "attendance" && isDate(b) && m === "PUT") {
    const marks = {};
    for (const [u, v] of Object.entries(body.marks || {})) if (isUser(u) && ["P", "L", "E", "A"].includes(v)) marks[u] = v;
    await DB.attendance().setJSON(b, { date: b, marks });
    return J(200, { ok: true });
  }
  if (a === "students" && !b && m === "GET") {
    const prog = Object.fromEntries(await listAll(DB.progress()));
    const students = (await listAll(DB.users()))
      .map(([, u]) => u).filter((u) => u && u.role === "student")
      .map((u) => ({ username: u.username, name: u.name, cls: u.cls || "", grade: u.grade || "", progress: prog[u.username] || {} }));
    return J(200, { students });
  }
  if (a === "students" && !b && m === "POST") {
    const list = (Array.isArray(body.list) ? body.list : []).slice(0, 200);
    const created = [];
    for (const it of list) {
      const name = str(it.name, 60);
      if (name.length < 2) continue;
      const username = await freeUsername(name), password = genPw();
      const u = { username, role: "student", name, cls: str(it.cls, 20), grade: cleanGrade(it.grade), ...(await hashPw(password)), created: Date.now() };
      await DB.users().setJSON(username, u);
      created.push({ username, password, name, cls: u.cls, grade: u.grade });
    }
    return J(200, { created });
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
  return fail(404, "Không tìm thấy.");
}
