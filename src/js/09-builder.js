// ================= building builder =================
// 町の建物も、神の声で生まれる建物も、同じ「設計図（spec）」からここで組み立てる。
// 座標の決まり（spec 内）:
//  - マス番号（家具の at、部屋の from/to、ドアの at、階段の at）は 0 から数える整数。
//  - 連続座標（parts、仕切り壁、窓、床の模様、部屋ラベル）は敷地の左上角が 0、マスの境目が整数。
//  - 敷地 pos のマス (pos.x, pos.y) が、マス番号 (0,0) になる。
let bldSeq=1;
const SIDES=['px','py','nx','ny'];
const ROOF_SHAPES=['tiered','gable','flat','none'];
const FLOOR_STYLES=['wood','bedwood','tile','carpet','stone'];

// 床（スラブ）を、吹き抜けのマスを除いた長方形に分ける
function slabRects(w,d,holes){
  const out=[];let band=null;
  const rowSig=r=>{let s='';for(let c=0;c<w;c++)s+=holes.has(key(c,r))?'1':'0';return s};
  for(let r=0;r<=d;r++){const sig=r<d?rowSig(r):null;
    if(band&&sig===band.sig){band.r1=r;continue}
    if(band){let c=0;while(c<w){if(band.sig[c]==='1'){c++;continue}let e=c;while(e<w&&band.sig[e]==='0')e++;out.push({x0:c,y0:band.r0,x1:e,y1:band.r1+1});c=e}}
    band=sig==null?null:{sig,r0:r,r1:r}}
  return out;
}

function buildBuilding(spec,pos,o={}){
  const id=o.id||('b'+(bldSeq++));
  const[w,d]=spec.footprint,ox=pos.x-.5,oy=pos.y-.5,st=spec.style||{};
  const bld={id,spec,cx:pos.x,cy:pos.y,fixed:!!o.fixed,private:!!spec.private,enterable:!!spec.enterable,floors:spec.enterable?clamp(spec.floors||1,1,3):0,
    k:o.animate?0:1,boxes:[],polys:[],tiles:[],cells:[],vocab:[],acts:[],spots:{},floorTiles:[],blockedEdges:new Set(),door:null,residents:[],
    lights:false,glow:0,mealReady:0,mealName:null,dirty:false,cooking:null,tvOn:false,
    paper:col(st.paper,P.paper),curtain:col(st.curtain,[236,170,160]),rooms:[],roomCenters:{},extUses:[],pending:[]};
  buildings.push(bld);
  const B=(lo,hi,opt={})=>{const b=box(lo,hi,{...opt,bld});bld.boxes.push(b);return b};
  for(let x=0;x<w;x++)for(let y=0;y<d;y++)bld.cells.push([pos.x+x,pos.y+y]);
  // activities defined by this spec
  const actId={};
  (spec.activities||[]).forEach(a=>{const aid=(o.fixed?id+'.':'g_'+id+'_')+a.key;actId[a.key]=aid;
    ACTS[aid]={label:J(a.label_ja,a.label_en),use:J(a.use_ja||a.label_ja,a.use_en||a.label_en),glyph:a.glyph||'♪',dur:a.dur||[.6,1.3],gain:a.gain||{fun:.3},gen:true,
      created:o.fixed?null:clock.sim,hours:a.hours||null,who:a.who||'all',staff:!!a.staff,days:a.days||null,
      phrase:()=>a.phrase_en?J(fitGreeting(a.phrase_ja||a.phrase_en),fitGreeting(a.phrase_en)):null};
    ACT_IDS.push(aid);bld.acts.push(aid)});
  const actOf=k=>actId[k]||(ACTS[k]&&!ACTS[k].home?k:null);
  if(spec.enterable)buildInterior(bld,spec,pos,B,actOf);
  // exterior parts (boxes and convex shapes)
  const topZ=bld.floors*WALL_H;
  for(const q of spec.parts||[]){
    const lo=[ox+q.from[0],oy+q.from[1],q.from[2]],hi=[ox+q.to[0],oy+q.to[1],q.to[2]],c=col(q.color,[230,200,180]),t=col(q.top,null);
    const ext=bld.enterable&&q.from[2]>=topZ-.01;
    if(q.shape==='box'||!q.shape){const deco={...(q.deco||{})};if(q.pattern&&q.pattern!=='none')['px','py','nx','ny'].forEach(k=>deco[k]='gen');if(q.topPattern&&q.topPattern!=='none')deco.top='genTop';
      B(lo,hi,{side:c,top:t||mix(c,[255,255,255],.15),deco,genSide:q.pattern,genTop:q.topPattern,exteriorOnly:ext})}
    else{const p={kind:'poly',faces:polyFaces(q.shape,lo,hi,q.axis),lo,hi,col:c,top:t||c,pattern:q.pattern,bld,exteriorOnly:ext};bld.polys.push(p);polys.push(p)}
  }
  // exterior uses: [{act, at:[[dx,dy],...]}]（敷地の外のマスも指定できる）
  for(const u of spec.uses||[]){const aid=u.spot||actOf(u.act);if(aid)bld.extUses.push({aid,cells:u.at.map(([dx,dy])=>[pos.x+dx,pos.y+dy])})}
  if(spec.activity&&!spec.activities){const a=spec.activity,aid='g_'+id;
    ACTS[aid]={label:J(a.label_ja,a.label_en),use:J(a.use_ja,a.use_en),glyph:'♪',dur:[.6,1.3],gain:a.gain,created:clock.sim,gen:true,phrase:()=>a.phrase_en?J(a.phrase_ja||a.phrase_en,a.phrase_en):null};
    ACT_IDS.push(aid);bld.acts.push(aid);bld.ringAct=aid}
  // name tag
  const top=Math.max(topZ+(bld.enterable?.6:0),...(spec.parts||[]).map(q=>q.to[2]));
  if(spec.name_en&&!o.noName){const la=spec.labelAt,v=vocab(spec.name_en,spec.name_ja,spec.example_en||`This is a ${spec.name_en}.`,spec.example_ja||`これは${spec.name_ja}です。`,la?[ox+la[0],oy+la[1],la[2]]:[pos.x+w/2-.5,pos.y+d/2-.5,top+.15],{sid:id,exterior:bld.enterable});bld.vocab.push(v)}
  return bld;
}

function buildInterior(bld,spec,pos,B,actOf){
  const[w,d]=spec.footprint,ox=pos.x-.5,oy=pos.y-.5,st=spec.style||{},H=WALL_H,F=bld.floors;
  const wallC=col(st.wall,P.wall),roofC=col(st.roof,P.coral);
  const solid=new Set(),voids=new Set(),uses=new Map();
  const ck=(c,r,lv)=>c+','+r+'@'+lv;
  // stairs: foot (c,r) on floor f, landing one step along dir on floor f+1
  const stairs=(spec.stairs||[]).map(s=>{const v=FACE_VEC[s.dir]||[1,0];return{...s,foot:s.at,land:[s.at[0]+v[0],s.at[1]+v[1]],v}});
  stairs.forEach(s=>{solid.add(ck(s.land[0],s.land[1],s.floor));voids.add(ck(s.foot[0],s.foot[1],s.floor+1))});
  const door=spec.door||{side:'py',at:1};
  for(let lv=0;lv<F;lv++){
    const zb=lv*H,holes=new Set(stairs.filter(s=>s.floor+1===lv).map(s=>key(...s.foot)));
    // floor slab
    for(const r of slabRects(w,d,holes))B([ox+r.x0,oy+r.y0,zb],[ox+r.x1,oy+r.y1,zb+FLOOR],{indoor:true,level:lv,top:P.floorW,side:mix(wallC,[150,120,110],.3),deco:{top:'floor'}});
    // outer walls (windows in continuous coords along each side)
    const wins=s=>{const a=spec.windows&&spec.windows[s];const len=s==='px'||s==='nx'?d:w;
      const list=Array.isArray(a)?a:Array.from({length:Math.max(0,Math.floor((len-.4)/2))},(_,i)=>len/2+(i-(Math.floor((len-.4)/2)-1)/2)*2);
      return list.map(v=>(s==='px'||s==='nx'?oy:ox)+v)};
    const wall=(lo,hi,n,ws,extra={})=>{const outer=n[0]>0?'px':n[0]<0?'nx':n[1]>0?'py':'ny',opp={px:'nx',nx:'px',py:'ny',ny:'py'};
      return B(lo,hi,{side:wallC,top:P.wallTrim,level:lv,cutN:n,wall:{wins:ws,outer,inner:opp[outer]},deco:{[outer]:'wallOut',[opp[outer]]:'wallIn'},...extra})};
    const z0=zb+FLOOR,z1=zb+H;
    const side=(s,lo,hi,n)=>{
      const along=s==='px'||s==='nx'?1:0,ws=wins(s);
      if(lv>0||door.side!==s){wall(lo,hi,n,ws);return}
      const a=(along?oy:ox)+door.at+.05,b=(along?oy:ox)+door.at+.95,seg=(p,q,zl,zh,wl)=>{const l=lo.slice(),h=hi.slice();l[along]=p;h[along]=q;l[2]=zl;h[2]=zh;wall(l,h,n,wl)};
      const inSeg=(p,q)=>ws.filter(v=>v>p+.4&&v<q-.4);
      seg(lo[along],a,z0,z1,inSeg(lo[along],a));seg(a,b,1.3,z1,[]);seg(b,hi[along],z0,z1,inSeg(b,hi[along]));
      const dl=lo.slice(),dh=hi.slice();dl[along]=a+.03;dh[along]=b-.03;const nn=along?0:1;
      if(n[nn]>0){dl[nn]=hi[nn]-.09;dh[nn]=hi[nn]-.03}else{dl[nn]=lo[nn]+.03;dh[nn]=lo[nn]+.09}
      dl[2]=FLOOR;dh[2]=1.3;B(dl,dh,{side:mix(col(st.door,P.coral),[120,70,90],.3),level:0,exteriorOnly:true,deco:{[s]:'doorleaf'}})};
    side('nx',[ox,oy,z0],[ox+.12,oy+d,z1],[-1,0,0]);
    side('px',[ox+w-.12,oy,z0],[ox+w,oy+d,z1],[1,0,0]);
    side('ny',[ox+.12,oy,z0],[ox+w-.12,oy+.12,z1],[0,-1,0]);
    side('py',[ox+.12,oy+d-.12,z0],[ox+w-.12,oy+d,z1],[0,1,0]);
    // partitions (low inner walls) and the edges they block
    const parts=(spec.partitions||[]).filter(p=>(p.floor||0)===lv);
    const hz=parts.filter(p=>typeof p.y==='number');
    for(const p of parts){
      if(typeof p.y==='number'){const x0=Math.max(.12,p.x[0]),x1=Math.min(w-.12,p.x[1]);B([ox+x0,oy+p.y-.06,z0],[ox+x1,oy+p.y+.06,zb+.6],{indoor:true,level:lv,side:bld.paper,top:P.wallTrim});
        for(let c=0;c<w;c++)if(c+.5>p.x[0]&&c+.5<p.x[1])blockEdge(bld,[pos.x+c,pos.y+p.y-1,lv],[pos.x+c,pos.y+p.y,lv])}
      else{const touch=y=>hz.some(h=>Math.abs(h.y-y)<1e-6&&h.x[0]<p.x&&h.x[1]>p.x);
        const y0=Math.max(.12,p.y[0])+(touch(p.y[0])?.06:0),y1=Math.min(d-.12,p.y[1])-(touch(p.y[1])?.06:0);
        B([ox+p.x-.06,oy+y0,z0],[ox+p.x+.06,oy+y1,zb+.6],{indoor:true,level:lv,side:bld.paper,top:P.wallTrim});
        for(let r=0;r<d;r++)if(r+.5>p.y[0]&&r+.5<p.y[1])blockEdge(bld,[pos.x+p.x-1,pos.y+r,lv],[pos.x+p.x,pos.y+r,lv])}
    }
    // furniture
    for(const it of(spec.furniture||[]).filter(f=>(f.floor||0)===lv)){
      const def=FURN[it.type];if(!def)continue;
      const c0=it.at[0],r0=it.at[1],cx=pos.x+c0,cy=pos.y+r0,face=it.face||'py';
      const W3=(lx,ly,z)=>{const[x,y]=rotXY(face,lx,ly);return[cx+x,cy+y,z+zb]};
      const fr=rotXY(face,0,1);
      const ctx={item:it,
        color:fb=>col(it.color,fb),
        dir:(lx,ly)=>{const[x,y]=rotXY(face,lx,ly);return[x,y,0]},
        B:(lo,hi,opt={})=>{const a=W3(lo[0],lo[1],lo[2]),b=W3(hi[0],hi[1],hi[2]);
          const deco={};for(const k in opt.deco||{})deco[rotKey(face,k)]=opt.deco[k];
          const ex=opt.cutWith?{cutWith:ctx.dir(opt.cutWith[0],opt.cutWith[1])}:{};
          // 壁にめりこむと描く順番が決まらなくなるので、壁の内側に収める
          const cx_=v=>clamp(v,ox+.121,ox+w-.121),cy_=v=>clamp(v,oy+.121,oy+d-.121);
          return B([cx_(Math.min(a[0],b[0])),cy_(Math.min(a[1],b[1])),a[2]],[cx_(Math.max(a[0],b[0])),cy_(Math.max(a[1],b[1])),b[2]],{...opt,...ex,deco,indoor:true,level:lv})},
        seat:(z,type,extra={})=>{const f={type,face:fr,...extra};
          if(extra.head)f.head=W3(...extra.head);if(extra.foot)f.foot=W3(...extra.foot);
          if(extra.lo){const a=W3(extra.lo[0],extra.lo[1],0),b=W3(extra.hi[0],extra.hi[1],0);f.lo=[Math.min(a[0],b[0]),Math.min(a[1],b[1])];f.hi=[Math.max(a[0],b[0]),Math.max(a[1],b[1])]}
          uses.set(ck(c0,r0,lv),{z:z+zb,furn:f})},
        solid:()=>solid.add(ck(c0,r0,lv)),
        spot:(act,where)=>bld.pending.push({act,cell:where==='front'?[c0+fr[0],r0+fr[1]]:where==='back'?[c0-fr[0],r0-fr[1]]:[c0,r0],lv}),
        mark:(k,p)=>{if(!bld[k])bld[k]=W3(...p)},
        vocab:(word,ja,ex,exja,p,opt={})=>{if(bld.vocab.some(v=>v.word===word&&v.level===lv))return;bld.vocab.push(vocab(word,ja,ex,exja,W3(...p),{...opt,bld,level:lv}))}};
      def.build(ctx);
      const where=uses.has(ck(c0,r0,lv))?'self':solid.has(ck(c0,r0,lv))?'front':'self';
      for(const u of[].concat(it.use||[])){const aid=actOf(u);if(aid)ctx.spot(aid,where)}
      // 店員・先生などが立つ場所（家具の裏側）
      if(it.staff){const aid=actOf(it.staff);if(aid)ctx.spot(aid,'back')}
    }
    // stairs geometry (steps rise inside the landing cell of the floor below)
    for(const s of stairs.filter(s=>s.floor===lv)){const[lc,lr]=s.land,N=5;
      for(let k=0;k<N;k++){const a=k/N,b=(k+1)/N,z=zb+FLOOR+(H)*(k+1)/N;
        const lo=s.v[0]?[s.v[0]>0?lc-.5+a:lc+.5-b,lr-.42]:[lc-.42,s.v[1]>0?lr-.5+a:lr+.5-b],hi=s.v[0]?[lo[0]+(b-a),lr+.42]:[lc+.42,lo[1]+(b-a)];
        B([pos.x+lo[0],pos.y+lo[1],zb+FLOOR],[pos.x+hi[0],pos.y+hi[1],z],{indoor:true,level:lv,side:P.wood,top:P.woodL})}}
  }
  // roof
  const Ht=F*H;
  if(st.roofShape==='tiered'){
    B([ox-.15,oy-.15,Ht],[ox+w+.15,oy+d+.15,Ht+.28],{side:roofC,top:roofC,exteriorOnly:true,level:F-1,deco:{top:'roof',px:'dentils',py:'dentils',nx:'dentils',ny:'dentils'}});
    B([ox+.7,oy+.7,Ht+.28],[ox+w-.7,oy+d-.7,Ht+.6],{side:roofC,top:mix(roofC,[255,255,255],.18),exteriorOnly:true,level:F-1,deco:{top:'roof'}});
  }else if(st.roofShape==='gable'){
    const p={kind:'poly',faces:polyFaces('prism',[ox-.15,oy-.15,Ht],[ox+w+.15,oy+d+.15,Ht+Math.min(1.4,.3*Math.min(w,d)+.4)],w>=d?'x':'y'),lo:[ox-.15,oy-.15,Ht],hi:[ox+w+.15,oy+d+.15,Ht+1],col:roofC,top:roofC,pattern:'roof',bld,exteriorOnly:true};
    p.hi[2]=p.faces.reduce((m,f)=>Math.max(m,...f.pts.map(q=>q[2])),Ht);bld.polys.push(p);polys.push(p);
  }else if(st.roofShape!=='none'){
    B([ox-.06,oy-.06,Ht],[ox+w+.06,oy+d+.06,Ht+.2],{side:roofC,top:mix(roofC,[255,255,255],.12),exteriorOnly:true,level:F-1,deco:{px:'dentils',py:'dentils',nx:'dentils',ny:'dentils'}});
  }
  if(Array.isArray(st.chimney)){const[c,r]=st.chimney,hz=st.roofShape==='tiered'?Ht+.6:Ht+.2;
    B([pos.x+c-.25,pos.y+r-.25,hz],[pos.x+c+.25,pos.y+r+.25,hz+.6],{side:P.brick,top:P.brick,exteriorOnly:true,level:F-1,deco:{top:'flue'}});bld.chimney=[pos.x+c,pos.y+r,hz+.65]}
  // rooms (floor style, labels)
  bld.rooms=(spec.rooms||[]).map(r=>({...r,floor:r.floor||0,color:col(r.color,null)}));
  bld.roomAt=(c,r,lv)=>bld.rooms.find(m=>m.floor===lv&&c>=m.from[0]&&c<=m.to[0]&&r>=m.from[1]&&r<=m.to[1])||null;
  bld.rooms.forEach(m=>{const lab=m.label||[(m.from[0]+m.to[0])/2+.5,(m.from[1]+m.to[1])/2+.5];bld.roomCenters[m.id||m.name_en]={p:[ox+lab[0],oy+lab[1],m.floor*H+FLOOR],name:J(m.name_ja||m.name_en,m.name_en),level:m.floor}});
  // tiles
  for(let lv=0;lv<F;lv++){const list=[];
    for(let c=0;c<w;c++)for(let r=0;r<d;r++){const k=ck(c,r,lv);if(solid.has(k)||voids.has(k))continue;const u=uses.get(k),room=bld.roomAt(c,r,lv);
      const t=u?tile(pos.x+c,pos.y+r,u.z,{indoor:true,bld,level:lv,stop:true,furn:u.furn,room:room&&(room.id||room.name_en)}):tile(pos.x+c,pos.y+r,lv*H+FLOOR,{indoor:true,bld,level:lv,room:room&&(room.id||room.name_en)});
      bld.tiles.push(t);list.push(t)}
    bld.floorTiles.push(list)}
  bld.floor=bld.tiles.filter(t=>!t.stop);
  stairs.forEach(s=>{const a=T(pos.x+s.foot[0],pos.y+s.foot[1],s.floor),b=T(pos.x+s.land[0],pos.y+s.land[1],s.floor+1);if(a&&b){a.stair=b;b.stair=a}});
  // door: inner cell and the outside cell in front of it
  const dv=FACE_VEC[door.side]||[0,1],inner=door.side==='px'?[w-1,door.at]:door.side==='nx'?[0,door.at]:door.side==='ny'?[door.at,0]:[door.at,d-1];
  bld.door=[[pos.x+inner[0],pos.y+inner[1]],[pos.x+inner[0]+dv[0],pos.y+inner[1]+dv[1]]];
  // furniture spots
  for(const p of bld.pending){const t=T(pos.x+p.cell[0],pos.y+p.cell[1],p.lv);if(!t||t.bld!==bld)continue;
    if(ACTS[p.act]&&ACTS[p.act].home){(bld.spots[p.act]||(bld.spots[p.act]=[])).push(t);regTile(p.act,t)}else{addSpot(p.act,t);if(ACTS[p.act])ACTS[p.act].inside=true}}
  delete bld.pending;
}
function blockEdge(bld,a,b){const ka=tkey(a[0],a[1],a[2]),kb=tkey(b[0],b[1],b[2]);bld.blockedEdges.add(ka+'|'+kb);bld.blockedEdges.add(kb+'|'+ka)}

// 外の行動場所（建物の周りのマス）を今のタイルから作り直す
function refreshExtSpots(bld){
  for(const t of bld.extSpotTiles||[])for(const aid of bld.acts.concat(bld.extUses.map(u=>u.aid)))dropSpot(aid,t);
  bld.extSpotTiles=[];
  const add=(aid,t)=>{if(t&&!t.bld&&t.tag==='ground'){addSpot(aid,t);bld.extSpotTiles.push(t)}};
  for(const u of bld.extUses)u.cells.forEach(([x,y])=>add(u.aid,T(x,y)));
  if(bld.ringAct){const[w,d]=bld.spec.footprint;
    if(bld.spec.walkable)bld.cells.forEach(([x,y])=>{const t=T(x,y);if(t){addSpot(bld.ringAct,t);bld.extSpotTiles.push(t)}});
    else for(let x=bld.cx-1;x<=bld.cx+w;x++)for(let y=bld.cy-1;y<=bld.cy+d;y++){const inside=x>=bld.cx&&x<bld.cx+w&&y>=bld.cy&&y<bld.cy+d;if(inside)continue;const edge=(x>=bld.cx&&x<bld.cx+w)||(y>=bld.cy&&y<bld.cy+d);if(edge)add(bld.ringAct,T(x,y))}}
}
const homes=()=>buildings.filter(b=>b.residents.length);
const bldById=id=>buildings.find(b=>b.id===id);
// その建物で今見えている階（内観モードで上の階を選んだ時）
let viewFloor=0;
const effFloor=b=>b&&b.enterable?Math.min(viewFloor,b.floors-1):0;
// 町でいちばん高い建物の屋根（カメラの範囲合わせに使う）
const worldTopZ=()=>Math.max(WALL_H,...buildings.map(b=>b.floors*WALL_H))+.8;
// 単語ラベルを今の視点で見せるか（家の中のものは内観で、その階を見ている時だけ）
function vocabShown(v){
  if(v.bld&&v.bld.enterable){if(!interior||(v.level||0)!==effFloor(v.bld))return false}
  if(v.exterior&&interior)return false;
  if(v.mirror&&dot(v.mirror,cam.d)>.02)return false;
  return true;
}
