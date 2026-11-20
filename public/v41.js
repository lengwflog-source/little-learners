/* v41: quay lại đúng vị trí, kéo thả cụm từ trong khung, tab WORDFORM. */
"use strict";
(function(){
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const N=s=>String(s||'').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim();

/* ---- quay lại đúng thẻ bài đang xem ---- */
let lastR='',lastLid='';
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('a.lcard[data-lid]');if(c)lastLid=c.dataset.lid},true);
const _r=window.render;
window.render=function(){
  _r.apply(this,arguments);
  try{
    const r=route();
    if(r.startsWith('lesson-'))lastLid=r.slice(7);
    else if(r.startsWith('ex-')){const id=r.slice(3).split('@')[0];if(S.exL&&S.exL[id])lastLid=S.exL[id]}
    if(r==='lessons'&&lastR!=='lessons'&&lastLid){const el=document.querySelector('a.lcard[data-lid="'+lastLid+'"]');if(el)requestAnimationFrame(()=>el.scrollIntoView({block:'center'}))}
    lastR=r;
    if(r.startsWith('ex-'))boxInit();
  }catch(err){console.error(err)}
};

/* ---- kéo thả cụm từ trong khung ---- */
let sel=null;
function boxInit(){
  document.querySelectorAll('.boxw span').forEach(s=>{s.draggable=true;s.tabIndex=0;s.setAttribute('role','button')});
  boxMark();
}
function boxMark(){
  const vals=new Set([...document.querySelectorAll('input.blank')].map(i=>N(i.value)).filter(Boolean));
  document.querySelectorAll('.boxw span').forEach(s=>{s.classList.toggle('used',vals.has(N(s.textContent)));s.classList.toggle('pick',sel===s)});
}
function fill(inp,txt){if(!inp||inp.disabled||inp.readOnly)return;inp.value=txt;inp.dispatchEvent(new Event('input',{bubbles:true}));sel=null;boxMark()}
document.addEventListener('dragstart',e=>{const s=e.target.closest&&e.target.closest('.boxw span');if(!s)return;e.dataTransfer.setData('text/plain',s.textContent);e.dataTransfer.effectAllowed='copy'});
document.addEventListener('dragover',e=>{const i=e.target.closest&&e.target.closest('input.blank');if(i&&!i.disabled&&document.querySelector('.boxw')){e.preventDefault();i.classList.add('dz')}});
document.addEventListener('dragleave',e=>{const i=e.target.closest&&e.target.closest('input.blank');if(i)i.classList.remove('dz')});
document.addEventListener('drop',e=>{const i=e.target.closest&&e.target.closest('input.blank');if(!i||!document.querySelector('.boxw'))return;e.preventDefault();i.classList.remove('dz');const t=e.dataTransfer.getData('text/plain');if(t)fill(i,t)});
document.addEventListener('click',e=>{
  const s=e.target.closest&&e.target.closest('.boxw span');
  if(s){sel=(sel===s)?null:s;boxMark();return}
  const i=e.target.closest&&e.target.closest('input.blank');
  if(i&&sel){fill(i,sel.textContent)}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.boxw span')){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{if(e.target.classList&&e.target.classList.contains('blank'))boxMark()});

/* ---- hộp xác nhận trong giao diện ---- */
window.askBox=function(msg,okLabel,icon){return new Promise(res=>{
  const o=document.createElement('div');o.className='askov';o.innerHTML=`<div class="askbox" role="dialog" aria-modal="true"><div class="askic">${icon||'❓'}</div><p>${E(msg)}</p><div class="askbt"><button type="button" class="btn ghost" data-a="0">Hủy</button><button type="button" class="btn" data-a="1">${E(okLabel||'Đồng ý')}</button></div></div>`;
  const done=v=>{o.remove();document.removeEventListener('keydown',kd);res(v)};const kd=e=>{if(e.key==='Escape')done(false)};
  o.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)done(b.dataset.a==='1');else if(e.target===o)done(false)});
  document.addEventListener('keydown',kd);document.body.appendChild(o);const b=o.querySelector('[data-a="1"]');b&&b.focus()})};

/* ---- WORDFORM ---- */
let W=null;const COLS=['Danh từ (N)','Động từ (V)','Tính từ (adj)','Trạng từ (adv)'];
addEventListener('hashchange',()=>{W=null});
window.wfView=function(L){
  const wf=L.wordform;if(!wf)return'';
  const tb=`<div class="tw"><table class="t wft"><thead><tr>${COLS.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${wf.rows.map(r=>`<tr>${r.map(c=>`<td>${c.map(x=>`<div><b>${E(x.en)}</b>${x.vi?`<span class="muted small"> · ${E(x.vi)}</span>`:''}</div>`).join('')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const rules=`<div class="exm"><b>📌 Cách chọn dạng từ</b><p><b>N</b>: a/an/the/sở hữu + (adj) + <b>N</b> · giới từ (in, on, of, for…) + <b>N</b> · some of / many of + <b>N số nhiều</b></p><p><b>V</b>: S + <b>V</b> · to + <b>V</b> · can/will/should + <b>V</b></p><p><b>adj</b>: a/an/the + <b>adj</b> + N · be/look/seem/feel + <b>adj</b></p><p><b>adv</b>: V + <b>adv</b> · <b>adv</b> + adj · <b>Adv</b>, S + V</p></div>`;
  let pr='';
  if(!W||W.lid!==L.id)pr=`<div class="card" style="margin-top:16px"><h3 style="margin-bottom:6px">✏️ Luyện tập WORDFORM</h3><p class="muted small" style="margin:0 0 12px">Mỗi lần bấm sẽ có bộ câu và thứ tự khác nhau (10–20 câu). Sau khi nộp có đáp án và công thức cho từng câu.</p><button class="btn" data-wf="start">Bắt đầu luyện tập</button></div>`;
  else{
    const done=W.done;let ok=0;
    pr=`<div class="card" style="margin-top:16px"><h3 style="margin-bottom:10px">✏️ Luyện tập WORDFORM · ${W.qs.length} câu</h3>${W.qs.map((q,i)=>{
      const parts=E(q.q).replace(/&lt;b&gt;/g,'<b>').replace(/&lt;\/b&gt;/g,'</b>').split('___');
      const v=W.ans[i]||'';let res='';
      if(done){const good=q.a.some(a=>N(a)===N(v));if(good)ok++;res=`<div class="wfres ${good?'ok':'bad'}">${good?'✔ Đúng':'✘ Sai'} · Đáp án: <b>${E(q.a[0])}</b><div class="wftip">${q.tip||''}</div></div>`}
      return`<div class="wfq"><span class="num">${i+1}</span><div>${parts[0]}<input class="blank wfi" data-wfi="${i}" value="${E(v)}" ${done?'disabled':''} autocomplete="off" autocapitalize="none" spellcheck="false">${parts.slice(1).join('___')}${res}</div></div>`}).join('')}
      <div class="row" style="margin-top:14px;gap:8px">${done?`<b>Kết quả: ${ok}/${W.qs.length}</b><span class="sp"></span><button class="btn" data-wf="start">Luyện bộ câu mới</button>`:`<button class="btn" data-wf="check">Nộp bài</button>`}</div></div>`}
  return`<div class="prose" style="margin-bottom:10px"><h3>Bảng WORDFORM</h3></div>${tb}${rules}${pr}`};
document.addEventListener('input',e=>{const i=e.target.dataset&&e.target.dataset.wfi;if(i!=null&&W)W.ans[+i]=e.target.value});
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-wf]');if(!b)return;
  const L=S.by[location.hash.replace('#lesson-','')];if(!L||!L.wordform)return;
  if(b.dataset.wf==='start'){
    const pool=L.wordform.pool||[],seen=new Set(),u=[];rnd(pool).forEach(q=>{if(!seen.has(q.q)){seen.add(q.q);u.push(q)}});
    const n=Math.min(u.length,Math.max(10,Math.min(20,L.wordform.rows.length*2)));
    W={lid:L.id,qs:u.slice(0,n),ans:[],done:false};
  }else if(b.dataset.wf==='check'&&W){W.done=true}
  render();
});
})();
