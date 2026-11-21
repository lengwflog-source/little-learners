/* Bài nối (matching) tương tác: chạm 2 ô để nối, hoặc kéo từ chấm tròn sang ô bên kia. Đường nối vẽ bằng SVG.
   Dữ liệu giữ nguyên: X.ans[i] = mảng chỉ số ô bên phải cho từng ô bên trái ('' = chưa nối). */
const MT = { sel: null, drag: null, supp: 0 };
const MT_COL = ['#d9534f', '#e08a1e', '#b89a00', '#3f9d5a', '#2a9aa8', '#3b7bd0', '#7a5cc8', '#c24f9c', '#7b8a3a', '#a0643c'];
const mtClean = (s) => String(s).replace(/^\s*(\d+|[a-fA-F])[.)]\s+/, '');
const mtHas = (v) => v !== '' && v != null && !isNaN(+v);
const mtMulti = (it) => new Set(it.a || []).size < (it.a || []).length;

function mtHtml(it, i, a, done, res) {
  a = Array.isArray(a) ? a : [];
  const sel = MT.sel && MT.sel.i === i ? MT.sel : null;
  const back = {}; // right j -> first left k that points to it
  it.left.forEach((_, k) => { if (mtHas(a[k]) && back[+a[k]] == null) back[+a[k]] = k; });
  const L = it.left.map((l, k) => {
    const has = mtHas(a[k]);
    const cls = ['mti', 'l', has ? 'has' : '', sel && sel.s === 'L' && sel.n === k ? 'sel' : '', done && res ? (res[k] ? 'ok' : 'bad') : ''].join(' ');
    const data = has ? ` data-to="${+a[k]}"` : '';
    const corr = done && res && !res[k] ? ` data-corr="${it.a[k]}"` : '';
    return `<div role="button" tabindex="${done ? -1 : 0}" class="${cls}" data-mt="${i}:L:${k}" style="--c:${MT_COL[k % MT_COL.length]}"${data}${corr} aria-label="Ô ${k + 1}${has ? ', đã nối với ' + L2[+a[k]] : ''}"><b class="mtn">${k + 1}</b><span class="mtx">${mtClean(l)}</span><i class="mth" data-mth="${i}:L:${k}"></i></div>`;
  }).join('');
  const R = it.right.map((r, j) => {
    const k = back[j];
    const has = k != null;
    const cls = ['mti', 'r', has ? 'has' : '', sel && sel.s === 'R' && sel.n === j ? 'sel' : '', done && res && has ? (res[k] ? 'ok' : 'bad') : ''].join(' ');
    return `<div role="button" tabindex="${done ? -1 : 0}" class="${cls}" data-mt="${i}:R:${j}" style="--c:${MT_COL[(has ? k : j) % MT_COL.length]}" aria-label="Ô ${L2[j]}"><i class="mth" data-mth="${i}:R:${j}"></i><b class="mtn">${L2[j]}</b><span class="mtx">${mtClean(r)}</span></div>`;
  }).join('');
  const n = a.filter(mtHas).length;
  const foot = done ? '' : `<div class="mtfoot"><span class="muted small">${sel ? 'Giờ chạm vào một ô ở <b>' + (sel.s === 'L' ? 'bên phải' : 'bên trái') + '</b> để nối.' : 'Chạm một ô, rồi chạm ô tương ứng bên kia · hoặc <b>kéo từ chấm tròn</b> sang ô cần nối · chạm ô đã nối để gỡ.'}</span><span class="chip">${n}/${it.left.length} đã nối</span>${n ? `<button type="button" class="btn ghost sm" data-mtreset="${i}">Nối lại từ đầu</button>` : ''}</div>`;
  return `<div class="mt${done ? ' fin' : ''}" data-mtbox="${i}"><svg class="mtsvg" aria-hidden="true"><g class="mtg"></g><path class="mtdrag" d=""/></svg><div class="mtc">${L}</div><div class="mtc">${R}</div></div>${foot}`;
}

function mtRefresh(i) {
  refreshItem(i);
  requestAnimationFrame(mtAll);
}

function mtLink(i, k, j) {
  const it = X.E.items[i];
  let a = Array.isArray(X.ans[i]) ? X.ans[i].slice() : [];
  while (a.length < it.left.length) a.push('');
  if (!mtMulti(it)) a = a.map((v) => (String(v) === String(j) ? '' : v));
  a[k] = j;
  X.ans[i] = a;
  MT.sel = null;
  if (window.SFX) SFX.pop();
  mtRefresh(i);
}

function mtUnlink(i, s, n) {
  const it = X.E.items[i];
  const a = (Array.isArray(X.ans[i]) ? X.ans[i] : []).slice();
  for (let k = 0; k < it.left.length; k++) if (s === 'L' ? k === n : String(a[k]) === String(n)) a[k] = '';
  X.ans[i] = a;
}

function mtTap(i, s, n) {
  if (!X || !X.E || X.checked) return;
  const it = X.E.items[i];
  if (!it || it.t !== 'match') return;
  const a = Array.isArray(X.ans[i]) ? X.ans[i] : [];
  const cur = MT.sel && MT.sel.i === i ? MT.sel : null;
  if (cur) {
    if (cur.s === s) {
      if (cur.n === n) MT.sel = null; // bỏ chọn
      else MT.sel = { i, s, n };
      return mtRefresh(i);
    }
    return mtLink(i, cur.s === 'L' ? cur.n : n, cur.s === 'L' ? n : cur.n);
  }
  const linked = s === 'L' ? mtHas(a[n]) : a.some((v) => mtHas(v) && +v === n);
  if (linked) mtUnlink(i, s, n); // chạm ô đã nối: gỡ nối và chọn lại ô đó
  MT.sel = { i, s, n };
  mtRefresh(i);
}

/* ----- vẽ đường nối ----- */
function mtCurve(p, q) {
  const dx = Math.max(28, Math.abs(q[0] - p[0]) * 0.45);
  return `M${p[0].toFixed(1)} ${p[1].toFixed(1)} C${(p[0] + dx).toFixed(1)} ${p[1].toFixed(1)},${(q[0] - dx).toFixed(1)} ${q[1].toFixed(1)},${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
}
function mtPt(box, i, s, n) {
  const h = box.querySelector(`[data-mth="${i}:${s}:${n}"]`);
  if (!h) return null;
  const b = box.getBoundingClientRect(), r = h.getBoundingClientRect();
  return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top];
}
function mtDraw(box) {
  const i = +box.dataset.mtbox;
  const svg = box.querySelector('.mtsvg');
  if (!svg) return;
  const b = box.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${Math.max(1, b.width)} ${Math.max(1, b.height)}`);
  let out = '';
  box.querySelectorAll('.mti.l').forEach((el) => {
    const k = +el.dataset.mt.split(':')[2];
    const ok = el.classList.contains('ok'), bad = el.classList.contains('bad');
    if (el.dataset.corr != null) { // đáp án đúng (nét đứt) khi nối sai
      const p = mtPt(box, i, 'L', k), q = mtPt(box, i, 'R', +el.dataset.corr);
      if (p && q) out += `<path class="mtl corr" d="${mtCurve(p, q)}"/>`;
    }
    if (el.dataset.to != null) {
      const p = mtPt(box, i, 'L', k), q = mtPt(box, i, 'R', +el.dataset.to);
      if (p && q) {
        const d = mtCurve(p, q);
        out += `<path class="mtl bg" d="${d}"/><path class="mtl ${ok ? 'ok' : bad ? 'bad' : ''}" d="${d}" style="--c:${MT_COL[k % MT_COL.length]}"/>`;
      }
    }
  });
  svg.querySelector('.mtg').innerHTML = out;
}
function mtAll() { document.querySelectorAll('#app .mt').forEach(mtDraw); }

/* ----- chạm / bàn phím ----- */
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') return;
  if (MT.supp > Date.now() && e.target.closest('.mt')) { e.preventDefault(); e.stopPropagation(); return; }
  const rs = e.target.closest('[data-mtreset]');
  if (rs && X && !X.checked) {
    const i = +rs.dataset.mtreset;
    X.ans[i] = []; MT.sel = null; mtRefresh(i);
    return;
  }
  const t = e.target.closest('[data-mt]');
  if (!t || t.closest('.mt.fin')) return;
  const [i, s, n] = t.dataset.mt.split(':');
  mtTap(+i, s, +n);
}, true);

document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.mti')) { e.preventDefault(); e.target.click(); }
});

/* ----- kéo thả: chuột kéo từ bất kỳ đâu trên ô; cảm ứng kéo từ chấm tròn (để vẫn cuộn trang được) ----- */
document.addEventListener('pointerdown', (e) => {
  const it = e.target.closest('[data-mt]');
  if (!it || !X || X.checked) return;
  MT.supp = 0;
  const onH = !!e.target.closest('.mth');
  if (e.pointerType === 'mouse' ? e.button !== 0 : !onH) return;
  const [i, s, n] = it.dataset.mt.split(':');
  const box = it.closest('.mt');
  MT.drag = { i: +i, s, n: +n, box, x: e.clientX, y: e.clientY, moved: false };
});
document.addEventListener('pointermove', (e) => {
  const d = MT.drag;
  if (!d) return;
  if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 7) return;
  if (!d.moved) {
    d.moved = true;
    d.box.classList.add('dragging');
    document.body.classList.add('mtdragging');
  }
  e.preventDefault();
  const p = mtPt(d.box, d.i, d.s, d.n);
  const b = d.box.getBoundingClientRect();
  const q = [e.clientX - b.left, e.clientY - b.top];
  const path = d.box.querySelector('.mtdrag');
  if (p && path) path.setAttribute('d', d.s === 'L' ? mtCurve(p, q) : mtCurve(q, p));
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const tg = el && el.closest('[data-mt]');
  d.box.querySelectorAll('.mti.hot').forEach((x) => x.classList.remove('hot'));
  if (tg && tg.closest('.mt') === d.box && tg.dataset.mt.split(':')[1] !== d.s) tg.classList.add('hot');
}, { passive: false });
function mtEndDrag(e, cancel) {
  const d = MT.drag;
  if (!d) return;
  MT.drag = null;
  document.body.classList.remove('mtdragging');
  d.box.classList.remove('dragging');
  d.box.querySelectorAll('.mti.hot').forEach((x) => x.classList.remove('hot'));
  const path = d.box.querySelector('.mtdrag');
  if (path) path.setAttribute('d', '');
  if (!d.moved || cancel) return;
  MT.supp = Date.now() + 350; // bỏ qua "click" sinh ra sau khi kéo
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const tg = el && el.closest('[data-mt]');
  if (!tg || tg.closest('.mt') !== d.box) return;
  const [i, s, n] = tg.dataset.mt.split(':');
  if (s === d.s) return;
  MT.sel = null;
  mtLink(d.i, d.s === 'L' ? d.n : +n, d.s === 'L' ? +n : d.n);
}
document.addEventListener('pointerup', (e) => mtEndDrag(e, false));
document.addEventListener('pointercancel', (e) => mtEndDrag(e, true));

/* ----- vẽ lại khi nội dung / kích thước thay đổi ----- */
let mtRaf = 0;
const mtSched = () => { if (!mtRaf) mtRaf = requestAnimationFrame(() => { mtRaf = 0; mtAll(); }); };
window.addEventListener('resize', mtSched);
window.addEventListener('orientationchange', mtSched);
document.addEventListener('load', mtSched, true); // ảnh tải xong làm đổi chiều cao
new MutationObserver((ms) => { if (ms.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1 && (n.matches('.mt,.item,.wrap,main') || n.querySelector('.mt'))))) mtSched(); })
  .observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(mtSched);
