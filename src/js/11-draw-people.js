// ================= drawing: people =================
const SKIN=[253,227,207];
function postureOf(w){if(w.link||!w.tile.furn)return'stand';return w.tile.furn.type==='bed'?'lie':w.tile.furn.type==='tub'?'bath':'sit'}
function drawPerson(w){
  amb=w.tile.indoor?houseAmb(w.tile.house):ambOut;
  const post=postureOf(w),sc=1.35*cam.scale*(w.kid?.8:1),moving=!!w.link,face=faceOf(w),mood=moodOf(w),s=cam.scale;
  if(post==='lie'){const f=w.tile.furn,hp=project(f.head),fp=project(f.foot),mid=project([f.head[0]+(f.foot[0]-f.head[0])*.25,f.head[1]+(f.foot[1]-f.head[1])*.25,f.head[2]]);
    N.strokeStyle=rgbA(mix(w.cloak,[255,255,255],.25));N.lineCap='round';N.lineWidth=.42*s;N.beginPath();N.moveTo(mid[0],mid[1]-.06*s);N.lineTo(fp[0],fp[1]-.05*s);N.stroke();
    N.strokeStyle=rgbA(mix(w.cloak,[255,255,255],.5));N.lineWidth=.1*s;N.beginPath();N.moveTo(mid[0]-.17*s,mid[1]-.08*s);N.lineTo(mid[0]+.17*s,mid[1]-.02*s);N.stroke();
    const hx_=hp[0],hy=hp[1]-.1*s,r=.11*s;N.fillStyle=rgbA(SKIN);N.beginPath();N.arc(hx_,hy,r,0,2*Math.PI);N.fill();N.fillStyle=rgbA(w.cap);N.beginPath();N.arc(hx_,hy-.02*s,r*1.02,Math.PI*1.05,Math.PI*1.95);N.fill();
    N.strokeStyle=rgbA([74,63,92]);N.lineWidth=Math.max(1,.012*sc);N.beginPath();N.moveTo(hx_-.04*s,hy+.01*s);N.lineTo(hx_-.01*s,hy+.01*s);N.moveTo(hx_+.02*s,hy+.01*s);N.lineTo(hx_+.05*s,hy+.01*s);N.stroke();
    if(w===selected){N.strokeStyle='rgba(255,255,255,0.95)';N.lineWidth=2;N.beginPath();N.arc(hx_,hy,r*1.6,0,2*Math.PI);N.stroke()}
    amb=ambOut;return}
  const l=project(walkerPos(w));let n=l[0],r=l[1];
  if(post==='bath'){const c=project([w.tile.pos[0],w.tile.pos[1],w.tile.pos[2]-.02]);n=c[0];r=c[1];
    N.fillStyle=rgbA(SKIN);N.beginPath();N.ellipse(n,r,.17*s,.06*s,0,0,2*Math.PI);N.fill();
    const hy=r-.13*s;N.beginPath();N.arc(n,hy,.11*s,0,2*Math.PI);N.fill();N.fillStyle='rgba(255,255,255,0.95)';N.beginPath();N.ellipse(n,hy-.1*s,.1*s,.05*s,0,0,2*Math.PI);N.fill();
    N.fillStyle=rgbA([74,63,92]);N.fillRect(n+face*.04*s-.02*s,hy,.04*s,.01*s);
    N.fillStyle='rgba(255,255,255,0.9)';for(let k=0;k<6;k++){N.beginPath();N.arc(n+(hash(k*3)-.5)*.5*s,r+(hash(k*5)-.5)*.12*s,(.04+.03*hash(k))*s,0,2*Math.PI);N.fill()}
    if(w===selected){N.strokeStyle='rgba(255,255,255,0.95)';N.lineWidth=2;N.beginPath();N.arc(n,hy,.2*s,0,2*Math.PI);N.stroke()}
    amb=ambOut;return}
  const i=sc,dancing=w.act&&w.act.id==='dance'&&!moving,sit=post==='sit';
  let a=moving?Math.abs(Math.sin(w.phase))*i*.05:Math.sin(2*S.time+w.phase)*i*.008;
  if(dancing)a=Math.abs(Math.sin(S.time*6+w.phase))*i*.14;
  if(sit)a=-.1*i;
  if(w===selected){N.strokeStyle='rgba(255,255,255,0.95)';N.lineWidth=2;N.beginPath();N.ellipse(n,r,.3*i,.13*i,0,0,2*Math.PI);N.stroke()}
  if(!sit){N.fillStyle='rgba(60,45,100,0.22)';N.beginPath();N.ellipse(n,r,.2*i,.09*i,0,0,2*Math.PI);N.fill()}
  const c=moving?Math.sin(w.phase)*i*.06:0;
  N.strokeStyle=rgbA([91,76,116]);N.lineWidth=Math.max(1.2,.05*i);N.lineCap='round';N.beginPath();
  if(sit){for(const dx of[-.04,.04]){N.moveTo(n+dx*i,r-.07*i);N.lineTo(n+dx*i+face*.13*i,r-.05*i);N.lineTo(n+dx*i+face*.15*i,r+.12*i)}}
  else{N.moveTo(n-.05*i,r-.2*i-a);N.lineTo(n-.05*i+c,r-.02*i-(dancing?a*.5:0));N.moveTo(n+.05*i,r-.2*i-a);N.lineTo(n+.05*i-c,r-.02*i-(dancing?a*.5:0))}
  N.stroke();
  const h=r-.6*i-a,bot=sit?r-.06*i:r-.16*i-a;
  N.fillStyle=rgbA(w.cloak);N.beginPath();N.moveTo(n-.09*i,h+.08*i);N.quadraticCurveTo(n-.2*i,bot-.04*i,n-.17*i,bot);N.lineTo(n+.17*i,bot);N.quadraticCurveTo(n+.2*i,bot-.04*i,n+.09*i,h+.08*i);N.closePath();N.fill();
  N.fillStyle=rgbA(w.cloak,.82);N.beginPath();N.moveTo(n+face*i*.02,h+.1*i);N.lineTo(n+face*i*.17,bot);N.lineTo(n+face*i*.05,bot);N.closePath();N.fill();
  const act=w.act&&!moving?w.act.id:null;
  if(dancing){N.strokeStyle=rgbA(w.cloak);N.lineWidth=Math.max(1.5,.05*i);const sn=Math.sin(S.time*6+w.phase);N.beginPath();N.moveTo(n-.1*i,h+.15*i);N.lineTo(n-.25*i,h-.05*i+sn*.08*i);N.moveTo(n+.1*i,h+.15*i);N.lineTo(n+.25*i,h-.05*i-sn*.08*i);N.stroke()}
  N.fillStyle=rgbA(SKIN);N.beginPath();N.arc(n,h,.1*i,0,2*Math.PI);N.fill();
  const sleepy=act==='nap'||mood==='tired',ex=n+face*i*.04;
  N.fillStyle=rgbA([74,63,92]);if(sleepy){N.fillRect(ex-.02*i,h+.005*i,.04*i,.008*i)}else{N.beginPath();N.arc(ex,h+.01*i,.014*i,0,2*Math.PI);N.fill()}
  if(i>20){N.strokeStyle=rgbA([150,90,100]);N.lineWidth=Math.max(1,.012*i);N.beginPath();const mx=n+face*i*.055,my=h+.055*i;
    if(act==='brush'){N.strokeStyle=rgbA([120,180,230]);N.lineWidth=Math.max(1.5,.025*i);N.moveTo(mx-.01*i,my);N.lineTo(mx+face*.1*i,my-.01*i+Math.sin(S.time*14)*.01*i)}
    else if(mood==='happy'||mood==='excited')N.arc(mx,my-.012*i,.02*i,.2,Math.PI-.2);else if(mood==='sad'||mood==='tired')N.arc(mx,my+.012*i,.018*i,Math.PI+.4,-.4);else if(mood==='scared'){N.arc(mx,my,.012*i,0,2*Math.PI)}else if(mood==='angry'){N.moveTo(mx-.02*i,my);N.lineTo(mx+.02*i,my);N.moveTo(ex-.03*i,h-.03*i);N.lineTo(ex+.02*i,h-.015*i)}else{N.moveTo(mx-.012*i,my);N.lineTo(mx+.012*i,my)}N.stroke()}
  if(mood==='happy'||mood==='excited'){N.fillStyle='rgba(240,140,140,0.45)';N.beginPath();N.arc(n+face*i*.02,h+.04*i,.022*i,0,2*Math.PI);N.fill()}
  N.fillStyle=rgbA(w.cap);N.beginPath();N.arc(n,h-.015*i,.105*i,Math.PI,0);N.closePath();N.fill();N.beginPath();N.arc(n-face*i*.02,h-.13*i,.04*i,0,2*Math.PI);N.fill();
  if(rainK>.3&&!w.tile.indoor&&!(w.link&&w.link.to.indoor)){N.strokeStyle=rgbA([120,100,90]);N.lineWidth=Math.max(1,.02*i);N.beginPath();N.moveTo(n+.12*i,h+.25*i);N.lineTo(n+.12*i,h-.32*i);N.stroke();
    N.fillStyle=rgbA(mix(w.cloak,[255,255,255],.25));N.beginPath();N.moveTo(n+.12*i-.3*i,h-.24*i);N.quadraticCurveTo(n+.12*i,h-.62*i,n+.12*i+.3*i,h-.24*i);N.closePath();N.fill()}
  if(act){
    const hand=[n+face*.16*i,h+.28*i];
    if(act==='fish'){N.strokeStyle=rgbA([150,110,90]);N.lineWidth=Math.max(1,.025*i);N.beginPath();N.moveTo(n+face*.1*i,h+.25*i);N.lineTo(n+face*.55*i,h-.15*i);N.stroke();
      N.strokeStyle='rgba(255,255,255,0.6)';N.lineWidth=1;N.beginPath();N.moveTo(n+face*.55*i,h-.15*i);N.lineTo(n+face*.6*i,r+.05*i+Math.sin(S.time*2)*2);N.stroke()}
    if(act==='field'){N.strokeStyle=rgbA([150,110,90]);N.lineWidth=Math.max(1,.03*i);const sw=Math.sin(S.time*4+w.phase)*.08*i;N.beginPath();N.moveTo(n+face*.12*i,h+.2*i);N.lineTo(n+face*.3*i,r-.02*i+sw);N.stroke()}
    if(act==='flower'||act==='well'){N.fillStyle=rgbA([126,186,222]);N.fillRect(hand[0]-.05*i,hand[1],.1*i,.1*i)}
    if(act==='cook'||act==='dishes'||act==='wash'){N.strokeStyle=rgbA(SKIN);N.lineWidth=Math.max(1.2,.04*i);const sw=Math.sin(S.time*7)*.03*i;N.beginPath();N.moveTo(n+face*.08*i,h+.2*i);N.lineTo(hand[0]+sw,hand[1]-.02*i);N.stroke()}
    if(act==='eat'){N.strokeStyle=rgbA([150,110,90]);N.lineWidth=Math.max(1,.015*i);const up=(Math.sin(S.time*3)>0)?.12*i:0;N.beginPath();N.moveTo(hand[0],hand[1]-up);N.lineTo(hand[0]+face*.1*i,hand[1]-.05*i-up);N.stroke()}
    if(act==='snack'){N.fillStyle=rgbA([236,240,250]);N.fillRect(hand[0]-.03*i,hand[1]-.1*i,.06*i,.1*i)}
    if(act==='bench'&&w.name==='ミノリ'){N.fillStyle=rgbA([200,90,90]);N.fillRect(n+face*.06*i-.06*i,h+.18*i,.12*i,.09*i);N.fillStyle=rgbA([255,250,240]);N.fillRect(n+face*.06*i-.05*i,h+.19*i,.1*i,.07*i)}
  }
  amb=ambOut;
}
function drawCat(w){
  amb=w.tile.indoor?houseAmb(w.tile.house):ambOut;
  const l=project(walkerPos(w)),s=cam.scale,moving=!!w.link,face=faceOf(w),x=l[0],y=l[1];
  const sleeping=w.act&&w.act.id==='catsleep'&&!moving,b=moving?Math.abs(Math.sin(w.phase*1.3))*s*.03:0;
  if(w===selected){N.strokeStyle='rgba(255,255,255,0.9)';N.lineWidth=2;N.beginPath();N.ellipse(x,y,.28*s,.12*s,0,0,2*Math.PI);N.stroke()}
  N.fillStyle='rgba(60,45,100,0.2)';N.beginPath();N.ellipse(x,y,.2*s,.07*s,0,0,2*Math.PI);N.fill();
  const c=rgbA(w.cloak),c2=rgbA(w.cloak,.85);
  if(sleeping){N.fillStyle=c;N.beginPath();N.ellipse(x,y-.08*s,.18*s,.1*s,0,0,2*Math.PI);N.fill();N.fillStyle=c2;N.beginPath();N.arc(x+face*.1*s,y-.1*s,.07*s,0,2*Math.PI);N.fill();amb=ambOut;return}
  N.strokeStyle=c2;N.lineWidth=Math.max(1.5,.04*s);N.lineCap='round';N.beginPath();N.moveTo(x-face*.14*s,y-.14*s-b);N.quadraticCurveTo(x-face*.3*s,y-.2*s,x-face*.24*s,y-.36*s+Math.sin(S.time*3)*.04*s);N.stroke();
  N.beginPath();for(const dx of[-.09,.09]){N.moveTo(x+dx*s,y-.1*s-b);N.lineTo(x+dx*s+(moving?Math.sin(w.phase+dx*20)*.03*s:0),y-.01*s)}N.stroke();
  N.fillStyle=c;N.beginPath();N.ellipse(x,y-.14*s-b,.17*s,.08*s,0,0,2*Math.PI);N.fill();
  const hx_=x+face*.16*s,hy=y-.24*s-b;N.beginPath();N.arc(hx_,hy,.075*s,0,2*Math.PI);N.fill();
  N.beginPath();N.moveTo(hx_-.065*s,hy-.03*s);N.lineTo(hx_-.05*s,hy-.12*s);N.lineTo(hx_-.01*s,hy-.06*s);N.moveTo(hx_+.065*s,hy-.03*s);N.lineTo(hx_+.05*s,hy-.12*s);N.lineTo(hx_+.01*s,hy-.06*s);N.fill();
  N.fillStyle=rgbA([74,63,92]);N.beginPath();N.arc(hx_+face*.03*s,hy-.005*s,.012*s,0,2*Math.PI);N.fill();amb=ambOut;
}
function headPoint(w){const p=project(walkerPos(w)),post=w.kind==='person'?postureOf(w):'stand';
  if(post==='lie'){const q=project(w.tile.furn.head);return[q[0],q[1]-.25*cam.scale]}
  if(post==='bath')return[p[0],p[1]-.35*cam.scale];
  if(w.kind==='cat')return[p[0],p[1]-.42*cam.scale];
  return[p[0],p[1]-(post==='sit'?.92:1.05)*cam.scale*(w.kid?.82:1)-(rainK>.3&&!w.tile.indoor?.2*cam.scale:0)]}
function bubble(x,y,text,style){
  const strong=style==='say'||style==='sel';N.font=`700 ${strong?12:11}px ${FONT}`;N.textAlign='center';N.textBaseline='middle';
  const w=N.measureText(text).width+(strong?16:11),h=strong?22:18,bx=clamp(x-w/2,4,S.width-w-4);
  rr(bx,y-h-7,w,h,h/2);N.fillStyle=style==='say'?'rgba(255,250,236,0.96)':'rgba(255,253,250,0.92)';N.fill();N.strokeStyle=style==='say'?'rgba(200,144,46,0.5)':'rgba(120,100,160,0.25)';N.lineWidth=1;N.stroke();
  N.beginPath();N.moveTo(x-4,y-7.5);N.lineTo(x,y-2);N.lineTo(x+4,y-7.5);N.fillStyle=style==='say'?'rgba(255,250,236,0.96)':'rgba(255,253,250,0.92)';N.fill();
  N.fillStyle='#4a3f5c';N.fillText(text,bx+w/2,y-7-h/2+1);N.textAlign='left'}
function tag(x,y,text,kind){N.font=`700 ${kind==='room'?12:11}px ${FONT}`;N.textAlign='center';N.textBaseline='middle';const w=N.measureText(text).width+10,h=17;
  rr(x-w/2,y-h/2,w,h,6);N.fillStyle=kind==='room'?'rgba(63,127,168,0.82)':'rgba(255,255,255,0.9)';N.fill();if(kind!=='room'){N.strokeStyle='rgba(63,127,168,0.45)';N.lineWidth=1;N.stroke()}
  N.fillStyle=kind==='room'?'#fff':'#2f6a90';N.fillText(text,x,y+.5);N.textAlign='left'}

