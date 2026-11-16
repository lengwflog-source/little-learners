// Voice recordings: audio files live 7 days, then are deleted. Teacher comments (small text) are kept longer.
export const REC_MS = 7 * 24 * 3600 * 1000;
export const KEEP_META_MS = 60 * 24 * 3600 * 1000;
export const fkey = (user, key) => user + "~" + key.replace(":", "~");

export async function purgeUser(metaStore, fileStore, username, now = Date.now()) {
  const m = await metaStore.get(username, { type: "json" });
  if (!m) return null;
  let changed = false;
  for (const [k, v] of Object.entries(m)) {
    if (!v.expired && v.exp <= now) {
      try { await fileStore.delete(fkey(username, k)); } catch {}
      v.expired = true; changed = true;
    }
    if (now - v.t > KEEP_META_MS) { delete m[k]; changed = true; }
  }
  if (changed) {
    if (Object.keys(m).length) await metaStore.setJSON(username, m);
    else await metaStore.delete(username);
  }
  return m;
}
