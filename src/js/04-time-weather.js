// ================= time & weather =================
// 1日 = 300 秒（1時間 = 12.5 秒）。町が広いので、歩いて移動できる時間を確保している
const DAY=300, HR=DAY/24, START_H=6.8, OLD_HR=7.5;
const WEEK=[J('月','Mon'),J('火','Tue'),J('水','Wed'),J('木','Thu'),J('金','Fri'),J('土','Sat'),J('日','Sun')];
const weekday=()=>(clock.day-1)%7, isWeekend=()=>weekday()>=5;
// 時間帯 [a,b]（日をまたいでもよい）、または時間帯のリストに今の時刻が入っているか
const inHours=(h,r)=>Array.isArray(r[0])?r.some(x=>inHours(h,x)):r[0]<=r[1]?h>=r[0]&&h<r[1]:h>=r[0]||h<r[1];
const clock={sim:0,hour:START_H,day:1,speed:1,lastDay:1,lastHourInt:6};
const weather={kind:'clear',until:0,rainbowUntil:0,festUntil:0,plan:null};
function setWeather(kind,hours){weather.kind=kind;weather.until=clock.sim+hours*HR}
const mealName=()=>{const h=clock.hour;return h<10.5?J('朝ごはん','breakfast'):h<15.5?J('お昼ごはん','lunch'):J('夕ごはん','dinner')};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
let houseMealCtx=null;const houseMeal=()=>houseMealCtx&&houseMealCtx.mealName;

