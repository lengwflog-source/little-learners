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
  console.log("cleanup-recs: checked", n, "students");
  return new Response("ok");
};
