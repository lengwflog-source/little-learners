/* Âm thanh phản hồi (tạo trực tiếp bằng WebAudio, không cần file mp3):
   cheer  – reo hò chúc mừng khi làm đúng
   ting   – "ting" khi đọc từ 80% trở lên;  tink – nhẹ khi 70–79%;  uhoh – "ố ồ" khi dưới 70%
   pop    – "bụp bụp" khi nối ở bài Matching
   Tắt/bật: SFX.set(false/true) (nhớ trong máy). */
(function(){
const AC=window.AudioContext||window.webkitAudioContext;let ctx=null,nb=null;
const KEY='ll-sfx';let ON=true;try{ON=localStorage.getItem(KEY)!=='0'}catch(e){}
function C(){if(!AC)return null;if(!ctx){try{ctx=new AC()}catch(e){return null}}if(ctx.state==='suspended')try{ctx.resume()}catch(e){}return ctx}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(ON)C()},{passive:true}));
function noise(c){if(nb)return nb;const n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return nb=b}
function env(g,t,a,peak,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d)}
function tone(c,type,f0,f1,t,dur,vol,dest,lp){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);env(g,t,0.008,vol,dur);let n=o;if(lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(dest||c.destination);o.start(t);o.stop(t+dur+0.05)}
function burst(c,t,dur,vol,f,q,dest){const s=c.createBufferSource();s.buffer=noise(c);const b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=f;b.Q.value=q;const g=c.createGain();env(g,t,0.004,vol,dur);s.connect(b);b.connect(g);g.connect(dest||c.destination);s.start(t,Math.random()*1.5);s.stop(t+dur+0.05)}
const API={
  pop(){const c=ON&&C();if(!c)return;const t=c.currentTime;[0,0.13].forEach((d,k)=>tone(c,'sine',k?330:420,k?120:150,t+d,0.11,0.55))},
  ting(){const c=ON&&C();if(!c)return;const t=c.currentTime;tone(c,'sine',1568,0,t,0.9,0.35);tone(c,'sine',2349,0,t,0.6,0.16);tone(c,'sine',3136,0,t,0.35,0.08);tone(c,'sine',2093,0,t+0.12,0.9,0.28)},
  tink(){const c=ON&&C();if(!c)return;const t=c.currentTime;tone(c,'sine',988,0,t,0.5,0.28);tone(c,'sine',1480,0,t,0.25,0.08)},
  uhoh(){const c=ON&&C();if(!c)return;const t=c.currentTime;
    const m=(f0,f1,s,d)=>{const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(),v=c.createOscillator(),vg=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0,s);o.frequency.linearRampToValueAtTime(f1,s+d);f.type='lowpass';f.frequency.setValueAtTime(900,s);f.frequency.linearRampToValueAtTime(380,s+d);v.frequency.value=6;vg.gain.value=7;v.connect(vg);vg.connect(o.frequency);env(g,s,0.04,0.32,d);o.connect(f);f.connect(g);g.connect(c.destination);o.start(s);v.start(s);o.stop(s+d+0.1);v.stop(s+d+0.1)};
    m(392,350,t,0.34);m(311,196,t+0.42,0.62)},
  cheer(big){const c=ON&&C();if(!c)return;const t=c.currentTime,dur=big?2.2:1.5;
    const mg=c.createGain();mg.gain.value=big?1:0.8;mg.connect(c.destination);
    /* tiếng đám đông "yeah!": nhiễu lọc dải, nhấp nhô */
    [700,1300,2200].forEach((f,k)=>{const s=c.createBufferSource();s.buffer=noise(c);s.loop=true;const b=c.createBiquadFilter();b.type='bandpass';b.frequency.setValueAtTime(f*0.8,t);b.frequency.linearRampToValueAtTime(f*1.25,t+dur*0.5);b.Q.value=1.4;const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.22/(k+1),t+0.25);for(let x=0.3;x<dur-0.3;x+=0.11)g.gain.linearRampToValueAtTime((0.14+Math.random()*0.1)/(k+1),t+x);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(b);b.connect(g);g.connect(mg);s.start(t);s.stop(t+dur+0.1)});
    /* vài giọng "woo-hoo" bay lên */
    [[380,620,0],[460,760,0.12],[330,560,0.22]].forEach(([a,b,d])=>{const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(a,t+d);o.frequency.exponentialRampToValueAtTime(b,t+d+0.45);f.type='bandpass';f.frequency.setValueAtTime(800,t+d);f.frequency.linearRampToValueAtTime(1400,t+d+0.45);f.Q.value=3;env(g,t+d,0.05,0.16,0.5);o.connect(f);f.connect(g);g.connect(mg);o.start(t+d);o.stop(t+d+0.6)});
    /* vỗ tay */
    for(let i=0;i<(big?46:28);i++)burst(c,t+0.2+Math.random()*(dur-0.3),0.05,0.22*Math.random()+0.08,1800+Math.random()*2500,0.8,mg);
    /* kèn mừng đi lên */
    [523,659,784,1047].forEach((f,k)=>tone(c,'triangle',f,0,t+k*0.09,big?0.55:0.35,0.2,mg));
    if(big)[784,988,1319].forEach(f=>tone(c,'triangle',f,0,t+0.4,0.9,0.15,mg))},
  /* điểm đọc: ≥80 ting · 70–79 tink nhẹ · <70 ố ồ */
  score(s){if(s>=80)API.ting();else if(s>=70)API.tink();else API.uhoh()},
  /* kết quả bài làm: đúng hết → reo to; từ 80% → reo nhỏ */
  result(c,n){if(!n)return;const r=c/n;if(r>=1)API.cheer(true);else if(r>=0.8)API.cheer(false)},
  set(v){ON=!!v;try{localStorage.setItem(KEY,ON?'1':'0')}catch(e){}},
  get on(){return ON}
};
window.SFX=API;
})();
