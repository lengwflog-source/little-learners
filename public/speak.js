/* Chấm phát âm cho bài Listen and repeat / Speaking cards (lớp 2-5).
   Dùng nhận dạng giọng nói của trình duyệt: KHÔNG lưu file âm thanh. Mỗi bé chỉ đọc 1 lần cho mỗi mục.
   Kết quả (điểm 50-100%) lưu 30 ngày để giáo viên xem rồi tự xóa. */
(function(){
const GR=[2,3,4,5,8];
const spOn=()=>!S.isT&&!!S.user&&GR.includes(Number(S.grade));
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
window.SPK=window.SPK||{};let LIVE=null,LOADED=false;
const norm=s=>String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
const wsim=(a,b)=>{const L=Math.max(a.length,b.length);return L?1-lev(a,b)/L:0};
function sim(target,heard){const T=norm(target).split(' ').filter(Boolean),H=norm(heard).split(' ').filter(Boolean);if(!T.length||!H.length)return 0;
  let tot=0;T.forEach(t=>{let best=0;H.forEach(h=>{best=Math.max(best,wsim(t,h))});tot+=best>=.5?best:best*.5});let r=tot/T.length;
  if(H.length>T.length+2)r*=.9;return r}
function score(targets,alts){let best=0;alts.forEach(a=>{const conf=a.c>0?a.c:.8;targets.forEach(t=>{const s=sim(t,a.t)*(0.8+0.2*Math.min(1,conf+0.15));if(s>best)best=s})});return Math.round(50+50*Math.min(1,best))}
const label=s=>s>=85?['Chuẩn','good','✅']:s>=70?['Khá tốt','warn','👍']:['Cần luyện thêm','bad','💪'];
async function load(){if(!S.user||S.isT)return;try{const r=await API.call('GET','speak/mine');window.SPK=r.r||{};LOADED=true}catch(e){}}
function keyOf(i){return X&&X.E?X.E.id+':'+i:''}
function targetsOf(it){return it.t==='card'?[it.w,it.s].filter(Boolean):[it.w]}
function ui(it,i){const k=keyOf(i);const r=window.SPK[k];
  if(r){const l=label(r.s);return`<div class="spk" data-spk="${k}"><span class="chip ${l[1]}">🎤 Phát âm ${r.s}% · ${l[0]} ${l[2]}</span>${r.h?`<span class="small muted">Máy nghe: “${esc(r.h)}”</span>`:''}<span class="small muted">Mỗi bé chỉ đọc 1 lần.</span></div>`}
  if(!SR)return`<div class="spk small muted">🎤 Thiết bị này chưa hỗ trợ chấm giọng nói. Hãy dùng Chrome (Android) hoặc Safari (iPhone).</div>`;
  const on=window.SPKON===k;
  return`<div class="spk" data-spk="${k}"><button class="btn sm ${on?'rec-on':''}" data-spkgo="${i}" ${window.SPKON&&!on?'disabled':''}>${on?'● Đang nghe… hãy đọc to':'🎤 Đọc thử (chỉ 1 lần)'}</button><span class="small muted">Nghe mẫu ♪ trước, rồi đọc to. Điểm 50–100%.</span></div>`}
const _ih=window.itemHtml;
if(typeof _ih==='function'){window.itemHtml=function(it,i,...rest){let out=_ih.call(this,it,i,...rest);
  if(spOn()&&it&&(it.t==='say'||it.t==='card')&&typeof out==='string'&&out.lastIndexOf('</div>')>-1&&!/data-spk=/.test(out)){const j=out.lastIndexOf('</div>');out=out.slice(0,j)+ui(it,i)+out.slice(j)}return out}}
function repaint(i){try{refreshItem(i)}catch(e){render()}}
function start(i){const it=X&&X.E&&X.E.items[i];if(!it||window.SPKON)return;const k=keyOf(i);if(window.SPK[k])return;
  if(!SR){toast('Thiết bị chưa hỗ trợ chấm giọng nói.');return}
  const rc=new SR();rc.lang='en-US';rc.interimResults=false;rc.maxAlternatives=5;rc.continuous=false;
  window.SPKON=k;let got=false;repaint(i);
  const stop=()=>{window.SPKON=null;repaint(i)};
  rc.onresult=async ev=>{got=true;const res=ev.results[0];const alts=[];for(let a=0;a<res.length;a++)alts.push({t:res[a].transcript,c:res[a].confidence});
    const sc=score(targetsOf(it),alts);const heard=alts[0]?alts[0].t:'';
    try{const r=await API.call('POST','speak/result',{key:k,score:sc,heard,target:targetsOf(it)[0]});window.SPK[k]=r.rec}catch(e){window.SPK[k]={s:sc,h:heard,t:Date.now()};toast('Chưa lưu được kết quả lên máy chủ.')}
    try{window.SFX&&SFX.say(sc)}catch(e){}
    window.SPKON=null;repaint(i)};
  rc.onerror=ev=>{if(got)return;const m={'not-allowed':'Hãy cho phép dùng micro rồi bấm lại.','service-not-allowed':'Hãy cho phép dùng micro rồi bấm lại.','no-speech':'Chưa nghe thấy giọng. Bấm lại để thử (chưa tính lượt).','audio-capture':'Không tìm thấy micro.','network':'Cần có mạng để chấm giọng nói.'}[ev.error]||'Chưa nghe rõ, bấm lại để thử (chưa tính lượt).';toast(m);stop()};
  rc.onend=()=>{if(!got&&window.SPKON===k)stop()};
  try{rc.start()}catch(e){stop()}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-spkgo]');if(b){e.preventDefault();e.stopPropagation();start(+b.dataset.spkgo)}},true);
/* giáo viên xem kết quả */
async function loadAll(){try{const r=await API.call('GET','speak/all');LIVE={all:r.all||{},t:Date.now()}}catch(e){LIVE={all:{},t:Date.now()}}}
function tcard(){const u=S.sel;if(!LIVE||Date.now()-LIVE.t>60000){if(!window.SPKLD){window.SPKLD=1;loadAll().then(()=>{window.SPKLD=0;if(route()==='t-student')render()})}return''}
  const r=(LIVE.all||{})[u]||{};const rows=Object.entries(r).sort((a,b)=>b[1].t-a[1].t);
  const avg=rows.length?Math.round(rows.reduce((x,[,v])=>x+v.s,0)/rows.length):null;
  return`<div class="card" style="margin-block:12px"><div class="row"><div><b>🎤 Kết quả phát âm (30 ngày gần nhất)</b><div class="small muted">Bé đọc 1 lần/mục, không lưu file âm thanh. Kết quả tự xóa sau 30 ngày.</div></div><span class="sp"></span>${avg!=null?`<span class="chip ${label(avg)[1]}">TB ${avg}% · ${rows.length} mục</span>`:''}</div>${rows.length?`<div class="tw"><table class="t" style="min-width:0;margin-top:8px"><thead><tr><th>Từ / câu</th><th>Máy nghe</th><th>Điểm</th><th>Lúc</th></tr></thead><tbody>${rows.map(([k,v])=>{const l=label(v.s);return`<tr><td><b>${esc(v.w||k)}</b></td><td class="muted">${esc(v.h||'—')}</td><td><span class="chip ${l[1]}">${v.s}% ${l[2]}</span></td><td class="small muted">${fmtT(v.t)}</td></tr>`}).join('')}</tbody></table></div>`:'<p class="muted small" style="margin-top:8px">Chưa có bài đọc nào trong 30 ngày qua.</p>'}</div>`}
window.spkChip=function(E){if(!S.isT||!E||!E.items.some(it=>it.t==='say'||it.t==='card'))return'';
  if(!LIVE||Date.now()-LIVE.t>60000){if(!window.SPKLD){window.SPKLD=1;loadAll().then(()=>{window.SPKLD=0;if(route()==='t-student')render()})}return''}
  const r=(LIVE.all||{})[S.sel]||{};const v=[];E.items.forEach((it,i)=>{const x=r[E.id+':'+i];if(x)v.push(x.s)});
  const tot=E.items.filter(it=>it.t==='say'||it.t==='card').length;
  if(!v.length)return'<span class="chip">🎤 chưa đọc</span>';
  const avg=Math.round(v.reduce((a,b)=>a+b,0)/v.length);return`<span class="chip ${avg>=85?'good':avg>=70?'warn':'bad'}" title="Điểm phát âm trung bình do máy chấm">🎤 ${avg}% · ${v.length}/${tot} mục</span>`};
const _sd=window.studentDetail;
if(typeof _sd==='function'){window.studentDetail=function(){let out=_sd.apply(this,arguments);if(!S.isT||typeof out!=='string')return out;const c=tcard();if(!c)return out;const j=out.lastIndexOf('</div>');return j>-1?out.slice(0,j)+c+out.slice(j):out+c}}
const _r=window.render;
window.render=function(){if(!LOADED&&spOn())load().then(()=>{if(route().startsWith('ex-'))try{X&&X.E&&X.E.items.forEach((it,i)=>{if(it.t==='say'||it.t==='card')repaint(i)})}catch(e){}});return _r.apply(this,arguments)};
})();
