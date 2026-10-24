// ================= activities =================
const ACTS={
  sleep:{label:J('ベッドで寝ている','sleeping in bed'),glyph:'z',indoor:true,phrase:()=>J('おやすみなさい！','Good night!')},
  toilet:{label:J('トイレ中','using the toilet'),glyph:'…',indoor:true,dur:[.12,.2],gain:{bladder:7},
    phrase:()=>pick([J('トイレに行きたいな。','I need to go to the bathroom.'),J('ちょっとトイレ。','Excuse me, I\'m going to the restroom.')])},
  bath:{label:J('お風呂に入っている','taking a bath'),glyph:'♨',indoor:true,dur:[.45,.7],gain:{hygiene:2.4,fun:.4,energy:.25},
    phrase:()=>pick([J('お風呂に入ってる。あったかい！','I\'m taking a bath. It\'s so warm!'),J('お風呂が気持ちいい。','The bath feels nice.')])},
  brush:{label:J('歯みがき中','brushing my teeth'),glyph:'✧',indoor:true,dur:[.12,.2],gain:{hygiene:.9},
    phrase:()=>clock.hour<12?J('毎朝、歯をみがくよ。','I brush my teeth every morning.'):J('寝る前に歯をみがかなきゃ。','I have to brush my teeth before bed.')},
  wash:{label:J('顔を洗っている','washing my face'),glyph:'✧',indoor:true,dur:[.08,.14],gain:{hygiene:.8},
    phrase:()=>J('顔を洗ってすっきり。','I wash my face to wake up.')},
  cook:{label:()=>J(`${mealName().ja}を作っている`,`cooking ${mealName().en}`),glyph:'♨',indoor:true,dur:[.5,.75],gain:{fun:.15},
    phrase:()=>J(`${mealName().ja}を作ってるよ。`,`I'm cooking ${mealName().en}.`)},
  eat:{label:()=>J(`${(houseMeal()||mealName()).ja}を食べている`,`eating ${(houseMeal()||mealName()).en}`),glyph:'♪',indoor:true,dur:[.4,.6],gain:{food:2,social:.35,fun:.15},
    phrase:()=>pick([J('いただきます！','Let\'s eat!'),J('おいしい！','This is delicious!'),J('おかわりある？','Can I have some more?')])},
  snack:{label:J('冷蔵庫から飲み物を出している','getting a drink from the fridge'),glyph:'◦',indoor:true,dur:[.1,.18],gain:{food:1.4},
    phrase:()=>pick([J('のどがかわいた。','I\'m thirsty.'),J('冷蔵庫に何があるかな？','What\'s in the fridge?')])},
  dishes:{label:J('お皿を洗っている','doing the dishes'),glyph:'◦',indoor:true,dur:[.25,.4],gain:{},
    phrase:()=>J('お皿を洗うね。','I\'ll do the dishes.')},
  tv:{label:J('テレビを見ている','watching TV'),glyph:'♪',indoor:true,dur:[.8,1.4],gain:{fun:.5,energy:.08},
    phrase:()=>pick([J('テレビを見よう。','Let\'s watch TV.'),J('何やってるかな？','What\'s on TV?'),J('この番組おもしろい！','This show is funny!')])},
  rest:{label:J('ソファでくつろいでいる','relaxing on the sofa'),glyph:'…',indoor:true,dur:[.5,1],gain:{energy:.3,fun:.1},
    phrase:()=>J('ちょっとひと休み。','Let me take a short break.')},
  sit:{label:J('いすに座っている','sitting on a chair'),glyph:'…',indoor:true,dur:[.3,.5],gain:{energy:.1},phrase:()=>J('ちょっと座ろう。','Let me sit down.')},
  field:{label:J('畑しごと','working in the field'),glyph:'✿',dur:[1,1.8],gain:{fun:.06,energy:-.08,hygiene:-.15},
    phrase:w=>w.kid?J('てんとう虫みつけた！','I found a ladybug!'):J('野菜に水をやらなきゃ。','I need to water the vegetables.')},
  fish:{label:J('池でつり','fishing at the pond'),glyph:'～',dur:[1.2,2.4],gain:{fun:.22,energy:.03},
    phrase:()=>J('池に釣りに行ってくる。','I\'m going fishing at the pond.')},
  well:{label:J('井戸で水くみ','getting water from the well'),glyph:'◦',dur:[.3,.6],gain:{fun:.05},
    phrase:()=>J('水をくんでこなきゃ。','I need to get some water.')},
  nap:{label:J('木かげで昼寝','napping under a tree'),glyph:'z',dur:[.8,1.5],gain:{energy:.45},
    phrase:()=>J('木の下で昼寝しよう。','I\'ll take a nap under the tree.')},
  chat:{label:J('おしゃべり','chatting'),glyph:'♪',dur:[.7,1.2],gain:{social:.55,fun:.1}},
  flower:{label:J('花に水やり','watering the flowers'),glyph:'✿',dur:[.5,.9],gain:{fun:.18},
    phrase:()=>J('お花がとってもきれい。','The flowers are so pretty.')},
  bench:{label:J('ベンチで休憩','resting on the bench'),glyph:'…',dur:[.8,1.5],gain:{energy:.2,fun:.1},
    phrase:w=>w.name==='ミノリ'?J('ベンチで本を読もう。','I\'ll read a book on the bench.'):J('ちょっと座ろう。','Let me sit down for a bit.')},
  stall:{label:J('屋台で買い物','shopping at the stall'),glyph:'◇',dur:[.3,.6],gain:{food:.4,fun:.12,social:.12},
    phrase:w=>w.keeper?J('いらっしゃい！今日は新鮮な果物だよ！','Welcome! We have fresh fruit today!'):pick([J('このりんごはいくらですか？','How much is this apple?'),J('バナナを2本ください。','Two bananas, please.')])},
  play:{label:J('かけっこ','playing tag'),glyph:'!',dur:[.25,.5],gain:{fun:.45,energy:-.12,hygiene:-.1},random:true,run:true,
    phrase:()=>pick([J('鬼ごっこしよう！','Let\'s play tag!'),J('つかまえてごらん！','Catch me if you can!')])},
  walk:{label:J('さんぽ','taking a walk'),glyph:'♪',dur:[.15,.4],gain:{fun:.12},random:true,
    phrase:()=>J('ちょっとさんぽしてくる。','I\'m going for a walk.')},
  plaza:{label:J('広場でくつろぐ','hanging out at the plaza'),glyph:'♪',dur:[.8,1.6],gain:{social:.18,fun:.08},
    phrase:()=>J('広場で会おうね。','Let\'s meet at the plaza.')},
  dance:{label:J('広場で踊る','dancing at the plaza'),glyph:'♪',dur:[.8,1.6],gain:{fun:.5,social:.2,energy:-.1},
    phrase:()=>J('一緒に踊ろう！','Let\'s dance together!')}};
let ACT_IDS=Object.keys(ACTS);
// 家の中の行動は「自分の家」の家具を使う
ACT_IDS.forEach(id=>{if(ACTS[id].indoor)ACTS[id].home=true});
// 一人称モードのボタン文言
const USE_T={sleep:J('ベッドで寝る','Go to bed'),toilet:J('トイレを使う','Use the toilet'),bath:J('お風呂に入る','Take a bath'),brush:J('歯をみがく','Brush your teeth'),wash:J('顔を洗う','Wash your face'),
  cook:J('料理する','Cook a meal'),eat:J('ごはんを食べる','Eat a meal'),sit:J('いすに座る','Sit on the chair'),snack:J('飲み物を出す','Get a drink'),dishes:J('お皿を洗う','Do the dishes'),
  tv:J('テレビを見る','Watch TV'),rest:J('ソファでくつろぐ','Relax on the sofa'),fish:J('釣りをする','Go fishing'),well:J('水をくむ','Get some water'),field:J('畑の手入れ','Work in the field'),
  flower:J('花に水をやる','Water the flowers'),bench:J('ベンチで休む','Rest on the bench'),stall:J('果物を買う','Buy some fruit'),dance:J('踊る','Dance'),nap:J('昼寝する','Take a nap')};
for(const k in USE_T)if(ACTS[k])ACTS[k].use=USE_T[k];

const labelOf=(w,id)=>{const a=ACTS[id];if(!a)return J('ひと休み','taking a break');if(id==='stall'&&w.keeper)return J('屋台の店番','running the stall');if(id==='bench'&&w.name==='ミノリ')return J('ベンチで読書','reading on the bench');if(id==='field'&&w.kid)return J('畑で虫さがし','looking for bugs in the field');return typeof a.label==='function'?a.label():a.label};

