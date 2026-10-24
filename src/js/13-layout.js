// ================= layout =================
const hudTop=document.getElementById('hudTop'),controls=document.getElementById('controls'),logEl=document.getElementById('log');
function fit(){
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0,sx=0,sy=0,sz=0,n=0;
  boxes.forEach(b=>{for(let h=0;h<8;h++){const f=corner(b.lo,b.hi,h),d=isoProj(f);x0=Math.min(x0,d[0]);x1=Math.max(x1,d[0]);y0=Math.min(y0,d[1]);y1=Math.max(y1,d[1]);sx+=f[0];sy+=f[1];sz+=f[2];n++}});
  y0-=.8;
  const top=hudTop.getBoundingClientRect().bottom+4,narrow=S.width<=640;
  const botEl=Math.min(controls.getBoundingClientRect().top,narrow&&!logEl.hidden?logEl.getBoundingClientRect().top:1e9);
  const bot=S.height-botEl+4;
  const availH=Math.max(160,S.height-top-bot);
  const B=cam.base;B.scale=Math.min(S.width*.97/(x1-x0),availH*.99/(y1-y0));
  B.center=[sx/n,sy/n,sz/n];const b=isoProj(B.center);
  B.cx=S.width/2+(b[0]-(x0+x1)/2)*B.scale;B.cy=top+availH/2+(b[1]-(y0+y1)/2)*B.scale;
  B.areaX=S.width/2;B.areaY=top+availH/2;
  if(!cam.inited){cam.inited=true;cam.scale=B.scale;cam.center=B.center.slice();cam.cx=B.cx;cam.cy=B.cy}
}
function resize(){const r=cv.getBoundingClientRect();S.width=r.width;S.height=r.height;S.dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(1,Math.round(S.width*S.dpr));cv.height=Math.max(1,Math.round(S.height*S.dpr));fit()}
function updateCamera(dt,dragging){
  const k=1-Math.exp(-dt*(dragging?14:3));cam.az=lerp(cam.az,cam.taz,k);cam.el=lerp(cam.el,cam.tel,k);basis();
  cam.zoom=lerp(cam.zoom,cam.tzoom,1-Math.exp(-dt*6));
  const B=cam.base,f=cam.follow||null,kc=1-Math.exp(-dt*3);
  const tc=f?(()=>{const p=walkerPos(f);return[p[0],p[1],p[2]+.5]})():B.center;
  cam.center=mix(cam.center,tc,kc);cam.scale=B.scale*cam.zoom;
  let ox=B.cx-B.areaX,oy=B.cy-B.areaY;
  if(!f){let x0=1/0,x1=-1/0,y0=1/0,y1=-1/0;for(const X of[-.5,MW-.5])for(const Y of[-.5,MH-.5])for(const Z of[-2.5,WALL_H+.8]){const e=[X-B.center[0],Y-B.center[1],Z-B.center[2]],sx=B.scale*dot(e,cam.r),sy=-B.scale*dot(e,cam.u);x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)}ox=-(x0+x1)/2;oy=-(y0+y1)/2}
  cam.cx=lerp(cam.cx,f?B.areaX:B.areaX+ox*cam.zoom,kc);cam.cy=lerp(cam.cy,f?B.areaY:B.areaY+oy*cam.zoom,kc);
}

