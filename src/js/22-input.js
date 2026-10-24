// ================= input =================
const pointers=new Map();let drag=null,pinch=null;
// 見えない住人: 外観では家の中の人、内観ではほかの階にいる人
const hiddenW=w=>{const t=w.link&&w.t>.5?w.link.to:w.tile;if(!interior)return!!(w.tile.indoor||(w.link&&w.link.to.indoor));return!!(t.indoor&&t.bld&&t.level!==effFloor(t.bld))};
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const[a,b]=[...pointers.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.tzoom};drag=null}
  else drag={x:e.clientX,y:e.clientY,az:cam.taz,el:cam.tel,moved:false}});
cv.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&pointers.size>=2){const[a,b]=[...pointers.values()];cam.tzoom=clamp(pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d,.7,3.5);cam.zoom=cam.tzoom;return}
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)>6)drag.moved=true;if(drag.moved){cam.taz=drag.az+.006*dx;cam.tel=clamp(drag.el+.005*dy,.25,1.1)}});
function endPointer(e){pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;
  if(drag&&!drag.moved&&e.type==='pointerup'){const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=Math.max(18,.75*cam.scale);
    walkers.forEach(w=>{if(hiddenW(w))return;const hp=headPoint(w),p=project(walkerPos(w)),cy=(hp[1]+p[1])/2+.15*cam.scale,d=Math.hypot(hp[0]-x,cy-y);if(d<bd){bd=d;best=w}});
    if(best)select(best);
    else{let bv=null,bvd=Math.max(16,.6*cam.scale);VOCAB.forEach(v=>{if(!vocabShown(v))return;const p=project(v.pos),d=Math.hypot(p[0]-x,p[1]-y);if(d<bvd){bvd=d;bv=v}});
      if(bv)openWord(bv);else{select(null);wordCard.hidden=true;logEl.hidden=false}}}
  drag=null}
cv.addEventListener('pointerup',endPointer);cv.addEventListener('pointercancel',endPointer);
cv.addEventListener('wheel',e=>{e.preventDefault();cam.tzoom=clamp(cam.tzoom*Math.exp(-e.deltaY*.0015),.7,3.5)},{passive:false});
window.addEventListener('keydown',e=>{if(fpv.on||e.target.tagName==='INPUT')return;const k=e.key;
  if(k==='ArrowLeft'||k==='ArrowRight'){cam.taz+=k==='ArrowLeft'?.15:-.15;e.preventDefault()}
  else if(k==='ArrowUp'||k==='ArrowDown'){cam.tel=clamp(cam.tel+(k==='ArrowUp'?.08:-.08),.25,1.1);e.preventDefault()}
  else if(k==='+'||k==='=')cam.tzoom=clamp(cam.tzoom*1.25,.7,3.5);else if(k==='-')cam.tzoom=clamp(cam.tzoom/1.25,.7,3.5)});
window.addEventListener('resize',resize);

