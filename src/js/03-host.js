// ================= host =================
const cv=document.getElementById('scene');let N=cv.getContext('2d');
const S={width:0,height:0,dpr:1,time:0};
const cam={az:ISO_AZ,el:ISO_EL,taz:ISO_AZ,tel:ISO_EL,d:null,r:null,u:null,scale:30,cx:0,cy:0,center:[8.5,7.5,0],
  base:{scale:30,center:[8.5,7.5,0],cx:0,cy:0,areaX:0,areaY:0},zoom:1,tzoom:1,follow:null};
function basis(){const c=Math.cos(cam.el);cam.d=[c*Math.cos(cam.az),c*Math.sin(cam.az),Math.sin(cam.el)];cam.r=[Math.sin(cam.az),-Math.cos(cam.az),0];cam.u=cross(cam.r,cam.d)}
let projOverride=null;
function project(p){if(projOverride)return projOverride(p);const e=[p[0]-cam.center[0],p[1]-cam.center[1],p[2]-cam.center[2]];return[cam.cx+cam.scale*dot(e,cam.r),cam.cy-cam.scale*dot(e,cam.u)]}
const isoProj=t=>[.70710678*(t[0]-t[1]),.40824829*(t[0]+t[1])-.81649658*t[2]];

