/* v36: Baby Dragon cho giáo viên / trợ giảng – bấm vào để chuyển nhanh đến các mục. Gỡ: bỏ link tdragon.css/tdragon.js trong index.html. */
"use strict";
(function(){
const LS='bd_hide_t1';
const on=()=>{try{return !!(S&&S.user&&S.isT)}catch(e){return false}};
const hid=()=>{try{return localStorage.getItem(LS)==='1'}catch(e){return false}};
const setHid=v=>{try{v?localStorage.setItem(LS,'1'):localStorage.removeItem(LS)}catch(e){}};
const items=()=>{
  const n=(typeof qaWait==='function')?qaWait():0;
  const L=[['t-home','🏠','Tổng quan'],['t-students','👩‍🎓','Học sinh'],['t-attendance','✅','Điểm danh'],['t-assign','📝','Giao bài'],['t-chat','💬','Chat học viên'],['t-voice','🎙️','Bản thu âm'],['t-qa','💬','Giải đáp',n]];
  if(!S.isTA){L.push(['t-ai','🤖','Chấm IELTS'],['t-ew','✍️','Extra Writing'],['t-ta','🧑‍🏫','Trợ giảng'])}
  L.push(['lessons','📚','Bài học']);return L};
function menu(w){
  const old=document.querySelector('.bdtm');if(old){old.remove();return}
  const m=document.createElement('div');m.className='bdtm';m.setAttribute('role','menu');
  m.innerHTML='<div class="bdtt">Đi nhanh đến…</div>'+items().map(i=>`<button type="button" role="menuitem" data-go="${i[0]}"><span>${i[1]}</span><span>${i[2]}</span>${i[3]?`<i class="bdn">${i[3]}</i>`:''}</button>`).join('');
  document.body.appendChild(m);
  try{const r=w.getBoundingClientRect(),mw=m.offsetWidth||220,mh=Math.min(m.offsetHeight||300,innerHeight-16);
    let left=Math.max(8,Math.min(innerWidth-mw-8,r.left));
    let top=r.top-mh-8;if(top<8){top=Math.min(innerHeight-mh-8,r.bottom+8)}
    m.style.left=left+'px';m.style.top=Math.max(8,top)+'px';m.style.bottom='auto';m.style.maxHeight=(innerHeight-Math.max(8,top)-8)+'px'}catch(e){}
  const off=ev=>{if(ev.target.closest('.bdtm')||ev.target.closest('.bdtw'))return;m.remove();document.removeEventListener('click',off,true)};
  setTimeout(()=>document.addEventListener('click',off,true),0);
  m.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;m.remove();document.removeEventListener('click',off,true);location.hash='#'+b.dataset.go});
}
function sync(){
  const w=document.querySelector('.bdtw'),mini=document.querySelector('.bdtmini');
  if(!on()){w&&w.remove();mini&&mini.remove();const m=document.querySelector('.bdtm');m&&m.remove();return}
  if(hid()){w&&w.remove();if(!mini){const b=document.createElement('button');b.type='button';b.className='bdtmini';b.setAttribute('aria-label','Hiện Baby Dragon');b.innerHTML=bdSVG('stand').replace('viewBox="0 0 220 226"','viewBox="40 8 140 120"');b.onclick=()=>{setHid(false);sync()};document.body.appendChild(b)}return}
  mini&&mini.remove();
  if(w)return;
  const d=document.createElement('div');d.className='bdtw';d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label','Baby Dragon – bấm để đi nhanh đến các mục');
  d.innerHTML=bdSVG('wave')+'<button type="button" class="bdx" aria-label="Ẩn Baby Dragon" title="Ẩn rồng">✕</button>';
  d.addEventListener('click',e=>{if(moved)return;if(e.target.closest('.bdx')){e.stopPropagation();setHid(true);const m=document.querySelector('.bdtm');m&&m.remove();sync();return}
    const s=d.querySelector('svg');s.classList.remove('jump');void s.getBoundingClientRect();s.classList.add('jump');menu(d)});
  d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();menu(d)}});
  document.body.appendChild(d);
  place(d);dragify(d);
}
const PK='bd_pos_t1';
function loadPos(){try{const v=JSON.parse(localStorage.getItem(PK)||'null');return v&&typeof v.x==='number'?v:null}catch(e){return null}}
function place(d){const p=loadPos();if(!p)return;clampTo(d,p.x,p.y)}
function clampTo(d,x,y){const w=d.offsetWidth||84,h=d.offsetHeight||84;x=Math.max(0,Math.min(innerWidth-w,x));y=Math.max(0,Math.min(innerHeight-h,y));d.style.left=x+'px';d.style.top=y+'px';d.style.bottom='auto'}
var moved=false;
function dragify(d){
  let st=null;
  d.style.touchAction='none';
  d.addEventListener('pointerdown',e=>{if(e.target.closest('.bdx'))return;const r=d.getBoundingClientRect();st={sx:e.clientX,sy:e.clientY,ox:r.left,oy:r.top,on:false,id:e.pointerId}});
  d.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.sx,dy=e.clientY-st.sy;
    if(!st.on&&Math.hypot(dx,dy)>6){st.on=true;try{d.setPointerCapture(st.id)}catch(_){}d.classList.add('bdtdrag');const m=document.querySelector('.bdtm');m&&m.remove()}
    if(st.on){e.preventDefault();clampTo(d,st.ox+dx,st.oy+dy)}});
  const end=()=>{if(!st)return;if(st.on){moved=true;setTimeout(()=>{moved=false},0);d.classList.remove('bdtdrag');const r=d.getBoundingClientRect();try{localStorage.setItem(PK,JSON.stringify({x:Math.round(r.left),y:Math.round(r.top)}))}catch(e){}}st=null};
  d.addEventListener('pointerup',end);d.addEventListener('pointercancel',end);
  d.addEventListener('click',e=>{if(moved){e.stopImmediatePropagation();e.preventDefault()}},true);
}
addEventListener('resize',()=>{const d=document.querySelector('.bdtw');if(d&&loadPos())place(d)});
const _r=window.render||render;
render=function(){const x=_r.apply(this,arguments);try{sync()}catch(er){console.error(er)}return x};
addEventListener('hashchange',()=>{const m=document.querySelector('.bdtm');m&&m.remove()});
})();
