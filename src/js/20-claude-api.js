// ================= Claude API (own key, stored only in this browser) =================
// Claude Artifact では host の `sample` を使う。それ以外（GitHub Pages など）では、
// 利用者が入力した API キーで api.anthropic.com を直接呼ぶ。キーは localStorage にだけ保存する。
const API_KEY_STORE='hakoniwa-api-key',API_MODEL_STORE='hakoniwa-api-model';
const API_MODELS=[['claude-opus-5-5','Claude Opus 5.5'],['claude-sonnet-5-5','Claude Sonnet 5.5'],['claude-haiku-5-5','Claude Haiku 5.5']];
const FALLBACK_MODELS=new Set(['claude-opus-5-5','claude-sonnet-5-5']);
let hostSample=null;
const lsGet=k=>{try{return localStorage.getItem(k)||''}catch(e){return''}};
const lsSet=(k,v)=>{try{v?localStorage.setItem(k,v):localStorage.removeItem(k);return true}catch(e){return false}};
const apiKey=()=>lsGet(API_KEY_STORE).trim();
const apiModel=()=>{const m=lsGet(API_MODEL_STORE);return API_MODELS.some(([id])=>id===m)?m:API_MODELS[0][0]};
const apiErr=(code,message)=>Object.assign(new Error(message),{code});

// 返答テキストから JSON を取り出す（コードフェンスや前後の文章があっても読む）
function parseJSONText(t){
  const s=String(t).replace(/```(?:json)?/gi,'').trim();
  try{return JSON.parse(s)}catch(e){}
  const a=s.search(/[\[{]/),b=Math.max(s.lastIndexOf('}'),s.lastIndexOf(']'));
  if(a>=0&&b>a)try{return JSON.parse(s.slice(a,b+1))}catch(e){}
  throw apiErr('bad_json','Claude の返答を JSON として読めませんでした');
}

async function apiCall(prompt,opts={}){
  const key=apiKey();if(!key)throw apiErr('not_granted','API キーが未設定です');
  const model=apiModel();
  const body={model,max_tokens:16000,
    system:'Reply with exactly one JSON value and nothing else: no prose, no code fences.',
    messages:[{role:'user',content:String(prompt)}],
    output_config:{effort:opts.modelTier==='quick'?'low':'medium'}};
  const headers={'content-type':'application/json','x-api-key':key,'anthropic-version':'2026-10-21',
    'anthropic-dangerous-direct-browser-access':'true'};
  if(FALLBACK_MODELS.has(model)){body.fallbacks='default';headers['anthropic-beta']='server-side-fallback-2026-07-01'}
  let res;
  try{res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers,body:JSON.stringify(body),signal:opts.signal})}
  catch(e){throw apiErr('network','Claude API に接続できませんでした')}
  if(!res.ok){
    let msg='';try{msg=(await res.json()).error?.message||''}catch(e){}
    if(res.status===401||res.status===403){log(J('APIキーが使えません。「町」→ Claude API で確認してください','The API key was rejected. Check it under Town → Claude API.'));throw apiErr('not_granted',msg)}
    if(res.status===429||res.status===529)throw apiErr('rate_limited',msg);
    throw apiErr('api_error',`${res.status} ${msg}`);
  }
  const data=await res.json();
  if(data.stop_reason==='refusal')throw apiErr('refused','Claude が応答を控えました');
  return (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
}
// host の sample と同じ形（sample.json(prompt, opts)）にそろえる
const apiSample=()=>apiKey()?{json:async(p,o)=>parseJSONText(await apiCall(p,o))}:null;
function refreshSample(){sample=hostSample||apiSample();renderApiPanel()}

function renderApiPanel(){
  const box=$('apiBox');if(!box)return;
  box.hidden=!!hostSample;
  $('apiTitle').textContent='Claude API';
  $('apiNote').textContent=tr(J('自分の API キーを入れると、神の声・会話・建物の設計・町の成長に Claude を使います。キーはこのブラウザにだけ保存され、Anthropic に直接送られます。共用の端末では入れないでください。','Enter your own API key to use Claude for the Voice of God, talks, building design and town growth. The key is stored only in this browser and sent straight to Anthropic. Do not enter it on a shared device.'));
  const has=!!apiKey();
  $('apiState').textContent=tr(has?J('設定済み（キーは表示しません）','Saved (the key is not shown)'):J('未設定：簡易解釈で動いています','Not set: using the simple offline reading'));
  $('apiSave').textContent=tr(J('保存','Save'));$('apiClear').textContent=tr(J('キーを削除','Remove key'));
  $('apiClear').disabled=!has;$('apiKey').placeholder=has?'••••••••':'sk-ant-...';
  const sel=$('apiModel');if(!sel.options.length)for(const[id,name]of API_MODELS)sel.add(new Option(name,id));
  sel.value=apiModel();
}
$('apiForm').addEventListener('submit',e=>{
  e.preventDefault();const v=$('apiKey').value.trim();$('apiKey').value='';
  if(v&&!lsSet(API_KEY_STORE,v)){toast(J('このブラウザでは保存できません','This browser cannot save it'));return}
  lsSet(API_MODEL_STORE,$('apiModel').value);refreshSample();
  toast(v?J('APIキーを保存しました','API key saved'):J('モデルを保存しました','Model saved'));
});
$('apiClear').addEventListener('click',()=>{lsSet(API_KEY_STORE,'');refreshSample();toast(J('APIキーを削除しました','API key removed'))});

if(window.claude&&window.claude.use)window.claude.use('sample').then(s=>{hostSample=s||null;refreshSample()}).catch(()=>refreshSample());
refreshSample();
