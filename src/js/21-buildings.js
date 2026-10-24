// ================= generated buildings (voice of God) =================
const structures=[];const genPolys=[];let structSeq=1;
const LANDMARKS={plaza:[8,11],pond:[15.2,12.3],field:[1.5,13],houseA:[3.5,3.5],houseB:[12.5,3.5],well:[16,3],stall:[8,3],bench:[6,13],center:[8.5,8],north:[8,1],south:[8,14.5],east:[16.5,8],west:[.5,8]};
const hexC=(s,fb)=>{const m=/^#?([0-9a-f]{6})$/i.exec(String(s||'').trim());if(!m)return fb;const v=parseInt(m[1],16);return[(v>>16)&255,(v>>8)&255,v&255]};
const PATTERNS=new Set(['windows','door','bricks','stripes','planks','tiles','glass','water','grass','dots','roof']);
function drawPattern(pat,b,f,W,H,c){
  if(!pat||pat==='none')return;
  const lite=rgb(c,1.12),dark=rgb(c,.82);
  switch(pat){
    case'windows':{const g=mix(A(P.glass),[255,206,126],nightK*.85);for(let v=.35;v+.45<=H;v+=.9)for(let u=.35;u+.3<=W;u+=.75){N.fillStyle=rgbA(P.wallTrim);N.fillRect(u-.04,v-.04,.38,.53);N.fillStyle=rgb(g,1,.9);N.fillRect(u,v,.3,.45);N.fillStyle=rgbA(P.wallTrim,1,.8);N.fillRect(u+.135,v,.03,.45)}break}
    case'door':{if(f.key!=='py'&&f.key!=='px'){drawPattern('windows',b,f,W,H,c);break}const dw=Math.min(.6,W*.5),dh=Math.min(1.05,H*.8);N.fillStyle=rgbA(P.wallTrim);N.beginPath();arch(W/2,0,dw+.12,dh+.08);N.fill();N.fillStyle=rgbA(mix(P.coral,[120,70,90],.35));N.beginPath();arch(W/2,0,dw,dh);N.fill();N.fillStyle=rgbA(P.gold);N.fillRect(W/2+dw*.25,dh*.42,.06,.06);break}
    case'bricks':{N.fillStyle=dark;for(let v=0,row=0;v<H;v+=.18,row++){N.fillRect(0,v,W,.025);for(let u=(row%2)*.2;u<W;u+=.4)N.fillRect(u,v,.025,.18)}break}
    case'stripes':{N.fillStyle=lite;for(let u=0;u<W;u+=.4)N.fillRect(u,0,.2,H);break}
    case'planks':{N.fillStyle=dark;for(let v=.2;v<H;v+=.2)N.fillRect(0,v,W,.025);break}
    case'tiles':{N.fillStyle=dark;for(let v=0;v<H;v+=.25)N.fillRect(0,v,W,.02);for(let u=0;u<W;u+=.25)N.fillRect(u,0,.02,H);break}
    case'glass':{N.fillStyle=rgb(mix(c,[190,220,245],.6));N.fillRect(.04,.04,W-.08,H-.08);N.strokeStyle='rgba(255,255,255,0.6)';N.lineWidth=.05;N.beginPath();N.moveTo(W*.2,H*.2);N.lineTo(W*.45,H*.75);N.stroke();break}
    case'water':{N.fillStyle=rgbA(mix(P.water,[60,80,140],nightK*.3));N.fillRect(.06,.06,W-.12,H-.12);N.strokeStyle=rgbA([226,244,252],1,.7);N.lineWidth=.035;for(let k=0;k<3;k++){const ph=(S.time*.4+k/3)%1;N.globalAlpha=1-ph;N.beginPath();N.ellipse(W/2,H/2,(.1+ph*.4)*W/1.2,(.1+ph*.4)*H/1.2,0,0,2*Math.PI);N.stroke()}N.globalAlpha=1;break}
    case'grass':{N.fillStyle=rgbA(P.grass);N.fillRect(0,0,W,H);N.fillStyle=rgbA([150,200,140]);for(let k=0;k<W*H*12;k++){N.beginPath();N.arc(hash(k*1.3+b.id)*W,hash(k*2.1+b.id)*H,.05,0,2*Math.PI);N.fill()}break}
    case'dots':{N.fillStyle=lite;for(let v=.2;v<H;v+=.35)for(let u=.2+((v*10|0)%2)*.17;u<W;u+=.35){N.beginPath();N.arc(u,v,.07,0,2*Math.PI);N.fill()}break}
    case'roof':{N.fillStyle=dark;for(let u=.2;u<W;u+=.35)N.fillRect(u,0,.04,H);break}
  }
}
// convex shapes as faces
function polyFaces(shape,lo,hi,axis){
  const[x0,y0,z0]=lo,[x1,y1,z1]=hi,cx=(x0+x1)/2,cy=(y0+y1)/2,F=[];
  if(shape==='prism'){
    const ax=axis==='y'?'y':axis==='x'?'x':(x1-x0>=y1-y0?'x':'y');
    if(ax==='x'){F.push([[x0,y0,z0],[x1,y0,z0],[x1,cy,z1],[x0,cy,z1]],[[x1,y1,z0],[x0,y1,z0],[x0,cy,z1],[x1,cy,z1]],[[x0,y1,z0],[x0,y0,z0],[x0,cy,z1]],[[x1,y0,z0],[x1,y1,z0],[x1,cy,z1]])}
    else{F.push([[x1,y0,z0],[x1,y1,z0],[cx,y1,z1],[cx,y0,z1]],[[x0,y1,z0],[x0,y0,z0],[cx,y0,z1],[cx,y1,z1]],[[x0,y0,z0],[x1,y0,z0],[cx,y0,z1]],[[x1,y1,z0],[x0,y1,z0],[cx,y1,z1]])}
  }else{
    const n=12,rx=(x1-x0)/2,ry=(y1-y0)/2,ring=z=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,z]});
    const b=ring(z0);
    if(shape==='cone'){for(let i=0;i<n;i++)F.push([b[i],b[(i+1)%n],[cx,cy,z1]])}
    else{const t=ring(z1);for(let i=0;i<n;i++)F.push([b[i],b[(i+1)%n],t[(i+1)%n],t[i]]);F.push(t.slice())}
  }
  const c=[cx,cy,(z0+z1)/2];
  return F.map(pts=>{let n=norm(cross([pts[1][0]-pts[0][0],pts[1][1]-pts[0][1],pts[1][2]-pts[0][2]],[pts[2][0]-pts[0][0],pts[2][1]-pts[0][1],pts[2][2]-pts[0][2]]));
    const m=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length,a[2]+p[2]/pts.length],[0,0,0]);if(dot(n,[m[0]-c[0],m[1]-c[1],m[2]-c[2]])<0){n=n.map(v=>-v);pts=pts.slice().reverse()}return{pts,n}});
}
function drawPoly(p){
  const k=p.st.k;amb=ambOut;
  for(const f of p.faces){if(dot(f.n,cam.d)<=.001)continue;const top=f.n[2]>.7;let col=top?p.top:p.col;if(top){snowOn=true;col=snowy(col);snowOn=false}
    const c=rgb(shade(col,f.n));N.fillStyle=c;N.strokeStyle=c;N.lineWidth=.8;N.beginPath();f.pts.forEach((q,i)=>{const s=project([q[0],q[1],q[2]*k]);i?N.lineTo(s[0],s[1]):N.moveTo(s[0],s[1])});N.closePath();N.fill();N.stroke();
    if(p.pattern==='roof'&&!top&&cam.scale>8){N.strokeStyle=rgb(shade(col,f.n),.85);N.lineWidth=1;const a=f.pts[0],b=f.pts[1],d=f.pts[f.pts.length-1];for(let t=.25;t<1;t+=.25){const s1=project([a[0]+(d[0]-a[0])*t,a[1]+(d[1]-a[1])*t,(a[2]+(d[2]-a[2])*t)*k]),s2=project([b[0]+(f.pts[2][0]-b[0])*t,b[1]+(f.pts[2][1]-b[1])*t,(b[2]+(f.pts[2][2]-b[2])*t)*k]);N.beginPath();N.moveTo(s1[0],s1[1]);N.lineTo(s2[0],s2[1]);N.stroke()}}}
}
function prepPoly(p){const k=p.st.k;prepItem(p,p.lo,[p.hi[0],p.hi[1],Math.max(p.lo[2]+.01,p.hi[2]*k)])}
// validation
function sanitizeSpec(sp){
  if(!sp||typeof sp!=='object'||!Array.isArray(sp.parts))return null;
  const w=clamp(Math.round(Number(sp.footprint&&sp.footprint[0])||2),1,4),d=clamp(Math.round(Number(sp.footprint&&sp.footprint[1])||2),1,4);
  const parts=[];
  for(const q of sp.parts.slice(0,60)){if(!q||!Array.isArray(q.from)||!Array.isArray(q.to))continue;
    const a=q.from.map(Number),b=q.to.map(Number);if(a.length<3||b.length<3||[...a,...b].some(v=>!isFinite(v)))continue;
    const lo=[clamp(Math.min(a[0],b[0]),0,w),clamp(Math.min(a[1],b[1]),0,d),clamp(Math.min(a[2],b[2]),0,5)],hi=[clamp(Math.max(a[0],b[0]),0,w),clamp(Math.max(a[1],b[1]),0,d),clamp(Math.max(a[2],b[2]),0,5)];
    if(hi[0]-lo[0]<.03||hi[1]-lo[1]<.03||hi[2]-lo[2]<.01)continue;
    const shape=['box','prism','cylinder','cone'].includes(q.shape)?q.shape:'box';
    parts.push({shape,lo,hi,color:hexC(q.color,[230,200,180]),top:hexC(q.top,null),pattern:PATTERNS.has(q.pattern)?q.pattern:'none',topPattern:PATTERNS.has(q.topPattern)?q.topPattern:'none',axis:q.axis})}
  if(!parts.length)return null;
  const s=v=>String(v||'').slice(0,60);
  let act=null;if(sp.activity&&typeof sp.activity==='object'&&sp.activity.label_en){const a=sp.activity,g={};['fun','energy','social','food','hygiene'].forEach(k=>{const v=Number(a.gain&&a.gain[k]);if(isFinite(v)&&v)g[k]=clamp(v,-.3,.8)});if(!Object.keys(g).length)g.fun=.3;
    act={label_en:s(a.label_en),label_ja:s(a.label_ja||a.label_en),use_en:s(a.use_en||a.label_en),use_ja:s(a.use_ja||a.label_ja),phrase_en:String(a.phrase_en||'').slice(0,90),phrase_ja:String(a.phrase_ja||'').slice(0,60),gain:g}}
  return{name_en:s(sp.name_en)||'building',name_ja:s(sp.name_ja)||s(sp.name_en)||'建物',example_en:String(sp.example_en||'').slice(0,100),example_ja:String(sp.example_ja||'').slice(0,70),
    footprint:[w,d],walkable:!!sp.walkable,near:LANDMARKS[sp.near]?sp.near:'center',parts,activity:act};
}
// placement
function canPlace(cx,cy,w,d,walkable){
  for(let x=cx;x<cx+w;x++)for(let y=cy;y<cy+d;y++){const t=T(x,y);if(!t||t.tag!=='ground'||t.gen)return false}
  if(walkable)return true;
  const cells=new Set();for(let x=cx;x<cx+w;x++)for(let y=cy;y<cy+d;y++)cells.add(key(x,y));
  const start=T(...houses.A.door[1]);if(!start||cells.has(key(...houses.A.door[1])))return false;
  const reach=skip=>{const seen=new Set([start]),q=[start];while(q.length){const o=q.shift();for(const l of o.links){const t=l.to;if(t.tag!=='ground'||seen.has(t)||(skip&&skip.has(key(t.pos[0],t.pos[1]))))continue;seen.add(t);q.push(t)}}return seen};
  const before=reach(null);let lost=0;before.forEach(t=>{if(cells.has(key(t.pos[0],t.pos[1])))lost++});
  return reach(cells).size===before.size-lost;
}
function findSpot(spec){
  const[w,d]=spec.footprint,tgt=LANDMARKS[spec.near]||LANDMARKS.center,c=[];
  for(let x=0;x<=MW-w;x++)for(let y=0;y<=MH-d;y++){let pen=0;for(let i=x;i<x+w;i++)for(let j=y;j<y+d;j++){const k=key(i,j);if(pathSet.has(k)||plazaSet.has(k))pen+=spec.walkable?0:2.5}
    c.push({x,y,s:Math.hypot(x+(w-1)/2-tgt[0],y+(d-1)/2-tgt[1])+pen})}
  c.sort((a,b)=>a.s-b.s);
  for(const k of c.slice(0,160))if(canPlace(k.x,k.y,w,d,spec.walkable))return k;
  return null;
}
function relink(t){t.links=[];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const o=T(t.pos[0]+dx,t.pos[1]+dy);if(!o)continue;const dz=o.pos[2]-t.pos[2];if(Math.abs(dz)>.55||!edgeOK(t,o)||(t.stop&&o.stop))continue;t.links.push({to:o,dir:[dx,dy],dz})}}
function removeTileRefs(t){
  const gi=ground.indexOf(t);if(gi>=0)ground.splice(gi,1);
  for(const k in SPOTS){const a=SPOTS[k],i=a.indexOf(t);if(i>=0)a.splice(i,1)}
  if(typeof SPOTREG!=='undefined')SPOTREG.delete(t);
}
function placeStructure(spec,pos,id,animate){
  const st={id:id||('b'+(structSeq++)),spec,cx:pos.x,cy:pos.y,k:animate?0:1,boxes:[],polys:[],cells:[]};
  const ox=pos.x-.5,oy=pos.y-.5;
  for(const q of spec.parts){
    const lo=[q.lo[0]+ox,q.lo[1]+oy,q.lo[2]],hi=[q.hi[0]+ox,q.hi[1]+oy,q.hi[2]];
    if(q.shape==='box'){const deco={};if(q.pattern!=='none')['px','py','nx','ny'].forEach(k=>deco[k]='gen');if(q.topPattern!=='none')deco.top='genTop';
      const b=box(lo,hi,{side:q.color,top:q.top||mix(q.color,[255,255,255],.15),deco,genSide:q.pattern,genTop:q.topPattern,sid:st.id,st});st.boxes.push(b)}
    else{const p={kind:'poly',faces:polyFaces(q.shape,lo,hi,q.axis),lo,hi,col:q.color,top:q.top||q.color,pattern:q.pattern,st,sid:st.id};st.polys.push(p);genPolys.push(p)}
  }
  const[w,d]=spec.footprint;
  for(let x=pos.x;x<pos.x+w;x++)for(let y=pos.y;y<pos.y+d;y++){const t=T(x,y);if(!t)continue;st.cells.push([x,y]);
    if(spec.walkable){t.gen=st.id;continue}
    walkers.forEach(o=>{if(o.tile===t||(o.link&&o.link.to===t)){const nb=ground.find(g=>g!==t&&Math.abs(g.pos[0]-x)+Math.abs(g.pos[1]-y)<=2&&!(g.pos[0]>=pos.x&&g.pos[0]<pos.x+w&&g.pos[1]>=pos.y&&g.pos[1]<pos.y+d))||ground[0];o.link=null;o.tile=nb;if(o.player&&o.ppos)o.ppos=[nb.pos[0],nb.pos[1]];o.path=[];o.goal=null;o.target=null}});
    removeTileRefs(t);tileAt.delete(key(x,y));
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const o=T(x+dx,y+dy);if(o)o.links=o.links.filter(l=>l.to!==t)}}
  walkers.forEach(o=>{if(o.path.length&&o.path.some(t=>!tileAt.has(key(t.pos[0],t.pos[1]))||T(t.pos[0],t.pos[1])!==t)){o.path=[];o.goal=null;o.target=null}});
  // activity
  if(spec.activity){const a=spec.activity,aid='g_'+st.id;st.actId=aid;
    ACTS[aid]={label:J(a.label_ja,a.label_en),glyph:'♪',dur:[.6,1.3],gain:a.gain,created:clock.sim,gen:true,phrase:()=>a.phrase_en?J(a.phrase_ja||a.phrase_en,a.phrase_en):null};
    ACT_IDS.push(aid);if(typeof USE_T!=='undefined')USE_T[aid]=J(a.use_ja,a.use_en);
    refreshGenSpots(st)}
  const top=Math.max(...spec.parts.map(q=>q.hi[2]));
  st.vocab={word:spec.name_en,ja:spec.name_ja,ex:spec.example_en||`This is a ${spec.name_en}.`,exja:spec.example_ja||`これは${spec.name_ja}です。`,pos:[pos.x+w/2-.5,pos.y+d/2-.5,top+.15],sid:st.id};VOCAB.push(st.vocab);
  structures.push(st);
  if(typeof addStructGL==='function'&&gl)addStructGL(st);
  return st;
}
function refreshGenSpots(st){
  if(!st.actId)return;const[w,d]=st.spec.footprint,out=new Set();
  if(st.spec.walkable){st.cells.forEach(([x,y])=>{const t=T(x,y);if(t)out.add(t)})}
  else for(let x=st.cx-1;x<=st.cx+w;x++)for(let y=st.cy-1;y<=st.cy+d;y++){const inside=x>=st.cx&&x<st.cx+w&&y>=st.cy&&y<st.cy+d;if(inside)continue;const edge=(x>=st.cx&&x<st.cx+w)||(y>=st.cy&&y<st.cy+d);if(!edge)continue;const t=T(x,y);if(t&&t.tag==='ground')out.add(t)}
  SPOTS[st.actId]=[...out];if(typeof regSpot==='function')SPOTS[st.actId].forEach(t=>regSpot(t,[st.actId]));
}
function removeStructure(id){
  const i=structures.findIndex(s=>s.id===id);if(i<0)return null;const st=structures[i];structures.splice(i,1);
  for(const b of st.boxes){const k=boxes.indexOf(b);if(k>=0)boxes.splice(k,1)}
  for(const p of st.polys){const k=genPolys.indexOf(p);if(k>=0)genPolys.splice(k,1)}
  const vi=VOCAB.indexOf(st.vocab);if(vi>=0)VOCAB.splice(vi,1);
  if(st.actId){walkers.forEach(o=>{if(o.act&&o.act.id===st.actId){o.act=null;o.wait=0}if(o.goal&&o.goal.id===st.actId){o.goal=null;o.path=[];o.target=null}});
    delete ACTS[st.actId];const ai=ACT_IDS.indexOf(st.actId);if(ai>=0)ACT_IDS.splice(ai,1);(SPOTS[st.actId]||[]).forEach(t=>{const s=SPOTREG&&SPOTREG.get(t);if(s){s.delete(st.actId);if(!s.size)SPOTREG.delete(t)}});delete SPOTS[st.actId]}
  if(!st.spec.walkable)for(const[x,y]of st.cells){const t=tile(x,y,0,{tag:'ground'});ground.push(t);relink(t);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const o=T(x+dx,y+dy);if(o&&o!==t)relink(o)}}
  else st.cells.forEach(([x,y])=>{const t=T(x,y);if(t)delete t.gen});
  structures.forEach(refreshGenSpots);
  if(typeof removeStructGL==='function'&&gl)removeStructGL(st.id);
  saveBuilds();return st;
}
function saveBuilds(){try{localStorage.setItem('hakoniwa-builds',JSON.stringify(structures.map(s=>({id:s.id,spec:s.spec,x:s.cx,y:s.cy,by:s.by,wish:s.wish}))))}catch(e){}}
function loadBuilds(){try{const a=JSON.parse(localStorage.getItem('hakoniwa-builds')||'[]');if(!Array.isArray(a))return;
  for(const r of a.slice(0,24)){const sp=r&&r.spec&&sanitizeSpec({...r.spec,parts:r.spec.parts.map(q=>({...q,from:q.lo,to:q.hi,color:toHex(q.color),top:q.top?toHex(q.top):null}))});if(!sp)continue;
    if(!canPlace(r.x,r.y,sp.footprint[0],sp.footprint[1],sp.walkable))continue;const n=Number(String(r.id).slice(1));if(n>=structSeq)structSeq=n+1;{const st=placeStructure(sp,{x:r.x,y:r.y},r.id,false);if(r.by){st.by=String(r.by).slice(0,20);st.wish=String(r.wish||'').slice(0,80)}}}}catch(e){}}
const toHex=c=>'#'+c.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
function structSummary(){return structures.length?structures.map(s=>`${s.id}: ${s.spec.name_en} (${s.spec.name_ja}) at (${s.cx},${s.cy})`).join('\n'):'(none)'}

function buildPrompt(desc,voice,note,who){
  return `You design a small 3D structure for a cozy isometric village diorama (pastel, toy-like, like a dollhouse village).
Request from ${who||'the village god'}: "${voice}"
Design brief: ${desc}${note?`\n${note}`:''}

Scale: 1 unit = one grid cell. A villager is about 1 unit tall. House walls are 1.6 high, a door is about 1.1 high and 0.6 wide, a tree is about 1.6 tall.
Coordinates are local to the footprint: x from 0 to footprint width, y from 0 to footprint depth, z up from 0 (ground) to at most 5. Front faces face +x and +y.
Shapes: "box" (axis-aligned), "prism" (gable roof filling its box, ridge along "axis" x or y), "cylinder" (12-sided, inscribed in its box), "cone" (inscribed in its box, apex at the top).
Patterns for box sides: none, windows, door (door on the front face), bricks, stripes, planks, tiles, glass, water, grass, dots. topPattern for box tops (e.g. water for a pool, grass, tiles). "roof" pattern adds roof lines to prisms.
Use soft pastel colors that fit a village of peach walls (#f6d6be), coral roofs (#ec8c84), teal (#78aab4), mint (#b2e2ce), cream (#fcf0de), wood (#c69678), lavender stone (#b6a4d6). Bright accents are fine when the request asks for them.
Build it from 6-45 parts. Parts should touch rather than overlap (stack parts on top of each other, z of one = top of the one below). Make it recognizable and charming.
"walkable": true only for flat things people walk on (z top ≤ 0.12, like a stage floor or mosaic); otherwise false.
"near": where to put it, one of: ${Object.keys(LANDMARKS).join(', ')}.
"activity": what villagers can do there (or null if nothing). gain values are per hour, 0.1-0.6, keys from fun, energy, social, food, hygiene.

Reply with JSON only:
{"name_en":"fountain","name_ja":"噴水","example_en":"Let's meet at the fountain.","example_ja":"噴水のところで会おう。","footprint":[2,2],"walkable":false,"near":"plaza",
"parts":[{"shape":"cylinder","from":[0.1,0.1,0],"to":[1.9,1.9,0.3],"color":"#b6a4d6","top":"#88c2e2","pattern":"bricks","topPattern":"water"},{"shape":"cylinder","from":[0.8,0.8,0.3],"to":[1.2,1.2,1.0],"color":"#fcf0de"}],
"activity":{"label_en":"resting by the fountain","label_ja":"噴水のそばで休憩","use_en":"Rest by the fountain","use_ja":"噴水のそばで休む","phrase_en":"The water sounds so nice.","phrase_ja":"水の音が気持ちいいね。","gain":{"fun":0.3,"energy":0.2}}}`;
}
function offlineSpec(text){
  const t=text.toLowerCase(),has=(...k)=>k.some(x=>t.includes(x));
  const C=(h)=>h;
  if(has('噴水','fountain'))return{name_en:'fountain',name_ja:'噴水',example_en:'Let\'s meet at the fountain.',example_ja:'噴水のところで会おう。',footprint:[2,2],near:'plaza',parts:[{shape:'cylinder',from:[.1,.1,0],to:[1.9,1.9,.3],color:'#b6a4d6',top:'#88c2e2',pattern:'bricks',topPattern:'water'},{shape:'cylinder',from:[.75,.75,.3],to:[1.25,1.25,.9],color:'#fcf0de'},{shape:'cylinder',from:[.5,.5,.9],to:[1.5,1.5,1],color:'#fcf0de',top:'#88c2e2'},{shape:'cone',from:[.85,.85,1],to:[1.15,1.15,1.3],color:'#a8dcf0'}],activity:{label_en:'resting by the fountain',label_ja:'噴水のそばで休憩',use_en:'Rest by the fountain',use_ja:'噴水のそばで休む',phrase_en:'The water sounds so nice.',phrase_ja:'水の音が気持ちいいね。',gain:{fun:.3,energy:.2}}};
  if(has('塔','タワー','tower'))return{name_en:'tower',name_ja:'塔',example_en:'You can see the whole village from the tower.',example_ja:'塔から村全体が見えるよ。',footprint:[2,2],near:'north',parts:[{shape:'cylinder',from:[.2,.2,0],to:[1.8,1.8,1.4],color:'#f6d6be',pattern:'bricks'},{shape:'cylinder',from:[.3,.3,1.4],to:[1.7,1.7,2.6],color:'#fcf0de',pattern:'windows'},{shape:'cylinder',from:[.15,.15,2.6],to:[1.85,1.85,2.75],color:'#ec8c84'},{shape:'cone',from:[.2,.2,2.75],to:[1.8,1.8,3.8],color:'#ec8c84'}],activity:null};
  if(has('木','tree'))return{name_en:'big tree',name_ja:'大きな木',example_en:'Let\'s rest under the big tree.',example_ja:'大きな木の下で休もう。',footprint:[1,1],near:'center',parts:[{shape:'cylinder',from:[.4,.4,0],to:[.6,.6,.8],color:'#b98a76'},{shape:'cone',from:[.05,.05,.6],to:[.95,.95,1.6],color:'#8cc795'},{shape:'cone',from:[.15,.15,1.2],to:[.85,.85,2.1],color:'#a9dca8'}],activity:null};
  const name=text.replace(/(を|の)?(建てて|作って|置いて|つくって|たてて).*/,'').slice(0,12)||'小屋';
  return{name_en:'little house',name_ja:name,example_en:'Look at the little house!',example_ja:`${name}を見て！`,footprint:[2,2],near:'center',parts:[{shape:'box',from:[.2,.2,0],to:[1.8,1.8,1.1],color:'#f6d6be',pattern:'door'},{shape:'prism',from:[.1,.1,1.1],to:[1.9,1.9,1.8],color:'#ec8c84',pattern:'roof',axis:'x'}],activity:{label_en:'visiting the little house',label_ja:`${name}に遊びに行く`,use_en:'Look around',use_ja:'見てまわる',phrase_en:'What a cute little house!',phrase_ja:'かわいい建物だね！',gain:{fun:.3}}};
}
async function buildFromVoice(desc,voice){
  log(J('建設中…','Building...'),'god-line');
  let spec=null;
  if(sample){try{const r=await sample.json(buildPrompt(desc,voice),{modelTier:'default',cache:false});spec=sanitizeSpec(r)}catch(err){const c=err&&err.code;if(c==='not_granted'||c==='sampling_disabled')sample=null;if(c==='rate_limited'){log(J('いまは建てられません。少し待ってからもう一度','Cannot build right now. Try again in a moment.'));return}}}
  if(!spec)spec=sanitizeSpec(offlineSpec(voice));
  if(!spec)return;
  if(structures.length>=24){log(J('これ以上は建てられません。何か壊してから建ててください','There is no more room. Remove something first.'));return}
  const pos=findSpot(spec);
  if(!pos){log(J(`「${spec.name_ja}」を置ける場所がありませんでした`,`There was no room for the ${spec.name_en}.`));return}
  const st=placeStructure(spec,pos,null,true);saveBuilds();
  log(J(`${spec.name_ja}ができた！`,`A ${spec.name_en} appeared!`),'god-line');
  const fans=people.filter(w=>!w.player&&!sleepTime(w)).sort(()=>Math.random()-.5).slice(0,3);
  fans.forEach((w,i)=>{say(w,pick([J(`わあ、${spec.name_ja}だ！`,`Wow, a ${spec.name_en}!`),J('すごい！行ってみよう！','Amazing! Let\'s go see it!'),J(`${spec.name_ja}ができたね！`,`Look, a new ${spec.name_en}!`)]),5);
    if(st.actId&&!w.tile.stop){const p=planAct(w,st.actId);if(p){w.forced=p}}});
  if(!cam.follow&&!fpv.on){cam.tzoom=Math.max(cam.tzoom,1)}
  return st;
}

