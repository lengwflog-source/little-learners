/* v36: Baby Dragon cho giáo viên / trợ giảng – bấm vào để chuyển nhanh đến các mục. Gỡ: bỏ link tdragon.css/tdragon.js trong index.html. */
"use strict";
(function(){
const LS='bd_hide_t1';
const on=()=>{try{return !!(S&&S.user&&S.isT)}catch(e){return false}};
const hid=()=>{try{return localStorage.getItem(LS)==='1'}catch(e){return false}};
const setHid=v=>{try{v?localStorage.setItem(LS,'1'):localStorage.removeItem(LS)}catch(e){}};
const items=()=>{
  const n=(typeof qaWait==='function')?qaWait():0;
  const L=[['t-home','🏠','Tổng quan'],['t-students','👩‍🎓','Học sinh'],['t-attendance','✅','Điểm danh'],['t-assign','📝','Giao bài'],['t-voice','🎙️','Bản thu âm'],['t-qa','💬','Giải đáp',n]];
  if(!S.isTA){L.push(['t-ai','🤖','Chấm IELTS'],['t-ta','🧑‍🏫','Trợ giảng'])}
  L.push(['lessons','📚','Bài học']);return L};
function menu(w){
  const old=document.querySelector('.bdtm');if(old){old.remove();return}
  const m=document.createElement('div');m.className='bdtm';m.setAttribute('role','menu');
  m.innerHTML='<div class="bdtt">Đi nhanh đến…</div>'+items().map(i=>`<button type="button" role="menuitem" data-go="${i[0]}"><span>${i[1]}</span><span>${i[2]}</span>${i[3]?`<i class="bdn">${i[3]}</i>`:''}</button>`).join('');
  document.body.appendChild(m);
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
  d.addEventListener('click',e=>{if(e.target.closest('.bdx')){e.stopPropagation();setHid(true);const m=document.querySelector('.bdtm');m&&m.remove();sync();return}
    const s=d.querySelector('svg');s.classList.remove('jump');void s.getBoundingClientRect();s.classList.add('jump');menu(d)});
  d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();menu(d)}});
  document.body.appendChild(d);
}
const _r=window.render||render;
render=function(){const x=_r.apply(this,arguments);try{sync()}catch(er){console.error(er)}return x};
addEventListener('hashchange',()=>{const m=document.querySelector('.bdtm');m&&m.remove()});
})();
