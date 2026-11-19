/* thpt.js — v24: thanh công cụ làm bài (bút highlight, dịch từ, cỡ chữ), bố cục chia đôi, kho từ vựng cá nhân (lớp 10-11-12) */
(function(){
'use strict';
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
const lsg=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lss=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const E_=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const touch=()=>window.matchMedia&&matchMedia('(pointer:coarse)').matches;

/* ---------- cỡ chữ ---------- */
const FS=[.85,.95,1,1.12,1.26,1.42,1.6];
let fsi=Number(lsg('ll-fs'));if(!(fsi>=0&&fsi<FS.length))fsi=2;
function applyFs(){document.documentElement.style.setProperty('--xfs',FS[fsi])}
applyFs();

/* ---------- trạng thái công cụ ---------- */
const TX={tr:false,pen:null};
const DK=['r','l','t'];let dock=lsg('ll-dock');if(!DK.includes(dock))dock='r';
const DKN={r:'Phải',l:'Trái',t:'Trên'};
const HL={};   // eid -> [{r,s,e,c}]
const hlKey=eid=>'ll-hl-'+(typeof S!=='undefined'&&S.uid||'x')+'-'+eid;
function hlGet(eid){if(!HL[eid]){let v=[];try{v=JSON.parse(lsg(hlKey(eid))||'[]')}catch(e){}HL[eid]=Array.isArray(v)?v:[]}return HL[eid]}
function hlSet(eid,v){HL[eid]=v;lss(hlKey(eid),JSON.stringify(v))}
const curEid=()=>(typeof X!=='undefined'&&X&&X.E)?X.E.id:null;

/* ---------- thanh công cụ ---------- */
const IC={
 pen:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5l5 5L9 20l-5.5 1 1-5.5z"/><path d="M12.5 6.5l5 5"/></svg>',
 tr:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h9M8.5 3v2M6 5c.6 3.2 2.6 5.6 5.5 7M12 5c-.7 3.6-3.4 6.4-7 7.6"/><path d="M13 20l4-9 4 9M14.4 17h5.2"/></svg>',
 era:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l5 5-10.5 10.5H6L3 15.5z"/><path d="M8 10l6 6M10 20h10"/></svg>'
};
window.xtb=function(){
  DK.forEach(d=>document.body.classList.toggle('x-dock-'+d,dock===d));
  const on=k=>TX.pen===k?' on':'';
  return `<div class="xtb" role="toolbar" aria-label="Công cụ làm bài">
   <div class="xgrp" title="Bút highlight"><button type="button" class="xb${TX.pen?' on':''}" data-xt="pen" aria-label="Bút highlight" aria-pressed="${!!TX.pen}">${IC.pen}<span class="xl">Bút</span></button>
    <button type="button" class="xdot dg${on('g')}" data-xt="hl-g" aria-label="Tô xanh lá" title="Tô màu xanh lá"></button>
    <button type="button" class="xdot dy${on('y')}" data-xt="hl-y" aria-label="Tô vàng" title="Tô màu vàng"></button>
    <button type="button" class="xb sm${on('x')}" data-xt="hl-x" aria-label="Xóa tô màu" title="Xóa tô màu">${IC.era}</button></div>
   <button type="button" class="xb${TX.tr?' on':''}" data-xt="tr" aria-pressed="${TX.tr}" title="Dịch từ">${IC.tr}<span class="xl">Dịch từ</span></button>
   <div class="xgrp" title="Cỡ chữ"><button type="button" class="xb sm" data-xt="fs-" aria-label="Giảm cỡ chữ"${fsi===0?' disabled':''}><b style="font-size:.85rem">A</b><i>▾</i></button><button type="button" class="xb sm" data-xt="fs+" aria-label="Tăng cỡ chữ"${fsi===FS.length-1?' disabled':''}><b style="font-size:1.15rem">A</b><i>▴</i></button></div>
   <button type="button" class="xb" data-xt="dock" title="Ghim thanh công cụ: Phải → Trái → Trên"><span aria-hidden="true">📌</span><span class="xl">${DKN[dock]}</span></button>
   <span class="xhint" id="xhint">${hint()}</span></div>`;
};
function hint(){
  if(TX.tr)return touch()?'Chạm một từ để xem nghĩa; nhấn giữ và kéo để dịch cả câu.':'Bấm vào một từ để xem nghĩa, hoặc bôi chọn cả câu/vùng để dịch. Muốn chọn đáp án, hãy tắt “Dịch từ”.';
  if(TX.pen==='x')return 'Bôi chọn hoặc chạm vào chỗ đã tô để xóa.';
  if(TX.pen)return touch()?'Nhấn giữ rồi kéo để chọn chữ, chữ sẽ được tô màu.':'Kéo chuột chọn chữ trong bài đọc hoặc đề để tô màu.';
  return '';
}
function syncBar(){
  const b=document.querySelector('.xtb');if(!b)return;
  b.outerHTML=xtb();
  document.body.classList.toggle('x-tr',TX.tr);
  DK.forEach(d=>document.body.classList.toggle('x-dock-'+d,dock===d));
  document.body.classList.toggle('x-pen',!!TX.pen);
}

document.addEventListener('click',e=>{
  const bt=e.target.closest&&e.target.closest('[data-xt]');
  if(bt){
    const k=bt.dataset.xt;
    if(k==='pen'){TX.pen=TX.pen?null:'g'}
    else if(k==='hl-g'||k==='hl-y'||k==='hl-x'){const c=k.slice(3);TX.pen=TX.pen===c?null:c}
    else if(k==='dock'){dock=DK[(DK.indexOf(dock)+1)%DK.length];lss('ll-dock',dock)}
    else if(k==='tr'){TX.tr=!TX.tr;if(TX.tr&&TX.pen)TX.pen=null;if(!TX.tr)hideTip()}
    else if(k==='fs-'||k==='fs+'){fsi=Math.max(0,Math.min(FS.length-1,fsi+(k==='fs+'?1:-1)));lss('ll-fs',String(fsi));applyFs()}
    if(k!=='tr'&&TX.pen&&TX.tr){TX.tr=false;hideTip()}
    syncBar();return;
  }
  const tp=e.target.closest&&e.target.closest('[data-xp]');
  if(tp){const sp=document.querySelector('.xsplit');if(sp){sp.dataset.pane=tp.dataset.xp;if(typeof X!=='undefined'&&X)X.pane=tp.dataset.xp;$$('.xtabs button').forEach(b=>b.classList.toggle('on',b===tp));if(tp.dataset.xp==='q')scrollTo({top:0,behavior:'instant'})}return}
},false);

/* ---------- highlight ---------- */
function rootOf(n){const el=n&&(n.nodeType===1?n:n.parentElement);return el&&el.closest?el.closest('[data-hr]'):null}
function offsetIn(root,node,off){const r=document.createRange();r.selectNodeContents(root);r.setEnd(node,off);return r.toString().length}
function textNodes(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);const a=[];let n;while((n=w.nextNode())){if(n.parentElement&&n.parentElement.closest('input,textarea,select,script,style'))continue;a.push(n)}return a}
function unwrapMarks(root){$$('mark.hl',root).forEach(m=>{const p=m.parentNode;while(m.firstChild)p.insertBefore(m.firstChild,m);p.removeChild(m);p.normalize()})}
function paint(root,list){
  unwrapMarks(root);
  const id=root.dataset.hr;const mine=list.filter(h=>h.r===id);if(!mine.length)return;
  mine.forEach(h=>{
    const nodes=textNodes(root);let pos=0;const segs=[];
    for(const n of nodes){const len=n.nodeValue.length;const a=Math.max(h.s,pos),b=Math.min(h.e,pos+len);if(b>a)segs.push([n,a-pos,b-pos]);pos+=len;if(pos>=h.e)break}
    segs.reverse().forEach(([n,a,b])=>{
      if(!n.nodeValue.slice(a,b).trim()){return}
      const mid=n.splitText(a);mid.splitText(b-a);
      const m=document.createElement('mark');m.className='hl hl-'+h.c;mid.parentNode.insertBefore(m,mid);m.appendChild(mid)})
  })
}
function paintAll(){
  const eid=curEid();if(!eid)return;
  const list=hlGet(eid);
  $$('.ex [data-hr]').forEach(r=>paint(r,list));
}
function cut(list,r,s,e){ // trừ khoảng [s,e) khỏi các đoạn cùng root
  const out=[];
  list.forEach(h=>{
    if(h.r!==r||h.e<=s||h.s>=e){out.push(h);return}
    if(h.s<s)out.push({r:h.r,s:h.s,e:s,c:h.c});
    if(h.e>e)out.push({r:h.r,s:e,e:h.e,c:h.c});
  });
  return out;
}
function applySelection(){
  if(!TX.pen)return;
  const sel=getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount)return;
  const rg=sel.getRangeAt(0);
  const r1=rootOf(rg.startContainer),r2=rootOf(rg.endContainer);
  if(!r1||!r2||r1!==r2||!r1.closest('.ex'))return;
  const s=offsetIn(r1,rg.startContainer,rg.startOffset),e=offsetIn(r1,rg.endContainer,rg.endOffset);
  if(e<=s)return;
  const eid=curEid();if(!eid)return;
  let list=cut(hlGet(eid),r1.dataset.hr,s,e);
  if(TX.pen!=='x')list.push({r:r1.dataset.hr,s,e,c:TX.pen});
  hlSet(eid,list);
  sel.removeAllRanges();
  paintAll();
}
let selT=0;
document.addEventListener('mouseup',e=>{if(TX.pen&&!touch())setTimeout(applySelection,0)});
document.addEventListener('selectionchange',()=>{if(!TX.pen||!touch())return;clearTimeout(selT);selT=setTimeout(applySelection,650)});
document.addEventListener('click',e=>{ // chạm vào chỗ đã tô khi đang ở chế độ xóa
  if(TX.pen!=='x')return;const m=e.target.closest&&e.target.closest('mark.hl');if(!m)return;
  const root=rootOf(m);if(!root)return;
  const r=document.createRange();r.selectNodeContents(m);
  const s=offsetIn(root,r.startContainer,r.startOffset),en=offsetIn(root,r.endContainer,r.endOffset);
  const eid=curEid();if(!eid)return;
  hlSet(eid,cut(hlGet(eid),root.dataset.hr,s,en));paintAll();
},true);

/* ---------- tra từ ---------- */
const POS={noun:'n.',verb:'v.',adjective:'adj.',adverb:'adv.',preposition:'prep.',conjunction:'conj.',pronoun:'pron.',interjection:'interj.',exclamation:'excl.',determiner:'det.',article:'art.',numeral:'num.',particle:'part.',abbreviation:'abbr.',prefix:'prefix','auxiliary verb':'aux.','modal verb':'modal',phrase:'phr.'};
const POSVI={'n.':'danh từ','v.':'động từ','adj.':'tính từ','adv.':'trạng từ','prep.':'giới từ','conj.':'liên từ','pron.':'đại từ','interj.':'thán từ','excl.':'thán từ','det.':'từ hạn định','art.':'mạo từ','num.':'số từ','part.':'tiểu từ','aux.':'trợ động từ','modal':'động từ khuyết thiếu','phr.':'cụm từ'};
const pa=p=>POS[String(p).toLowerCase()]||String(p).toLowerCase();
const TRC={};const TRP={};
function lookup(w){
  const k=w.toLowerCase();
  if(TRC[k])return Promise.resolve(TRC[k]);
  if(TRP[k])return TRP[k];
  let ss=null;try{ss=JSON.parse(sessionStorage.getItem('tr_'+k)||'null')}catch(e){}
  if(ss){TRC[k]=ss;return Promise.resolve(ss)}
  if(typeof S!=='undefined'&&S.local)return Promise.reject(new Error('Đang chạy thử không có máy chủ nên chưa tra được từ.'));
  TRP[k]=API.call('GET','tr?w='+encodeURIComponent(k)).then(r=>{TRC[k]=r;try{sessionStorage.setItem('tr_'+k,JSON.stringify(r))}catch(e){}delete TRP[k];return r}).catch(e=>{delete TRP[k];throw e});
  return TRP[k];
}
function caretAt(x,y){
  if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(x,y);return p?{n:p.offsetNode,o:p.offset}:null}
  if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(x,y);return r?{n:r.startContainer,o:r.startOffset}:null}
  return null;
}
const WCH=/[A-Za-z'’\-]/;
function wordAt(x,y){
  const c=caretAt(x,y);if(!c||!c.n||c.n.nodeType!==3)return null;
  const host=c.n.parentElement;if(!host||!host.closest('.ex'))return null;
  if(host.closest('.xtb,.actbar,button,input,textarea,select,summary,.say,.num,.L,.xtip,.xkey'))return null;
  const t=c.n.nodeValue;let a=Math.min(c.o,t.length),b=a;
  while(a>0&&WCH.test(t[a-1]))a--;while(b<t.length&&WCH.test(t[b]))b++;
  let w=t.slice(a,b);
  const lead=w.match(/^[-'’]+/);if(lead){a+=lead[0].length;w=w.slice(lead[0].length)}
  const tail=w.match(/[-'’]+$/);if(tail){b-=tail[0].length;w=w.slice(0,w.length-tail[0].length)}
  if(!/[A-Za-z]/.test(w)||w.length>38)return null;
  const r=document.createRange();r.setStart(c.n,a);r.setEnd(c.n,b);
  const rects=Array.from(r.getClientRects());
  const hit=rects.find(q=>x>=q.left-3&&x<=q.right+3&&y>=q.top-3&&y<=q.bottom+3);
  if(!hit)return null;
  let base=w.replace(/['’]s$/i,'');
  return{w:base,raw:w,rect:hit,node:c.n,a,b};
}
function context(node,w){
  const blk=node.parentElement&&node.parentElement.closest('p,li,.q,.opt,.ostem,.xg,.xd,td,div')||node.parentElement;
  let t=(blk?blk.textContent:'').replace(/\s+/g,' ').trim();
  if(!t)return'';
  const parts=t.split(/(?<=[.!?])\s+/);
  const re=new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
  let s=parts.find(p=>re.test(p))||parts[0]||t;
  s=s.replace(/^\d+\s*/,'').replace(/\s*_{3,}\s*/g,' … ');
  return s.length>240?s.slice(0,237)+'…':s;
}
let tip=null,tipFor=null;
function hideTip(){if(tip){tip.remove();tip=null}tipFor=null;const h=document.getElementById('xhover');if(h)h.style.display='none'}
function senses(r){return(r.items||[]).filter(i=>i.vi&&i.vi.length||i.en).map(i=>({pos:pa(i.pos),vi:(i.vi||[]).slice(0,4)}))}
function tipHtml(w,r,ctx,st){
  const ss=r?senses(r):[];
  let body='';
  if(st==='load')body='<div class="xl-load"><i></i><i></i><i></i> Đang tra từ…</div>';
  else if(st==='err')body='<div class="xerr">'+E_(r)+'</div><button type="button" class="btn sm ghost" data-xk="retry">Thử lại</button>';
  else{
    body='<div class="xmain">'+E_(r.vi||'')+'</div>';
    if(ss.length)body+='<div class="xsn">'+ss.map(s=>'<div><span class="xpos" title="'+E_(POSVI[s.pos]||'')+'">'+E_(s.pos)+'</span> '+(s.vi.length?E_(s.vi.join('; ')):'<span class="muted">'+E_(POSVI[s.pos]||'')+'</span>')+'</div>').join('')+'</div>';
    if(bankOK()){
      const have=VB.has(w);
      body+='<div class="xact">'+(have?'<span class="xok">✓ Đã có trong kho từ vựng</span> <a href="#vocab" class="xlink">Mở kho</a>':'<button type="button" class="btn sm" data-xk="add">＋ Thêm vào kho từ vựng</button>')+'</div>';
    }
  }
  return '<div class="xth"><b class="xw">'+E_(w)+'</b>'+(r&&r.ipa&&st==='ok'?'<span class="xipa">'+E_(r.ipa)+'</span>':'')+'<button type="button" class="say" data-say="'+E_(w)+'" aria-label="Nghe phát âm">♪</button><span class="sp"></span><button type="button" class="xcl" data-xk="close" aria-label="Đóng">×</button></div>'+body;
}
function placeTip(rect){
  if(!tip)return;
  if(innerWidth<=700){tip.style.left='8px';tip.style.right='8px';tip.style.top='auto';tip.style.bottom='8px';return}
  tip.style.right='auto';tip.style.bottom='auto';
  const W=Math.min(340,innerWidth-16);tip.style.width=W+'px';
  let l=rect.left+rect.width/2-W/2;l=Math.max(8,Math.min(innerWidth-W-8,l));
  const h=tip.offsetHeight||140;
  let t=rect.bottom+8;if(t+h>innerHeight-8)t=Math.max(8,rect.top-h-8);
  tip.style.left=l+'px';tip.style.top=t+'px';
}
function showTip(hit){
  const w=hit.w.toLowerCase();
  const ctx=context(hit.node,hit.raw);
  tipFor={w,ctx,rect:hit.rect};
  if(!tip){tip=document.createElement('div');tip.className='xtip';tip.setAttribute('role','dialog');tip.setAttribute('aria-label','Nghĩa của từ');document.body.appendChild(tip)}
  tip.innerHTML=tipHtml(w,null,ctx,'load');placeTip(hit.rect);
  runLookup(tipFor);
}
function runLookup(mine){
  const w=mine.w,ctx=mine.ctx,rect=mine.rect;
  lookup(w).then(r=>{if(tipFor!==mine||!tip)return;mine.r=r;tip.innerHTML=tipHtml(w,r,ctx,'ok');placeTip(rect)})
   .catch(e=>{if(tipFor!==mine||!tip)return;tip.innerHTML=tipHtml(w,e.message||'Không tra được từ này.','','err');placeTip(rect)});
}
document.addEventListener('click',e=>{
  if(!TX.tr)return;
  const t=e.target;
  if(t.closest&&t.closest('.xtip')){
    const k=t.closest('[data-xk]');
    if(k){const a=k.dataset.xk;
      if(a==='close')hideTip();
      else if(a==='retry'&&tipFor){tip.innerHTML=tipHtml(tipFor.w,null,'','load');runLookup(tipFor)}
      else if(a==='add'&&tipFor&&tipFor.r){VB.add(tipFor.w,tipFor.r,tipFor.ctx);tip.innerHTML=tipHtml(tipFor.w,tipFor.r,tipFor.ctx,'ok');placeTip(tipFor.rect);if(typeof toast==='function')toast('Đã thêm “'+tipFor.w+'” vào kho từ vựng')}
    }
    return;
  }
  if(t.closest&&t.closest('.xtb'))return;
  if(selPhrase()){e.preventDefault();e.stopPropagation();return}
  const hit=wordAt(e.clientX,e.clientY);
  if(!hit){hideTip();return}
  e.preventDefault();e.stopPropagation();
  showTip(hit);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tip)hideTip()});
// kính lúp khi rê chuột (máy tính)
let hv=0;
document.addEventListener('mousemove',e=>{
  if(!TX.tr||touch())return;
  if(hv)return;hv=requestAnimationFrame(()=>{hv=0;
    let h=document.getElementById('xhover');
    const hit=wordAt(e.clientX,e.clientY);
    if(!hit){if(h)h.style.display='none';return}
    if(!h){h=document.createElement('div');h.id='xhover';document.body.appendChild(h)}
    const r=hit.rect;h.style.cssText='display:block;left:'+(r.left-2)+'px;top:'+(r.top-1)+'px;width:'+(r.width+4)+'px;height:'+(r.height+2)+'px';
  })
});
addEventListener('scroll',()=>{if(tip&&tipFor&&innerWidth>700)hideTip()},{passive:true,capture:true});


/* ---------- dịch cả câu / vùng bôi chọn ---------- */
function selPhrase(){
  const sel=getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount)return null;
  const rg=sel.getRangeAt(0);const n=rg.commonAncestorContainer;const el=n.nodeType===1?n:n.parentElement;
  if(!el||!el.closest||!el.closest('.ex')||el.closest('.xtb,.xtip,.actbar,input,textarea,button'))return null;
  const t=sel.toString().replace(/\s+/g,' ').trim();
  if(t.length<3||!/[A-Za-z]/.test(t)||!/\s/.test(t))return null;
  return{t:t.slice(0,600),rect:rg.getBoundingClientRect()};
}
const TSC={};
function showPhrase(p){
  if(!tip){tip=document.createElement('div');tip.className='xtip';tip.setAttribute('role','dialog');tip.setAttribute('aria-label','Dịch câu');document.body.appendChild(tip)}
  const mine=tipFor={w:'',phrase:true,rect:p.rect};
  const draw=(vi,err)=>{if(tipFor!==mine||!tip)return;tip.innerHTML='<div class="xth"><b class="xw">Dịch câu</b><span class="sp"></span><button type="button" class="xb sm" data-xk="close" aria-label="Đóng">✕</button></div><div class="xmain" style="font-weight:600;color:var(--muted);margin-bottom:6px">'+E_(p.t)+'</div>'+(err?'<div class="xerr">'+E_(err)+'</div>':'<div class="xmain">'+E_(vi||'')+'</div>');placeTip(p.rect)};
  if(TSC[p.t]){draw(TSC[p.t]);return}
  tip.innerHTML='<div class="xl-load"><i></i><i></i><i></i> Đang dịch…</div>';placeTip(p.rect);
  if(typeof S!=='undefined'&&S.local){draw('', 'Đang chạy thử không có máy chủ nên chưa dịch được.');return}
  API.call('GET','trs?s='+encodeURIComponent(p.t)).then(r=>{TSC[p.t]=r.vi;draw(r.vi)}).catch(e=>draw('',e.message||'Không dịch được.'));
}
function onPhraseEnd(e){
  if(!TX.tr)return;
  if(e.target.closest&&e.target.closest('.xtip,.xtb'))return;
  setTimeout(()=>{const p=selPhrase();if(p)showPhrase(p)},60);
}
document.addEventListener('mouseup',onPhraseEnd);
document.addEventListener('touchend',onPhraseEnd);

/* ---------- phóng to ảnh ---------- */
document.addEventListener('click',e=>{
  const im=e.target;
  if(im&&im.tagName==='IMG'&&im.closest&&im.closest('.ex')&&!im.classList.contains('vp')&&!im.closest('.xtip')){
    if(TX.tr||TX.pen)return;
    const o=document.createElement('div');o.id='imgov';o.innerHTML='<img alt=""><button type="button" aria-label="Đóng">✕</button>';
    o.querySelector('img').src=im.currentSrc||im.src;o.addEventListener('click',()=>o.remove());document.body.appendChild(o);
    e.preventDefault();e.stopPropagation();
  }
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=document.getElementById('imgov');if(o)o.remove()}});

/* ---------- Kho từ vựng cá nhân ---------- */
const VB={words:null,loading:null,saveT:0,
  load(){
    if(VB.words)return Promise.resolve(VB.words);
    if(VB.loading)return VB.loading;
    VB.words=VB.words||[];
    if(typeof S==='undefined'||S.isT||S.local){return Promise.resolve(VB.words)}
    VB.loading=API.call('GET','vocab').then(r=>{VB.words=r.words||[];VB.loading=null;if(typeof route==='function'&&route()==='vocab')render();return VB.words}).catch(()=>{VB.loading=null;VB.failed=true;return VB.words});
    return VB.loading;
  },
  has(w){return !!(VB.words&&VB.words.some(x=>x.w===w.toLowerCase()))},
  add(w,r,ctx){
    w=w.toLowerCase();if(!VB.words)VB.words=[];if(VB.has(w))return;
    const ss=senses(r);
    const pos=ss.map(s=>s.pos).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4).join(', ');
    const vi=ss.length?ss.slice(0,4).map(s=>(s.vi.length?s.pos+' '+s.vi.slice(0,3).join(', '):'')).filter(Boolean).join(' · '):'';
    VB.words.unshift({w,pos,vi:(vi||r.vi||'').slice(0,200),ipa:r.ipa||'',ctx:ctx||'',t:Date.now(),g:(typeof S!=='undefined'&&S.grade)||0,k:0});
    if(!(r.vi&&VB.words[0].vi.indexOf(r.vi)>=0)&&r.vi)VB.words[0].vi=(r.vi+(VB.words[0].vi?' · '+VB.words[0].vi:'')).slice(0,200);
    VB.save();
  },
  save(){clearTimeout(VB.saveT);VB.saveT=setTimeout(()=>{if(typeof S==='undefined'||S.isT||S.local)return;API.call('PUT','vocab',{words:VB.words}).catch(()=>{if(typeof toast==='function')toast('Chưa lưu được kho từ vựng, hãy kiểm tra mạng.')})},500)},
  flush(){if(VB.saveT){clearTimeout(VB.saveT);VB.saveT=0;if(!(typeof S==='undefined'||S.isT||S.local))API.call('PUT','vocab',{words:VB.words}).catch(()=>{})}}
};
window.VB=VB;
addEventListener('pagehide',()=>VB.flush());
const VS={q:'',f:'all',card:null,quiz:null};
const dateS=t=>{const d=new Date(t);return d.getDate()+'/'+(d.getMonth()+1)};
window.vocabView=function(){
  if(!VB.words&&!VB.loading)VB.load();
  const all=VB.words||[];
  const q=VS.q.trim().toLowerCase();
  const list=all.filter(x=>(VS.f==='all'||(VS.f==='known'?x.k:!x.k))&&(!q||x.w.indexOf(q)>=0||(x.vi||'').toLowerCase().indexOf(q)>=0));
  const known=all.filter(x=>x.k).length;
  return`<div class="wrap" style="padding-block:28px"><div class="sechead"><div><div class="eyebrow">Cá nhân</div><h1 style="font-size:clamp(2rem,5vw,2.8rem)">Kho từ vựng của bạn</h1><p class="muted" style="margin:6px 0 0">Những từ bạn thêm bằng công cụ <b>Dịch từ</b> khi làm bài sẽ nằm ở đây để ôn lại.</p></div></div>
  <div class="vb-top"><div class="card vb-stat"><b>${all.length}</b><span>từ đã lưu</span></div><div class="card vb-stat"><b>${known}</b><span>đã thuộc</span></div>
   <div class="vb-tools"><input id="vb-q" class="sel-in" type="search" placeholder="Tìm từ hoặc nghĩa…" value="${E_(VS.q)}" aria-label="Tìm từ">
   <select id="vb-f" class="sel-in" aria-label="Lọc"><option value="all" ${VS.f==='all'?'selected':''}>Tất cả</option><option value="new" ${VS.f==='new'?'selected':''}>Chưa thuộc</option><option value="known" ${VS.f==='known'?'selected':''}>Đã thuộc</option></select>
   <button class="btn" data-vb="cards" ${all.length<1?'disabled':''}>🃏 Ôn bằng thẻ</button><button class="btn ghost" data-vb="quiz" ${all.length<4?'disabled title="Cần ít nhất 4 từ"':''}>📝 Kiểm tra nhanh</button></div></div>
  ${!VB.words&&VB.loading?'<div class="sk" style="margin-top:14px"></div>':!all.length?`<div class="card" style="margin-top:14px;text-align:center"><div style="font-size:2.2rem">📚</div><p><b>Kho từ vựng đang trống.</b></p><p class="muted">Vào một bài tập, bấm nút <b>Dịch từ</b> trên thanh công cụ, chạm vào từ chưa biết rồi bấm <b>Thêm vào kho từ vựng</b>.</p><a class="btn" href="#lessons">Đi làm bài</a></div>`:
  `<div class="vb-list">${list.map(x=>`<div class="card vb-item ${x.k?'known':''}"><div class="vb-h"><b class="vb-w">${E_(x.w)}</b>${x.ipa?`<span class="xipa">${E_(x.ipa)}</span>`:''}<button class="say" data-say="${E_(x.w)}" aria-label="Nghe">♪</button>${x.pos?`<span class="chip">${E_(x.pos)}</span>`:''}<span class="sp"></span><span class="muted small">${dateS(x.t)}</span></div>
   <div class="vb-vi">${E_(x.vi)}</div>${x.ctx?`<div class="vb-ctx">“${E_(x.ctx)}”</div>`:''}
   <div class="vb-act"><button class="btn sm ${x.k?'':'ghost'}" data-vb="known" data-w="${E_(x.w)}">${x.k?'✓ Đã thuộc':'Đánh dấu đã thuộc'}</button><button class="btn sm ghost" data-vb="del" data-w="${E_(x.w)}" aria-label="Xóa từ ${E_(x.w)}">Xóa</button></div></div>`).join('')||'<p class="muted">Không có từ nào khớp.</p>'}</div>`}</div>`;
};
function overlay(html){let o=document.getElementById('vbov');if(!o){o=document.createElement('div');o.id='vbov';o.className='vbov';document.body.appendChild(o)}o.innerHTML=html;return o}
function closeOv(){const o=document.getElementById('vbov');if(o)o.remove();VS.card=null;VS.quiz=null;if(typeof route==='function'&&route()==='vocab')render()}
function cardHtml(){
  const c=VS.card,w=c.deck[c.i];
  if(!w)return`<div class="vbbox"><h3>Xong rồi! 🎉</h3><p>Bạn đã ôn ${c.deck.length} từ. Đã thuộc <b>${c.ok}</b>, cần ôn thêm <b>${c.no}</b>.</p><div class="row" style="justify-content:center;gap:10px"><button class="btn" data-vb="close">Đóng</button></div></div>`;
  return`<div class="vbbox"><div class="vbp">${c.i+1} / ${c.deck.length}<button class="xcl" data-vb="close" aria-label="Đóng">×</button></div>
   <div class="vbcard ${c.flip?'flip':''}" data-vb="flip" role="button" tabindex="0"><div class="vbf"><b>${E_(w.w)}</b>${w.ipa?`<span class="xipa">${E_(w.ipa)}</span>`:''}<small>Chạm để xem nghĩa</small></div><div class="vbb"><div class="vb-vi">${E_(w.vi)}</div>${w.pos?`<span class="chip">${E_(w.pos)}</span>`:''}${w.ctx?`<div class="vb-ctx">“${E_(w.ctx)}”</div>`:''}</div></div>
   <div class="row" style="justify-content:center;gap:10px;margin-top:14px"><button class="say big" data-say="${E_(w.w)}" aria-label="Nghe">♪</button><button class="btn ghost" data-vb="no">Chưa thuộc</button><button class="btn" data-vb="ok">Đã thuộc</button></div></div>`;
}
function quizHtml(){
  const z=VS.quiz,q=z.qs[z.i];
  if(!q)return`<div class="vbbox"><h3>Kết quả: ${z.score}/${z.qs.length}</h3><p class="muted">${z.score===z.qs.length?'Tuyệt vời, bạn nhớ hết rồi!':'Những từ sai vẫn ở trong kho, hãy ôn thêm bằng thẻ nhé.'}</p><div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" data-vb="quiz">Làm lại</button><button class="btn" data-vb="close">Đóng</button></div></div>`;
  return`<div class="vbbox"><div class="vbp">Câu ${z.i+1} / ${z.qs.length}<button class="xcl" data-vb="close" aria-label="Đóng">×</button></div>
   <p style="margin:6px 0 4px" class="muted small">Chọn nghĩa đúng của từ:</p><div class="vbq"><b>${E_(q.w)}</b><button class="say" data-say="${E_(q.w)}" aria-label="Nghe">♪</button></div>
   <div class="opts">${q.opts.map((o,j)=>`<button type="button" class="opt vbo ${z.pick!=null?(j===q.a?'ok':(j===z.pick?'bad':'')):''}" data-vb="pick" data-j="${j}" ${z.pick!=null?'disabled':''}><span>${E_(o)}</span></button>`).join('')}</div>
   ${z.pick!=null?`<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" data-vb="next">${z.i+1<z.qs.length?'Câu tiếp':'Xem kết quả'}</button></div>`:''}</div>`;
}
const short=v=>String(v||'').split(' · ')[0].replace(/^[a-z.]+\s+(?=\S)/,'').split(',').slice(0,2).join(',').trim();
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
document.addEventListener('input',e=>{if(e.target.id==='vb-q'){VS.q=e.target.value;const p=e.target.selectionStart;render();const n=document.getElementById('vb-q');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(_){}}}});
document.addEventListener('change',e=>{if(e.target.id==='vb-f'){VS.f=e.target.value;render()}});
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-vb]');if(!b)return;
  const a=b.dataset.vb;const W=VB.words||[];
  if(a==='known'){const x=W.find(v=>v.w===b.dataset.w);if(x){x.k=x.k?0:1;VB.save();render()}}
  else if(a==='del'){if(confirm('Xóa từ “'+b.dataset.w+'” khỏi kho?')){VB.words=W.filter(v=>v.w!==b.dataset.w);VB.save();render()}}
  else if(a==='cards'){VS.card={deck:shuffle(W.filter(x=>!x.k).length?W.filter(x=>!x.k):W),i:0,flip:false,ok:0,no:0};overlay(cardHtml())}
  else if(a==='flip'&&VS.card){VS.card.flip=!VS.card.flip;overlay(cardHtml())}
  else if((a==='ok'||a==='no')&&VS.card){const w=VS.card.deck[VS.card.i];if(w){const x=W.find(v=>v.w===w.w);if(x)x.k=a==='ok'?1:0;VS.card[a]++;VB.save()}VS.card.i++;VS.card.flip=false;overlay(cardHtml())}
  else if(a==='quiz'){
    const pool=shuffle(W).slice(0,10);
    const qs=pool.map(w=>{const right=short(w.vi)||w.vi;const others=shuffle(W.filter(x=>x.w!==w.w).map(x=>short(x.vi)||x.vi).filter(v=>v&&v!==right)).slice(0,3);const opts=shuffle([right].concat(others));return{w:w.w,opts,a:opts.indexOf(right)}});
    VS.quiz={qs,i:0,score:0,pick:null};overlay(quizHtml())}
  else if(a==='pick'&&VS.quiz&&VS.quiz.pick==null){const z=VS.quiz;z.pick=+b.dataset.j;if(z.pick===z.qs[z.i].a)z.score++;overlay(quizHtml())}
  else if(a==='next'&&VS.quiz){VS.quiz.i++;VS.quiz.pick=null;overlay(quizHtml())}
  else if(a==='close')closeOv();
});

/* ---------- tổng kết đề ---------- */
window.examSummary=function(L,p){
  if(!p)return'';
  const ex=p.ex||{};let n=0,c=0,tot=0,done=0;
  L.exercises.forEach(E=>{tot+=E.items.length;const r=ex[E.id];if(r){done++;n+=r.n;c+=r.c}});
  if(!done)return`<div class="card exsum"><b>Bạn sẽ làm lần lượt từng phần.</b> <span class="muted">Nộp xong phần nào thì phần kế tiếp mới mở. Mỗi câu đều có lời giải chi tiết sau khi nộp.</span></div>`;
  const sc=tot?Math.round(c/tot*100)/10:0;
  return`<div class="card exsum"><div class="es-n"><b>${done}/${L.exercises.length}</b><span>phần đã nộp</span></div><div class="es-n"><b>${c}/${tot}</b><span>câu đúng</span></div><div class="es-n"><b>${done===L.exercises.length?sc.toFixed(1).replace('.0',''):'—'}</b><span>điểm /10${done===L.exercises.length?'':' (khi nộp đủ)'}</span></div></div>`;
};

/* ---------- gắn vào render ---------- */
const _render=window.render;
window.render=function(){
  _render.apply(this,arguments);
  try{
    document.body.classList.toggle('x-tr',TX.tr&&route().startsWith('ex-'));
    if(!route().startsWith('ex-')){if(tip)hideTip();TX.pen=TX.pen&&null}
    paintAll();
    if(bankOK()&&!VB.words&&!VB.loading)VB.load();
  }catch(e){console.error(e)}
};
addEventListener('hashchange',()=>{hideTip();VS.q=''});
})();
