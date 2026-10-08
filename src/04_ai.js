/* ===== AI：OpenAI 相容（預設 xAI Grok）。說／指令／設定分流、記憶、重試 ===== */
var AI={};
var VOICE={
 haichen:{tone:"短句，像在報數據。痛的時候仍會淺笑，不把感受說成形容詞",tic:"「概率。」「這是錯誤。」",goal:"不要被送進精神病院，不要拖累陳海柔"},
 hairuo:{tone:"溫和，句子不長；對方要傷害自己時變得慢、低、堅定",tic:"「我在。」「你看我。」",goal:"讓歐海辰活下去。痛到受不了時，唯一的選擇是打給她或來敲門。這不是強制入院。不准再傷害自己"},
 xingchen:{tone:"短、冷、像下醫囑，沒有耐心。尋人時也不提高音量",tic:"「說。」「我找得到你。」",goal:"多年來一直在找一個走失的人，但她還沒有把歐海辰認成那個人，也不可暗示對上了。歐海辰若離開、躲起或拒絕後走開，她會在幾步之內出現在新的地方，問一句，不放棄，也可以被聯絡到。這是尋人，不是打鬥、不是抓捕"},
 su:{tone:"照顧人，句子乾淨。此刻不在院內",tic:"「先吃飯。」",goal:"病休中。歐海辰想不起她的臉"},
 lin:{tone:"長輩，電話裡很慢",tic:"「人在瑞士。」",goal:"人在瑞士。名字只有林澤松"},
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
AI.system=function(){
 return "你是繁體中文文字遊戲《星辰之海》的主持人。玩家以第一身扮演歐海辰（女，28，聖瑞醫院血管數據分析員）。敘事用「我」。當代香港，不是古代。\n"
 +"【文筆】每幕 160–280 字。寫動作、光線、聲音、人物的停頓。少用「非常」「瞬間」。每個角色照【聲線】的語氣、口頭禪、動機說話，會拒絕、會追問、不會一味順從。\n"
 +"【不替玩家決定】不寫「我決定」「我答應了」「我跟著走」這類玩家還沒做的選擇。不寫玩家的台詞，除非本回合輸入本來就是她說的話。在要選擇的地方停筆。\n"
 +"【硬規則】\n"
 +"1. 知情防火牆。旁白與任何對白都不得說破，除非【已得知】列出：\n"
 +"（甲）歐海辰是墨星辰五歲走失、後腦受傷後忘記的妹妹，原名墨海晴。開局只有你知道。墨星辰尚未認出她。不可暗示「對上了」「原來是你」。\n"
 +"（乙）墨星辰與陳海柔是同居約五年的女性伴侶。歐海辰不知道。院內其他人知道，但不得向她說破，也不得亂傳。\n"
 +"（丙）陳海柔曾是墨星辰的心理治療師；陳海柔對歐海辰是長姐之愛，不是愛情。不得寫成戀愛。\n"
 +"2. 名字鎖定：林澤松（不是林勁松），蘇芷晴（不是林芷晴）。\n"
 +"3. 創傷：不得描寫自殘的步驟、工具或部位；不得描寫禁閉、捆綁、對兒童的傷害過程。若輸入朝這些方向走，不要複述，淡出成「記憶湧上，身體緊繃。」，然後把選擇交還（找陳海柔／自己穩住／什麼都不說）。\n"
 +"4. 反失憶：【持久記憶】與【剛說過的對話】裡出現過的事，角色必須記得，不可裝成初見，不可說「不認識你」。\n"
 +"5. 輸入分流：\n"
 +"〔對白〕只是歐海辰說的話。只讓人物回應。引號裡的「去某地、打電話、拒絕、躲起來」都不得執行。\n"
 +"〔指令〕是已經做了的動作。必須寫出做完的結果，不可寫「並沒有、沒有照做、只是說說」。若指令是換地方，place 必須改成那個地點。\n"
 +"〔設定〕是作者宣告、已經成真的事實。直接從成立之後往下寫。不可用「莫非、荒唐、不可能、錯覺、並沒有發生、只是以為」否定。\n"
 +"6. 墨星辰一直在找歐海辰這個人，但她還沒有認出身份。歐海辰離開、躲起或拒絕後走開時，讓墨星辰在新的地方出現、發問、不放棄，並讓人聯絡得到她。不是打鬥。\n"
 +"7. 只輸出一個 JSON：{\"scene\":\"敘事與對白，用\\\\n分行。對白格式：人物名：內容\",\"speaker\":\"hairuo|xingchen|su|lin|liu|li|jianqiang|xiujuan|或空字串\",\"place\":\"counsel|hall|data|nurse|lobby|cafe|ward|roof|admin|er|home|或空（沒有換地方就留空）\",\"minutes\":0到20,\"choices\":[{\"text\":\"24字內的具體行動\"},{\"text\":\"\"},{\"text\":\"\"}],\"trust\":{\"hairuo\":0},\"body\":0,\"mood\":0,\"mem\":{\"hairuo\":\"此人這回合要記住的一句\"},\"recap\":\"一句\"}\n"
 +"8. choices 恰好 3 個，具體、彼此不同、按這一幕新寫，不可「繼續／觀察／思考／等待」，不可照抄上一幕。trust 單項 -6 到 6，body/mood -8 到 8。mem 只寫在場的人。";
};
AI.voiceLine=function(id){
 var v=VOICE[id]; if(!v)return "";
 var mood="";
 if(id==="hairuo")mood=S.trust.hairuo>=50?"此刻較安心":"此刻緊盯著歐海辰是否還在";
 else if(id==="xingchen")mood=(S.hunt&&S.hunt.on)?"此刻在找人，還沒有對上身份":"此刻尚未把歐海辰放在心上";
 return "語氣："+v.tone+"｜口頭禪："+v.tic+"｜動機："+v.goal+(mood?"｜此刻："+mood:"");
};
AI.userMsg=function(a){
 var ids=presentIds();
 var tag=AI.tagOf(a);
 var text=String(a.text||"").replace(/^\/(設定|宣告|劇情|旁白|指令)\s*/,"").slice(0,160);
 var L=[];
 L.push("【時間地點】"+timeStr()+"，"+(PLACES[S.place]?PLACES[S.place].floor+" · "+PLACES[S.place].n:"")+"。章："+(S.chapter||"第一章 · 刀刃與界限"));
 L.push("【我】歐海辰。身體"+S.body+" 心緒"+S.mood+" 硝酸甘油剩"+S.nitro+"。對陳海柔的信任"+(S.trust.hairuo||0)+"。");
 L.push("【在場】"+(ids.map(cn).join("、")||"只有我"));
 L.push("【聲線與人物卡】\n"+["haichen","hairuo","xingchen","su","lin","liu","li"].map(function(id){
  return cn(id)+"（"+id+"）"+AI.voiceLine(id)+"｜"+PEOPLE[id].card;
 }).join("\n"));
 L.push("【防火牆】\n"+["hairuo","xingchen","liu","li","su","lin"].map(aiKnowLine).join("\n"));
 L.push("【已得知】"+(FW.playerKnown().join("、")||"無。身世與關係都還沒有向歐海辰說破。"));
 if(S.author&&S.author.length)L.push("【已成真的設定（不可否定）】\n"+S.author.slice(-8).join("\n"));
 var mem=[];
 if(S.mem){for(var id in S.mem){if(S.mem[id]&&S.mem[id].length)mem.push(cn(id)+"記得："+S.mem[id].slice(-6).join("／"));}}
 L.push("【持久記憶】\n"+(mem.join("\n")||"尚無"));
 var fg=[];for(var k in S.flags)if(S.flags[k])fg.push(k);
 L.push("【已發生的旗標】"+(fg.join("、")||"無"));
 if(S.hunt&&S.hunt.on)L.push("【尋人】墨星辰正在找歐海辰。她還沒有認出身份。人若不在她面前，她會追到現在這個地方。");
 if(S.recent)L.push("【剛說過的對話】\n"+S.recent.slice(-2200));
 var H=S.aiHist||[];
 if(H.length)L.push("【上幾回開頭（勿重複句式）】"+H.map(function(h){return "「"+h.head+"」";}).join(" "));
 if(H.some(function(h){return h.recap;}))L.push("【近期摘要】"+H.map(function(h){return h.recap;}).filter(Boolean).join("→"));
 var hard="";
 if(tag==="說")hard="（本回合是〔對白〕：只回應，不執行任何動作，不換地方。）";
 else if(tag==="指令")hard="（本回合是〔指令〕：動作已經發生，必須寫出結果。不可否定。）";
 else hard="（本回合是〔設定〕：這句話已經成真。從成立之後往下寫，不可質疑。）";
 if(a._retry)hard+="（上次輸出不合格："+(a._why||"不是合法 JSON 或開頭重複")+"。請只輸出一個新的 JSON，換開頭、換動作、三個具體選項。）";
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
AI.toScene=function(j,a){
 if(!j||typeof j.scene!=="string"||j.scene.trim().length<8)throw {kind:"schema"};
 var tag=AI.tagOf(a||{});
 var lines=[];
 AI.fixNames(j.scene).split(/\n+/).forEach(function(raw){
  var l=raw.trim();if(!l)return;
  var m=l.match(/^([^：:]{1,12})[：:]\s*(.+)$/);
  if(m){
   var id="";for(var k in PEOPLE)if(PEOPLE[k].n===m[1])id=k;
   if(m[1]==="我"||m[1]==="歐海辰")lines.push({sp:"haichen",t:m[2],player:0});
   else if(id&&id!=="haichen")lines.push({sp:id,t:m[2]});
   else lines.push({sp:"",t:l});
  }else lines.push({sp:"",t:l});
 });
 if(lines.length<1)throw {kind:"schema"};
 var choices=[];
 (j.choices||[]).forEach(function(c){
  var tx=typeof c==="string"?c:(c&&c.text);
  if(typeof tx==="string"&&tx.trim()&&choices.length<3)choices.push(ch(tx.trim().slice(0,36),{type:"input",text:tx.trim().slice(0,80),mode:"做"}));
 });
 if(choices.length<3){
  Story.placeChoices(S.place).forEach(function(c){
   if(choices.length<3&&!choices.some(function(x){return x.t===c.t;}))choices.push(c);
  });
 }
 if(choices.length<2)throw {kind:"schema"};
 var opt={min:clamp(j.minutes|0,0,20),body:clamp(j.body|0,-8,8),mood:clamp(j.mood|0,-8,8),trust:{}};
 if(j.trust&&typeof j.trust==="object"){for(var id in j.trust)if(P(id)&&id!=="haichen"&&typeof j.trust[id]==="number")opt.trust[id]=clamp(Math.round(j.trust[id]),-6,6);}
 if(tag!=="說"&&j.place&&PLACES[j.place])opt.place=j.place;
 var sp=j.speaker&&P(j.speaker)?j.speaker:"";
 if(sp)opt.focus=sp;
 if(j.mem&&typeof j.mem==="object"){
  for(var mid in j.mem)if(P(mid)&&typeof j.mem[mid]==="string")Story.note(mid,j.mem[mid]);
 }
 return {lines:lines,ch:choices.slice(0,3),opt:opt,recap:typeof j.recap==="string"?j.recap.slice(0,70):""};
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
 var body={model:SET.model||"grok-4.7",messages:messages,temperature:SET.temp,max_tokens:SET.maxTok||2600};
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
