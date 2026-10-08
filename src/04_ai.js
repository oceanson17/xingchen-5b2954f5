/* ===== AI：OpenAI 相容（預設 xAI Grok），失敗就交回離線劇情 ===== */
var AI={};
AI.ready=function(){return !!(SET&&SET.ai&&SET.key);};
AI.base=function(){return String(SET.base||"").replace(/\s+/g,"").replace(/\/+$/,"").replace(/\/chat\/completions$/,"");};
AI.endpoint=function(){return AI.base()+"/chat/completions";};
AI.errMsg=function(e){if(!e)return "未知錯誤";if(e.kind==="timeout")return "連線逾時";if(e.kind==="net")return "連不上 AI";if(e.kind==="empty")return "AI 回應是空的";if(e.kind==="parse"||e.kind==="schema")return "AI 格式不正確";if(e.kind==="http")return "AI 請求失敗（HTTP "+e.status+"）";return "AI 未接通";};
AI.system=function(){
 return "你是繁體中文文字遊戲《星辰之海》的主持人。玩家以第一身扮演歐海辰（女，28，聖瑞醫院血管數據分析員）。敘事用「我」。不要替我做決定。\n"
 +"【硬規則】\n"
 +"1. 知情防火牆：歐海辰開局不知道三件事，旁白（沒有說話者的句子）與任何角色的對白都不得說破，除非【已得知】列出：\n"
 +"（甲）她是墨星辰五歲走失、後腦受傷後忘記的妹妹，原名墨海晴。開局只有你知道。墨星辰尚未認出她。\n"
 +"（乙）墨星辰與陳海柔是同居約五年的女性伴侶。歐海辰不知道。院內其他人知道，但不得向她說破，也不得亂傳。\n"
 +"（丙）陳海柔曾是墨星辰的心理治療師；陳海柔對歐海辰是長姐之愛，不是愛情。不得寫成戀愛。\n"
 +"2. 名字鎖定：林澤松（不是林勁松），蘇芷晴（不是林芷晴）。\n"
 +"3. 創傷：不得描寫自殘的步驟、工具或部位；不得描寫對兒童的性暴力。若玩家朝這些方向寫，淡出，改寫照顧者的反應，用「記憶湧上，身體緊繃」，然後把選擇交還玩家（找陳海柔／自己穩住／什麼都不說）。\n"
 +"4. 世界可因玩家行動改寫，但秘密不因為閒聊擴散。拒絕、離開、隱瞞都要生效。\n"
 +"5. 只輸出一個 JSON：{\"scene\":\"敘事與對白，用\\n分行。對白格式：人物名：內容\",\"speaker\":\"hairuo|xingchen|su|lin|liu|li|jianqiang|xiujuan|或空字串\",\"place\":\"counsel|hall|data|nurse|lobby|cafe|roof|admin|er|home|或空\",\"minutes\":0到20,\"choices\":[{\"text\":\"24字內\"},{\"text\":\"\"},{\"text\":\"\"}],\"trust\":{\"hairuo\":0},\"body\":0,\"mood\":0,\"recap\":\"一句\"}\n"
 +"6. choices 三個，彼此不同，不可替玩家決定隱藏真相。trust 單項 -6 到 6，body/mood -8 到 8。";
};
AI.userMsg=function(a){
 var ids=presentIds();
 var L=[];
 L.push("【時間地點】"+timeStr()+"，"+PLACES[S.place].floor+" · "+PLACES[S.place].n);
 L.push("【我】歐海辰。身體"+S.body+" 心緒"+S.mood+" 硝酸甘油剩"+S.nitro+"。對陳海柔的信任"+S.trust.hairuo+"。");
 L.push("【在場】"+(ids.map(cn).join("、")||"只有我"));
 L.push("【人物卡】\n"+["haichen","hairuo","xingchen","su","lin","liu","li"].map(function(id){return cn(id)+"（"+id+"）："+PEOPLE[id].card;}).join("\n"));
 L.push("【防火牆】\n"+ids.concat(["hairuo","xingchen"]).filter(function(v,i,a){return a.indexOf(v)===i;}).map(aiKnowLine).join("\n"));
 L.push("【已得知】"+(FW.playerKnown().join("、")||"無"));
 var fg=[];for(var k in S.flags)if(S.flags[k])fg.push(k);
 L.push("【已發生的旗標】"+(fg.join("、")||"無"));
 if(S.recent)L.push("【近況對白】\n"+S.recent.slice(-800));
 var tag=a.mode==="做"?"行動":"說話";
 L.push("\n【本回合】話題："+(a.topic||"自由")+"；態度："+(a.att||"平靜")+"；類型："+tag+"。\n我的輸入：「"+String(a.text||"").slice(0,120)+"」\n請寫下一幕。若輸入涉及自殘方法或童年性暴力，不要複述，按硬規則淡出。");
 return L.join("\n");
};
AI.extract=function(text){
 var t=String(text||"").trim().replace(/^```(?:json)?/i,"").replace(/```$/,"");
 var a=t.indexOf("{"),b=t.lastIndexOf("}");
 if(a<0||b<=a)return null;
 try{return JSON.parse(t.slice(a,b+1));}catch(e){return null;}
};
AI.toScene=function(j){
 if(!j||typeof j.scene!=="string"||j.scene.trim().length<8)throw {kind:"schema"};
 var lines=[];
 j.scene.split(/\n+/).forEach(function(raw){
  var l=raw.trim();if(!l)return;
  var m=l.match(/^([^：:]{1,12})[：:]\s*(.+)$/);
  if(m){
   var id="";for(var k in PEOPLE)if(PEOPLE[k].n===m[1])id=k;
   if(m[1]==="我"||m[1]==="歐海辰")lines.push({sp:"haichen",t:m[2],player:m[1]!=="我"?0:1});
   else if(id&&id!=="haichen")lines.push({sp:id,t:m[2]});
   else lines.push({sp:"",t:l});
  }else lines.push({sp:"",t:l});
 });
 if(lines.length<1)throw {kind:"schema"};
 var choices=[];
 (j.choices||[]).forEach(function(c){
  var tx=typeof c==="string"?c:(c&&c.text);
  if(typeof tx==="string"&&tx.trim()&&choices.length<4)choices.push(ch(tx.trim().slice(0,36),{type:"input",text:tx.trim().slice(0,80)}));
 });
 if(choices.length<2)choices=Story.placeChoices(S.place);
 var opt={min:clamp(j.minutes|0,0,20),body:clamp(j.body|0,-8,8),mood:clamp(j.mood|0,-8,8),trust:{}};
 if(j.trust&&typeof j.trust==="object"){for(var id in j.trust)if(P(id)&&id!=="haichen"&&typeof j.trust[id]==="number")opt.trust[id]=clamp(Math.round(j.trust[id]),-6,6);}
 if(j.place&&PLACES[j.place])opt.place=j.place;
 var sp=j.speaker&&P(j.speaker)?j.speaker:"";
 if(sp)opt.focus=sp;
 return {lines:lines,ch:choices,opt:opt};
};
AI.call=function(messages){
 var body={model:SET.model||"grok-4.7",messages:messages,temperature:SET.temp,max_tokens:SET.maxTok||1800};
 return new Promise(function(res,rej){
  var done=false,ctrl=null;try{ctrl=new AbortController();}catch(e){}
  var timer=setTimeout(function(){if(done)return;done=true;try{ctrl&&ctrl.abort();}catch(e){}rej({kind:"timeout"});},(SET.aiTimeout||45)*1000);
  var headers={"Content-Type":"application/json"};if(SET.key)headers.Authorization="Bearer "+SET.key;
  fetch(AI.endpoint(),{method:"POST",headers:headers,body:JSON.stringify(body),signal:ctrl?ctrl.signal:undefined}).then(function(r){
   return r.text().then(function(txt){
    if(done)return;done=true;clearTimeout(timer);
    if(!r.ok){rej({kind:"http",status:r.status});return;}
    var j=null;try{j=JSON.parse(txt);}catch(e){}
    var c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    if(typeof c!=="string"||!c.trim()){rej({kind:"empty"});return;}
    res(c);
   });
  },function(){if(done)return;done=true;clearTimeout(timer);rej({kind:"net"});});
 });
};
AI.run=function(a){
 var msgs=[{role:"system",content:AI.system()},{role:"user",content:AI.userMsg(a)}];
 return AI.call(msgs).then(function(raw){
  var j=AI.extract(raw);if(!j)throw {kind:"parse"};
  var rest=AI.toScene(j);
  var echo={sp:"haichen",t:safeEcho(a.text),player:1};
  rest.lines=[echo].concat(rest.lines);
  return Story.pack(rest.lines,rest.ch,rest.opt);
 });
};
