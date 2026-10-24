// ================= frame =================
let hudT=0;
function frame(dt){
  const sdt=dt*clock.speed;clock.sim+=sdt;tickClock();
  updateWeather(sdt);updateLight(dt);
  updateCamera(dt,!!drag);
  if(!(TEST&&TEST.freeze))walkers.forEach(w=>updateWalker(w,sdt));
  people.forEach(w=>{const a=w.act;if(!a||a.id!=='chat'||!a.lead||w.link)return;const p=a.partner;if(!p.act||p.act.id!=='chat'||p.act.partner!==w||p.link)return;
    w.chatT-=dt;if(w.chatT<=0){const sp=w.turn%2?p:w;w.turn++;say(sp,chatLine(sp,sp===w?p:w),2.8);w.chatT=3.3}});

  if(fpv.on){fpvFrame(dt);hudT-=dt;if(hudT<=0){updateHud();hudT=.25}return}
  N.setTransform(S.dpr,0,0,S.dpr,0,0);
  drawSky();clouds.forEach(c=>{if(!c.front)cloud(c,S.time)});birds(S.time);
  boxes.forEach(prepBox);
  const items=boxes.filter(b=>!b.skip);
  props.forEach(p=>{prepItem(p,p.lo,p.hi);items.push(p)});
  buildings.forEach(st=>{if(st.k<1)st.k=Math.min(1,st.k+dt/1.4)});polys.forEach(p=>{if(p.exteriorOnly&&interior)return;prepPoly(p);items.push(p)});
  walkers.forEach(w=>{if(hiddenW(w))return;const e=walkerPos(w);let z=e[2];if(w.link)z=Math.max(w.tile.pos[2],w.link.to.pos[2]);w.item=w.item||{kind:'walker',w};
    const post=w.kind==='person'?postureOf(w):'stand';
    if(post==='lie'||post==='bath'){const f=w.tile.furn;prepItem(w.item,[f.lo[0],f.lo[1],z+.001],[f.hi[0],f.hi[1],z+(post==='lie'?.2:.35)])}
    else prepItem(w.item,[e[0]-.04,e[1]-.04,z+.001],[e[0]+.04,e[1]+.04,z+(w.kind==='cat'?.4:.75)]);items.push(w.item)});
  const isBase=t=>t.kind==='box'&&t.whi[2]<=.2&&(t.whi[0]-t.wlo[0])*(t.whi[1]-t.wlo[1])>=2.5;
  const baseI=items.filter(isBase),restI=items.filter(t=>!isBase(t));
  for(const t of topo(baseI).concat(topo(restI))){if(t.kind==='box')drawBox(t);else if(t.kind==='walker'){t.w.kind==='cat'?drawCat(t.w):drawPerson(t.w)}else if(t.kind==='poly')drawPoly(t);else drawProp(t)}

  if(interior)for(const hs of buildings){
    if(hs.tvOn&&hs.tvP){const p=project(hs.tvP),r=cam.scale*1.6;const g=N.createRadialGradient(p[0],p[1],0,p[0],p[1],r);const a=.12+.2*nightK;g.addColorStop(0,`rgba(140,190,255,${a+.05*Math.sin(S.time*7)})`);g.addColorStop(1,'rgba(140,190,255,0)');N.fillStyle=g;N.fillRect(p[0]-r,p[1]-r,2*r,2*r)}
    if(hs.cooking&&hs.stoveP&&Math.random()<dt*6)steam.push({p:[hs.stoveP[0]-.2+Math.random()*.1,hs.stoveP[1]-.1,hs.stoveP[2]+.1],life:1})}
  for(let i=steam.length-1;i>=0;i--){const s=steam[i];s.life-=dt/1.6;s.p[2]+=.4*dt;if(s.life<=0||!interior){steam.splice(i,1);continue}const q=project(s.p);N.fillStyle=`rgba(255,255,255,${.5*s.life})`;N.beginPath();N.arc(q[0]+Math.sin(S.time*3+i)*2,q[1],cam.scale*(.06+.12*(1-s.life)),0,2*Math.PI);N.fill()}
  if(!interior)for(const hs of buildings){if(!hs.chimney)continue;hs.smokeT=(hs.smokeT||0)-sdt;if(hs.smokeT<=0){smoke.push({p:hs.chimney.slice(),life:1,s:.7+Math.random()*.6});hs.smokeT=(.6+Math.random()*.6)/(hs.cooking?2.2:.35)}}
  for(let i=smoke.length-1;i>=0;i--){const s=smoke[i];s.life-=dt/5;s.p[2]+=.45*dt;s.p[0]+=.12*dt;s.p[1]-=.06*dt;if(s.life<=0||interior){smoke.splice(i,1);continue}
    const q=project(s.p);N.fillStyle=rgb(mix(A([244,240,246]),[150,150,180],nightK*.4),1,.4*s.life);N.beginPath();N.arc(q[0],q[1],cam.scale*(.12+.3*(1-s.life))*s.s,0,2*Math.PI);N.fill()}
  if(nightK>.3&&rainK<.5)flies.forEach(f=>{const p=[f.b[0]+.4*Math.sin(S.time*.6+f.p),f.b[1]+.4*Math.cos(S.time*.5+f.p*1.3),.4+.25*Math.sin(S.time*1.1+f.p)];const q=project(p),a=(nightK-.3)*(.5+.5*Math.sin(S.time*3+f.p*4));
    const g=N.createRadialGradient(q[0],q[1],0,q[0],q[1],7);g.addColorStop(0,`rgba(230,255,160,${a})`);g.addColorStop(1,'rgba(230,255,160,0)');N.fillStyle=g;N.fillRect(q[0]-7,q[1]-7,14,14)});
  bunting();precip();
  clouds.forEach(c=>{if(c.front)cloud(c,S.time)});

  if(L==='en'){
    if(showLabels&&interior&&cam.zoom>=1.3)for(const hs of buildings)for(const k in hs.roomCenters){const rc=hs.roomCenters[k];if(rc.level!==effFloor(hs))continue;const p=project(rc.p);tag(p[0],p[1],rc.name.en,'room')}
    if(showLabels&&cam.zoom>=1.3)VOCAB.forEach(v=>{if(!vocabShown(v))return;if(v.word==='tree'&&!v.showLabel)return;const p=project(v.pos);if(p[0]<-40||p[0]>S.width+40||p[1]<-20||p[1]>S.height+20)return;tag(p[0],p[1]-10,v.word,'obj')});
  }
  const sayText=w=>L==='en'?(w.say.en||w.say.ja):(w.say.ja||w.say.en);
  walkers.forEach(w=>{if(hiddenW(w)||w===selected||(w.say&&S.time<w.say.until))return;if(w.act&&!w.link&&ACTS[w.act.id]&&ACTS[w.act.id].glyph&&w.act.id!=='chat'){const p=headPoint(w);bubble(p[0],p[1],ACTS[w.act.id].glyph,'glyph')}else if(w.act&&w.act.id==='catsleep'&&!w.link){const p=headPoint(w);bubble(p[0],p[1],'z','glyph')}});
  walkers.forEach(w=>{if(hiddenW(w)||!w.say||S.time>=w.say.until)return;const p=headPoint(w);bubble(p[0],p[1],w===selected?`${nameOf(w)}: ${sayText(w)}`:sayText(w),'say')});
  if(selected&&!hiddenW(selected)&&!(selected.say&&S.time<selected.say.until)){const p=headPoint(selected);bubble(p[0],p[1],nameOf(selected),'sel')}

  hudT-=dt;if(hudT<=0){updateHud();hudT=.25}
}

