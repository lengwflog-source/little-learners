// IELTS AI feedback helpers (Writing + Speaking). Used by api.mjs and ai-grade-background.mjs
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const AI_KEEP_MS = 90 * 24 * 3600 * 1000; // feedback text kept 90 days
export const MAX_PER_DAY = Number(process.env.AI_DAILY_LIMIT || 12);
export const aiStore = () => getStore({ name: "aifb", consistency: "strong" });

let SECRET = null;
async function secret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (SECRET) return SECRET;
  const c = getStore({ name: "config", consistency: "strong" });
  let s = await c.get("secret");
  if (!s) { s = crypto.randomBytes(32).toString("hex"); await c.set("secret", s); }
  return (SECRET = s);
}
export async function jobSig(id) {
  return crypto.createHmac("sha256", await secret()).update("aijob:" + id).digest("hex");
}

/* IELTS rounding: average of criteria -> nearest 0.5, .25 up to .5, .75 up to 1.0 */
export const round05 = (x) => Math.round(x * 2 + 1e-9) / 2;
const clampBand = (n) => { n = Number(n); if (!isFinite(n)) return 0; return Math.min(9, Math.max(0, Math.round(n * 2) / 2)); };

const RUBRIC_W = `IELTS Writing band descriptors (public, summarised). Score each criterion 0-9 in 0.5 steps.
TR Task Response (Task 2) / Task Achievement (Task 1): answers every part of the task; clear position; ideas developed with relevant examples. Band 5: partly addresses the task, ideas limited or repetitive; Band 6: addresses all parts but some ideas under-developed; Band 7: clear position, ideas extended.
CC Coherence & Cohesion: logical paragraphing, progression, linking words used accurately and not mechanically. Band 5: some organisation but linking is faulty/mechanical; Band 6: clear overall progression, cohesion sometimes faulty; Band 7: logical, a range of devices.
LR Lexical Resource: range and accuracy of vocabulary, collocation, spelling, word formation. Band 5: limited range, noticeable spelling/word-formation errors; Band 6: adequate range, some errors that do not impede; Band 7: less common items, occasional errors.
GRA Grammatical Range & Accuracy: variety of structures (complex sentences) and accuracy of grammar and punctuation. Band 5: limited range, frequent errors; Band 6: mix of simple and complex, errors rarely impede; Band 7: variety of complex structures, frequent error-free sentences.
Penalise answers under the minimum words (Task 1: 150, Task 2: 250) in TR/TA. Memorised or off-topic answers get low TR.`;

const RUBRIC_S = `IELTS Speaking band descriptors (public, summarised). Score each criterion 0-9 in 0.5 steps.
FC Fluency & Coherence: speaks at length without noticeable effort, few self-corrections, logical sequencing, discourse markers. Band 5: usually keeps going but relies on repetition/slow speech; Band 6: willing to speak at length, coherence sometimes lost; Band 7: speaks at length without effort.
LR Lexical Resource: range and flexibility of vocabulary, paraphrase, idiomatic language. Band 5: manages to talk about familiar topics, limited flexibility; Band 6: wide enough to discuss topics at length; Band 7: some less common items.
GRA Grammatical Range & Accuracy: range of structures and accuracy. Band 5: basic forms fairly well, subordinate structures limited; Band 6: mix of short and complex forms, errors frequent but rarely impede; Band 7: range of complex structures with some flexibility.
PR Pronunciation: you only have a text transcript from automatic speech recognition, so you CANNOT hear the student. Estimate PR cautiously from clarity of the transcript (words recognised correctly suggest intelligibility) and say clearly that it is an estimate; keep PR within 1 band of the average of the other three criteria unless the transcript is very poor.`;

export function buildPrompt(kind, d) {
  if (kind === "wr") {
    const task = d.task === 1 ? "Task 1" : "Task 2";
    return {
      system: `You are a careful, encouraging IELTS Writing examiner for Vietnamese learners at about band 3.0-5.5 (IELTS Level 1 course). Always reply with ONE JSON object only, no markdown, no extra text. Write all explanations in Vietnamese; keep quoted English exactly as the student wrote it.\n\n${RUBRIC_W}`,
      user: `Writing ${task}. Minimum words: ${d.minWords}. The student wrote ${d.wc} words.\nQUESTION:\n${d.prompt}\n\nSTUDENT ANSWER (verbatim):\n"""\n${d.text}\n"""\n\nReturn JSON with exactly these keys:\n{\n "bands": {"TR": number, "CC": number, "LR": number, "GRA": number},\n "comments": {"TR": "2-3 câu nhận xét tiếng Việt", "CC": "...", "LR": "...", "GRA": "..."},\n "corrections": [ {"quote": "EXACT substring copied from the student answer, 1-12 words, must occur in it", "fix": "corrected wording", "type": "grammar|spelling|vocab|style|punctuation", "note": "giải thích ngắn bằng tiếng Việt"} ],\n "summary": "3-4 câu nhận xét tổng quát bằng tiếng Việt: điểm mạnh và việc cần làm tiếp",\n "improved": "a better version of the whole answer at roughly band 6.5-7 that keeps the student's ideas, same length or slightly longer, paragraphs separated by \\n\\n",\n "tips": ["3 lời khuyên ngắn bằng tiếng Việt"]\n}\nList up to 25 of the most important corrections in the order they appear. Do not invent errors; every quote must exist verbatim in the answer.`,
    };
  }
  return {
    system: `You are a careful, encouraging IELTS Speaking examiner for Vietnamese learners at about band 3.0-5.5 (IELTS Level 1 course). Always reply with ONE JSON object only, no markdown, no extra text. Write explanations in Vietnamese; keep quoted English exactly as in the transcript.\n\n${RUBRIC_S}`,
    user: `Speaking ${d.part || "Part 2"}. The student spoke for about ${d.secs || "?"} seconds (${d.wc} words transcribed by automatic speech recognition, which can contain recognition mistakes - do not penalise obvious recognition errors).\nQUESTION / TASK CARD:\n${d.prompt}\n\nTRANSCRIPT:\n"""\n${d.text}\n"""\n\nReturn JSON with exactly these keys:\n{\n "bands": {"FC": number, "LR": number, "GRA": number, "PR": number},\n "comments": {"FC": "2-3 câu tiếng Việt", "LR": "...", "GRA": "...", "PR": "... (nói rõ đây chỉ là ước lượng từ bản chữ, giáo viên sẽ nghe lại)"},\n "corrections": [ {"quote": "EXACT substring of the transcript, 1-12 words", "fix": "better wording", "type": "grammar|vocab|fluency|style", "note": "giải thích ngắn bằng tiếng Việt"} ],\n "summary": "3-4 câu nhận xét tổng quát bằng tiếng Việt",\n "improved": "a model answer at roughly band 6.5 that reuses the student's ideas (about the same length)",\n "tips": ["3 lời khuyên ngắn bằng tiếng Việt"]\n}\nUp to 15 corrections, in order. Every quote must exist verbatim in the transcript.`,
  };
}

const CRIT = { wr: ["TR", "CC", "LR", "GRA"], sp: ["FC", "LR", "GRA", "PR"] };
export function cleanFb(kind, raw, text) {
  const cr = CRIT[kind];
  const fb = { bands: {}, comments: {}, corrections: [], summary: "", improved: "", tips: [] };
  const sc = [];
  for (const k of cr) {
    const v = clampBand(raw && raw.bands && raw.bands[k]);
    fb.bands[k] = v; sc.push(v);
    fb.comments[k] = String((raw && raw.comments && raw.comments[k]) || "").slice(0, 700);
  }
  fb.overall = round05(sc.reduce((a, b) => a + b, 0) / sc.length);
  const seen = new Set();
  for (const c of Array.isArray(raw && raw.corrections) ? raw.corrections : []) {
    const q = String((c && c.quote) || "").trim();
    if (!q || q.length > 140 || !text.includes(q) || seen.has(q)) continue;
    seen.add(q);
    fb.corrections.push({ quote: q, fix: String(c.fix || "").slice(0, 200), type: String(c.type || "grammar").slice(0, 12), note: String(c.note || "").slice(0, 300) });
    if (fb.corrections.length >= 30) break;
  }
  fb.summary = String((raw && raw.summary) || "").slice(0, 1200);
  fb.improved = String((raw && raw.improved) || "").slice(0, 4000);
  fb.tips = (Array.isArray(raw && raw.tips) ? raw.tips : []).slice(0, 5).map((t) => String(t).slice(0, 300));
  return fb;
}

export function parseJson(txt) {
  let s = String(txt || "").trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error("AI không trả về JSON");
  const j = s.slice(a, b + 1);
  try { return JSON.parse(j); } catch (e1) {
    // sửa lỗi thường gặp: xuống dòng/tab thật trong chuỗi, dấu phẩy thừa
    let t = j.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ");
    let out = "", inStr = false, esc = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (inStr) {
        if (esc) { out += c; esc = false; continue; }
        if (c === "\\") { out += c; esc = true; continue; }
        if (c === "\n") { out += "\\n"; continue; }
        if (c === "\r") continue;
        if (c === "\t") { out += " "; continue; }
        if (c === '"') {
          // dấu " nằm giữa chuỗi (không theo sau bởi , } ] :) -> coi là ký tự thường
          let k = i + 1; while (k < t.length && /\s/.test(t[k])) k++;
          if (k < t.length && !/[,}\]:]/.test(t[k])) { out += '\\"'; continue; }
          inStr = false; out += c; continue;
        }
        out += c; continue;
      }
      if (c === '"') inStr = true;
      out += c;
    }
    out = out.replace(/,\s*([}\]])/g, "$1");
    try { return JSON.parse(out); } catch (e2) { throw e1; }
  }
}

export async function callClaude(kind, d) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("NO_KEY");
  const { system, user } = buildPrompt(kind, d);
  const model = process.env.AI_MODEL || "claude-haiku-5-5";
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await callClaudeOnce(kind, d, key, model, system, attempt ? user + "\n\nLƯU Ý: chỉ trả về MỘT đối tượng JSON hợp lệ. Mọi dấu \" bên trong chuỗi phải viết thành \\\". Không xuống dòng trong chuỗi, không giải thích bên ngoài JSON." : user); }
    catch (e) { lastErr = e; if (!/JSON|Expected|Unexpected|position/i.test(String(e.message))) throw e; }
  }
  throw lastErr;
}

async function callClaudeOnce(kind, d, key, model, system, user) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 4000, system, messages: [{ role: "user", content: user }] }),
  });
  if (!r.ok) {
    let m = ""; try { m = (await r.json()).error.message; } catch {}
    throw new Error("API " + r.status + (m ? ": " + m : ""));
  }
  const j = await r.json();
  const txt = (j.content || []).map((c) => c.text || "").join("");
  return { fb: cleanFb(kind, parseJson(txt), d.text), model, usage: j.usage || null };
}

/* ---------- Q&A bé rồng: trả lời câu hỏi tiếng Anh của học sinh ---------- */
export async function askClaudeQA(question, ctx) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("NO_KEY");
  const models = [...new Set([process.env.AI_QA_MODEL, process.env.AI_MODEL, "claude-haiku-5-5", "claude-sonnet-5-5"].filter(Boolean))];
  const system = `Bạn là Baby Dragon, trợ lý của thầy Phi Long (Mr. Phi Long) tại MR.LONG's ENGLISH HOUSE. Bạn giải đáp thắc mắc tiếng Anh (ngữ pháp, từ vựng, cách dùng, bài tập) cho học sinh Việt Nam từ lớp 2 đến lớp 12 và IELTS. Quy tắc: trả lời bằng tiếng Việt thân thiện, ngắn gọn, dễ hiểu (tối đa khoảng 180 từ); nêu quy tắc, 2-3 ví dụ tiếng Anh kèm nghĩa tiếng Việt; có thể dùng gạch đầu dòng đơn giản, không dùng bảng hay markdown phức tạp. Chỉ trả lời nội dung học tiếng Anh; nếu câu hỏi không liên quan, nhẹ nhàng mời học sinh hỏi về tiếng Anh. Nếu không chắc chắn, hãy nói rõ để học sinh nhờ thầy giải đáp thêm. Không bịa nguồn.`;
  const user = (ctx ? "Học sinh đang làm bài: " + String(ctx).slice(0, 160) + "\n" : "") + "Câu hỏi của học sinh: " + String(question).slice(0, 600);
  let lastErr = "";
  for (const model of models) {
    let r;
    try {
      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: 700, system, messages: [{ role: "user", content: user }] }),
        signal: AbortSignal.timeout(20000),
      });
    } catch (e) { lastErr = "NET " + String(e.message).slice(0, 80); continue; }
    if (!r.ok) {
      let m = ""; try { m = (await r.json()).error.message; } catch {}
      lastErr = "API " + r.status + (m ? ": " + m : "");
      console.error("qa model", model, lastErr);
      if (r.status === 401 || r.status === 403 || r.status === 429) break;
      continue;
    }
    const j = await r.json();
    const txt = (j.content || []).map((c) => c.text || "").join("").trim();
    if (!txt) { lastErr = "EMPTY"; continue; }
    return { text: txt.slice(0, 2500), model };
  }
  throw new Error(lastErr || "UNKNOWN");
}

/* ---------- IELTS: luyện nói tự do trong Q&A (chấm nhanh từ bản chữ nhận dạng giọng nói) ---------- */
export async function gradeSpeakPractice(question, text, secs) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("NO_KEY");
  const models = [...new Set([process.env.AI_QA_MODEL, process.env.AI_MODEL, "claude-haiku-5-5", "claude-sonnet-5-5"].filter(Boolean))];
  const system = `You are a careful, encouraging IELTS Speaking examiner for Vietnamese learners at about band 3.0-5.5. Reply with ONE JSON object only, no markdown. Write explanations in Vietnamese; keep quoted English exactly as in the transcript.\n\n${RUBRIC_S}`;
  const wc = (text.match(/[A-Za-z0-9'’-]+/g) || []).length;
  const user = `The student practised this speaking question on their own: "${question}"\nThey spoke about ${secs || "?"} seconds (${wc} words, transcribed by automatic speech recognition; do not penalise obvious recognition errors).\nTRANSCRIPT:\n"""\n${text}\n"""\nReturn JSON exactly: {"bands":{"FC":n,"LR":n,"GRA":n,"PR":n},"summary":"3-4 câu nhận xét tiếng Việt: điểm mạnh và việc cần cải thiện","corrections":[{"quote":"exact substring of transcript","fix":"better wording","note":"giải thích ngắn tiếng Việt"}],"model":"a short model answer at about band 6.0 (60-90 words)"}\nAt most 5 corrections; each quote must occur verbatim in the transcript.`;
  let lastErr = "";
  for (const model of models) {
    let r;
    try {
      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: 1200, system, messages: [{ role: "user", content: user }] }),
        signal: AbortSignal.timeout(22000),
      });
    } catch (e) { lastErr = "NET " + String(e.message).slice(0, 80); continue; }
    if (!r.ok) {
      let m = ""; try { m = (await r.json()).error.message; } catch {}
      lastErr = "API " + r.status + (m ? ": " + m : "");
      if (r.status === 401 || r.status === 403 || r.status === 429) break;
      continue;
    }
    try {
      const j = await r.json();
      const raw = parseJson((j.content || []).map((c) => c.text || "").join(""));
      const bands = {}; const v = [];
      for (const k of CRIT.sp) { bands[k] = clampBand(raw.bands && raw.bands[k]); v.push(bands[k]); }
      const fix = (Array.isArray(raw.corrections) ? raw.corrections : []).filter((c) => c && typeof c.quote === "string" && c.quote && text.includes(c.quote)).slice(0, 5)
        .map((c) => ({ quote: c.quote.slice(0, 140), fix: String(c.fix || "").slice(0, 200), note: String(c.note || "").slice(0, 250) }));
      return { bands, overall: round05(v.reduce((a, b) => a + b, 0) / v.length), summary: String(raw.summary || "").slice(0, 900), corrections: fix, model: String(raw.model || "").slice(0, 900) };
    } catch (e) { lastErr = "PARSE " + String(e.message).slice(0, 60); }
  }
  throw new Error(lastErr || "UNKNOWN");
}
