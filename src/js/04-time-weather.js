// ================= time & weather =================
const DAY=180, HR=DAY/24, START_H=6.8;
const clock={sim:0,hour:START_H,day:1,speed:1,lastDay:1,lastHourInt:6};
const weather={kind:'clear',until:0,rainbowUntil:0,festUntil:0,plan:null};
function setWeather(kind,hours){weather.kind=kind;weather.until=clock.sim+hours*HR}
const mealName=()=>{const h=clock.hour;return h<10.5?J('朝ごはん','breakfast'):h<15.5?J('お昼ごはん','lunch'):J('夕ごはん','dinner')};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
let houseMealCtx=null;const houseMeal=()=>houseMealCtx&&houseMealCtx.mealName;

