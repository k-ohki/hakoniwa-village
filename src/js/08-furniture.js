// ================= furniture catalog =================
// 家具は1マスに置く。座標は「マスの中心から見たローカル座標」で、正面（使う人が向く側）を +y として書く。
// 置くときに face（px/py/nx/ny）に合わせて回転する。z は床からではなく、その階の基準からの高さ（1階と同じ数値）。
// c.spot(行動ID, 'self'|'front') でその行動ができる場所を登録する。'self' は家具の上（座る・寝る）、'front' は正面の床。
const FACE_VEC={px:[1,0],py:[0,1],nx:[-1,0],ny:[0,-1]};
const FACE_KEYS=['px','py','nx','ny'];
const rotXY=(face,lx,ly)=>face==='px'?[ly,-lx]:face==='nx'?[-ly,lx]:face==='ny'?[-lx,-ly]:[lx,ly];
function rotKey(face,k){const v=FACE_VEC[k];if(!v)return k;const r=rotXY(face,v[0],v[1]);return FACE_KEYS.find(n=>FACE_VEC[n][0]===r[0]&&FACE_VEC[n][1]===r[1])}
const lighten=(c,k)=>mix(c,[255,255,255],k);
const FURN={
  bed:{ja:'ベッド',build(c){const bl=c.color([244,160,150]);
    c.B([-.36,-.36,FLOOR],[.36,-.28,.72],{side:P.wood,top:P.woodL});
    c.B([-.36,-.28,FLOOR],[.36,.45,.34],{side:P.woodL,top:P.white,deco:{top:'bedTop'},blanket:bl});
    c.seat(.34,'bed',{head:[0,-.12,.34],foot:[0,.42,.34],lo:[-.36,-.28],hi:[.36,.45]});c.spot('sleep','self');
    c.vocab('bed','ベッド','I go to bed at ten.','10時に寝ます。',[0,.1,.4])}},
  toilet:{ja:'トイレ',build(c){
    c.B([-.2,-.36,FLOOR],[.2,-.18,.72],{side:P.porcelain,top:P.porcelain});c.B([-.17,-.18,FLOOR],[.17,.22,.4],{side:P.porcelain,top:P.porcelain,deco:{top:'toiletTop'}});
    c.seat(.4,'seat');c.spot('toilet','self');c.vocab('toilet','トイレ（便器）','Don\'t forget to flush the toilet.','トイレを流すのを忘れないでね。',[0,0,.6])}},
  basin:{ja:'洗面台',build(c){
    c.B([-.3,-.36,FLOOR],[.3,.1,.72],{side:P.woodL,top:P.porcelain,deco:{top:'basinTop',py:'cabinet'}});
    c.B([-.22,-.38,.95],[.22,-.35,1.4],{side:P.steel,top:P.steel,deco:{py:'mirror'},cutWith:[0,-1,0]});
    c.solid();c.spot('brush','front');c.spot('wash','front');
    c.vocab('washbasin','洗面台','I wash my face at the washbasin.','洗面台で顔を洗います。',[0,0,.8]);
    c.vocab('mirror','鏡','I look in the mirror every morning.','毎朝、鏡を見ます。',[0,-.3,1.25],{mirror:c.dir(0,-1)})}},
  tub:{ja:'浴槽',build(c){
    c.B([-.38,-.36,FLOOR],[.36,.42,.5],{side:P.porcelain,top:P.porcelain,deco:{top:'tubTop'}});
    c.seat(.5,'tub',{lo:[-.38,-.36],hi:[.36,.42]});c.spot('bath','self');
    c.vocab('bathtub','浴槽（バスタブ）','The bathtub is full of hot water.','お風呂にお湯がいっぱい。',[0,0,.55])}},
  sink:{ja:'流し台',build(c){
    c.B([-.42,-.42,FLOOR],[.46,.3,.66],{side:P.woodL,top:P.steel,deco:{top:'sinkTop',py:'cabinet'}});c.solid();c.spot('dishes','front');
    c.vocab('sink','流し台（シンク）','Put the dirty dishes in the sink.','汚れたお皿は流しに入れてね。',[0,0,.7])}},
  stove:{ja:'コンロ',build(c){
    c.B([-.46,-.42,FLOOR],[.46,.3,.66],{side:P.woodL,top:P.dark,deco:{top:'stoveTop',py:'oven'}});c.solid();c.spot('cook','front');
    c.mark('stoveP',[0,-.05,.66]);c.vocab('stove','コンロ','Be careful. The stove is hot!','気をつけて、コンロが熱いよ！',[0,0,.7])}},
  fridge:{ja:'冷蔵庫',build(c){
    c.B([-.38,-.42,FLOOR],[.36,.3,1.45],{side:P.white,top:P.white,deco:{py:'fridge'}});c.solid();c.spot('snack','front');
    c.vocab('fridge','冷蔵庫','There is some milk in the fridge.','冷蔵庫に牛乳があるよ。',[0,0,1.45])}},
  table:{ja:'テーブル',build(c){
    c.B([-.42,-.42,.5],[.42,.34,.58],{side:P.wood,top:P.woodL,deco:{top:'tableTop'}});c.B([-.07,-.07,FLOOR],[.07,.07,.5],{side:P.wood});c.solid();
    c.vocab('table','テーブル（食卓）','Dinner is on the table.','夕ごはんがテーブルに並んでいるよ。',[0,0,.6])}},
  chair:{ja:'いす',build(c){
    c.B([-.2,-.2,FLOOR],[.2,.2,.34],{side:P.wood,top:c.color(P.coral)});c.B([-.2,-.26,FLOOR],[.2,-.2,.74],{side:P.wood,top:P.woodL});
    c.seat(.34,'seat');c.spot('eat','self');c.vocab('chair','いす','Please sit down on the chair.','どうぞいすに座ってください。',[0,0,.5])}},
  tv:{ja:'テレビ',build(c){
    c.B([-.42,-.36,FLOOR],[.42,.05,.4],{side:P.wood,top:P.woodL});c.B([-.38,-.3,.4],[.38,-.22,.92],{side:P.dark,top:P.dark,deco:{py:'screen'}});c.solid();
    c.mark('tvP',[0,-.2,.66]);c.vocab('TV','テレビ','Can you turn on the TV?','テレビをつけてくれる？',[0,-.2,.98])}},
  sofa:{ja:'ソファ',build(c){const k=c.color([236,150,130]);
    c.B([-.44,-.28,FLOOR],[.44,.38,.34],{side:k,top:lighten(k,.25),deco:{top:'cushion'}});c.B([-.44,-.4,FLOOR],[.44,-.28,.66],{side:k,top:lighten(k,.2)});
    c.seat(.34,'seat');c.spot('tv','self');c.spot('rest','self');c.vocab('sofa','ソファ','Let\'s sit on the sofa and relax.','ソファに座ってくつろごう。',[0,0,.55])}},
  // ---- 学校・お店・公共の建物向け ----
  desk:{ja:'机といす',build(c){const k=c.color(P.woodL);
    // 座る人は正面（+y）の机に向かう
    c.B([-.36,.06,.52],[.36,.42,.58],{side:P.wood,top:k});c.B([-.3,.12,FLOOR],[-.24,.36,.52],{side:P.steel});c.B([.24,.12,FLOOR],[.3,.36,.52],{side:P.steel});
    c.B([-.18,-.32,FLOOR],[.18,-.02,.32],{side:P.wood,top:P.coral});c.B([-.18,-.38,FLOOR],[.18,-.32,.7],{side:P.wood,top:P.woodL});
    c.seat(.32,'seat');c.vocab('desk','机','I study at my desk.','机で勉強します。',[0,.24,.62])}},
  teacherdesk:{ja:'先生の机',build(c){const k=c.color(P.wood);
    c.B([-.44,-.3,FLOOR],[.44,.3,.66],{side:k,top:P.woodL,deco:{py:'cabinet'}});c.B([-.3,-.18,.66],[-.06,.08,.72],{side:P.white,top:P.white});c.solid();
    c.vocab('teacher\'s desk','教卓','The teacher is at the desk.','先生は教卓にいます。',[0,0,.75])}},
  blackboard:{ja:'黒板',build(c){const k=c.color([70,110,96]);
    c.B([-.48,-.37,.45],[.48,-.31,1.35],{side:P.wood,top:P.wood,deco:{py:'board'},boardC:k,cutWith:[0,-1,0]});
    c.vocab('blackboard','黒板','Look at the blackboard, please.','黒板を見てください。',[0,-.44,1.45])}},
  shelf:{ja:'本だな',build(c){const k=c.color(P.wood);
    c.B([-.44,-.42,FLOOR],[.44,-.06,1.3],{side:k,top:lighten(k,.2),deco:{py:'books'}});c.solid();
    c.vocab('bookshelf','本だな','The bookshelf is full of books.','本だなは本でいっぱい。',[0,-.2,1.35])}},
  counter:{ja:'カウンター',build(c){const k=c.color(P.woodL);
    c.B([-.48,-.3,FLOOR],[.48,.26,.7],{side:k,top:lighten(k,.3),deco:{py:'planksDeco'}});c.solid();
    c.vocab('counter','カウンター','Please pay at the counter.','お会計はカウンターでどうぞ。',[0,0,.8])}},
  register:{ja:'レジ',build(c){const k=c.color(P.woodL);
    c.B([-.48,-.3,FLOOR],[.48,.26,.7],{side:k,top:lighten(k,.3)});c.B([-.2,-.12,.7],[.2,.12,.92],{side:P.dark,top:P.steel,deco:{py:'keys'}});c.solid();
    c.vocab('cash register','レジ','The cash register is by the door.','レジは入口のそばにあります。',[0,0,1])}},
  display:{ja:'商品だな',build(c){const k=c.color(P.white);
    c.B([-.46,-.4,FLOOR],[.46,.04,1.05],{side:k,top:lighten(k,.2),deco:{py:'goods'}});c.solid();
    c.vocab('shelf','たな','The shelf is full of goods.','たなに商品が並んでいます。',[0,-.18,1.1])}},
  rack:{ja:'洋服かけ',build(c){const k=c.color([236,150,180]);
    c.B([-.42,-.06,FLOOR],[-.36,.06,1.2],{side:P.steel});c.B([.36,-.06,FLOOR],[.42,.06,1.2],{side:P.steel});c.B([-.42,-.04,1.14],[.42,.04,1.2],{side:P.steel});
    c.B([-.34,-.12,.45],[.34,.12,1.1],{side:k,top:lighten(k,.2),deco:{py:'clothes',ny:'clothes'}});c.solid();
    c.vocab('clothes','洋服','These clothes are on sale.','この服はセール中です。',[0,0,1.2])}},
  bench:{ja:'ベンチ',build(c){const k=c.color(P.wood);
    c.B([-.44,-.2,FLOOR],[.44,.2,.34],{side:k,top:lighten(k,.25)});c.seat(.34,'seat');
    c.vocab('bench','ベンチ','Let\'s sit on the bench.','ベンチに座ろう。',[0,0,.45])}},
  plant:{ja:'観葉植物',build(c){
    c.B([-.16,-.16,FLOOR],[.16,.16,.36],{side:P.brick,top:P.soil});c.B([-.26,-.26,.36],[.26,.26,.9],{side:c.color([140,199,149]),top:[169,220,168]});c.solid();
    c.vocab('plant','観葉植物','Water the plant once a week.','植物には週に一度水をやります。',[0,0,.95])}},
  piano:{ja:'ピアノ',build(c){const k=c.color(P.dark);
    c.B([-.46,-.42,FLOOR],[.46,.02,1.05],{side:k,top:lighten(k,.15)});c.B([-.46,.02,.62],[.46,.22,.7],{side:k,top:P.white,deco:{top:'keys'}});c.solid();
    c.vocab('piano','ピアノ','She plays the piano every day.','彼女は毎日ピアノを弾きます。',[0,0,1.1])}},
  locker:{ja:'ロッカー',build(c){const k=c.color([150,186,222]);
    c.B([-.46,-.42,FLOOR],[.46,-.02,1.35],{side:k,top:lighten(k,.2),deco:{py:'lockers'}});c.solid();
    c.vocab('locker','ロッカー','Put your bag in the locker.','かばんはロッカーに入れてね。',[0,-.2,1.4])}},
  cabinet:{ja:'たな',build(c){const k=c.color(P.woodL);
    c.B([-.44,-.4,FLOOR],[.44,.1,.8],{side:k,top:lighten(k,.2),deco:{py:'cabinet'}});c.solid()}},
  // 自由な形: parts（ローカル座標: x,y は -0.5〜0.5、z は 0〜2.4）と solid / seat を設計図で指定する
  custom:{ja:'自由な家具',build(c){const it=c.item;
    for(const q of it.parts||[])c.B([q.from[0],q.from[1],Math.max(FLOOR,q.from[2])],[q.to[0],q.to[1],q.to[2]],{side:col(q.color,P.woodL),top:col(q.top,lighten(col(q.color,P.woodL),.15)),deco:q.pattern&&q.pattern!=='none'?{py:'gen',px:'gen',nx:'gen',ny:'gen'}:{},genSide:q.pattern});
    if(it.seat)c.seat(clamp(Number(it.seat)||.34,.2,.9),'seat');else if(it.solid)c.solid();
    if(it.name_en)c.vocab(it.name_en,it.name_ja||it.name_en,it.example_en||`This is a ${it.name_en}.`,it.example_ja||`これは${it.name_ja||it.name_en}です。`,[0,0,1])}},
};
const FURN_TYPES=Object.keys(FURN);
