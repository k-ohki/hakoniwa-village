// ================= world =================
const boxes=[], tiles=[], tileAt=new Map(), VOCAB=[];
const key=(x,y)=>x+','+y;
const MW=18, MH=16, WALL_H=1.6, FLOOR=.12;
function box(lo,hi,o={}){const b={...o,lo,hi,id:boxes.length,kind:'box'};b.top=o.top||o.side||P.wall;b.side=o.side||P.wall;b.deco=o.deco||{};boxes.push(b);return b}
function tile(x,y,z,o={}){const t={...o,pos:[x,y,z],id:tiles.length,links:[]};tiles.push(t);tileAt.set(key(x,y),t);return t}
const T=(x,y)=>tileAt.get(key(x,y));
function vocab(word,ja,ex,exja,pos,o={}){VOCAB.push({word,ja,ex,exja,pos,...o})}

const POND={x:15.2,y:12.3,rx:2.25,ry:1.7};
const inPond=(x,y,m=0)=>((x-POND.x)/(POND.rx+m))**2+((y-POND.y)/(POND.ry+m))**2<1;
const plazaCells=[];for(let x=7;x<=9;x++)for(let y=10;y<=12;y++)if(!(x===8&&y===11))plazaCells.push([x,y]);
let pathCells=[];for(let x=0;x<MW;x++)pathCells.push([x,8]);[2,11].forEach(x=>pathCells.push([x,7]));for(let y=9;y<MH;y++){pathCells.push([5,y]);pathCells.push([12,y])}
pathCells=pathCells.filter(([x,y])=>!inPond(x,y,.15));
const fieldCells=[];for(let x=0;x<=3;x++)for(let y=12;y<=14;y++)fieldCells.push([x,y]);
const bedCells=[[0,7],[1,7],[14,7],[15,7],[8,6],[8,7]];
const pathSet=new Set(pathCells.map(([x,y])=>key(x,y))), plazaSet=new Set(plazaCells.map(([x,y])=>key(x,y))), fieldSet=new Set(fieldCells.map(([x,y])=>key(x,y))), bedSet=new Set(bedCells.map(([x,y])=>key(x,y)));
const TREES=[[0,0,.85],[8,0,.7],[17,0,.78],[17,6,.7],[0,10,.62],[7,15,.62],[10,14,.6],[15,15,.6],[17,9,.55]];
const LANTERNS=[[4,7],[6,9],[9,7],[13,7],[10,10],[10,13]];
const blocked=new Set(), houseCells=new Set();
const block=(x,y)=>blocked.add(key(x,y));
TREES.forEach(([x,y])=>block(x,y));LANTERNS.forEach(([x,y])=>block(x,y));
[[8,3],[16,3],[6,13],[8,11]].forEach(([x,y])=>block(x,y));
fieldCells.forEach(([x,y])=>block(x,y));bedCells.forEach(([x,y])=>block(x,y));
for(let x=0;x<MW;x++)for(let y=0;y<MH;y++)if(inPond(x,y,.1))block(x,y);

// island
box([-.5,-.5,-1],[MW-.5,MH-.5,0],{top:P.grass,side:P.rock,deco:{top:'ground',px:'strata',py:'strata',nx:'strata',ny:'strata'}});
box([.3,.3,-2],[16.7,14.7,-1],{side:P.rock,deco:{px:'strata',py:'strata',nx:'strata',ny:'strata'}});
box([2,1.8,-3],[14.5,13.5,-2],{side:P.rockDark,deco:{px:'strata',py:'strata',nx:'strata',ny:'strata'}});
box([5,4.5,-3.8],[11.5,10,-3],{side:P.rockDark,deco:{px:'strata',py:'strata'}});
box([7,6,-4.4],[9.5,8.5,-3.8],{side:P.rockDark});

// ---------- houses (cutaway dollhouses) ----------
const ROOMS={bed:J('寝室','bedroom'),bath:J('お風呂・トイレ','bathroom'),kitchen:J('キッチン','kitchen'),living:J('リビング','living room')};
const roomOf=(c,r)=>r<=1?(c<=2?'bed':'bath'):(c<=2?'living':'kitchen');
const houses={};
function buildHouse(id,x0,y0,wallC,roofC,paperC,blanket){
  const X=c=>x0+c, Y=r=>y0+r;
  const h={id,x0,y0,blockedEdges:new Set(),spots:{},lights:false,glow:0,mealReady:0,mealName:null,dirty:false,cooking:null,tvOn:false,paper:paperC,
    stoveP:[X(4),Y(2)-.05,.66],tvP:[X(0)-.2,Y(3),.66],chimney:[X(4),Y(2),WALL_H+1.25],residents:[]};
  houses[id]=h;
  for(let c=0;c<6;c++)for(let r=0;r<6;r++)houseCells.add(key(X(c),Y(r)));
  const H=WALL_H, I={indoor:true,house:h};
  box([x0-.5,y0-.5,0],[x0+5.5,y0+5.5,FLOOR],{...I,top:P.floorW,side:mix(wallC,[150,120,110],.3),deco:{top:'floor'}});
  const opp={px:'nx',nx:'px',py:'ny',ny:'py'};
  const wall=(lo,hi,n,wins,extra={})=>{const outer=n[0]>0?'px':n[0]<0?'nx':n[1]>0?'py':'ny';
    return box(lo,hi,{side:wallC,top:P.wallTrim,house:h,cutN:n,wall:{wins,outer,inner:opp[outer]},deco:{[outer]:'wallOut',[opp[outer]]:'wallIn'},...extra})};
  wall([x0-.5,y0-.5,FLOOR],[x0-.38,y0+5.5,H],[-1,0,0],[Y(1),Y(4.5)]);
  wall([x0+5.38,y0-.5,FLOOR],[x0+5.5,y0+5.5,H],[1,0,0],[Y(3),Y(5)]);
  wall([x0-.38,y0-.5,FLOOR],[x0+5.38,y0-.38,H],[0,-1,0],[X(1),X(4)]);
  wall([x0-.38,y0+5.38,FLOOR],[x0+.55,y0+5.5,H],[0,1,0],[]);
  wall([x0+.55,y0+5.38,1.3],[x0+1.45,y0+5.5,H],[0,1,0],[]);
  wall([x0+1.45,y0+5.38,FLOOR],[x0+5.38,y0+5.5,H],[0,1,0],[X(3),X(4.6)]);
  box([x0+.58,y0+5.41,FLOOR],[x0+1.42,y0+5.47,1.3],{side:mix(P.coral,[120,70,90],.3),house:h,exteriorOnly:true,deco:{py:'doorleaf'}});
  const part=(lo,hi)=>box(lo,[hi[0],hi[1],.6],{...I,side:paperC,top:P.wallTrim});
  part([x0-.38,y0+1.44,FLOOR],[x0+.5,y0+1.56]);part([x0+1.5,y0+1.44,FLOOR],[x0+5.38,y0+1.56]);
  part([x0+2.44,y0-.38,FLOOR],[x0+2.56,y0+.5]);part([x0+2.44,y0+1.56,FLOOR],[x0+2.56,y0+3.5]);
  const be=(a,b)=>{h.blockedEdges.add(key(...a)+'|'+key(...b));h.blockedEdges.add(key(...b)+'|'+key(...a))};
  [0,2,3,4,5].forEach(c=>be([X(c),Y(1)],[X(c),Y(2)]));
  be([X(2),Y(0)],[X(3),Y(0)]);be([X(2),Y(2)],[X(3),Y(2)]);be([X(2),Y(3)],[X(3),Y(3)]);
  h.door=[[X(1),Y(5)],[X(1),Y(6)]];
  const solid=new Set(), use=new Map(), F={...I};
  const seat=(c,r,z,type,face,extra={})=>use.set(key(X(c),Y(r)),{z,furn:{type,face,...extra}});
  // bedroom
  for(let c=0;c<3;c++){const cx=X(c),cy=Y(0);
    box([cx-.36,cy-.36,FLOOR],[cx+.36,cy-.28,.72],{...F,side:P.wood,top:P.woodL});
    box([cx-.36,cy-.28,FLOOR],[cx+.36,cy+.45,.34],{...F,side:P.woodL,top:P.white,deco:{top:'bedTop'},blanket:blanket[c]});
    seat(c,0,.34,'bed',[0,1],{head:[cx,cy-.12,.34],foot:[cx,cy+.42,.34],lo:[cx-.36,cy-.28],hi:[cx+.36,cy+.45]});
    if(c===1)vocab('bed','ベッド','I go to bed at ten.','10時に寝ます。',[cx,cy+.1,.4],{house:h})}
  // bathroom
  {const cx=X(3),cy=Y(0);box([cx-.2,cy-.36,FLOOR],[cx+.2,cy-.18,.72],{...F,side:P.porcelain,top:P.porcelain});box([cx-.17,cy-.18,FLOOR],[cx+.17,cy+.22,.4],{...F,side:P.porcelain,top:P.porcelain,deco:{top:'toiletTop'}});
    seat(3,0,.4,'seat',[0,1]);vocab('toilet','トイレ（便器）','Don\'t forget to flush the toilet.','トイレを流すのを忘れないでね。',[cx,cy,.6],{house:h})}
  {const cx=X(4),cy=Y(0);box([cx-.3,cy-.36,FLOOR],[cx+.3,cy+.1,.72],{...F,side:P.woodL,top:P.porcelain,deco:{top:'basinTop',py:'cabinet'}});
    box([cx-.22,cy-.38,.95],[cx+.22,cy-.35,1.4],{...F,side:P.steel,top:P.steel,deco:{py:'mirror'},cutWith:[0,-1,0]});
    solid.add(key(cx,cy));vocab('washbasin','洗面台','I wash my face at the washbasin.','洗面台で顔を洗います。',[cx,cy,.8],{house:h});
    vocab('mirror','鏡','I look in the mirror every morning.','毎朝、鏡を見ます。',[cx,cy-.3,1.25],{house:h,mirror:true})}
  {const cx=X(5),cy=Y(0);box([cx-.38,cy-.36,FLOOR],[cx+.36,cy+.42,.5],{...F,side:P.porcelain,top:P.porcelain,deco:{top:'tubTop'}});
    seat(5,0,.5,'tub',[0,1],{lo:[cx-.38,cy-.36],hi:[cx+.36,cy+.42]});vocab('bathtub','浴槽（バスタブ）','The bathtub is full of hot water.','お風呂にお湯がいっぱい。',[cx,cy,.55],{house:h})}
  // kitchen
  {const cx=X(3),cy=Y(2);box([cx-.42,cy-.42,FLOOR],[cx+.46,cy+.3,.66],{...F,side:P.woodL,top:P.steel,deco:{top:'sinkTop',py:'cabinet'}});solid.add(key(cx,cy));
    vocab('sink','流し台（シンク）','Put the dirty dishes in the sink.','汚れたお皿は流しに入れてね。',[cx,cy,.7],{house:h})}
  {const cx=X(4),cy=Y(2);box([cx-.46,cy-.42,FLOOR],[cx+.46,cy+.3,.66],{...F,side:P.woodL,top:P.dark,deco:{top:'stoveTop',py:'oven'}});solid.add(key(cx,cy));
    vocab('stove','コンロ','Be careful. The stove is hot!','気をつけて、コンロが熱いよ！',[cx,cy,.7],{house:h})}
  {const cx=X(5),cy=Y(2);box([cx-.38,cy-.42,FLOOR],[cx+.36,cy+.3,1.45],{...F,side:P.white,top:P.white,deco:{py:'fridge'}});solid.add(key(cx,cy));
    vocab('fridge','冷蔵庫','There is some milk in the fridge.','冷蔵庫に牛乳があるよ。',[cx,cy,1.45],{house:h})}
  {const cx=X(4),cy=Y(5);box([cx-.42,cy-.42,.5],[cx+.42,cy+.34,.58],{...F,side:P.wood,top:P.woodL,deco:{top:'tableTop'}});box([cx-.07,cy-.07,FLOOR],[cx+.07,cy+.07,.5],{...F,side:P.wood});solid.add(key(cx,cy));
    vocab('table','テーブル（食卓）','Dinner is on the table.','夕ごはんがテーブルに並んでいるよ。',[cx,cy,.6],{house:h})}
  const chair=(c,r,face)=>{const cx=X(c),cy=Y(r);box([cx-.2,cy-.2,FLOOR],[cx+.2,cy+.2,.34],{...F,side:P.wood,top:P.coral});
    const bx=-face[0],by=-face[1];
    const blo=[bx?cx+bx*.2-(bx>0?0:.06):cx-.2,by?cy+by*.2-(by>0?0:.06):cy-.2],bhi=[bx?blo[0]+.06:cx+.2,by?blo[1]+.06:cy+.2];
    box([blo[0],blo[1],FLOOR],[bhi[0],bhi[1],.74],{...F,side:P.wood,top:P.woodL});seat(c,r,.34,'seat',face)};
  chair(3,5,[1,0]);chair(5,5,[-1,0]);chair(4,4,[0,1]);
  vocab('chair','いす','Please sit down on the chair.','どうぞいすに座ってください。',[X(3),Y(5),.5],{house:h});
  // living room
  {const cx=X(0),cy=Y(3);box([cx-.36,cy-.42,FLOOR],[cx+.05,cy+.42,.4],{...F,side:P.wood,top:P.woodL});box([cx-.3,cy-.38,.4],[cx-.22,cy+.38,.92],{...F,side:P.dark,top:P.dark,deco:{px:'screen'}});solid.add(key(cx,cy));
    vocab('TV','テレビ','Can you turn on the TV?','テレビをつけてくれる？',[cx-.2,cy,.98],{house:h})}
  for(const r of[2,3]){const cx=X(2),cy=Y(r);box([cx-.38,cy-.44,FLOOR],[cx+.28,cy+.44,.34],{...F,side:blanket[3],top:mix(blanket[3],[255,255,255],.25),deco:{top:'cushion'}});box([cx+.28,cy-.44,FLOOR],[cx+.4,cy+.44,.66],{...F,side:blanket[3],top:mix(blanket[3],[255,255,255],.2)});seat(2,r,.34,'seat',[-1,0])}
  vocab('sofa','ソファ','Let\'s sit on the sofa and relax.','ソファに座ってくつろごう。',[X(2),Y(2.5),.55],{house:h});
  // roof (exterior view only)
  box([x0-.65,y0-.65,H],[x0+5.65,y0+5.65,H+.28],{side:roofC,top:roofC,house:h,exteriorOnly:true,deco:{top:'roof',px:'dentils',py:'dentils',nx:'dentils',ny:'dentils'}});
  box([x0+.2,y0+.2,H+.28],[x0+4.8,y0+4.8,H+.6],{side:roofC,top:mix(roofC,[255,255,255],.18),house:h,exteriorOnly:true,deco:{top:'roof'}});
  box([X(4)-.25,Y(2)-.25,H+.6],[X(4)+.25,Y(2)+.25,H+1.2],{side:P.brick,top:P.brick,house:h,exteriorOnly:true,deco:{top:'flue'}});
  // tiles
  for(let c=0;c<6;c++)for(let r=0;r<6;r++){const k=key(X(c),Y(r));if(solid.has(k))continue;const u=use.get(k);
    if(u)tile(X(c),Y(r),u.z,{indoor:true,house:h,stop:true,furn:u.furn,room:roomOf(c,r)});else tile(X(c),Y(r),FLOOR,{indoor:true,house:h,room:roomOf(c,r)})}
  const S_=(c,r)=>T(X(c),Y(r));
  h.spots={beds:[S_(0,0),S_(1,0),S_(2,0)],toilet:[S_(3,0)],tub:[S_(5,0)],basin:[S_(4,1)],sink:[S_(3,3)],stove:[S_(4,3)],fridge:[S_(5,3)],chairs:[S_(3,5),S_(5,5),S_(4,4)],sofa:[S_(2,2),S_(2,3)],
    floor:tiles.filter(t=>t.house===h&&!t.stop)};
  h.roomCenters={bed:[X(1),Y(.85),FLOOR],bath:[X(4),Y(1),FLOOR],kitchen:[X(4),Y(3.4),FLOOR],living:[X(1),Y(4.6),FLOOR]};
  h.cell=(c,r)=>T(X(c),Y(r));
  return h;
}
buildHouse('A',1,1,P.wall,P.coral,P.paper,[[244,160,150],[240,200,120],[140,180,230],[236,150,130]]);
buildHouse('B',10,1,P.wall2,P.teal,P.paper2,[[160,210,200],[190,170,230],[246,180,200],[120,170,180]]);

// stall, well, bench
box([7.55,2.6,0],[8.45,3.4,.62],{side:P.wood,top:[226,190,150],deco:{py:'stallfront'}});
box([7.58,2.6,.62],[7.66,2.68,1.42],{side:P.wood});box([8.34,2.6,.62],[8.42,2.68,1.42],{side:P.wood});
box([7.45,2.5,1.42],[8.55,3.55,1.52],{side:P.coral,top:P.cream,deco:{top:'awning',py:'awningEdge',px:'awningEdge'}});
box([15.62,2.62,0],[16.38,3.38,.55],{side:P.stone,top:P.stone,deco:{top:'wellwater'}});
box([15.66,2.95,.55],[15.76,3.05,1.18],{side:P.wood});box([16.24,2.95,.55],[16.34,3.05,1.18],{side:P.wood});
box([15.52,2.6,1.18],[16.48,3.4,1.28],{side:P.coral,top:P.coral});
box([5.62,12.82,0],[5.72,13.12,.3],{side:P.wood});box([6.28,12.82,0],[6.38,13.12,.3],{side:P.wood});
box([5.56,12.8,.3],[6.44,13.18,.37],{side:P.wood,top:[214,170,138]});box([5.56,12.74,.37],[6.44,12.8,.72],{side:P.wood});

vocab('well','井戸','We get water from the well.','井戸から水をくみます。',[16,3,1.35]);
vocab('pond','池','There are fish in the pond.','池には魚がいるよ。',[15,12.3,0]);
vocab('field','畑','We grow vegetables in the field.','畑で野菜を育てています。',[1.5,13,.2]);
vocab('stall','屋台','The stall sells fresh fruit.','屋台では新鮮な果物を売っています。',[8,3,1.6]);
vocab('bench','ベンチ','Let\'s sit on the bench.','ベンチに座ろう。',[6,13,.5]);
vocab('cherry tree','桜の木','The cherry tree is in full bloom.','桜が満開です。',[8,11,1.7]);
vocab('tree','木','I take a nap under the tree.','木の下で昼寝をします。',[0,0,1.3],{showLabel:true});
vocab('street lamp','街灯','The street lamp is on at night.','夜は街灯がつきます。',[4,7,.9],{showLabel:true});
vocab('waterfall','滝','The waterfall is very loud.','滝の音がとても大きい。',[17.5,12.3,-1]);
vocab('flower bed','花壇','I water the flower bed every day.','毎日花壇に水をやります。',[.5,7,.1]);
vocab('plaza','広場','Everyone meets at the plaza.','みんな広場に集まります。',[8,10,0]);
vocab('house','家','This is my house.','これがわたしの家です。',[3.5,3.5,WALL_H+.65],{exterior:true});
vocab('roof','屋根','There is snow on the roof.','屋根に雪が積もっています。',[12.5,3.5,WALL_H+.65],{exterior:true});
vocab('chimney','煙突','Smoke comes out of the chimney.','煙突から煙が出ています。',[14,3,WALL_H+1.25],{exterior:true});

// outdoor tiles + links
for(let x=0;x<MW;x++)for(let y=0;y<MH;y++){const k=key(x,y);if(!blocked.has(k)&&!houseCells.has(k))tile(x,y,0,{tag:'ground'})}
const edgeOK=(a,b)=>{
  if(a.house||b.house){
    const ka=key(a.pos[0],a.pos[1]),kb=key(b.pos[0],b.pos[1]);
    if(a.house&&b.house&&a.house===b.house)return!a.house.blockedEdges.has(ka+'|'+kb);
    const h=a.house||b.house,k1=key(...h.door[0]),k2=key(...h.door[1]);
    return(ka===k1&&kb===k2)||(ka===k2&&kb===k1);
  }return true};
for(const t of tiles)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const o=T(t.pos[0]+dx,t.pos[1]+dy);if(!o)continue;const dz=o.pos[2]-t.pos[2];if(Math.abs(dz)>.55)continue;if(!edgeOK(t,o))continue;if(t.stop&&o.stop)continue;t.links.push({to:o,dir:[dx,dy],dz})}
const ground=tiles.filter(t=>t.tag==='ground');
const nbrTiles=(cells)=>{const out=new Set();cells.forEach(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const t=T(x+dx,y+dy);if(t&&t.tag==='ground')out.add(t)}));return[...out]};
const SPOTS={
  field:[T(4,12),T(4,13),T(4,14),T(0,11),T(1,11),T(2,11),T(3,11)].filter(Boolean),
  fish:ground.filter(t=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>inPond(t.pos[0]+dx,t.pos[1]+dy,.1))),
  well:[T(16,4),T(17,3),T(16,2)].filter(Boolean),
  nap:nbrTiles(TREES.map(([x,y])=>[x,y])),
  flower:nbrTiles(bedCells),
  bench:[T(5,13),T(7,13),T(6,12)].filter(Boolean),
  stall:[T(8,4),T(7,3),T(9,3)].filter(Boolean),
  keeper:[T(8,2)].filter(Boolean),
  plaza:plazaCells.map(([x,y])=>T(x,y)).filter(Boolean)};

// props
const props=[];
TREES.forEach(([x,y,r])=>props.push({kind:'tree',local:[x,y,0],r}));
props.push({kind:'sakura',local:[8,11,0],r:1.05});
LANTERNS.forEach(([x,y])=>props.push({kind:'lantern',local:[x,y,0]}));
props.push({kind:'falls',local:[17.5,12.3,0]});
fieldCells.forEach(([x,y])=>props.push({kind:'crop',local:[x,y,0],type:(x+y)%2}));
[[6.5,9.5],[9.5,9.5],[9.5,12.5],[6.5,12.5]].forEach(([x,y])=>props.push({kind:'pole',local:[x,y,0]}));
props.forEach((t,i)=>{const big=t.kind==='tree'||t.kind==='sakura',e=big?.25:.08;const top=big?1.9*t.r:t.kind==='pole'?1.7:.8;
  t.lo=[t.local[0]-e,t.local[1]-e,t.local[2]];t.hi=[t.local[0]+e,t.local[1]+e,t.local[2]+top];
  if(t.kind==='falls'){t.lo=[17.5,11.6,-5];t.hi=[17.62,13,0]}t.id=1000+i});

