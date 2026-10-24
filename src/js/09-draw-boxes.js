// ================= drawing: boxes =================
const FACES=[{n:[1,0,0],o:3,u:1,v:7,key:'px'},{n:[0,1,0],o:2,u:3,v:6,key:'py'},{n:[-1,0,0],o:0,u:2,v:4,key:'nx'},{n:[0,-1,0],o:1,u:0,v:5,key:'ny'},{n:[0,0,1],o:4,u:5,v:6,key:'top'}];
function faceXform(e,l,i){const o=S.dpr;N.setTransform(o*(l[0]-e[0]),o*(l[1]-e[1]),o*(i[0]-e[0]),o*(i[1]-e[1]),o*e[0],o*e[1])}
function arch(t,e,l,i){const o=l/2;N.moveTo(t-o,e);N.lineTo(t-o,e+i-o);for(let k=0;k<=10;k++){const a=Math.PI-k/10*Math.PI;N.lineTo(t+Math.cos(a)*o,e+i-o+Math.sin(a)*o)}N.lineTo(t+o,e);N.closePath()}
function rr(x,y,w,h,r){N.beginPath();if(N.roundRect)N.roundRect(x,y,w,h,r);else N.rect(x,y,w,h)}
const faceU=(b,k,X)=>k==='px'?b.hi[1]-X:k==='nx'?X-b.lo[1]:k==='py'?X-b.lo[0]:b.hi[0]-X;
const houseAmb=h=>h?mix(mix(ambOut,[.5,.5,.62],nightK*.4),[1.04,.95,.84],h.glow):ambOut;

function drawGround(b,f,W,H){
  const a=b.lo,n=f.n;snowOn=true;
  N.fillStyle=rgb(shade(snowy(P.path),n));for(const[x,y]of pathCells){rr(x-a[0]-.46,y-a[1]-.46,.92,.92,.18);N.fill()}
  N.fillStyle=rgb(shade(snowy(P.plaza),n));rr(7-a[0]-.5,10-a[1]-.5,3,3,.3);N.fill();
  N.strokeStyle=rgb(shade(snowy(P.plaza),n),.9);N.lineWidth=.03;for(let k=1;k<6;k++){N.beginPath();N.moveTo(6.5-a[0]+k*.5,9.5-a[1]);N.lineTo(6.5-a[0]+k*.5,12.5-a[1]);N.moveTo(6.5-a[0],9.5-a[1]+k*.5);N.lineTo(9.5-a[0],9.5-a[1]+k*.5);N.stroke()}
  for(const[x,y]of fieldCells){N.fillStyle=rgb(shade(snowy(P.soil),n));rr(x-a[0]-.46,y-a[1]-.46,.92,.92,.12);N.fill();N.fillStyle=rgb(shade(snowy(P.soil),n),.84);for(let k=0;k<3;k++)N.fillRect(x-a[0]-.36,y-a[1]-.28+k*.26,.72,.05)}
  for(const[x,y]of bedCells){N.fillStyle=rgb(shade(snowy([160,128,104]),n));rr(x-a[0]-.44,y-a[1]-.44,.88,.88,.2);N.fill();
    for(let k=0;k<9;k++){const c=[[255,150,170],[255,214,110],[200,160,240],[255,255,255]][k%4];N.fillStyle=rgbA(c);N.beginPath();N.arc(x-a[0]-.3+hash(k*3+x*7+y)*.6,y-a[1]-.3+hash(k*5+y*11+x)*.6,.09,0,2*Math.PI);N.fill()}}
  const px=POND.x-a[0],py=POND.y-a[1];
  N.fillStyle=rgb(shade(snowy([214,200,170]),n));N.beginPath();N.ellipse(px,py,POND.rx+.16,POND.ry+.16,0,0,2*Math.PI);N.fill();
  N.fillStyle=rgb(mix(A(P.water),[60,80,140],nightK*.35));N.beginPath();N.ellipse(px,py,POND.rx,POND.ry,0,0,2*Math.PI);N.fill();
  N.strokeStyle=rgb(A([226,244,252]),1,.7);N.lineWidth=.04;
  for(let k=0;k<4;k++){const ph=(S.time*.35+k/4)%1;N.globalAlpha=1-ph;N.beginPath();N.ellipse(px-.6+k*.4,py+.2-k*.2,.15+ph*.5,.08+ph*.3,0,0,2*Math.PI);N.stroke()}N.globalAlpha=1;
  if(rainK>.05){N.strokeStyle=`rgba(230,240,255,${.6*rainK})`;for(let k=0;k<10;k++){const ph=(S.time*1.6+hash(k))%1,rx=px+(hash(k*3)-.5)*2.6,ry=py+(hash(k*7)-.5)*1.8;N.globalAlpha=1-ph;N.beginPath();N.ellipse(rx,ry,ph*.25,ph*.15,0,0,2*Math.PI);N.stroke()}N.globalAlpha=1}
  N.fillStyle=rgb(shade([120,186,130],n));[[-.9,.4],[-.4,.8],[.5,-.4]].forEach(([dx,dy])=>{N.beginPath();N.arc(px+dx,py+dy,.14,.3,2*Math.PI-.1);N.lineTo(px+dx,py+dy);N.fill()});
  const open=(wx,wy)=>{const k=key(Math.round(wx),Math.round(wy));return!pathSet.has(k)&&!plazaSet.has(k)&&!fieldSet.has(k)&&!bedSet.has(k)&&!houseCells.has(k)&&!inPond(wx,wy,.2)&&!(Math.round(wx)===8&&Math.round(wy)===11)};
  N.fillStyle=rgb(shade(snowy(P.grass),n),.9);
  for(let t=0;t<W*H*1.2;t++){const x=hash(1.7*t+b.id)*W,y=hash(2.3*t+3*b.id)*H;if(!open(x+a[0],y+a[1]))continue;N.beginPath();N.arc(x,y,.08+.06*hash(t),0,2*Math.PI);N.fill()}
  if(snowCover<.6)for(let t=0;t<W*H*.3;t++){const x=hash(5.3*t+b.id)*W,y=hash(4.1*t+7*b.id)*H;if(!open(x+a[0],y+a[1]))continue;N.fillStyle=rgbA(t%3===0?[255,236,150]:t%3===1?[255,214,226]:[255,255,255],1,.9*(1-snowCover));N.beginPath();N.arc(x,y,.05,0,2*Math.PI);N.fill()}
  if(festK>0){N.fillStyle=`rgba(255,200,210,${.8*festK})`;for(let k=0;k<26;k++){N.beginPath();N.arc(7-a[0]-.4+hash(k*9)*2.8,10-a[1]-.4+hash(k*13)*2.8,.07,0,2*Math.PI);N.fill()}}
  snowOn=false;
}
function drawFloor(b,f){
  const h=b.house,n=f.n;
  for(let c=0;c<6;c++)for(let r=0;r<6;r++){const room=roomOf(c,r),x=c,y=r;
    if(room==='bath'||room==='kitchen'){const col=room==='bath'?P.tileB:P.tileK;for(let i=0;i<2;i++)for(let j=0;j<2;j++){N.fillStyle=rgb(shade((i+j)%2?col:mix(col,[255,255,255],.35),n));N.fillRect(x+i*.5,y+j*.5,.51,.51)}}
    else{N.fillStyle=rgb(shade(room==='bed'?[214,178,140]:P.floorW,n));N.fillRect(x,y,1.01,1.01);N.fillStyle=rgb(shade(P.wood,n),.5);for(let k=0;k<4;k++)N.fillRect(x,y+k*.25,1,.02)}}
  N.fillStyle=rgb(shade(h.id==='A'?[214,140,140]:[140,170,200],n));rr(1.1,3.2,1.4,1.6,.25);N.fill();N.strokeStyle=rgb(shade([255,240,220],n));N.lineWidth=.04;rr(1.2,3.3,1.2,1.4,.2);N.stroke();
  N.fillStyle=rgb(shade([180,210,230],n));rr(5.15,1.25,.7,.45,.1);N.fill();
}
function drawDeco(b,f,W,H,base,c){
  const r0=b.deco[f.key];const list=Array.isArray(r0)?r0:[{type:r0}];
  for(const r of list)switch(r.type){
    case'wallOut':{if(b.cut)break;const hs=b.house;for(const X of b.wall.wins){const u=faceU(b,f.key,X);if(u<.4||u>W-.4)continue;
      N.fillStyle=rgbA(P.wallTrim);N.fillRect(u-.36,.5,.72,.07);N.fillStyle=rgbA(P.recess);N.beginPath();arch(u,.57,.56,.62);N.fill();
      N.fillStyle=rgb(mix(A(P.glass),[255,206,126],hs.glow*.95),1,.6+.4*hs.glow);N.beginPath();arch(u+.04,.6,.4,.52);N.fill();
      N.fillStyle=rgbA(P.wallTrim,1,.85);N.fillRect(u+.01,.6,.04,.44);N.fillRect(u-.16,.82,.4,.04)}
      N.fillStyle=rgbA(P.wallTrim,.98);N.fillRect(0,H-.22,W,.1);break}
    case'wallIn':{if(b.cut)break;N.fillStyle=rgb(shade(b.house.paper,f.n));N.fillRect(0,0,W,H);
      N.fillStyle=rgb(shade(mix(b.house.paper,[200,170,150],.25),f.n),.5);for(let t=.15;t<W;t+=.3)N.fillRect(t,.08,.02,H-.2);
      N.fillStyle=rgb(shade(P.wood,f.n));N.fillRect(0,0,W,.08);N.fillStyle=rgb(shade(P.wallTrim,f.n));N.fillRect(0,H-.08,W,.08);
      for(const X of b.wall.wins){const u=faceU(b,f.key,X);if(u<.4||u>W-.4)continue;
        N.fillStyle=rgb(shade(P.wallTrim,f.n));N.fillRect(u-.33,.55,.66,.7);N.fillStyle=rgb(mix(skyMid,[255,255,255],.15*dayK));N.fillRect(u-.27,.61,.54,.58);
        N.fillStyle=rgb(shade(P.wallTrim,f.n));N.fillRect(u-.015,.61,.03,.58);N.fillRect(u-.27,.89,.54,.03);
        N.fillStyle=rgb(shade(b.house.id==='A'?[236,170,160]:[160,200,190],f.n),.9);N.fillRect(u-.38,.5,.12,.78);N.fillRect(u+.26,.5,.12,.78)}
      break}
    case'doorleaf':N.fillStyle=rgb(c,.85);N.fillRect(.08,.1,W-.16,H-.25);N.fillStyle=rgbA(P.gold);N.fillRect(W-.22,H*.45,.07,.07);break;
    case'dentils':N.fillStyle=rgb(c,.8);for(let t=.1;t<W;t+=.3)N.fillRect(t,.04,.14,.16);break;
    case'strata':N.fillStyle=rgb(c,.9,.7);for(let t=0;t<4;t++){const l=H*(.2+.22*t);N.beginPath();N.moveTo(0,l);for(let o=0;o<=W+.01;o+=.5)N.lineTo(o,l+.06*Math.sin(1.7*o+2*t+b.id));N.lineTo(W,l-.05);N.lineTo(0,l-.05);N.closePath();N.fill()}
      if(b.top===P.grass){snowOn=true;N.fillStyle=rgb(shade(snowy(P.grass),[0,0,1]),.96);snowOn=false;N.beginPath();N.moveTo(0,H);for(let t=0;t<=W+.01;t+=.25)N.lineTo(t,H-.12-.1*hash(3*t+b.id));N.lineTo(W,H);N.closePath();N.fill()}break;
    case'roof':N.fillStyle=rgb(c,.92);for(let t=.25;t<W;t+=.5)N.fillRect(t,0,.05,H);break;
    case'flue':N.fillStyle=rgbA([90,70,90]);N.fillRect(.1,.1,W-.2,H-.2);break;
    case'wellwater':N.fillStyle=rgbA([70,110,150]);N.beginPath();N.arc(W/2,H/2,Math.min(W,H)*.36,0,2*Math.PI);N.fill();break;
    case'awning':for(let t=0;t<W;t+=.22){N.fillStyle=(Math.round(t/.22)%2)?rgb(c):rgb(shade(P.coral,f.n));N.fillRect(t,0,.22,H)}break;
    case'awningEdge':for(let t=0;t<W;t+=.22){N.fillStyle=(Math.round(t/.22)%2)?rgbA(P.cream):rgbA(P.coral);N.beginPath();N.moveTo(t,H);N.lineTo(t+.22,H);N.lineTo(t+.11,-.05);N.fill()}break;
    case'stallfront':N.fillStyle=rgbA([236,190,90]);[[.2,.36],[.45,.4],[.7,.34]].forEach(([u,v])=>{N.beginPath();N.arc(u,v,.09,0,2*Math.PI);N.fill()});N.fillStyle=rgbA([232,112,100]);N.beginPath();N.arc(.33,.48,.08,0,2*Math.PI);N.arc(.58,.5,.08,0,2*Math.PI);N.fill();break;
    case'floor':drawFloor(b,f);break;
    case'gen':drawPattern(b.genSide,b,f,W,H,c);break;
    case'genTop':drawPattern(b.genTop,b,f,W,H,c);break;
    case'ground':drawGround(b,f,W,H);break;
    case'bedTop':{const bl=b.blanket;N.fillStyle=rgb(shade(mix(bl,[255,255,255],.1),f.n));rr(.02,.22,W-.04,H-.24,.08);N.fill();N.fillStyle=rgb(shade(mix(bl,[255,255,255],.45),f.n));N.fillRect(.02,.22,W-.04,.08);
      N.fillStyle=rgb(shade(P.white,f.n));rr(.12,.03,W-.24,.17,.07);N.fill();break}
    case'toiletTop':N.fillStyle=rgb(shade([255,255,255],f.n));N.beginPath();N.ellipse(W/2,H*.55,W*.42,H*.4,0,0,2*Math.PI);N.fill();N.fillStyle=rgb(shade([190,214,232],f.n));N.beginPath();N.ellipse(W/2,H*.55,W*.26,H*.25,0,0,2*Math.PI);N.fill();break;
    case'basinTop':N.fillStyle=rgb(shade([200,220,236],f.n));N.beginPath();N.ellipse(W/2,H*.55,W*.3,H*.28,0,0,2*Math.PI);N.fill();N.fillStyle=rgb(shade(P.steel,f.n));N.fillRect(W/2-.03,.04,.06,.14);break;
    case'tubTop':{N.fillStyle=rgb(shade([255,255,255],f.n));N.fillRect(0,0,W,H);N.fillStyle=rgb(shade([150,206,236],f.n));rr(.08,.08,W-.16,H-.16,.15);N.fill();
      if(b.house.bathing){N.fillStyle='rgba(255,255,255,0.85)';for(let k=0;k<9;k++){N.beginPath();N.arc(.15+hash(k*3)*(W-.3),.15+hash(k*7)*(H-.3),.05+.04*hash(k),0,2*Math.PI);N.fill()}}
      N.fillStyle=rgb(shade(P.steel,f.n));N.fillRect(W/2-.04,.02,.08,.1);break}
    case'sinkTop':N.fillStyle=rgb(shade([170,180,196],f.n));rr(.18,.15,W-.36,H-.3,.08);N.fill();N.fillStyle=rgb(shade([230,236,244],f.n));N.fillRect(W/2-.03,.03,.06,.15);
      if(b.house.dirty){N.fillStyle=rgb(shade([250,250,250],f.n));[[.35,.4],[.55,.45],[.45,.3]].forEach(([u,v])=>{N.beginPath();N.ellipse(u*W,v*H+.05,.1,.07,0,0,2*Math.PI);N.fill()})}break;
    case'stoveTop':{const on=!!b.house.cooking;[[.28,.35],[.66,.35],[.28,.65],[.66,.65]].forEach(([u,v],k)=>{N.strokeStyle=on&&k<2?`rgba(255,${(120+60*Math.sin(S.time*9+k))|0},60,0.95)`:rgb(shade([120,116,140],f.n));N.lineWidth=.04;N.beginPath();N.arc(u*W,v*H,.11,0,2*Math.PI);N.stroke()});
      if(on){N.fillStyle=rgb(shade([200,206,220],f.n));N.beginPath();N.arc(.28*W,.35*H,.15,0,2*Math.PI);N.fill();N.fillStyle=rgb(shade([236,180,110],f.n));N.beginPath();N.arc(.28*W,.35*H,.1,0,2*Math.PI);N.fill();
        N.fillStyle=rgb(shade([60,60,70],f.n));N.beginPath();N.ellipse(.66*W,.35*H,.14,.12,0,0,2*Math.PI);N.fill()}break}
    case'cabinet':N.fillStyle=rgb(c,.88);N.fillRect(.06,.08,W/2-.09,H-.2);N.fillRect(W/2+.03,.08,W/2-.09,H-.2);N.fillStyle=rgb(shade(P.steel,f.n));N.fillRect(W/2-.12,H*.55,.06,.12);N.fillRect(W/2+.06,H*.55,.06,.12);break;
    case'oven':N.fillStyle=rgb(c,.85);rr(.1,.1,W-.2,H-.25,.05);N.fill();N.fillStyle=rgb(shade([60,56,80],f.n));rr(.2,.18,W-.4,H*.4,.04);N.fill();if(b.house.cooking){N.fillStyle='rgba(255,170,80,0.55)';rr(.22,.2,W-.44,H*.36,.04);N.fill()}N.fillStyle=rgb(shade(P.steel,f.n));N.fillRect(.2,H-.2,W-.4,.04);break;
    case'fridge':N.fillStyle=rgb(c,.9);N.fillRect(.04,H*.62,W-.08,.03);N.fillStyle=rgb(shade(P.steel,f.n));N.fillRect(.1,H*.66,.04,.2);N.fillRect(.1,H*.3,.04,.24);
      N.fillStyle=rgb(shade([244,196,110],f.n));N.beginPath();N.arc(W*.6,H*.78,.05,0,2*Math.PI);N.fill();N.fillStyle=rgb(shade([232,112,100],f.n));N.fillRect(W*.5,H*.4,.12,.09);break;
    case'tableTop':{const hs=b.house,ready=hs.mealReady>clock.sim,spots=[[.18,.5],[.82,.5],[.5,.2]];N.fillStyle=rgb(shade([250,236,214],f.n));spots.forEach(([u,v])=>{rr(u*W-.14,v*H-.12,.28,.24,.05);N.fill()});
      if(ready||hs.dirty){spots.forEach(([u,v])=>{N.fillStyle=rgb(shade([255,255,255],f.n));N.beginPath();N.arc(u*W,v*H,.1,0,2*Math.PI);N.fill();if(ready){N.fillStyle=rgb(shade([236,170,90],f.n));N.beginPath();N.arc(u*W,v*H,.06,0,2*Math.PI);N.fill();N.fillStyle=rgb(shade([140,200,120],f.n));N.beginPath();N.arc(u*W+.03,v*H-.02,.03,0,2*Math.PI);N.fill()}})}
      if(ready){N.fillStyle=rgb(shade([230,110,90],f.n));N.beginPath();N.arc(.5*W,.62*H,.12,0,2*Math.PI);N.fill()}break}
    case'screen':{const on=b.house.tvOn;N.fillStyle=on?rgb([70,90,130]):rgb(shade([40,40,56],f.n));N.fillRect(.05,.05,W-.1,H-.1);
      if(on){const k=Math.floor(S.time*1.5);N.fillStyle=`hsla(${(hash(k)*360)|0},70%,70%,0.9)`;N.fillRect(.1,.1,W*.5,H*.5);N.fillStyle=`hsla(${(hash(k+5)*360)|0},70%,75%,0.9)`;N.fillRect(W*.45,H*.35,W*.4,H*.5);N.fillStyle='rgba(255,255,255,0.8)';N.beginPath();N.arc(W*.3+Math.sin(S.time*2)*.1,H*.6,.06,0,2*Math.PI);N.fill()}break}
    case'cushion':N.fillStyle=rgb(c,1.08);rr(.05,.05,W-.1,H/2-.08,.08);N.fill();rr(.05,H/2+.03,W-.1,H/2-.08,.08);N.fill();break;
    case'mirror':N.fillStyle=rgb(mix(skyMid,[230,240,250],.6));rr(.04,.04,W-.08,H-.08,.06);N.fill();N.fillStyle='rgba(255,255,255,0.5)';N.fillRect(W*.2,H*.5,.04,H*.3);break;
  }
}
function drawBox(b){
  const inAmb=houseAmb(b.house);
  for(const f of FACES){
    if(dot(f.n,cam.d)<=.001)continue;
    amb=b.indoor||(b.wall&&f.key===b.wall.inner)?inAmb:ambOut;
    const i=b.sc[f.o],a=b.sc[f.u],n=b.sc[f.v],r=[a[0]+n[0]-i[0],a[1]+n[1]-i[1]];
    let base=f.key==='top'?b.top:b.side;if(f.key==='top'&&!b.indoor&&!b.cut){snowOn=true;base=snowy(base);snowOn=false}const c=shade(base,f.n);
    N.fillStyle=rgb(c);N.strokeStyle=rgb(c);N.lineWidth=.8;N.beginPath();N.moveTo(i[0],i[1]);N.lineTo(a[0],a[1]);N.lineTo(r[0],r[1]);N.lineTo(n[0],n[1]);N.closePath();N.fill();N.stroke();
    if(b.deco[f.key]&&cam.scale>6){const l=b.wc[f.o],o=b.wc[f.u],h=b.wc[f.v],W=Math.hypot(o[0]-l[0],o[1]-l[1],o[2]-l[2]),H=Math.hypot(h[0]-l[0],h[1]-l[1],h[2]-l[2]);
      N.save();N.beginPath();N.moveTo(i[0],i[1]);N.lineTo(a[0],a[1]);N.lineTo(r[0],r[1]);N.lineTo(n[0],n[1]);N.closePath();N.clip();
      faceXform(i,[i[0]+(a[0]-i[0])/W,i[1]+(a[1]-i[1])/W],[i[0]+(n[0]-i[0])/H,i[1]+(n[1]-i[1])/H]);drawDeco(b,f,W,H,base,c);N.restore()}
    if(f.key!=='top'&&!b.indoor){N.strokeStyle=`rgba(255,255,255,${.22*(.4+.6*dayK)})`;N.lineWidth=1;N.beginPath();N.moveTo(n[0],n[1]);N.lineTo(r[0],r[1]);N.stroke()}
  }
  amb=ambOut;
}

