// ================= town =================
// 町の地図。地形・建物・小物はここにデータとして書き、下の assembleTown() が組み立てる。
// 北西が昔からの村（家A・家B・広場・池・畑）。東に学校と校庭、南に新しい家とデパート。いちばん東は神の声で建物を建てる空き地。
const TOWN={
  size:[38,24],
  // 島の土台（地層）
  island:[
    {lo:[-.5,-.5,-1],hi:[37.5,23.5,0],top:P.grass,side:P.rock,deco:{top:'ground',px:'strata',py:'strata',nx:'strata',ny:'strata'}},
    {lo:[.3,.3,-2],hi:[36.7,22.7,-1],side:P.rock,deco:{px:'strata',py:'strata',nx:'strata',ny:'strata'}},
    {lo:[2.5,2,-3],hi:[34.5,21,-2],side:P.rockDark,deco:{px:'strata',py:'strata',nx:'strata',ny:'strata'}},
    {lo:[8,6,-3.8],hi:[29,17,-3],side:P.rockDark,deco:{px:'strata',py:'strata'}},
    {lo:[13,9,-4.4],hi:[24,14,-3.8],side:P.rockDark}],
  // 道は [x0,y0,x1,y1] の直線（両端を含む）
  paths:[[0,8,37,8],[2,7,2,7],[11,7,11,7],[28,7,28,7],[5,9,5,22],[12,9,12,22],[19,0,19,22],[0,22,37,22],[30,0,30,22]],
  plaza:{x:7,y:10,w:3,h:3,except:[[8,11]]},
  fields:[{x:0,y:12,w:4,h:3}],
  flowerbeds:[[0,7],[1,7],[14,7],[15,7],[8,6],[8,7],[20,7],[21,7],[25,7],[26,7],[6,23],[11,23],[13,23],[18,23]],
  ponds:[{x:15.2,y:12.3,rx:2.25,ry:1.7},{x:27.9,y:11.1,rx:1.4,ry:1.15},{x:36.1,y:3.2,rx:1.3,ry:1.1}],
  trees:[[0,0,.85],[8,0,.7],[17,0,.78],[17,6,.7],[0,10,.62],[7,15,.62],[10,14,.6],[15,15,.6],[17,9,.55],
    [20,0,.7],[25,0,.62],[29,0,.75],[29,7,.6],[20,13,.62],[25,13,.55],[29,13,.6],[31,0,.6],[37,7,.55],[37,9,.6],[31,23,.6],[37,23,.55],[0,17,.7],[2,20,.6],[3,16,.55],[0,23,.6]],
  sakura:[[8,11,1.05],[28,9,.9]],
  lanterns:[[4,7],[6,9],[9,7],[13,7],[10,10],[10,13],[18,7],[23,7],[26,9],[18,15],[4,21],[3,23],[9,23],[16,23],[22,23],[28,23],[31,4],[31,17],[33,7],[33,9],[33,21],[33,23]],
  poles:[[6.5,9.5],[9.5,9.5],[9.5,12.5],[6.5,12.5]],
  falls:[{x:37.5,y:3.2,y0:2.6,y1:3.8}],
  buildings:[
    {bp:'house',at:[1,1],id:'A',opts:{wall:P.wall,roof:P.coral,paper:P.paper,curtain:[236,170,160],rug:[214,140,140],blanket:[[244,160,150],[240,200,120],[140,180,230],[236,150,130]]}},
    {bp:'house',at:[10,1],id:'B',noName:true,opts:{wall:P.wall2,roof:P.teal,paper:P.paper2,curtain:[160,200,190],rug:[140,170,200],blanket:[[160,210,200],[190,170,230],[246,180,200],[120,170,180]]}},
    {bp:'house',at:[6,16],id:'C',noName:true,opts:{wall:[236,224,240],roof:[176,150,206],paper:[246,240,250],curtain:[200,180,230],rug:[190,170,220],blanket:[[200,180,230],[244,196,110],[150,186,222],[176,150,206]]}},
    {bp:'house',at:[13,16],id:'D',noName:true,opts:{wall:[226,236,214],roof:[150,190,140],paper:[240,246,236],curtain:[176,210,170],rug:[160,200,150],blanket:[[176,210,170],[246,180,200],[240,200,120],[150,190,140]]}},
    {bp:'stall',at:[8,3]},{bp:'well',at:[16,3]},{bp:'bench',at:[6,13]},
    {bp:'school',at:[20,1],id:'school'},{bp:'store',at:[20,14],id:'store'},
    {bp:'swing',at:[21,9],id:'swing'},{bp:'slide',at:[24,10],id:'slide'},{bp:'sandbox',at:[21,11],id:'sandbox'},{bp:'bench',at:[23,12]},{bp:'bench',at:[17,23]}],
  spots:{field:[[4,12],[4,13],[4,14],[0,11],[1,11],[2,11],[3,11]]},
  vocab:[
    ['pond','池','There are fish in the pond.','池には魚がいるよ。',[15,12.3,0]],
    ['field','畑','We grow vegetables in the field.','畑で野菜を育てています。',[1.5,13,.2]],
    ['cherry tree','桜の木','The cherry tree is in full bloom.','桜が満開です。',[8,11,1.7]],
    ['tree','木','I take a nap under the tree.','木の下で昼寝をします。',[0,0,1.3],{showLabel:true}],
    ['street lamp','街灯','The street lamp is on at night.','夜は街灯がつきます。',[4,7,.9],{showLabel:true}],
    ['waterfall','滝','The waterfall is very loud.','滝の音がとても大きい。',[37.5,3.2,-1]],
    ['flower bed','花壇','I water the flower bed every day.','毎日花壇に水をやります。',[.5,7,.1]],
    ['plaza','広場','Everyone meets at the plaza.','みんな広場に集まります。',[8,10,0]],
    ['schoolyard','校庭','The kids play in the schoolyard.','子どもたちは校庭で遊びます。',[24,9.5,0]],
    ['road','道','Look both ways before you cross the road.','道をわたる前に左右を見てね。',[19,18,0]],
    ['roof','屋根','There is snow on the roof.','屋根に雪が積もっています。',[12.5,3.5,WALL_H+.65],{exterior:true}],
    ['chimney','煙突','Smoke comes out of the chimney.','煙突から煙が出ています。',[14,3,WALL_H+1.25],{exterior:true}]],
  origin:[8,8],
  // 神の声で建物を置く時の目印
  landmarks:{plaza:[8,11],pond:[15.2,12.3],field:[1.5,13],houseA:[3.5,3.5],houseB:[12.5,3.5],houseC:[8.5,18.5],houseD:[15.5,18.5],well:[16,3],stall:[8,3],bench:[6,13],
    school:[24.5,3.5],schoolyard:[24,11],store:[24.5,17.5],southroad:[14,22],vacant:[34,15],vacantNorth:[34,4],center:[18.5,11],north:[18,1],south:[9,23],east:[34,15],west:[.5,8]},
};

// ---------- terrain ----------
MW=TOWN.size[0];MH=TOWN.size[1];
const LANDMARKS=TOWN.landmarks;
const PONDS=TOWN.ponds;
const inPond=(x,y,m=0)=>PONDS.some(p=>((x-p.x)/(p.rx+m))**2+((y-p.y)/(p.ry+m))**2<1);
const nearestPond=(x,y)=>PONDS.reduce((a,p)=>!a||Math.hypot(p.x-x,p.y-y)<Math.hypot(a.x-x,a.y-y)?p:a,null);
const rectCells=r=>{const out=[];for(let x=r.x;x<r.x+r.w;x++)for(let y=r.y;y<r.y+r.h;y++)if(!(r.except||[]).some(([a,b])=>a===x&&b===y))out.push([x,y]);return out};
const plazaCells=rectCells(TOWN.plaza);
const pathCells=[];{const seen=new Set();for(const[x0,y0,x1,y1]of TOWN.paths){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=x0+Math.sign(x1-x0)*i,y=y0+Math.sign(y1-y0)*i,k=key(x,y);if(!seen.has(k)&&!inPond(x,y,.15)){seen.add(k);pathCells.push([x,y])}}}}
const fieldCells=TOWN.fields.flatMap(rectCells);
const bedCells=TOWN.flowerbeds;
const pathSet=new Set(pathCells.map(([x,y])=>key(x,y))),plazaSet=new Set(plazaCells.map(([x,y])=>key(x,y))),fieldSet=new Set(fieldCells.map(([x,y])=>key(x,y))),bedSet=new Set(bedCells.map(([x,y])=>key(x,y)));
const TREES=TOWN.trees,LANTERNS=TOWN.lanterns;
const blocked=new Set(),occupied=new Set(),sakuraSet=new Set(TOWN.sakura.map(([x,y])=>key(x,y)));
const block=(x,y)=>blocked.add(key(x,y));
TREES.forEach(([x,y])=>block(x,y));LANTERNS.forEach(([x,y])=>block(x,y));TOWN.sakura.forEach(([x,y])=>block(x,y));
fieldCells.forEach(([x,y])=>block(x,y));bedCells.forEach(([x,y])=>block(x,y));
for(let x=0;x<MW;x++)for(let y=0;y<MH;y++)if(inPond(x,y,.1))block(x,y);
TOWN.island.forEach(b=>box(b.lo,b.hi,b));

// ---------- buildings, tiles, spots ----------
TOWN.buildings.forEach((b,i)=>{const spec=BLUEPRINTS[b.bp](b.opts||{});const bld=buildBuilding(spec,{x:b.at[0],y:b.at[1]},{id:b.id||b.bp+i,fixed:true,noName:b.noName});bld.cells.forEach(([x,y])=>occupied.add(key(x,y)))});
TOWN.vocab.forEach(v=>vocab(...v));
for(let x=0;x<MW;x++)for(let y=0;y<MH;y++){const k=key(x,y);if(!blocked.has(k)&&!occupied.has(k))ground.push(tile(x,y,0,{tag:'ground'}))}
tiles.forEach(linkTile);
const nbrTiles=cells=>{const out=new Set();cells.forEach(([x,y])=>DIRS.forEach(([dx,dy])=>{const t=T(x+dx,y+dy);if(t&&t.tag==='ground')out.add(t)}));return[...out]};
TOWN.spots.field.forEach(([x,y])=>addSpot('field',T(x,y)));
ground.filter(t=>DIRS.some(([dx,dy])=>inPond(t.pos[0]+dx,t.pos[1]+dy,.1))).forEach(t=>addSpot('fish',t));
nbrTiles(TREES.map(([x,y])=>[x,y])).forEach(t=>addSpot('nap',t));
nbrTiles(bedCells).forEach(t=>addSpot('flower',t));
plazaCells.forEach(([x,y])=>{const t=T(x,y);addSpot('plaza',t);addSpot('dance',t)});
buildings.forEach(refreshExtSpots);
// 町の入口（建物を置く時に、ここから歩いて行けるかを確かめる）
const townOrigin=()=>T(...(TOWN.origin||homes()[0]&&homes()[0].door[1]||pathCells[0]))||ground[0];

// ---------- props (billboards in the iso view) ----------
const props=[];
TREES.forEach(([x,y,r])=>props.push({kind:'tree',local:[x,y,0],r}));
TOWN.sakura.forEach(([x,y,r])=>props.push({kind:'sakura',local:[x,y,0],r}));
LANTERNS.forEach(([x,y])=>props.push({kind:'lantern',local:[x,y,0]}));
TOWN.falls.forEach(f=>props.push({kind:'falls',local:[f.x,f.y,0],y0:f.y0,y1:f.y1}));
fieldCells.forEach(([x,y])=>props.push({kind:'crop',local:[x,y,0],type:(x+y)%2}));
TOWN.poles.forEach(([x,y])=>props.push({kind:'pole',local:[x,y,0]}));
props.forEach((t,i)=>{const big=t.kind==='tree'||t.kind==='sakura',e=big?.25:.08;const top=big?1.9*t.r:t.kind==='pole'?1.7:.8;
  t.lo=[t.local[0]-e,t.local[1]-e,t.local[2]];t.hi=[t.local[0]+e,t.local[1]+e,t.local[2]+top];
  if(t.kind==='falls'){t.lo=[t.local[0],t.y0,-5];t.hi=[t.local[0]+.12,t.y1,0]}t.id=1000+i});
