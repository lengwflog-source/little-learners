// Runs once a day: deletes voice recordings older than 7 days.
import { getStore } from "@netlify/blobs";
import { purgeUser } from "../lib/rec.mjs";

export const config = { schedule: "@daily" };

export default async () => {
  const meta = getStore({ name: "recmeta", consistency: "strong" });
  const files = getStore({ name: "recfiles", consistency: "strong" });
  const { blobs } = await meta.list();
  let n = 0;
  for (const b of blobs) { await purgeUser(meta, files, b.key); n++; }
  const qa = getStore({ name: "qa", consistency: "strong" });
  for (const b of (await qa.list()).blobs) {
    const d = (await qa.get(b.key, { type: "json" })) || {};
    const th = (d.th || []).filter((t) => t && Date.now() - t.t < 48 * 3600 * 1000);
    if (!th.length) await qa.delete(b.key); else if (th.length !== (d.th || []).length) await qa.setJSON(b.key, { th });
  }
  const sp = getStore({ name: "speak", consistency: "strong" });
  for (const b of (await sp.list()).blobs) {
    const d = (await sp.get(b.key, { type: "json" })) || {};
    const r = Object.fromEntries(Object.entries(d.r || {}).filter(([, v]) => v && Date.now() - v.t < 3 * 24 * 3600 * 1000));
    if (!Object.keys(r).length) await sp.delete(b.key); else if (Object.keys(r).length !== Object.keys(d.r || {}).length) await sp.setJSON(b.key, { r });
  }
  console.log("cleanup-recs: checked", n, "students");
  return new Response("ok");
};
