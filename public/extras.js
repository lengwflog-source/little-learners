/* v22: chuông thông báo (học sinh: bài mới giao + nhận xét; giáo viên/trợ giảng: học sinh vừa nộp bài) */
"use strict";
const BELL={open:false,snap:null,prev:-1};
const agoT=t=>{const m=Math.max(0,Math.round((Date.now()-t)/60000));if(m<1)return'vừa xong';if(m<60)return m+' phút trước';const h=Math.round(m/60);if(h<24)return h+' giờ trước';return Math.round(h/24)+' ngày trước'};
const asTime=a=>a.at||(()=>{const n=parseInt(a.id,36);return n>1.5e12&&n<4e12?n:0})();
function bellItems(){
  const out=[];if(!S.user)return{items:out,fresh:0};
  const now=Date.now(),seen=S.user.nseen||0;
  if(S.isT){
    const g={};
    Object.entries(S.all||{}).forEach(([uid,p])=>{Object.entries((p&&p.ex)||{}).forEach(([id,r])=>{
      if(!r||!r.t||now-r.t>7*864e5||!S.exL[id])return;const lid=S.exL[id],k=uid+'|'+lid;
      const x=g[k]=g[k]||{uid,name:p.name||uid,cls:p.cls||'',L:S.by[lid],n:0,c:0,q:0,t:0,fresh:0};
      x.n++;x.c+=r.c||0;x.q+=r.n||0;x.t=Math.max(x.t,r.t);if(r.t>seen)x.fresh++})});
    if(typeof QT!=='undefined')QT.list.filter(q=>q.st==='wait').slice(0,10).forEach(q=>out.push({fresh:q.rateAt>seen,t:q.rateAt||q.t,icon:'❓',title:`<b>${esc(q.name||q.user)}</b> cần thầy/cô giải đáp`,sub:`${esc(q.q.slice(0,70))} · ${agoT(q.rateAt||q.t)}`,go:'t-qa'}));
    Object.values(g).sort((a,b)=>b.t-a.t).slice(0,30).forEach(x=>out.push({fresh:x.fresh>0,t:x.t,icon:'✅',
      title:`<b>${esc(x.name)}</b>${x.cls?' ('+esc(x.cls)+')':''} đã nộp ${x.n} phần`,
      sub:`${esc(x.L.title)}${x.q?' · '+x.c+'/'+x.q+' câu đúng':''} · ${agoT(x.t)}`,sel:x.uid}))
  }else{
    const p=S.prof||{},td=today();
    myAssignments().forEach(a=>{const t=asTime(a);if(!t||now-t>21*864e5)return;const s=assignStat(p,a);
      out.push({fresh:t>seen&&s.pct<1,t,icon:'📘',title:`Bài mới được giao: <b>${esc(a.title)}</b>`,
        sub:`${s.done}/${s.total} ${a.ex&&a.ex.length?'phần':'bộ bài'}${a.due?' · hạn '+fmtD(a.due):''} · ${agoT(t)}`,go:asLink(p,a)})});
    const fg={};
    Object.entries(S.recs||{}).forEach(([k,m])=>{if(!hasFb(m)||!m.commentAt||now-m.commentAt>14*864e5)return;const eid=k.split(':')[0],gk=eid+'|'+fbKey(m);const g=fg[gk]||(fg[gk]={eid,m,n:0,keys:[],t:0,fresh:false});g.n++;g.keys.push(k);g.t=Math.max(g.t,m.commentAt);if(!m.seen)g.fresh=true});
    Object.values(fg).forEach(g=>out.push({fresh:g.fresh,t:g.t,icon:'💬',title:`Thầy/cô đã nhận xét: <b>${g.n>1?g.n+' bản thu':esc(g.m.label||'bản thu')}</b>`,sub:`${esc(exTitleOf(g.eid))} · ${agoT(g.t)}`,go:'ex-'+g.eid,keys:g.keys}));
    out.sort((a,b)=>b.t-a.t)
  }
  return{items:out,fresh:out.filter(x=>x.fresh).length}
}
const BELLSVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/></svg>';
function bellHtml(){
  if(!S.user)return'';const b=bellItems(),list=BELL.open?(BELL.snap||b.items):[];
  const panel=BELL.open?`<div class="bellp" role="dialog" aria-label="Thông báo"><div class="bellh"><b>Thông báo</b><span class="sp"></span><button type="button" class="bellx" data-bell="close" aria-label="Đóng">✕</button></div>${list.length?list.map(x=>`<button type="button" class="belli ${x.fresh?'new':''}" data-bell="go" ${x.sel?`data-bsel="${esc(x.sel)}"`:`data-bgo="${esc(x.go)}"`}><span class="bi">${x.icon}</span><span class="bt"><span>${x.title}</span><small>${x.sub}</small></span>${x.fresh?'<i class="dot"></i>':''}</button>`).join(''):`<p class="muted small" style="padding:14px 16px;margin:0">${S.isT?'Chưa có học sinh nào nộp bài trong 7 ngày qua.':'Chưa có thông báo mới. Khi thầy/cô giao bài hoặc nhận xét bài thu âm, chuông sẽ báo ở đây.'}</p>`}</div>`:'';
  return`<div class="bellw"><button type="button" id="bell-btn" class="bellb ${b.fresh?'ring':''}" data-bell="toggle" aria-label="Thông báo${b.fresh?', '+b.fresh+' tin mới':''}" aria-expanded="${BELL.open}">${BELLSVG}${b.fresh?`<span class="bn">${b.fresh>9?'9+':b.fresh}</span>`:''}</button>${panel}</div>`}
function refreshBell(){const el=document.querySelector('.bellw');if(el){el.outerHTML=bellHtml()}const b=bellItems();if(BELL.prev>=0&&b.fresh>BELL.prev&&!BELL.open)toast(S.isT?'🔔 Có học sinh vừa nộp bài':'🔔 Bạn có thông báo mới');BELL.prev=b.fresh}
function bellClose(){if(!BELL.open)return;BELL.open=false;BELL.snap=null;refreshBell()}
async function bellOpen(){
  const b=bellItems();BELL.open=true;BELL.snap=b.items;BELL.prev=0;refreshBell();
  try{const r=await API.call('PUT','notif/seen',{});S.user.nseen=r.nseen||Date.now()}catch(e){S.user.nseen=Date.now()}
  if(!S.isT){const keys=b.items.filter(x=>x.keys&&x.fresh).flatMap(x=>x.keys);if(keys.length){keys.forEach(k=>{if(S.recs[k])S.recs[k].seen=true});API.call('PUT','rec/seen',{keys}).catch(()=>{})}}
  const w=document.querySelector('.bellb');if(w){w.classList.remove('ring');const n=w.querySelector('.bn');if(n)n.remove()}BELL.prev=0}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-bell]');
  if(t){e.stopPropagation();const a=t.dataset.bell;
    if(a==='toggle'){BELL.open?bellClose():bellOpen();return}
    if(a==='close'){bellClose();return}
    if(a==='go'){const sel=t.dataset.bsel,go=t.dataset.bgo;bellClose();if(sel){S.sel=sel;if(location.hash==='#t-student')render();else location.hash='t-student'}else if(go){location.hash=go}return}}
  if(BELL.open&&!e.target.closest('.bellw'))bellClose()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')bellClose()});
setInterval(()=>{if(S.user&&!document.hidden)refreshBell()},60000);
