/* ===== 設定、存檔、新局 ===== */
var S=null;
var DEFSET={ai:false,key:"",base:"https://api.deepseek.com/v1",model:"deepseek-chat",temp:0.85,maxTok:4000,aiTimeout:45,preset:"deepseek",firewall:true};
var SET={};
var PRESETS={
 deepseek:{n:"DeepSeek",base:"https://api.deepseek.com/v1",model:"deepseek-chat",models:["deepseek-chat","deepseek-reasoner"],key:"到 platform.deepseek.com 建立 API Key 並儲值（餘額為 0 會回 HTTP 402）。遊戲請用 deepseek-chat；deepseek-reasoner 是推理型，回應很慢，不建議。"},
 xai:{n:"xAI Grok",base:"https://api.x.ai/v1",model:"grok-4.7",models:["grok-4.7","grok-4.6","grok-4.3","grok-4.20-0309-non-reasoning","grok-latest"],key:"到 console.x.ai 建立 API Key（Grok App 訂閱不能當 API Key 用）。"},
 openai:{n:"OpenAI",base:"https://api.openai.com/v1",model:"gpt-4o-mini",models:["gpt-4o-mini","gpt-4o","gpt-4.1-mini"],key:"到 platform.openai.com 建立 API Key。"},
 openrouter:{n:"OpenRouter",base:"https://openrouter.ai/api/v1",model:"deepseek/deepseek-chat",models:["deepseek/deepseek-chat","x-ai/grok-4-fast","openai/gpt-4o-mini","google/gemini-2.5-flash"],key:"到 openrouter.ai 建立 Key；模型名寫成「廠商/模型」。"},
 gemini:{n:"Google Gemini",base:"https://generativelanguage.googleapis.com/v1beta/openai",model:"gemini-2.5-flash",models:["gemini-2.5-flash","gemini-2.5-pro"],key:"到 aistudio.google.com 取得 API Key。"},
 groq:{n:"Groq",base:"https://api.groq.com/openai/v1",model:"llama-3.3-70b-versatile",models:["llama-3.3-70b-versatile","qwen/qwen3-32b"],key:"到 console.groq.com 建立 API Key。"},
 custom:{n:"自訂（OpenAI 相容）",base:"",model:"",models:[],key:"自行填入 Base URL、模型名與 Key（本機 Ollama／LM Studio 可不填 Key）。"}
};
var PRESET_ORDER=["deepseek","xai","openai","openrouter","gemini","groq","custom"];
var SET_KEY="xingchen_settings";
var SAVE_KEY="xingchen_v1_auto";
function loadSettings(){var o={};try{o=JSON.parse(localStorage.getItem(SET_KEY)||"{}")||{};}catch(e){o={};}
 SET={};for(var k in DEFSET)SET[k]=(o[k]!==undefined&&typeof o[k]===typeof DEFSET[k])?o[k]:DEFSET[k];
 if(!SET.maxTok||SET.maxTok<4000)SET.maxTok=4000;
 var savedKey=String(o.key||"").replace(/^\s+|\s+$/g,"");
 var oldBase=String(o.base||"");
 if(!savedKey && o.preset==="xai" && o.model==="grok-4.7" && (!oldBase || oldBase==="https://api.x.ai/v1" || oldBase==="https://api.x.ai/v1/")){
  SET.preset="deepseek";SET.base=PRESETS.deepseek.base;SET.model=PRESETS.deepseek.model;
 }
}
function saveSettings(){try{localStorage.setItem(SET_KEY,JSON.stringify(SET));}catch(e){}}
function clamp(v,a,b){v=+v;if(isNaN(v))v=a;return v<a?a:(v>b?b:v);}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
function P(id){return S&&S.ppl?S.ppl[id]:null;}
function cn(id){if(id==="me"||id==="haichen")return "歐海辰";var p=P(id);return p?p.n:(id||"");}
function timeStr(){var h=Math.floor(S.time/60)%24,m=S.time%60;return "第"+S.day+"日 "+(h<10?"0":"")+h+":"+(m<10?"0":"")+m;}
function passMin(n){S.time+=n;if(S.time>=24*60){S.time-=24*60;S.day++;}}
function presentIds(){var a=[];for(var id in S.ppl){if(id==="haichen")continue;var p=S.ppl[id];if(p.around&&p.loc===S.place)a.push(id);}return a;}
function newGame(){
 S={v:1,day:1,time:15*60,place:"counsel",focus:"hairuo",chapter:"第一章 · 刀刃與界限",learned:{},flags:{},log:[],recent:"",trust:{},body:62,speech:58,mood:44,rel:36,nitro:3,ppl:{},view:null,mem:{},hunt:{on:0,miss:0,n:0},author:[],aiHist:[],traces:[],deadline:null,delta:{body:0,speech:0,mood:0,trust:0},turn:null,pov:"haichen",control:"haichen"};
 for(var id in PEOPLE){var p=PEOPLE[id];S.ppl[id]={n:p.n,role:p.role,loc:p.loc,around:p.around?1:0,color:p.color,g:p.g,age:p.age};S.trust[id]=id==="hairuo"?36:id==="li"?12:id==="liu"?8:20;}
 S.trust.haichen=0;
 S.rel=S.trust.hairuo;
}
function saveGame(quiet){if(!S)return false;try{localStorage.setItem(SAVE_KEY,JSON.stringify({t:Date.now(),s:S}));if(!quiet&&typeof toast==="function")toast("已存檔");return true;}catch(e){if(!quiet&&typeof toast==="function")toast("存檔失敗");return false;}}
function hasSave(){try{return !!localStorage.getItem(SAVE_KEY);}catch(e){return false;}}
function loadGame(){try{var o=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");if(!o||!o.s||o.s.v!==1)return false;S=o.s;if(!S.learned)S.learned={};if(!S.flags)S.flags={};if(!S.log)S.log=[];if(!S.mem)S.mem={};if(!S.hunt)S.hunt={on:0,miss:0,n:0};if(!S.author)S.author=[];if(!S.aiHist)S.aiHist=[];if(!S.chapter)S.chapter="第一章 · 刀刃與界限";if(typeof S.speech!=="number")S.speech=58;if(typeof S.rel!=="number")S.rel=(S.trust&&S.trust.hairuo)||36;if(!S.traces)S.traces=[];if(!S.delta)S.delta={body:0,speech:0,mood:0,trust:0};if(S.pov===undefined)S.pov="haichen";if(!S.control)S.control="haichen";return true;}catch(e){return false;}}
