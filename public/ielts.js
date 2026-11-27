/* IELTS 1 add-on: band scoring, Writing/Speaking with AI feedback, media players, teacher review page.
   Loaded after the main script; uses its globals (S, X, API, esc, toast, refreshItem, REC, RB, uploadRec ...). */
S.ai = S.ai || {};
const ASRD = {};
const SPT = {}, SPTX = {}, SPD = {};
let SPR = null, AIP = null;

/* ---------- band tables (reference conversion for a 40-question test) ---------- */
const BL = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1]];
const BR = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1]];
const bandOf = (t, raw) => { for (const [m, b] of t) if (raw >= m) return b; return 0; };
const r05 = x => Math.round(x * 2 + 1e-9) / 2;
const fb1 = b => (b == null || isNaN(b) ? '—' : Number(b).toFixed(1));
const wcount = t => (String(t || '').match(/[A-Za-z0-9À-ɏ'’-]+/g) || []).length;
const exBand = (E, r) => (E.band && r && r.n > 0) ? bandOf(E.band === 'L' ? BL : BR, Math.round(r.c / r.n * 40)) : null;

function ieBand(E, g) {
  if (!g || !g.n) return '';
  const b = exBand(E, g);
  return `<div class="card ieband"><div class="bb">${fb1(b)}</div><div><b>Band ước tính · ${E.band === 'L' ? 'Listening' : 'Reading'}</b><div class="muted small">${g.c}/${g.n} câu đúng, quy đổi tỉ lệ sang thang 40 câu của IELTS (bảng tham khảo). Đây là điểm luyện tập, không phải điểm thi thật.</div></div></div>`;
}

/* ---------- state helpers ---------- */
const ieDone = k => !!(S.ai && S.ai[k] && S.ai[k].status === 'done');
async function loadAi() {
  if (S.isT || !S.user) return;
  try { const r = await API.call('GET', 'ai/mine'); S.ai = r.ai || {}; } catch (e) { }
}
function aiHasPending() { return Object.values(S.ai || {}).some(e => e.status === 'pending'); }
function startAiPoll() {
  if (AIP) return;
  AIP = setInterval(async () => {
    const before = {}; Object.entries(S.ai).forEach(([k, e]) => before[k] = e.status);
    await loadAi();
    const changed = Object.keys(S.ai).filter(k => (before[k] || '') !== S.ai[k].status);
    if (X && X.E && route().startsWith('ex-')) X.E.items.forEach((it, i) => { if ((it.t === 'wr' || it.t === 'sp') && changed.includes(X.E.id + ':' + i)) refreshItem(i); });
    if (changed.some(k => S.ai[k] && S.ai[k].status === 'done')) syncAiProgress();
    if (!aiHasPending()) { clearInterval(AIP); AIP = null; }
  }, 4000);
}
function syncAiProgress() {
  if (!S.prof || S.isT) return;
  let ch = false;
  for (const L of S.lessons) for (const E of L.exercises) {
    if (!E.items.some(it => it.t === 'wr' || it.t === 'sp')) continue;
    const r = S.prof.ex && S.prof.ex[E.id]; if (!r) continue;
    const g = gradeEx(E, r.a || []);
    if (g.c !== r.c || g.n !== r.n) { r.c = g.c; r.n = g.n; ch = true; }
  }
  if (ch) saveProf();
}

/* ---------- media ---------- */
const enc = s => encodeURI(s);
function ieMedia(list) {
  return `<div class="iemedia">${list.map(m => m.t === 'video'
    ? `<figure class="iem"><figcaption>🎬 ${esc(m.title)}</figcaption><video controls preload="none" playsinline src="${enc(m.src)}"></video></figure>`
    : `<figure class="iem"><figcaption>🎧 ${esc(m.title)}</figcaption><audio controls preload="none"><source src="${enc(m.src)}"><source src="${enc(m.src.replace(/\.mp3$/i, ''))}"></audio></figure>`).join('')}
  <p class="muted small" style="margin:6px 0 0">Không phát được? Hãy tải lại trang hoặc nhờ giáo viên kiểm tra tệp âm thanh.</p></div>`;
}

/* ---------- feedback rendering ---------- */
const CRIT = {
  wr: [['TR', 'TASK RESPONSE'], ['CC', 'COHERENCE AND COHESION'], ['LR', 'LEXICAL RESOURCE'], ['GRA', 'GRAMMATICAL RANGE AND ACCURACY']],
  sp: [['FC', 'FLUENCY AND COHERENCE'], ['LR', 'LEXICAL RESOURCE'], ['GRA', 'GRAMMATICAL RANGE AND ACCURACY'], ['PR', 'PRONUNCIATION']],
};
function placeCors(text, cors) {
  const sp = [];
  (cors || []).forEach(c => { const s = text.indexOf(c.quote); if (s >= 0) sp.push({ s, e: s + c.quote.length, c }); });
  sp.sort((a, b) => a.s - b.s);
  const out = []; let last = -1;
  sp.forEach(x => { if (x.s >= last) { out.push(x); last = x.e; } });
  return out;
}
function markedText(text, cors) {
  const pl = placeCors(text, cors); let pos = 0, h = '';
  const nl = s => esc(s).replace(/\n/g, '<br>');
  pl.forEach((x, n) => { h += nl(text.slice(pos, x.s)) + `<mark class="cm t-${esc(x.c.type)}" title="${esc(x.c.fix + (x.c.note ? ' — ' + x.c.note : ''))}">${esc(x.c.quote)}<sup>${n + 1}</sup></mark>`; pos = x.e; });
  return { html: h + nl(text.slice(pos)), placed: pl.map(x => x.c) };
}
function fbHtml(e) {
  const fb = e.fb; if (!fb) return '';
  const kind = e.kind, crit = CRIT[kind].map(([k, n]) => [k, kind === 'wr' && k === 'TR' && e.task === 1 ? 'TASK ACHIEVEMENT' : n]);
  const mt = markedText(e.text || '', fb.corrections);
  const paras = s => String(s || '').split(/\n{2,}|\n/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
  return `<div class="fbgrid">
   <div class="card fbl"><h4>${kind === 'wr' ? 'Chữa lỗi bài làm' : 'Chữa lỗi bài nói (bản chữ)'}</h4>
    <div class="fbtext">${mt.html}</div>
    ${mt.placed.length ? `<ol class="fblist">${mt.placed.map(c => `<li><span class="chip t-${esc(c.type)}">${esc(c.type)}</span> <del>${esc(c.quote)}</del> → <ins>${esc(c.fix)}</ins>${c.note ? `<div class="muted small">${esc(c.note)}</div>` : ''}${S.isT ? '' : `<button class="btn ghost sm" data-ie="nbadd" data-q="${esc(c.quote)}" data-f="${esc(c.fix)}" data-n="${esc(c.note || '')}" data-ty="${esc(c.type || '')}" data-lb="${esc((X && X.E && X.E.title) || '')}">📒 Lưu vào sổ</button>`}</li>`).join('')}</ol>` : '<p class="muted small">Không có lỗi nào được đánh dấu.</p>'}
    ${fb.improved ? `<h4 style="margin-top:18px">${kind === 'wr' ? 'Bài viết đã cải thiện' : 'Câu trả lời mẫu cải thiện'}</h4><div class="fbimp">${paras(fb.improved)}</div>` : ''}</div>
   <div class="card fbr"><h4>Đánh giá về bài làm</h4>
    <div class="bandbig"><div class="bn">${fb1(fb.overall)}</div><div><b>Overall band</b><div class="muted small">${kind === 'wr' ? 'Writing' : 'Speaking'} · ${e.wc || 0} từ${e.secs ? ' · ' + e.secs + ' giây' : ''}</div></div></div>
    ${crit.map(([k, n]) => `<div class="crit"><div class="row"><b class="cn">${n}</b><span class="sp"></span><span class="cb">${fb1(fb.bands[k])}</span></div><p>${esc(fb.comments[k] || '')}</p></div>`).join('')}
    ${(fb.pron || []).length ? `<div class="tcm"><b>🎤 Từ cần luyện phát âm</b><ul class="tips">${fb.pron.map(w => `<li><b>${esc(w.word)}</b>${w.ipa ? ' <span class="muted">' + esc(w.ipa) + '</span>' : ''}${w.tip ? ' – ' + esc(w.tip) : ''}</li>`).join('')}</ul></div>` : ''}
    ${fb.summary ? `<div class="tcm"><b>Nhận xét chung</b><p>${esc(fb.summary)}</p></div>` : ''}
    ${(fb.tips || []).length ? `<ul class="tips">${fb.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    ${e.edited ? `<p class="muted small" style="margin-top:8px">Thầy/cô đã nhận xét · ${fmtT(e.editedAt)}</p>` : ''}</div></div>`;
}
function statusBox(e, i, kind) {
  if (e.status === 'pending') return `<div class="card aiwait"><span class="spin" aria-hidden="true"></span><div><b>Đang chờ giáo viên chấm bài…</b><div class="muted small">Thường mất khoảng 10–40 giây. Bạn có thể ở lại trang này.</div></div></div>`;
  if (e.status === 'error') return `<div class="banner err">${esc(e.err || 'Chưa chấm được bài.')}</div><button class="btn" data-ie="${kind}sub" data-ix="${i}">Thử nộp lại</button>`;
  return '';
}

/* ---------- Writing ---------- */
function ieWr(it, i) {
  const k = X.E.id + ':' + i, e = S.ai[k], min = it.minWords || 0;
  const head = `<div class="wrprompt"><div class="row"><span class="chip sky">Writing Task ${it.task || 2}</span><span class="muted small">Tối thiểu ${min} từ</span></div><p>${esc(it.prompt)}</p>${it.hint ? `<p class="muted small">${esc(it.hint)}</p>` : ''}</div>`;
  if (e && e.status === 'pending') return head + `<div class="fbtext" style="margin-block:10px">${esc(e.text).replace(/\n/g, '<br>')}</div>` + statusBox(e, i, 'wr');
  if (e && e.status === 'done' && !X['redo' + k]) return head + fbHtml(e) + (it.model && it.model.length ? `<details class="card" style="margin-top:12px"><summary><b>Xem bài mẫu của giám khảo</b></summary>${it.model.map(p => `<p>${esc(p)}</p>`).join('')}<p class="muted small">Đây chỉ là một cách viết tốt trong nhiều cách có thể.</p></details>` : '') + `<div class="row" style="margin-top:12px"><button class="btn ghost" data-ie="wrredo" data-ix="${i}">✎ Viết bài mới</button><span class="muted small">Bài mới sẽ được AI chấm lại.</span></div>`;
  const txt = X.ans[i] != null && typeof X.ans[i] === 'string' ? X.ans[i] : (e && e.text) || '';
  const n = wcount(txt);
  return head + (e && e.status === 'error' ? `<div class="banner err">${esc(e.err || '')}</div>` : '') +
    `<textarea class="txt wrta" rows="14" data-i="${i}" data-wr="${i}" lang="en" spellcheck="true" autocomplete="off" autocapitalize="off" placeholder="Viết bài của bạn bằng tiếng Anh tại đây…">${esc(txt)}</textarea>
    <div class="row wcrow"><div class="wcbox ${n >= min ? 'ok' : ''}" data-wcbox="${i}"><b data-wcn="${i}">${n}</b> / ${min} từ</div><span class="sp"></span><button class="btn" data-ie="wrsub" data-ix="${i}">Nộp bài để thầy chấm</button></div>
    <p class="muted small">Máy sẽ gạch đỏ lỗi chính tả khi bạn gõ. Khi nộp, bài được chấm theo 4 tiêu chí IELTS.</p>`;
}
async function wrSubmit(i) {
  const it = X.E.items[i], ta = document.querySelector('textarea[data-wr="' + i + '"]');
  const text = ta ? ta.value : (X.ans[i] || '');
  if (S.isT) { toast('Chỉ học viên mới nộp bài.'); return; }
  if (S.local) { toast('Chế độ thử: không gửi bài.'); return; }
  if (wcount(text) < 20) { toast('Bài viết còn quá ngắn (cần ít nhất 20 từ).'); return; }
  X.ans[i] = text;
  await aiSubmit('wr', i, { task: it.task || 2, minWords: it.minWords || 0, prompt: it.prompt, text });
}
async function aiSubmit(kind, i, d) {
  const k = X.E.id + ':' + i;
  try {
    const r = await API.call('POST', 'ai/submit', Object.assign({ kind, exId: X.E.id, idx: i }, d));
    S.ai[k] = r.entry; X['redo' + k] = false; startAiPoll(); refreshItem(i);
  } catch (e) { toast(e.message); }
}

/* ---------- Speaking ---------- */
function ieSp(it, i) {
  const k = X.E.id + ':' + i, e = S.ai[k], on = SPR && SPR.k === k, url = REC[k];
  const canRec = !!(navigator.mediaDevices && window.MediaRecorder);
  const head = `<div class="wrprompt"><div class="row"><span class="chip sky">Speaking ${esc(it.part || 'Part 1')}</span><span class="muted small">Nói tối đa ${it.secs || 120} giây</span></div><p><b>${esc(it.prompt)}</b></p>${(it.card || []).length ? `<ul class="cue">${it.card.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}${it.hint ? `<p class="muted small">${esc(it.hint)}</p>` : ''}</div>`;
  if (e && e.status === 'pending') return head + `<div class="fbtext" style="margin-block:10px">${esc(e.text)}</div>` + statusBox(e, i, 'sp');
  if (e && e.status === 'done' && !X['redo' + k]) return head + `<div class="rc" style="margin-block:8px">${url ? `<audio controls src="${url}"></audio>` : (S.recs[k] && !S.recs[k].expired ? `<button class="btn ghost sm" data-recplay="${i}">▶ Nghe lại bản đã gửi</button>` : '')}${S.recs[k] && !S.recs[k].expired ? `<span class="chip good">Bản thu tự xóa sau ${daysLeft(S.recs[k])}</span>` : ''}</div>` + fbHtml(e) + recComment(k) + `<div class="row" style="margin-top:12px"><button class="btn ghost" data-ie="spredo" data-ix="${i}">● Thu âm lại</button></div>`;
  const tx = SPTX[k] !== undefined ? SPTX[k] : (SPT[k] || (e && e.text) || '');
  const n = wcount(tx);
  return head + (e && e.status === 'error' ? `<div class="banner err">${esc(e.err || '')}</div>` : '') +
    `<div class="rc"><button class="btn ${on ? 'rec-on' : ''}" data-ie="sprec" data-ix="${i}" ${canRec ? '' : 'disabled'}>${on ? '■ Dừng' : '● Bắt đầu nói'}</button>${on ? '<span class="rectime" data-sptime>0:00</span>' : ''}${url ? `<audio controls src="${url}"></audio>` : ''}${recStatus(k, i, url, X.ans[i], false)}</div>
    ${on ? `<div class="muted small">Đang nghe: <i data-splive="${i}">${esc(SPT[k] || '…')}</i></div>` : ''}
    <label class="small muted" for="spta${i}" style="display:block;margin-top:10px">Bản chữ máy nghe được từ giọng nói của bạn (tự động, không gõ tay):</label>
    <textarea id="spta${i}" class="txt wrta" rows="6" data-sp="${i}" lang="en" spellcheck="false" autocomplete="off" readonly placeholder="Bản chữ sẽ hiện ở đây sau khi bạn nói…">${esc(tx)}</textarea>
    <div class="row wcrow"><div class="wcbox ${n >= 15 ? 'ok' : ''}" data-wcbox="${i}"><b data-wcn="${i}">${n}</b> từ</div><span class="sp"></span><button class="btn" data-ie="spsub" data-ix="${i}" ${on ? 'disabled' : ''}>Gửi bài để thầy chấm</button></div>
    <p class="muted small">① Đọc kỹ đề ② Bấm Bắt đầu nói và trả lời tự nhiên ③ Bấm Dừng ④ Gửi (nói rõ, đủ to; không gõ chữ). Bản thu giọng được gửi cho giáo viên và tự xóa sau 7 ngày. ${('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? '' : 'Trình duyệt này không tự chuyển giọng thành chữ; hãy dùng Chrome hoặc Safari, hoặc tự gõ lại lời nói.'}</p>`;
}
async function toggleSp(i) {
  const eid = X.E.id, k = eid + ':' + i, it = X.E.items[i];
  if (SPR) { const same = SPR.k === k; SPR.stop(); if (same) return; }
  if (S.isT) { toast('Chế độ giáo viên: không thu âm.'); return; }
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(st), ch = [];
    const SRc = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec = null, base = '', cur = '', stopping = false; SPT[k] = ''; delete SPTX[k]; ASRD[k] = []; ASRD['b:' + k] = [];
    if (SRc) {
      try {
        rec = new SRc(); rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true;
        rec.onresult = ev => { try { const sg = []; for (let r = 0; r < ev.results.length; r++) if (ev.results[r].isFinal) sg.push([ev.results[r][0].transcript.trim(), Math.round((ev.results[r][0].confidence || 0) * 100)]); ASRD[k] = (ASRD['b:' + k] || []).concat(sg); } catch (_) { } let f = '', im = ''; for (let r = 0; r < ev.results.length; r++) { const t = ev.results[r][0].transcript; if (ev.results[r].isFinal) f += t + ' '; else im += t; } cur = (f + im).trim(); SPT[k] = (base + ' ' + cur).trim(); const el = document.querySelector('[data-splive="' + i + '"]'); if (el) el.textContent = SPT[k] || '…'; };
        rec.onend = () => { ASRD['b:' + k] = (ASRD[k] || []).slice(); base = (base + ' ' + cur).trim(); cur = ''; if (!stopping) { try { rec.start(); } catch (_) { } } };
        rec.onerror = () => { };
        rec.start(); try{window.SFX&&SFX.start()}catch(_){}
      } catch (_) { rec = null; }
    }
    const t0 = Date.now(), maxS = it.secs || 120;
    mr.ondataavailable = e => { if (e.data.size) ch.push(e.data); };
    mr.onstop = () => {
      stopping = true; try { rec && rec.stop(); } catch (_) { }
      clearTimeout(SPR && SPR.tm); clearInterval(SPR && SPR.iv); st.getTracks().forEach(t => t.stop());
      if (REC[k]) URL.revokeObjectURL(REC[k]);
      const bl = new Blob(ch, { type: mr.mimeType || 'audio/webm' }); REC[k] = URL.createObjectURL(bl); RB[k] = bl;
      SPD[k] = Math.round((Date.now() - t0) / 1000); SPR = null;
      setTimeout(() => { if (X && X.E.id === eid) { X.ans[i] = true; refreshItem(i); } uploadRec(eid, i, bl, ('Speaking ' + (it.part || '') + ': ' + it.prompt).slice(0, 120)); }, 400);
    };
    SPR = { k, mr, stop: () => { try { mr.state !== 'inactive' && mr.stop(); } catch (_) { } }, tm: setTimeout(() => { try { mr.state !== 'inactive' && mr.stop(); } catch (_) { } }, maxS * 1000), iv: setInterval(() => { const el = document.querySelector('[data-sptime]'); if (el) { const s = Math.floor((Date.now() - t0) / 1000); el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); } }, 500) };
    mr.start(); try{window.SFX&&SFX.start()}catch(_){} refreshItem(i);
  } catch (e) { SPR = null; toast('Không mở được micro. Hãy bấm "Cho phép" khi trình duyệt hỏi quyền dùng micro.'); }
}
async function spSubmit(i) {
  const it = X.E.items[i], k = X.E.id + ':' + i, ta = document.querySelector('textarea[data-sp="' + i + '"]');
  const text = ta ? ta.value : '';
  if (S.isT) { toast('Chỉ học viên mới gửi bài nói.'); return; }
  if (S.local) { toast('Chế độ thử: không gửi bài.'); return; }
  if (wcount(text) < 5) { toast('Chưa nghe được giọng nói. Hãy bấm Bắt đầu nói, nói rõ và to hơn (dùng Chrome hoặc Safari).'); return; }
  SPTX[k] = text;
  await aiSubmit('sp', i, { part: it.part || 'Part 2', prompt: it.prompt + ((it.card || []).length ? ' ' + it.card.join(' / ') : ''), text, secs: SPD[k] || 0, asr: (ASRD[k] || []).slice(0, 40) });
}

/* ---------- progress summary ---------- */
function ieSummary(p) {
  const ex = (p && p.ex) || {}, bands = { L: [], R: [], W: [], S: [] };
  for (const L of S.lessons) for (const E of L.exercises) {
    if (E.band && ex[E.id] && ex[E.id].n > 0) bands[E.band].push(exBand(E, ex[E.id]));
    E.items.forEach((it, i) => { if (it.t === 'wr' || it.t === 'sp') { const e = S.ai[E.id + ':' + i]; if (e && e.status === 'done' && e.fb) bands[it.t === 'wr' ? 'W' : 'S'].push(e.fb.overall); } });
  }
  const avg = a => a.length ? r05(a.reduce((x, y) => x + y, 0) / a.length) : null;
  const v = { L: avg(bands.L), R: avg(bands.R), W: avg(bands.W), S: avg(bands.S) };
  const have = Object.values(v).filter(x => x != null);
  const ov = have.length ? r05(have.reduce((x, y) => x + y, 0) / have.length) : null;
  const t = (k, n) => `<div class="card kpi"><b>${fb1(v[k])}</b><span>${n}${bands[k].length ? ' · ' + bands[k].length + ' bài' : ''}</span></div>`;
  return `<div class="iesum"><div class="sechead" style="margin:0 0 10px"><h3>Band IELTS ước tính</h3><span class="chip sky">Overall ${fb1(ov)}</span></div><div class="grid g4">${t('L', 'Listening')}${t('R', 'Reading')}${t('W', 'Writing')}${t('S', 'Speaking')}</div><p class="muted small" style="margin-top:6px">Điểm luyện tập tính trung bình các bài đã làm, làm tròn 0,5 theo quy tắc IELTS. Không phải điểm thi thật.</p></div>`;
}

/* ---------- click + input handlers ---------- */
function ieClick(t, D) {
  const a = D.ie, i = D.ix != null ? +D.ix : null;
  if (a === 'nbadd') return nbAdd(t);
  if (a === 'nbdel') return nbDel(D.id);
  if (a === 'wrsub') return wrSubmit(i);
  if (a === 'spsub') return spSubmit(i);
  if (a === 'sprec') return toggleSp(i);
  if (a === 'wrredo' || a === 'spredo') { const k = X.E.id + ':' + i; X['redo' + k] = true; if (a === 'wrredo') X.ans[i] = (S.ai[k] && S.ai[k].text) || ''; else { delete SPTX[k]; SPT[k] = ''; if (REC[k]) { URL.revokeObjectURL(REC[k]); delete REC[k]; } } refreshItem(i); return; }
  if (a === 'aiopen') { S.aiOpen = S.aiOpen === D.id ? '' : D.id; render(); return; }
  if (a === 'aif') { S.aif = D.v; render(); return; }
  if (a === 'aireload') { S.ail = null; render(); return; }
  if (a === 'aisave') return aiSave(D.id, t);
  if (a === 'airegrade') return aiRegrade(D.id, t);
}
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset; if (!d) return;
  const id = d.wr != null ? d.wr : d.sp != null ? d.sp : null; if (id == null) return;
  const n = wcount(t.value), el = document.querySelector('[data-wcn="' + id + '"]'), bx = document.querySelector('[data-wcbox="' + id + '"]');
  if (el) el.textContent = n;
  if (bx && X) { const it = X.E.items[+id]; bx.classList.toggle('ok', n >= (d.wr != null ? (it.minWords || 0) : 15)); }
  if (d.sp != null && X) SPTX[X.E.id + ':' + id] = t.value;
});

/* ---------- teacher page ---------- */
function aiKey(x) { const [ex, ix] = x.key.split(':'); return x.user + '|' + ex + '|' + ix; }
function ieTeacherAi() {
  if (S.ail === undefined || S.ail === null) {
    S.ail = []; S.ailLoaded = false;
    API.call('GET', 'ai/list').then(r => { S.ail = r.items || []; S.ailLoaded = true; render(); }).catch(e => { S.ailLoaded = true; toast(e.message); render(); });
  }
  const f = S.aif || 'all', cl = S.cfg.classes || [];
  let it = (S.ail || []).filter(x => !S.cls || x.cls === S.cls);
  if (f === 'todo') it = it.filter(x => x.status === 'done' && !x.edited); else if (f === 'wr' || f === 'sp') it = it.filter(x => x.kind === f); else if (f === 'err') it = it.filter(x => x.status === 'error');
  const noKey = (S.ail || []).some(x => x.status === 'error' && /ANTHROPIC_API_KEY/.test(x.err || ''));
  return `<div class="wrap" style="padding-block:28px"><h1 style="font-size:clamp(2rem,5vw,2.8rem)">Chấm IELTS: Writing và Speaking</h1>
  <p class="muted">AI chấm ngay khi học viên nộp bài. Bạn xem lại, sửa điểm hoặc nhận xét, và học viên sẽ đọc được bản đã chỉnh. Bản thu giọng tự xóa sau 7 ngày, phần chữ và nhận xét được giữ 90 ngày.</p>
  ${noKey ? '<div class="banner err">Chưa cài khóa AI. Vào Netlify → Site configuration → Environment variables, thêm ANTHROPIC_API_KEY rồi bấm Deploy lại. (Xem README.)</div>' : ''}
  <div class="row" style="margin-block:12px"><div class="seg">${[['all', 'Tất cả'], ['todo', 'Chưa xem lại'], ['wr', 'Writing'], ['sp', 'Speaking'], ['err', 'Lỗi']].map(([v, n]) => `<button class="${f === v ? 'on' : ''}" data-ie="aif" data-v="${v}">${n}</button>`).join('')}</div>${cl.length ? `<select class="sel-in" onchange="S.cls=this.value;render()"><option value="">Tất cả lớp</option>${cl.map(c => `<option ${c === S.cls ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>` : ''}<button class="btn ghost sm" data-ie="aireload">↻ Tải lại</button></div>
  ${!S.ailLoaded ? '<div class="sk"></div>' : it.length ? it.map(x => aiCard(x)).join('') : '<div class="card"><p class="muted">Chưa có bài nào.</p></div>'}</div>`;
}
function aiCard(x) {
  const id = aiKey(x), open = S.aiOpen === id, ex = x.key.split(':')[0];
  const st = x.status === 'done' ? '<span class="chip good">Đã chấm</span>' : x.status === 'pending' ? '<span class="chip warn">Đang chấm</span>' : '<span class="chip bad">Lỗi</span>';
  return `<div class="card vcard"><div class="row"><div><b>${esc(x.name)}</b> <span class="muted small">${esc(x.cls || '')}</span><div>${x.kind === 'wr' ? 'Writing' : 'Speaking'} · ${esc(exTitleOf(ex))}</div><div class="muted small">${fmtT(x.t)} · ${x.wc || 0} từ</div></div><span class="sp"></span>${x.fb ? `<span class="cb">${fb1(x.fb.overall)}</span>` : ''}${st}${x.edited ? '<span class="chip sky">Đã sửa</span>' : ''}<button class="btn sm ${open ? '' : 'ghost'}" data-ie="aiopen" data-id="${esc(id)}">${open ? 'Đóng' : 'Xem / sửa'}</button></div>${open ? aiEditor(x, id) : ''}</div>`;
}
function aiEditor(x, id) {
  const kind = x.kind, crit = CRIT[kind].map(([k, n]) => [k, kind === 'wr' && k === 'TR' && x.task === 1 ? 'TASK ACHIEVEMENT' : n]);
  const [, ex, ix] = id.split('|'), fb = x.fb;
  const mt = markedText(x.text || '', fb ? fb.corrections : []);
  return `<div class="aied" data-aied="${esc(id)}"><div class="grid g2" style="align-items:start">
   <div><h4>Bài làm của học viên</h4><div class="wrprompt"><p class="small">${esc(x.prompt || '')}</p></div><div class="fbtext">${mt.html}</div>${kind === 'sp' ? `<div style="margin-top:8px"><button class="btn sm" data-vplay="${esc(id)}">▶ Nghe bản thu</button> <span class="muted small">(chỉ nghe được trong 7 ngày)</span></div>` : ''}</div>
   <div>${fb ? `<h4>Điểm và nhận xét từng tiêu chí</h4>${crit.map(([k, n]) => `<div class="crit"><div class="row"><b class="cn">${n}</b><span class="sp"></span><input class="sel-in bandin" type="number" min="0" max="9" step="0.5" data-aib="${k}" value="${fb.bands[k]}"></div><textarea class="txt" rows="3" data-aic="${k}">${esc(fb.comments[k] || '')}</textarea></div>`).join('')}` : `<p class="muted">${esc(x.err || 'Chưa có kết quả AI.')}</p>`}</div></div>
   ${fb ? `<h4>Nhận xét chung</h4><textarea class="txt" rows="3" data-ais>${esc(fb.summary || '')}</textarea>
   <h4>${kind === 'wr' ? 'Bài viết đã cải thiện' : 'Câu trả lời mẫu'}</h4><textarea class="txt" rows="9" data-aii>${esc(fb.improved || '')}</textarea>
   <h4>Lời khuyên (mỗi dòng một ý)</h4><textarea class="txt" rows="3" data-ait>${esc((fb.tips || []).join('\n'))}</textarea>
   <h4>Các lỗi đã chữa</h4>${fb.corrections.length ? fb.corrections.map((c, n) => `<div class="corr" data-aicr="${n}" data-q="${esc(c.quote)}" data-ty="${esc(c.type)}"><del>${esc(c.quote)}</del><input class="sel-in" data-aifx value="${esc(c.fix)}" aria-label="Sửa thành"><input class="sel-in" data-aino value="${esc(c.note)}" aria-label="Giải thích"><label class="small"><input type="checkbox" data-aidel> Xóa</label></div>`).join('') : '<p class="muted small">Không có.</p>'}` : ''}
   <div class="row" style="margin-top:14px">${fb ? `<button class="btn" data-ie="aisave" data-id="${esc(id)}">Lưu và gửi cho học viên</button>` : ''}<button class="btn ghost" data-ie="airegrade" data-id="${esc(id)}">↻ Chấm lại bằng AI</button></div></div>`;
}
async function aiSave(id, btn) {
  const root = document.querySelector('[data-aied="' + id + '"]'); if (!root) return;
  const [who, ex, ix] = id.split('|'), x = S.ail.find(y => aiKey(y) === id); if (!x) return;
  const fb = { bands: {}, comments: {}, corrections: [] };
  CRIT[x.kind].forEach(([k]) => { fb.bands[k] = Number(root.querySelector('[data-aib="' + k + '"]').value); fb.comments[k] = root.querySelector('[data-aic="' + k + '"]').value; });
  fb.summary = root.querySelector('[data-ais]').value; fb.improved = root.querySelector('[data-aii]').value;
  fb.tips = root.querySelector('[data-ait]').value.split('\n').map(s => s.trim()).filter(Boolean);
  root.querySelectorAll('[data-aicr]').forEach(r => { if (r.querySelector('[data-aidel]').checked) return; fb.corrections.push({ quote: r.dataset.q, type: r.dataset.ty, fix: r.querySelector('[data-aifx]').value, note: r.querySelector('[data-aino]').value }); });
  btn.disabled = true;
  try { const r = await API.call('PUT', 'ai/edit/' + encodeURIComponent(who) + '/' + ex + '/' + ix, { fb }); Object.assign(x, r.entry); toast('Đã lưu. Học viên sẽ thấy bản chỉnh sửa của bạn.'); render(); }
  catch (e) { toast(e.message); btn.disabled = false; }
}
async function aiRegrade(id, btn) {
  const [who, ex, ix] = id.split('|'); if (!confirm('Chấm lại bài này bằng AI? Chỉnh sửa hiện tại sẽ bị thay.')) return;
  btn.disabled = true;
  try { await API.call('POST', 'ai/regrade/' + encodeURIComponent(who) + '/' + ex + '/' + ix, {}); toast('Đã gửi chấm lại. Danh sách sẽ tự tải lại sau khoảng 30 giây.'); S.ail = null; setTimeout(() => { S.ail = null; if (route() === 't-ai') render(); }, 30000); render(); }
  catch (e) { toast(e.message); btn.disabled = false; }
}

/* ---------- Sổ chỉnh sửa của học viên ---------- */
const NB = { items: null, loading: false, saveT: 0 };
function nbLoad() {
  if (NB.items || NB.loading || S.isT || S.local) return;
  NB.loading = true;
  API.call('GET', 'notes').then(r => { NB.items = r.items || []; NB.loading = false; if (route() === 'notes') render(); }).catch(() => { NB.items = []; NB.loading = false; });
}
function nbSave() {
  clearTimeout(NB.saveT);
  NB.saveT = setTimeout(() => { if (S.isT || S.local) return; API.call('PUT', 'notes', { items: NB.items }).catch(() => toast('Chưa lưu được sổ, hãy kiểm tra mạng.')); }, 600);
}
function nbAdd(btn) {
  if (!NB.items) { toast('Đang tải sổ, bạn bấm lại sau 1 giây nhé.'); nbLoad(); return; }
  const d = btn.dataset;
  if (NB.items.some(x => x.q === d.q && x.f === d.f)) { toast('Câu này đã có trong sổ.'); return; }
  NB.items.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), q: d.q, f: d.f, n: d.n || '', ty: d.ty || '', lb: d.lb || '', my: '', t: Date.now() });
  nbSave(); btn.textContent = '✔ Đã lưu vào sổ'; btn.disabled = true; toast('Đã lưu vào Sổ chỉnh sửa. Bạn có thể ghi chú thêm trong mục Sổ chỉnh sửa.');
}
function nbDel(id) {
  if (!NB.items || !confirm('Xóa mục này khỏi sổ?')) return;
  NB.items = NB.items.filter(x => x.id !== id); nbSave(); render();
}
window.notesView = function () {
  nbLoad();
  const L = NB.items;
  const body = !L ? '<p class="muted">Đang tải…</p>' : !L.length ? '<div class="card"><p>Sổ đang trống. Khi xem nhận xét bài Writing hoặc Speaking, bấm <b>📒 Lưu vào sổ</b> ở từng lỗi để lưu lại đây và ghi chú cho riêng bạn.</p></div>' :
    L.map(x => `<div class="card" style="margin-bottom:10px;padding:14px 18px">
      <div class="row"><span class="chip sky">${esc(x.ty || 'lỗi')}</span><span class="muted small">${esc(x.lb || '')}${x.t ? ' · ' + new Date(x.t).toLocaleDateString('vi-VN') : ''}</span><span class="sp"></span><button class="btn ghost sm" data-ie="nbdel" data-id="${esc(x.id)}">Xóa</button></div>
      <p style="margin:8px 0"><del>${esc(x.q)}</del> → <ins>${esc(x.f)}</ins></p>
      ${x.n ? `<div class="muted small" style="margin-bottom:8px">${esc(x.n)}</div>` : ''}
      <label class="small muted" for="nb-${esc(x.id)}">Ghi chú của bạn</label>
      <textarea id="nb-${esc(x.id)}" class="txt" rows="2" data-nbn="${esc(x.id)}" placeholder="Viết ghi chú để nhớ lỗi này…">${esc(x.my || '')}</textarea>
    </div>`).join('');
  return `<div class="wrap"><div class="sechead"><h2>📒 Sổ chỉnh sửa của tôi</h2>${L ? `<span class="chip">${L.length} mục</span>` : ''}</div><p class="muted">Lưu lại những chỗ thầy/cô sửa trong bài Writing và Speaking, rồi ghi chú để ôn lại.</p>${body}</div>`;
};
document.addEventListener('input', e => {
  const t = e.target; if (!t.dataset || t.dataset.nbn == null || !NB.items) return;
  const x = NB.items.find(z => z.id === t.dataset.nbn); if (x) { x.my = t.value.slice(0, 1000); nbSave(); }
});
