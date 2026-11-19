/* v31: Baby Dragon Q&A – học sinh hỏi bé rồng, đánh giá sao; dưới 3 sao thì báo thầy và thầy trả lời ngay trong khung chat.
   Dữ liệu Q&A tự xóa sau 48 giờ (máy chủ). Gỡ: bỏ link qa.css/qa.js trong index.html. */
"use strict";
/* Q&A chỉ mở cho Lớp 10, 11, 12 và IELTS (không áp dụng cho Lớp 2–9) */
const qaOn=()=>{try{return !S.isT&&[9,10,11,12].includes(Number(S.grade))}catch(e){return false}};
const QA={th:[],loaded:false,open:false,busy:false,tick:0,rmFor:'',rmT:0};
const QT={list:[],loaded:false,f:'wait',draft:{},busy:false};
const qaCtx=()=>{try{return typeof X!=='undefined'&&X&&X.E&&route().startsWith('ex-')?((X.L?X.L.title+' · ':'')+exTitle(X.E)):''}catch(e){return''}};
const qaStars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const qaTime=t=>{const d=new Date(t);return d.toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})};
const qaLeft=t=>{const h=Math.max(0,Math.ceil((t+48*3600*1000-Date.now())/3600000));return h>=1?'còn '+h+' giờ':'sắp xóa'};
const qaFmt=s=>esc(s).replace(/\n/g,'<br>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');

/* ---------- dữ liệu ---------- */
async function qaLoad(force){
  if(!S.user||S.isT)return;
  try{const r=await API.call('GET','qa/mine');QA.th=r.threads||[];QA.loaded=true}catch(e){}
  qaBadge();if(QA.open)qaPaint(false);
}
const qaNewReplies=()=>QA.th.filter(t=>t.st==='replied'&&!t.seen).length;
function qaBadge(){
  const w=document.querySelector('.bdw');if(!w)return;let b=w.querySelector('.bdbadge');const n=qaNewReplies();
  if(n&&!b){b=document.createElement('span');b.className='bdbadge';w.appendChild(b)}
  if(b){if(n)b.textContent=n;else b.remove()}
}

/* ---------- menu khi bấm vào bé rồng ---------- */
window.bdMenu=function(anchor){
  if(!qaOn()){if(typeof window.bdStart==='function')window.bdStart();return}
  const old=document.querySelector('.bdmenu');if(old){old.remove();return}
  const m=document.createElement('div');m.className='bdmenu';m.setAttribute('role','menu');
  const n=qaNewReplies();
  m.innerHTML=`<button type="button" role="menuitem" data-bm="guide">📖 <span>Hướng dẫn</span></button><button type="button" role="menuitem" data-bm="qa">💬 <span>Q&amp;A – hỏi Baby Dragon</span>${n?`<i class="bdn">${n}</i>`:''}</button>`;
  document.body.appendChild(m);
  const off=ev=>{if(ev.target.closest('.bdmenu'))return;m.remove();document.removeEventListener('click',off,true)};
  setTimeout(()=>document.addEventListener('click',off,true),0);
  m.addEventListener('click',e=>{const b=e.target.closest('[data-bm]');if(!b)return;e.stopPropagation();m.remove();document.removeEventListener('click',off,true);
    if(b.dataset.bm==='qa')qaOpen();else if(typeof window.bdStart==='function')window.bdStart()});
};

/* ---------- khung Q&A của học sinh ---------- */
function qaOpen(){
  if(!qaOn())return;
  const rm=document.querySelector('.bdqa');rm&&rm.remove();
  let p=document.getElementById('qap');if(p){p.remove()}
  QA.open=true;
  p=document.createElement('div');p.id='qap';p.className='qap';p.setAttribute('role','dialog');p.setAttribute('aria-label','Hỏi đáp với Baby Dragon');
  p.innerHTML=`<div class="qah"><span class="qadg">${typeof bdSVG==='function'?bdSVG('wave').replace('viewBox="0 0 220 226"','viewBox="40 8 140 120"'):'🐲'}</span><div><b>Q&amp;A · Baby Dragon</b><small>Trợ lý của Mr. Phi Long</small></div><span class="sp"></span><button type="button" class="qax" data-qa="close" aria-label="Đóng">✕</button></div>
  <div class="qal" id="qal" aria-live="polite"></div>
  <form class="qaf" id="qaf"><textarea id="qaq" rows="2" maxlength="500" placeholder="Bạn muốn hỏi gì? Ví dụ: Khi nào dùng thì hiện tại hoàn thành?"></textarea><button type="submit" class="btn" id="qas">Gửi</button></form>
  <div class="qan">Tin nhắn trong Q&amp;A sẽ tự xóa sau 48 giờ.</div>`;
  document.body.appendChild(p);
  document.body.classList.add('qa-open');
  qaPaint(true);
  qaLoad().then(()=>{qaMarkSeen()});
  const f=p.querySelector('#qaf');
  f.addEventListener('submit',e=>{e.preventDefault();qaAsk()});
  f.querySelector('textarea').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();qaAsk()}});
  setTimeout(()=>{const q=document.getElementById('qaq');q&&q.focus({preventScroll:true})},120);
  clearInterval(QA.tick);QA.tick=setInterval(()=>{if(QA.open&&!document.hidden&&QA.th.some(t=>t.st==='wait'))qaLoad()},20000);
}
function qaClose(){const p=document.getElementById('qap');p&&p.remove();QA.open=false;document.body.classList.remove('qa-open');clearInterval(QA.tick)}
function qaMarkSeen(){
  if(!QA.open)return;
  if(QA.th.some(t=>t.st==='replied'&&!t.seen)){setTimeout(()=>{if(!QA.open)return;QA.th.forEach(t=>{if(t.st==='replied')t.seen=true});API.call('PUT','qa/seen',{}).catch(()=>{});qaBadge()},1500)}
}
function qaPaint(scrollEnd){
  const L=document.getElementById('qal');if(!L)return;
  const atEnd=L.scrollHeight-L.scrollTop-L.clientHeight<60;
  let h='';
  if(!QA.th.length)h+=`<div class="qaem"><b>Xin chào ${esc(((S.user&&S.user.name)||'').split(' ').pop()||'bạn')}! 👋</b><span>Bạn đang thắc mắc về ngữ pháp, từ vựng hay một câu hỏi trong bài? Hãy gõ câu hỏi ở dưới, mình sẽ giải thích ngay!</span></div>`;
  h+=QA.th.map(t=>{
    let s=`<div class="qam me"><div class="qab">${esc(t.q)}</div></div>`;
    (t.msgs||[]).forEach(m=>{
      if(m.r==='ai')s+=`<div class="qam bot"><div class="qab"><b class="qaw">Baby Dragon</b>${qaFmt(m.x)}</div></div>`;
      else s+=`<div class="qam tch"><div class="qab"><b class="qaw">👨‍🏫 ${esc(m.by||'Thầy Long')}</b>${qaFmt(m.x)}</div></div>`;
    });
    if(t.pend)s+=`<div class="qam bot"><div class="qab qadots"><i></i><i></i><i></i></div></div>`;
    if(!t.rate&&!t.pend&&t.st!=='replied'){
      s+=`<div class="qar"><div>Bạn hiểu câu trả lời chưa?</div><div class="qastars" role="group" aria-label="Chọn số sao">${[1,2,3,4,5].map(n=>`<button type="button" data-qa="rate" data-id="${t.id}" data-n="${n}" aria-label="${n} sao">★<small>${n}</small></button>`).join('')}</div><small>1 = chưa hiểu · 5 = hiểu rồi</small></div>`;
    }else if(t.rate){
      s+=`<div class="qarr"><span class="qast">${qaStars(t.rate)}</span> ${t.st==='wait'?'Mình đã báo thầy Long. Thầy sẽ trả lời ngay tại đây nhé 🙏':(t.st==='replied'?'':'Hay quá, bạn đã hiểu rồi 🎉')}</div>`;
    }
    return `<div class="qat" data-id="${t.id}">${s}<div class="qatm">${qaTime(t.t)} · ${qaLeft(t.t)}</div></div>`}).join('');
  L.innerHTML=h;
  if(scrollEnd||atEnd)L.scrollTop=L.scrollHeight;
}
async function qaAsk(){
  if(QA.busy)return;const ta=document.getElementById('qaq');if(!ta)return;const q=ta.value.trim();if(q.length<2)return;
  QA.busy=true;const btn=document.getElementById('qas');btn&&(btn.disabled=true);
  const tmp={id:'tmp',t:Date.now(),q,msgs:[],pend:true,rate:0,st:'ai'};QA.th.push(tmp);ta.value='';qaPaint(true);
  try{const r=await API.call('POST','qa/ask',{q,ctx:qaCtx()});QA.th=QA.th.filter(x=>x!==tmp);QA.th.push(r.thread)}
  catch(e){QA.th=QA.th.filter(x=>x!==tmp);ta.value=q;toast(e.message||'Chưa gửi được, bạn thử lại nhé.')}
  QA.busy=false;btn&&(btn.disabled=false);qaPaint(true);
}
async function qaRate(id,n){
  const t=QA.th.find(x=>x.id===id);if(!t)return;t.rate=n;t.st=t.st==='replied'?'replied':(n<3?'wait':'done');qaPaint(true);
  try{const r=await API.call('POST','qa/rate',{id,stars:n});Object.assign(t,r.thread)}catch(e){toast(e.message||'Chưa lưu được đánh giá.')}
  qaPaint(true);
}

/* ---------- nhắc sau ~1 phút làm bài ---------- */
function qaRemind(){
  clearTimeout(QA.rmT);
  if(!qaOn()||!S.prof||S.cfg&&S.cfg.mascotOff)return;
  const r=route();if(!r.startsWith('ex-')||QA.rmFor===r)return;
  QA.rmT=setTimeout(()=>{
    if(route()!==r||QA.open||QA.rmFor===r||document.querySelector('.bdtour,.bdqa,.bdrm,#qap'))return;
    try{if(localStorage.getItem('bd_hide_v1')==='1')return}catch(e){}
    QA.rmFor=r;
    const h=document.createElement('div');h.className='bdqa';h.setAttribute('role','status');
    h.innerHTML=`<button type="button" class="bdrx" aria-label="Đóng" data-qa="rmx">✕</button><b>Bạn có câu hỏi gì không?</b><span>Nếu có thắc mắc, hãy nhấn vào phần <b>Q&amp;A</b> nhé!</span><button type="button" class="btn sm" data-qa="open">Mở Q&amp;A</button>`;
    document.body.appendChild(h);setTimeout(()=>h.isConnected&&h.remove(),14000);
  },60000);
}

/* ---------- giáo viên: mục Giải đáp ---------- */
const qaWait=()=>QT.list.filter(t=>t.st==='wait').length;
async function qaTLoad(){
  if(!S.isT)return;
  try{const r=await API.call('GET','qa/all');QT.list=r.threads||[];QT.loaded=true}catch(e){}
  qaTBadge();if(route()==='t-qa')qaTPaint();try{refreshBell()}catch(e){}
}
function qaTBadge(){
  const n=qaWait();document.querySelectorAll('.qbadge').forEach(b=>{b.textContent=n?n:'';b.hidden=!n});
}
const qaBadgeHtml=()=>{const n=qaWait();return` <span class="qbadge badge"${n?'':' hidden'}>${n||''}</span>`};
window.qaNavBadge=qaBadgeHtml;
function qaCard(t){
  const msgs=(t.msgs||[]).map(m=>m.r==='ai'?`<div class="qtm ai"><b>Baby Dragon</b>${qaFmt(m.x)}</div>`:`<div class="qtm tc"><b>${esc(m.by||'Giáo viên')}</b>${qaFmt(m.x)}<small>${qaTime(m.t)}</small></div>`).join('');
  const chip=t.st==='wait'?'<span class="qchip w">Cần trả lời</span>':t.st==='replied'?'<span class="qchip r">Đã trả lời</span>':t.rate?'<span class="qchip g">Hiểu rồi</span>':'<span class="qchip">Chưa đánh giá</span>';
  return `<div class="card qtc ${t.st==='wait'?'wait':''}" data-id="${t.id}"><div class="qth"><div><b>${esc(t.name||t.user)}</b>${t.cls?' <span class="muted">('+esc(t.cls)+')</span>':''}<div class="muted small">${qaTime(t.t)} · ${qaLeft(t.t)}${t.ctx?' · '+esc(t.ctx):''}</div></div><span class="sp"></span>${t.rate?`<span class="qast" title="Học sinh tự đánh giá mức hiểu">${qaStars(t.rate)}</span>`:''}${chip}</div>
   <div class="qtm st"><b>Câu hỏi</b>${esc(t.q)}</div>${msgs}
   <div class="qtr"><textarea rows="2" maxlength="1500" data-qd="${t.id}" placeholder="Trả lời cho ${esc((t.name||'').split(' ').pop()||'học sinh')}…">${esc(QT.draft[t.id]||'')}</textarea><button type="button" class="btn sm" data-qa="send" data-u="${esc(t.user)}" data-id="${t.id}">${t.st==='replied'?'Gửi thêm':'Gửi trả lời'}</button></div></div>`;
}
function qaTPaint(){
  const L=document.getElementById('qa-list');if(!L)return;
  document.querySelectorAll('#qa-list textarea[data-qd]').forEach(x=>{QT.draft[x.dataset.qd]=x.value});
  const w=qaWait(),list=QT.f==='wait'?QT.list.filter(t=>t.st==='wait'):QT.list;
  document.querySelectorAll('[data-qf]').forEach(b=>b.classList.toggle('on',b.dataset.qf===QT.f));
  const cw=document.getElementById('qa-cw');if(cw)cw.textContent=w;
  const ca=document.getElementById('qa-ca');if(ca)ca.textContent=QT.list.length;
  L.innerHTML=list.length?list.map(qaCard).join(''):`<div class="card" style="text-align:center;padding:34px"><div style="font-size:2rem">${QT.f==='wait'?'🎉':'💬'}</div><p class="muted">${QT.f==='wait'?'Không có câu hỏi nào đang chờ thầy trả lời.':'Chưa có lịch sử hỏi đáp trong 48 giờ qua.'}</p></div>`;
}
window.qaTeacherView=function(){
  if(!QT.loaded&&!QT.busy){QT.busy=true;qaTLoad().finally(()=>{QT.busy=false})}
  return `<div class="wrap" style="padding-block:28px 60px"><div class="eyebrow">Giải đáp</div><h1 style="margin:.1em 0 .2em">Hỏi – đáp của học sinh</h1>
  <p class="muted" style="max-width:62ch">Học sinh hỏi Baby Dragon rồi tự đánh giá mức hiểu từ 1 đến 5 sao. Dưới 3 sao thì câu hỏi hiện ở mục <b>Cần trả lời</b> để thầy/cô giải đáp ngay trong khung chat. Từ 3 sao trở lên không cần trả lời nhưng vẫn lưu ở <b>Tất cả</b> để xem lại. Toàn bộ dữ liệu tự xóa sau 48 giờ.</p>
  <div class="seg" style="margin:14px 0"><button type="button" class="${QT.f==='wait'?'on':''}" data-qf="wait">Cần trả lời (<span id="qa-cw">${qaWait()}</span>)</button><button type="button" class="${QT.f==='all'?'on':''}" data-qf="all">Tất cả (<span id="qa-ca">${QT.list.length}</span>)</button><button type="button" class="btn ghost sm" data-qa="reload" style="margin-left:8px">↻ Tải lại</button></div>
  <div id="qa-list" class="qalist">${QT.loaded?'':'<div class="sk"></div>'}</div></div>`;
};

/* ---------- sự kiện ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-qa],[data-qf]');if(!t)return;
  if(t.dataset.qf){QT.f=t.dataset.qf;qaTPaint();return}
  const a=t.dataset.qa;
  if(a==='close'){qaClose();return}
  if(a==='open'){const h=t.closest('.bdqa');h&&h.remove();qaOpen();return}
  if(a==='rmx'){const h=t.closest('.bdqa');h&&h.remove();return}
  if(a==='rate'){qaRate(t.dataset.id,+t.dataset.n);return}
  if(a==='reload'){qaTLoad();return}
  if(a==='send'){
    const id=t.dataset.id,box=document.querySelector('#qa-list textarea[data-qd="'+id+'"]'),text=box?box.value.trim():'';
    if(!text){toast('Hãy nhập nội dung trả lời.');return}
    t.disabled=true;
    API.call('POST','qa/reply',{user:t.dataset.u,id,text}).then(r=>{const i=QT.list.findIndex(x=>x.id===id&&x.user===t.dataset.u);if(i>=0)QT.list[i]=r.thread;delete QT.draft[id];qaTBadge();qaTPaint();toast('Đã gửi câu trả lời cho học sinh ✔');try{refreshBell()}catch(e){}})
      .catch(er=>{t.disabled=false;toast(er.message||'Chưa gửi được.')});
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&QA.open)qaClose()});

/* ---------- móc vào render ---------- */
const _qaR=window.render||render;
render=function(){
  const x=_qaR.apply(this,arguments);
  try{
    if(QA.open&&!qaOn())qaClose();
    if(S.user&&!S.isT){if(!QA.loaded&&!QA.busy2){QA.busy2=true;qaLoad()}qaRemind();qaBadge()}
    if(S.user&&S.isT){if(!QT.loaded&&!QT.busy&&route()!=='t-qa'){QT.busy=true;qaTLoad().finally(()=>{QT.busy=false})}if(route()==='t-qa')qaTPaint();qaTBadge()}
  }catch(er){console.error(er)}
  return x};
addEventListener('hashchange',()=>{const r=document.querySelector('.bdqa');r&&r.remove()});
setInterval(()=>{if(!S.user||document.hidden)return;if(S.isT)qaTLoad();else if(QA.th.some(t=>t.st==='wait')||!QA.loaded)qaLoad()},75000);
