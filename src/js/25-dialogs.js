// ================= scene dialogues (English conversation practice) =================
// 住人が店・学校・家などで行動を始めた時に、その場面でよく使うやり取りを吹き出しとカードで見せる。
// 相手（店員・先生・友だち）が近くにいればその人が話し、いなければ「店員：」のように役名つきで本人の横に出す。
// 会話は定番の文例（オフラインでも動く）に加え、Claude（Haiku）で新しく作ったものを保存して使い回す。
// ライン: [話す人(0/1), 英語, 日本語]。0 が相手役、1 が行動している本人。
const R=(ja,en,o={})=>({ja,en,...o});
const SCENES={
  'store.buy_food':{where:J('デパートの食品売り場','At the food hall'),roles:[R('店員','Clerk',{staff:'store.work'}),R('客','Customer')],
    topics:['asking where something is','asking the price','paying and bags','asking about a sale','asking for a recommendation','buying for a party'],
    lines:[
      {d:[[1,'Excuse me, where can I find the milk?','すみません、牛乳はどこにありますか？'],[0,'It\'s in the back, next to the eggs.','奥の、卵の隣にありますよ。'],[1,'Thank you. Is it on sale today?','ありがとう。今日は特売ですか？'],[0,'Yes, it\'s 20% off today.','はい、今日は2割引きです。'],[1,'Great, I\'ll take two.','よかった、2本ください。']],key:['Where can I find ...?','「…はどこにありますか？」お店で場所を聞く定番']},
      {d:[[0,'Did you find everything you need?','お探しのものは見つかりましたか？'],[1,'Yes, thanks. Just these, please.','はい、ありがとう。これだけお願いします。'],[0,'That\'s 850 yen. Do you need a bag?','850円です。袋はご入用ですか？'],[1,'No, thanks. I have my own bag.','いいえ、マイバッグがあります。'],[0,'Thank you. Have a nice day!','ありがとうございます。よい一日を！']],key:['Do you need a bag?','レジでよく聞かれる「袋はいりますか？」']},
      {d:[[1,'How much are these strawberries?','このいちご、いくらですか？'],[0,'They\'re 400 yen a pack.','1パック400円です。'],[1,'They look really fresh.','とても新鮮そうですね。'],[0,'They just came in this morning.','今朝入荷したばかりなんです。'],[1,'OK, I\'ll take one pack.','じゃあ、1パックください。']],key:['How much are ...?','値段を聞く「…はいくらですか？」']}]},
  'store.shop_clothes':{where:J('デパートの洋服売り場','At the clothing floor'),roles:[R('店員','Clerk',{staff:'store.work'}),R('客','Customer')],
    topics:['trying something on','asking for another size','asking for another color','looking for a gift','asking about the price','just looking'],
    lines:[
      {d:[[0,'Can I help you find anything?','何かお探しですか？'],[1,'I\'m looking for a warm sweater.','暖かいセーターを探しています。'],[0,'How about this one? It comes in blue and gray.','こちらはいかがですか？青とグレーがあります。'],[1,'Can I try it on?','試着してもいいですか？'],[0,'Sure. The fitting room is over there.','どうぞ。試着室はあちらです。']],key:['Can I try it on?','「試着してもいいですか？」']},
      {d:[[1,'Do you have this in a smaller size?','これの小さいサイズはありますか？'],[0,'Let me check. Here\'s a medium.','確認しますね。こちらがMサイズです。'],[1,'Perfect. It fits well.','ぴったり。よく合います。'],[0,'It looks great on you!','とてもお似合いです！'],[1,'Thanks. I\'ll take it.','ありがとう。これにします。']],key:['It looks great on you.','「よくお似合いです」']},
      {d:[[0,'Hello! Are you looking for anything special?','いらっしゃいませ。何かお探しですか？'],[1,'No, I\'m just looking, thanks.','いえ、見ているだけです。'],[0,'Sure. Let me know if you need help.','どうぞ。何かあればお声がけください。'],[1,'Thank you, I will.','ありがとう、そうします。']],key:['I\'m just looking.','「見ているだけです」店員さんへの返事']}]},
  'store.toys':{where:J('デパートのおもちゃ売り場','At the toy shop'),roles:[R('店員','Clerk',{staff:'store.work'}),R('子ども','Kid')],
    topics:['trying a toy','looking for a present','asking the price','a new toy','saving money for a toy'],
    lines:[
      {d:[[1,'Wow, can I touch this robot?','わあ、このロボット触ってもいい？'],[0,'Of course. Press the red button.','もちろん。赤いボタンを押してみて。'],[1,'It\'s dancing! So cool!','踊ってる！かっこいい！'],[0,'It\'s our most popular toy.','一番人気のおもちゃなんですよ。'],[1,'I\'ll ask my mom for my birthday.','誕生日にお母さんにお願いしよう。']],key:['Can I touch this?','「さわってもいい？」許可をもらう']},
      {d:[[0,'Are you looking for a present?','プレゼントを探しているの？'],[1,'Yes, for my friend. She likes puzzles.','うん、友だちに。パズルが好きなんだ。'],[0,'This puzzle has 100 pieces.','このパズルは100ピースだよ。'],[1,'That\'s perfect. How much is it?','ちょうどいい。いくら？'],[0,'It\'s 1,200 yen.','1200円だよ。']],key:['I\'m looking for a present.','「プレゼントを探しています」']}]},
  'store.restaurant':{where:J('デパートのレストラン','At the restaurant'),roles:[R('店員','Waiter',{staff:'store.work'}),R('客','Customer')],
    topics:['being seated','ordering food','asking for a recommendation','asking for the check','ordering a drink','asking about allergies'],
    lines:[
      {d:[[0,'Welcome! How many people?','いらっしゃいませ。何名様ですか？'],[1,'Just one, please.','一人です。'],[0,'Here\'s the menu. Are you ready to order?','メニューです。ご注文はお決まりですか？'],[1,'I\'ll have the curry rice, please.','カレーライスをお願いします。'],[0,'Sure. Anything to drink?','かしこまりました。お飲み物は？'],[1,'Just water, thanks.','水でお願いします。']],key:['I\'ll have ..., please.','注文の定番「…をお願いします」']},
      {d:[[1,'Excuse me, what do you recommend?','すみません、おすすめは何ですか？'],[0,'Our omelet rice is very popular.','オムライスがとても人気です。'],[1,'Sounds good. I\'ll try it.','いいですね。それにします。'],[0,'It\'ll be ready in ten minutes.','10分ほどでお持ちします。']],key:['What do you recommend?','「おすすめは何ですか？」']},
      {d:[[1,'Could I have the check, please?','お会計をお願いします。'],[0,'Sure. That\'s 980 yen.','はい、980円です。'],[1,'Can I pay by card?','カードで払えますか？'],[0,'Yes, of course.','はい、もちろんです。'],[1,'It was delicious. Thank you!','おいしかったです。ありがとう！']],key:['Could I have the check, please?','「お会計をお願いします」']}]},
  stall:{where:J('屋台','At the fruit stall'),roles:[R('店主','Shopkeeper',{keeper:true}),R('客','Customer')],
    topics:['buying fruit','asking what is good today','asking for a discount','trying a sample'],
    lines:[
      {d:[[0,'Welcome! Fresh apples today!','いらっしゃい！今日は新鮮なりんごだよ！'],[1,'How much are they?','いくらですか？'],[0,'Three for 300 yen.','3個で300円。'],[1,'I\'ll take three, please.','3個ください。'],[0,'Here you go. Thank you!','はい、どうぞ。ありがとう！']],key:['Here you go.','物を手わたす時の「はい、どうぞ」']},
      {d:[[1,'What\'s good today?','今日のおすすめは？'],[0,'The peaches are really sweet.','桃がとっても甘いよ。'],[1,'Can I try one?','味見してもいい？'],[0,'Sure, here\'s a piece.','いいよ、はい一切れ。'],[1,'Mmm, delicious! I\'ll take two.','んー、おいしい！2個ください。']],key:['Can I try one?','「味見してもいい？」']}]},
  'school.study':{where:J('学校の教室','In the classroom'),roles:[R('先生','Teacher',{staff:'school.teach'}),R('生徒','Student')],
    topics:['forgetting something','answering a question','asking what a word means','homework','starting the lesson','going to the restroom'],
    lines:[
      {d:[[0,'Good morning. Please open your textbooks to page 12.','おはよう。教科書の12ページを開いてください。'],[1,'Excuse me, I forgot my textbook.','すみません、教科書を忘れました。'],[0,'That\'s OK. Share with your neighbor today.','大丈夫。今日は隣の人に見せてもらってね。'],[1,'Thank you, I will.','ありがとうございます、そうします。']],key:['I forgot my ...','「…を忘れました」']},
      {d:[[0,'Does anyone know the answer?','答えがわかる人はいますか？'],[1,'Is it seven?','7ですか？'],[0,'That\'s right! Good job.','正解！よくできました。'],[1,'Yay! Math is fun.','やった！算数って楽しい。']],key:['That\'s right!','「その通り！正解！」']},
      {d:[[1,'Can I ask a question?','質問してもいいですか？'],[0,'Of course. What is it?','もちろん。何ですか？'],[1,'What does this word mean?','この言葉はどういう意味ですか？'],[0,'It means "very happy."','「とても幸せ」という意味ですよ。'],[1,'I see. Thank you!','なるほど。ありがとうございます！']],key:['What does this word mean?','「この言葉はどういう意味ですか？」']}]},
  'school.lunch':{where:J('給食の時間','At school lunch'),roles:[R('友だち','Friend',{same:true}),R('生徒','Student')],
    topics:['today\'s menu','passing food','favorite foods','not liking vegetables','plans after school'],
    lines:[
      {d:[[0,'What\'s for lunch today?','今日の給食は何？'],[1,'Curry and salad, I think.','カレーとサラダだと思う。'],[0,'Yes! I love curry.','やった！カレー大好き。'],[1,'Me too. Let\'s eat!','わたしも。いただきます！']],key:['What\'s for lunch?','「お昼は何？」']},
      {d:[[1,'Can you pass me the milk?','牛乳とってくれる？'],[0,'Sure, here you go.','いいよ、はい。'],[1,'Thanks. Do you want my carrots?','ありがとう。にんじんいる？'],[0,'No way! Eat your vegetables!','だめだよ！野菜も食べなきゃ！']],key:['Can you pass me ...?','「…をとってくれる？」']}]},
  'school.read':{where:J('図書室','In the library'),roles:[R('友だち','Friend',{same:true}),R('読書中の人','Reader')],
    topics:['recommending a book','borrowing a book','finding a book','being quiet in the library'],
    lines:[
      {d:[[0,'What are you reading?','何を読んでるの？'],[1,'A mystery story. It\'s really exciting.','推理小説。すごくおもしろいよ。'],[0,'Can I borrow it after you?','読み終わったら貸してくれる？'],[1,'Sure. I\'ll finish it today.','いいよ。今日中に読み終わるから。']],key:['Can I borrow it?','「借りてもいい？」']},
      {d:[[1,'Excuse me, where are the picture books?','すみません、絵本はどこですか？'],[0,'They\'re on the bottom shelf.','いちばん下の棚にありますよ。'],[1,'Thank you. How many can I borrow?','ありがとう。何冊借りられますか？'],[0,'Up to three books for two weeks.','3冊まで、2週間借りられます。']],key:['How many can I borrow?','「何冊借りられますか？」']}]},
  'school.music':{where:J('音楽室','In the music room'),roles:[R('友だち','Friend',{same:true}),R('演奏する人','Player')],
    topics:['playing the piano','singing a song','practicing for a concert','favorite songs'],
    lines:[
      {d:[[0,'Can you play the piano?','ピアノ弾ける？'],[1,'A little. I\'m still practicing.','少しだけ。まだ練習中なんだ。'],[0,'Play something for me!','何か弾いて！'],[1,'OK, but don\'t laugh!','いいよ、でも笑わないでね！']],key:['I\'m still practicing.','「まだ練習中です」']},
      {d:[[1,'Let\'s sing together!','一緒に歌おう！'],[0,'Sure. Which song?','いいね。どの歌？'],[1,'How about the one we learned yesterday?','昨日習ったのはどう？'],[0,'Good idea. One, two, three!','いいね。いち、に、さん！']],key:['How about ...?','提案する「…はどう？」']}]},
  eat:{where:J('家の食卓','At the dinner table'),roles:[R('家族','Family',{family:true}),R('自分','Me')],
    topics:['the taste of the food','asking for more','talking about the day','table manners','tomorrow\'s plans'],
    lines:[
      {d:[[0,'This looks delicious!','おいしそう！'],[1,'Thanks. I tried a new recipe.','ありがとう。新しいレシピを試したの。'],[0,'Can I have some more rice?','ごはんおかわりしてもいい？'],[1,'Sure, help yourself.','もちろん、どうぞ。']],key:['Help yourself.','「ご自由にどうぞ」食事をすすめる']},
      {d:[[1,'How was your day?','今日はどうだった？'],[0,'It was busy, but good.','忙しかったけど、よかったよ。'],[1,'That\'s nice. Eat a lot!','よかったね。たくさん食べてね！'],[0,'Thanks for the meal!','いただきます！']],key:['How was your day?','「今日はどうだった？」']}]},
  fish:{where:J('池のほとり','By the pond'),roles:[R('友だち','Friend',{same:true}),R('釣り人','Angler')],
    topics:['catching a fish','waiting patiently','the best bait','the weather for fishing'],
    lines:[
      {d:[[0,'Catching anything?','何か釣れた？'],[1,'Not yet. The fish are shy today.','まだ。今日は魚が恥ずかしがり屋みたい。'],[0,'Be patient. They\'ll come.','気長に待とう。きっと来るよ。'],[1,'Oh! I think I got one!','あっ！かかったかも！']],key:['Not yet.','「まだだよ」']}]},
  // 住人どうしのおしゃべり（二人とも実際にその場にいる）
  chat:{where:J('おしゃべり','A chat'),roles:[R('友だち','Friend'),R('友だち','Friend')],both:true,
    topics:['weekend plans','the weather','a new place in town','feeling tired','a favorite food','a hobby','something funny that happened','a plan to meet later'],
    lines:[
      {d:[[1,'Hi! How\'s it going?','やあ！調子はどう？'],[0,'Pretty good. How about you?','まあまあだよ。きみは？'],[1,'Not bad. Any plans for the weekend?','悪くないよ。週末の予定は？'],[0,'I might go fishing. Want to come?','釣りに行くかも。一緒に来る？'],[1,'Sure, sounds fun!','いいね、楽しそう！']],key:['How\'s it going?','あいさつの「調子どう？」']},
      {d:[[1,'Nice weather today, isn\'t it?','今日はいい天気だね。'],[0,'Yes, it\'s perfect for a walk.','うん、散歩にぴったりだね。'],[1,'Let\'s go to the plaza later.','あとで広場に行こうよ。'],[0,'Good idea. See you there!','いいね。じゃあ向こうでね！']],key:['..., isn\'t it?','「…だよね」同意を求める言い方']},
      {d:[[1,'Have you been to the new restaurant?','新しいレストランに行った？'],[0,'Not yet. Is it good?','まだ。おいしい？'],[1,'Yes! The omelet rice is amazing.','うん！オムライスが最高。'],[0,'I\'ll try it tomorrow.','明日行ってみる。']],key:['Have you been to ...?','「…に行ったことある？」']},
      {d:[[1,'You look tired. Are you OK?','疲れてるみたい。大丈夫？'],[0,'I stayed up late last night.','昨日夜ふかししちゃって。'],[1,'You should go to bed early tonight.','今夜は早く寝たほうがいいよ。'],[0,'You\'re right. Thanks.','そうだね。ありがとう。']],key:['You should ...','「…したほうがいいよ」アドバイス']}]},
  // 神の声で建った建物の行動（{en} / {ja} に建物の名前が入る）
  gen:{where:null,roles:[R('友だち','Friend',{same:true}),R('訪れた人','Visitor')],
    topics:['visiting for the first time','what they like about the place','coming again with friends','what to do there'],
    lines:[
      {d:[[0,'Have you been to the {en} before?','{ja}に来たことある？'],[1,'No, this is my first time.','ううん、初めて。'],[0,'It\'s really nice here.','ここ、すごくいいよ。'],[1,'I can see why everyone likes it.','みんなが好きなのもわかるね。']],key:['This is my first time.','「初めてです」']},
      {d:[[1,'What do you like about the {en}?','{ja}のどこが好き？'],[0,'It\'s quiet and relaxing.','静かでくつろげるところ。'],[1,'Let\'s come again next week.','来週また来よう。'],[0,'Sure, I\'d love to.','うん、ぜひ。']],key:['I\'d love to.','誘いへの返事「ぜひ」']}]},
};
const sceneOf=id=>SCENES[id]||(ACTS[id]&&ACTS[id].gen&&id!=='chat'&&!ACTS[id].staff?SCENES.gen:null);

// ---------- Claude で新しい会話を作る ----------
// 毎回同じ指示はキャッシュに載せる（system）。変わる部分（場面・人・時刻・話題・使用済みの出だし）だけを user に入れる。
const DIALOG_SYS=`You write short spoken English dialogues for Japanese learners of English, shown inside a cozy town life simulation game. Each dialogue happens in a specific everyday scene between two people.

Goals:
- Teach expressions people really use in that situation: set phrases a learner can reuse right away (asking for help, ordering, paying, asking for a size, asking permission, giving advice, agreeing, thanking, greeting, saying goodbye).
- Level: CEFR A2 to B1. Natural spoken English, contractions are fine, no slang that would confuse a learner.
- 4 to 6 lines. Speakers alternate. Each line is one or two short sentences, at most 14 words.
- Fit the scene, the roles, the time of day and the weather you are given. Children speak like children. Staff are polite; friends and family are casual.
- Every line has a natural Japanese translation in the register a Japanese speaker would use in that situation (店員は丁寧語、友だちや家族はくだけた言い方).
- Pick one key phrase from the dialogue that is most useful to remember, and explain in short Japanese when to use it.
- Make each dialogue feel fresh: follow the requested topic and tone, and do not reuse the openings you are told are already used.

Useful patterns by situation (use them naturally, do not copy them all):
- Shops: "Can I help you find anything?", "I'm just looking.", "Do you have this in ...?", "How much is ...?", "Can I try it on?", "Do you need a bag?", "I'll take it.", "Here's your receipt."
- Restaurants: "How many people?", "Are you ready to order?", "I'll have ..., please.", "What do you recommend?", "Could I have the check, please?", "Can I pay by card?"
- School: "Can I ask a question?", "What does ... mean?", "I forgot my ...", "May I go to the restroom?", "That's right!", "Let's start today's lesson."
- Home and friends: "How was your day?", "Can you pass me ...?", "Help yourself.", "Any plans for the weekend?", "You should ...", "Sounds good!", "See you later!"

Output JSON only, in this shape:
{"lines":[{"who":0,"en":"...","ja":"..."},{"who":1,"en":"...","ja":"..."}],"key":{"en":"the key phrase","ja":"いつ使うかの短い説明"}}
"who" is 0 or 1 and refers to the two speakers described in the request.`;
const TONES=['friendly and relaxed','a little busy','cheerful','polite and calm','slightly funny','curious'];
function dialogPrompt(c){
  const who=(r,w)=>w?`${w.en} (${w.persona.en}${w.kid?' a child':''})`:`a ${r.en.toLowerCase()} (no name)`;
  const used=c.lib.slice(0,10).map(d=>`- "${d.d[0][1]}"`).join('\n')||'- (none yet)';
  return `Scene: ${c.where.en}${c.bld?` (${c.bld.spec.name_en}${c.room?', '+c.room:''})`:''}. ${c.sceneNote||''}
Speaker 0 is the ${c.roles[0].en}: ${who(c.roles[0],c.sp[0])}.
Speaker 1 is the ${c.roles[1].en}: ${who(c.roles[1],c.sp[1])}.
Time: ${WEEK[weekday()].en} ${hhmm(clock.hour)}, weather: ${weather.kind}${clock.sim<weather.festUntil?', festival day':''}. Speaker 1 feels ${moodOf(c.actor)}.
Topic for this dialogue: ${c.topic}. Tone: ${c.tone}.
Openings already used in this scene (do not reuse them or the same situation):
${used}`;
}
function sanitizeDialog(r){
  if(!r||!Array.isArray(r.lines))return null;
  const d=r.lines.slice(0,8).map(l=>l&&[l.who===0||l.who==='0'?0:1,str(l.en,140),str(l.ja,90)]).filter(l=>l&&l[1]&&l[2]);
  if(d.length<3||!d.some(l=>l[0]===0)||!d.some(l=>l[0]===1))return null;
  const k=r.key&&r.key.en?[str(r.key.en,80),str(r.key.ja,80)]:null;
  return{d,key:k,ai:true};
}

// ---------- 保存（作った会話は使い回してトークンを節約する） ----------
const DLG_STORE='hakoniwa-dialogs',DLG_MAX=16;
let dlgSaved={};try{const s=JSON.parse(localStorage.getItem(DLG_STORE)||'{}');if(s&&typeof s==='object')dlgSaved=s}catch(e){}
const saveDialogs=()=>{try{localStorage.setItem(DLG_STORE,JSON.stringify(dlgSaved))}catch(e){}};
function libraryOf(id,sc){
  const saved=(dlgSaved[id]||[]).map(x=>sanitizeDialog(x)).filter(Boolean);
  return saved.concat(sc.lines);
}

// ---------- 再生 ----------
const dlg={cur:null,lastEnd:-99,genLast:-99,genCount:0,recent:{}};
const DLG_LINE=3.6;
// 相手役を探す: 働いている店員・先生、屋台の店主、同じ場所の友だち・家族。いなければ null（役名だけで見せる）
function findPartner(role,actor,id){
  const near=o=>o!==actor&&o.kind==='person'&&!o.player&&!o.link;
  const sameBld=o=>(o.tile.bld||null)===(actor.tile.bld||null)&&o.tile.level===actor.tile.level;
  const d=o=>Math.abs(o.tile.pos[0]-actor.tile.pos[0])+Math.abs(o.tile.pos[1]-actor.tile.pos[1]);
  let c=[];
  if(role.staff)c=people.filter(o=>near(o)&&o.act&&o.act.id===role.staff&&sameBld(o));
  else if(role.keeper)c=people.filter(o=>near(o)&&o.keeper&&o.act&&o.act.id==='stall');
  else if(role.family)c=people.filter(o=>near(o)&&o.house===actor.house&&o.tile.bld===actor.house);
  else if(role.same)c=people.filter(o=>near(o)&&sameBld(o)&&d(o)<=5&&(o.act&&(o.act.id===id||o.act.id==='chat')||!o.act));
  return c.sort((a,b)=>d(a)-d(b))[0]||null;
}
const nameIn=(r,w)=>w?(L==='en'?`${r.en} ${w.en}`:`${r.ja} ${w.name}`):(L==='en'?r.en:r.ja);
function fillName(s,bld){return bld?s.replace(/\{en\}/g,bld.spec.name_en).replace(/\{ja\}/g,bld.spec.name_ja):s}
// 見ている人の近くの出来事か（会話は見える場所のものだけ流す）
function inView(w){
  if(fpv.on)return!!fpv.w&&w!==fpv.w&&Math.hypot(w.tile.pos[0]-fpv.w.tile.pos[0],w.tile.pos[1]-fpv.w.tile.pos[1])<7;
  if(selected===w||cam.follow===w)return true;
  if(hiddenW(w))return false;
  const p=project(walkerPos(w));return p[0]>40&&p[0]<S.width-40&&p[1]>80&&p[1]<S.height-60;
}
// 行動を始めた時に呼ぶ。force は「会話を聞く」ボタンから
function maybeDialog(w,id,o={}){
  const sc=sceneOf(id);if(!sc||dlg.cur)return false;
  if(!o.force){if(S.time-dlg.lastEnd<14||!inView(w))return false;if(Math.random()>(sc.both?.35:.55))return false}
  const bld=w.tile.bld||null,room=bld&&w.tile.room&&bld.roomCenters[w.tile.room]?bld.roomCenters[w.tile.room].name.en:'';
  const sp=sc.both?[o.partner||null,w]:[findPartner(sc.roles[0],w,id),w];
  if(sc.both&&!sp[0])return false;
  const where=sc.where||J(bld?`${bld.spec.name_ja}で`:'ここで',bld?`At the ${bld.spec.name_en}`:'Here');
  const lib=libraryOf(id,sc);
  const c={id,sc,where,roles:sc.roles,sp,actor:w,bld,room,lib,topic:pick(sc.topics),tone:pick(TONES),sceneNote:ACTS[id]&&ACTS[id].gen?`Activity: ${ACTS[id].label.en}.`:''};
  dlg.cur={c,lines:null,i:0,t:0,pending:true};
  openDialogCard(c);
  pickDialog(c).then(d=>{if(!dlg.cur||dlg.cur.c!==c)return;dlg.cur.lines=d.d.map(l=>[l[0],fillName(l[1],bld),fillName(l[2],bld)]);dlg.cur.key=d.key&&[fillName(d.key[0],bld),fillName(d.key[1],bld)];dlg.cur.ai=!!d.ai;dlg.cur.pending=false;renderDialogCard()});
  // 二人のおしゃべりは、会話が終わるまで続ける
  if(sc.both)sp.forEach(x=>{if(x.act&&x.act.id==='chat')x.wait=Math.max(x.wait,6*DLG_LINE*clock.speed)});
  return true;
}
async function pickDialog(c){
  const key=c.id,saved=(dlgSaved[key]||[]).length;
  // 新しく作るのは、Claude が使えて、少し間があいていて、その場面の保存がまだ少ない時（多い時もときどき）
  if(sample&&S.time-dlg.genLast>40&&dlg.genCount<60&&(saved<8||Math.random()<.25)){
    dlg.genLast=S.time;dlg.genCount++;
    try{const d=sanitizeDialog(await askJSON(dialogPrompt(c),{system:DIALOG_SYS,model:MODELS.talk,modelTier:'quick',cache:false}));
      if(d){const list=dlgSaved[key]||(dlgSaved[key]=[]);list.unshift({lines:d.d.map(l=>({who:l[0],en:l[1],ja:l[2]})),key:d.key&&{en:d.key[0],ja:d.key[1]}});if(list.length>DLG_MAX)list.length=DLG_MAX;saveDialogs();return d}}
    catch(err){const k=err&&err.code;if(k==='not_granted'||k==='sampling_disabled')sample=null}}
  // 保存済みと定番から、最近見せていないものを選ぶ
  const rec=dlg.recent[key]||(dlg.recent[key]=[]);
  const fresh=c.lib.filter(d=>!rec.includes(d.d[0][1]));const d=pick(fresh.length?fresh:c.lib);
  rec.push(d.d[0][1]);if(rec.length>Math.min(4,c.lib.length-1))rec.shift();
  return d;
}
function updateDialog(dt){
  const cur=dlg.cur;if(!cur)return;
  if(cur.pending){cur.wait=(cur.wait||0)+dt;if(cur.wait>12){dlg.cur=null;closeDialogCard()}return}
  cur.t-=dt;if(cur.t>0)return;
  if(cur.i>=cur.lines.length){dlg.cur=null;dlg.lastEnd=S.time;dlgCardTimer=setTimeout(closeDialogCard,9000);return}
  const[who,en,ja]=cur.lines[cur.i],c=cur.c,w=c.sp[who];
  if(w&&!hiddenW(w))w.say={en,ja,until:S.time+DLG_LINE+.4};
  else{const r=c.roles[who];c.actor.say={en:`${r.en}: ${en}`,ja:`${r.ja}：${ja}`,until:S.time+DLG_LINE+.4}}
  addPhrase({en,ja});
  cur.i++;cur.t=DLG_LINE;renderDialogCard();
}

// ---------- カード ----------
const dlgEl=$('dlg');let dlgCardTimer=null,dlgShown=null;
function openDialogCard(c){clearTimeout(dlgCardTimer);dlgShown=c;const ol=$('dList');ol.replaceChildren();ol.dataset.for='';$('dKey').hidden=true;if(!card.hidden||!wordCard.hidden||fpv.on){renderDialogCard();return}dlgEl.hidden=false;logEl.hidden=true;renderDialogCard()}
function closeDialogCard(){dlgEl.hidden=true;dlgShown=null;if(card.hidden&&wordCard.hidden)logEl.hidden=false}
function renderDialogCard(){
  const cur=dlg.cur&&dlg.cur.c===dlgShown?dlg.cur:null,c=dlgShown;if(!c)return;
  $('dTitle').textContent=tr(c.where);
  $('dSrc').textContent=cur&&cur.pending?tr(J('会話を用意しています…','Preparing a conversation…')):'';
  const ol=$('dList');const shown=cur?cur.i:ol.children.length;
  if(cur&&!cur.pending&&ol.dataset.for!==String(c.topic+c.id)){ol.replaceChildren();ol.dataset.for=String(c.topic+c.id)}
  if(cur&&cur.lines)for(let k=ol.children.length;k<shown;k++){const[who,en,ja]=cur.lines[k],li=document.createElement('li'),b=document.createElement('b'),e=document.createElement('span'),j=document.createElement('span');
    li.className=who===1?'me':'you';b.textContent=nameIn(c.roles[who],c.sp[who]);e.className='en';e.textContent=en;j.className='ja';j.textContent=ja;li.append(b,e,j);
    if(canSpeak){const s=document.createElement('button');s.type='button';s.className='say-btn';s.textContent='🔊';s.setAttribute('aria-label','Listen');s.onclick=()=>speak(en);li.append(s)}
    ol.append(li);ol.scrollTop=ol.scrollHeight}
  const key=cur&&cur.key&&cur.i>=cur.lines.length?cur.key:null,kEl=$('dKey');
  if(key){kEl.hidden=false;kEl.replaceChildren();const t=document.createElement('b');t.textContent=tr(J('覚えたい表現','Key phrase'))+': '+key[0];const n=document.createElement('span');n.textContent=key[1];kEl.append(t,n);addPhrase({en:key[0],ja:key[1]})}
  else if(cur)kEl.hidden=true;
}
$('dClose').addEventListener('click',closeDialogCard);
$('dSayAll').addEventListener('click',()=>{const t=[...$('dList').querySelectorAll('.en')].map(e=>e.textContent).join(' ');if(t)speak(t)});
// 住人カードの「会話を聞く」: いまの行動の場面の会話をすぐに流す
$('cDlg').addEventListener('click',()=>{const w=selected;if(!w||!w.act)return;card.hidden=true;if(!maybeDialog(w,w.act.id,{force:true,partner:w.act.partner}))card.hidden=false});
