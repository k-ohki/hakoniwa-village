// ================= time & weather =================
// HR = 夜の1時間の秒数（12.5 秒）。昼（SLOW_H）は時計を 1/SLOW の速さにして、ゆっくり眺められるようにする
// 住人の動き・待ち時間・気分などの長さは実時間（clock.sim、HR 単位）で数え、時刻だけが clock.gh（経過した時間数）で進む
const HR=12.5, START_H=6.8, OLD_HR=7.5, SLOW_H=[5,22], SLOW=3;
const WEEK=[J('月','Mon'),J('火','Tue'),J('水','Wed'),J('木','Thu'),J('金','Fri'),J('土','Sat'),J('日','Sun')];
const weekday=()=>(clock.day-1)%7, isWeekend=()=>weekday()>=5;
// 時間帯 [a,b]（日をまたいでもよい）、または時間帯のリストに今の時刻が入っているか
const inHours=(h,r)=>Array.isArray(r[0])?r.some(x=>inHours(h,x)):r[0]<=r[1]?h>=r[0]&&h<r[1]:h>=r[0]||h<r[1];
const clock={sim:0,gh:0,hour:START_H,day:1,speed:1,lastDay:1,lastHourInt:6};
// 時刻 h の1時間が何秒か／時刻 h から dh 時間たつまでの秒数
const hourLen=h=>inHours(h,SLOW_H)?SLOW*HR:HR;
function simFor(h,dh){let s=0;while(dh>1e-9){h=(h%24+24)%24;const edge=h<SLOW_H[0]?SLOW_H[0]:h<SLOW_H[1]?SLOW_H[1]:24+SLOW_H[0],d=Math.min(dh,edge-h);s+=d*hourLen(h);dh-=d;h+=d}return s}
const DAY=simFor(0,24);
// 町の成長などの「時刻で数える」間隔用（夜の速さに直した経過秒）
const gameT=()=>clock.gh*HR;
const weather={kind:'clear',until:0,rainbowUntil:0,festUntil:0,plan:null};
function setWeather(kind,hours){weather.kind=kind;weather.until=clock.sim+hours*HR}
const mealName=()=>{const h=clock.hour;return h<10.5?J('朝ごはん','breakfast'):h<15.5?J('お昼ごはん','lunch'):J('夕ごはん','dinner')};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
let houseMealCtx=null;const houseMeal=()=>houseMealCtx&&houseMealCtx.mealName;

