// ================= Claude: god's voice & inner voice =================
const godForm=$('godForm'),godInput=$('godInput'),godSend=$('godSend');
const GOAL_IDS=[...ACT_IDS,'home','none'];
const MOODS=['happy','excited','calm','sad','scared','angry'];
function worldSummary(){
  return people.map(w=>{const n=w.needs;return`- ${w.name} (${w.en}) ${w.persona.en}${w.kid?' [child]':''} mood:${moodOf(w)} energy${n.energy.toFixed(1)} food${n.food.toFixed(1)} social${n.social.toFixed(1)} fun${n.fun.toFixed(1)} bladder${n.bladder.toFixed(1)} clean${n.hygiene.toFixed(1)} now:${statusOf(w).en} (${placeOf(w)})`}).join('\n')+`\n- タマ (Tama) the cat. now:${statusOf(cat).en}`;
}
// 町の建物でできること（神の声・会話の「行き先」に使える）
const townGoals=()=>ACT_IDS.filter(id=>ACTS[id].gen&&!ACTS[id].staff).map(id=>`${id} (${ACTS[id].label.en}${ACTS[id].who==='kid'?', kids':''})`).join(', ');
function godPrompt(text){
  return `You interpret the "Voice of God" in a cozy village life simulation. The player (God) spoke to the village from the sky. Decide how each villager reacts, based on personality and state. The player is learning English, so every line you write comes in simple everyday English (CEFR A2) AND natural Japanese.

Voice of God: "${text}"

Now: day ${clock.day}, ${hhmm(clock.hour)}, weather: ${weather.kind}${clock.sim<weather.festUntil?' (festival)':''}
Villagers:
${worldSummary()}

Built structures (id: name at cell):
${structSummary()}
Landmarks for placing things: ${Object.keys(LANDMARKS).join(', ')}.

Goal IDs. At home: sleep (go to bed), toilet, bath, brush (brush teeth), wash (wash face), cook, eat (at the dining table), snack (drink from the fridge), dishes, tv, rest (sofa), home (stay indoors). Outside: field, fish, well, nap (under a tree), chat, flower, bench, stall, play (tag), walk, plaza, dance. none = carry on.
Town places: ${townGoals()}.

Reply with JSON only, in this shape:
{"narration_en":"one short sentence describing the village","narration_ja":"同じ内容の日本語","weather":"clear|rain|snow|rainbow|null","event":"festival|null","timeSkipTo":null,"build":null,"remove":null,"villagers":[{"name":"ハナ","say_en":"short line in simple English","say_ja":"そのセリフの自然な日本語","mood":"happy|excited|calm|sad|scared|angry","goal":"goal ID","hours":2,"needs":{"energy":0,"food":0,"social":0,"fun":0,"bladder":0,"hygiene":0}}]}

Rules: include all ${people.length} villagers plus Tama (use the Japanese name as listed). Named villagers react strongly. Someone may hesitate or choose differently if the order doesn't fit them. Set weather only if the voice changes it, else null. If the voice moves time forward, set timeSkipTo to an hour 0-23, else null. needs are changes from -0.5 to 0.5. hours 0.5-6. Each say_en is at most 10 words of natural spoken English. Tama only makes cat sounds ("Meow!" / 「にゃー」).
If the voice asks to build, create, place or plant anything (a building, statue, fountain, tower, shrine, garden, playground, anything at all), set build to a clear English design brief: what it is, its style, main colors, rough size in cells (1-4 wide), and where (near which landmark). Villagers react to it with excitement or surprise. If the voice asks to remove or destroy a built structure, set remove to its id. Otherwise both are null.`;
}
function offlineInterpret(text){
  const t=text.toLowerCase();const has=(...k)=>k.some(x=>t.includes(x));
  const r={narration_ja:`空から「${text.slice(0,24)}」という声が響いた`,narration_en:`A voice from the sky said: "${text.slice(0,40)}"`,weather:null,event:null,timeSkipTo:null,villagers:[]};
  if(has('雨','rain'))r.weather='rain';if(has('雪','snow'))r.weather='snow';if(has('晴','sunny','clear'))r.weather='clear';if(has('虹','rainbow'))r.weather='rainbow';
  let goal=null,mood='excited',sayP=null;
  const G=[[['祭','踊','パーティ','festival','party','dance'],'dance',J('お祭りだ！','It\'s a festival!')],[['集ま','広場','plaza','gather'],'plaza',J('広場に行こう！','Let\'s go to the plaza!')],
    [['寝','sleep','bed'],'sleep',J('もう寝よう。','Time for bed.')],[['風呂','bath'],'bath',J('お風呂に入ろう。','Let\'s take a bath.')],[['トイレ','toilet','bathroom'],'toilet',J('トイレに行ってくる。','I\'ll go to the bathroom.')],
    [['歯','teeth'],'brush',J('歯をみがこう。','Let\'s brush our teeth.')],[['料理','作','cook'],'cook',J('料理しよう！','Let\'s cook!')],[['食べ','ごはん','eat','dinner','lunch','breakfast'],'eat',J('ごはんにしよう！','Let\'s eat!')],
    [['テレビ','tv'],'tv',J('テレビを見よう！','Let\'s watch TV!')],[['帰','家','home','house','inside'],'home',J('家に帰ろう。','Let\'s go home.')],[['畑','働','work','field'],'field',J('よし、ひと仕事だ。','OK, time to work.')],
    [['釣','魚','fish'],'fish',J('釣りに行こう。','Let\'s go fishing.')],[['花','flower'],'flower',J('お花に水をあげなきゃ。','I need to water the flowers.')],[['話','仲良','おしゃべり','talk','chat','friend'],'chat',J('誰かと話したいな。','I want to talk with someone.')],
    [['遊','走','鬼ごっこ','play','run'],'play',J('遊ぼう！','Let\'s play!')],[['勉強','学校','school','study'],'school.study',J('学校で勉強しよう。','Let\'s study at school.')],[['本','図書','read','library'],'school.read',J('本を読みに行こう。','Let\'s go read a book.')],[['音楽','歌','music','sing'],'school.music',J('歌おう！','Let\'s sing!')],
    [['レストラン','外食','restaurant'],'store.restaurant',J('レストランに行こう！','Let\'s go to the restaurant!')],[['デパート','洋服','department','clothes'],'store.shop_clothes',J('デパートに行こう。','Let\'s go to the department store.')],[['おもちゃ','toy'],'store.toys',J('おもちゃを見に行こう！','Let\'s go see the toys!')],
    [['買','店','屋台','shop','buy','stall'],'stall',J('屋台に行こう。','Let\'s go to the stall.')]];
  if(has('建て','作って','つくって','置いて','たてて','建設','build','make a','create','place','put a'))r.build=text;
  if(has('壊','撤去','なくして','remove','destroy','demolish')&&genBuildings().length){const s2=genBuildings().find(s=>text.includes(s.spec.name_ja)||t.includes(s.spec.name_en.toLowerCase()))||genBuildings().slice(-1)[0];r.remove=s2.id;r.build=null}
  if(!r.build&&!r.remove)for(const[keys,g,p]of G)if(has(...keys)){goal=g;sayP=p;if(g==='dance')r.event='festival';if(g==='sleep'||g==='home')mood='calm';break}
  if(!goal&&has('怒','雷','罰','angry','thunder')){mood='scared';sayP=J('ひえっ！','Yikes!')}
  if(has('夜','night'))r.timeSkipTo=20;else if(has('朝','morning'))r.timeSkipTo=7;else if(has('昼','noon'))r.timeSkipTo=12;
  const named=people.filter(w=>text.includes(w.name)||t.includes(w.en.toLowerCase()));
  walkers.forEach(w=>{const target=!named.length||named.includes(w);const p=w.kind==='cat'?J('にゃ？','Meow?'):target&&sayP?sayP:pick([J('いまの声は…？','What was that voice?'),J('空から声が！','A voice from the sky!'),J('なんだろう？','What is it?')]);
    r.villagers.push({name:w.name,say_en:p.en,say_ja:p.ja,mood:target?mood:'calm',goal:target?goal:null,hours:2.5})});
  return r;
}
function applyDivine(r,text){
  if(!r||typeof r!=='object')return;
  if(r.narration_en||r.narration_ja)log(J(String(r.narration_ja||r.narration_en).slice(0,70),String(r.narration_en||r.narration_ja).slice(0,90)),'god-line');
  const skip=Number(r.timeSkipTo);if(r.timeSkipTo!==null&&r.timeSkipTo!==undefined&&r.timeSkipTo!==''&&isFinite(skip)){const d=((clamp(Math.round(skip),0,23)-clock.hour)%24+24)%24;if(d>.2){clock.sim+=d*HR;clock.gh+=d;tickClock()}}
  if(r.weather==='rain'){setWeather('rain',3);log(J('雨が降りはじめた','It started to rain.'))}else if(r.weather==='snow'){setWeather('snow',4);log(J('雪が降りはじめた','It started to snow.'))}
  else if(r.weather==='clear'){weather.kind='clear'}else if(r.weather==='rainbow'){weather.kind='clear';weather.rainbowUntil=clock.sim+2*HR}
  if(r.build)buildFromVoice(String(r.build).slice(0,400),text);
  if(r.remove){const st=removeBuilding(String(r.remove));if(st)log(J(`${st.spec.name_ja}がなくなった`,`The ${st.spec.name_en} is gone.`),'god-line')}
  if(r.event==='festival'){weather.festUntil=clock.sim+8*HR;log(J('広場にお祭りの飾りが立った','Festival decorations went up in the plaza.'))}
  (Array.isArray(r.villagers)?r.villagers:[]).forEach(v=>{
    const w=byName(String(v.name||''));if(!w)return;
    const se=String(v.say_en||'').slice(0,80),sj=String(v.say_ja||'').slice(0,40);
    if(se||sj)say(w,{en:se||sj,ja:sj||se},8);
    if(w.player)return;
    if(w.needs){
      if(MOODS.includes(v.mood)){w.mood=v.mood;w.moodUntil=clock.sim+3*HR}
      if(v.needs&&typeof v.needs==='object')for(const k in w.needs){const d=Number(v.needs[k]);if(isFinite(d))w.needs[k]=clamp(w.needs[k]+clamp(d,-.5,.5),0,1)}
      remember(w,`神の声「${text.slice(0,20)}」を聞いた`);
      const g=String(v.goal||'none'),hrs=clamp(Number(v.hours)||2,.5,6);
      if(((ACTS[g]&&canDo(w,g))||g==='home')&&g!=='none'){
        w.directive={goal:g,until:clock.sim+hrs*HR};
        if(g==='home'){const p=planAct(w,pick(['tv','rest','snack']));if(p)w.forced=p}
        else if(g==='chat'){if(!w.link){w.act&&finishAct(w,true);w.path=[];w.goal=null;w.wait=0}}
        else{const p=planAct(w,g);if(p)w.forced=p}
      }
    }else if(w.kind==='cat'&&(v.goal==='home'||v.goal==='sleep')){w.forced={goal:{id:'catsleep',dur:[1,2]},target:(homes()[0].spots.rest||homes()[0].floor)[0]}}
  });
}
godForm.addEventListener('submit',async e=>{
  e.preventDefault();const text=godInput.value.trim();if(!text||godBusy)return;
  godInput.value='';godBusy=true;godSend.disabled=true;log(J(`神の声「${text}」`,`Voice of God: "${text}"`),'god-line');
  let r=null;
  if(sample){
    godSend.textContent=tr(UI.sending);
    try{r=await sample.json(godPrompt(text),{modelTier:'quick',cache:false})}
    catch(err){const c=err&&err.code;
      if(c==='not_granted'||c==='sampling_disabled'||c==='not_declared'||c==='capability_disabled'){sample=null;log(J('Claudeが使えないため、簡易解釈で動かします','Claude is not available, so a simple keyword reading was used.'))}
      else if(c==='rate_limited')log(J('声が届きにくいようです。少し待ってからもう一度','The voice could not get through. Wait a moment and try again.'));
      else log(J('うまく届かなかったので簡易解釈で反映しました','Something went wrong, so a simple keyword reading was used.'));
      if(c!=='rate_limited')r=offlineInterpret(text)}
  }else r=offlineInterpret(text);
  applyDivine(r,text);
  godBusy=false;godSend.disabled=false;godSend.textContent=tr(UI.send);
});
const TEMPLATE_THOUGHT={happy:J('今日はいい日だなあ。','What a nice day today.'),sad:J('なんだか元気が出ないな…','I feel a little down...'),tired:J('もうくたくた。早く休みたい。','I\'m so tired. I want to rest.'),calm:J('のんびりした一日だ。','It\'s a relaxing day.'),excited:J('わくわくしてきた！','I\'m so excited!'),scared:J('さっきの声、なんだったんだろう…','What was that voice just now...?'),angry:J('もう、ぷんぷんだよ！','I\'m really upset!')};
cThink.addEventListener('click',async()=>{
  const w=selected;if(!w)return;
  if(!sample){thought=w.kind==='cat'?J('（にゃーん。ごはんはまだかにゃ）','(Meow. Is it dinner time yet?)'):TEMPLATE_THOUGHT[moodOf(w)];addPhrase(thought);updateCard();return}
  thought={wait:true};updateCard();cThink.disabled=true;
  const n=w.needs,best=w.rel?Object.entries(w.rel).sort((a,b)=>b[1]-a[1])[0][0]:'';
  const prompt=w.kind==='cat'?`Write the inner voice of Tama, the village cat, right now. Now: ${statusOf(w).en}, ${hhmm(clock.hour)}, weather ${weather.kind}. Reply with JSON only: {"en":"1-2 short sentences in simple English, cat-like","ja":"同じ内容の自然な日本語、猫らしい語尾"}`
    :`Write the inner voice (first person, what they are thinking right now) of ${w.en} (${w.name}), a villager in a cozy village sim. The reader is learning everyday English, so use simple, natural spoken English (CEFR A2), 1-2 short sentences about this moment of daily life.
Personality: ${w.persona.en}${w.kid?' (a child)':''}
Time: day ${clock.day}, ${hhmm(clock.hour)}, weather ${weather.kind}${clock.sim<weather.festUntil?', festival':''}
Doing now: ${statusOf(w).en} (${placeOf(w)})
Mood: ${moodOf(w)} (energy ${n.energy.toFixed(1)}, full ${n.food.toFixed(1)}, social ${n.social.toFixed(1)}, fun ${n.fun.toFixed(1)}, bladder ${n.bladder.toFixed(1)}, clean ${n.hygiene.toFixed(1)}; 0-1)
Recent memories: ${w.memory.slice(-5).join(' / ')||'nothing special'}
Best friend: ${best}
Reply with JSON only: {"en":"the inner voice in English","ja":"同じ内容の自然な日本語"}`;
  try{const r=await sample.json(prompt,{model:MODELS.talk,modelTier:'quick',cache:false});if(selected===w){thought={en:String(r.en||''),ja:String(r.ja||'')};addPhrase(thought)}}
  catch(err){const c=err&&err.code;if(c==='not_granted'||c==='sampling_disabled')sample=null;if(selected===w)thought=c==='rate_limited'?J('いまは聞き取れない…少し待ってからもう一度。','I can\'t hear it right now. Try again in a moment.'):(w.kind==='cat'?J('（にゃーん）','(Meow.)'):TEMPLATE_THOUGHT[moodOf(w)])}
  cThink.disabled=false;updateCard();
});

