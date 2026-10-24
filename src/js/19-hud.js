// ================= HUD =================
const hhmm=h=>{const hh=Math.floor(h),mm=Math.floor((h-hh)*6)*10;return`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`};
const logs=[];
function log(p,cls){logs.push({t:hhmm(clock.hour),p,cls});if(logs.length>40)logs.shift();renderLog()}
function renderLog(){logEl.replaceChildren(...logs.slice(-3).map(l=>{const li=document.createElement('li');const tm=document.createElement('time');tm.textContent=l.t;li.append(tm,document.createTextNode(tr(l.p)));
  if(L==='en'&&l.p.ja&&l.p.en){const s=document.createElement('span');s.className='sub';s.textContent=l.p.ja;li.append(s)}if(l.cls)li.className=l.cls;li.title=tr(l.p);return li}))}
const $=id=>document.getElementById(id);
const rosterEl=$('roster'),dayEl=$('day'),timeEl=$('time'),periodEl=$('period'),wxEl=$('wx');
walkers.forEach(w=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed','false');
  const d=document.createElement('span');d.className='dot';d.style.background=rgb(w.cloak);const nm=document.createElement('span');b.append(d,nm);w.nameEl=nm;
  b.addEventListener('click',()=>select(selected===w?null:w));li.appendChild(b);rosterEl.appendChild(li);w.btn=b});
const card=$('card'),cName=$('cName'),cDot=$('cDot'),cMood=$('cMood'),cPersona=$('cPersona'),cStatus=$('cStatus'),cStatusJa=$('cStatusJa'),cNeeds=$('cNeeds'),cThink=$('cThink'),cFollow=$('cFollow'),cThought=$('cThought'),cSay=$('cSay');
const wordCard=$('wordCard');
let selected=null,thought=null;
function select(w){
  if(fpv.on){if(w&&w!==fpv.w)setControl(w);return}
  selected=w;walkers.forEach(o=>o.btn.setAttribute('aria-pressed',String(o===w)));
  if(w){wordCard.hidden=true;curWord=null}
  card.hidden=!w;logEl.hidden=!!w||!wordCard.hidden;thought=null;cThought.hidden=true;
  if(!w){cam.follow=null;cFollow.setAttribute('aria-pressed','false');return}
  if(!interior&&w.tile.indoor){interior=true;$('roofBtn').textContent=tr(UI.roofOn)}
  if(w.tile.indoor&&w.tile.bld&&w.tile.bld.floors>1)setViewFloor(w.tile.level);
  cDot.style.background=rgb(w.cloak);
  cNeeds.replaceChildren();cNeeds.hidden=!w.needs;
  if(w.needs)for(const k in NEED_T){const lab=document.createElement('span');lab.dataset.k=k;lab.className='nlab';const bar=document.createElement('span');bar.className='bar';const i=document.createElement('i');i.style.background=NEED_T[k][1];i.dataset.k=k;bar.append(i);cNeeds.append(lab,bar)}
  if(cam.follow)cam.follow=w;
  cFollow.setAttribute('aria-pressed',String(cam.follow===w));
  updateCard();
}
function updateCard(){if(!selected)return;const w=selected;const st=statusOf(w);const wi=typeof grow!=='undefined'&&grow.wishes[w.name];$('cWish').hidden=!wi;if(wi)$('cWish').textContent=`${tr(TUI.wish)}: ${tr(wi)}`;
  cName.textContent=nameOf(w);cPersona.textContent=tr(w.persona);
  cStatus.textContent=L==='en'?cap(st.en):st.ja;cStatusJa.textContent=L==='en'?st.ja:'';cStatusJa.hidden=L!=='en';cSay.hidden=L!=='en'||!canSpeak;
  cMood.textContent=w.needs?tr(MOOD_T[moodOf(w)]):'';
  cNeeds.querySelectorAll('.nlab').forEach(s=>{s.textContent=tr(NEED_T[s.dataset.k][0])});
  cNeeds.querySelectorAll('i').forEach(i=>{i.style.width=Math.round(w.needs[i.dataset.k]*100)+'%'});
  if(thought){cThought.hidden=false;cThought.replaceChildren();if(thought.wait){cThought.textContent=tr(UI.listening)}else{const a=document.createElement('span');a.textContent=L==='en'?(thought.en||thought.ja):(thought.ja||thought.en);cThought.append(a);
    if(L==='en'&&thought.ja&&thought.en){const s=document.createElement('span');s.className='ja-sub';s.textContent=thought.ja;cThought.append(s);if(canSpeak){const b=document.createElement('button');b.className='say-btn';b.type='button';b.textContent='🔊';b.style.marginTop='6px';b.onclick=()=>speak(thought.en);cThought.append(b)}}}}
}
$('cClose').addEventListener('click',()=>select(null));
cSay.addEventListener('click',()=>{if(selected)speak(cap(statusOf(selected).en))});
cFollow.addEventListener('click',()=>{if(!selected)return;if(cam.follow===selected){cam.follow=null;cam.tzoom=1}else{cam.follow=selected;cam.tzoom=Math.max(cam.tzoom,2.2)}cFollow.setAttribute('aria-pressed',String(cam.follow===selected))});
let curWord=null;
function openWord(v){select(null);curWord=v;wordCard.hidden=false;logEl.hidden=true;$('wWord').textContent=v.word;$('wJa').textContent=v.ja;$('wEx').textContent=v.ex;$('wExJa').textContent=v.exja;$('wSay').hidden=!canSpeak;$('wExSay').hidden=!canSpeak;addPhrase({en:v.ex,ja:v.exja});if(L==='en')speak(v.word)}
$('wClose').addEventListener('click',()=>{wordCard.hidden=true;logEl.hidden=false;curWord=null});
$('wSay').addEventListener('click',()=>curWord&&speak(curWord.word));$('wExSay').addEventListener('click',()=>curWord&&speak(curWord.ex));
let book=[];try{const s=JSON.parse(localStorage.getItem('hakoniwa-book')||'[]');if(Array.isArray(s))book=s.filter(p=>p&&p.en&&p.ja).slice(0,300)}catch(e){}
let bookDirty=false;
function addPhrase(p){if(!p||!p.en||!p.ja)return;const i=book.findIndex(b=>b.en===p.en);if(i>=0){if(i>0){const[b]=book.splice(i,1);book.unshift(b)}return}book.unshift({en:p.en,ja:p.ja});if(book.length>300)book.pop();bookDirty=true;$('bookN').textContent=book.length;if(!$('book').hidden)renderBook()}
setInterval(()=>{if(bookDirty){bookDirty=false;try{localStorage.setItem('hakoniwa-book',JSON.stringify(book))}catch(e){}}},3000);
function renderBook(){const ul=$('bookList');ul.replaceChildren();if(!book.length){const li=document.createElement('li');li.textContent=tr(UI.bookEmpty);ul.append(li);return}
  book.forEach(p=>{const li=document.createElement('li'),d=document.createElement('div'),b=document.createElement('b'),s=document.createElement('span');b.textContent=p.en;s.textContent=p.ja;d.append(b,s);li.append(d);
    if(canSpeak){const btn=document.createElement('button');btn.className='say-btn';btn.type='button';btn.textContent='🔊';btn.setAttribute('aria-label','Listen');btn.onclick=()=>speak(p.en);li.append(btn)}ul.append(li)})}
$('bookBtn').addEventListener('click',()=>{const bk=$('book');bk.hidden=!bk.hidden;if(!bk.hidden)renderBook()});
$('bookClose').addEventListener('click',()=>{$('book').hidden=true});
$('bookN').textContent=book.length;

function updateHud(){
  const h=clock.hour;dayEl.textContent=L==='en'?`Day ${clock.day} (${WEEK[weekday()].en})`:`${clock.day}日目（${WEEK[weekday()].ja}）`;timeEl.textContent=hhmm(h);
  periodEl.textContent=tr(h<4.5?J('夜','Night'):h<10?J('朝','Morning'):h<16?J('昼','Daytime'):h<19?J('夕方','Evening'):J('夜','Night'));
  wxEl.textContent=(clock.sim<weather.festUntil?tr(J('お祭り・','Festival · ')):'')+tr(WX_T[weather.kind]);
  updateCard();
}
const speeds=[1,3,8];let speedI=0;const speedBtn=$('speed');
let sample=null,godBusy=false;
function applyLang(){
  document.documentElement.lang=L;
  $('langBtn').textContent=tr(UI.lang);const lb=$('labelBtn');lb.hidden=L!=='en';lb.textContent=showLabels?'Labels: On':'Labels: Off';lb.setAttribute('aria-pressed',String(showLabels));$('bookLbl').textContent=tr(UI.book);$('bookTitle').textContent=tr(UI.book);$('bookNote').textContent=tr(UI.bookNote);
  $('godLbl').textContent=tr(UI.god);$('godInput').placeholder=tr(UI.ph);if(!godBusy)$('godSend').textContent=tr(UI.send);
  $('hint').textContent=tr(UI.hint);cThink.textContent=tr(UI.think);$('cPlay').textContent=tr(UI.play);if(fpv.on)applyFpvLang();cFollow.textContent=tr(UI.follow);$('wExSay').textContent=tr(UI.exSay);
  $('roofBtn').textContent=tr(interior?UI.roofOn:UI.roofOff);updateFloorBtn();speedBtn.textContent=`${tr(UI.speed)} ×${clock.speed}`;$('reset').textContent=tr(UI.reset);
  walkers.forEach(w=>{w.nameEl.textContent=nameOf(w)});
  renderLog();updateHud();if(!$('book').hidden)renderBook();if(typeof renderTown==='function')renderTown();
  try{localStorage.setItem('hakoniwa-lang',L)}catch(e){}
  requestAnimationFrame(()=>fit());
}
$('labelBtn').addEventListener('click',()=>{showLabels=!showLabels;try{localStorage.setItem('hakoniwa-labels',showLabels?'1':'0')}catch(e){}applyLang()});
$('langBtn').addEventListener('click',()=>{L=L==='ja'?'en':'ja';applyLang()});
speedBtn.addEventListener('click',()=>{speedI=(speedI+1)%speeds.length;clock.speed=speeds[speedI];speedBtn.textContent=`${tr(UI.speed)} ×${clock.speed}`});
$('roofBtn').addEventListener('click',()=>{interior=!interior;$('roofBtn').textContent=tr(interior?UI.roofOn:UI.roofOff);if(!interior&&selected&&selected.tile.indoor)select(null);updateFloorBtn()});
// 2階建て以上の建物がある時だけ、内観で見る階を切りかえるボタンを出す
const maxFloors=()=>Math.max(1,...buildings.map(b=>b.floors));
function setViewFloor(n){viewFloor=clamp(n,0,maxFloors()-1);updateFloorBtn()}
function updateFloorBtn(){const b=$('floorBtn'),m=maxFloors();if(viewFloor>m-1)viewFloor=m-1;b.hidden=!interior||m<2;b.textContent=tr(UI.floor(viewFloor+1));b.title=tr(UI.floorTip);b.setAttribute('aria-label',tr(UI.floorTip)+': '+tr(UI.floor(viewFloor+1)))}
$('floorBtn').addEventListener('click',()=>setViewFloor((viewFloor+1)%maxFloors()));
$('reset').addEventListener('click',()=>{cam.taz=ISO_AZ;cam.tel=ISO_EL;cam.tzoom=1;cam.follow=null;cFollow.setAttribute('aria-pressed','false')});
$('zoomIn').addEventListener('click',()=>{cam.tzoom=clamp(cam.tzoom*1.35,.7,ZOOM_MAX)});
$('zoomOut').addEventListener('click',()=>{cam.tzoom=clamp(cam.tzoom/1.35,.7,ZOOM_MAX)});

