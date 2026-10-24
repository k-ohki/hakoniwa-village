// ================= world: core =================
// 町は「箱（描画の単位）」と「タイル（歩ける1マス）」でできている。
// 地形・建物・家具はすべてこの2つを作るだけで、描画や経路探索はそれを読むだけにする。
const boxes=[], tiles=[], tileAt=new Map(), VOCAB=[], buildings=[], polys=[];
const key=(x,y)=>x+','+y;
const tkey=(x,y,lv)=>lv?key(x,y)+'@'+lv:key(x,y);
const WALL_H=1.6, FLOOR=.12;
let MW=0, MH=0;
function box(lo,hi,o={}){const b={...o,lo,hi,id:boxes.length,kind:'box'};b.top=o.top||o.side||P.wall;b.side=o.side||P.wall;b.deco=o.deco||{};b.level=o.level||0;boxes.push(b);return b}
function tile(x,y,z,o={}){const t={...o,level:o.level||0,pos:[x,y,z],id:tiles.length,links:[]};tiles.push(t);tileAt.set(tkey(x,y,t.level),t);return t}
const T=(x,y,lv=0)=>tileAt.get(tkey(x,y,lv));
const tileKey=t=>tkey(t.pos[0],t.pos[1],t.level);
function vocab(word,ja,ex,exja,pos,o={}){const v={word,ja,ex,exja,pos,...o};VOCAB.push(v);return v}
const ground=[];

// ---------- spots: 行動ID → その行動ができるタイル ----------
const SPOTS={}, SPOTREG=new Map();
// SPOTREG はタイル → そこでできる行動（一人称モードの「行動」ボタン用）。家の家具は SPOTS に入れず、その家の bld.spots と SPOTREG だけに入れる
function regTile(id,t){let s=SPOTREG.get(t);if(!s)SPOTREG.set(t,s=new Set());s.add(id)}
function addSpot(id,t){if(!t)return;(SPOTS[id]||(SPOTS[id]=[])).push(t);regTile(id,t)}
function dropSpot(id,t){const a=SPOTS[id];if(a){const i=a.indexOf(t);if(i>=0)a.splice(i,1)}const s=SPOTREG.get(t);if(s){s.delete(id);if(!s.size)SPOTREG.delete(t)}}
function dropTile(t){
  const gi=ground.indexOf(t);if(gi>=0)ground.splice(gi,1);
  const s=SPOTREG.get(t);if(s)[...s].forEach(id=>dropSpot(id,t));
  const i=tiles.indexOf(t);if(i>=0)tiles.splice(i,1);
  if(tileAt.get(tileKey(t))===t)tileAt.delete(tileKey(t));
}

// ---------- links: 隣のタイルへ歩けるか ----------
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function edgeOK(a,b){
  const ha=a.bld&&a.bld.enterable?a.bld:null,hb=b.bld&&b.bld.enterable?b.bld:null;
  if(!ha&&!hb)return true;
  const ka=tileKey(a),kb=tileKey(b);
  if(ha&&ha===hb)return!ha.blockedEdges.has(ka+'|'+kb);
  const h=ha||hb;if(!h.door)return false;const k1=key(...h.door[0]),k2=key(...h.door[1]);
  return(ka===k1&&kb===k2)||(ka===k2&&kb===k1);
}
function linkTile(t){
  t.links=[];
  for(const[dx,dy]of DIRS){const o=T(t.pos[0]+dx,t.pos[1]+dy,t.level);if(!o)continue;const dz=o.pos[2]-t.pos[2];if(Math.abs(dz)>.55||!edgeOK(t,o)||(t.stop&&o.stop))continue;t.links.push({to:o,dir:[dx,dy],dz})}
  if(t.stair){const o=t.stair;t.links.push({to:o,dir:[Math.sign(o.pos[0]-t.pos[0]),Math.sign(o.pos[1]-t.pos[1])],dz:o.pos[2]-t.pos[2],stair:true})}
}
function relinkAround(cells){
  const seen=new Set();
  for(const[x,y]of cells)for(const[dx,dy]of[[0,0],...DIRS])for(let lv=0;lv<4;lv++){const t=T(x+dx,y+dy,lv);if(t&&!seen.has(t)){seen.add(t);linkTile(t)}}
}
