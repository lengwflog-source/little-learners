// Background function (up to 15 min): calls Claude to grade a Writing/Speaking job created by /api/ai/*
import { aiStore, jobSig, callClaude } from "../lib/ai.mjs";

export default async (req) => {
  let body = {};
  try { body = await req.json(); } catch {}
  const { who, key, sig } = body;
  if (!who || !key || !sig) return new Response("bad", { status: 400 });
  const jid = who + "|" + key;
  if (sig !== (await jobSig(jid))) return new Response("forbidden", { status: 403 });
  const store = aiStore();
  const doc = (await store.get(who, { type: "json" })) || {};
  const e = doc[key];
  if (!e || e.status !== "pending") return new Response("skip", { status: 200 });
  try {
    const { fb, model } = await callClaude(e.kind, { task: e.task, minWords: e.minWords, part: e.part, prompt: e.prompt, text: e.text, wc: e.wc, secs: e.secs });
    const cur = (await store.get(who, { type: "json" })) || {};
    if (cur[key] && cur[key].t === e.t) {
      cur[key] = { ...cur[key], status: "done", fb, ai: JSON.parse(JSON.stringify(fb)), model, doneAt: Date.now(), err: "" };
      await store.setJSON(who, cur);
    }
  } catch (err) {
    const cur = (await store.get(who, { type: "json" })) || {};
    if (cur[key] && cur[key].t === e.t) {
      cur[key].status = "error";
      cur[key].err = err.message === "NO_KEY" ? "Chưa cài khóa AI (ANTHROPIC_API_KEY) trên Netlify." : "AI chưa chấm được: " + String(err.message).slice(0, 160);
      await store.setJSON(who, cur);
    }
  }
  return new Response("ok", { status: 200 });
};
