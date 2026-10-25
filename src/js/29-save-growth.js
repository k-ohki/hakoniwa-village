// ================= save / restore + growing town =================
const SAVE_KEY='hakoniwa-save-v1';
const grow={log:[],lastAt:-10*HR,busy:false,wishes:{},evSeen:''};
const TUI={btn:J('町','Town'),title:J('町の保存と歩み','Town: save & history'),save:J('今すぐ保存','Save now'),reset:J('最初からやり直す','Start over'),reset2:J('もう一度押すと町が消えます','Press again to erase the town'),
  note:J('この町は自動でこのブラウザに保存されます。住人の願いやできごとに応じて、物が少しずつ増えたり変わったりします。','Your town is saved in this browser automatically. Objects slowly appear and change as villagers wish and things happen.'),
  saved:J('保存しました','Saved'),last:J('最終保存','Last saved'),none:J('まだ変化はありません','Nothing has changed yet.'),resumed:J('前回の町を再開しました','Resumed your saved town.'),
  wish:J('願い','Wish'),fail:J('このブラウザでは保存できません','Saving is not available here.')};
let lastSaveAt=0,saveErr=false;
function snapshot(){
  const n=clock.sim;
  return{v:1,hr:HR,at:Date.now(),sim:n,
    weather:{kind:weather.kind,left:Math.max(0,weather.until-n),fest:Math.max(0,weather.festUntil-n),rb:Math.max(0,weather.rainbowUntil-n)},
    walkers:walkers.map(w=>({n:w.name,pos:w.tile.pos.slice(),needs:w.needs?{...w.needs}:null,rel:w.rel&&w.kind==='person'?{...w.rel}:null,mem:(w.memory||[]).slice(-8),mood:w.mood||null,moodLeft:Math.max(0,(w.moodUntil||0)-n)})),
    growth:{log:grow.log.slice(-40),since:n-grow.lastAt,wishes:grow.wishes}};
}
function saveTown(manual){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot()));saveBuilds();lastSaveAt=Date.now();saveErr=false;if(manual)toast(TUI.saved);renderTown();return true}
  catch(e){saveErr=true;if(manual)toast(TUI.fail);return false}
}
function scaleTimes(s,k){if(k===1)return s;const x=JSON.parse(JSON.stringify(s));x.sim*=k;const wx=x.weather||{};['left','fest','rb'].forEach(f=>{if(isFinite(wx[f]))wx[f]*=k});
  (x.walkers||[]).forEach(r=>{if(isFinite(r.moodLeft))r.moodLeft*=k});if(x.growth&&isFinite(x.growth.since))x.growth.since*=k;return x}
function readSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return s&&s.v===1&&isFinite(s.sim)?s:null}catch(e){return null}}
function findTile(p){if(!Array.isArray(p))return null;return tiles.find(t=>Math.abs(t.pos[0]-p[0])<.01&&Math.abs(t.pos[1]-p[1])<.01&&Math.abs(t.pos[2]-p[2])<.01&&t.links.length&&(t.indoor||tileAt.get(key(t.pos[0],t.pos[1]))===t))||null}
function restoreTown(s){
  // 保存した時と1時間の長さが違えば、時刻や残り時間を今の長さに直す
  const k=HR/(Number(s.hr)||OLD_HR);s=scaleTimes(s,k);
  clock.sim=Math.max(0,Number(s.sim)||0);tickClock();clock.lastDay=clock.day;clock.lastHourInt=Math.floor(clock.hour);
  const wx=s.weather||{};weather.kind=['clear','rain','snow'].includes(wx.kind)?wx.kind:'clear';weather.until=clock.sim+(Number(wx.left)||0);weather.festUntil=clock.sim+(Number(wx.fest)||0);weather.rainbowUntil=clock.sim+(Number(wx.rb)||0);weather.plan=null;
  (s.walkers||[]).forEach(r=>{const w=byName(String(r.n));if(!w)return;
    const t=findTile(r.pos);if(t){w.tile=t;w.link=null;w.path=[];w.goal=null;w.target=null;w.act=null;w.forced=null;w.wait=.05*HR;w.t=0}
    if(w.needs&&r.needs)for(const k in w.needs){const v=Number(r.needs[k]);if(isFinite(v))w.needs[k]=clamp(v,0,1)}
    if(w.rel&&r.rel)for(const k in w.rel){const v=Number(r.rel[k]);if(isFinite(v))w.rel[k]=clamp(v,0,1)}
    if(Array.isArray(r.mem)&&w.memory)w.memory=r.mem.map(String).slice(-8);
    if(r.mood&&MOODS.includes(r.mood)){w.mood=r.mood;w.moodUntil=clock.sim+(Number(r.moodLeft)||0)}});
  const g=s.growth||{};grow.log=Array.isArray(g.log)?g.log.filter(x=>x&&x.ja&&x.en).map(x=>({day:Number(x.day)||1,ja:String(x.ja).slice(0,90),en:String(x.en).slice(0,110)})):[];
  grow.lastAt=clock.sim-(Number(g.since)||0);grow.wishes=g.wishes&&typeof g.wishes==='object'?g.wishes:{};
  lastSaveAt=Number(s.at)||0;
}
function renderTown(){
  renderApiPanel();
  if(!$('town'))return;
  $('townBtn').textContent=tr(TUI.btn);$('townTitle').textContent=tr(TUI.title);$('townSave').textContent=tr(TUI.save);$('townNote').textContent=tr(TUI.note);
  $('townReset').textContent=tr(resetArmed?TUI.reset2:TUI.reset);
  const t=lastSaveAt?new Date(lastSaveAt):null;$('townStamp').textContent=saveErr?tr(TUI.fail):t?`${tr(TUI.last)}: ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`:'';
  const ul=$('townList');ul.replaceChildren();
  if(!grow.log.length){const li=document.createElement('li');li.textContent=tr(TUI.none);ul.append(li);return}
  grow.log.slice().reverse().forEach(e=>{const li=document.createElement('li'),d=document.createElement('div'),b=document.createElement('b'),s=document.createElement('span');
    b.textContent=L==='en'?e.en:e.ja;s.textContent=(L==='en'?`Day ${e.day}`:`${e.day}日目`)+(L==='en'?'  '+e.ja:'  '+e.en);d.append(b,s);li.append(d);ul.append(li)})
}
let resetArmed=false,resetT=0;
$('townBtn').addEventListener('click',()=>{const p=$('town');p.hidden=!p.hidden;if(!p.hidden){$('book').hidden=true;renderTown()}});
$('bookBtn').addEventListener('click',()=>{if(!$('book').hidden)$('town').hidden=true});
$('townClose').addEventListener('click',()=>{$('town').hidden=true});
$('townSave').addEventListener('click',()=>saveTown(true));
$('townReset').addEventListener('click',()=>{
  if(!resetArmed){resetArmed=true;renderTown();clearTimeout(resetT);resetT=setTimeout(()=>{resetArmed=false;renderTown()},4000);return}
  window.__noSave=true;try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem('hakoniwa-builds')}catch(e){}location.reload()});
setInterval(()=>{if(!window.__noSave)saveTown(false)},10000);
addEventListener('pagehide',()=>{if(!window.__noSave)saveTown(false)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!window.__noSave)saveTown(false)});

// ---- growth: villagers' wishes and events slowly change the town
const SMALLS={
  swing:{name_en:'swing',name_ja:'ブランコ',footprint:[2,1],near:'plaza',wish:J('ブランコがほしいな。','I wish we had a swing.'),ex:['Let\'s play on the swing!','ブランコで遊ぼう！'],
    parts:[{shape:'box',from:[.1,.35,0],to:[.2,.65,1.3],color:'#c69678'},{shape:'box',from:[1.8,.35,0],to:[1.9,.65,1.3],color:'#c69678'},{shape:'box',from:[.1,.35,1.3],to:[1.9,.65,1.4],color:'#ec8c84'},{shape:'box',from:[.8,.45,.35],to:[1.2,.55,.42],color:'#fcf0de'}],
    act:{label_en:'playing on the swing',label_ja:'ブランコで遊ぶ',use_en:'Play on the swing',use_ja:'ブランコで遊ぶ',phrase_en:'Wheee! Higher!',phrase_ja:'わーい！もっと高く！',gain:{fun:.45,energy:-.1}}},
  lantern:{name_en:'lantern post',name_ja:'ちょうちん灯',footprint:[1,1],near:'plaza',wish:J('夜も明るいと楽しいのにな。','It would be nice to have light at night.'),ex:['The lantern is so pretty.','ちょうちんがきれいだね。'],
    parts:[{shape:'cylinder',from:[.45,.45,0],to:[.55,.55,1.2],color:'#8a7a9a'},{shape:'box',from:[.3,.3,1.2],to:[.7,.7,1.55],color:'#ffe39a',pattern:'windows'},{shape:'cone',from:[.25,.25,1.55],to:[.75,.75,1.8],color:'#ec8c84'}],act:null},
  flowerbed:{name_en:'flower bed',name_ja:'花だん',footprint:[2,1],near:'houseA',wish:J('もっと花が見たいな。','I want to see more flowers.'),ex:['The flower bed is beautiful.','花だんがきれいだね。'],
    parts:[{shape:'box',from:[.05,.1,0],to:[1.95,.9,.25],color:'#c69678',top:'#8cc795',topPattern:'grass'},{shape:'box',from:[.3,.3,.25],to:[.5,.5,.45],color:'#f2a0b8'},{shape:'box',from:[.85,.5,.25],to:[1.05,.7,.45],color:'#ffe39a'},{shape:'box',from:[1.4,.3,.25],to:[1.6,.5,.45],color:'#c9b3ee'}],
    act:{label_en:'enjoying the flowers',label_ja:'花をながめる',use_en:'Enjoy the flowers',use_ja:'花をながめる',phrase_en:'They smell so nice.',phrase_ja:'いい香りだね。',gain:{fun:.25,energy:.1}}},
  readnook:{name_en:'reading bench',name_ja:'読書ベンチ',footprint:[2,1],near:'bench',wish:J('静かに本が読める場所がほしい。','I want a quiet place to read.'),ex:['I read a book on the bench.','ベンチで本を読むよ。'],
    parts:[{shape:'box',from:[.1,.2,0],to:[1.9,.7,.35],color:'#c69678',pattern:'planks'},{shape:'box',from:[.1,.65,.35],to:[1.9,.75,.85],color:'#c69678',pattern:'planks'},{shape:'box',from:[.4,.25,.35],to:[.6,.55,.5],color:'#78aab4'}],
    act:{label_en:'reading a book',label_ja:'本を読む',use_en:'Read a book',use_ja:'本を読む',phrase_en:'This story is great.',phrase_ja:'この話、おもしろいな。',gain:{fun:.3,energy:.15}}},
  scarecrow:{name_en:'scarecrow',name_ja:'かかし',footprint:[1,1],near:'field',wish:J('畑を守るかかしがほしい。','I want a scarecrow to guard the field.'),ex:['The scarecrow protects the crops.','かかしが作物を守るよ。'],
    parts:[{shape:'box',from:[.45,.45,0],to:[.55,.55,1.3],color:'#c69678'},{shape:'box',from:[.1,.45,.9],to:[.9,.55,1],color:'#c69678'},{shape:'cylinder',from:[.35,.35,1.3],to:[.65,.65,1.6],color:'#fcf0de'},{shape:'cone',from:[.25,.25,1.6],to:[.75,.75,1.95],color:'#e8c070'}],act:null},
  picnic:{name_en:'picnic table',name_ja:'ピクニックテーブル',footprint:[2,2],near:'plaza',wish:J('みんなで外ごはんを食べたいな。','I want to eat outside with everyone.'),ex:['Let\'s have lunch at the picnic table.','ピクニックテーブルでお昼にしよう。'],
    parts:[{shape:'box',from:[.2,.6,.45],to:[1.8,1.4,.55],color:'#c69678',pattern:'planks'},{shape:'box',from:[.3,.7,0],to:[.4,.8,.45],color:'#a97d62'},{shape:'box',from:[1.6,.7,0],to:[1.7,.8,.45],color:'#a97d62'},{shape:'box',from:[.3,1.2,0],to:[.4,1.3,.45],color:'#a97d62'},{shape:'box',from:[1.6,1.2,0],to:[1.7,1.3,.45],color:'#a97d62'},{shape:'box',from:[.2,.1,0],to:[1.8,.5,.3],color:'#c69678',pattern:'planks'},{shape:'box',from:[.2,1.5,0],to:[1.8,1.9,.3],color:'#c69678',pattern:'planks'}],
    act:{label_en:'having a picnic',label_ja:'ピクニックをする',use_en:'Have a picnic',use_ja:'ピクニックをする',phrase_en:'Eating outside is the best!',phrase_ja:'外で食べるのは最高！',gain:{food:.35,social:.4,fun:.15}}},
  birdbath:{name_en:'bird bath',name_ja:'水のみ場',footprint:[1,1],near:'center',wish:J('小鳥が遊びに来るといいな。','I hope little birds come to visit.'),ex:['Look! A bird at the bird bath.','見て！水のみ場に小鳥がいるよ。'],
    parts:[{shape:'cylinder',from:[.3,.3,0],to:[.7,.7,.5],color:'#b6a4d6'},{shape:'cylinder',from:[.1,.1,.5],to:[.9,.9,.62],color:'#b6a4d6',top:'#88c2e2',topPattern:'water'}],
    act:{label_en:'watching the birds',label_ja:'小鳥を見る',use_en:'Watch the birds',use_ja:'小鳥を見る',phrase_en:'So cute!',phrase_ja:'かわいい！',gain:{fun:.25,energy:.1}}}
};
const growStructs=()=>genBuildings().filter(s=>s.by);
function smallSpec(k){const d=SMALLS[k];return sanitizeSpec({name_en:d.name_en,name_ja:d.name_ja,example_en:d.ex[0],example_ja:d.ex[1],footprint:d.footprint,near:d.near,parts:d.parts,activity:d.act})}
function growEvent(){return clock.sim<weather.rainbowUntil?'rainbow':clock.sim<weather.festUntil?'festival':weather.kind==='rain'?'rain':weather.kind==='snow'?'snow':null}
function offlinePlan(){
  const cand=people.filter(w=>!w.player&&!sleepTime(w));if(!cand.length)return null;const ev=growEvent();
  const have=new Set(genBuildings().map(s=>s.spec.name_en));let best=null,bs=-1;
  for(const w of cand){const n=w.needs;for(const k in SMALLS){if(have.has(SMALLS[k].name_en))continue;let s=Math.random()*.8;
    if(k==='swing')s+=(w.kid?2.5:0)+(w.likes.play||0)+(1-n.fun)*1.2;
    if(k==='lantern')s+=(ev==='festival'?2.2:0)+(clock.hour>16?.6:0);
    if(k==='flowerbed')s+=(w.likes.flower||0)*2+(ev==='rainbow'?1.8:0);
    if(k==='readnook')s+=(w.likes.bench||0)*2.2;
    if(k==='scarecrow')s+=(w.likes.field||0)*2.4;
    if(k==='picnic')s+=(1-n.social)*2+(1-n.food)*1.2+(ev==='festival'?1.2:0);
    if(k==='birdbath')s+=(w.likes.nap||0)+(w.likes.fish||0)*.8+(1-n.energy)*.6;
    if(s>bs){bs=s;best={k,w}}}}
  if(!best)return null;const d=SMALLS[best.k];
  return{action:'add',wisher:best.w.name,wish:d.wish,key:best.k,reason:ev};
}
function growPrompt(ev){
  const recent=logs.slice(-8).map(l=>`${l.t} ${l.p.en||tr(l.p)}`).join('\n')||'(quiet)';
  const wishes=people.map(w=>`- ${w.name} (${w.en}): likes ${Object.entries(w.likes).filter(([,v])=>v>.3).map(([k])=>k).join(', ')||'-'}; memories: ${(w.memory||[]).slice(-3).map(m=>m.replace(/^\d\d:\d\d /,'')).join(' / ')||'-'}${grow.wishes[w.name]?`; last wish: ${grow.wishes[w.name].en}`:''}`).join('\n');
  const made=genBuildings().length?genBuildings().map(s=>`${s.id}: ${s.spec.name_en}${s.by?` (made for ${s.by})`:''}`).join('\n'):'(none)';
  return `You are the gentle spirit of a cozy village diorama. The village grows slowly: small objects appear or change because villagers wish for them or because of what happened. Decide ONE small change right now, or none.

Now: day ${clock.day}, ${hhmm(clock.hour)}, weather ${weather.kind}${ev?`, event: ${ev}`:''}
Villagers:
${worldSummary()}
Their tastes and memories:
${wishes}
Recent happenings:
${recent}
Existing structures (id: name):
${made}
Landmarks: ${Object.keys(LANDMARKS).join(', ')}.

Rules: Keep changes small and charming (bench, swing, lamp, flower bed, scarecrow, sign, shrine, stall decoration, banner, garden furniture, a small pond ornament, mailbox...). Tie it to a real villager's wish, need, or the recent event, and do not repeat things that already exist. "add" = a new object (max 2x2 cells). "upgrade" = improve or redecorate one existing structure from the list (target = its id), e.g. new colors for the season, flowers, a lantern added, a bigger roof. Use "none" if nothing fits.
Reply with JSON only:
{"action":"add|upgrade|none","wisher":"ミノリ","wish_en":"I wish I had a quiet place to read.","wish_ja":"静かに本が読める場所がほしい。","brief":"English design brief: what, style, colors, size in cells (1-2), near which landmark","target":null,"log_en":"Minori's wish came true: a reading bench.","log_ja":"ミノリの願いで読書ベンチができた。"}`;
}
function revisePrompt(st,brief,wish){
  return buildPrompt(brief,wish,`This is an UPGRADE of an existing structure. Keep the same footprint ${st.spec.footprint.join('x')}, the same general identity and position, and make only a modest, charming change. Current design JSON:\n${JSON.stringify(st.spec)}\nReturn the complete revised design in the same JSON format (all parts).`,'a villager');
}
async function growthStep(){
  if(grow.busy)return;grow.busy=true;
  try{
    const ev=growEvent();let plan=null,spec=null,usedAI=false;
    if(sample){try{const r=await sample.json(growPrompt(ev),{modelTier:'default',cache:false});if(r&&typeof r==='object')plan=r,usedAI=true}catch(err){const c=err&&err.code;if(c==='not_granted'||c==='sampling_disabled')sample=null;if(c==='rate_limited'){grow.lastAt=clock.sim-12*HR;return}}}
    if(plan){if(!['add','upgrade','none'].includes(plan.action))plan=null;else if(plan.action==='none'){grow.lastAt=clock.sim-9*HR;return}}
    if(!plan){plan=offlinePlan();if(!plan){grow.lastAt=clock.sim-9*HR;return}}
    const w=byName(String(plan.wisher||''))||pick(people.filter(p=>!p.player));
    const wish=plan.key?plan.wish:J(String(plan.wish_ja||plan.wish_en||'').slice(0,60)||'何か変えたいな。',String(plan.wish_en||plan.wish_ja||'').slice(0,90)||'I want something new.');
    grow.wishes[w.name]={ja:wish.ja,en:wish.en,day:clock.day};say(w,wish,7);
    const gen=growStructs().length;
    if(plan.action==='upgrade'){
      const st=genBuildings().find(s=>s.id===String(plan.target));
      if(st&&usedAI&&sample){
        let ns=null;try{ns=sanitizeSpec(await sample.json(revisePrompt(st,String(plan.brief||'').slice(0,300),wish.en),{model:MODELS.build,modelTier:'default',cache:false}))}catch(err){}
        if(ns&&ns.footprint[0]===st.spec.footprint[0]&&ns.footprint[1]===st.spec.footprint[1]){
          const{cx,cy,id,by}=st,oldName=st.spec.name_ja;removeBuilding(id);ns.near=st.spec.near;const ns2=placeBuilding(ns,{x:cx,y:cy},id,true);ns2.by=by||w.name;ns2.wish=wish.ja;saveBuilds();
          finishGrowth(w,ns2,J(String(plan.log_ja||`${w.name}の願いで${oldName}が変わった`).slice(0,80),String(plan.log_en||`${w.en}'s wish changed the ${ns.name_en}.`).slice(0,100)),false);return}}
      plan.action='add'}
    if(plan.action==='add'){
      if(genBuildings().length>=MAX_GEN||gen>=14){grow.lastAt=clock.sim;return}
      if(plan.key)spec=smallSpec(plan.key);
      else if(sample&&usedAI){try{spec=sanitizeSpec(await sample.json(buildPrompt(String(plan.brief||'').slice(0,300),wish.en,'Keep it small: footprint at most 2x2 cells and 6-20 parts.','a villager'),{model:MODELS.build,modelTier:'default',cache:false}))}catch(err){}}
      if(!spec){plan=offlinePlan();if(!plan)return;spec=smallSpec(plan.key)}
      if(spec&&(spec.enterable||spec.footprint[0]>2||spec.footprint[1]>2))spec=null;
      if(!spec){plan=offlinePlan();if(!plan)return;spec=smallSpec(plan.key)}
      const pos=findSpot(spec);if(!pos){grow.lastAt=clock.sim-6*HR;return}
      const st=placeBuilding(spec,pos,null,true);st.by=w.name;st.wish=wish.ja;saveBuilds();
      finishGrowth(w,st,J(String(plan.log_ja||`${w.name}の願いで${spec.name_ja}ができた`).slice(0,80),String(plan.log_en||`${w.en}'s wish came true: a ${spec.name_en}.`).slice(0,100)),true)}
  }catch(e){}finally{grow.busy=false}
}
function finishGrowth(w,st,msg,isNew){
  grow.lastAt=clock.sim;grow.log.push({day:clock.day,ja:msg.ja,en:msg.en});if(grow.log.length>40)grow.log.shift();
  log(msg,'god-line');remember(w,'願いがかなった');
  const thanks=pick([J('わあ、ありがとう！','Thank you so much!'),J('うれしい！','I\'m so happy!'),J('ずっとほしかったんだ。','I wanted this for so long.')]);
  setTimeout(()=>{say(w,thanks,5);if(st.acts[0]&&!w.tile.stop&&!w.player){const p=planAct(w,st.acts[0]);if(p)w.forced=p}},2500);
  people.filter(o=>o!==w&&!o.player&&!sleepTime(o)).sort(()=>Math.random()-.5).slice(0,2).forEach(o=>say(o,J(`${st.spec.name_ja}だ！いいね！`,`A ${st.spec.name_en}! Nice!`),4));
  saveTown(false);renderTown();
}
function growthCheck(){
  if(grow.busy)return;
  const h=clock.hour;if(h<8||h>20)return;
  const ev=growEvent();const gap=(ev==='festival'||ev==='rainbow')?7*HR:18*HR;
  if(clock.sim-grow.lastAt<gap||Math.random()<.35)return;
  growthStep();
}

loadBuilds();
let started=false;
