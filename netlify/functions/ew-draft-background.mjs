// Background function: AI viết bản nháp nhận xét cho Extra Writing. Học viên KHÔNG thấy bản nháp; giáo viên xem, sửa rồi mới gửi.
import { getStore } from "@netlify/blobs";
import { jobSig, callClaude, ewDraftFromFb } from "../lib/ai.mjs";

export default async (req) => {
  let body = {};
  try { body = await req.json(); } catch {}
  const { who, key, sig } = body;
  if (!who || !key || !sig) return new Response("bad", { status: 400 });
  if (sig !== (await jobSig(who + "|ew|" + key))) return new Response("forbidden", { status: 403 });
  const EW = getStore({ name: "ewrite", consistency: "strong" });
  const IMG = getStore({ name: "ewimg", consistency: "strong" });
  const doc = (await EW.get(who, { type: "json" })) || {};
  const e = doc[key];
  if (!e || !e.draft || e.draft.status !== "pending") return new Response("skip", { status: 200 });
  const t0 = e.t;
  let out;
  try {
    let img = "";
    if (e.img) { try { img = (await IMG.get(who + "|" + key)) || ""; } catch {} }
    const { fb } = await callClaude("wr", { task: img ? 1 : 2, minWords: 150, prompt: "Extra Writing, free topic. Title: " + (e.title || "") + (img ? ". Task 1: describe the attached chart/diagram." : ""), text: e.text, wc: e.wc, img });
    out = { status: "done", at: Date.now(), ...ewDraftFromFb(fb) };
  } catch (err) {
    out = { status: "error", at: Date.now(), err: err.message === "NO_KEY" ? "Chưa cài khóa AI." : String(err.message).slice(0, 160) };
  }
  const cur = (await EW.get(who, { type: "json" })) || {};
  if (cur[key] && cur[key].t === t0) { cur[key].draft = out; await EW.setJSON(who, cur); }
  return new Response("ok", { status: 200 });
};
