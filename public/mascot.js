/* Baby Dragon (Longie) – SVG generator. Poses: wave, cheer, point, trophy, stand */
(function(){
const C={g:'#9BCB9F',gs:'#5A8A5C',gw:'#8DBB92',bel:'#FBF1C4',mz:'#FFF8DC',yi:'#F6DE80',s:'#3D6B45',pk:'#F2B2A0',eye:'#2F3630'};
// mirror absolute path numbers (x -> 220-x)
function mir(d){let i=0;return d.replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g,(m,x,y)=>`${220-(+x)} ${y}`)}
const P=(d,f,w=3.4,ex='')=>`<path d="${d}" fill="${f}" stroke="${C.s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${ex}/>`;
const WO='M78 126 C58 98 32 90 14 102 C11 117 17 129 23 138 C29 134 36 136 38 145 C44 141 52 143 54 151 C62 147 70 147 78 149 Z';
const WI='M74 129 C57 109 37 103 24 111 C24 121 28 127 31 132 C36 130 40 133 42 138 C48 136 53 137 56 142 C63 140 69 140 74 141 Z';
const WB='M78 132 L25 134 M78 136 L40 142 M78 140 L55 148';
function wing(side){const f=side?mir:(x=>x);const cx=side?142:78;return `<g class="bd-w${side?'r':'l'}"><g transform="translate(${cx} 138) scale(.52) translate(${-cx} -132)">${P(f(WO),C.gw,5.5)}${P(f(WI),C.yi,3)}<path d="${f(WB)}" stroke="${C.gs}" stroke-width="3.5" fill="none" stroke-linecap="round"/></g></g>`}
function bez(p0,c1,c2,p3,t){const u=1-t;return[u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p3[1]]}
function limb(p0,c1,c2,p3,w0,w1){const N=14,L=[],R=[];for(let i=0;i<=N;i++){const t=i/N,p=bez(p0,c1,c2,p3,t),q=bez(p0,c1,c2,p3,Math.min(1,t+.01)),r=bez(p0,c1,c2,p3,Math.max(0,t-.01));let dx=q[0]-r[0],dy=q[1]-r[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=(w0+(w1-w0)*t)/2;L.push([p[0]-dy*w,p[1]+dx*w]);R.push([p[0]+dy*w,p[1]-dx*w])}
 const pts=L.concat(R.reverse());return 'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+' Z'}
function handShape(p3,c2,kind,st){const ang=Math.atan2(p3[1]-c2[1],p3[0]-c2[0])*180/Math.PI,x=p3[0],y=p3[1];
 let fing=[];
 if(kind==='open')fing=[[-42,4.2],[-14,5],[14,5],[40,4.2]];else if(kind==='rest')fing=[[-24,3.6],[0,4.2],[24,3.6]];else if(kind==='point')fing=[[0,9]];else fing=[[-20,3.4],[2,3.8],[24,3.4]];
 const F=fing.map(([a,l])=>`<ellipse cx="0" cy="0" rx="${kind==='point'?2.7:2.5}" ry="${l}" transform="translate(${x} ${y}) rotate(${ang+90+a}) translate(0 ${-(kind==='point'?9:6.4)-l*.55})" fill="${C.g}" ${st}/>`).join('');
 const palm=`<ellipse cx="${x}" cy="${y}" rx="7.2" ry="6.6" transform="rotate(${ang-90} ${x} ${y})" fill="${C.g}" ${st}/>`;
 return F+palm}
function arm(P,kind,sh){const [p0,c1,c2,p3]=P;const d=limb(p0,c1,c2,p3,17,11);const o=`stroke="${C.s}" stroke-width="3" stroke-linejoin="round"`;
 return `<path d="${d}" fill="${C.g}" ${o}/>${handShape(p3,c2,kind,o)}<path d="${d}" fill="${C.g}"/>${handShape(p3,c2,kind,'')}<ellipse cx="${p0[0]+(p0[0]<110?4:-4)}" cy="${p0[1]+3}" rx="7" ry="8" fill="${C.g}"/>`}
const ARMS={
 wave:`<g class="bd-al">${arm([[80,131],[68,142],[64,154],[68,168]],'rest')}</g><g class="bd-ar bd-waving">${arm([[140,131],[158,128],[170,116],[177,100]],'open')}</g>`,
 cheer:`<g class="bd-al bd-cheer">${arm([[80,131],[62,128],[50,116],[44,100]],'open')}</g><g class="bd-ar bd-cheer">${arm([[140,131],[158,128],[170,116],[176,100]],'open')}</g>`,
 point:`<g class="bd-al">${arm([[80,131],[68,142],[64,154],[68,168]],'rest')}</g><g class="bd-ar bd-pointing">${arm([[140,132],[154,138],[166,136],[180,128]],'open')}</g>`,
 trophy:`<g class="bd-al">${arm([[80,131],[68,144],[76,158],[92,160]],'fist')}</g><g class="bd-ar">${arm([[140,131],[152,144],[144,158],[128,160]],'fist')}</g>`,
 stand:`<g class="bd-al">${arm([[80,131],[68,142],[64,154],[68,168]],'rest')}</g><g class="bd-ar">${arm([[140,131],[152,142],[156,154],[152,168]],'rest')}</g>`
};
const TROPHY=`<g transform="translate(92 136)"><path d="M6 4 L30 4 L27 20 C25 27 11 27 9 20 Z" fill="#FFE066" stroke="${C.s}" stroke-width="2.6" stroke-linejoin="round"/><path d="M6 8 C-1 8 -1 18 8 18 M30 8 C37 8 37 18 28 18" fill="none" stroke="${C.s}" stroke-width="2.4" stroke-linecap="round"/><rect x="14.5" y="25" width="7" height="6" fill="#FFD43B" stroke="${C.s}" stroke-width="2.2"/><rect x="9" y="31" width="18" height="6" rx="3" fill="#FCC419" stroke="${C.s}" stroke-width="2.2"/><path d="M18 9 L19.8 13 L24 13.3 L20.8 16 L21.8 20 L18 17.8 L14.2 20 L15.2 16 L12 13.3 L16.2 13 Z" fill="#fff" opacity=".85"/></g>`;
window.bdSVG=function(pose){pose=ARMS[pose]?pose:'wave';const big=pose==='cheer'||pose==='trophy';
const HEAD='M110 36 C82 36 66 52 63 72 C53 82 53 104 69 113 C84 121 136 121 151 113 C167 104 167 82 157 72 C154 52 138 36 110 36 Z';
const HORN='M80 47 C74 31 63 24 58 31 C54 39 61 50 68 56 Z';
return `<svg class="bd" viewBox="0 0 220 226" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Baby Dragon">
<ellipse class="bd-sh" cx="110" cy="214" rx="52" ry="8" fill="${C.s}" opacity=".13"/>
<g class="bd-all">
<g class="bd-tail">${P('M80 186 C58 192 40 184 32 168 C30 162 36 160 40 165 C48 176 62 178 80 172 Z',C.g)}${P('M38 166 C28 160 22 150 28 145 C36 142 44 152 44 162 Z',C.yi,2.6)}</g>
${wing(0)}${wing(1)}
<g class="bd-body">
${P('M80 116 C68 134 66 166 74 186 L74 203 C74 210 98 210 98 203 L98 193 L122 193 L122 203 C122 210 146 210 146 203 L146 186 C154 166 152 134 140 116 Z',C.g,3.6)}
<path d="M80 208 L80 202 M87 209 L87 202 M94 208 L94 202 M126 208 L126 202 M133 209 L133 202 M140 208 L140 202" stroke="${C.s}" stroke-width="2.2" stroke-linecap="round"/>
<ellipse cx="110" cy="154" rx="26" ry="33" fill="${C.bel}" stroke="${C.s}" stroke-width="2.6"/>
<path d="M88 137 Q110 142 132 137 M85 149 Q110 154 135 149 M85 161 Q110 166 135 161 M89 173 Q110 177 131 173" stroke="${C.yi}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
<ellipse cx="100" cy="134" rx="7" ry="3.5" fill="#fff" opacity=".55"/>
</g>
${pose==='trophy'?TROPHY:''}
${ARMS[pose]}
<g class="bd-head">
${P(HORN,C.yi,3)}<path d="M61 36 Q67 33 73 37 M60 44 Q66 41 72 46" stroke="${C.gs}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${P(mir(HORN),C.yi,3)}<path d="${mir('M61 36 Q67 33 73 37 M60 44 Q66 41 72 46')}" stroke="${C.gs}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<g class="bd-crest">${P('M110 16 C101 25 101 38 110 44 C119 38 119 25 110 16 Z',C.gs,3)}<path d="M110 22 L110 38" stroke="${C.yi}" stroke-width="2" stroke-linecap="round"/></g>
${P('M63 66 L47 61 C49 70 52 76 58 79 Z',C.gs,3)}${P(mir('M63 66 L47 61 C49 70 52 76 58 79 Z'),C.gs,3)}
${P(HEAD,C.g,3.8)}
<path d="M66 92 C66 78 154 78 154 92 C155 108 136 117 110 117 C84 117 65 108 66 92 Z" fill="${C.mz}"/>
<ellipse cx="96" cy="48" rx="13" ry="4.5" fill="#fff" opacity=".45" transform="rotate(-12 96 48)"/>
<path d="M80 55 Q87 50 95 54 M125 54 Q133 50 140 55" stroke="${C.s}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
<g class="bd-eyes">
<ellipse cx="88" cy="70" rx="11" ry="12.5" fill="#fff" stroke="${C.s}" stroke-width="2.4"/><circle cx="89.5" cy="71" r="8" fill="${C.eye}"/><circle cx="86.5" cy="67.2" r="3.2" fill="#fff"/><circle cx="92.6" cy="74.5" r="1.5" fill="#fff"/>
<ellipse cx="132" cy="70" rx="11" ry="12.5" fill="#fff" stroke="${C.s}" stroke-width="2.4"/><circle cx="130.5" cy="71" r="8" fill="${C.eye}"/><circle cx="127.5" cy="67.2" r="3.2" fill="#fff"/><circle cx="133.6" cy="74.5" r="1.5" fill="#fff"/>
</g>
<circle cx="104" cy="85" r="2.1" fill="${C.s}"/><circle cx="116" cy="85" r="2.1" fill="${C.s}"/>
<ellipse cx="74" cy="94" rx="8" ry="5.2" fill="${C.pk}" opacity=".8"/><ellipse cx="146" cy="94" rx="8" ry="5.2" fill="${C.pk}" opacity=".8"/>
<g class="bd-mouth">${big?`<path d="M92 93 Q110 97 128 93 C127 113 93 113 92 93 Z" fill="#D9776B" stroke="${C.s}" stroke-width="3" stroke-linejoin="round"/><path d="M100 104 Q110 99 120 104 C116 109 104 109 100 104 Z" fill="#EFA597"/>`:`<path d="M95 94 Q110 97 125 94 C124 107 96 107 95 94 Z" fill="#D9776B" stroke="${C.s}" stroke-width="3" stroke-linejoin="round"/><path d="M101 101 Q110 98 119 101 C116 105 104 105 101 101 Z" fill="#EFA597"/>`}</g>
</g>
</g></svg>`};
})();

/* ---- Baby Dragon: tour + corner mascot (student only). Gỡ: bỏ 2 dòng link/script trong index.html ---- */
(function(){
const LS='bd_hide_v1',KEY='tour_v4',KEY2='tour_ex_v3';const onEx=()=>typeof route==='function'&&route().startsWith('ex-')&&!!$1('.xtb');let T=null,hiVis=false;
const ok=()=>typeof S!=='undefined'&&S&&!S.isT&&S.prof&&!(S.cfg&&S.cfg.mascotOff);
const $1=s=>document.querySelector(s);
function hidden(){try{return localStorage.getItem(LS)==='1'}catch(e){return false}}
function setHidden(v){try{v?localStorage.setItem(LS,'1'):localStorage.removeItem(LS)}catch(e){}}
function assignCard(){return[...document.querySelectorAll('.card')].filter(c=>/Bài được giao/.test(c.innerText||'')).pop()||null}
function menuBtn(){return $1('.top details.navm>summary')||$1('.top details.navm summary')}
function gradeBtn(){return $1('.top #gdd>summary')}
const spG=()=>[2,3,4,5,8].includes(Number(S.grade)),qaG=()=>[9,10,11,12].includes(Number(S.grade));
function navLink(t){return[...document.querySelectorAll('.top a')].find(a=>(a.textContent||'').trim()===t)||null}
function name(){return((S.prof&&S.prof.name)||'').split(' ').pop()||'bạn'}
function vis(sel){return()=>{const e=[...document.querySelectorAll(sel)].find(x=>x.offsetParent!==null||getComputedStyle(x).position==='fixed');return e||null}}
function okEl(x){if(!x.el)return true;const e=x.el();return !!(e&&e.getClientRects().length&&e.getBoundingClientRect().width>0)}
function exSteps(){const r=[];
 r.push({pose:'wave',t:`Mình chỉ bạn <b>công cụ làm bài</b> nhé! 🧰`,s:(innerWidth<=640?'Thanh công cụ nằm <b>ở trên cùng</b> bài làm và luôn đi theo bạn khi cuộn bài. Xem nhanh từng món nào!':'Thanh công cụ nằm ở <b>bên trái</b> màn hình và luôn đi theo bạn khi cuộn bài. Xem nhanh từng món nào!')});
 r.push({pose:'point',el:()=>{const b=$1('#backbtn');return b&&b.offsetParent!==null?b:$1('.xtb .xback')},t:'Nút <b>← Quay lại</b>',s:'Bấm để về danh sách bài học (Thư viện) bất cứ lúc nào.'});
 r.push({pose:'point',el:()=>$1('.xtb .xgrp'),t:'<b>Bút highlight</b> 🖍️',s:'Bấm bút, chọn màu <b>xanh lá</b> hoặc <b>vàng</b>, rồi kéo chọn chữ trong bài đọc hoặc câu hỏi để tô màu. Trên điện thoại: nhấn giữ rồi kéo. Nút tẩy để xóa chỗ đã tô.'});
 r.push({pose:'point',el:()=>$1('.xtb [data-xt="tr"]'),t:'<b>Dịch từ</b> 🔍',s:'Bấm nút này rồi chạm vào bất kỳ từ nào để xem nghĩa, loại từ và nghe phát âm. Bôi chọn cả câu cũng ra nghĩa cả câu. Muốn chọn đáp án thì nhớ <b>tắt</b> Dịch từ.'});
 if(typeof bankOK==='function'&&bankOK())r.push({pose:'cheer',el:menuBtn,t:'<b>Kho từ vựng</b> của bạn 📚',s:'Khi tra từ, bấm <b>Thêm vào kho từ vựng</b>. Các từ đã lưu nằm trong menu <b>Bài học ▾</b> ở trên cùng, bạn có thể ôn bằng thẻ lật và làm bài kiểm tra nhanh.'});
 if($1('.xtb [data-xt="note"]'))r.push({pose:'point',el:()=>$1('.xtb [data-xt="note"]'),t:'<b>Ghi chú chữ</b> 📝',s:'Bấm <b>T</b> rồi chạm vào chỗ trống trong bài để gõ ghi chú. Kéo thanh trên cùng của ghi chú để di chuyển; nút <b>●</b> đổi màu, <b>A− A+</b> đổi cỡ chữ.'});
 r.push({pose:'point',el:()=>$1('.xtb [data-xt="clear"]'),t:'<b>Xóa hết</b> 🗑️',s:'Bấm thùng rác để xóa toàn bộ ghi chú và vùng tô màu ở trang này, rồi bạn có thể bắt đầu lại.'});
 if($1('.boxw'))r.push({pose:'cheer',el:()=>$1('.boxw'),t:'<b>Kéo thả</b> từ trong khung ✋',s:'Bài có khung từ: <b>kéo</b> từ/cụm từ vào chỗ trống. Trên điện thoại thì <b>chạm</b> vào cụm từ rồi chạm vào chỗ trống. Từ đã dùng sẽ mờ đi.'});
 r.push({pose:'point',el:()=>$1('.xtb .xgrp:last-of-type'),t:'<b>Chỉnh cỡ chữ</b> 🔠',s:'Bấm <b>A▴</b> để chữ to hơn, <b>A▾</b> để nhỏ lại cho dễ đọc.'});
 r.push({pose:'point',el:()=>$1('.xtb [data-xt="dock"]'),t:'<b>Ghim thanh công cụ</b> 📌',s:'Bấm để đổi chỗ thanh công cụ: Trái → Phải → Trên. Chọn chỗ nào tiện tay nhất cho bạn.'});
 r.push({pose:'point',el:vis('.xtabs,.xpas'),t:'Bài đọc và câu hỏi 📖',s:'Máy tính: bài đọc bên trái, câu hỏi bên phải. Điện thoại: bài đọc ở trên, câu hỏi ở dưới, mỗi phần tự cuộn riêng.'});
 r.push({pose:'cheer',t:'Nộp bài để mở phần tiếp theo ✅',s:'Làm xong một phần, bấm <b>Nộp bài</b> để xem đáp án và lời giải chi tiết từng câu. Bạn có thể <b>làm lại nhiều lần</b> để nhớ bài. Chúc bạn làm bài thật tốt!'});
 return r.filter(okEl)}
function steps(){if(T&&T.tp)return typeSteps();if(T&&T.ex)return exSteps();const r=[];
 r.push({pose:'wave',t:`Chào ${esc(name())}! Mình là <b>Baby Dragon</b> 🐲, trợ lý của <b>Mr. Phi Long</b>`,s:'Mình sẽ chỉ bạn cách học trên web này, chỉ mất một phút thôi!'});
 r.push({pose:'point',el:menuBtn,t:'Đây là <b>menu</b> ☰',s:'Bấm vào để mở tất cả các mục: <b>Bài học</b>, <b>Bản thu</b> (nhận xét của thầy/cô)'+(typeof bankOK==='function'&&bankOK()?' và <b>Kho từ vựng</b> của bạn':'')+'. Mọi thứ đều nằm trong ô này.'});
 r.push({pose:'point',el:gradeBtn,t:'Chọn <b>khối lớp</b> 🎓',s:'Bấm vào đây để đổi sang khối lớp khác (nếu thầy/cô cho phép).'});
 r.push({pose:'point',el:assignCard,t:'Đây là <b>Bài được giao</b> từ thầy/cô 📘',s:'Bấm "Làm bài" để vào đúng các bài thầy/cô giao. Thanh xanh cho biết bạn đã làm được bao nhiêu.'});
 r.push({pose:'point',el:()=>$1('#bell-btn'),t:'Đây là <b>chuông thông báo</b> 🔔',s:'Có bài mới được giao hoặc thầy/cô vừa nhận xét, chuông sẽ báo ở đây.'});
 if(spG())r.push({pose:'cheer',t:'Đọc to và được chấm điểm 🎤',s:'Ở bài <b>Listen and repeat</b> và <b>Speaking cards</b>, bấm <b>Đọc thử</b> rồi đọc to. Máy chấm phát âm từ 50–100%. Mỗi mục chỉ đọc <b>1 lần</b> nên hãy nghe mẫu ♪ trước nhé!'});
 if(qaG())r.push({pose:'point',t:'Có thắc mắc? Hỏi mình nhé! 💬',s:'Bấm vào mình ở góc màn hình, chọn <b>Hỏi đáp (Q&A)</b> để hỏi bài. Nếu câu trả lời chưa ổn, bạn chấm dưới 3 sao để thầy/cô trả lời trực tiếp.'});
 r.push({pose:'cheer',el:menuBtn,t:'Ôn từ vựng bằng <b>Flashcard</b> 🃏',s:'Mở menu ☰ → <b>Flashcard</b>: lật thẻ có hình, chơi nhiều game (chọn ABCD, xếp chữ cái, điền chữ thiếu, nghe và viết…) và bài <b>MIX 35 câu</b>. Nhớ tick <b>Đã thuộc</b> và <b>Đặt câu được</b> khi bạn làm được nhé!'});
 if(S.lessons&&S.lessons.some(l=>l.wordform))r.push({pose:'cheer',t:'Mục <b>WORDFORM</b> 🔤',s:'Trong mỗi bài có thẻ <b>Wordform</b>: bảng danh từ – động từ – tính từ – trạng từ và phần luyện tập 10–20 câu kèm công thức. Mỗi lần bấm <b>luyện bộ câu mới</b> sẽ ra câu khác, bạn <b>làm lại bao nhiêu lần cũng được</b>!'});
 const g=Number(S.grade);
 if(g===13||g===14){
  r.push({pose:'cheer',t:'Khối <b>TOEIC</b>: nghe có hướng dẫn 🎧',s:'Mỗi bài nghe (Track A, B, C, D) có khung vàng <b>"Cách làm bài"</b> ở đầu bài: đọc trước khi bấm nghe. Part 1 nhìn ảnh 3–5 giây rồi mới nghe. Sau khi nộp, mỗi đáp án đều có lời giải thích vì sao đúng và vì sao sai.'});
  r.push({pose:'point',t:'Từ vựng, đặt câu và thu âm ✍️🎤',s:'Mỗi Unit có <b>Flashcard</b>, bài <b>đặt câu</b> với từ vựng và bài <b>nói – thu âm</b>: thầy sẽ nghe và chấm trực tiếp, bạn đọc nhận xét trong mục <b>Bản thu</b>.'});
 }else if(g===9){
  r.push({pose:'cheer',t:'Khối <b>IELTS</b>: Writing & Speaking 🤖',s:'Bài <b>Writing</b> và <b>Speaking</b> được AI chấm theo 4 tiêu chí kèm chỗ sửa lỗi. Phần Listening và Reading có <b>band ước tính</b> sau khi nộp.'});
  r.push({pose:'cheer',t:'Mục <b>EXTRA WRITING</b> ✍️',s:'Ở trang <b>Tổng quan</b> có thẻ <b>EXTRA WRITING</b>: bạn tự gõ <b>tiêu đề</b> và <b>nội dung</b> rồi bấm <b>Nộp bài cho thầy chấm</b>. Thầy đọc, cho điểm và nhận xét, bạn xem kết quả ngay trong mục này. Viết bao nhiêu bài cũng được.'});
 }else if(spG()){
  r.push({pose:'cheer',t:'Nghe ♪ rồi làm nhé! 🔊',s:'Gặp nút <b>♪</b> thì bấm để nghe mẫu. Làm đúng sẽ có tiếng <b>ting ting</b> vui tai. Bài Flashcard có nhiều trò chơi để nhớ từ thật lâu!'});
 }else{
  r.push({pose:'cheer',t:'Đọc, nghe và thu âm 🎧',s:'Bài nghe có nút <b>▶</b>, bài đọc to có nút <b>Thu âm</b> (bấm xong nghe tiếng <b>ting</b> rồi mới nói). Trong mỗi bài còn có thẻ <b>Flashcard</b> riêng cho từ vựng của bài đó.'});
 }
 r.push({pose:'point',el:menuBtn,t:'Thêm <b>từ vựng riêng</b> ➕',s:'Trong <b>Flashcard</b> bạn có thể tự thêm từ mình muốn (phải chọn <b>Unit</b> trước). Khi dịch câu hay cụm từ, bấm <b>Lưu</b> để cất vào kho từ vựng.'});
 r.push({pose:'cheer',t:'Cách làm bài ✏️',s:'Làm xong từng bài, nhớ bấm <b>Nộp bài</b> để xem kết quả. Mỗi bài có thể <b>làm lại nhiều lần</b>. Bài có <b>công thức</b> ở trên đề thì đọc kỹ trước khi làm, vì vậy không cần thầy/cô bên cạnh bạn vẫn tự ôn được. Cố lên nhé!'});
 return r.filter(okEl)}

/* ---- hướng dẫn theo từng dạng bài (hiện 1 lần cho mỗi dạng, bấm rồng để xem lại) ---- */
function itemEl(t){const X0=typeof X!=='undefined'&&X&&X.E;if(!X0)return null;const i=X.E.items.findIndex(it=>it.t===t);const els=document.querySelectorAll('#app .item');return i>=0&&els[i]?els[i]:null}
const TP=[
 ['audio',()=>!!(X.E.media&&X.E.media.length),()=>$1('#app audio')&&($1('#app audio').closest('.card')||$1('#app audio')),'Nút <b>▶ nghe</b> 🎧','Bấm <b>▶</b> để nghe bài. Bạn nghe được nhiều lần, có thể tua lại. Nếu không phát, tải lại trang hoặc báo thầy.'],
 ['guide',()=>!!document.querySelector('#app .exm'),()=>$1('#app .exm'),'Khung vàng <b>Cách làm bài</b> 📌','Đọc khung này <b>trước khi nghe</b>: có mẹo làm từng phần và những bẫy hay gặp.'],
 ['img',()=>X.E.items.some(it=>it.t==='mcq'&&/<img/.test(it.q||'')),()=>$1('#app .item img'),'Nhìn ảnh trước khi nghe 🖼️','Nhìn ảnh <b>3–5 giây</b>: mấy người, đang làm gì, vật ở đâu. Rồi nghe cả 4 câu A, B, C, D và chọn câu mô tả đúng nhất.'],
 ['mcq',()=>X.E.items.some(it=>it.t==='mcq'),()=>itemEl('mcq'),'Chọn đáp án 🔘','Chạm vào một đáp án (A, B, C hoặc D). Bấm <b>Nộp bài</b> ở cuối để xem đúng sai và <b>lời giải thích</b> từng đáp án.'],
 ['fill',()=>X.E.items.some(it=>it.t==='fill'),()=>itemEl('fill'),'Điền vào chỗ trống ✏️','Gõ từ còn thiếu vào ô trống. Bài nghe chép: nghe tối đa 3 lần, viết đúng chính tả. Anh–Anh hay Anh–Mỹ đều được chấp nhận.'],
 ['text',()=>X.E.items.some(it=>it.t==='text'),()=>itemEl('text'),'Sửa câu / viết câu ✍️','Câu có <u style="text-decoration:underline wavy #d33">từ gạch đỏ</u> là chỗ sai: sửa lại <b>cả câu</b> cho đúng trong ô bên dưới.'],
 ['match',()=>X.E.items.some(it=>it.t==='match'),()=>itemEl('match'),'Nối từ 🔗','Chọn một từ bên trái rồi chọn nghĩa tương ứng bên phải để nối.'],
 ['rec',()=>X.E.items.some(it=>it.t==='rec'),()=>itemEl('rec'),'Thu âm cho thầy chấm 🎤','Bấm <b>♪</b> nghe mẫu, rồi bấm <b>Thu âm</b>. Có tiếng <b>ting</b> là bắt đầu nói. Đọc xong bấm dừng. Thầy sẽ nghe và nhận xét trong mục <b>Bản thu</b>.'],
 ['say',()=>X.E.items.some(it=>it.t==='say'),()=>itemEl('say'),'Nghe và đọc to 🗣️','Bấm <b>♪</b> nghe mẫu rồi bấm <b>Đọc thử</b>. Máy chấm phát âm từ 50–100%, mỗi mục đọc được <b>một lần</b>.'],
 ['open',()=>X.E.items.some(it=>it.t==='open'),()=>itemEl('open'),'Tự viết câu 📝','Ô này để bạn tự viết, không chấm tự động. Bấm <b>Xem câu mẫu</b> (nếu có) để so với bài của mình.'],
 ['wr',()=>X.E.items.some(it=>it.t==='wr'),()=>itemEl('wr'),'Writing chấm bằng AI 🤖','Viết đủ số từ tối thiểu rồi bấm <b>Nộp để AI chấm</b>. Sau khoảng 10–40 giây bạn nhận điểm band, chỗ sai và bài viết đã cải thiện.'],
 ['sp',()=>X.E.items.some(it=>it.t==='sp'),()=>itemEl('sp'),'Speaking chấm bằng AI 🎙️','Bấm thu âm và nói to, rõ (dùng Chrome hoặc Safari). Máy nhận dạng lời nói rồi AI nhận xét phát âm, từ vựng và ngữ pháp.'],
 ['ew',()=>X.E.items.some(it=>it.t==='ew'),()=>itemEl('ew'),'<b>EXTRA WRITING</b> nộp cho thầy ✍️','Viết bài đủ số từ rồi bấm <b>Nộp bài cho thầy chấm</b>. Thầy sẽ đọc, cho điểm và nhận xét; kết quả hiện ngay tại đây. Chưa hài lòng thì bấm <b>Sửa và nộp lại</b>.']];
function tpList(all){const lv=(S.prof&&S.prof.lv)||{};return TP.filter(x=>{try{return x[1]()&&(all||!lv['tg_'+x[0]])}catch(e){return false}})}
function typeSteps(){const r=[];const l=tpList(T&&T.all);
 if(!l.length)return r;
 r.push({pose:'wave',t:'Hướng dẫn nhanh cho bài này 🐲',s:'Mình chỉ bạn từng phần của bài. Bấm <b>Tiếp theo</b> để xem, hoặc <b>Bỏ qua</b> nếu bạn đã biết.'});
 l.forEach(x=>r.push({pose:'point',el:x[2],t:x[3],s:x[4]}));
 T&&(T.types=l.map(x=>x[0]));return r.filter(okEl)}
function finish(){if(!T)return;const ISEX=T.ex,T0=T;T.root.remove();T.spot&&T.spot.remove();window.removeEventListener('resize',T.rp);window.removeEventListener('scroll',T.rp,true);document.removeEventListener('keydown',T.kd);T=null;
 const TPX=T0.tp,TYP=T0.types;if(S.prof){S.prof.lv=S.prof.lv||{};if(TPX){(TYP||[]).forEach(k=>{S.prof.lv['tg_'+k]=Date.now()});try{saveProf()}catch(e){}}else{const K=ISEX?KEY2:KEY;if(!S.prof.lv[K]){S.prof.lv[K]=Date.now();try{saveProf()}catch(e){}}}}sync()}
function place(){if(!T)return;const st=T.list[T.i];const el=st.el&&st.el();
 if(el){const r=el.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-200){scrollTo({top:Math.max(0,r.top+scrollY-110),behavior:'smooth'})}
  const q=el.getBoundingClientRect();Object.assign(T.spot.style,{display:'block',left:q.left-8+'px',top:q.top-8+'px',width:q.width+16+'px',height:q.height+16+'px'});T.shade.style.display='none'}
 else{T.spot.style.display='none';T.shade.style.display='block'}}
function draw(){const st=T.list[T.i],n=T.list.length;
 T.root.innerHTML=`<div class="bdg">${bdSVG(st.pose)}</div><div class="bdc" role="dialog" aria-label="Hướng dẫn của Baby Dragon">${st.t}<small>${st.s}</small><div class="bdr"><span class="bdd">${T.list.map((_,k)=>`<i class="${k===T.i?'on':''}"></i>`).join('')}</span><span class="sp"></span>${T.i>0?'<button type="button" class="bdk" data-bd="prev">Quay lại</button>':'<button type="button" class="bdk" data-bd="skip">Bỏ qua</button>'}<button type="button" class="bdn" data-bd="next">${T.i===n-1?'Xong! 🎉':'Tiếp theo ➜'}</button></div></div>`;
 place();setTimeout(place,380)}
function start(kind,all){if(T||!ok())return;const tp=kind==='tp';const ex=!tp&&onEx();T={ex,tp,all};const list=steps();const tt=T.types;T=null;if(!list.length)return;
 const root=document.createElement('div');root.className='bdtour';const spot=document.createElement('div');spot.className='bdspot';const shade=document.createElement('div');shade.className='bdshade';
 document.body.append(shade,spot,root);T={list,i:0,root,spot,shade,ex,tp,types:tt,all};
 const rm=T.root.remove.bind(T.root);T.root.remove=()=>{rm();shade.remove()};
 T.rp=()=>place();T.kd=e=>{if(e.key==='Escape')finish()};addEventListener('resize',T.rp);addEventListener('scroll',T.rp,true);document.addEventListener('keydown',T.kd);
 root.addEventListener('click',e=>{const a=e.target.closest('[data-bd]');if(!a)return;const k=a.dataset.bd;if(k==='skip')finish();else if(k==='prev'){T.i--;draw()}else{if(T.i>=T.list.length-1)finish();else{T.i++;draw()}}});
 draw();clearHi();const h=document.querySelector('.bdw');h&&(h.style.display='none')}
window.bdStart=function(k,all){start(k,all)};
window.bdOnEx=()=>typeof route==='function'&&route().startsWith('ex-')&&typeof X!=='undefined'&&X&&X.E&&tpList(true).length>0;
function clearHi(){const h=$1('.bdhi');h&&h.remove()}
function sync(){
 const old=$1('.bdw'),mini=$1('.bdmini');
 if(!ok()){old&&old.remove();mini&&mini.remove();clearHi();if(T)finish();return}
 if(T)return;
 if(old)old.style.display='';
 if(hidden()){old&&old.remove();clearHi();if(!mini){const m=document.createElement('button');m.type='button';m.className='bdmini';m.setAttribute('aria-label','Hiện Baby Dragon');m.innerHTML=bdSVG('stand').replace('viewBox="0 0 220 226"','viewBox="40 8 140 120"');m.onclick=()=>{setHidden(false);sync()};document.body.appendChild(m)}return}
 mini&&mini.remove();
 if(!old){const w=document.createElement('div');w.className='bdw';w.setAttribute('role','button');w.tabIndex=0;w.setAttribute('aria-label','Baby Dragon – bấm để xem hướng dẫn hoặc hỏi đáp Q&A');w.innerHTML=bdSVG('wave')+'<button type="button" class="bdx" aria-label="Ẩn Baby Dragon" title="Ẩn rồng">✕</button>';
  w.addEventListener('click',e=>{if(e.target.closest('.bdx')){e.stopPropagation();setHidden(true);sync();return}const s=w.querySelector('svg');s.classList.remove('jump');void s.getBoundingClientRect();s.classList.add('jump');if(typeof window.bdMenu==='function'&&!S.isT)window.bdMenu(w);else if(window.bdOnEx())start('tp',true);else start()});
  w.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(typeof window.bdMenu==='function')window.bdMenu(w);else start()}});document.body.appendChild(w)}
 if(onEx()&&!(S.prof.lv&&S.prof.lv[KEY2])&&!T&&window.__bdAuto2!==S.uid){window.__bdAuto2=S.uid;setTimeout(()=>{if(ok()&&!T&&onEx()&&!(S.prof.lv&&S.prof.lv[KEY2]))start()},1100)}
 if(!T&&typeof route==='function'&&route().startsWith('ex-')&&typeof X!=='undefined'&&X&&X.E&&(S.prof.lv&&S.prof.lv[KEY2])&&window.__bdTp!==X.E.id&&tpList(false).length){const id=X.E.id;window.__bdTp=id;setTimeout(()=>{if(ok()&&!T&&typeof X!=='undefined'&&X&&X.E&&X.E.id===id&&tpList(false).length)start('tp')},1500)}
 const first=!(S.prof.lv&&S.prof.lv[KEY]);
 if(first&&(typeof route==='function'?route()==='home':true)&&!T&&window.__bdAuto!==S.uid){window.__bdAuto=S.uid;setTimeout(()=>{if(ok()&&!T&&!(S.prof.lv&&S.prof.lv[KEY]))start()},900)}
 else if(!first&&!hiVis&&!(pend()&&pend().length)&&typeof route==='function'&&route()==='home'){hiVis=true;const h=document.createElement('div');h.className='bdhi';h.textContent=`Chào ${name()}! Bấm vào mình nếu cần hướng dẫn nhé 👋`;document.body.appendChild(h);setTimeout(clearHi,6000)}}

/* nhắc làm đủ bài được giao */
function pend(){try{if(!S||S.isT||!S.prof)return null;const ass=myAssignments();if(!ass.length)return null;const set=new Set();
 ass.forEach(a=>{if(a.ex&&a.ex.length)a.ex.forEach(i=>set.add(i));else(a.lessons||[]).forEach(l=>{const L=S.by[l];L&&L.exercises.forEach(E=>set.add(E.id))})});
 const ex=exArr(S.prof),out=[];S.lessons.forEach(L=>L.exercises.forEach(E=>{if(set.has(E.id)&&!ex[E.id])out.push(E.id)}));return out}catch(e){return null}}
function clearRm(){const h=$1('.bdrm');h&&h.remove();if(window.__bdRt){clearTimeout(window.__bdRt);window.__bdRt=0}}
function showRm(){if(T||!ok()||hidden())return;const pd=pend();if(!pd||!pd.length)return;clearRm();const cur=(typeof X!=='undefined'&&X&&X.E)?X.E.id:'';const n=pd.find(i=>i!==cur)||pd[0];
 const h=document.createElement('div');h.className='bdrm';h.setAttribute('role','status');
 h.innerHTML=`<button type="button" class="bdrx" aria-label="Đóng">✕</button><b>Còn ${pd.length} bài thầy giao chưa xong!</b><span>${name()} ơi, làm tiếp cho đủ số bài nhé 💪</span><a class="btn sm" href="#ex-${n}">Làm bài kế tiếp →</a>`;
 h.querySelector('.bdrx').onclick=clearRm;h.querySelector('a').onclick=clearRm;document.body.appendChild(h)}
let rmKey='';
function rmSync(){const r=typeof route==='function'?route():'';const pd=pend();
 if(!ok()||!pd||!pd.length){clearRm();rmKey='';return}
 if(r.startsWith('ex-')&&typeof X!=='undefined'&&X&&X.checked&&!X.practice&&!X.stu){const key='ex:'+X.E.id;if(rmKey!==key){rmKey=key;clearRm();window.__bdRt=setTimeout(()=>{if(route()===r&&X&&X.checked)showRm()},3000)}}
 else if(r==='home'||r==='lessons'){if(rmKey!==r){rmKey=r;clearRm();window.__bdRt=setTimeout(showRm,700)}}
 else{rmKey=r;clearRm()}}
const _r=window.render||render;
render=function(){const x=_r.apply(this,arguments);try{sync()}catch(e){}try{rmSync()}catch(e){}return x};
setTimeout(()=>{try{sync()}catch(e){}},600);
})();
