// ================= math =================
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ISO_AZ=Math.PI/4, ISO_EL=Math.asin(1/Math.sqrt(3));
const cross=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]];
const dot=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2];
const smooth=t=>{const e=clamp(t,0,1);return e*e*(3-2*e)};
const mix=(t,e,l)=>[lerp(t[0],e[0],l),lerp(t[1],e[1],l),lerp(t[2],e[2],l)];
const hash=t=>{const e=43758.5453*Math.sin(127.1*t+311.7);return e-Math.floor(e)};
const hx=s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
const rand=([a,b])=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const FONT='"Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic","Meiryo",system-ui,sans-serif';

