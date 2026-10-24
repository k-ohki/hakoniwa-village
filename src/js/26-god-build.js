// ================= generated buildings (voice of God) =================
// 神の声の建物は、町の建物と同じ設計図の形式（09-builder.js）で作る。Claude の返す設計図は信用せず、sanitizeSpec で必ず整える。
const MAX_GEN=24;
const genBuildings=()=>buildings.filter(b=>!b.fixed);
const toHex=c=>'#'+c.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
const str=(v,n)=>String(v??'').slice(0,n);
const num=(v,a,b,fb)=>{const x=Number(v);return isFinite(x)?clamp(x,a,b):fb};
const int=(v,a,b,fb)=>{const x=Math.round(Number(v));return isFinite(x)?clamp(x,a,b):fb};
const hexOut=c=>{const v=col(c,null);return v?toHex(v):undefined};
const cellIn=(c,w,d)=>Array.isArray(c)&&c.length>=2&&[int(c[0],0,w-1,0),int(c[1],0,d-1,0)];
const GAINS=['fun','energy','social','food','hygiene'];

function sanAct(a,i){
  if(!a||typeof a!=='object'||!a.label_en)return null;
  const g={};GAINS.forEach(k=>{const v=Number(a.gain&&a.gain[k]);if(isFinite(v)&&v)g[k]=clamp(v,-.3,.8)});if(!Object.keys(g).length)g.fun=.3;
  const key=/^[a-z0-9_]{1,20}$/.test(String(a.key||''))?a.key:'a'+i;
  const rng=r=>Array.isArray(r)&&r.length===2?[num(r[0],0,24,0),num(r[1],0,24,24)]:null;
  let h=Array.isArray(a.hours)&&Array.isArray(a.hours[0])?a.hours.slice(0,4).map(rng).filter(Boolean):rng(a.hours);if(h&&!h.length)h=null;
  return{key,label_en:str(a.label_en,60),label_ja:str(a.label_ja||a.label_en,40),use_en:str(a.use_en||a.label_en,60),use_ja:str(a.use_ja||a.label_ja||a.label_en,40),
    phrase_en:str(a.phrase_en,90),phrase_ja:str(a.phrase_ja,60),gain:g,hours:h&&!(h[0]===0&&h[1]===24)?h:null,who:['kid','adult'].includes(a.who)?a.who:'all',days:a.days==='weekday'?'weekday':null};
}
function sanParts(list,[w,d,zmax],max,lo0=0){
  const out=[];
  for(const q of(Array.isArray(list)?list:[]).slice(0,max)){if(!q)continue;const a=(q.from||q.lo),b=(q.to||q.hi);if(!Array.isArray(a)||!Array.isArray(b))continue;
    const A=a.map(Number),B=b.map(Number);if(A.length<3||B.length<3||[...A,...B].some(v=>!isFinite(v)))continue;
    const lo=[clamp(Math.min(A[0],B[0]),lo0,w),clamp(Math.min(A[1],B[1]),lo0,d),clamp(Math.min(A[2],B[2]),0,zmax)],hi=[clamp(Math.max(A[0],B[0]),lo0,w),clamp(Math.max(A[1],B[1]),lo0,d),clamp(Math.max(A[2],B[2]),0,zmax)];
    if(hi[0]-lo[0]<.03||hi[1]-lo[1]<.03||hi[2]-lo[2]<.01)continue;
    out.push({shape:['box','prism','cylinder','cone'].includes(q.shape)?q.shape:'box',from:lo,to:hi,color:hexOut(q.color)||'#e6c8b4',top:hexOut(q.top),
      pattern:PATTERNS.has(q.pattern)?q.pattern:'none',topPattern:PATTERNS.has(q.topPattern)?q.topPattern:'none',axis:q.axis==='x'||q.axis==='y'?q.axis:undefined})}
  return out;
}
// 設計図を検査して、組み立てられる形にそろえる（Claude の返答・保存データの読み込みの両方で使う）
function sanitizeSpec(sp){
  if(!sp||typeof sp!=='object')return null;
  const enterable=!!sp.enterable,fp=Array.isArray(sp.footprint)?sp.footprint:[];
  const w=int(fp[0],enterable?3:1,enterable?12:6,enterable?5:2),d=int(fp[1],enterable?3:1,enterable?12:6,enterable?4:2);
  const floors=enterable?int(sp.floors,1,3,1):0,zmax=enterable?floors*WALL_H+3:6;
  const parts=sanParts(sp.parts,[w,d,zmax],80);
  if(!enterable&&!parts.length)return null;
  const acts=(Array.isArray(sp.activities)?sp.activities:[]).slice(0,6).map(sanAct).filter(Boolean);
  const seenKey=new Set();acts.forEach((a,i)=>{if(seenKey.has(a.key))a.key='a'+i;seenKey.add(a.key)});
  const out={v:2,name_en:str(sp.name_en,60)||'building',name_ja:str(sp.name_ja,40)||str(sp.name_en,40)||'建物',example_en:str(sp.example_en,100),example_ja:str(sp.example_ja,70),
    footprint:[w,d],near:LANDMARKS[sp.near]?sp.near:'center',parts};
  if(acts.length)out.activities=acts;else if(!enterable&&sp.activity){const a=sanAct(sp.activity,0);if(a)out.activity=a}
  const usable=k=>typeof k==='string'&&(seenKey.has(k)||(ACTS[k]&&!ACTS[k].home&&!ACTS[k].gen));
  out.uses=(Array.isArray(sp.uses)?sp.uses:[]).slice(0,6).filter(u=>u&&usable(u.act)&&Array.isArray(u.at)).map(u=>({act:u.act,at:u.at.slice(0,8).filter(c=>Array.isArray(c)).map(c=>[int(c[0],-1,w,0),int(c[1],-1,d,0)])}));
  if(!enterable){out.walkable=!!sp.walkable&&parts.every(q=>q.to[2]<=.12);return out}
  // ---- enterable building ----
  const st=sp.style||{};
  out.enterable=true;out.floors=floors;
  out.style={wall:hexOut(st.wall)||'#f6d6be',roof:hexOut(st.roof)||'#ec8c84',paper:hexOut(st.paper)||'#faf0e4',curtain:hexOut(st.curtain)||'#eca8a0',door:hexOut(st.door),
    roofShape:ROOF_SHAPES.includes(st.roofShape)?st.roofShape:'gable'};
  if(Array.isArray(st.chimney))out.style.chimney=cellIn(st.chimney,w,d);
  const dside=SIDES.includes(sp.door&&sp.door.side)?sp.door.side:'py',dlen=dside==='px'||dside==='nx'?d:w;
  out.door={side:dside,at:int(sp.door&&sp.door.at,0,dlen-1,Math.floor((dlen-1)/2))};
  if(sp.windows&&typeof sp.windows==='object'){out.windows={};for(const s of SIDES)if(Array.isArray(sp.windows[s])){const len=s==='px'||s==='nx'?d:w;out.windows[s]=sp.windows[s].slice(0,8).map(v=>num(v,.5,len-.5,len/2))}}
  const fl=v=>int(v,0,floors-1,0);
  out.rooms=(Array.isArray(sp.rooms)?sp.rooms:[]).slice(0,16).map((r,i)=>{const a=cellIn(r.from,w,d)||[0,0],b=cellIn(r.to,w,d)||[w-1,d-1];
    return{id:'r'+i,name_en:str(r.name_en,40)||'room',name_ja:str(r.name_ja,30)||str(r.name_en,30)||'部屋',floor:fl(r.floor),from:[Math.min(a[0],b[0]),Math.min(a[1],b[1])],to:[Math.max(a[0],b[0]),Math.max(a[1],b[1])],
      floorStyle:FLOOR_STYLES.includes(r.floorStyle)?r.floorStyle:'wood',color:hexOut(r.color)}});
  out.partitions=(Array.isArray(sp.partitions)?sp.partitions:[]).slice(0,30).map(p=>{if(!p)return null;
    if(p.y!=null&&Array.isArray(p.x)){const y=int(p.y,1,d-1,null);if(y==null)return null;const a=num(p.x[0],0,w,0),b=num(p.x[1],0,w,w);return b-a>=.5?{floor:fl(p.floor),y,x:[a,b]}:null}
    if(p.x!=null&&Array.isArray(p.y)){const x=int(p.x,1,w-1,null);if(x==null)return null;const a=num(p.y[0],0,d,0),b=num(p.y[1],0,d,d);return b-a>=.5?{floor:fl(p.floor),x,y:[a,b]}:null}
    return null}).filter(Boolean);
  // reserved cells: door inside, stairs
  const used=new Set(),ck=(c,lv)=>c[0]+','+c[1]+'@'+lv;
  const din=dside==='px'?[w-1,out.door.at]:dside==='nx'?[0,out.door.at]:dside==='ny'?[out.door.at,0]:[out.door.at,d-1];used.add(ck(din,0));
  out.stairs=[];
  if(floors>1)for(const s of(Array.isArray(sp.stairs)?sp.stairs:[]).slice(0,4)){const at=cellIn(s.at,w,d),dir=SIDES.includes(s.dir)?s.dir:'px',f=int(s.floor,0,floors-2,0);if(!at)continue;
    const v=FACE_VEC[dir],land=[at[0]+v[0],at[1]+v[1]];if(land[0]<0||land[1]<0||land[0]>=w||land[1]>=d)continue;
    const keys=[ck(at,f),ck(land,f),ck(at,f+1),ck(land,f+1)];if(keys.some(k=>used.has(k)))continue;keys.forEach(k=>used.add(k));out.stairs.push({at,dir,floor:f})}
  // 2階以上があるのに階段がなければ、入口から遠い角に置く
  for(let f=0;f<floors-1;f++)if(!out.stairs.some(s=>s.floor===f)){
    for(const[at,dir]of[[[w-2,0],'px'],[[0,0],'px'],[[w-2,d-1],'px'],[[0,d-1],'px'],[[w-1,0],'py'],[[0,0],'py']]){const v=FACE_VEC[dir],land=[at[0]+v[0],at[1]+v[1]];if(land[0]>=w||land[1]>=d||at[0]<0)continue;
      const keys=[ck(at,f),ck(land,f),ck(at,f+1),ck(land,f+1)];if(keys.some(k=>used.has(k)))continue;keys.forEach(k=>used.add(k));out.stairs.push({at,dir,floor:f});break}}
  out.furniture=[];
  for(const it of(Array.isArray(sp.furniture)?sp.furniture:[]).slice(0,90)){if(!it||!FURN[it.type])continue;const at=cellIn(it.at,w,d);if(!at)continue;const f=fl(it.floor);if(used.has(ck(at,f)))continue;used.add(ck(at,f));
    const o={type:it.type,at,floor:f,face:SIDES.includes(it.face)?it.face:'py'};const c=hexOut(it.color);if(c)o.color=c;const us=[].concat(it.use||[]).filter(usable).slice(0,3);if(us.length)o.use=us.length===1?us[0]:us;
    if(it.type==='custom'){o.parts=sanParts(it.parts,[.5,.5,2.4],12,-.5);if(!o.parts.length)continue;o.solid=!!it.solid;if(it.seat)o.seat=num(it.seat,.2,.9,.34);if(it.name_en){o.name_en=str(it.name_en,40);o.name_ja=str(it.name_ja,30)}}
    out.furniture.push(o)}
  out.decals=(Array.isArray(sp.decals)?sp.decals:[]).slice(0,12).map(g=>g&&{type:g.type==='mat'?'mat':'rug',floor:fl(g.floor),x:num(g.x,0,w,0),y:num(g.y,0,d,0),w:num(g.w,.2,w,1),h:num(g.h,.2,d,1),color:hexOut(g.color)}).filter(Boolean);
  return out;
}

// ---------- placement ----------
const doorOuter=(spec,x,y)=>{const[w,d]=spec.footprint,dr=spec.door||{side:'py',at:1},v=FACE_VEC[dr.side];
  const inner=dr.side==='px'?[w-1,dr.at]:dr.side==='nx'?[0,dr.at]:dr.side==='ny'?[dr.at,0]:[dr.at,d-1];return[x+inner[0]+v[0],y+inner[1]+v[1]]};
function canPlace(spec,cx,cy){
  const[w,d]=spec.footprint;
  for(let x=cx;x<cx+w;x++)for(let y=cy;y<cy+d;y++){const t=T(x,y);if(!t||t.tag!=='ground'||t.gen)return false}
  if(!spec.enterable&&spec.walkable)return true;
  // 道と広場の上には建てない
  for(let x=cx;x<cx+w;x++)for(let y=cy;y<cy+d;y++){const k=key(x,y);if(pathSet.has(k)||plazaSet.has(k))return false}
  const cells=new Set();for(let x=cx;x<cx+w;x++)for(let y=cy;y<cy+d;y++)cells.add(key(x,y));
  const start=townOrigin();if(!start||cells.has(key(start.pos[0],start.pos[1])))return false;
  const reach=skip=>{const seen=new Set([start]),q=[start];while(q.length){const o=q.shift();for(const l of o.links){const t=l.to;if(t.tag!=='ground'||seen.has(t)||(skip&&skip.has(key(t.pos[0],t.pos[1]))))continue;seen.add(t);q.push(t)}}return seen};
  const before=reach(null);let lost=0;before.forEach(t=>{if(cells.has(key(t.pos[0],t.pos[1])))lost++});
  const after=reach(cells);if(after.size!==before.size-lost)return false;
  if(spec.enterable){const dc=doorOuter(spec,cx,cy),t=T(...dc);if(!t||t.tag!=='ground'||cells.has(key(...dc))||!after.has(t))return false}
  return true;
}
function findSpot(spec){
  const[w,d]=spec.footprint,tgt=LANDMARKS[spec.near]||LANDMARKS.center,c=[];
  for(let x=0;x<=MW-w;x++)for(let y=0;y<=MH-d;y++){let pen=0;for(let i=x;i<x+w;i++)for(let j=y;j<y+d;j++){const k=key(i,j);if(pathSet.has(k)||plazaSet.has(k))pen+=spec.walkable?0:2.5}
    c.push({x,y,s:Math.hypot(x+(w-1)/2-tgt[0],y+(d-1)/2-tgt[1])+pen})}
  c.sort((a,b)=>a.s-b.s);
  for(const k of c)if(canPlace(spec,k.x,k.y))return k;
  return null;
}
function moveOff(o,cells,to){const inside=t=>t&&cells.has(key(t.pos[0],t.pos[1]));if(!inside(o.tile)&&!(o.link&&inside(o.link.to)))return;
  const nb=to||ground.find(g=>!cells.has(key(g.pos[0],g.pos[1]))&&Math.abs(g.pos[0]-o.tile.pos[0])+Math.abs(g.pos[1]-o.tile.pos[1])<=3)||ground[0];
  if(o.act)finishAct(o,true);o.link=null;o.tile=nb;if(o.player&&o.ppos)o.ppos=[nb.pos[0],nb.pos[1]];o.path=[];o.goal=null;o.target=null;o.act=null;o.wait=0}
const pathBroken=o=>o.path.length&&o.path.some(t=>T(t.pos[0],t.pos[1],t.level)!==t);
function placeBuilding(spec,pos,id,animate){
  const solidLot=spec.enterable||!spec.walkable,cells=new Set();
  for(const[x,y]of footCells(spec,pos))cells.add(key(x,y));
  if(solidLot){walkers.forEach(o=>moveOff(o,cells));for(const[x,y]of footCells(spec,pos)){const t=T(x,y);if(t)dropTile(t)}}
  const bld=buildBuilding(spec,pos,{id,animate});
  if(id){const n=Number(String(id).slice(1));if(n>=bldSeq)bldSeq=n+1}
  if(!solidLot)bld.cells.forEach(([x,y])=>{const t=T(x,y);if(t)t.gen=bld.id});
  relinkAround(bld.cells.concat(bld.door?[bld.door[1]]:[]));
  walkers.forEach(o=>{if(pathBroken(o)){o.path=[];o.goal=null;o.target=null}});
  buildings.forEach(refreshExtSpots);
  if(typeof addStructGL==='function'&&gl)addStructGL(bld);
  updateFloorBtn();
  return bld;
}
const footCells=(spec,pos)=>{const out=[];for(let x=0;x<spec.footprint[0];x++)for(let y=0;y<spec.footprint[1];y++)out.push([pos.x+x,pos.y+y]);return out};
function removeBuilding(id){
  const bld=bldById(id);if(!bld||bld.fixed)return null;
  buildings.splice(buildings.indexOf(bld),1);
  for(const b of bld.boxes){const k=boxes.indexOf(b);if(k>=0)boxes.splice(k,1)}
  for(const p of bld.polys){const k=polys.indexOf(p);if(k>=0)polys.splice(k,1)}
  for(const v of bld.vocab){const k=VOCAB.indexOf(v);if(k>=0)VOCAB.splice(k,1)}
  for(const aid of bld.acts){walkers.forEach(o=>{if(o.act&&o.act.id===aid){o.act=null;o.wait=0}if(o.goal&&o.goal.id===aid){o.goal=null;o.path=[];o.target=null}});
    (SPOTS[aid]||[]).slice().forEach(t=>dropSpot(aid,t));delete SPOTS[aid];delete ACTS[aid];const ai=ACT_IDS.indexOf(aid);if(ai>=0)ACT_IDS.splice(ai,1)}
  for(const t of bld.extSpotTiles||[])for(const u of bld.extUses)dropSpot(u.aid,t);
  const cells=new Set(bld.cells.map(([x,y])=>key(x,y))),out=bld.door&&T(...bld.door[1]);
  walkers.forEach(o=>{if(o.tile.bld===bld||(o.link&&o.link.to.bld===bld)){const t=out||ground[0];if(o.act)finishAct(o,true);o.link=null;o.tile=t;if(o.player&&o.ppos)o.ppos=[t.pos[0],t.pos[1]];o.path=[];o.goal=null;o.target=null;o.act=null;o.wait=0}});
  bld.tiles.forEach(dropTile);
  if(bld.enterable||!bld.spec.walkable)for(const[x,y]of bld.cells){if(!T(x,y))ground.push(tile(x,y,0,{tag:'ground'}))}
  else bld.cells.forEach(([x,y])=>{const t=T(x,y);if(t)delete t.gen});
  relinkAround(bld.cells);
  walkers.forEach(o=>{if(pathBroken(o)){o.path=[];o.goal=null;o.target=null}});
  buildings.forEach(refreshExtSpots);
  if(typeof removeStructGL==='function'&&gl)removeStructGL(bld.id);
  updateFloorBtn();saveBuilds();return bld;
}
function saveBuilds(){try{localStorage.setItem('hakoniwa-builds',JSON.stringify(genBuildings().map(s=>({id:s.id,spec:s.spec,x:s.cx,y:s.cy,by:s.by,wish:s.wish}))))}catch(e){}}
function loadBuilds(){try{const a=JSON.parse(localStorage.getItem('hakoniwa-builds')||'[]');if(!Array.isArray(a))return;
  for(const r of a.slice(0,MAX_GEN)){const sp=r&&sanitizeSpec(r.spec);if(!sp||!canPlace(sp,r.x,r.y))continue;
    const st=placeBuilding(sp,{x:r.x,y:r.y},String(r.id),false);if(r.by){st.by=String(r.by).slice(0,20);st.wish=String(r.wish||'').slice(0,80)}}}catch(e){}}
function structSummary(){const g=genBuildings();return g.length?g.map(s=>`${s.id}: ${s.spec.name_en} (${s.spec.name_ja}) at (${s.cx},${s.cy})${s.enterable?`, ${s.floors} floor(s), enterable`:''}`).join('\n'):'(none)'}

// ---------- the design brief for Claude ----------
function buildPrompt(desc,voice,note,who){
  const furn=FURN_TYPES.map(k=>`${k} (${FURN[k].ja})`).join(', ');
  const pub=ACT_IDS.filter(k=>!ACTS[k].home&&!ACTS[k].gen&&!ACTS[k].random&&k!=='chat').join(', ');
  return `You design a structure for a cozy isometric town diorama (pastel, toy-like, like a dollhouse town). Anything is possible: a small object, a statue, or a full building people walk into (a school, a shop, a cafe, a library, a department store, a castle...).
Request from ${who||'the town god'}: "${voice}"
Design brief: ${desc}${note?`\n${note}`:''}

Scale: 1 unit = one grid cell. A person is about 1 unit tall. One storey is ${WALL_H} high, a door is about 1.1 high, a tree is about 1.6 tall.
The town is ${MW}x${MH} cells and mostly built up. Big buildings (6x5 to 7x10 cells) fit only on the vacant land in the east: use "near":"vacant" or "vacantNorth" for them.

Two kinds of design:
A) Object (statue, fountain, playground, tower, sign...): "enterable": false. Built only from "parts".
B) Building people enter: "enterable": true. Walls, windows, floors, door and roof are made for you. You lay out the inside.

Coordinates:
- "parts" use continuous local coordinates: x from 0 to footprint width, y from 0 to footprint depth, z up from 0. Front faces face +x and +y.
- Cells are integers [col,row] from [0,0] to [width-1,depth-1].
- "partitions" (low inner walls) lie on cell borders: {"floor":0,"x":3,"y":[0,4]} is a wall on the line x=3 from y=0 to y=4; {"floor":0,"y":2,"x":[0,5]} runs along y=2. Leave gaps so every room can be reached from the door.
Shapes for parts: "box" (axis-aligned), "prism" (gable roof filling its box, ridge along "axis" x or y), "cylinder" (12-sided, inscribed in its box), "cone" (inscribed in its box, apex at the top).
Patterns for box sides: none, windows, door, bricks, stripes, planks, tiles, glass, water, grass, dots. topPattern for box tops (water, grass, tiles...). "roof" adds roof lines to prisms.
Colors: soft pastels that fit peach walls (#f6d6be), coral roofs (#ec8c84), teal (#78aab4), mint (#b2e2ce), cream (#fcf0de), wood (#c69678), lavender stone (#b6a4d6). Bright accents are fine when asked for.

For an enterable building:
- "floors": 1-3. "style": {"wall":"#hex","roof":"#hex","paper":"#hex inner wall","curtain":"#hex","door":"#hex","roofShape":"gable|flat|tiered|none"}.
- "door": {"side":"py|px|nx|ny","at":cell index along that side}. py = the +y side (front). Keep the cell inside the door free.
- "rooms": [{"name_en","name_ja","floor":0,"from":[c,r],"to":[c,r],"floorStyle":"wood|tile|carpet|stone","color":"#hex"}] (floor look and room labels).
- "furniture": [{"type":..., "at":[c,r], "floor":0, "face":"py|px|nx|ny" (the side people use it from), "color":"#hex", "use": activity key}]. One item per cell. Types: ${furn}.
  "custom" furniture takes "parts" in cell-local coords (x,y from -0.5 to 0.5, z 0-2.4), "solid": true or "seat": 0.34, and "name_en"/"name_ja".
  Seats (chair, sofa, desk, bench, seat custom) are used by sitting on them; other items are used from the cell in front ("face" side). Leave walking space.
- "stairs": [{"at":[c,r],"dir":"px","floor":0}] go from cell at on that floor to the next cell along dir on the floor above. Needed for every upper floor.
- "decals": [{"type":"rug|mat","floor":0,"x":1,"y":1,"w":2,"h":1.5,"color":"#hex"}] in continuous coords.
- Extra outside "parts" are allowed (signboard, awning, chimney, tower) using the same continuous coords; parts above the roof line show only from outside.

"activities": up to 6 things people do there: [{"key":"study","label_en":"studying in class","label_ja":"授業を受ける","use_en":"Study","use_ja":"勉強する","phrase_en":"Let's open our books.","phrase_ja":"教科書を開こう。","gain":{"fun":0.2,"social":0.3},"hours":[8,15],"who":"all|kid|adult"}].
gain values are per hour (-0.3 to 0.6) for fun, energy, social, food, hygiene. hours = open hours (omit for always).
Attach an activity to furniture with "use":"key", or to cells outside an object with "uses":[{"act":"key","at":[[dx,dy],...]}] (cells next to the footprint, e.g. [-1,0] or [width,0]).
You may also use these existing town activities as "use": ${pub}.
"walkable": true only for flat objects people walk on (top z <= 0.12). "near": one of ${Object.keys(LANDMARKS).join(', ')}.

Reply with JSON only. Object example:
{"name_en":"fountain","name_ja":"噴水","example_en":"Let's meet at the fountain.","example_ja":"噴水のところで会おう。","enterable":false,"footprint":[2,2],"near":"plaza",
"parts":[{"shape":"cylinder","from":[0.1,0.1,0],"to":[1.9,1.9,0.3],"color":"#b6a4d6","top":"#88c2e2","pattern":"bricks","topPattern":"water"},{"shape":"cylinder","from":[0.8,0.8,0.3],"to":[1.2,1.2,1.0],"color":"#fcf0de"}],
"activities":[{"key":"rest","label_en":"resting by the fountain","label_ja":"噴水のそばで休憩","use_en":"Rest by the fountain","use_ja":"噴水のそばで休む","phrase_en":"The water sounds so nice.","phrase_ja":"水の音が気持ちいいね。","gain":{"fun":0.3,"energy":0.2}}],
"uses":[{"act":"rest","at":[[-1,0],[2,1],[0,2]]}]}
Building example:
{"name_en":"bakery","name_ja":"パン屋","example_en":"I buy bread at the bakery.","example_ja":"パン屋でパンを買います。","enterable":true,"floors":1,"footprint":[5,4],"near":"plaza",
"style":{"wall":"#fcf0de","roof":"#c69678","roofShape":"gable"},"door":{"side":"py","at":2},
"rooms":[{"name_en":"shop","name_ja":"売り場","floor":0,"from":[0,0],"to":[4,3],"floorStyle":"tile","color":"#eee2d0"}],
"furniture":[{"type":"display","at":[0,0],"face":"py","color":"#f6d6be","use":"buy"},{"type":"display","at":[1,0],"face":"py","use":"buy"},{"type":"register","at":[3,1],"face":"py"},{"type":"table","at":[0,2]},{"type":"chair","at":[1,2],"face":"nx","use":"eat_bread"},{"type":"plant","at":[4,3]}],
"activities":[{"key":"buy","label_en":"buying bread","label_ja":"パンを買う","use_en":"Buy bread","use_ja":"パンを買う","phrase_en":"This bread smells great!","phrase_ja":"このパン、いいにおい！","gain":{"food":0.4,"fun":0.2},"hours":[7,19]},
{"key":"eat_bread","label_en":"eating bread","label_ja":"パンを食べる","use_en":"Eat bread","use_ja":"パンを食べる","phrase_en":"So soft and warm.","phrase_ja":"ふわふわであったかい。","gain":{"food":0.6,"social":0.2},"hours":[7,19]}],
"parts":[{"shape":"box","from":[1.5,3.9,1.2],"to":[3.5,4.05,1.5],"color":"#ec8c84"}]}`;
}
function offlineSpec(text){
  const t=text.toLowerCase(),has=(...k)=>k.some(x=>t.includes(x));
  if(has('カフェ','喫茶','cafe','coffee','パン','bakery'))return{name_en:'cafe',name_ja:'カフェ',example_en:'Let\'s have tea at the cafe.',example_ja:'カフェでお茶しよう。',enterable:true,floors:1,footprint:[5,4],near:'plaza',
    style:{wall:'#fcf0de',roof:'#c69678',roofShape:'gable'},door:{side:'py',at:2},rooms:[{name_en:'cafe',name_ja:'カフェ',from:[0,0],to:[4,3],floorStyle:'wood',color:'#e6c8a4'}],
    furniture:[{type:'counter',at:[0,0],face:'py'},{type:'counter',at:[1,0],face:'py'},{type:'display',at:[2,0],face:'py',color:'#f6d6be'},{type:'table',at:[1,2]},{type:'chair',at:[0,2],face:'px',use:'tea'},{type:'chair',at:[2,2],face:'nx',use:'tea'},
      {type:'table',at:[4,1]},{type:'chair',at:[4,2],face:'ny',use:'tea'},{type:'plant',at:[4,3]}],
    activities:[{key:'tea',label_en:'having tea at the cafe',label_ja:'カフェでお茶をする',use_en:'Have some tea',use_ja:'お茶を飲む',phrase_en:'This tea is lovely.',phrase_ja:'このお茶、おいしいね。',gain:{food:.3,social:.4,fun:.2},hours:[8,20]}]};
  if(has('噴水','fountain'))return{name_en:'fountain',name_ja:'噴水',example_en:'Let\'s meet at the fountain.',example_ja:'噴水のところで会おう。',footprint:[2,2],near:'plaza',parts:[{shape:'cylinder',from:[.1,.1,0],to:[1.9,1.9,.3],color:'#b6a4d6',top:'#88c2e2',pattern:'bricks',topPattern:'water'},{shape:'cylinder',from:[.75,.75,.3],to:[1.25,1.25,.9],color:'#fcf0de'},{shape:'cylinder',from:[.5,.5,.9],to:[1.5,1.5,1],color:'#fcf0de',top:'#88c2e2'},{shape:'cone',from:[.85,.85,1],to:[1.15,1.15,1.3],color:'#a8dcf0'}],activity:{label_en:'resting by the fountain',label_ja:'噴水のそばで休憩',use_en:'Rest by the fountain',use_ja:'噴水のそばで休む',phrase_en:'The water sounds so nice.',phrase_ja:'水の音が気持ちいいね。',gain:{fun:.3,energy:.2}}};
  if(has('塔','タワー','tower'))return{name_en:'tower',name_ja:'塔',example_en:'You can see the whole village from the tower.',example_ja:'塔から村全体が見えるよ。',footprint:[2,2],near:'north',parts:[{shape:'cylinder',from:[.2,.2,0],to:[1.8,1.8,1.4],color:'#f6d6be',pattern:'bricks'},{shape:'cylinder',from:[.3,.3,1.4],to:[1.7,1.7,2.6],color:'#fcf0de',pattern:'windows'},{shape:'cylinder',from:[.15,.15,2.6],to:[1.85,1.85,2.75],color:'#ec8c84'},{shape:'cone',from:[.2,.2,2.75],to:[1.8,1.8,3.8],color:'#ec8c84'}]};
  if(has('木','tree'))return{name_en:'big tree',name_ja:'大きな木',example_en:'Let\'s rest under the big tree.',example_ja:'大きな木の下で休もう。',footprint:[1,1],near:'center',parts:[{shape:'cylinder',from:[.4,.4,0],to:[.6,.6,.8],color:'#b98a76'},{shape:'cone',from:[.05,.05,.6],to:[.95,.95,1.6],color:'#8cc795'},{shape:'cone',from:[.15,.15,1.2],to:[.85,.85,2.1],color:'#a9dca8'}]};
  const name=text.replace(/(を|の)?(建てて|作って|置いて|つくって|たてて).*/,'').slice(0,12)||'小屋';
  return{name_en:'little house',name_ja:name,example_en:'Look at the little house!',example_ja:`${name}を見て！`,footprint:[2,2],near:'center',parts:[{shape:'box',from:[.2,.2,0],to:[1.8,1.8,1.1],color:'#f6d6be',pattern:'door'},{shape:'prism',from:[.1,.1,1.1],to:[1.9,1.9,1.8],color:'#ec8c84',pattern:'roof',axis:'x'}],activity:{label_en:'visiting the little house',label_ja:`${name}に遊びに行く`,use_en:'Look around',use_ja:'見てまわる',phrase_en:'What a cute little house!',phrase_ja:'かわいい建物だね！',gain:{fun:.3}}};
}
async function buildFromVoice(desc,voice){
  log(J('建設中…','Building...'),'god-line');
  let spec=null;
  if(sample){try{const r=await sample.json(buildPrompt(desc,voice),{modelTier:'default',cache:false});spec=sanitizeSpec(r)}catch(err){const c=err&&err.code;if(c==='not_granted'||c==='sampling_disabled')sample=null;if(c==='rate_limited'){log(J('いまは建てられません。少し待ってからもう一度','Cannot build right now. Try again in a moment.'));return}}}
  if(!spec)spec=sanitizeSpec(offlineSpec(voice));
  if(!spec)return;
  if(genBuildings().length>=MAX_GEN){log(J('これ以上は建てられません。何か壊してから建ててください','There is no more room. Remove something first.'));return}
  const pos=findSpot(spec);
  if(!pos){log(J(`「${spec.name_ja}」を置ける場所がありませんでした`,`There was no room for the ${spec.name_en}.`));return}
  const st=placeBuilding(spec,pos,null,true);saveBuilds();
  log(J(`${spec.name_ja}ができた！`,`A ${spec.name_en} appeared!`),'god-line');
  const fans=people.filter(w=>!w.player&&!sleepTime(w)).sort(()=>Math.random()-.5).slice(0,3);
  fans.forEach((w,i)=>{say(w,pick([J(`わあ、${spec.name_ja}だ！`,`Wow, a ${spec.name_en}!`),J('すごい！行ってみよう！','Amazing! Let\'s go see it!'),J(`${spec.name_ja}ができたね！`,`Look, a new ${spec.name_en}!`)]),5);
    const aid=st.acts[0];if(aid&&!w.tile.stop){const p=planAct(w,aid);if(p){w.forced=p}}});
  if(!cam.follow&&!fpv.on){cam.tzoom=Math.max(cam.tzoom,1)}
  return st;
}
