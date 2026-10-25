// ================= clock =================
// 実時間 dt だけ町を進め、町の中で進んだ秒数を返す
function advanceClock(dt){const sdt=dt*paceAt(clock.hour);clock.sim+=sdt;clock.gh+=sdt/HR;tickClock();return sdt}
function tickClock(){
  const total=START_H+clock.gh;clock.hour=total%24;clock.day=1+Math.floor(total/24);
  if(clock.day!==clock.lastDay){clock.lastDay=clock.day;const roll=Math.random();weather.plan=roll<.22?{kind:'rain',at:9+Math.random()*7,hours:2+Math.random()*2}:roll<.27&&clock.day%3===0?{kind:'snow',at:8+Math.random()*6,hours:3}:null}
  const hi=Math.floor(clock.hour);if(hi!==clock.lastHourInt){clock.lastHourInt=hi;if(hi===6)log(J(`${clock.day}日目の朝。村が目をさました`,`Day ${clock.day}. Good morning, village!`));if(hi===23)log(J('夜がふけて、家の明かりが消えていく','It\'s late. The lights in the houses go out.'));if(typeof growthCheck==='function'&&started)growthCheck()}
}

