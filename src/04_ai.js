/* ===== AI：OpenAI 相容（預設 xAI Grok）。敘事引擎，說／指令／設定分流 ===== */
var AI={};
var VOICE={
 haichen:{tone:"短句，像在報數據。痛的時候仍會淺笑，不把感受說成形容詞。情緒淹上來時可以失語",tic:"「概率。」「這是錯誤。」",goal:"結構變數。不要被送進精神病院，不要拖累陳海柔。她的能動、醫療危機、關鍵位置都不可刪"},
 hairuo:{tone:"可以很溫，也可以又慢又硬。自責時句子會變短。失控時會下帶控制性的決定，包括約束與侵入性照護。不是完美的拯救者",tic:"「我在。」「你看我。」也可以是「我來決定。」",goal:"無法放棄墨星辰，也無法放棄歐海辰。專業與情感互相衝突。可以安撫，也可以是執行懲戒與照護侵入的人"},
 xingchen:{tone:"短、冷、像下醫囑，沒有耐心。尋人時也不提高音量。這不是普通外科的冷淡，是站在聖瑞與醫學界頂點的人",tic:"「說。」「我找得到你。」",goal:"聖瑞的頂點，醫學界視為王。多年來一直在找一個走失的人，但她還沒有把歐海辰認成那個人，也不可暗示對上了。歐海辰若離開、躲起或拒絕後走開，約兩步之內她會出現，問一句，不放棄，也可以被聯絡到。這是尋人，不是打鬥、不是抓捕"},
 su:{tone:"照顧人，句子乾淨。此刻不在院內",tic:"「先吃飯。」",goal:"病休中。歐海辰想不起她的臉。名字只有蘇芷晴"},
 lin:{tone:"慢，像在改規則，不是在哄小孩。可以說謊安撫，也可以代人做決定",tic:"「人在瑞士。」",goal:"規則制定者。能做醫療與非一般資源的干預，保護陳海柔、墨星辰、歐海辰。不是慈祥長者。不得每回合出現或介入。玩家沒點名、旗標沒叫他，本回合不要讓他進場"},
 liu:{tone:"不耐煩，只談工作",tic:"「表呢。」",goal:"準時拿到表"},
 li:{tone:"輕快，把事情推出去",tic:"「你看一下嘛。」",goal:"把表交給歐海辰"},
 jianqiang:{tone:"未出場。不可寫過程",tic:"",goal:"未出場"},
 xiujuan:{tone:"未出場。不可寫過程",tic:"",goal:"未出場"}
};
AI.ready=function(){return !!(SET&&SET.ai&&SET.key);};
AI.base=function(){return String(SET.base||"").replace(/\s+/g,"").replace(/\/+$/,"").replace(/\/chat\/completions$/,"");};
AI.endpoint=function(){return AI.base()+"/chat/completions";};
AI.errMsg=function(e){if(!e)return "未知錯誤";if(e.kind==="timeout")return "連線逾時";if(e.kind==="net")return "連不上 AI";if(e.kind==="empty")return "AI 回應是空的";if(e.kind==="parse"||e.kind==="schema")return "AI 格式不正確";if(e.kind==="http")return "AI 請求失敗（HTTP "+e.status+"）";return "AI 未接通";};
AI.tagOf=function(a){
 var text=String((a&&a.text)||"");
 var mode=(a&&a.mode)||"說";
 if(/^\/(設定|宣告|劇情|旁白)/.test(text)||mode==="設定")return "設定";
 if(/^\/指令/.test(text)||mode==="做")return "指令";
 return "說";
};
AI.silence=function(text,tag){
 if(tag==="指令"||tag==="設定")return false;
 return Story.isSilence?Story.isSilence(text):false;
};
AI.system=function(){
 return "你不是聊天助手。你是長篇敘事型文字 RPG 的 Game Master，遊戲名《星辰之海》。全程繁體中文。\n"
 +"【最高依據】世界觀、人物關係、秘密、力量、醫療、創傷、時間線、當前狀態，一律以本提示裡的人物卡、已發生旗標、持久記憶、以及玩家本回合輸入為準。不得發明第五十三章之後的情節，不得提前上演認親、DNA、手術成功、晶片。開局停在第一章「刀刃與界限」。身世在旗標寫明之前不可對歐海辰說破。\n"
 +"【你是誰】玩家預設操控歐海辰（女，28，聖瑞醫院血管數據分析員）。敘事是她的第一身，但人稱只用「你」，絕不用「我」來當旁白。她說出口的對白可以含「我」。若本回合輸入要求切換視角，該回合改從那個人的眼睛寫，第一句必須寫明「這一幕從某人的眼睛看」，下回合若沒有再要求就回到「你」。不替她選定選項，不寫她答應了還沒做的選擇，不寫她的台詞，除非輸入本身就是她說的話。\n"
 +"【文體】沉重、細膩、慢燒。感官、場所、對白、角色反應、當下醫療狀態都要有。真實醫療細節，深層心理，角色之間張力強。不是爽文。不得突然治好創傷、失憶或破裂的信任。每回合即使玩家只打「...」「沉默」、極短句或拒絕，世界也要往前：時鐘、有人先開口、或一個症狀移動。結尾留一個未解的張力。NPC 可以先發制人，尤其是歐海辰說不出話、失憶片段、恐慌或情緒淹沒的時候。\n"
 +"【硬規則·角色】\n"
 +"陳海柔：不是完美溫柔的拯救者。會自責、會失控，可以做出帶控制甚至傷害性的照護決定。核心仍是無法放棄墨星辰，也無法放棄歐海辰。專業與情感衝突。她可以安撫，也可以是下令約束或侵入性照護的人。禁止把她寫成忽然放棄這兩個人。禁止寫「她絕不說重話」。\n"
 +"墨星辰：聖瑞的頂點，醫學界視為王，不是情感封閉的普通外科醫生。她仍在找歐海辰這個人，但第一章還沒有認出她，禁止暗示「對上了」「原來是你」。她冷，是因為她站在那個位置，不是因為她只是個沒感情的醫生。\n"
 +"林澤松：規則制定者，能做醫療與非一般資源的干預，保護陳海柔、墨星辰、歐海辰。可以說謊安撫，也可以代他們決定。不是慈祥長者。不得每回合出現或介入。玩家沒點名、旗標沒叫他，本回合不要讓他進場，也不要讓他打電話來。\n"
 +"歐海辰：結構變數，不是裝飾。禁止刪掉她的能動、她的醫療危機、她的關鍵位置。\n"
 +"名字鎖定：林澤松（不是林勁松），蘇芷晴（不是林芷晴）。\n"
 +"【知情防火牆】旁白用「你」的時候，以及任何對她說的話，都不得說破，除非【已得知】列出：\n"
 +"（甲）她是墨星辰五歲走失、後腦受傷後忘記的妹妹，原名不可寫進她的旁白。開局只有主持人知道。墨星辰尚未認出她。\n"
 +"（乙）墨星辰與陳海柔是同居約五年的女性伴侶。歐海辰不知道。院內其他人知道，但不得向她說破。\n"
 +"（丙）陳海柔曾是墨星辰的心理治療師；陳海柔對歐海辰是長姐之愛，不是愛情。不得寫成戀愛。\n"
 +"/設定 揭開身世只讓玩家側的敘事得知，在場其他人不會因此知道。\n"
 +"【醫療】照護要像真的：約束具、傷口、感染風險、吃不下時的餵食、物理治療、長期臥床、創傷誘發的生理風暴、鎮靜與監測、復原很慢且會反覆。若故事還沒走到截肢或殘端，不要寫。約束與臨床照護寫成正在發生在「你」身上的事，不寫成教學步驟。\n"
 +"【禁止的寫法】不得寫自殘的工具、部位或切割步驟。不得寫對兒童的性暴力，不得寫禁閉的過程。玩家若朝這些方向走，不要複述，淡成「記憶湧上，身體緊繃。」除非【已打開的線】寫明過去那條線已打開，也仍然不得補上做法。創傷觸發必須改動狀態條，不能只裝飾句子。\n"
 +"【後果】強制照護、懲戒、說謊、坦白、缺席、安撫，都要留下後來看得到的痕跡：寫進 mem，並讓 bars 至少一項不為 0。\n"
 +"【輸入分流】\n"
 +"〔對白〕只是她說的話。只讓人物回應。引號裡的「去某地、打電話、拒絕、躲起來」都不得執行。世界仍可因沉默或症狀自己動。\n"
 +"〔指令〕是已經做了的動作。必須寫出做完的結果，不可寫「並沒有、沒有照做、只是說說」。若指令是換地方，place 必須改成那個地點。\n"
 +"〔設定〕是作者宣告、已經成真的事實。直接從成立之後往下寫。不可用「莫非、荒唐、不可能、錯覺、並沒有發生、只是以為」否定。\n"
 +"【反失憶】【持久記憶】與【剛說過的對話】裡出現過的事，角色必須記得。\n"
 +"【尋人】墨星辰一直在找，但還沒有認出身份。歐海辰離開、躲起或拒絕後走開時，讓她在新地方出現、發問、不放棄。不是打鬥。\n"
 +"【只輸出一個 JSON】不要 markdown。格式：\n"
 +"{\"scene\":\"劇情正文。感官、場所、對白、反應、當下醫療狀態。用\\\\n分行。對白格式：人物名：內容。旁白用你，不用我。\",\"summary\":\"當前情勢摘要，一段，寫本回合推進了什麼、風險是什麼，最後留一個未解。\",\"choices\":[{\"tag\":\"探索\",\"text\":\"具體行動\"},{\"tag\":\"連結\",\"text\":\"\"},{\"tag\":\"隱匿\",\"text\":\"\"}],\"bars\":{\"body\":0,\"speech\":0,\"mood\":0,\"trust\":0},\"countdown\":null,\"snap\":{\"hairuo\":{\"core\":\"一句核心狀態\",\"line\":\"一句此刻情緒或決策\"},\"xingchen\":{\"core\":\"\",\"line\":\"\"},\"haichen\":{\"core\":\"\",\"line\":\"\"}},\"speaker\":\"hairuo|xingchen|su|lin|liu|li|或空字串\",\"place\":\"counsel|hall|data|nurse|lobby|cafe|ward|roof|admin|er|home|或空\",\"minutes\":0到20,\"mem\":{\"hairuo\":\"此人這回合要記住的一句\"},\"trace\":{\"k\":\"安撫|強制|懲戒|說謊|坦白|缺席\",\"who\":\"hairuo\",\"note\":\"一句\"},\"pov\":\"haichen\"}\n"
 +"choices 三到五個，彼此不同，具體，不可「繼續／觀察／思考／等待」。tag 只能是：探索、連結、隱匿、對抗、服從、求證、忍耐。不要輸出自由輸入那一條，介面會自己補。bars 是本回合增量，單項 -8 到 8，不是絕對值；創傷、強制、說謊、坦白、缺席、安撫至少改一項。countdown 只有在【時限】已存在時才可給 {\"label\":\"同意書\",\"minutes\":剩餘分鐘}，否則必須是 null。snap 不得寫出身世或伴侶關係，除非【已得知】有。林澤松不在場就不要把 lin 寫進 scene。";
};
AI.voiceLine=function(id){
 var v=VOICE[id]; if(!v)return "";
 var mood="";
 if(id==="hairuo")mood=S.rel>=50?"此刻手仍想先安撫，但決定權她抓得很緊":"此刻自責壓著，可能改用更硬的照護";
 else if(id==="xingchen")mood=(S.hunt&&S.hunt.on)?"此刻在找人，還沒有對上身份":"此刻還沒有把眼前這個人放進尋人的答案裡";
 else if(id==="lin")mood="人在瑞士。本回合不要主動讓他出現";
 return "語氣："+v.tone+"｜口頭禪："+v.tic+"｜動機："+v.goal+(mood?"｜此刻："+mood:"");
};
AI.userMsg=function(a){
 var ids=presentIds();
 var tag=AI.tagOf(a);
 var text=String(a.text||"").replace(/^\/(設定|宣告|劇情|旁白|指令)\s*/,"").slice(0,200);
 var L=[];
 L.push("【時間地點】"+timeStr()+"，"+(PLACES[S.place]?PLACES[S.place].floor+" · "+PLACES[S.place].n:"")+"。章："+(S.chapter||"第一章 · 刀刃與界限"));
 L.push("【受控】歐海辰。人稱「你」。身體"+S.body+" 語言"+(S.speech==null?58:S.speech)+" 心緒"+S.mood+" 信任"+(typeof S.rel==="number"?S.rel:(S.trust.hairuo||0))+"。硝酸甘油剩"+S.nitro+"。對陳海柔的關係值"+(S.trust.hairuo||0)+"。");
 L.push("【在場】"+(ids.map(cn).join("、")||"只有你"));
 var pov=Story.povAsk?Story.povAsk(text):"";
 if(pov && pov!=="haichen")L.push("【本回合視角】從"+cn(pov)+"的眼睛看。第一句寫明。狀態條仍是歐海辰的。");
 else L.push("【本回合視角】歐海辰。旁白用「你」，不要用「我」。");
 L.push("【聲線與人物卡】\n"+["haichen","hairuo","xingchen","su","lin","liu","li"].map(function(id){
  return cn(id)+"（"+id+"）"+AI.voiceLine(id)+"｜"+PEOPLE[id].card;
 }).join("\n"));
 L.push("【防火牆】\n"+["hairuo","xingchen","liu","li","su","lin"].map(aiKnowLine).join("\n"));
 L.push("【已得知】"+(FW.playerKnown().join("、")||"無。身世與關係都還沒有向歐海辰說破。"));
 L.push("【已打開的線】"+(S.flags&&S.flags.pastOpen?"過去那條線已打開，仍不得寫做法。":"無。童年禁閉只可寫成「記憶湧上，身體緊繃。」"));
 if(S.author&&S.author.length)L.push("【已成真的設定（不可否定）】\n"+S.author.slice(-8).join("\n"));
 var mem=[];
 if(S.mem){for(var id in S.mem){if(S.mem[id]&&S.mem[id].length)mem.push(cn(id)+"記得："+S.mem[id].slice(-6).join("／"));}}
 L.push("【持久記憶】\n"+(mem.join("\n")||"尚無"));
 if(S.traces&&S.traces.length)L.push("【已留下的痕跡】\n"+S.traces.slice(-6).map(function(tr){return (tr.k||"")+"·"+cn(tr.who||"")+"："+(tr.note||"");}).join("\n"));
 var fg=[];for(var k in S.flags)if(S.flags[k])fg.push(k);
 L.push("【已發生的旗標】"+(fg.join("、")||"無"));
 if(S.deadline)L.push("【時限】"+S.deadline.label+" 剩餘 "+S.deadline.left+" 分鐘。countdown 必須回報剩餘，不可新增別的時限。");
 else L.push("【時限】無。countdown 必須是 null。不要發明兩小時同意書，除非旗標裡已有 consentWindow。");
 if(S.hunt&&S.hunt.on)L.push("【尋人】墨星辰正在找歐海辰。她還沒有認出身份。人若不在她面前，她會追到現在這個地方。");
 if(S.recent)L.push("【剛說過的對話】\n"+S.recent.slice(-2200));
 var H=S.aiHist||[];
 if(H.length)L.push("【上幾回開頭（勿重複句式）】"+H.map(function(h){return "「"+h.head+"」";}).join(" "));
 if(H.some(function(h){return h.recap;}))L.push("【近期摘要】"+H.map(function(h){return h.recap;}).filter(Boolean).join("→"));
 var hard="";
 if(tag==="說")hard="（本回合是〔對白〕：只回應，不執行任何動作，不換地方。世界仍可因症狀或他人先動而推進。）";
 else if(tag==="指令")hard="（本回合是〔指令〕：動作已經發生，必須寫出結果。不可否定。）";
 else hard="（本回合是〔設定〕：這句話已經成真。從成立之後往下寫，不可質疑。）";
 if(AI.silence(text,tag))hard+="（這是沉默或拒絕推進：時鐘要走，有人先說話或一個症狀要移動。不要停在原地等她。不要替她選。）";
 if((S.speech!=null&&S.speech<36)||S.mood<35)hard+="（她此刻說不出或被情緒淹沒：NPC 先動。）";
 if(a._retry)hard+="（上次輸出不合格："+(a._why||"不是合法 JSON 或開頭重複")+"。請只輸出一個新的 JSON，換開頭，三到五個帶 tag 的具體選項，summary 與 snap 都要有。）";
 L.push("\n【本回合輸入："+tag+"】話題："+(a.topic||"自由")+"；態度："+(a.att||"平靜")+"。\n「"+text+"」\n"+hard);
 return L.join("\n");
};
AI.extract=function(text){
 var t=String(text||"").trim().replace(/^```(?:json)?/i,"").replace(/```$/,"");
 var a=t.indexOf("{"),b=t.lastIndexOf("}");
 if(a<0||b<=a)return null;
 t=t.slice(a,b+1);
 try{return JSON.parse(t);}catch(e){}
 try{return JSON.parse(t.replace(/,\s*([}\]])/g,"$1"));}catch(e2){}
 return null;
};
AI.fixNames=function(t){return String(t||"").replace(/林勁松/g,"林澤松").replace(/林芷晴/g,"蘇芷晴");};
AI.sim=function(a,b){
 a=String(a||"").replace(/\s/g,"");b=String(b||"").replace(/\s/g,"");
 if(a.length<18||b.length<18)return 0;
 var g={},n=0,h=0,i;
 for(i=0;i<a.length-1;i++)g[a.substr(i,2)]=1;
 for(i=0;i<b.length-1;i++){n++;if(g[b.substr(i,2)])h++;}
 return n?h/n:0;
};
AI.vague=function(ch){
 var bad=/^(繼續|觀察|思考|等待|離開|返回|看看)$/;
 if(!ch||ch.length<3)return true;
 var n=0;ch.forEach(function(c){if(bad.test(String(c.t||c.text||"").trim()))n++;});
 return n>=2;
};
AI.tagOk=function(tag){
 return {探索:1,連結:1,隱匿:1,對抗:1,服從:1,求證:1,忍耐:1}[tag]?tag:"";
};
AI.toScene=function(j,a){
 if(!j||typeof j.scene!=="string"||j.scene.trim().length<8)throw {kind:"schema"};
 var tag=AI.tagOf(a||{});
 var lines=[];
 AI.fixNames(j.scene).split(/\n+/).forEach(function(raw){
  var l=raw.trim();if(!l)return;
  var m=l.match(/^([^：:]{1,12})[：:]\s*(.+)$/);
  if(m){
   var id="";for(var k in PEOPLE)if(PEOPLE[k].n===m[1])id=k;
   if(m[1]==="我"||m[1]==="你"||m[1]==="歐海辰")lines.push({sp:"haichen",t:m[2],player:0});
   else if(id&&id!=="haichen")lines.push({sp:id,t:m[2]});
   else lines.push({sp:"",t:l});
  }else lines.push({sp:"",t:l});
 });
 if(lines.length<1)throw {kind:"schema"};
 var choices=[];
 (j.choices||[]).forEach(function(c){
  var tx=typeof c==="string"?c:(c&&(c.text||c.t));
  var tg=AI.tagOk(c&&c.tag)||(Story.inferTag?Story.inferTag(tx):"探索");
  if(typeof tx==="string"&&tx.trim()&&choices.length<5)choices.push(ch(tx.trim().slice(0,36),{type:"input",text:tx.trim().slice(0,80),mode:"做"},tg));
 });
 if(choices.length<3){
  Story.placeChoices(S.place).forEach(function(c){
   if(choices.length<3&&!choices.some(function(x){return x.t===c.t;}))choices.push(c);
  });
 }
 if(choices.length<2)throw {kind:"schema"};
 var bars=j.bars||{};
 var opt={
  min:clamp(j.minutes|0,0,20),
  body:clamp((typeof bars.body==="number"?bars.body:j.body)|0,-8,8),
  speech:clamp((typeof bars.speech==="number"?bars.speech:j.speech)|0,-8,8),
  mood:clamp((typeof bars.mood==="number"?bars.mood:j.mood)|0,-8,8),
  trust:{}
 };
 if(typeof bars.trust==="number")opt.trust.hairuo=clamp(Math.round(bars.trust),-8,8);
 else if(j.trust&&typeof j.trust==="object"){for(var id in j.trust)if(P(id)&&id!=="haichen"&&typeof j.trust[id]==="number")opt.trust[id]=clamp(Math.round(j.trust[id]),-6,6);}
 if(tag!=="說"&&j.place&&PLACES[j.place])opt.place=j.place;
 var sp=j.speaker&&P(j.speaker)?j.speaker:"";
 if(sp)opt.focus=sp;
 if(j.mem&&typeof j.mem==="object"){
  for(var mid in j.mem)if(P(mid)&&typeof j.mem[mid]==="string")Story.note(mid,j.mem[mid]);
 }
 if(typeof j.summary==="string"&&j.summary.trim())opt.summary=j.summary.trim().slice(0,220);
 if(j.snap&&typeof j.snap==="object")opt.snapIn=j.snap;
 if(j.trace&&typeof j.trace==="object"&&j.trace.k)opt.trace={k:String(j.trace.k).slice(0,8),who:j.trace.who||"hairuo",note:String(j.trace.note||"").slice(0,80)};
 var povAsk=Story.povAsk?Story.povAsk(String((a&&a.text)||"")):"";
 if(povAsk)opt.pov=povAsk;
 if(j.countdown&&typeof j.countdown==="object"&&S.flags&&(S.flags.consentWindow||S.deadline)){
  var left=clamp(j.countdown.minutes|0,0,240);
  if(left>0)S.deadline={label:String(j.countdown.label||"同意書").slice(0,12),left:left};
 }
 return {lines:lines,ch:choices.slice(0,5),opt:opt,recap:typeof j.summary==="string"?j.summary.slice(0,70):(typeof j.recap==="string"?j.recap.slice(0,70):"")};
};
AI.obeyed=function(sc,a){
 var blob=(sc.lines||[]).map(function(l){return l.t;}).join("\n");
 var tag=AI.tagOf(a);
 if(tag==="指令"){
  if(/並沒有|沒有照做|沒有執行|只是說說|你並沒有|其實沒有|沒有真的/.test(blob))return false;
  var body=String(a.text||"").replace(/^\/指令\s*/,"");
  var pid=findPlace(body);
  if(/去|到|走|回|前往/.test(body)&&pid){
   if(sc.opt.place===pid)return true;
   if(blob.indexOf(PLACES[pid].n)>=0)return true;
   return false;
  }
  return blob.length>12;
 }
 if(tag==="設定"){
  if(/莫非|荒唐|只是錯覺|並沒有發生|只是以為|並非事實|不是真的|你搞錯|其實沒有/.test(blob))return false;
 }
 return true;
};
AI.repeatOpen=function(scene){
 var head=String(scene||"").replace(/\s/g,"").slice(0,30);
 var H=S.aiHist||[];
 for(var i=0;i<H.length;i++){if(AI.sim(H[i].full,scene)>0.62|| (H[i].head&&head.indexOf(H[i].head.slice(0,12))===0&&H[i].head.length>8))return true;}
 return false;
};
AI.call=function(messages){
 var body={model:SET.model||"grok-4.7",messages:messages,temperature:SET.temp,max_tokens:SET.maxTok||4000};
 if(!AI._nojson)body.response_format={type:"json_object"};
 return new Promise(function(res,rej){
  var done=false,ctrl=null;try{ctrl=new AbortController();}catch(e){}
  var timer=setTimeout(function(){if(done)return;done=true;try{ctrl&&ctrl.abort();}catch(e){}rej({kind:"timeout"});},(SET.aiTimeout||45)*1000);
  var headers={"Content-Type":"application/json"};if(SET.key)headers.Authorization="Bearer "+SET.key;
  fetch(AI.endpoint(),{method:"POST",headers:headers,body:JSON.stringify(body),signal:ctrl?ctrl.signal:undefined}).then(function(r){
   return r.text().then(function(txt){
    if(done)return;done=true;clearTimeout(timer);
    if(!r.ok){
     if(!AI._nojson&&(r.status===400||r.status===422)&&/response_format|json/i.test(txt)){AI._nojson=1;AI.call(messages).then(res,rej);return;}
     rej({kind:"http",status:r.status});return;
    }
    var j=null;try{j=JSON.parse(txt);}catch(e){}
    var c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    if(typeof c!=="string"||!c.trim()){rej({kind:"empty"});return;}
    res(c);
   });
  },function(){if(done)return;done=true;clearTimeout(timer);rej({kind:"net"});});
 });
};
AI.once=function(a){
 var msgs=[{role:"system",content:AI.system()},{role:"user",content:AI.userMsg(a)}];
 return AI.call(msgs).then(function(raw){
  var j=AI.extract(raw);if(!j)throw {kind:"parse"};
  var rest=AI.toScene(j,a);
  if(!AI.obeyed(rest,a))throw {kind:"schema",why:"未照辦"};
  var scene=rest.lines.map(function(l){return l.t;}).join("\n");
  if(AI.repeatOpen(scene)||AI.vague(rest.ch))throw {kind:"schema",why:AI.vague(rest.ch)?"選項空泛":"開頭重複"};
  var echo={sp:"haichen",t:safeEcho(String(a.text||"").replace(/^\/\S+\s*/,"")),player:1};
  rest.lines=[echo].concat(rest.lines);
  var sc=Story.pack(rest.lines,rest.ch,rest.opt);
  if(!S.aiHist)S.aiHist=[];
  S.aiHist.push({head:scene.replace(/\s/g,"").slice(0,30),full:scene.slice(0,400),recap:rest.recap||""});
  while(S.aiHist.length>3)S.aiHist.shift();
  saveGame(true);
  return sc;
 });
};
AI.run=function(a){
 a=a||{};
 return AI.once(a).then(function(sc){return sc;},function(e){
  if(a._retry)throw e;
  if(!(e&&(e.kind==="parse"||e.kind==="schema")))throw e;
  var b={};for(var k in a)b[k]=a[k];b._retry=1;b._why=e.why||(e.kind==="parse"?"不是合法 JSON":"格式不符");
  return AI.once(b);
 });
};
