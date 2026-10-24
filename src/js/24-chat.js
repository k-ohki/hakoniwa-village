// ================= chat lines =================
const LINES={
  base:[J('いい天気だね','Nice weather, isn\'t it?'),J('今日は何してたの？','What did you do today?'),J('そうなんだ！','Oh, really?'),J('おなかすいたね','I\'m getting hungry.'),J('ほんとに？','Are you serious?'),J('なるほどね','I see.'),J('また遊ぼうね','Let\'s hang out again.'),J('聞いてよ、それがさ…','Listen, guess what...'),J('それ面白いね','That sounds fun.'),J('元気だった？','How have you been?'),J('またね！','See you later!')],
  home:[J('今日の夕ごはん何？','What\'s for dinner tonight?'),J('先にお風呂入っていい？','Can I take a bath first?'),J('テレビつけていい？','Can I turn on the TV?'),J('部屋が散らかってるよ','Your room is messy.'),J('電気消してね','Please turn off the light.')],
  rain:[J('よく降るね','It\'s raining a lot.'),J('傘を持っていきなよ','Take an umbrella with you.')],snow:[J('雪だるま作ろうよ','Let\'s make a snowman!'),J('さむいね〜','It\'s so cold!')],
  night:[J('星がきれいだね','The stars are beautiful.'),J('そろそろ眠いな','I\'m getting sleepy.')],morning:[J('おはよう！','Good morning!'),J('よく眠れた？','Did you sleep well?')],fest:[J('お祭り楽しいね！','The festival is so fun!'),J('一緒に踊ろう！','Let\'s dance together!')]};
function chatLine(w,o){
  const h=clock.hour;let pool=LINES.base.slice();
  if(w.tile.indoor)pool=pool.concat(LINES.home,LINES.home);
  if(weather.kind==='rain')pool=pool.concat(LINES.rain,LINES.rain);if(weather.kind==='snow')pool=pool.concat(LINES.snow,LINES.snow);
  if(h>=19||h<5)pool=pool.concat(LINES.night);if(h>=5&&h<9)pool=pool.concat(LINES.morning);if(clock.sim<weather.festUntil)pool=pool.concat(LINES.fest,LINES.fest);
  if(Math.random()<.2)pool.push(J(`${o.name}、最近どう？`,`Hey ${o.en}, how's it going?`));
  if(w.memory&&w.memory.length&&Math.random()<.25){const m=w.memory[w.memory.length-1];if(m.includes('釣'))pool.push(J('さっき魚が釣れたんだ','I caught a fish earlier.'));if(m.includes('神の声'))pool.push(J('さっきの空の声、聞いた？','Did you hear that voice from the sky?'))}
  return pick(pool);
}

