// ================= language =================
let L='ja',showLabels=false;
try{showLabels=localStorage.getItem('hakoniwa-labels')==='1'}catch(e){}
try{const s=localStorage.getItem('hakoniwa-lang');if(s==='en'||s==='ja')L=s}catch(e){}
const tr=o=>o==null?'':typeof o==='string'?o:(o[L]??o.ja??o.en??'');
const J=(ja,en)=>({ja,en});
const UI={
  god:J('神の声','Voice of God'),send:J('告げる','Speak'),sending:J('届けています…','Sending…'),
  ph:J('例：今日はお祭りだ！みんな広場に集まれ','e.g. "It\'s festival day! Everyone, come to the plaza!"'),
  lang:J('English','日本語'),book:J('フレーズ帳','Phrasebook'),
  bookNote:J('村で聞こえた英語のフレーズがたまっていきます。🔊で発音を聞けます。','English phrases you hear in the village are saved here. Tap 🔊 to listen.'),
  bookEmpty:J('まだフレーズがありません。英語モードで住人の会話を聞いてみましょう。','No phrases yet. Watch the villagers in English mode.'),
  hint:J('ドラッグで回転・ホイールで拡大・住人や物をタップ','Drag to rotate · zoom in to see names · tap people and things to learn words'),
  think:J('心の声を聞く','Inner voice'),follow:J('この人を追う','Follow'),listening:J('耳をすましています…','Listening…'),
  roofOn:J('外観を見る','Show roofs'),roofOff:J('家の中を見る','Show inside'),
  speed:J('早送り','Speed'),floor:n=>J(`${n}階`,`${n}F`),floorTip:J('表示する階を切りかえる','Switch the floor to show'),play:J('この人になる（一人称）','Play as this person'),reset:J('視点を戻す','Reset view'),exSay:J('🔊 例文を聞く','🔊 Example')};
const MOOD_T={happy:J('ごきげん','happy'),excited:J('わくわく','excited'),calm:J('おだやか','calm'),sad:J('しょんぼり','sad'),scared:J('こわがり中','scared'),angry:J('ぷんぷん','angry'),tired:J('くたくた','tired')};
const WX_T={clear:J('晴れ','Sunny'),rain:J('雨','Rainy'),snow:J('雪','Snowy')};
const NEED_T={energy:[J('元気','Energy'),'#7fc7a0'],food:[J('満腹','Full'),'#a0b8e8'],social:[J('交流','Social'),'#e8a0b0'],fun:[J('楽しさ','Fun'),'#f0c070'],bladder:[J('トイレ','Bladder'),'#c9b3e8'],hygiene:[J('清潔','Clean'),'#8fd3e0']};
const canSpeak='speechSynthesis' in window;
function speak(text){if(!canSpeak||!text)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.88;speechSynthesis.speak(u)}catch(e){}}

const P={wall:[246,214,190],wall2:[226,226,206],wallTrim:[252,238,224],coral:[236,140,132],teal:[120,170,180],recess:[118,104,150],glass:[150,186,222],
  cream:[252,240,222],grass:[176,218,160],path:[242,228,200],plaza:[232,222,216],rock:[182,164,214],rockDark:[146,128,190],gold:[244,196,110],
  shadowTint:[96,84,150],soil:[178,134,108],water:[136,194,226],stone:[200,194,214],wood:[198,150,120],woodL:[222,184,148],brick:[214,148,136],
  white:[246,246,250],porcelain:[236,240,248],floorW:[226,190,150],tileB:[214,230,236],tileK:[238,226,206],paper:[250,240,228],paper2:[236,240,232],dark:[64,60,84],steel:[200,206,218]};
const LIGHT=(()=>{const t=[.32,.72,1],e=Math.hypot(...t);return t.map(v=>v/e)})();
const SKY={day:['#a9c8f2','#d3e1f6','#f3e8e4','#fbefe4'].map(hx),dusk:['#6c7cc2','#c993c0','#f2ad92','#fbcfa8'].map(hx),night:['#111a3a','#222c5a','#36396c','#463f72'].map(hx)};

let amb=[1,1,1], ambOut=[1,1,1], dayK=1, duskK=0, nightK=0, rainK=0, snowK=0, snowCover=0, rainbowK=0, festK=0, skyMid=[200,210,240];
let interior=true;
const fpv={on:false,w:null,yaw:0,pitch:0,keys:new Set(),joy:[0,0],sig:'',typing:false,moving:false};
const A=c=>[c[0]*amb[0],c[1]*amb[1],c[2]*amb[2]];
const rgb=(t,e=1,l=1)=>`rgba(${Math.round(clamp(t[0]*e,0,255))},${Math.round(clamp(t[1]*e,0,255))},${Math.round(clamp(t[2]*e,0,255))},${l})`;
const rgbA=(t,e,l)=>rgb(A(t),e,l);
let snowOn=false;
const snowy=c=>snowOn&&snowCover>0?mix(c,[244,246,252],snowCover*.85):c;
function shade(c,n){const l=Math.max(0,dot(n,LIGHT)),i=.74+.3*l;return A(mix(c.map(v=>v*i),P.shadowTint,.2*(1-l)))}

