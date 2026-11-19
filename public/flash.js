/* v38: Flashcard từ vựng cho mọi khối: thẻ lật, 6 kiểu game ôn, đánh dấu "đã thuộc" / "đặt câu được".
   Hình: ảnh có sẵn trong bài, hoặc emoji (emoji.json). Gỡ: bỏ link flash.css/flash.js trong index.html. */
"use strict";
(function(){
const FC={emoji:null,dk:null,dkG:null,u:'all',st:'all',q:'',lim:60,card:null,game:null};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strip=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const keyOf=en=>String(en||'').trim().toLowerCase().replace(/\s+/g,' ').slice(0,50);
const rnd=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
fetch('emoji.json').then(r=>r.ok?r.json():{}).then(j=>{FC.emoji=j;FC.dk=null;if(typeof route==='function'&&route()==='flash')render()}).catch(()=>{FC.emoji={}});
function emojiFor(w){const M=FC.emoji||{};let x=w.toLowerCase().trim();const c=[x,x.replace(/^to /,''),x.replace(/^(a|an|the) /,'')];
  c.slice().forEach(t=>{if(/s$/.test(t))c.push(t.slice(0,-1));if(/es$/.test(t))c.push(t.slice(0,-2));if(/ly$/.test(t))c.push(t.slice(0,-2));if(/ness$/.test(t))c.push(t.slice(0,-4));if(/ing$/.test(t)){c.push(t.slice(0,-3));c.push(t.slice(0,-3)+'e')}if(/ed$/.test(t)){c.push(t.slice(0,-2));c.push(t.slice(0,-1))}});
  for(const t of c)if(M[t])return M[t];return''}
function clean(v){
  let en=String(v.en||'').trim(),vi=String(v.vi||'').trim(),ipa=String(v.ipa||'').trim();
  if(!en||en.length>40||/[:=|+?]|[^\x00-ɏ’]/.test(en)||/^[^A-Za-z]/.test(en))return null;
  vi=vi.split('||')[0];
  const m=vi.match(/^\s*(\/[^\/]+\/)\s*(.*)$/);if(m){if(!ipa)ipa=m[1];vi=m[2]}
  vi=vi.replace(/^[\s\-–•.]+|[\s\-–•;,]+$/g,'').slice(0,70);
  if(vi.length<2||/^[\d\s]+$/.test(vi))return null;
  return{en,vi,ipa:ipa.replace(/\s+\//g,'/'),pos:String(v.pos||'').trim(),em:String(v.em||'')}}
function deck(){
  if(FC.dk&&FC.dkG===S.grade&&FC.emoji)return FC.dk;
  const out=[],seen=new Set();
  (S.lessons||[]).forEach(L=>{(L.vocab||[]).forEach(v=>{const x=clean(v);if(!x)return;const k=keyOf(x.en);if(seen.has(k))return;seen.add(k);
    let pic='';if(/<img/i.test(x.em))pic=x.em;else{const e=(x.em&&x.em.length<=8&&!/^\d+$/.test(x.em))?x.em:emojiFor(x.en);if(e)pic='<span class="fce">'+E(e)+'</span>'}
    out.push(Object.assign(x,{k,pic,lid:L.id,ut:(L.unitTitle||'')+(L.unitTitle?' · ':'')+L.title}))})});
  FC.dk=out;FC.dkG=S.grade;return out}
const get=k=>((S.prof&&S.prof.fc)||{})[k]|0;
function toggle(k,bit){if(!S.prof)return;S.prof.fc=S.prof.fc||{};const v=(S.prof.fc[k]|0)^bit;if(v)S.prof.fc[k]=v;else delete S.prof.fc[k];try{saveProf()}catch(e){}}
const units=()=>{const m=new Map();deck().forEach(w=>{if(!m.has(w.lid))m.set(w.lid,{id:w.lid,t:w.ut,n:0});m.get(w.lid).n++});return[...m.values()]};
function filt(){const q=strip(FC.q);return deck().filter(w=>(FC.u==='all'||w.lid===FC.u)&&(FC.st==='all'||(FC.st==='new'&&!(get(w.k)&1))||(FC.st==='known'&&(get(w.k)&1))||(FC.st==='nosent'&&!(get(w.k)&2)))&&(!q||strip(w.en).includes(q)||strip(w.vi).includes(q)))}
const tile=w=>w.pic||`<span class="fcl">${E(w.en.charAt(0).toUpperCase())}</span>`;

/* ---------- trang Flashcard ---------- */
window.flashView=function(){
  const D=deck(),L=filt();let kn=0,se=0;D.forEach(w=>{const b=get(w.k);if(b&1)kn++;if(b&2)se++});
  if(!D.length)return`<div class="wrap" style="padding-block:28px"><div class="sechead"><div><div class="eyebrow">Ôn từ vựng</div><h1 style="font-size:clamp(2rem,5vw,2.8rem)">Flashcard</h1></div></div><div class="card" style="text-align:center"><div style="font-size:2.2rem">🃏</div><p class="muted">Khối này chưa có từ vựng để làm flashcard.</p></div></div>`;
  const us=units();
  return`<div class="wrap" style="padding-block:28px"><div class="sechead"><div><div class="eyebrow">Ôn từ vựng</div><h1 style="font-size:clamp(2rem,5vw,2.8rem)">Flashcard</h1><p class="muted" style="margin:6px 0 0">Lật thẻ để học, chơi game để nhớ lâu. Đánh dấu <b>đã thuộc</b> và <b>đặt câu được</b> để theo dõi tiến bộ.</p></div></div>
  <div class="fc-top"><div class="card fc-stat"><b>${D.length}</b><span>từ</span></div><div class="card fc-stat"><b>${kn}</b><span>đã thuộc</span></div><div class="card fc-stat"><b>${se}</b><span>đặt câu được</span></div>
  <div class="fc-prog" role="img" aria-label="Đã thuộc ${kn}/${D.length}"><i style="width:${Math.round(100*kn/D.length)}%"></i></div></div>
  <div class="fc-tools"><select id="fc-u" class="sel-in" aria-label="Chọn bài">${'<option value="all">Tất cả các bài ('+D.length+' từ)</option>'+us.map(u=>`<option value="${E(u.id)}" ${FC.u===u.id?'selected':''}>${E(u.t)} (${u.n})</option>`).join('')}</select>
  <select id="fc-st" class="sel-in" aria-label="Lọc"><option value="all">Tất cả</option><option value="new" ${FC.st==='new'?'selected':''}>Chưa thuộc</option><option value="known" ${FC.st==='known'?'selected':''}>Đã thuộc</option><option value="nosent" ${FC.st==='nosent'?'selected':''}>Chưa đặt câu được</option></select>
  <input id="fc-q" class="sel-in" type="search" placeholder="Tìm từ hoặc nghĩa…" value="${E(FC.q)}" aria-label="Tìm từ"></div>
  <div class="fc-go"><button class="btn" data-fc="cards" ${L.length?'':'disabled'}>🃏 Lật thẻ (${L.length})</button>
  ${[['abcd','🔤 Trắc nghiệm ABCD'],['en2vi','🇬🇧→🇻🇳 Nhìn Anh chọn Việt'],['pic2vi','🖼️ Nhìn hình chọn nghĩa'],['type','⌨️ Nhìn chữ ghi nghĩa'],['pictype','✍️ Nhìn hình ghi nghĩa'],['listen','🎧 Nghe chọn từ'],['mix','🎲 Trộn']].map(g=>`<button class="btn ghost" data-fc="game" data-m="${g[0]}" ${L.length<4?'disabled':''}>${g[1]}</button>`).join('')}</div>
  <div class="fc-list">${L.slice(0,FC.lim).map(w=>{const b=get(w.k);return`<div class="card fc-item ${b&1?'known':''}"><div class="fc-pic">${tile(w)}</div><div class="fc-body"><div class="fc-h"><b>${E(w.en)}</b>${w.ipa?`<span class="xipa">${E(w.ipa)}</span>`:''}<button class="say" data-say="${E(w.en)}" aria-label="Nghe">♪</button>${w.pos?`<span class="chip">${E(w.pos)}</span>`:''}</div><div class="fc-vi">${E(w.vi)}</div>
  <div class="fc-act"><label class="fc-ck"><input type="checkbox" data-fck="1" data-k="${E(w.k)}" ${b&1?'checked':''}> Đã thuộc</label><label class="fc-ck"><input type="checkbox" data-fck="2" data-k="${E(w.k)}" ${b&2?'checked':''}> Đặt câu được ✍️</label></div></div></div>`}).join('')||'<p class="muted">Không có từ nào khớp.</p>'}</div>
  ${L.length>FC.lim?`<p style="text-align:center"><button class="btn ghost" data-fc="more">Hiện thêm (${L.length-FC.lim} từ)</button></p>`:''}</div>`};

/* ---------- lớp phủ: thẻ lật + game ---------- */
function ov(html){let o=document.getElementById('fcov');if(!o){o=document.createElement('div');o.id='fcov';o.className='fcov';o.setAttribute('role','dialog');document.body.appendChild(o);document.body.classList.add('fc-open')}o.innerHTML=html;return o}
function closeOv(){const o=document.getElementById('fcov');o&&o.remove();document.body.classList.remove('fc-open');FC.card=FC.game=null;if(typeof route==='function'&&route()==='flash')render()}
function cardPaint(){const c=FC.card,w=c.list[c.i];if(!w){ov(`<div class="fcbox"><button class="fcx" data-fc="close" aria-label="Đóng">✕</button><div class="fcend"><div style="font-size:2.6rem">🎉</div><h2>Xong ${c.list.length} thẻ!</h2><p class="muted">Đã thuộc: <b>${c.ok}</b> · Cần ôn thêm: <b>${c.no}</b></p><button class="btn" data-fc="close">Đóng</button></div></div>`);return}
  const b=get(w.k);
  ov(`<div class="fcbox"><button class="fcx" data-fc="close" aria-label="Đóng">✕</button><div class="fcn">${c.i+1} / ${c.list.length}</div>
  <div class="fcard ${c.flip?'flip':''}" data-fc="flip" tabindex="0" role="button" aria-label="Lật thẻ"><div class="fcf">${c.flip?`<div class="fcpic">${tile(w)}</div><div class="fcvi">${E(w.vi)}</div>${w.pos?`<span class="chip">${E(w.pos)}</span>`:''}`:`<div class="fcpic">${tile(w)}</div><div class="fcen">${E(w.en)}</div>${w.ipa?`<div class="xipa">${E(w.ipa)}</div>`:''}<small class="muted">Bấm để lật thẻ</small>`}</div></div>
  <div class="fcrow"><button class="btn ghost" data-say="${E(w.en)}">♪ Nghe</button><label class="fc-ck"><input type="checkbox" data-fck="2" data-k="${E(w.k)}" ${b&2?'checked':''}> Đặt câu được ✍️</label></div>
  <div class="fcrow"><button class="btn ghost" data-fc="prev" ${c.i?'':'disabled'}>← Trước</button><button class="btn ghost" data-fc="no">Chưa thuộc</button><button class="btn" data-fc="ok">✓ Đã thuộc</button></div></div>`)}
function startCards(){const L=filt();if(!L.length)return;const ord=L.slice().sort((a,b)=>((get(a.k)&1)-(get(b.k)&1))||Math.random()-.5).slice(0,40);FC.card={list:ord,i:0,flip:false,ok:0,no:0};cardPaint()}

const MODES={abcd:['en2vi','vi2en'],en2vi:['en2vi'],pic2vi:['pic2vi'],type:['type'],pictype:['pictype'],listen:['listen'],mix:['en2vi','vi2en','pic2vi','type','pictype','listen']};
function opts(w,L,field){const pool=rnd(L.filter(x=>x.k!==w.k&&strip(x[field])!==strip(w[field])));const same=pool.filter(x=>x.pos&&x.pos===w.pos);const pick=same.concat(pool.filter(x=>!same.includes(x))).slice(0,3);return rnd([w].concat(pick))}
function makeQ(w,type,D){
  const q={w,type};
  if(type==='en2vi'){q.opts=opts(w,D,'vi');q.f='vi'}
  else if(type==='vi2en'){q.opts=opts(w,D,'en');q.f='en'}
  else if(type==='pic2vi'){q.opts=opts(w,D,'vi');q.f='vi'}
  else if(type==='listen'){q.opts=opts(w,D,'en');q.f='en'}
  return q}
function startGame(mode){
  const D=deck(),L=filt();if(L.length<4)return;
  const types=MODES[mode]||MODES.abcd,withPic=L.filter(w=>w.pic).length>=4&&L.some(w=>w.pic);
  const base=L.slice().sort((a,b)=>((get(a.k)&1)-(get(b.k)&1))||Math.random()-.5).slice(0,10);
  const qs=base.map(w=>{let ts=types.filter(t=>(t!=='pic2vi'&&t!=='pictype')||w.pic);if(!ts.length)ts=['en2vi'];const t=ts[Math.floor(Math.random()*ts.length)];
    return makeQ(w,t,(t==='pic2vi'?D.filter(x=>x.pic||true):D))});
  FC.game={mode,qs,i:0,score:0,miss:[],okw:[],ans:null};gamePaint()}
function qHtml(q,g){
  const w=q.w;let prompt='';
  if(q.type==='en2vi')prompt=`<div class="gq-t">Nghĩa tiếng Việt của từ này là gì?</div><div class="gq-w">${E(w.en)} <button class="say" data-say="${E(w.en)}" aria-label="Nghe">♪</button></div>${w.ipa?`<div class="xipa">${E(w.ipa)}</div>`:''}`;
  else if(q.type==='vi2en')prompt=`<div class="gq-t">Từ tiếng Anh nào có nghĩa là:</div><div class="gq-w">${E(w.vi)}</div>`;
  else if(q.type==='pic2vi')prompt=`<div class="gq-t">Nhìn hình, chọn nghĩa đúng:</div><div class="gq-pic">${w.pic}</div>`;
  else if(q.type==='listen')prompt=`<div class="gq-t">Nghe và chọn từ đúng:</div><button class="btn gq-ear" data-say="${E(w.en)}">🎧 Nghe lại</button>`;
  else if(q.type==='type')prompt=`<div class="gq-t">Ghi nghĩa tiếng Việt của từ:</div><div class="gq-w">${E(w.en)} <button class="say" data-say="${E(w.en)}" aria-label="Nghe">♪</button></div>${w.ipa?`<div class="xipa">${E(w.ipa)}</div>`:''}`;
  else prompt=`<div class="gq-t">Nhìn hình, ghi nghĩa (tiếng Việt hoặc từ tiếng Anh):</div><div class="gq-pic">${w.pic}</div>`;
  let ans='';
  if(q.opts){ans='<div class="gq-o">'+q.opts.map((o,k)=>{const txt=o[q.f],cls=g.ans==null?'':(o.k===w.k?'ok':(g.ans===o.k?'bad':''));return`<button class="gq-b ${cls}" data-fc="pick" data-k="${E(o.k)}" ${g.ans!=null?'disabled':''}><b>${'ABCD'[k]}</b> ${E(txt)}</button>`}).join('')+'</div>'}
  else{ans=`<form class="gq-f" data-fc="typef"><input id="gq-i" class="sel-in" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Gõ đáp án…" ${g.ans!=null?'disabled value="'+E(g.typed||'')+'"':''}><button class="btn" type="submit" ${g.ans!=null?'disabled':''}>Kiểm tra</button></form>`}
  let fb='';if(g.ans!=null){const good=g.good;fb=`<div class="gq-fb ${good?'ok':'bad'}">${good?'✅ Chính xác!':'❌ Chưa đúng.'} <b>${E(w.en)}</b> = ${E(w.vi)}</div><button class="btn" data-fc="next">${g.i>=g.qs.length-1?'Xem kết quả':'Câu tiếp →'}</button>`}
  return prompt+ans+fb}
function gamePaint(){
  const g=FC.game;
  if(g.i>=g.qs.length){const n=g.qs.length;ov(`<div class="fcbox"><button class="fcx" data-fc="close" aria-label="Đóng">✕</button><div class="fcend"><div style="font-size:2.6rem">${g.score>=n*.8?'🏆':g.score>=n*.5?'👏':'💪'}</div><h2>${g.score}/${n} câu đúng</h2>${g.miss.length?`<p class="muted">Từ cần ôn lại:</p><ul class="fcmiss">${g.miss.map(w=>`<li><b>${E(w.en)}</b> — ${E(w.vi)} <button class="say" data-say="${E(w.en)}" aria-label="Nghe">♪</button></li>`).join('')}</ul>`:'<p class="muted">Bạn trả lời đúng hết! 🎉</p>'}
    <div class="fcrow">${g.okw.length?`<button class="btn ghost" data-fc="markok">✓ Đánh dấu ${g.okw.length} từ đúng là đã thuộc</button>`:''}<button class="btn" data-fc="again">Chơi lại</button><button class="btn ghost" data-fc="close">Đóng</button></div></div></div>`);return}
  const q=g.qs[g.i];
  ov(`<div class="fcbox"><button class="fcx" data-fc="close" aria-label="Đóng">✕</button><div class="fcn">Câu ${g.i+1}/${g.qs.length} · Điểm: ${g.score}</div><div class="fcprog"><i style="width:${Math.round(100*g.i/g.qs.length)}%"></i></div>${qHtml(q,g)}</div>`);
  if(q.type==='listen'&&g.ans==null&&!g.said){g.said=1;setTimeout(()=>{try{speechSynthesis.cancel();speechSynthesis.speak(mkUtt(q.w.en,false,.8))}catch(e){}},250)}
  const inp=document.getElementById('gq-i');if(inp&&g.ans==null)setTimeout(()=>inp.focus(),60)}
function judge(q,s){const a=strip(s);if(!a)return false;const en=strip(q.w.en);if(a===en)return true;if(q.type==='pictype'&&false)return false;
  const parts=q.w.vi.split(/[,;\/()]| hoặc /).map(strip).filter(x=>x.length>1);
  return parts.some(p=>p===a||(a.length>=3&&p.length>=3&&(p.includes(a)||a.includes(p))))}
function answer(good,typed){const g=FC.game,q=g.qs[g.i];g.good=good;g.typed=typed;g.ans=typed!=null?'typed':g.pickK;if(good){g.score++;g.okw.push(q.w)}else g.miss.push(q.w);gamePaint()}

/* ---------- sự kiện ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fc]');if(!b||b.tagName==='FORM')return;const a=b.dataset.fc;
  if(a==='cards')startCards();
  else if(a==='game')startGame(b.dataset.m);
  else if(a==='more'){FC.lim+=60;render()}
  else if(a==='close')closeOv();
  else if(a==='flip'){FC.card.flip=!FC.card.flip;cardPaint()}
  else if(a==='prev'){FC.card.i=Math.max(0,FC.card.i-1);FC.card.flip=false;cardPaint()}
  else if(a==='ok'||a==='no'){const w=FC.card.list[FC.card.i];if(w){const has=get(w.k)&1;if(a==='ok'&&!has)toggle(w.k,1);if(a==='no'&&has)toggle(w.k,1);FC.card[a]++}FC.card.i++;FC.card.flip=false;cardPaint()}
  else if(a==='pick'){const g=FC.game;if(g.ans!=null)return;g.pickK=b.dataset.k;answer(b.dataset.k===g.qs[g.i].w.k)}
  else if(a==='next'){const g=FC.game;g.i++;g.ans=null;g.said=0;gamePaint()}
  else if(a==='again')startGame(FC.game.mode);
  else if(a==='markok'){FC.game.okw.forEach(w=>{if(!(get(w.k)&1))toggle(w.k,1)});FC.game.okw=[];toast&&toast('Đã đánh dấu ✔');gamePaint()}
});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-fc="typef"]');if(!f)return;e.preventDefault();const g=FC.game;if(!g||g.ans!=null)return;const v=document.getElementById('gq-i').value;if(!v.trim())return;answer(judge(g.qs[g.i],v),v)});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.matches&&t.matches('[data-fck]')){toggle(t.dataset.k,+t.dataset.fck);if(!document.getElementById('fcov'))render();else if(FC.card){}return}
  if(t.id==='fc-u'){FC.u=t.value;FC.lim=60;render()}else if(t.id==='fc-st'){FC.st=t.value;FC.lim=60;render()}});
document.addEventListener('input',e=>{if(e.target.id==='fc-q'){FC.q=e.target.value;FC.lim=60;clearTimeout(FC.qt);FC.qt=setTimeout(()=>{render();const i=document.getElementById('fc-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('fcov'))closeOv()});
addEventListener('hashchange',()=>{if(document.getElementById('fcov'))closeOv()});

/* ---------- giáo viên: thống kê flashcard của học sinh ---------- */
const _sd=window.studentDetail;
if(typeof _sd==='function'){window.studentDetail=function(){const out=_sd.apply(this,arguments);if(!S.isT||typeof out!=='string')return out;const p=S.all[S.sel];const fc=(p&&p.fc)||{};const n=Object.keys(fc).length;if(!n)return out;
  let kn=0,se=0;Object.values(fc).forEach(v=>{if(v&1)kn++;if(v&2)se++});
  const c=`<section class="blk" style="padding-top:0"><div class="card"><h3 style="margin-bottom:6px">🃏 Flashcard từ vựng</h3><p class="muted" style="margin:0"><b>${kn}</b> từ đã thuộc · <b>${se}</b> từ đặt câu được</p></div></section>`;
  const j=out.lastIndexOf('</div>');return j>-1?out.slice(0,j)+c+out.slice(j):out+c}}

const _r=window.render||render;
render=function(){const x=_r.apply(this,arguments);return x};
})();
