// ================= villagers =================
const PEOPLE=[
  {name:'ハナ',en:'Hana',home:'A',bed:0,cloak:[232,112,100],cap:[255,246,236],persona:J('元気いっぱいで花が大好き。料理も得意。','Cheerful and loves flowers. A good cook.'),likes:{flower:.6,field:.3,chat:.3,cook:.6},wake:6.1,sleep:21.8,speed:1.5,at:[2,4]},
  {name:'ゴロウ',en:'Goro',home:'A',bed:1,cloak:[226,170,84],cap:[120,158,206],persona:J('無口な力持ちの職人。畑と水くみが日課。','A quiet, strong craftsman. Works in the field every day.'),likes:{field:.6,well:.4,chat:-.2,tv:.3},wake:5.5,sleep:21.5,speed:1.2,at:[2,9]},
  {name:'ケンタ',en:'Kenta',home:'A',bed:2,cloak:[110,160,220],cap:[244,196,110],persona:J('いたずら好きの子ども。テレビとかけっこが好き。','A playful kid who loves TV and running around.'),likes:{play:.9,walk:.3,tv:.6,fish:.2,bench:-.4,field:-.3},wake:7,sleep:20.5,speed:1.75,kid:true,at:[1,5]},
  {name:'ソラ',en:'Sora',home:'B',bed:0,cloak:[86,170,168],cap:[244,196,110],persona:J('のんびり屋の釣り好き。昼寝の名人。','Easygoing and loves fishing. A champion napper.'),likes:{fish:.7,nap:.5,rest:.3,field:-.2},wake:7.2,sleep:22.5,speed:1.2,at:[13,9]},
  {name:'ミノリ',en:'Minori',home:'B',bed:1,cloak:[150,122,196],cap:[252,236,222],persona:J('物静かな読書家。きれい好きで皆の相談役。','A quiet bookworm. Tidy, and everyone asks her for advice.'),likes:{bench:.7,bath:.4,flower:.2,cook:.4},wake:6.3,sleep:22.8,speed:1.25,at:[12,5]},
  {name:'ユイ',en:'Yui',home:'B',bed:2,cloak:[236,150,180],cap:[255,240,214],persona:J('明るい商売人。屋台を切り盛りしていて噂話が好き。','A bright shopkeeper who runs the stall and loves gossip.'),likes:{stall:.6,chat:.4,tv:.2},wake:6,sleep:22,speed:1.4,keeper:true,at:[8,4]}];
const walkers=PEOPLE.map((p,i)=>{const h=houses[p.home];const w={...p,kind:'person',house:h,tile:T(...p.at)||ground[0],
  link:null,t:0,phase:i*1.3,wait:.05*HR*i,path:[],goal:null,target:null,act:null,lastDir:[0,1],lastAct:null,
  needs:{energy:.8,food:.35+.1*hash(i),social:.45+.3*hash(i+3),fun:.5+.3*hash(i+7),bladder:.35+.4*hash(i+11),hygiene:.55+.3*hash(i+13)},
  mood:null,moodUntil:0,say:null,forced:null,directive:null,memory:[],rel:{},chatT:0,turn:0,brushedAt:-99*HR,washedAt:-99*HR};h.residents.push(w);return w});
walkers.forEach(w=>PEOPLE.forEach(o=>{if(o.name!==w.name)w.rel[o.name]=(w.home===o.home?.55:.35)+.15*hash(w.name.length*7+o.name.length)}));
const cat={name:'タマ',en:'Tama',kind:'cat',tile:T(9,8),speed:1.9,cloak:[236,168,110],cap:[255,236,214],persona:J('村の猫。気まぐれ。','The village cat. Does whatever it likes.'),
  link:null,t:0,phase:2,wait:.5,path:[],goal:null,target:null,act:null,lastDir:[1,0],say:null,forced:null,memory:[],needs:null};
walkers.push(cat);
const people=walkers.filter(w=>w.kind==='person');
const byName=n=>walkers.find(w=>w.name===n||(w.en&&w.en.toLowerCase()===String(n).toLowerCase()));
const nameOf=w=>L==='en'?w.en:w.name;

function bfs(a,b){if(a===b)return[];const prev=new Map([[a,null]]),q=[a];while(q.length){const o=q.shift();if(o===b){const p=[];let c=b;while(c!==a){p.unshift(c);c=prev.get(c)}return p}if(o.stop&&o!==a)continue;for(const l of o.links)if(!prev.has(l.to)){prev.set(l.to,o);q.push(l.to)}}return null}
const directiveOn=w=>w.directive&&clock.sim<w.directive.until;
const sleepTime=w=>{const h=clock.hour;const s=h>=w.sleep||h<w.wake;return s&&!(directiveOn(w)&&w.directive.goal!=='sleep'&&w.directive.goal!=='home')};
const taken=w=>{const s=new Set();walkers.forEach(o=>{if(o===w)return;if(o.target)s.add(o.target);s.add(o.link?o.link.to:o.tile)});return s};
const remember=(w,txt)=>{if(!w.memory)return;w.memory.push(`${hhmm(clock.hour)} ${txt}`);if(w.memory.length>8)w.memory.shift()};
const say=(w,phrase,secs=4)=>{if(!phrase)return;w.say={...phrase,until:S.time+secs};addPhrase(phrase)};
// villagers who start the day still in bed
people.forEach(w=>{if(sleepTime(w)){w.tile=w.house.spots.beds[w.bed];w.act={id:'sleep'};w.wait=(((w.wake-clock.hour)%24+24)%24)*HR;w.lastDir=[0,1]}});

function spotsFor(w,id){
  const h=w.house;
  switch(id){
    case'sleep':return[h.spots.beds[w.bed]];case'toilet':return h.spots.toilet;case'bath':return h.spots.tub;case'brush':case'wash':return h.spots.basin;
    case'cook':return h.spots.stove;case'eat':return h.spots.chairs;case'snack':return h.spots.fridge;case'dishes':return h.spots.sink;
    case'tv':case'rest':return h.spots.sofa;case'stall':return w.keeper?SPOTS.keeper:SPOTS.stall;case'dance':return SPOTS.plaza;
    default:return SPOTS[id]||[]}
}
function planAct(w,id){
  const a=ACTS[id];if(!a)return null;
  const goal={id,dur:a.dur,run:a.run};
  const busy=taken(w);let target;
  if(a.random){const here=w.tile.pos,c=ground.filter(t=>!busy.has(t)&&Math.abs(t.pos[0]-here[0])+Math.abs(t.pos[1]-here[1])<(a.run?7:10));target=pick(c.length?c:ground)}
  else{const c=spotsFor(w,id).filter(t=>t&&!busy.has(t));if(!c.length)return null;target=pick(c)}
  return{goal,target};
}
function setPlan(w,p){if(!p)return false;const path=bfs(w.tile,p.target);if(!path)return false;w.path=path;w.goal=p.goal;w.target=p.target;return true}
const mealWindow=h=>(h>=6.3&&h<9)||(h>=11.5&&h<13.5)||(h>=17.5&&h<20);

function score(w,id){
  const a=ACTS[id],h=clock.hour,n=w.needs,hs=w.house;let s=0;
  if(id==='sleep'||id==='sit')return-99;
  switch(id){
    case'toilet':s=n.bladder<.22?5:n.bladder<.45?1.1:-3;break;
    case'eat':s=hs.mealReady>clock.sim&&n.food<.85?2.6+(1-n.food)*2:-3;break;
    case'snack':s=n.food<.3?1.4+(.3-n.food)*5:(n.food<.55&&Math.random()<.15?.6:-2);break;
    case'cook':s=!w.kid&&mealWindow(h)&&hs.mealReady<clock.sim&&!hs.cooking&&hs.residents.some(o=>o.needs.food<.7)?3.2:-3;break;
    case'dishes':s=hs.dirty&&!w.kid?1.4:-3;break;
    case'brush':{const morning=h>=w.wake&&h<w.wake+2,night=h>=w.sleep-1.2&&h<w.sleep;s=(morning||night)&&clock.sim-w.brushedAt>3*HR?2.6:-3;break}
    case'wash':s=h>=w.wake&&h<w.wake+1.2&&clock.sim-w.washedAt>6*HR?2:-3;break;
    case'bath':s=(h>=17.5||h<1)&&n.hygiene<.65?1.7+(1-n.hygiene)*1.6:n.hygiene<.18?1.6:-2;break;
    case'tv':s=(h>=18?.8:-.1)+(1-n.fun)*.9;break;
    case'rest':s=(1-n.energy)*1.2-.3+(weather.kind!=='clear'?.4:0);break;
    default:{for(const k in a.gain){const g=a.gain[k];s+=g>0?g*(1-n[k])*2.4:g*(1-n[k])*1.4}
      if(id==='dance')s+=clock.sim<weather.festUntil||(directiveOn(w)&&w.directive.goal==='dance')?1.2:-99;
      if(id==='field'&&(h<6||h>17))s-=2;
      if(id==='fish'&&h>=14&&h<17)s+=.2;
      if(id==='nap')s+=h>=12&&h<15?.35:-.25;
      if(id==='stall'){if(w.keeper)s+=h>=8&&h<18?1.1:-2;else{const k=people.find(o=>o.keeper);s+=k&&k.act&&k.act.id==='stall'?.4:-.4}}
      if(id==='play'&&!w.kid)s-=.8;
      if((h>=19.5||h<5.5)&&!(id==='dance'&&clock.sim<weather.festUntil))s-=2.2;
      if(weather.kind==='rain')s-=w.kid?.5:1.7;
      if(weather.kind==='snow')s+=w.kid?.4:-.6;
      if(directiveOn(w)&&w.directive.goal==='home')s-=4;
      if(a.created!=null)s+=Math.max(0,1.6-(clock.sim-a.created)/(10*HR));
    }
  }
  s+=(w.likes[id]||0);
  if(id===w.lastAct&&id!=='eat')s-=.6;
  if(directiveOn(w)){if(w.directive.goal===id)s+=6;else if(w.directive.goal==='home'&&a.indoor)s+=.8;else s-=.3}
  return s+Math.random()*.4;
}

function chatPartner(w){
  let best=null,bs=-1;
  people.forEach(o=>{if(o===w||o.player||sleepTime(o)||o.forced||directiveOn(o)||o.tile.stop||o.link)return;
    if((o.act&&(o.act.id==='chat'||(ACTS[o.act.id]&&ACTS[o.act.id].indoor)))||(o.goal&&o.goal.id==='chat'))return;
    if(o.keeper&&o.act&&o.act.id==='stall')return;if(o.tile.indoor!==w.tile.indoor&&Math.random()<.5)return;
    const s=w.rel[o.name]+(1-o.needs.social)*.6+Math.random()*.3;if(s>bs){bs=s;best=o}});
  return best;
}
function startChat(w){
  const o=chatPartner(w);if(!o)return false;
  const busy=taken(w),mx=(w.tile.pos[0]+o.tile.pos[0])/2,my=(w.tile.pos[1]+o.tile.pos[1])/2;
  const sameHouse=w.tile.house&&w.tile.house===o.tile.house;
  const pool=(sameHouse?w.tile.house.spots.floor:ground).filter(t=>!busy.has(t));
  const cand=pool.sort((a,b)=>Math.hypot(a.pos[0]-mx,a.pos[1]-my)-Math.hypot(b.pos[0]-mx,b.pos[1]-my));
  for(const t of cand.slice(0,30)){const nb=t.links.map(l=>l.to).find(n=>!n.stop&&n.house===t.house&&!busy.has(n));if(!nb)continue;
    const g1={id:'chat',dur:ACTS.chat.dur,partner:o,lead:true},g2={id:'chat',dur:ACTS.chat.dur,partner:w};
    if(!setPlan(w,{goal:g1,target:t}))return false;o.forced={goal:g2,target:nb};return true}
  return false;
}
function bedtime(w){
  if(w.needs.bladder<.6&&setPlan(w,planAct(w,'toilet')))return true;
  if(clock.sim-w.brushedAt>4*HR&&setPlan(w,planAct(w,'brush')))return true;
  return false;
}
function chooseGoal(w){
  if(w.kind==='cat')return catGoal(w);
  if(sleepTime(w)||(directiveOn(w)&&w.directive.goal==='sleep')){if(bedtime(w))return;if(setPlan(w,planAct(w,'sleep')))return;w.wait=.2*HR;return}
  const ranked=ACT_IDS.map(id=>[id,score(w,id)]).sort((a,b)=>b[1]-a[1]);
  for(const[id,s]of ranked){if(s<-50)break;
    if(id==='chat'){if(startChat(w))return;continue}
    if(setPlan(w,planAct(w,id)))return;
  }
  w.wait=.3*HR;
}
function catGoal(w){
  const h=clock.hour,night=h>=21||h<6,hA=houses.A;
  if(night){const t=hA.spots.sofa.find(t=>!taken(w).has(t))||pick(hA.spots.floor);setPlan(w,{goal:{id:'catsleep',dur:[2,4]},target:t});return}
  if(weather.kind==='rain'){setPlan(w,{goal:{id:'cat',dur:[.5,1]},target:pick(hA.spots.floor)});return}
  const pool=Math.random()<.25?pick([hA,houses.B]).spots.floor:ground;
  setPlan(w,{goal:{id:'cat',dur:[.3,1]},target:pick(pool)});
}

function startAct(w,g){
  w.act=g;
  const a=ACTS[g.id];
  if(g.id==='sleep'){const left=((w.wake-clock.hour)%24+24)%24;w.wait=(directiveOn(w)&&w.directive.goal==='sleep'?Math.max(.3,(w.directive.until-clock.sim)/HR):Math.max(.3,left))*HR;say(w,a.phrase(w),3);w.lastDir=[0,1];return}
  w.wait=rand(g.dur||[.3,.6])*HR;
  const hs=g.hs||w.house;if(!hs)return;
  if(g.id==='cook'){hs.cooking=w;hs.cookName=mealName()}
  if(g.id==='tv')hs.tvOn=true;
  if(g.id==='chat'&&g.partner){const d=[g.partner.tile.pos[0]-w.tile.pos[0],g.partner.tile.pos[1]-w.tile.pos[1]];if(d[0]||d[1])w.lastDir=[Math.sign(d[0]),Math.sign(d[1])];return}
  if(w.tile.furn&&w.tile.furn.face)w.lastDir=w.tile.furn.face;
  if(a&&a.phrase&&(w.player||Math.random()<.8)){houseMealCtx=hs;say(w,a.phrase(w));houseMealCtx=null}
  if(g.id==='brush')w.brushedAt=clock.sim;if(g.id==='wash')w.washedAt=clock.sim;
}
function finishAct(w,interrupted){
  const a=w.act;w.act=null;w.target=null;if(!a||!w.house)return;
  w.lastAct=a.id;const hs=a.hs||w.house;
  if(a.id==='sleep'){w.needs.energy=Math.max(w.needs.energy,.92);if(!interrupted)say(w,pick([J('おはよう！よく眠れた。','Good morning! I slept well.'),J('ふぁ〜、おはよう。','Yawn... good morning.')]));remember(w,'ぐっすり眠った')}
  if(a.id==='toilet'&&!interrupted&&Math.random()<.6)say(w,J('トイレを流して、手を洗おう。','Flush the toilet and wash your hands.'));
  if(a.id==='cook'){hs.cooking=null;if(!interrupted){hs.mealReady=clock.sim+2.5*HR;hs.mealName=hs.cookName;say(w,J(`${hs.mealName.ja}ができたよ！`,`${cap(hs.mealName.en)} is ready!`),5);log(J(`${w.name}が${hs.mealName.ja}を作った`,`${w.en} made ${hs.mealName.en}.`))}}
  if(a.id==='eat'){hs.dirty=true;remember(w,'ごはんを食べた');if(!interrupted&&Math.random()<.5)say(w,J('ごちそうさまでした。','Thank you for the meal. That was good.'))}
  if(a.id==='dishes'&&!interrupted)hs.dirty=false;
  if(a.id==='tv'&&!walkers.some(o=>o!==w&&o.act&&o.act.id==='tv'&&(o.act.hs||o.house)===hs))hs.tvOn=false;
  if(a.id==='bath'&&!interrupted)say(w,J('さっぱりした！','I feel so clean!'));
  if(a.id==='chat'&&a.partner){const p=a.partner;
    w.rel[p.name]=clamp((w.rel[p.name]||.4)+.05,0,1);
    if(a.lead){remember(w,`${p.name}とおしゃべりした`);remember(p,`${w.name}とおしゃべりした`);if(Math.random()<.5)log(J(`${w.name}と${p.name}がおしゃべりした`,`${w.en} and ${p.en} had a chat.`))}
    if(p.act&&p.act.id==='chat'&&p.act.partner===w&&p.wait>0)p.wait=Math.min(p.wait,.05)}
  if(a.id==='fish'&&Math.random()<.5){remember(w,'魚を釣った');say(w,pick([J('釣れた！','I caught one!'),J('大物だ！','It\'s a big one!')]))}
}
function applyForced(w){
  const f=w.forced;w.forced=null;
  if(w.act)finishAct(w,true);
  w.act=null;w.wait=0;w.path=[];w.goal=null;w.target=null;
  if(!setPlan(w,f)){if(w.tile===f.target){w.goal=f.goal;w.target=f.target}}
}
function updateWalker(w,sdt){
  const dtH=sdt/HR,n=w.needs;
  if(n){
    const asleep=w.act&&w.act.id==='sleep'&&!w.link;
    n.energy+=(asleep?.14:-.045)*dtH;n.food-=(asleep?.015:.055)*dtH;n.social-=(asleep?.005:.05)*dtH;n.fun-=(asleep?0:.05)*dtH;n.bladder-=(asleep?.03:.11)*dtH;n.hygiene-=(asleep?.01:.035)*dtH;
    if(w.act&&!w.link&&w.wait>0){const g=ACTS[w.act.id]&&ACTS[w.act.id].gain;if(g)for(const k in g)n[k]+=g[k]*dtH}
    for(const k in n)n[k]=clamp(n[k],0,1);
    if(n.bladder<.06&&!w.player&&!(w.act&&w.act.id==='toilet')&&!(w.goal&&w.goal.id==='toilet')&&!w.link&&!w.forced){const p=planAct(w,'toilet');if(p){w.forced=p;say(w,J('もれちゃう〜！','I really need to go!'))}}
  }
  if(w.player){playerTick(w,sdt);return}
  if(w.link){const run=w.goal&&w.goal.run;w.phase+=(run?13:9)*sdt;w.t+=sdt*w.speed*(run?1.7:1);if(w.t>=1){w.lastDir=w.link.dir;w.tile=w.link.to;w.link=null;w.t=0}else return}
  if(w.forced){applyForced(w);return}
  if(w.wait>0){w.wait-=sdt;if(w.wait<=0&&w.act)finishAct(w,false);return}
  if(w.path.length){const nx=w.path.shift(),Lk=w.tile.links.find(l=>l.to===nx);if(!Lk){w.path=[];w.goal=null;w.target=null;return}w.link=Lk;w.t=0;return}
  if(w.goal){const g=w.goal;w.goal=null;startAct(w,g);return}
  w.act=null;w.target=null;
  chooseGoal(w);
}

function walkerPos(w){if(w.player&&w.ppos)return[w.ppos[0],w.ppos[1],w.pz];const e=w.tile.pos;if(!w.link)return e.slice();const l=w.link,i=w.t;return[e[0]+l.dir[0]*i,e[1]+l.dir[1]*i,e[2]+smooth((i-.15)/.5)*l.dz]}
function faceOf(w){
  let d=w.link?w.link.dir:w.lastDir;
  if(!w.link&&w.act&&w.act.id==='chat'&&w.act.partner){const p=w.act.partner.tile.pos;d=[p[0]-w.tile.pos[0],p[1]-w.tile.pos[1]]}
  if(!w.link&&w.act&&w.act.id==='dance')return Math.sin(S.time*4+w.phase)>0?1:-1;
  return dot([d[0],d[1],0],cam.r)>=0?1:-1}
function moodOf(w){
  if(!w.needs)return'calm';
  if(w.mood&&clock.sim<w.moodUntil)return w.mood;
  const n=w.needs;if(n.energy<.18)return'tired';const avg=(n.energy+n.social+n.fun+n.food+n.hygiene)/5;return avg>.62?'happy':avg<.32?'sad':'calm'}
function statusOf(w){
  if(w.kind==='cat'){if(w.act&&w.act.id==='catsleep'&&!w.link)return J('すやすや眠っている','sleeping');if(w.link||w.goal)return J('うろうろ','wandering around');return J('ひなたで毛づくろい','grooming in the sun')}
  const g=w.goal;
  if(g){if(g.id==='chat')return J(`${g.partner.name}とおしゃべりしに行く`,`going to chat with ${g.partner.en}`);const l=labelOf(w,g.id);return J(`${l.ja}へ`,`on the way: ${l.en}`)}
  if(w.act){if(w.act.id==='chat')return J(`${w.act.partner.name}とおしゃべり`,`chatting with ${w.act.partner.en}`);houseMealCtx=w.house;const l=labelOf(w,w.act.id);houseMealCtx=null;return l}
  return J('ひと休み','taking a break');
}

