// ================= shapes & colors for specs =================
const hexC=(s,fb)=>{const m=/^#?([0-9a-f]{6})$/i.exec(String(s||'').trim());if(!m)return fb;const v=parseInt(m[1],16);return[(v>>16)&255,(v>>8)&255,v&255]};
// 設計図の色は '#rrggbb' でも [r,g,b] でもよい
const col=(c,fb)=>Array.isArray(c)&&c.length===3&&c.every(v=>isFinite(v))?c.map(Number):c?hexC(c,fb):fb;
const PATTERNS=new Set(['windows','door','bricks','stripes','planks','tiles','glass','water','grass','dots','roof']);
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
