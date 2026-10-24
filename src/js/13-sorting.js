// ================= sorting =================
const corner=(lo,hi,h)=>[h&1?hi[0]:lo[0],h&2?hi[1]:lo[1],h&4?hi[2]:lo[2]];
function prepBox(b){
  b.skip=false;b.cut=false;let hi=b.hi,lo=b.lo;const h=b.bld;
  if(h&&h.k<1){lo=[b.lo[0],b.lo[1],b.lo[2]*h.k];hi=[b.hi[0],b.hi[1],Math.max(lo[2]+.01,b.hi[2]*h.k)]}
  if(b.exteriorOnly&&interior){b.skip=true;return}
  // 内観では、見ている階より上は描かず、見ている階の手前の壁だけ低く切る
  const ef=interior&&h&&h.enterable?effFloor(h):-1;
  if(ef>=0&&b.level>ef){b.skip=true;return}
  const cn=b.cutN||b.cutWith;
  if(cn&&interior&&b.level===ef&&dot(cn,cam.d)>.02){const zb=b.level*WALL_H;if(b.cutWith||b.lo[2]>zb+FLOOR+.2){b.skip=true;return}hi=[b.hi[0],b.hi[1],zb+FLOOR+.2];b.cut=true}
  b.wc=[];for(let h=0;h<8;h++)b.wc.push(corner(lo,hi,h));b.sc=b.wc.map(project);
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;for(const s of b.sc){x0=Math.min(x0,s[0]);x1=Math.max(x1,s[0]);y0=Math.min(y0,s[1]);y1=Math.max(y1,s[1])}
  b.bb=[x0,y0,x1,y1];b.wlo=lo;b.whi=hi;b.depth=dot([(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2],cam.d)}
function prepItem(t,lo,hi){t.wlo=lo;t.whi=hi;let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;for(let h=0;h<8;h++){const s=project([h&1?hi[0]:lo[0],h&2?hi[1]:lo[1],h&4?hi[2]:lo[2]]);x0=Math.min(x0,s[0]);x1=Math.max(x1,s[0]);y0=Math.min(y0,s[1]);y1=Math.max(y1,s[1])}const p=cam.scale*.5;t.bb=[x0-p,y0-p,x1+p,y1+p*.3];t.depth=dot([(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2],cam.d)}
function sep(t,e){if(Math.abs(cam.d[2])>1e-4&&t.whi[0]>t.wlo[0]+.02&&e.whi[0]>e.wlo[0]+.02&&t.wlo[0]<e.whi[0]-.02&&e.wlo[0]<t.whi[0]-.02&&t.wlo[1]<e.whi[1]-.02&&e.wlo[1]<t.whi[1]-.02){const s=cam.d[2]>0?1:-1;if(e.wlo[2]>=t.whi[2]-1e-6)return s;if(t.wlo[2]>=e.whi[2]-1e-6)return-s}
  let l=0,i=-1/0;for(let o=0;o<3;o++){const a=cam.d[o];if(Math.abs(a)<1e-4)continue;const n=a>0?e.wlo[o]-t.whi[o]:t.wlo[o]-e.whi[o],r=a>0?t.wlo[o]-e.whi[o]:e.wlo[o]-t.whi[o];if(n>-1e-6&&n*Math.abs(a)+1>i){i=n*Math.abs(a)+1;l=1}if(r>-1e-6&&r*Math.abs(a)+1>i){i=r*Math.abs(a)+1;l=-1}}return l===0?(t.depth<e.depth?1:-1):l}
function topo(t){const e=t.length,inD=new Array(e).fill(0),adj=t.map(()=>[]);
  for(let o=0;o<e;o++){const a=t[o];for(let n=o+1;n<e;n++){const b=t[n];if(a.bb[2]<b.bb[0]||b.bb[2]<a.bb[0]||a.bb[3]<b.bb[1]||b.bb[3]<a.bb[1])continue;if(sep(a,b)>0){adj[o].push(n);inD[n]++}else{adj[n].push(o);inD[o]++}}}
  const out=[],done=new Array(e).fill(false);let q=[];for(let i=0;i<e;i++)if(inD[i]===0)q.push(i);
  while(out.length<e){if(!q.length){let i=-1;for(let k=0;k<e;k++)if(!done[k]&&(i<0||t[k].depth<t[i].depth))i=k;q.push(i);inD[i]=0}
    q.sort((x,y)=>t[y].depth-t[x].depth);const r=q.pop();if(done[r])continue;done[r]=true;out.push(t[r]);for(const k of adj[r]){inD[k]--;if(inD[k]===0&&!done[k])q.push(k)}}
  return out}

