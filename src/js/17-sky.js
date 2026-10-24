// ================= sky & ambience =================
const clouds=[];for(let t=0;t<9;t++)clouds.push({x:hash(3.1*t),y:.12+.7*hash(7.7*t),s:.6+.9*hash(1.3*t),v:.004+.008*hash(5.9*t),front:t>=6});
const stars=[];for(let t=0;t<70;t++)stars.push({x:hash(11.3*t),y:hash(17.9*t)*.7,r:.6+1.2*hash(2.9*t),p:hash(5.1*t)*6});
const drops=[];for(let t=0;t<150;t++)drops.push({x:hash(t*1.9),y:hash(t*2.7),v:.8+.4*hash(t*3.3)});
const smoke=[],steam=[];
const flies=[];for(let t=0;t<14;t++)flies.push({b:t<8?[13+hash(t)*3,9.4+hash(t+9)*3.6]:[hash(t*3)*4,10+hash(t*5)*3.4],p:hash(t*7)*6});
function cloud(e,l){const W=S.width,H=S.height,a=W+400,n=(e.x*a+l*e.v*W)%a-200,r=e.front?H*(.93+.1*e.y):e.y*H,s=.07*Math.min(W,H)*e.s*(e.front?1.7:1);
  let c=mix(mix([70,80,130],[255,251,249],dayK),[255,214,200],duskK*.6);c=mix(c,[150,155,170].map(v=>v*(.4+.6*dayK)),rainK*.7);N.fillStyle=rgb(c,1,e.front?.9:.6+.3*rainK);N.beginPath();
  N.ellipse(n,r,1.6*s,.55*s,0,0,2*Math.PI);N.ellipse(n-.7*s,r-.2*s,.7*s,.55*s,0,0,2*Math.PI);N.ellipse(n+.3*s,r-.45*s,.85*s,.7*s,0,0,2*Math.PI);N.ellipse(n+s,r-.1*s,.6*s,.45*s,0,0,2*Math.PI);N.fill()}
function drawSky(){
  const W=S.width,H=S.height,h=clock.hour;
  let pal=[0,1,2,3].map(i=>mix(mix(SKY.night[i],SKY.day[i],dayK),SKY.dusk[i],duskK));
  const ov=Math.max(rainK,snowK*.6)*.85;if(ov>0)pal=pal.map(c=>{const g=(c[0]+c[1]+c[2])/3;return mix(c,[g*.95,g,g*1.08],ov)});
  skyMid=pal[1];
  const g=N.createLinearGradient(0,0,0,H);[0,.45,.8,1].forEach((s,i)=>g.addColorStop(s,rgb(pal[i])));N.fillStyle=g;N.fillRect(0,0,W,H);
  if(nightK>.05){const sa=nightK*(1-ov);for(const s of stars){N.fillStyle=`rgba(255,250,235,${sa*(.45+.45*Math.sin(S.time*1.7+s.p))})`;N.beginPath();N.arc(s.x*W,s.y*H,s.r,0,2*Math.PI);N.fill()}}
  const R=.045*Math.min(W,H),vis=1-ov;
  if(h>5&&h<19.3&&vis>.05){const f=(h-5)/14.3,x=lerp(.08,.92,f)*W,y=H*(.42-.32*Math.sin(Math.PI*f));const sc=mix([255,248,228],[255,186,130],duskK);
    const gl=N.createRadialGradient(x,y,0,x,y,H*.5);gl.addColorStop(0,rgb(sc,1,.85*vis));gl.addColorStop(.12,rgb(sc,1,.45*vis));gl.addColorStop(1,rgb(sc,1,0));N.fillStyle=gl;N.fillRect(0,0,W,H);
    N.fillStyle=rgb(sc,1,.95*vis);N.beginPath();N.arc(x,y,R,0,2*Math.PI);N.fill()}
  if((h>=18||h<6)&&vis>.05){const f=((h-18+24)%24)/12,x=lerp(.9,.1,f)*W,y=H*(.4-.3*Math.sin(Math.PI*f)),ma=nightK*vis;
    const gl=N.createRadialGradient(x,y,0,x,y,R*5);gl.addColorStop(0,`rgba(230,236,255,${.35*ma})`);gl.addColorStop(1,'rgba(230,236,255,0)');N.fillStyle=gl;N.fillRect(x-R*5,y-R*5,R*10,R*10);
    N.fillStyle=`rgba(250,246,226,${ma})`;N.beginPath();N.arc(x,y,R*.8,0,2*Math.PI);N.fill()}
  if(rainbowK>.01){const cx=W*.5,cy=H*.95,rad=Math.min(W*.6,H*.85);N.lineWidth=Math.max(5,rad*.028);
    ['#ff7f7f','#ffb46b','#ffe58a','#9be39b','#8cc8ff','#b39bff'].forEach((c,k)=>{N.strokeStyle=c;N.globalAlpha=.32*rainbowK*dayK;N.beginPath();N.arc(cx,cy,rad-k*N.lineWidth,Math.PI,2*Math.PI);N.stroke()});N.globalAlpha=1}
}
function birds(t){if(dayK<.2||rainK>.5)return;N.strokeStyle=`rgba(110,96,150,${.55*dayK})`;N.lineWidth=1.4;
  for(let e=0;e<3;e++){const i=((hash(4.4*e)+t*(.018+.006*e))%1.2-.1)*S.width,o=S.height*(.14+.3*hash(8.2*e))+8*Math.sin(.7*t+e),a=3*Math.sin(6*t+2*e),n=5+e;
    N.beginPath();N.moveTo(i-n,o-a);N.quadraticCurveTo(i-.4*n,o-.4*n,i,o);N.quadraticCurveTo(i+.4*n,o-.4*n,i+n,o-a);N.stroke()}}
function precip(){
  const W=S.width,H=S.height;
  if(rainK>.02){N.strokeStyle=`rgba(220,230,250,${.45*rainK})`;N.lineWidth=1;N.beginPath();for(const d of drops){const y=(d.y*H+S.time*H*.9*d.v)%H,x=(d.x*W+y*.12)%W;N.moveTo(x,y);N.lineTo(x-2,y+12)}N.stroke()}
  if(snowK>.02){N.fillStyle=`rgba(255,255,255,${.85*snowK})`;for(const d of drops.slice(0,110)){const y=(d.y*H+S.time*H*.07*d.v)%H,x=(d.x*W+Math.sin(S.time*.8+d.x*20)*14+W)%W;N.beginPath();N.arc(x,y,1.2+1.6*d.v,0,2*Math.PI);N.fill()}}
}
function bunting(){
  if(festK<.02)return;const pts=[[6.5,9.5],[9.5,9.5],[9.5,12.5],[6.5,12.5]];
  for(let k=0;k<4;k++){const a=pts[k],b=pts[(k+1)%4],pa=project([a[0],a[1],1.6*festK]),pb=project([b[0],b[1],1.6*festK]),mid=project([(a[0]+b[0])/2,(a[1]+b[1])/2,1.25*festK]);
    const cx=2*mid[0]-(pa[0]+pb[0])/2,cy=2*mid[1]-(pa[1]+pb[1])/2;
    N.strokeStyle=`rgba(120,100,140,${.7*festK})`;N.lineWidth=1;N.beginPath();N.moveTo(pa[0],pa[1]);N.quadraticCurveTo(cx,cy,pb[0],pb[1]);N.stroke();
    for(let j=1;j<8;j++){const t=j/8,x=(1-t)*(1-t)*pa[0]+2*t*(1-t)*cx+t*t*pb[0],y=(1-t)*(1-t)*pa[1]+2*t*(1-t)*cy+t*t*pb[1],s=cam.scale*.13;
      N.globalAlpha=festK;N.fillStyle=['#ef8a80','#f5c66b','#8fd0b0','#9fb6f0'][(j+k)%4];
      if(nightK>.4){const g=N.createRadialGradient(x,y,0,x,y,s*1.8);g.addColorStop(0,'rgba(255,230,160,0.8)');g.addColorStop(1,'rgba(255,230,160,0)');N.fillStyle=g;N.fillRect(x-s*2,y-s*2,s*4,s*4);N.fillStyle='#ffe6a0';N.beginPath();N.arc(x,y,s*.35,0,2*Math.PI);N.fill()}
      else{N.beginPath();N.moveTo(x-s*.6,y);N.lineTo(x+s*.6,y);N.lineTo(x,y+s*1.1);N.fill()}N.globalAlpha=1}}
}
function updateLight(dt){
  const h=clock.hour;
  dayK=smooth((h-5)/2.2)*(1-smooth((h-17.6)/2.2));
  const bump=c=>smooth(1-Math.abs(h-c)/1.7);duskK=Math.max(bump(6.2),bump(18.6))*.9;
  nightK=1-dayK;
  const k=1-Math.exp(-dt*.8);
  rainK=lerp(rainK,weather.kind==='rain'?1:0,k);snowK=lerp(snowK,weather.kind==='snow'?1:0,k);
  rainbowK=lerp(rainbowK,clock.sim<weather.rainbowUntil?1:0,k*.6);festK=lerp(festK,clock.sim<weather.festUntil?1:0,k*1.5);
  ambOut=mix(mix([.4,.45,.7],[1,1,1],dayK),[1.04,.84,.76],duskK*.6);
  const ov=Math.max(rainK,snowK*.5);ambOut=[ambOut[0]*lerp(1,.76,ov),ambOut[1]*lerp(1,.79,ov),ambOut[2]*lerp(1,.88,ov)];amb=ambOut;
  for(const hs of buildings){if(!hs.enterable)continue;const inside=hs.residents.length?hs.residents:walkers.filter(w=>w.tile.bld===hs),awake=inside.some(w=>!(w.act&&w.act.id==='sleep'&&!w.link));hs.lights=(nightK>.3||rainK>.5)&&awake;hs.glow=lerp(hs.glow,hs.lights?Math.max(nightK,rainK*.6):0,1-Math.exp(-dt*2));
    hs.bathing=walkers.some(w=>w.act&&w.act.id==='bath'&&(w.act.hs||w.house)===hs&&!w.link)}
}
function updateWeather(sdt){
  const dtH=sdt/HR;
  if(weather.kind!=='clear'&&clock.sim>weather.until){const was=weather.kind;weather.kind='clear';log(was==='rain'?J('雨があがった','The rain stopped.'):J('雪がやんだ','The snow stopped.'));if(was==='rain'&&Math.random()<.45&&dayK>.5){weather.rainbowUntil=clock.sim+1.5*HR;log(J('空に虹がかかった','A rainbow appeared in the sky!'))}}
  if(weather.plan&&clock.hour>=weather.plan.at&&clock.hour<weather.plan.at+1&&weather.kind==='clear'){setWeather(weather.plan.kind,weather.plan.hours);log(weather.plan.kind==='rain'?J('雨が降りはじめた','It started to rain.'):J('雪が降りはじめた','It started to snow.'));weather.plan=null}
  if(weather.kind==='snow')snowCover=clamp(snowCover+.12*dtH,0,1);else snowCover=clamp(snowCover-(weather.kind==='rain'?.3:.12)*dtH,0,1);
}

