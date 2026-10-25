// ================= time & weather =================
// HR = 1時間の秒数（12.5 秒）。昼（5〜22時）は町全体（時計も住人の動きも）を 1/SLOW の速さにして、のんびり眺められるようにする。夜はそのまま
// clock.sim は町の中の経過秒（HR 単位）、clock.gh は経過した時間数。どちらも昼はゆっくり進む
const HR=12.5, START_H=6.8, OLD_HR=7.5, SLOW=3;
const WEEK=[J('月','Mon'),J('火','Tue'),J('水','Wed'),J('木','Thu'),J('金','Fri'),J('土','Sat'),J('日','Sun')];
const weekday=()=>(clock.day-1)%7, isWeekend=()=>weekday()>=5;
// 時間帯 [a,b]（日をまたいでもよい）、または時間帯のリストに今の時刻が入っているか
const inHours=(h,r)=>Array.isArray(r[0])?r.some(x=>inHours(h,x)):r[0]<=r[1]?h>=r[0]&&h<r[1]:h>=r[0]||h<r[1];
const clock={sim:0,gh:0,hour:START_H,day:1,speed:1,lastDay:1,lastHourInt:6};
// 時刻 h での町の進む速さ（夜 1、昼 1/SLOW。5時・22時の前後30分でなめらかに切りかえる）
const paceAt=h=>1-(1-1/SLOW)*clamp(Math.min(h-4.5,22.5-h),0,1);
// 等速（×1）で1日にかかる実時間の秒数
const DAY=(()=>{let s=0;for(let i=0;i<240;i++)s+=HR*.1/paceAt(i*.1+.05);return s})();
// 町の成長などの「時刻で数える」間隔用（以前の保存では sim と時刻がずれていることがあるので gh から求める）
const gameT=()=>clock.gh*HR;
const weather={kind:'clear',until:0,rainbowUntil:0,festUntil:0,plan:null};
function setWeather(kind,hours){weather.kind=kind;weather.until=clock.sim+hours*HR}
const mealName=()=>{const h=clock.hour;return h<10.5?J('朝ごはん','breakfast'):h<15.5?J('お昼ごはん','lunch'):J('夕ごはん','dinner')};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
let houseMealCtx=null;const houseMeal=()=>houseMealCtx&&houseMealCtx.mealName;

