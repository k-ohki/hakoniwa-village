// ================= first-person mode (built-in WebGL) =================
const FUI={exit:J('一人称をやめる','Exit'),talk:J('話しかける','Talk'),what:J('これは何？','What\'s this?'),busy:J('使用中です','Someone is using it.'),
  hintDesk:J('WASD/矢印で移動・ドラッグで見回す・Eで行動・Tで話す・Escで戻る','WASD / arrows to move · drag to look · E to act · T to talk · Esc to exit'),
  hintTouch:J('左下のスティックで移動・ドラッグで見回す','Stick to move · drag to look around'),
  noGL:J('この端末では3D表示が使えません','3D view is not available on this device.'),send:J('送る','Send'),
  talkPh:J('英語でも日本語でも話しかけてみよう','Say something in English (or Japanese)'),you:J('あなた','You')};
const fpvEl=$('fpv'),fpvHud=$('fpvHud'),fpvActs=$('fpvActs'),fpvSub=$('fpvSub'),fpvNeeds=$('fpvNeeds'),fpvName=$('fpvName'),fpvHint=$('fpvHint'),joy=$('joy'),joyKnob=$('joyKnob'),toastEl=$('toast');
const coarse=window.matchMedia&&matchMedia('(pointer: coarse)').matches;
document.body.classList.toggle('coarse',!!coarse);
let gl=null,glc=null,ovl=null,ovc=null,prog=null,U={},whiteTex=null,statics=[],texFaces=[],spriteBuf=null,sprites=new Map(),propSprites=[],dynT=0,lampT=0,labelRects=[];
function toast(p){toastEl.textContent=tr(p);toastEl.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{toastEl.hidden=true},2200)}
// --- matrices
function persp(fy,a,n,f){const t=1/Math.tan(fy/2),nf=1/(n-f);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,0,2*f*n*nf,0])}
function norm(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]}
function lookAt(e,c,up){const f=norm([c[0]-e[0],c[1]-e[1],c[2]-e[2]]),s=norm(cross(f,up)),u=cross(s,f);return new Float32Array([s[0],u[0],-f[0],0,s[1],u[1],-f[1],0,s[2],u[2],-f[2],0,-dot(s,e),-dot(u,e),dot(f,e),1])}
function mul(a,b){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
let VP=null,EYE=[0,0,0],RIGHT=[1,0,0],FWD=[0,1,0];
function toScreen(p){const x=p[0],y=p[1],z=p[2],m=VP;const cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<=.05)return null;const cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13];return[(cx/cw+1)/2*S.width,(1-cy/cw)/2*S.height,cw]}
// --- GL setup
function initGL(){
  glc=document.createElement('canvas');glc.id='fpvCanvas';fpvEl.prepend(glc);
  gl=glc.getContext('webgl',{antialias:true,alpha:false})||glc.getContext('experimental-webgl');if(!gl)return false;
  ovl=$('fpvOverlay');ovc=ovl.getContext('2d');
  const vs=`attribute vec3 aP;attribute vec2 aT;attribute vec3 aC;uniform mat4 uVP;varying vec2 vT;varying vec3 vC;varying vec3 vW;void main(){vT=aT;vC=aC;vW=aP;gl_Position=uVP*vec4(aP,1.0);}`;
  const fs=`precision mediump float;varying vec2 vT;varying vec3 vC;varying vec3 vW;uniform sampler2D uTex;uniform vec3 uTint;uniform vec3 uFogC;uniform vec2 uFog;uniform vec3 uEye;
    void main(){vec4 t=texture2D(uTex,vT);if(t.a<0.04)discard;vec3 c=t.rgb*vC*uTint;float d=distance(vW,uEye);float f=clamp((d-uFog.x)/(uFog.y-uFog.x),0.0,1.0);gl_FragColor=vec4(mix(c,uFogC,f),t.a);}`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
  prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return false;
  gl.useProgram(prog);
  ['uVP','uTex','uTint','uFogC','uFog','uEye'].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
  U.aP=gl.getAttribLocation(prog,'aP');U.aT=gl.getAttribLocation(prog,'aT');U.aC=gl.getAttribLocation(prog,'aC');
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  whiteTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,whiteTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
  spriteBuf=gl.createBuffer();
  gl.enable(gl.DEPTH_TEST);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  return true;
}
function mkTex(canvas){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);setTexParams();gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);return t}
function setTexParams(){gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
function upTex(t,canvas){gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas)}
function mkBuf(arr){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);return b}
function bindAttribs(){gl.vertexAttribPointer(U.aP,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(U.aT,2,gl.FLOAT,false,32,12);gl.vertexAttribPointer(U.aC,3,gl.FLOAT,false,32,20);gl.enableVertexAttribArray(U.aP);gl.enableVertexAttribArray(U.aT);gl.enableVertexAttribArray(U.aC)}
const quad=(o,u,v,r,col,arr)=>{const P_=[[o,0,0],[u,1,0],[r,1,1],[o,0,0],[r,1,1],[v,0,1]];for(const[p,s,t]of P_)arr.push(p[0],p[1],p[2],s,t,col[0],col[1],col[2])};
const DYN=new Set(['screen','stoveTop','oven','tableTop','sinkTop','tubTop','wallOut','wallIn','mirror']);
function bakeFace(it){
  const{b,f,W,H,base,c}=it;
  if(!it.canvas){const ppu=it.ppu;it.canvas=document.createElement('canvas');it.canvas.width=Math.max(4,Math.min(1024,Math.round(W*ppu)));it.canvas.height=Math.max(4,Math.min(1024,Math.round(H*ppu)))}
  const cv2=it.canvas,ctx=cv2.getContext('2d'),pN=N,pA=amb;N=ctx;amb=[1,1,1];
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=rgb(c);ctx.fillRect(0,0,cv2.width,cv2.height);
  ctx.setTransform(cv2.width/W,0,0,-cv2.height/H,0,cv2.height);
  try{drawDeco(b,f,W,H,base,c)}catch(e){}
  N=pN;amb=pA;
  if(it.tex)upTex(it.tex,cv2);else it.tex=mkTex(cv2);
}
const FACES6=[...FACES,{n:[0,0,-1],o:0,u:1,v:2,key:'bot'}];
// 箱の面をまとめて GPU に送る。建物の中の面は、その建物の明かりで色を変えるため建物ごとにまとめる
function bakeBoxesGL(list,sid){
  const groups={},pA=amb;amb=[1,1,1];
  for(const b of list){if(Object.values(b.deco).includes('doorleaf'))continue;b.cut=false;const inb=b.bld&&b.bld.enterable;
    for(const f of FACES6){if(f.key==='bot'&&b.lo[2]<.05)continue;
      const o=corner(b.lo,b.hi,f.o),u=corner(b.lo,b.hi,f.u),v=corner(b.lo,b.hi,f.v),r=[u[0]+v[0]-o[0],u[1]+v[1]-o[1],u[2]+v[2]-o[2]];
      const W=Math.hypot(u[0]-o[0],u[1]-o[1],u[2]-o[2]),H=Math.hypot(v[0]-o[0],v[1]-o[1],v[2]-o[2]);if(W<.005||H<.005)continue;
      const grp=inb&&(b.indoor||(b.wall&&f.key===b.wall.inner)||f.key==='bot')?b.bld.id:'out';
      const base=f.key==='bot'?(b.exteriorOnly&&inb?P.cream:b.side):f.key==='top'?b.top:b.side;
      const c=shade(base,f.key==='bot'?[0,0,1]:f.n);
      if(b.deco[f.key]){const it={b,f,W,H,base,c,grp,ppu:b.deco.top==='ground'?48:110,dyn:sid?true:DYN.has(b.deco[f.key]),sid};bakeFace(it);
        const arr=[];quad(o,u,v,r,[1,1,1],arr);it.buf=mkBuf(arr);texFaces.push(it)}
      else quad(o,u,v,r,c.map(x=>clamp(x/255,0,1)),groups[grp]||(groups[grp]=[]));
    }}
  for(const g in groups)if(groups[g].length)statics.push({buf:mkBuf(groups[g]),n:groups[g].length/8,grp:g,sid});
  amb=pA;
}
function bakePolysGL(list,sid){
  const arr=[];for(const p of list)for(const f of p.faces){const top=f.n[2]>.7,c=shade(top?p.top:p.col,f.n).map(x=>clamp(x/255,0,1));
    for(let i=1;i<f.pts.length-1;i++)for(const q of[f.pts[0],f.pts[i],f.pts[i+1]])arr.push(q[0],q[1],q[2],0,0,c[0],c[1],c[2])}
  if(arr.length)statics.push({buf:mkBuf(arr),n:arr.length/8,grp:'out',sid});
}
function buildWorld(){
  bakeBoxesGL(boxes.filter(b=>!b.bld||b.bld.fixed));
  const pA=amb;amb=[1,1,1];bakePolysGL(polys.filter(p=>p.bld.fixed));amb=pA;
  genBuildings().forEach(addStructGL);
  // props as billboards
  props.forEach(e=>{if(e.kind==='falls'||e.kind==='pole')return;
    const s=e.kind==='crop'?110:80;let w_=140,h_=180,by=15;
    if(e.kind==='tree'||e.kind==='sakura'){const t=e.r*s;w_=Math.ceil(2.1*t);h_=Math.ceil(2.25*t)+by}
    else if(e.kind==='lantern'){w_=140;h_=150;by=12}else if(e.kind==='crop'){w_=110;h_=60;by=10}
    const sp={e,s,w:w_,h:h_,by,canvas:document.createElement('canvas')};sp.canvas.width=w_;sp.canvas.height=h_;propSprites.push(sp);bakeProp(sp,true)});
}
function withSpriteCtx(ctx,base,cx,cy,s,fn){
  const pN=N,pS=cam.scale,pR=cam.r;N=ctx;cam.scale=s;cam.r=RIGHT;const fw=FWD;
  projOverride=p=>{const d=[p[0]-base[0],p[1]-base[1],p[2]-base[2]];return[cx+dot(d,RIGHT)*s,cy-d[2]*s-dot(d,fw)*s*.35]};
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  try{fn()}catch(e){}
  projOverride=null;N=pN;cam.scale=pS;cam.r=pR;
}
function bakeProp(sp,neutral){const pA=amb;amb=neutral?[1,1,1]:ambOut;sp.lit=!neutral;
  withSpriteCtx(sp.canvas.getContext('2d'),sp.e.local,sp.w/2,sp.h-sp.by,sp.s,()=>drawProp(sp.e));amb=pA;
  if(sp.tex)upTex(sp.tex,sp.canvas);else sp.tex=mkTex(sp.canvas)}
function spriteFor(w){let sp=sprites.get(w);if(!sp){sp={canvas:document.createElement('canvas'),w:220,h:210,by:30,s:100};sp.canvas.width=sp.w;sp.canvas.height=sp.h;sp.tex=mkTex(sp.canvas);sprites.set(w,sp)}return sp}
function drawBillboard(tex,base,wu,hu,by,tint){
  const bx=base[0],byy=base[1],bz=base[2]-by,R=RIGHT,hw=wu/2;
  const a=[bx-R[0]*hw,byy-R[1]*hw,bz],b=[bx+R[0]*hw,byy+R[1]*hw,bz],c=[b[0],b[1],bz+hu],d=[a[0],a[1],bz+hu];
  const arr=[];quad(a,b,d,c,[1,1,1],arr);
  gl.bindBuffer(gl.ARRAY_BUFFER,spriteBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.DYNAMIC_DRAW);bindAttribs();
  gl.uniform3fv(U.uTint,tint);gl.bindTexture(gl.TEXTURE_2D,tex);gl.drawArrays(gl.TRIANGLES,0,6);
}
function skyPal(){let pal=[0,1,2,3].map(i=>mix(mix(SKY.night[i],SKY.day[i],dayK),SKY.dusk[i],duskK));const ov=Math.max(rainK,snowK*.6)*.85;if(ov>0)pal=pal.map(c=>{const g=(c[0]+c[1]+c[2])/3;return mix(c,[g*.95,g,g*1.08],ov)});return pal}
function fpvResize(){if(!gl)return;const d=Math.min(2,window.devicePixelRatio||1);glc.width=Math.round(S.width*d);glc.height=Math.round(S.height*d);ovl.width=glc.width;ovl.height=glc.height}

// --- control
const eyeH=w=>{const p=postureOf(w);if(w.kind==='cat')return .3;if(p==='lie')return .28;if(p==='bath')return .2;return(w.kid?.64:.8)-(p==='sit'?.26:0)};
function setControl(w){
  if(fpv.w&&fpv.w!==w)releaseControl(fpv.w);
  fpv.w=w;w.player=true;
  if(w.link){if(w.t>.5)w.tile=w.link.to;w.link=null;w.t=0}
  w.path=[];w.goal=null;w.forced=null;w.target=null;w.directive=null;
  if(w.act&&!w.tile.stop)finishAct(w,true);
  if(w.tile.stop){const L=w.tile.links.find(l=>!l.to.stop);w.returnTile=L?L.to:null}else w.returnTile=null;
  w.ppos=[w.tile.pos[0],w.tile.pos[1]];w.pz=w.tile.pos[2];
  fpv.yaw=Math.atan2(w.lastDir[1],w.lastDir[0]);fpv.pitch=-.08;
  fpvName.textContent=nameOf(w);$('fpvDot').style.background=rgb(w.cloak);
  walkers.forEach(o=>o.btn.setAttribute('aria-pressed',String(o===w)));
  buildNeeds();closeTalk();fpv.sig='';
}
function afterAct(w){if(w.returnTile){w.tile=w.returnTile;w.ppos=[w.tile.pos[0],w.tile.pos[1]];w.returnTile=null}}
function releaseControl(w){
  if(w.act)finishAct(w,true);afterAct(w);
  if(w.tile.stop){const L=w.tile.links.find(l=>!l.to.stop);if(L)w.tile=L.to}
  w.player=false;w.ppos=null;w.wait=0;w.path=[];w.goal=null;w.target=null;
}
function playerTick(w,sdt){
  if(w.act&&w.wait>0){w.wait-=sdt;if(w.wait<=0){finishAct(w,false);afterAct(w)}}
}
async function enterFPV(w){
  if(!w)return;
  if(!gl){if(!initGL()){toast(FUI.noGL);gl=null;return}buildWorld()}
  fpv.on=true;document.body.classList.add('fpv');fpvEl.hidden=false;fpvHud.hidden=false;
  card.hidden=true;wordCard.hidden=true;cam.follow=null;selected=null;
  fpvResize();setControl(w);applyFpvLang();
}
function exitFPV(){
  if(!fpv.on)return;const w=fpv.w;releaseControl(w);fpv.w=null;fpv.on=false;fpv.keys.clear();fpv.joy=[0,0];
  document.body.classList.remove('fpv');fpvEl.hidden=true;fpvHud.hidden=true;closeTalk();
  select(w);
}
function applyFpvLang(){
  $('fpvExit').textContent=tr(FUI.exit);fpvHint.textContent=tr(coarse?FUI.hintTouch:FUI.hintDesk);$('tSend').textContent=tr(FUI.send);$('tInput').placeholder=tr(FUI.talkPh);
  $('fpvSpeed').textContent=`${tr(UI.speed)} ×${clock.speed}`;if(fpv.w)fpvName.textContent=nameOf(fpv.w);fpv.sig='';buildNeeds();renderTalk();
}
function buildNeeds(){fpvNeeds.replaceChildren();const w=fpv.w;if(!w||!w.needs)return;for(const k in NEED_T){const d=document.createElement('span');d.className='mini';d.title=tr(NEED_T[k][0]);const l=document.createElement('em');l.textContent=tr(NEED_T[k][0]);const b=document.createElement('span');b.className='bar';const i=document.createElement('i');i.style.background=NEED_T[k][1];i.dataset.k=k;b.append(i);d.append(l,b);fpvNeeds.append(d)}}

// --- movement
function fpvMove(dt){
  const w=fpv.w,k=fpv.keys;let mx=fpv.joy[0],my=fpv.joy[1];
  if(!fpv.typing){if(k.has('w')||k.has('arrowup'))my+=1;if(k.has('s')||k.has('arrowdown'))my-=1;if(k.has('a')||k.has('arrowleft'))mx-=1;if(k.has('d')||k.has('arrowright'))mx+=1}
  const mag=Math.hypot(mx,my);fpv.moving=false;
  w.pz=lerp(w.pz,w.tile.pos[2],1-Math.exp(-dt*12));
  if(mag<.08)return;
  if(w.act){finishAct(w,true);afterAct(w)}else if(w.tile.stop)afterAct(w);
  const sp=(k.has('shift')?3.3:2)*(w.kind==='cat'?1.3:w.kid?1.1:1)*Math.min(1,mag),n=Math.max(1,mag);
  const fx=Math.cos(fpv.yaw),fy=Math.sin(fpv.yaw),rx=Math.sin(fpv.yaw),ry=-Math.cos(fpv.yaw);
  const vx=(mx*rx+my*fx)/n,vy=(mx*ry+my*fy)/n;
  stepAxis(w,0,vx*sp*dt);stepAxis(w,1,vy*sp*dt);
  if(Math.abs(vx)>.3||Math.abs(vy)>.3)w.lastDir=Math.abs(vx)>Math.abs(vy)?[Math.sign(vx),0]:[0,Math.sign(vy)];
  w.phase+=9*dt*Math.min(1,mag);fpv.moving=true;
}
function stepAxis(w,ax,d){
  if(!d)return;const p=w.ppos.slice();p[ax]+=d;const cur=[w.tile.pos[0],w.tile.pos[1]],cell=[Math.round(p[0]),Math.round(p[1])];
  const linkTo=(x,y)=>w.tile.links.find(l=>l.to.pos[0]===x&&l.to.pos[1]===y&&!l.to.stop);
  if(cell[0]===cur[0]&&cell[1]===cur[1]){const off=p[ax]-cur[ax];if(Math.abs(off)>.34){const nb=ax===0?[cur[0]+Math.sign(off),cur[1]]:[cur[0],cur[1]+Math.sign(off)];if(!linkTo(...nb))p[ax]=cur[ax]+Math.sign(off)*.34}w.ppos=p;return}
  const L=linkTo(cell[0],cell[1]);
  if(L){w.tile=L.to;w.ppos=p}else{p[ax]=cur[ax]+Math.sign(p[ax]-cur[ax])*.34;w.ppos=p}
}

// --- interaction candidates
function fpvCands(){
  const w=fpv.w,p=w.ppos,f=[Math.cos(fpv.yaw),Math.sin(fpv.yaw)];const out={acts:[],npc:null,word:null};
  if(w.kind!=='cat'){let best=null,bs=1e9;
    SPOTREG.forEach((ids,t)=>{const dx=t.pos[0]-p[0],dy=t.pos[1]-p[1],d=Math.hypot(dx,dy);if(d>1.25)return;const face=d>.01?(dx*f[0]+dy*f[1])/d:1;
      let ok=t.stop?(d<.7||(d<1.2&&face>.25)):d<.62;if(!ok)return;const sc=d-face*.3;if(sc<bs){bs=sc;best=t}});
    if(best){const ids=[...SPOTREG.get(best)].map(id=>id==='eat'&&!(best.bld&&best.bld.mealReady>clock.sim)?'sit':id).filter(id=>ACTS[id]&&ACTS[id].use&&(id!=='dance'||clock.sim<weather.festUntil));
      out.acts=ids.slice(0,2).map(id=>({id,tile:best}))}}
  let bn=null,bd=1.8;walkers.forEach(o=>{if(o===w)return;const q=walkerPos(o),dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);if(d>bd)return;const face=d>.01?(dx*f[0]+dy*f[1])/d:1;if(face<.35)return;bd=d;bn=o});out.npc=bn;
  const inH=w.tile.indoor?w.tile.bld:null;let bv=null,bvd=2.3;VOCAB.forEach(v=>{if((v.bld||null)!==inH||(inH&&(v.level||0)!==w.tile.level))return;const dx=v.pos[0]-p[0],dy=v.pos[1]-p[1],d=Math.hypot(dx,dy);if(d>bvd)return;const face=d>.01?(dx*f[0]+dy*f[1])/d:1;if(face<.55)return;bvd=d;bv=v});out.word=bv;
  return out;
}
function fpvDoAct(id,tile){
  const w=fpv.w;if(tile!==w.tile&&taken(w).has(tile)){toast(FUI.busy);return}
  if(w.act){finishAct(w,true);afterAct(w)}
  w.returnTile=tile.stop?(w.tile.stop?w.returnTile:w.tile):null;
  w.tile=tile;w.ppos=[tile.pos[0],tile.pos[1]];
  const a=ACTS[id];startAct(w,{id,dur:a.dur,hs:tile.bld||w.house});
  if(tile.furn&&tile.furn.face){fpv.yaw=Math.atan2(tile.furn.face[1],tile.furn.face[0]);fpv.pitch=id==='sleep'?.55:-.12}
  else{const t2=SPOTREG.get(tile);if(id==='fish'){const pd=nearestPond(tile.pos[0],tile.pos[1]),d=[pd.x-tile.pos[0],pd.y-tile.pos[1]];fpv.yaw=Math.atan2(d[1],d[0])}}
  fpv.sig='';
}
function renderActs(c){
  const w=fpv.w;const parts=[];
  c.acts.forEach((a,i)=>parts.push('a'+a.id+a.tile.id));if(c.npc)parts.push('n'+c.npc.name);if(c.word)parts.push('v'+c.word.word);parts.push(L,w.act?w.act.id:'-');
  const sig=parts.join('|');if(sig===fpv.sig)return;fpv.sig=sig;fpvActs.replaceChildren();
  const mk=(label,key,fn,cls)=>{const b=document.createElement('button');b.type='button';if(cls)b.className=cls;b.textContent=label;if(key&&!coarse){const k=document.createElement('kbd');k.textContent=key;b.append(k)}b.addEventListener('click',fn);fpvActs.append(b);return b};
  c.acts.forEach((a,i)=>{const active=w.act&&w.act.id===a.id&&w.tile===a.tile;mk(tr(ACTS[a.id].use||labelOf(w,a.id)),i===0?'E':'F',()=>{if(active){finishAct(w,true);afterAct(w);fpv.sig=''}else fpvDoAct(a.id,a.tile)},active?'on':'main')});
  if(c.npc)mk(`${tr(FUI.talk)}: ${nameOf(c.npc)}`,'T',()=>openTalk(c.npc));
  if(c.word)mk(`${tr(FUI.what)} ${L==='en'?c.word.word:c.word.ja}`,'Q',()=>openWord(c.word));
}

function addStructGL(st){bakeBoxesGL(st.boxes,st.id);const pA=amb;amb=[1,1,1];bakePolysGL(st.polys,st.id);amb=pA}
function removeStructGL(id){statics=statics.filter(x=>{if(x.sid===id){gl.deleteBuffer(x.buf);return false}return true});texFaces=texFaces.filter(x=>{if(x.sid===id){gl.deleteBuffer(x.buf);gl.deleteTexture(x.tex);return false}return true})}
let candT=0,curC={acts:[],npc:null,word:null};

// --- talk
const talkEl=$('talk'),tList=$('tList'),tForm=$('tForm'),tInput=$('tInput'),tChips=$('tChips');
let talk=null;
const QUICK=[J('こんにちは！','Hello!'),J('元気？','How are you?'),J('何してるの？','What are you doing?'),J('一緒に釣りに行こう！','Let\'s go fishing together!'),J('おなかすいた？','Are you hungry?'),J('おやすみ！','Good night!')];
function openTalk(npc){
  const me=fpv.w;talk={npc,turns:[],busy:false};talkEl.hidden=false;
  if(npc.kind==='person'&&!npc.tile.stop&&!npc.link&&!npc.player){if(npc.act)finishAct(npc,true);npc.path=[];npc.goal=null;npc.target=null;npc.forced=null;npc.act={id:'chat',partner:me,dur:[.4,.6]};npc.wait=.8*HR}
  const g=npc.kind==='cat'?J('にゃー！','Meow!'):pick([J(`やあ、${me.name}！`,`Hi, ${me.en}!`),J(`あ、${me.name}。どうしたの？`,`Oh, hi ${me.en}. What's up?`),J(`${me.name}、こんにちは！`,`Hello, ${me.en}!`)]);
  talk.turns.push({who:'npc',en:g.en,ja:g.ja});say(npc,g,5);renderTalk();
  if(!coarse)setTimeout(()=>tInput.focus(),30);
}
function closeTalk(){talk=null;talkEl.hidden=true;fpv.typing=false}
function renderTalk(){if(!talk)return;const npc=talk.npc;$('tName').textContent=nameOf(npc);$('tDot').style.background=rgb(npc.cloak);
  tList.replaceChildren(...talk.turns.map(t=>{const li=document.createElement('li');li.className=t.who;const b=document.createElement('b');b.textContent=t.who==='me'?t.text:(L==='en'?t.en:t.ja);li.append(b);
    if(t.who==='npc'){if(L==='en'){const s=document.createElement('span');s.textContent=t.ja;li.append(s)}if(canSpeak&&t.en){const btn=document.createElement('button');btn.type='button';btn.className='say-btn';btn.textContent='🔊';btn.onclick=()=>speak(t.en);li.append(btn)}}
    if(t.tip){const d=document.createElement('div');d.className='tip';d.textContent=t.tip;li.append(d)}
    if(t.wait){b.textContent='…'}return li}));
  tList.scrollTop=tList.scrollHeight;
  tChips.replaceChildren(...QUICK.map(q=>{const b=document.createElement('button');b.type='button';b.textContent=q.en;b.title=q.ja;b.onclick=()=>sendTalk(q.en);return b}));
}
function cannedReply(npc,msg){
  const m=msg.toLowerCase(),me=fpv.w;
  if(npc.kind==='cat')return{en:pick(['Meow!','Purr...','Meow meow!']),ja:pick(['にゃー！','ごろごろ…','にゃにゃ！']),tip:''};
  if(/hello|hi\b|hey|こんにち|やあ/.test(m))return{...pick([J('やあ！会えてうれしいよ。','Hi! Nice to see you.'),J('こんにちは！今日もいい日だね。','Hello! It\'s a nice day.')]),tip:''};
  if(/how are you|元気/.test(m))return{...pick([J('元気だよ、ありがとう。きみは？','I\'m good, thanks. And you?'),J('ちょっと疲れてるけど、元気だよ。','A little tired, but I\'m OK.')]),tip:''};
  if(/what are you doing|何して/.test(m)){const s=statusOf(npc);return{en:`I'm ${s.en==='chatting with '+me.en?'talking with you':s.en}.`,ja:`${s.ja}ところだよ。`,tip:''}}
  if(/hungry|おなか/.test(m))return{...J('うん、おなかペコペコ！','Yes, I\'m starving!'),tip:''};
  if(/night|おやすみ/.test(m))return{...J('おやすみ！また明日ね。','Good night! See you tomorrow.'),tip:''};
  if(/fish|釣り/.test(m))return{...J('いいね、行こう！','Sounds good. Let\'s go!'),tip:'',goal:'fish'};
  return{...chatLine(npc,me),tip:''};
}
function talkPrompt(npc,msg){
  const me=fpv.w,n=npc.needs,hist=talk.turns.filter(t=>!t.wait).slice(-8).map(t=>t.who==='me'?`${me.en}: ${t.text}`:`${npc.en}: ${t.en}`).join('\n');
  return `You are ${npc.en} (${npc.name}), a villager in a cozy village life sim. ${npc.persona.en}${npc.kid?' You are a child.':''}
You are talking face to face with ${me.en} (${me.name}), another villager, who is controlled by a human learning everyday English.
Now: day ${clock.day}, ${hhmm(clock.hour)}, weather ${weather.kind}${clock.sim<weather.festUntil?', festival day':''}. You are ${statusOf(npc).en} (${placeOf(npc)}). Mood: ${moodOf(npc)}. Energy ${n.energy.toFixed(1)}, full ${n.food.toFixed(1)}, bladder ${n.bladder.toFixed(1)} (0-1).
Recent memories: ${npc.memory.slice(-4).join(' / ')||'nothing special'}
Conversation so far:
${hist}
${me.en}: ${msg}

Reply in character with 1-2 short sentences of natural, simple spoken English (CEFR A2) about everyday life, and give a natural Japanese translation.
"tip": if ${me.en}'s last message has an English mistake or sounds unnatural, write one short, kind correction in Japanese like 「◯◯ より △△ が自然だよ」. If they wrote in Japanese, show how to say it in English in Japanese, like 「英語では "…" と言えるよ」. Otherwise "".
"goal": if they invite you to do something together right now and you agree, one of: fish, walk, plaza, stall, bench, field, flower, eat, cook, tv, bath, sleep, play, dance, or a town place: ${townGoals()}. Otherwise null.
Reply with JSON only: {"en":"…","ja":"…","tip":"…","goal":null}`;
}
async function sendTalk(text){
  if(!talk||talk.busy)return;text=String(text||'').trim();if(!text)return;
  const npc=talk.npc,me=fpv.w;talk.turns.push({who:'me',text});tInput.value='';
  if(/[a-z]/i.test(text)&&!/[぀-ヿ一-鿿]/.test(text))me.say={en:text,ja:text,until:S.time+4};
  if(npc.act&&npc.act.id==='chat')npc.wait=Math.max(npc.wait,.6*HR);
  const wait={who:'npc',wait:true};talk.turns.push(wait);talk.busy=true;renderTalk();
  let r=null;
  if(sample&&npc.kind==='person'){try{r=await sample.json(talkPrompt(npc,text),{modelTier:'quick',cache:false})}catch(err){const c=err&&err.code;if(c==='not_granted'||c==='sampling_disabled')sample=null;r=null}}
  if(!r||!r.en)r=cannedReply(npc,text);
  if(!talk||talk.npc!==npc)return;
  const i=talk.turns.indexOf(wait);const tt={who:'npc',en:String(r.en||'').slice(0,160),ja:String(r.ja||'').slice(0,100)};if(i>=0)talk.turns.splice(i,1);talk.turns.push(tt);
  if(r.tip)talk.turns[talk.turns.length-2]&&(talk.turns.filter(t=>t.who==='me').slice(-1)[0].tip=String(r.tip).slice(0,120));
  talk.busy=false;say(npc,{en:tt.en,ja:tt.ja},6);addPhrase({en:tt.en,ja:tt.ja});renderTalk();
  if(r.goal&&ACTS[r.goal]&&canDo(npc,r.goal)&&npc.kind==='person'){npc.wait=0;const p=planAct(npc,r.goal);if(p){npc.directive={goal:r.goal,until:clock.sim+2*HR};npc.forced=p;toast(J(`${npc.name}が「${tr(labelOf(npc,r.goal))}」に向かった`,`${npc.en} is heading off: ${labelOf(npc,r.goal).en}`))}}
}
tForm.addEventListener('submit',e=>{e.preventDefault();sendTalk(tInput.value)});
tInput.addEventListener('focus',()=>{fpv.typing=true;fpv.keys.clear()});tInput.addEventListener('blur',()=>{fpv.typing=false});
$('tClose').addEventListener('click',closeTalk);

// --- render
function fpvFrame(dt){
  const w=fpv.w;if(!w||!gl){exitFPV();return}
  fpvMove(dt);
  const p=walkerPos(w),bob=fpv.moving?Math.sin(w.phase)*.012:0;
  EYE=[p[0],p[1],p[2]+eyeH(w)+bob];
  const cp=Math.cos(fpv.pitch);FWD=[Math.cos(fpv.yaw),Math.sin(fpv.yaw),0];RIGHT=[Math.sin(fpv.yaw),-Math.cos(fpv.yaw),0];
  const dir=[cp*FWD[0],cp*FWD[1],Math.sin(fpv.pitch)];
  VP=mul(persp(1.3,S.width/S.height,.03,70),lookAt(EYE,[EYE[0]+dir[0],EYE[1]+dir[1],EYE[2]+dir[2]],[0,0,1]));
  const pal=skyPal();skyMid=pal[1];
  const fogC=(w.tile.indoor?mix(pal[1],[40,36,50],.3):mix(pal[1],pal[2],.4)).map(v=>v/255);
  gl.viewport(0,0,glc.width,glc.height);gl.clearColor(fogC[0],fogC[1],fogC[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(prog);gl.uniformMatrix4fv(U.uVP,false,VP);gl.uniform3fv(U.uFogC,fogC);gl.uniform2f(U.uFog,14,40);gl.uniform3fv(U.uEye,EYE);gl.uniform1i(U.uTex,0);gl.activeTexture(gl.TEXTURE0);
  const tint={out:ambOut};buildings.forEach(b=>{if(b.enterable)tint[b.id]=houseAmb(b)});
  gl.disable(gl.BLEND);gl.depthMask(true);
  for(const s of statics){gl.bindBuffer(gl.ARRAY_BUFFER,s.buf);bindAttribs();gl.uniform3fv(U.uTint,tint[s.grp]||ambOut);gl.bindTexture(gl.TEXTURE_2D,whiteTex);gl.drawArrays(gl.TRIANGLES,0,s.n)}
  dynT-=dt;const re=dynT<=0;if(re)dynT=.35;
  for(const it of texFaces){if(re&&it.dyn)bakeFace(it);gl.bindBuffer(gl.ARRAY_BUFFER,it.buf);bindAttribs();gl.uniform3fv(U.uTint,tint[it.grp]||ambOut);gl.bindTexture(gl.TEXTURE_2D,it.tex);gl.drawArrays(gl.TRIANGLES,0,6)}
  // billboards (far to near)
  gl.enable(gl.BLEND);
  const bb=[];
  lampT-=dt;const reLamp=lampT<=0;if(reLamp)lampT=1;
  for(const sp of propSprites){const d=Math.hypot(sp.e.local[0]-EYE[0],sp.e.local[1]-EYE[1]);if(d>38)continue;if(sp.e.kind==='lantern'&&reLamp)bakeProp(sp,false);bb.push({d,sp,base:sp.e.local,tint:sp.lit?[1,1,1]:ambOut})}
  for(const o of walkers){if(o===w)continue;const q=walkerPos(o),d=Math.hypot(q[0]-EYE[0],q[1]-EYE[1]);if(d>30)continue;const sp=spriteFor(o);
    if(d<16||(S.time*10|0)%6===0){withSpriteCtx(sp.canvas.getContext('2d'),q,sp.w/2,sp.h-sp.by,sp.s,()=>{o.kind==='cat'?drawCat(o):drawPerson(o)});upTex(sp.tex,sp.canvas)}
    bb.push({d,sp,base:q,tint:[1,1,1]})}
  bb.sort((a,b)=>b.d-a.d);
  for(const x of bb){const sp=x.sp;drawBillboard(sp.tex,x.base,sp.w/sp.s,sp.h/sp.s,sp.by/sp.s,x.tint)}
  // overlay
  const d=glc.width/S.width,pN=N;N=ovc;ovc.setTransform(1,0,0,1,0,0);ovc.clearRect(0,0,ovl.width,ovl.height);ovc.setTransform(d,0,0,d,0,0);
  labelRects=[];
  const inH=w.tile.indoor?w.tile.bld:null;
  if(L==='en'&&showLabels&&curC.word){const v=curC.word,s=toScreen(v.pos);if(s){tag(s[0],s[1],v.word,'obj');labelRects.push({x:s[0],y:s[1],v})}}
  if(false)VOCAB.forEach(v=>{if((v.bld||null)!==inH)return;const dd=Math.hypot(v.pos[0]-EYE[0],v.pos[1]-EYE[1]);if(dd>4.5)return;const s=toScreen(v.pos);if(!s)return;tag(s[0],s[1],v.word,'obj');labelRects.push({x:s[0],y:s[1],v})});
  const sayText=o=>L==='en'?(o.say.en||o.say.ja):(o.say.ja||o.say.en);
  for(const o of walkers){if(o===w)continue;const q=walkerPos(o);if(Math.hypot(q[0]-EYE[0],q[1]-EYE[1])>11)continue;const post=o.kind==='person'?postureOf(o):'stand';
    const hh=o.kind==='cat'?.5:post==='lie'?.45:post==='bath'?.45:post==='sit'?.82:(o.kid?.86:1.02);const s=toScreen([q[0],q[1],q[2]+hh]);if(!s)continue;
    if(o.say&&S.time<o.say.until)bubble(s[0],s[1],sayText(o),'say');
    else if(o.act&&!o.link&&ACTS[o.act.id]&&ACTS[o.act.id].glyph&&o.act.id!=='chat')bubble(s[0],s[1],ACTS[o.act.id].glyph,'glyph');
    else if(talk&&talk.npc===o)bubble(s[0],s[1],nameOf(o),'sel')}
  precip();
  ovc.fillStyle='rgba(255,255,255,0.85)';ovc.beginPath();ovc.arc(S.width/2,S.height/2,2.5,0,2*Math.PI);ovc.fill();
  N=pN;
  // HUD
  candT-=dt;if(candT<=0){candT=.15;curC=fpvCands();renderActs(curC);
    const sy=w.say&&S.time<w.say.until?w.say:null;
    if(sy){fpvSub.hidden=false;fpvSub.replaceChildren();const b=document.createElement('b');b.textContent=L==='en'?sy.en:sy.ja;fpvSub.append(b);if(L==='en'&&sy.ja!==sy.en){const s=document.createElement('span');s.textContent=sy.ja;fpvSub.append(s)}}
    else{const st=statusOf(w);fpvSub.hidden=!w.act;if(w.act){fpvSub.replaceChildren();const b=document.createElement('b');b.textContent=L==='en'?cap(st.en):st.ja;fpvSub.append(b);if(L==='en'){const s=document.createElement('span');s.textContent=st.ja;fpvSub.append(s)}}}
    fpvNeeds.querySelectorAll('i').forEach(i=>{i.style.width=Math.round(w.needs[i.dataset.k]*100)+'%'});
    $('fpvSpeed').textContent=`${tr(UI.speed)} ×${clock.speed}`;
    if(talk&&Math.hypot(walkerPos(talk.npc)[0]-w.ppos[0],walkerPos(talk.npc)[1]-w.ppos[1])>3)closeTalk();
  }
}

// --- input
let look=null;
fpvEl.addEventListener('pointerdown',e=>{if(e.target!==glc)return;glc.setPointerCapture(e.pointerId);look={touch:e.pointerType!=='mouse',x:e.clientX,y:e.clientY,yaw:fpv.yaw,pitch:fpv.pitch,moved:false,id:e.pointerId}});
fpvEl.addEventListener('pointermove',e=>{if(!look||e.pointerId!==look.id)return;const dx=e.clientX-look.x,dy=e.clientY-look.y;if(Math.hypot(dx,dy)>5)look.moved=true;fpv.yaw=look.yaw+(look.touch?1:-1)*dx*.0055;fpv.pitch=clamp(look.pitch-dy*.0045,-1.2,1.2)});
fpvEl.addEventListener('pointerup',e=>{if(!look||e.pointerId!==look.id)return;if(!look.moved){const r=glc.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let hit=null;labelRects.forEach(l=>{if(Math.abs(l.x-x)<45&&Math.abs(l.y-y)<12)hit=l});if(hit)openWord(hit.v)}look=null});
fpvEl.addEventListener('pointercancel',()=>{look=null});
fpvEl.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
let joyId=null;
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});
const joyEnd=e=>{if(e.pointerId!==joyId)return;joyId=null;fpv.joy=[0,0];joyKnob.style.transform='translate(-50%,-50%)'};
joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
function joyMove(e){const r=joy.getBoundingClientRect(),R=r.width/2,dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R),l=Math.hypot(dx,dy),k=l>R?R/l:1;fpv.joy=[dx*k/R,-dy*k/R];joyKnob.style.transform=`translate(calc(-50% + ${dx*k}px),calc(-50% + ${dy*k}px))`}
window.addEventListener('keydown',e=>{if(!fpv.on)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA')){if(e.key==='Escape')t.blur();return}
  const k=e.key.toLowerCase();
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){fpv.keys.add(k);e.preventDefault()}
  else if(k==='e'&&curC.acts[0])fpvActs.querySelector('button')?.click();
  else if(k==='f'&&curC.acts[1])fpvActs.querySelectorAll('button')[1]?.click();
  else if(k==='t'&&curC.npc){e.preventDefault();openTalk(curC.npc)}
  else if(k==='q'&&curC.word)openWord(curC.word);
  else if(k==='escape'){if(talk)closeTalk();else if(!wordCard.hidden)wordCard.hidden=true;else exitFPV()}},true);
window.addEventListener('keyup',e=>{fpv.keys.delete(e.key.toLowerCase())});
window.addEventListener('blur',()=>fpv.keys.clear());
window.addEventListener('resize',()=>{if(fpv.on)fpvResize()});
$('fpvExit').addEventListener('click',exitFPV);
$('fpvSpeed').addEventListener('click',()=>{speedBtn.click();$('fpvSpeed').textContent=`${tr(UI.speed)} ×${clock.speed}`});
$('cPlay').addEventListener('click',()=>{if(selected)enterFPV(selected)});

