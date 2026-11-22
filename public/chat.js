/* v48: Chat với giáo viên. Học viên bấm Baby Dragon → "Chat với thầy", đặt câu hỏi trực tiếp; thầy trả lời sau (menu Chat). Gỡ: bỏ <script src="chat.js"> và các dòng 'chat' trong qa.js/index.html. */
"use strict";
const CH = { msgs: [], unread: 0, loaded: false, open: false, busy: false, tick: 0, T: [], tl: false, tb: false, f: 'wait', draft: {} };
const chUnread = () => CH.unread || 0;
const chTime = t => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
const chFmt = s => esc(s).replace(/\n/g, '<br>');
const chOn = () => { try { return !!S.user && !S.isT } catch (e) { return false } };
async function chLoad() {
  if (!chOn()) return;
  try { const r = await API.call('GET', 'chat/mine'); CH.msgs = r.msgs || []; CH.unread = r.unread || 0; CH.loaded = true } catch (e) { }
  if (typeof qaBadge === 'function') qaBadge();
  if (CH.open) chPaint();
}
function chPaint() {
  const L = document.getElementById('tcl'); if (!L) return;
  const near = L.scrollHeight - L.scrollTop - L.clientHeight < 80, was = L.scrollHeight;
  const lastS = CH.msgs.length && CH.msgs[CH.msgs.length - 1].f === 's';
  L.innerHTML = CH.msgs.length ? CH.msgs.map(m => m.f === 's'
    ? `<div class="qam me"><div class="qab">${chFmt(m.x)}<small class="qaw" style="margin:4px 0 0;color:inherit;opacity:.7">${chTime(m.t)}</small></div></div>`
    : `<div class="qam tch"><div class="qab"><span class="qaw">${esc(m.by || 'Thầy')}</span>${chFmt(m.x)}<small class="qaw" style="margin:4px 0 0">${chTime(m.t)}</small></div></div>`).join('')
    + (lastS ? '<div class="qaem" style="margin-top:6px"><span>⏳ Đã gửi cho thầy. Thầy sẽ trả lời khi có thời gian. Bạn có thể đóng khung này, khi thầy trả lời bé rồng sẽ hiện chấm đỏ.</span></div>' : '')
    : '<div class="qaem"><b>Hỏi thầy trực tiếp 👩‍🏫</b><span>Bạn gõ câu hỏi về bài học, thầy sẽ đọc và trả lời. Thầy không trả lời ngay lập tức nên bạn cứ gửi rồi tiếp tục học nhé.</span></div>';
  if (near || CH.justSent) L.scrollTop = L.scrollHeight; CH.justSent = false;
}
function chOpen() {
  if (!chOn()) return;
  document.getElementById('qap') && (typeof qaClose === 'function' ? qaClose() : document.getElementById('qap').remove());
  let p = document.getElementById('tcp'); if (p) p.remove();
  CH.open = true;
  p = document.createElement('div'); p.id = 'tcp'; p.className = 'qap'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Chat với giáo viên');
  p.innerHTML = `<div class="qah"><span class="qadg">${typeof bdSVG === 'function' ? bdSVG('wave').replace('viewBox="0 0 220 226"', 'viewBox="40 8 140 120"') : '🐲'}</span><div><b>Chat với thầy</b><small>Thầy Phi Long trả lời sau</small></div><span class="sp"></span><button type="button" class="qax" data-ch="x" aria-label="Đóng">✕</button></div>
  <div class="qal" id="tcl" aria-live="polite"></div>
  <form class="qaf" id="tcf"><textarea id="tcq" rows="2" maxlength="1000" placeholder="Bạn muốn hỏi thầy điều gì?"></textarea><button type="submit" class="btn" id="tcs">Gửi</button></form>
  <div class="qan">Thầy sẽ đọc và trả lời khi có thời gian. Đừng gửi mật khẩu hay thông tin cá nhân nhé.</div>`;
  document.body.appendChild(p);
  p.querySelector('[data-ch="x"]').addEventListener('click', chClose);
  const f = p.querySelector('#tcf');
  f.addEventListener('submit', e => { e.preventDefault(); chSend() });
  f.querySelector('textarea').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chSend() } });
  CH.justSent = true; chPaint();
  chLoad().then(() => { CH.justSent = true; chPaint(); if (CH.unread) { CH.unread = 0; if (typeof qaBadge === 'function') qaBadge(); API.call('PUT', 'chat/seen', {}).catch(() => { }) } });
  clearInterval(CH.tick); CH.tick = setInterval(() => { if (CH.open && !document.hidden) chLoad() }, 20000);
  setTimeout(() => { const q = document.getElementById('tcq'); q && q.focus({ preventScroll: true }) }, 150);
}
function chClose() { const p = document.getElementById('tcp'); p && p.remove(); CH.open = false; clearInterval(CH.tick) }
async function chSend() {
  const q = document.getElementById('tcq'), btn = document.getElementById('tcs'); if (!q || CH.busy) return;
  const x = q.value.trim(); if (!x) return;
  CH.busy = true; btn && (btn.disabled = true);
  try {
    const ctx = typeof qaCtx === 'function' ? qaCtx() : '';
    const r = await API.call('POST', 'chat/send', { text: x, ctx });
    CH.msgs.push(r.msg); q.value = ''; CH.justSent = true; chPaint();
  } catch (e) { toast(e.message) }
  CH.busy = false; btn && (btn.disabled = false);
}
/* ---------- giáo viên ---------- */
const chWait = () => (CH.T || []).filter(x => x.wait).length;
window.chNavBadge = () => { const n = chWait(); return ` <span class="qbadge badge"${n ? '' : ' hidden'}>${n || ''}</span>` };
async function chTLoad() {
  if (!S.isT || CH.tb) return; CH.tb = true;
  try { const r = await API.call('GET', 'chat/list'); CH.T = r.items || []; CH.tl = true } catch (e) { CH.tl = true }
  CH.tb = false;
  document.querySelectorAll('.nitem .qbadge').forEach(el => { });
  if (route() === 't-chat') chTPaintSoft();
}
function chTPaintSoft() { if (document.activeElement && document.activeElement.matches && document.activeElement.matches('textarea[data-chd]')) return; render() }
function chatTeacher() {
  if (!CH.tl && !CH.tb) chTLoad().then(() => { if (route() === 't-chat') render() });
  const f = CH.f, list = f === 'wait' ? CH.T.filter(x => x.wait) : CH.T;
  return `<div class="wrap" style="padding-block:28px"><h1 style="font-size:clamp(2rem,5vw,2.8rem)">Chat với học viên</h1>
  <p class="muted">Học viên hỏi trực tiếp qua Baby Dragon. Bạn trả lời khi rảnh, học viên thấy chấm đỏ trên bé rồng.</p>
  <div class="row" style="margin-block:12px"><div class="seg">${[['wait', 'Chờ trả lời (' + chWait() + ')'], ['all', 'Tất cả']].map(([v, n]) => `<button class="${f === v ? 'on' : ''}" data-ch="f" data-v="${v}">${n}</button>`).join('')}</div><span class="sp"></span><button class="btn ghost sm" data-ch="reload">↻ Tải lại</button></div>
  ${!CH.tl ? '<div class="sk"></div>' : list.length ? list.map(chTCard).join('') : '<div class="card"><p class="muted">Chưa có tin nhắn nào cần trả lời.</p></div>'}</div>`;
}
function chTCard(x) {
  const ms = x.msgs.slice(-8).map(m => m.f === 's'
    ? `<div class="qtm st"><b>${esc(x.name)}</b>${chFmt(m.x)}<small>${chTime(m.t)}${m.c ? ' · ' + esc(m.c) : ''}</small></div>`
    : `<div class="qtm tc"><b>${esc(m.by || 'Thầy')}</b>${chFmt(m.x)}<small>${chTime(m.t)}</small></div>`).join('');
  return `<div class="card qtc ${x.wait ? 'wait' : ''}"><div class="row"><div><b>${esc(x.name)}</b> <span class="muted small">${esc(x.cls || '')}</span></div><span class="sp"></span>${x.wait ? '<span class="chip warn">Chờ trả lời</span>' : '<span class="chip good">Đã trả lời</span>'}</div>
  <div style="margin:8px 0">${ms}</div>
  <div class="qtr"><textarea rows="2" maxlength="1500" data-chd="${esc(x.user)}" placeholder="Trả lời ${esc((x.name || '').split(' ').pop() || 'học viên')}…">${esc(CH.draft[x.user] || '')}</textarea><button type="button" class="btn sm" data-ch="send" data-u="${esc(x.user)}">Gửi</button></div></div>`;
}
async function chTSend(u, btn) {
  const ta = document.querySelector('textarea[data-chd="' + u + '"]'); if (!ta) return;
  const x = ta.value.trim(); if (!x) { toast('Bạn chưa nhập nội dung.'); return }
  btn.disabled = true;
  try {
    const r = await API.call('PUT', 'chat/reply/' + encodeURIComponent(u), { text: x });
    const t = CH.T.find(y => y.user === u); if (t) { t.msgs.push(r.msg); t.wait = false; t.last = r.msg.t }
    delete CH.draft[u]; toast('Đã gửi trả lời.'); render();
  } catch (e) { toast(e.message); btn.disabled = false }
}
function chClick(t, D) {
  if (D.ch === 'f') { CH.f = D.v; render(); return }
  if (D.ch === 'reload') { CH.tl = false; chTLoad().then(() => render()); render(); return }
  if (D.ch === 'send') return chTSend(D.u, t);
}
document.addEventListener('input', e => { const d = e.target.dataset; if (d && d.chd) CH.draft[d.chd] = e.target.value });
/* ---------- móc vào render ---------- */
const _chR = render;
render = function () {
  const x = _chR.apply(this, arguments);
  try {
    if (S.user && !S.isT && !CH.loaded && !CH.busy) { CH.busy = true; chLoad().finally(() => { CH.busy = false }) }
    if (S.user && S.isT && !CH.tl && !CH.tb) chTLoad().then(() => { document.querySelectorAll('.nitem .qbadge').forEach(el => { el.hidden = !chWait(); el.textContent = chWait() || '' }) });
  } catch (er) { console.error(er) }
  return x;
};
setInterval(() => { if (!S.user || document.hidden) return; if (S.isT) { CH.tl = false; chTLoad().then(() => { if (route() === 't-chat') return; }) } else chLoad() }, 60000);
