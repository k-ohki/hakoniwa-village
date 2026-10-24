// ================= boot =================
const _sv=readSave();if(_sv){restoreTown(_sv)}
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;S.time+=dt;frame(dt);requestAnimationFrame(loop)}
resize();basis();tickClock();applyLang();if(_sv){log(TUI.resumed)}else log(J('1日目の朝。村の一日がはじまる','Day 1. A new day begins in the village.'));started=true;
if(TEST)TEST.api={cam,clock,walkers,S,boxes,tiles,buildings,SPOTS,ACTS,sep,sanitizeSpec,findSpot,placeBuilding,removeBuilding,offlineSpec,planAct,setPlan,setViewFloor,bfs,step(n,dt){for(let i=0;i<n;i++){S.time+=dt;frame(dt)}},
  setView(o){if('interior'in o){interior=o.interior;updateFloorBtn()}if('floor'in o)setViewFloor(o.floor);if('az'in o)cam.az=cam.taz=o.az;if('el'in o)cam.el=cam.tel=o.el;if('zoom'in o)cam.zoom=cam.tzoom=o.zoom;basis()}};
else requestAnimationFrame(loop);
