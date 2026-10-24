// ================= sorting =================
const corner=(lo,hi,h)=>[h&1?hi[0]:lo[0],h&2?hi[1]:lo[1],h&4?hi[2]:lo[2]];
function prepBox(b){
  b.skip=false;b.cut=false;let hi=b.hi,lo=b.lo;const h=b.bld;
  if(h&&h.k<1){lo=[b.lo[0],b.lo[1],b.lo[2]*h.k];hi=[b.hi[0],b.hi[1],Math.max(lo[2]+.01,b.hi[2]*h.k)]}
  if(b.exteriorOnly&&interior){b.skip=true;return}
  // 外観では建物の中身（家具・仕切り・階段）は見えないので描かない。床板は外から縁が見えるので残す
  if(!interior&&b.indoor&&h&&h.enterable&&b.deco.top!=='floor'){b.skip=true;return}
  // 内観では、見ている階より上は描かず、見ている階の手前の壁だけ低く切る
  const ef=interior&&h&&h.enterable?effFloor(h):-1;
  if(ef>=0&&b.level>ef){b.skip=true;return}
  // 上の階を見ている時、下の階の中身は床にかくれるので描かない（壁と床板は外から見えるので残す）
  if(ef>0&&b.level<ef&&b.indoor&&b.deco.top!=='floor'){b.skip=true;return}
  const cn=b.cutN||b.cutWith;
  if(cn&&interior&&b.level===ef&&dot(cn,cam.d)>.02){const zb=b.level*WALL_H;if(b.cutWith||b.lo[2]>zb+FLOOR+.2){b.skip=true;return}hi=[b.hi[0],b.hi[1],zb+FLOOR+.2];b.cut=true}
  b.wc=[];for(let h=0;h<8;h++)b.wc.push(corner(lo,hi,h));b.sc=b.wc.map(project);
  let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;for(const s of b.sc){x0=Math.min(x0,s[0]);x1=Math.max(x1,s[0]);y0=Math.min(y0,s[1]);y1=Math.max(y1,s[1])}
  b.bb=[x0,y0,x1,y1];b.wlo=lo;b.whi=hi;b.depth=dot([(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2],cam.d)}
function prepItem(t,lo,hi){t.wlo=lo;t.whi=hi;let x0=1/0,y0=1/0,x1=-1/0,y1=-1/0;for(let h=0;h<8;h++){const s=project([h&1?hi[0]:lo[0],h&2?hi[1]:lo[1],h&4?hi[2]:lo[2]]);x0=Math.min(x0,s[0]);x1=Math.max(x1,s[0]);y0=Math.min(y0,s[1]);y1=Math.max(y1,s[1])}const p=cam.scale*.5;t.bb=[x0-p,y0-p,x1+p,y1+p*.3];t.depth=dot([(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2],cam.d)}
// 2つの箱のどちらを先に描くか: 1 = t が先、-1 = e が先、0 = 画面上で重ならないので決めない。
// 軸ごとに「離れているか」を調べ、離れている軸がすべて同じ向きを示す時だけ順番を決める。
// 向きが食い違う組は投影が重ならない（凸な箱どうしの性質）ので、決めると循環の原因になる。
function sep(t,e){
  if(Math.abs(cam.d[2])>1e-4&&t.whi[0]>t.wlo[0]+.02&&e.whi[0]>e.wlo[0]+.02&&t.wlo[0]<e.whi[0]-.02&&e.wlo[0]<t.whi[0]-.02&&t.wlo[1]<e.whi[1]-.02&&e.wlo[1]<t.whi[1]-.02){const s=cam.d[2]>0?1:-1;if(e.wlo[2]>=t.whi[2]-1e-6)return s;if(t.wlo[2]>=e.whi[2]-1e-6)return-s}
  let dir=0;
  for(let o=0;o<3;o++){const a=cam.d[o];if(Math.abs(a)<1e-4)continue;
    const d=t.whi[o]<=e.wlo[o]+1e-6?(a>0?1:-1):e.whi[o]<=t.wlo[o]+1e-6?(a>0?-1:1):0;
    if(d){if(dir&&d!==dir)return 0;dir=d}}
  return dir||(t.depth<e.depth?1:-1)}
function topo(t){const e=t.length,inD=new Array(e).fill(0),adj=t.map(()=>[]),pre=t.map(()=>[]);
  for(let o=0;o<e;o++){const a=t[o];for(let n=o+1;n<e;n++){const b=t[n];if(a.bb[2]<b.bb[0]||b.bb[2]<a.bb[0]||a.bb[3]<b.bb[1]||b.bb[3]<a.bb[1])continue;const r=sep(a,b);if(r>0){adj[o].push(n);pre[n].push(o);inD[n]++}else if(r<0){adj[n].push(o);pre[o].push(n);inD[o]++}}}
  const out=[],done=new Array(e).fill(false);let q=[];for(let i=0;i<e;i++)if(inD[i]===0)q.push(i);
  while(out.length<e){if(!q.length){let i=-1;for(let k=0;k<e;k++)if(!done[k]&&(i<0||t[k].depth<t[i].depth))i=k;
    // 循環がある時: まだ描いていない「先に描くべき箱」をたどり、同じ箱に戻ったら循環の中なのでそこを切る
    const seen=new Set();while(!seen.has(i)){seen.add(i);const u=pre[i].find(p=>!done[p]);if(u===undefined)break;i=u}
    q.push(i);inD[i]=0}
    q.sort((x,y)=>t[y].depth-t[x].depth);const r=q.pop();if(done[r])continue;done[r]=true;out.push(t[r]);for(const k of adj[r]){inD[k]--;if(inD[k]===0&&!done[k])q.push(k)}}
  return out}

