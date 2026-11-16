// Local preview: serves /public and routes /api/* to the Netlify function (uses a stub blob store in tests).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const { default: api } = await import("../netlify/functions/api.mjs");
const { default: aiBg } = await import("../netlify/functions/ai-grade-background.mjs");
// Local preview only: fake Anthropic reply so the AI flow can be tested without a key.
const realFetch = globalThis.fetch;
if (process.env.FAKE_AI) {
  process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "test";
  globalThis.fetch = async (u, o) => {
    if (String(u).includes("api.anthropic.com")) {
      const body = JSON.parse(o.body), c = body.messages[0].content;
      const m = c.match(/"""\n([\s\S]*?)\n"""/), text = m ? m[1] : "";
      const sp = /Speaking/.test(c), words = text.split(/\s+/).filter(Boolean);
      const quote = words.slice(0, 3).join(" ");
      const out = { bands: sp ? { FC: 5, LR: 5.5, GRA: 5, PR: 5 } : { TR: 5.5, CC: 5, LR: 5.5, GRA: 5 }, comments: sp ? { FC: "Bạn nói khá tự nhiên.", LR: "Từ vựng đủ dùng.", GRA: "Cần chú ý thì.", PR: "Ước lượng từ bản chữ." } : { TR: "Trả lời đủ ý.", CC: "Cần thêm từ nối.", LR: "Từ vựng ổn.", GRA: "Một vài lỗi thì." }, corrections: [{ quote, fix: quote + " (fixed)", type: "grammar", note: "Ví dụ giải thích." }, { quote: "not in text", fix: "x", type: "spelling", note: "" }], summary: "Bài làm khá tốt.", improved: "Improved: " + text, tips: ["Viết thêm ví dụ", "Dùng từ nối", "Kiểm tra chính tả"] };
      await new Promise((r) => setTimeout(r, 1200));
      return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(out) }], usage: {} }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return realFetch(u, o);
  };
}
const types = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".css": "text/css", ".js": "text/javascript", ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif" };
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  if (url.pathname === "/.netlify/functions/ai-grade-background") {
    const chunks = []; for await (const c of req) chunks.push(c);
    aiBg(new Request(url, { method: "POST", headers: req.headers, body: Buffer.concat(chunks) })).catch((e) => console.error(e));
    res.writeHead(202); res.end(); return;
  }
  if (url.pathname.startsWith("/api/")) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await api(new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) }));
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); return;
  }
  let f = path.join(root, url.pathname === "/" ? "index.html" : url.pathname);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); res.end("404"); return; }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}).listen(Number(process.env.PORT || 8888), () => console.log("http://localhost:" + (process.env.PORT || 8888)));
