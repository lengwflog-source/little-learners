/* v47: EXTRA WRITING (khóa IELTS): học viên nộp bài viết, giáo viên chấm tay. Gỡ: bỏ <script src="ew.js"> và các dòng 'ew' trong index.html. */
"use strict";
S.ew = S.ew || {};
const ewK = i => X.E.id + ':' + i;
const ewDone = k => !!(S.ew && S.ew[k]);
const ewWc = t => (String(t || '').match(/[A-Za-z0-9À-ɏ'’-]+/g) || []).length;
S.ewPend = S.ewPend || {}; S.ewImgs = S.ewImgs || {};
function ewImgUi(key) {
  const p = S.ewPend[key];
  return `<div class="ewimg" style="margin-top:10px"><label class="small muted" style="display:block;margin-bottom:4px">🖼️ Bài có biểu đồ / sơ đồ / bản đồ? Thêm hình đề bài để thầy chấm chính xác hơn (không bắt buộc):</label><input type="file" accept="image/*" data-ewimgf="${esc(key)}">${p ? `<div style="margin-top:8px"><img src="${p}" alt="Hình đề bài" style="max-width:320px;width:100%;border-radius:10px;border:1px solid var(--line)"> <button type="button" class="btn ghost sm" data-ew="imgx" data-k="${esc(key)}">Bỏ hình</button></div>` : ''}</div>`;
}
function ewImgFile(inp) {
  const f = inp.files && inp.files[0], key = inp.dataset.ewimgf; if (!f) return;
  if (!/^image\//.test(f.type)) { toast('Hãy chọn một tệp hình ảnh.'); return; }
  const fr = new FileReader();
  fr.onload = () => { const im = new Image(); im.onload = () => {
    const mx = 1100, sc = Math.min(1, mx / Math.max(im.width, im.height)), c = document.createElement('canvas');
    c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
    let q = 0.72, d = c.toDataURL('image/jpeg', q); while (d.length > 420000 && q > 0.3) { q -= 0.1; d = c.toDataURL('image/jpeg', q); }
    if (d.length > 440000) { toast('Hình quá lớn, hãy chọn hình nhỏ hơn.'); return; }
    S.ewPend[key] = d; ewKeepText(); render();
  }; im.onerror = () => toast('Không đọc được hình này.'); im.src = fr.result; };
  fr.readAsDataURL(f);
}
function ewKeepText() { const t = document.querySelector('[data-ewmt]'), x = document.querySelector('[data-ewmx]'); if (t || x) S.ewDraft = { t: t ? t.value : '', x: x ? x.value : '' }; const ta = document.querySelector('textarea[data-ewta]'); if (ta && X) X.ans[+ta.dataset.ewta] = ta.value; const ti = document.querySelector('input[data-ewti]'); if (ti && X) X['ewt' + ewK(+ti.dataset.ewti)] = ti.value; }
function ewImgTag(who, key) {
  const [ex, ix] = key.split(':'), ck = who + '|' + key;
  if (S.ewImgs[ck] !== undefined) return S.ewImgs[ck] ? `<div style="margin:8px 0"><img src="${S.ewImgs[ck]}" alt="Hình đề bài" style="max-width:100%;border-radius:10px;border:1px solid var(--line)"></div>` : '';
  S.ewImgs[ck] = undefined;
  if (!S.ewImgReq) S.ewImgReq = {};
  if (!S.ewImgReq[ck]) { S.ewImgReq[ck] = 1; API.call('GET', 'ew/img/' + encodeURIComponent(who) + '/' + ex + '/' + ix).then(r => { S.ewImgs[ck] = r.img || ''; render(); }).catch(() => { S.ewImgs[ck] = ''; }); }
  return '<p class="muted small">Đang tải hình…</p>';
}
document.addEventListener('change', e => { const t = e.target; if (t.dataset && t.dataset.ewimgf) ewImgFile(t); });
async function loadEw() {
  if (S.isT || !S.user) return;
  try { const r = await API.call('GET', 'ew/mine'); S.ew = r.ew || {}; ewSync(); } catch (e) { }
}
function ewSync() {
  if (!S.prof || S.isT || !S.lessons) return;
  let ch = false;
  for (const L of S.lessons) for (const E of L.exercises) {
    if (!E.items.some(it => it.t === 'ew')) continue;
    const r = S.prof.ex && S.prof.ex[E.id]; if (!r) continue;
    const g = gradeEx(E, r.a || []);
    if (g.c !== r.c || g.n !== r.n) { r.c = g.c; r.n = g.n; ch = true; }
  }
  if (ch) saveProf();
}
function ewItem(it, i) {
  const k = ewK(i), e = S.ew[k], min = it.minWords || 150;
  const head = `<div class="wrprompt"><div class="row"><span class="chip sky">Extra Writing</span><span class="muted small">Nên viết từ ${min} từ · thầy chấm trực tiếp</span></div><p><b>Bạn tự chọn đề tài:</b> gõ tiêu đề và nội dung bài viết bên dưới.</p>${it.hint ? `<p class="muted small">${esc(it.hint)}</p>` : ''}</div>`;
  if (e && !X['ewredo' + k]) {
    const graded = !!e.gradedAt;
    const box = graded
      ? `<div class="card" style="margin-top:12px;border-color:var(--ok,#2e7d5b)"><div class="row"><span class="chip good">Thầy đã chấm</span>${e.score ? `<b style="font-size:1.6em">${esc(e.score)}</b>` : ''}<span class="sp"></span><span class="muted small">${fmtT(e.gradedAt)}</span></div>${e.comment ? `<h4>Nhận xét của thầy</h4><p>${esc(e.comment).replace(/\n/g, '<br>')}</p>` : ''}${e.fixed ? `<details open style="margin-top:8px"><summary><b>Bài đã sửa</b></summary><div class="fbtext" style="margin-top:6px">${esc(e.fixed).replace(/\n/g, '<br>')}</div></details>` : ''}</div>`
      : `<div class="card" style="margin-top:12px"><span class="chip warn">Đã nộp</span> <span class="muted small">${fmtT(e.t)} · ${e.wc} từ. Đang chờ thầy chấm.</span></div>`;
    return head + `<h4 style="margin-top:12px">Bài bạn đã nộp${e.title ? ': ' + esc(e.title) : ''}</h4>${e.img ? ewImgTag(S.user.username, k) : ''}<div class="fbtext">${esc(e.text).replace(/\n/g, '<br>')}</div>` + box +
      `<div class="row" style="margin-top:10px"><button class="btn ghost sm" data-ew="redo" data-ix="${i}">${graded ? 'Viết lại và nộp bản mới' : 'Sửa và nộp lại'}</button></div>`;
  }
  const txt = X.ans[i] != null && typeof X.ans[i] === 'string' ? X.ans[i] : (e && e.text) || '';
  const n = ewWc(txt);
  const ttl = X['ewt' + k] != null ? X['ewt' + k] : (e && e.title) || '';
  return head + `<input class="sel-in" style="width:100%;margin-bottom:8px;font-weight:700" data-ewti="${i}" maxlength="120" placeholder="Tiêu đề bài viết (Title)" value="${esc(ttl)}"><textarea class="txt wrta" rows="14" data-i="${i}" data-ewta="${i}" lang="en" spellcheck="true" autocomplete="off" autocapitalize="off" placeholder="Viết bài của bạn bằng tiếng Anh tại đây…">${esc(txt)}</textarea>
    ${ewImgUi(k)}
    <div class="row wcrow"><div class="wcbox ${n >= min ? 'ok' : ''}" data-ewbox="${i}"><b data-ewn="${i}">${n}</b> / ${min} từ</div><span class="sp"></span><button class="btn" data-ew="sub" data-ix="${i}">Nộp bài cho thầy chấm</button></div>
    <p class="muted small">Máy gạch đỏ lỗi chính tả khi bạn gõ. Nộp xong thầy sẽ đọc và chấm, kết quả hiện ngay tại đây.</p>`;
}
async function ewSubmit(i) {
  const it = X.E.items[i], ta = document.querySelector('textarea[data-ewta="' + i + '"]'), text = ta ? ta.value : (X.ans[i] || ''), k = ewK(i);
  if (S.isT) { toast('Chỉ học viên mới nộp bài.'); return; }
  if (S.local) { toast('Chế độ thử: chưa nộp thật.'); return; }
  const ti = document.querySelector('input[data-ewti="' + i + '"]'), title = ti ? ti.value.trim() : '';
  if (!title) { toast('Bạn nhớ gõ tiêu đề bài viết nhé.'); return; }
  if (ewWc(text) < 20) { toast('Bài viết còn quá ngắn (cần ít nhất 20 từ).'); return; }
  X.ans[i] = text;
  try {
    const r = await API.call('POST', 'ew/submit', { exId: X.E.id, idx: i, text, title, img: S.ewPend[k] || undefined, keepImg: !S.ewPend[k] });
    delete S.ewPend[k];
    S.ew[k] = r.entry; X['ewredo' + k] = false; refreshItem(i); ewSync(); toast('Đã nộp bài. Thầy sẽ chấm sớm nhé!');
  } catch (e) { toast(e.message); }
}
var ewClick = function (t, D) {
  const i = D.ix != null ? +D.ix : null;
  if (D.ew === 'sub') return ewSubmit(i);
  if (D.ew === 'redo') { const k = ewK(i); X['ewredo' + k] = true; X.ans[i] = (S.ew[k] && S.ew[k].text) || ''; X['ewt' + k] = (S.ew[k] && S.ew[k].title) || ''; refreshItem(i); return; }
  if (D.ew === 'f') { S.ewf = D.v; render(); return; }
  if (D.ew === 'open') { S.ewOpen = S.ewOpen === D.id ? '' : D.id; render(); return; }
  if (D.ew === 'reload') { S.ewl = null; render(); return; }
  if (D.ew === 'save') return ewSave(D.id, t);
};
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset; if (!d || d.ewta == null) return;
  const it = X && X.E.items[+d.ewta], n = ewWc(t.value), el = document.querySelector('[data-ewn="' + d.ewta + '"]'), bx = document.querySelector('[data-ewbox="' + d.ewta + '"]');
  if (el) el.textContent = n; if (bx && it) bx.classList.toggle('ok', n >= (it.minWords || 150));
});
/* ---------- trang giáo viên ---------- */
const ewId = x => x.user + '|' + x.key.split(':')[0] + '|' + x.key.split(':')[1];
function ewTeacher() {
  if (S.ewl === undefined || S.ewl === null) {
    S.ewl = []; S.ewLoaded = false;
    API.call('GET', 'ew/list').then(r => { S.ewl = r.items || []; S.ewLoaded = true; render(); }).catch(e => { S.ewLoaded = true; toast(e.message); render(); });
  }
  const f = S.ewf || 'todo';
  let it = (S.ewl || []).filter(x => !S.cls || x.cls === S.cls);
  const todo = it.filter(x => !x.gradedAt || x.gradedAt < x.t).length;
  if (f === 'todo') it = it.filter(x => !x.gradedAt || x.gradedAt < x.t); else if (f === 'done') it = it.filter(x => x.gradedAt && x.gradedAt >= x.t);
  return `<div class="wrap" style="padding-block:28px"><h1 style="font-size:clamp(2rem,5vw,2.8rem)">Chấm Extra Writing (IELTS)</h1>
  <p class="muted">Bài học viên nộp ở mục Extra Writing hiện tại đây. Bạn cho điểm, nhận xét và có thể viết lại bài đã sửa. Học viên đọc được ngay trong bài của mình.</p>
  <div class="row" style="margin-block:12px"><div class="seg">${[['todo', 'Chưa chấm (' + todo + ')'], ['done', 'Đã chấm'], ['all', 'Tất cả']].map(([v, n]) => `<button class="${f === v ? 'on' : ''}" data-ew="f" data-v="${v}">${n}</button>`).join('')}</div><span class="sp"></span><button class="btn ghost sm" data-ew="reload">↻ Tải lại</button></div>
  ${!S.ewLoaded ? '<div class="sk"></div>' : it.length ? it.map(ewCard).join('') : '<div class="card"><p class="muted">Chưa có bài nào.</p></div>'}</div>`;
}
function ewCard(x) {
  const id = ewId(x), open = S.ewOpen === id, ex = x.key.split(':')[0], graded = x.gradedAt && x.gradedAt >= x.t;
  return `<div class="card vcard"><div class="row"><div><b>${esc(x.name)}</b> <span class="muted small">${esc(x.cls || '')}</span><div><b>${x.title ? esc(x.title) : '(không có tiêu đề)'}</b></div><div class="muted small">${ex === 'ie-extra-writing' ? 'Extra Writing (tự do)' : esc(exTitleOf(ex))}</div><div class="muted small">${fmtT(x.t)} · ${x.wc || 0} từ${x.n > 1 ? ' · nộp lần ' + x.n : ''}</div></div><span class="sp"></span>${graded ? `<span class="chip good">Đã chấm${x.score ? ' · ' + esc(x.score) : ''}</span>` : '<span class="chip warn">Chưa chấm</span>'}<button class="btn sm" data-ew="open" data-id="${esc(id)}">${open ? 'Đóng' : (graded ? 'Xem / sửa' : 'Chấm bài')}</button></div>
  ${open ? `<div class="aied" data-ewed="${esc(id)}" style="margin-top:12px"><div class="grid g2" style="align-items:start">
   <div><h4>Tiêu đề: ${esc(x.title || '')}</h4>${x.img ? ewImgTag(x.user, x.key) : ''}<h4>Bài làm của học viên</h4><div class="fbtext">${esc(x.text).replace(/\n/g, '<br>')}</div></div>
   <div>${(() => { const d = x.draft, g = x.gradedAt && x.gradedAt >= x.t; if (g || !d) return ''; return d.status === 'pending' ? '<div class="banner">⏳ AI đang soạn bản nháp… bấm “Tải lại” sau ít phút.</div>' : d.status === 'done' ? '<div class="banner">🤖 Bản nháp do AI soạn. Học viên chưa thấy gì. Bạn sửa rồi bấm “Lưu và gửi cho học viên”.</div>' : '<div class="banner err">AI chưa soạn được nháp: ' + esc(d.err || '') + '</div>'; })()}
   <h4>Điểm (ví dụ 6.5)</h4><input class="sel-in bandin" data-ews value="${esc(x.score || ((x.draft && x.draft.status === 'done' && !(x.gradedAt && x.gradedAt >= x.t)) ? x.draft.score : '') || '')}" maxlength="12" placeholder="6.5">
   <h4>Nhận xét</h4><textarea class="txt" rows="10" data-ewc>${esc(x.comment || ((x.draft && x.draft.status === 'done' && !(x.gradedAt && x.gradedAt >= x.t)) ? x.draft.comment : '') || '')}</textarea>
   <h4>Bài đã sửa / bài mẫu (không bắt buộc)</h4><textarea class="txt" rows="9" data-ewx>${esc(x.fixed || ((x.draft && x.draft.status === 'done' && !(x.gradedAt && x.gradedAt >= x.t)) ? x.draft.fixed : '') || x.text || '')}</textarea>
   <div class="row" style="margin-top:14px"><button class="btn" data-ew="save" data-id="${esc(id)}">Lưu và gửi cho học viên</button></div></div></div></div>` : ''}</div>`;
}
async function ewSave(id, btn) {
  const root = document.querySelector('[data-ewed="' + id + '"]'); if (!root) return;
  const [who, ex, ix] = id.split('|'), x = S.ewl.find(y => ewId(y) === id); if (!x) return;
  btn.disabled = true;
  const fixed = root.querySelector('[data-ewx]').value;
  try {
    const r = await API.call('PUT', 'ew/grade/' + encodeURIComponent(who) + '/' + ex + '/' + ix, { score: root.querySelector('[data-ews]').value, comment: root.querySelector('[data-ewc]').value, fixed: fixed.trim() === String(x.text).trim() ? '' : fixed });
    Object.assign(x, r.entry); toast('Đã lưu. Học viên sẽ thấy nhận xét của bạn.'); render();
  } catch (e) { toast(e.message); btn.disabled = false; }
}

/* ---------- mục EXTRA WRITING riêng (học viên IELTS): viết tự do, thầy chấm ---------- */
const EWX = 'ie-extra-writing';
const ewMine = () => Object.entries(S.ew || {}).filter(([k]) => k.startsWith(EWX + ':')).map(([k, e]) => ({ k, idx: +k.split(':')[1], e })).sort((a, b) => b.e.t - a.e.t);
function ewHomeCard() {
  const l = ewMine(), g = l.filter(x => x.e.gradedAt && x.e.gradedAt >= x.e.t), nw = g.filter(x => !x.e.seen).length;
  return `<div class="card" id="tr-ew"><div class="sechead" style="margin:0 0 8px"><h3>✍️ EXTRA WRITING</h3>${nw ? `<span class="chip good">${nw} bài mới được chấm</span>` : ''}</div>
   <p class="muted" style="margin:0 0 10px">Tự chọn đề tài, viết bài rồi nộp. Thầy đọc, cho điểm và nhận xét.</p>
   <div class="row small muted" style="margin-bottom:10px"><span>Đã nộp: <b>${l.length}</b></span><span>Đã chấm: <b>${g.length}</b></span></div>
   <a class="btn" href="#ew-me" style="text-decoration:none">Viết bài mới / xem bài đã nộp</a></div>`;
}
function ewHome() {
  const l = ewMine(), draft = S.ewDraft || { t: '', x: '' }, n = ewWc(draft.x);
  if (!S.ewSeenSent) {
    S.ewSeenSent = true;
    l.filter(x => x.e.gradedAt && x.e.gradedAt >= x.e.t && !x.e.seen).forEach(x => { x.e.seen = true; API.call('PUT', 'ew/seen', { key: x.k }).catch(() => { }); });
  }
  return `<div class="wrap" style="padding-block:28px"><a href="#home" class="btn ghost sm" style="text-decoration:none">← Tổng quan</a><h1 style="font-size:clamp(2rem,5vw,2.8rem);margin-top:12px">✍️ EXTRA WRITING</h1>
  <p class="muted">Bạn tự chọn đề tài: gõ <b>tiêu đề</b> và <b>nội dung</b>. Nên viết từ 150 từ. Nộp xong, thầy sẽ chấm và nhận xét tại đây.</p>
  <div class="card"><h4>Bài viết mới</h4>
   <input class="sel-in" style="width:100%;margin-bottom:8px;font-weight:700" data-ewmt maxlength="120" placeholder="Tiêu đề bài viết (Title)" value="${esc(draft.t)}">
   <textarea class="txt wrta" rows="14" data-ewmx lang="en" spellcheck="true" autocomplete="off" autocapitalize="off" placeholder="Viết bài của bạn bằng tiếng Anh tại đây…">${esc(draft.x)}</textarea>
   ${ewImgUi('home')}
   <div class="row wcrow"><div class="wcbox ${n >= 150 ? 'ok' : ''}" data-ewmbox><b data-ewmn>${n}</b> / 150 từ</div><span class="sp"></span><button class="btn" data-ew="msub">Nộp bài cho thầy chấm</button></div></div>
  <h3 style="margin-top:22px">Bài đã nộp (${l.length})</h3>
  ${l.length ? l.map(x => ewMineCard(x)).join('') : '<div class="card"><p class="muted">Bạn chưa nộp bài nào.</p></div>'}</div>`;
}
function ewMineCard(x) {
  const e = x.e, graded = e.gradedAt && e.gradedAt >= e.t, open = S.ewmOpen === x.k;
  return `<div class="card vcard"><div class="row"><div><b>${esc(e.title || '(không có tiêu đề)')}</b><div class="muted small">${fmtT(e.t)} · ${e.wc || 0} từ</div></div><span class="sp"></span>${graded ? `<span class="chip good">Đã chấm${e.score ? ' · ' + esc(e.score) : ''}</span>` : '<span class="chip warn">Chờ thầy chấm</span>'}<button class="btn sm" data-ew="mopen" data-id="${esc(x.k)}">${open ? 'Đóng' : 'Xem'}</button></div>
  ${open ? `<div style="margin-top:10px">${e.img ? ewImgTag(S.user.username, x.k) : ''}<div class="fbtext">${esc(e.text).replace(/\n/g, '<br>')}</div>${graded ? `<div class="card" style="margin-top:10px"><div class="row"><span class="chip good">Thầy đã chấm</span>${e.score ? `<b style="font-size:1.6em">${esc(e.score)}</b>` : ''}<span class="sp"></span><span class="muted small">${fmtT(e.gradedAt)}</span></div>${e.comment ? `<h4>Nhận xét của thầy</h4><p>${esc(e.comment).replace(/\n/g, '<br>')}</p>` : ''}${e.fixed ? `<details open><summary><b>Bài đã sửa</b></summary><div class="fbtext" style="margin-top:6px">${esc(e.fixed).replace(/\n/g, '<br>')}</div></details>` : ''}</div>` : ''}</div>` : ''}</div>`;
}
async function ewMSubmit() {
  const t = (document.querySelector('[data-ewmt]') || {}).value || '', x = (document.querySelector('[data-ewmx]') || {}).value || '';
  if (S.isT) { toast('Chỉ học viên mới nộp bài.'); return; }
  if (!t.trim()) { toast('Bạn nhớ gõ tiêu đề bài viết nhé.'); return; }
  if (ewWc(x) < 20) { toast('Bài viết còn quá ngắn (cần ít nhất 20 từ).'); return; }
  const used = Object.keys(S.ew || {}).filter(k => k.startsWith(EWX + ':')).map(k => +k.split(':')[1]);
  const idx = used.length ? Math.max(...used) + 1 : 0;
  try {
    const r = await API.call('POST', 'ew/submit', { exId: EWX, idx, text: x, title: t.trim(), img: S.ewPend.home || undefined });
    delete S.ewPend.home;
    S.ew[r.key || EWX + ':' + idx] = r.entry; S.ewDraft = null; S.ewmOpen = r.key || EWX + ':' + idx; toast('Đã nộp bài. Thầy sẽ chấm sớm nhé!'); render();
  } catch (e) { toast(e.message); }
}
document.addEventListener('input', e => {
  const d = e.target.dataset; if (!d) return;
  if (d.ewmt != null || d.ewmx != null) {
    S.ewDraft = S.ewDraft || { t: '', x: '' };
    if (d.ewmt != null) S.ewDraft.t = e.target.value; else {
      S.ewDraft.x = e.target.value; const n = ewWc(e.target.value), el = document.querySelector('[data-ewmn]'), bx = document.querySelector('[data-ewmbox]');
      if (el) el.textContent = n; if (bx) bx.classList.toggle('ok', n >= 150);
    }
  }
});
const _ewClick = ewClick;
ewClick = function (t, D) {
  if (D.ew === 'imgx') { ewKeepText(); delete S.ewPend[D.k]; render(); return; }
  if (D.ew === 'msub') return ewMSubmit();
  if (D.ew === 'mopen') { S.ewmOpen = S.ewmOpen === D.id ? '' : D.id; render(); return; }
  return _ewClick(t, D);
};
