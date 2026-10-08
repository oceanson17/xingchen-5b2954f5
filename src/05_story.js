/* ===== 離線劇情：開局諮商室，選擇會改寫旗標 ===== */
var Story={mode:"說",topic:"自由",att:"平靜"};
function ch(t,act,tag){return {t:t,act:act,tag:tag||""};}
function toneLine(att){
 var m={"平靜":"你把聲音放平，像在報一個沒有起伏的數字。","坦白":"你照實說，句子仍舊很短。","閃躲":"你把視線移到窗簾那條縫上。","冷淡":"你只給了半句。","求助":"你看向她，拇指把塑膠扣按得發白。","固執":"你重複了一次，一個字都沒有改。"};
 return m[att]||m["平靜"];
}
function safeEcho(text){
 if(Story.harm(text)||Story.abuse(text)||FW.hit(text).length)return "你開口了，聲音很快收住，沒有把那句說完。";
 var t=String(text).replace(/\s+/g," ").slice(0,80);
 return "「"+t+"」";
}
Story.harm=function(t){return /割腕|割手|自殘|自殺|輕生|上吊|跳樓|跳下去|燒炭|過量|刀片|怎麼死|想死|了結/.test(t);};
Story.abuse=function(t){return /性侵|猥褻|強姦|強暴|性暴力|摸我|脫我|上床/.test(t);};
Story.restraint=function(t){return /拘束|綁住|綁我|關進|禁閉|鎖在|五花大綁/.test(t);};
function fadeTrauma(t){
 if(/刀片|割腕|割手|劃開|血痂|儲物間|麻繩|反綁|鐵櫃|沿.{0,6}血管|上吊|燒炭|怎麼死/.test(t))return "記憶湧上，身體緊繃。";
 return t;
}
Story.note=function(id,txt){
 if(!id||id==="haichen"||!P(id))return;
 if(!S.mem)S.mem={};
 var arr=S.mem[id]||(S.mem[id]=[]);
 var s=String(txt||"").replace(/\s+/g," ").slice(0,72);
 if(!s)return;
 if(arr.length&&arr[arr.length-1]===s)return;
 arr.push(s);
 if(arr.length>8)arr.splice(0,arr.length-8);
};

function toYou(t){
 var out="",q=false,i,c;
 t=String(t||"");
 for(i=0;i<t.length;i++){
  c=t.charAt(i);
  if(c==="「")q=true;
  if(!q&&c==="我"){
   if(t.substr(i,2)==="我們"){out+="我們";i++;continue;}
   out+="你";continue;
  }
  out+=c;
  if(c==="」")q=false;
 }
 return out;
}
Story.inferTag=function(tx){
 tx=String(tx||"");
 if(/躲|不說|沉默|避開|隱|放著|什麼都不/.test(tx))return "隱匿";
 if(/拒絕|對抗|離開|逃走|不簽|不做|維持拒/.test(tx))return "對抗";
 if(/問|為什麼|身世|核對|求證|是不是/.test(tx))return "求證";
 if(/忍|坐|等|含|停|穩住|靠|再坐/.test(tx))return "忍耐";
 if(/答應|簽|接過|做完|服從|點頭|我會找|找你/.test(tx))return "服從";
 if(/說|找|打給|看著|陳海柔|求助|怕|講/.test(tx))return "連結";
 return "探索";
};
Story.normChoices=function(list){
 var out=[],seen={};
 (list||[]).forEach(function(c){
  if(!c||!c.t||out.length>=5)return;
  if(seen[c.t])return;
  seen[c.t]=1;
  if(!c.tag)c.tag=Story.inferTag(c.t);
  out.push(c);
 });
 var fill=[
  ch("把這間房再看一遍",{type:"choice",id:"quiet"},"探索"),
  ch("看向在場的人",{type:"choice",id:"go_on"},"連結"),
  ch("先忍住，什麼都不補",{type:"choice",id:"steady"},"忍耐")
 ];
 for(var i=0;i<fill.length&&out.length<3;i++){
  if(!seen[fill[i].t]){out.push(fill[i]);seen[fill[i].t]=1;}
 }
 return out;
};
Story.autoSummary=function(lines,opt){
 if(opt&&opt.summary)return String(opt.summary).slice(0,240);
 var place=(PLACES[S.place]||{}).n||"這裡";
 var sp=S.speech==null?58:S.speech;
 var risk="身體與語言都還沒有穩";
 if(S.body<50)risk="身體正在往下掉";
 else if(sp<45)risk="語言開始發緊，再壓就可能說不出";
 else if(S.mood<40)risk="心緒不穩，下一句可能由別人接走";
 var moved=(lines||[]).filter(function(l){return !l.player;}).slice(-1)[0];
 var bit=moved?String(moved.t).replace(/\s/g,"").slice(0,46):"時間往前走了，人還沒有把選擇做完";
 var ten=(opt&&opt.tension)||"有一句話還沒有被說完";
 return "人在"+place+"。"+bit+"。風險："+risk+"。未解："+ten+"。";
};
Story.snapshot=function(extra){
 var here=function(id){return presentIds().indexOf(id)>=0;};
 var hCore=here("hairuo")?"人在這間房。專業與情感正在互相拉，她沒有放棄你":"人不在你眼前，但沒有放棄你，也沒有放棄墨星辰";
 var hLine=S.rel>=45?"此刻仍想先接住你，手卻按在可以下決定的那一側":"此刻自責壓著，可能改用更硬的照護把你留在她看得見的地方";
 var xCore=here("xingchen")?"人已經到你面前。她仍未把你認成要找的那一個":"仍在找一個尚未對上的人。這一幕她還沒有進門";
 var xLine=(S.hunt&&S.hunt.on)?"決策：繼續找，不提高音量，也不停":"決策：這一幕不進場。尋人沒有結束";
 var oCore="結構變數。身體"+S.body+"，語言"+(S.speech==null?58:S.speech)+"，心緒"+S.mood;
 var oLine=(S.speech!=null&&S.speech<40)?"此刻句子接不上。世界會先動":"此刻還能用短句。怕被送走，也怕拖累人";
 if(S.mood<35)oLine="情緒淹沒。下一刻不一定由你開口";
 var base=[
  {n:"陳海柔",role:"臨床心理學家",core:hCore,line:hLine},
  {n:"墨星辰",role:"聖瑞副院長 · 心胸外科的頂點",core:xCore,line:xLine},
  {n:"歐海辰",role:"血管數據分析員",core:oCore,line:oLine}
 ];
 if(extra&&typeof extra==="object"){
  var map={hairuo:0,xingchen:1,haichen:2,"陳海柔":0,"墨星辰":1,"歐海辰":2};
  for(var k in map){
   var m=extra[k]; if(!m||typeof m!=="object")continue;
   var ix=map[k];
   var core=FW.scrubLine(String(m.core||""),"");
   var line=FW.scrubLine(String(m.line||""),"");
   var role=String(m.role||"");
   if(core&&core.indexOf("沒有說出口")<0&&core.length>1)base[ix].core=core.slice(0,80);
   if(line&&line.indexOf("沒有說出口")<0&&line.length>1)base[ix].line=line.slice(0,80);
   if(role&&role.indexOf("伴侶")<0&&role.indexOf("墨海晴")<0&&role.indexOf("同居")<0)base[ix].role=role.slice(0,28);
  }
 }
 base.forEach(function(row){
  row.core=FW.scrubLine(row.core,"");
  row.line=FW.scrubLine(row.line,"");
 });
 return base;
};
Story.isSilence=function(text){
 var s=String(text||"").trim();
 if(!s)return false;
 if(s==="..."||s==="…"||s==="……"||s==="。。。"||s==="沉默")return true;
 if(s.length<4)return true;
 if(/^(拒絕|拒絕行動|不行動|什麼都不做|不想動|不要動|算了|隨便|不|不行)$/.test(s))return true;
 return false;
};
Story.povAsk=function(text){
 var s=String(text||"");
 if(!/視角|眼睛|眼中|第三人稱|換人稱|切換/.test(s))return "";
 var names=[["陳海柔","hairuo"],["墨星辰","xingchen"],["林澤松","lin"],["歐海辰","haichen"],["蘇芷晴","su"],["劉啟明","liu"],["李珮儀","li"]];
 for(var i=0;i<names.length;i++)if(s.indexOf(names[i][0])>=0)return names[i][1];
 if(/第三人稱/.test(s))return "third";
 return "";
};
Story.traceOf=function(tr){
 if(!tr||!tr.k)return;
 if(!S.traces)S.traces=[];
 S.traces.push({k:String(tr.k).slice(0,8),who:tr.who||"",note:String(tr.note||"").slice(0,80),at:timeStr()});
 if(S.traces.length>16)S.traces=S.traces.slice(-16);
 if(tr.who&&tr.who!=="haichen")Story.note(tr.who,(tr.k||"痕跡")+"："+String(tr.note||"").slice(0,40));
};
Story.silenceScene=function(){
 S.flags.silence=(S.flags.silence||0)+1;
 var lines=[];
 var flooded=(S.speech!=null&&S.speech<36)||S.mood<35;
 var who=presentIds().indexOf("hairuo")>=0?"hairuo":(presentIds()[0]||"");
 if(presentIds().indexOf("hairuo")>=0){
  lines.push({sp:"hairuo",t:flooded?"你先別找句子。我看得到你還在。這節不會因為你不出聲就結束，我也不會假裝什麼都沒發生。":"沉默也算數。我不把空格填成我想聽的。時鐘還是往前走。"});
  lines.push({sp:"",t:"你沒有補上下一句。喉嚨發緊，視野邊緣薄薄起了一層霧。拇指把那枚塑膠扣又按深一點。"});
 } else if(presentIds().indexOf("xingchen")>=0){
  lines.push({sp:"xingchen",t:"不說也可以。人還在。我看見了。下一處你若空著，我還是會問。"});
  lines.push({sp:"",t:"你的嘴沒有跟上。呼吸比剛才淺，胸口那陣緊抬了一下頭。"});
 } else {
  lines.push({sp:"",t:"沒有人等你把句子說完。牆上的鐘走了一格。胸口那陣緊自己抬起來，又停在一半。"});
 }
 lines.push({sp:"",t:"未完的那一句還卡在齒間。"});
 return {lines:lines,ch:Story.placeChoices(S.place),opt:{
  min:5,speech:-3,mood:-2,body:-1,trust:{hairuo:1},
  summary:"你幾乎沒有給出行動。世界仍往前走了一小段：有人先開口，或一個症狀自己動了。風險是語言再降，選擇權會被別人接走。未解：她在等的那一句，你還沒有給。",
  tension:"下一拍若仍是空的，在場的人會替你做一個你可能不接受的判斷",
  trace:{k:"缺席",who:who||"hairuo",note:"你以沉默或拒絕把這一拍交了出去"}
 }};
};

Story.armHunt=function(why){
 if(!S.hunt)S.hunt={on:0,miss:0,n:0};
 S.hunt.on=1;
 if(why)S.hunt.why=why;
};
Story.tickHunt=function(lines,opt){
 if(opt&&opt.noHunt)return lines;
 if(!S.hunt||!S.hunt.on)return lines;
 if(presentIds().indexOf("xingchen")>=0){S.hunt.miss=0;return lines;}
 S.hunt.miss=(S.hunt.miss||0)+1;
 if(S.hunt.miss<2)return lines;
 S.ppl.xingchen.loc=S.place;
 S.ppl.xingchen.around=1;
 S.focus="xingchen";
 S.hunt.miss=0;
 S.hunt.n=(S.hunt.n||0)+1;
 var q=[
  "歐海辰。你不在原處。我找過了。你可以不答。下一處你若再走，我還是會來問。",
  "我找到你了。這不是審問。陳海柔要知道你還在。你也可以打給我，我接。",
  "人可以躲。我還是會找。你現在在這裡。想走可以走，我會再出現。"
 ];
 var line=q[Math.min(S.hunt.n-1,q.length-1)];
 Story.note("xingchen","在"+((PLACES[S.place]||{}).n||"這裡")+"找到歐海辰。還沒有對上任何身份");
 return lines.concat([
  {sp:"",t:"門邊多了一個人。短而亂的黑髮，白襯衫，黑框眼鏡。墨星辰看著我，沒有笑。"},
  {sp:"xingchen",t:line}
 ]);
};
Story.pack=function(lines,choices,opt){
 opt=opt||{};
 if(opt.place)S.place=opt.place;
 if(opt.focus)S.focus=opt.focus;
 if(opt.min)passMin(opt.min);
 if(S.deadline&&opt.min){
  S.deadline.left=Math.max(0,(S.deadline.left|0)-(opt.min|0));
  if(S.deadline.left<=0)S.flags.deadlineHit=1;
 }
 if(typeof S.speech!=="number")S.speech=58;
 if(typeof S.rel!=="number")S.rel=(S.trust&&S.trust.hairuo)||36;
 var b0=S.body,s0=S.speech,m0=S.mood,r0=S.rel;
 S.body=clamp(S.body+(+opt.body||0),0,100);
 S.speech=clamp(S.speech+(+opt.speech||0),0,100);
 S.mood=clamp(S.mood+(+opt.mood||0),0,100);
 if(opt.trust){for(var id in opt.trust)S.trust[id]=clamp((S.trust[id]||0)+opt.trust[id],0,100);}
 if(opt.trust&&typeof opt.trust.hairuo==="number")S.rel=S.trust.hairuo;
 if(typeof opt.rel==="number"){S.rel=clamp(S.rel+opt.rel,0,100);S.trust.hairuo=S.rel;}
 S.delta={body:S.body-b0,speech:S.speech-s0,mood:S.mood-m0,trust:S.rel-r0};
 if(opt.trace)Story.traceOf(opt.trace);
 var pov=opt.pov||S._povAsk||"";
 S._povAsk="";
 lines=Story.tickHunt(lines||[],opt);
 lines=lines.map(function(l){
  if(l.player)return l;
  var tx=fadeTrauma(l.t);
  if(!l.sp)tx=toYou(tx);
  if(pov&&pov!=="haichen"&&!l.sp)tx=tx.replace(/你/g,"歐海辰");
  return {sp:l.sp||"",t:tx,player:0};
 });
 if(pov&&pov!=="haichen"){
  var eye=pov==="third"?"第三人稱":cn(pov);
  lines=[{sp:"",t:"這一幕從"+eye+"的眼睛看。"}].concat(lines);
 }
 var ids=presentIds();
 if(S.focus && ids.indexOf(S.focus)<0)S.focus=ids[0]||"";
 var sc=FW.scrubScene({lines:lines,ch:Story.normChoices(choices||[])});
 sc.lines.forEach(function(l){
  S.log.push({sp:l.sp||"",t:l.t,player:l.player?1:0});
  if(l.sp&&l.sp!=="haichen"&&!l.player)Story.note(l.sp,l.t);
 });
 var heard=sc.lines.filter(function(l){return l.player;}).map(function(l){return String(l.t).replace(/[「」]/g,"");}).join("");
 if(heard)presentIds().forEach(function(id){Story.note(id,"歐海辰當時說："+heard.slice(0,36));});
 if(S.log.length>240)S.log=S.log.slice(-240);
 var summary=FW.scrubLine(toYou(Story.autoSummary(sc.lines,opt)),"");
 if(!summary||summary.indexOf("沒有說出口")>=0)summary=Story.autoSummary(sc.lines,{tension:opt.tension||"有一句話還沒有被說完"});
 S.turn={
  summary:summary,
  delta:S.delta,
  countdown:S.deadline?{label:S.deadline.label,left:S.deadline.left}:null,
  snap:Story.snapshot(opt.snapIn),
  pov:pov||"haichen",
  control:S.control||"haichen",
  tension:opt.tension||""
 };
 S.view={lines:sc.lines,ch:sc.ch};
 S.recent=S.log.slice(-18).map(function(l){return (l.player?"你：":(l.sp?cn(l.sp)+"：":""))+l.t;}).join("\n").slice(-2400);
 saveGame(true);
 return sc;
};
Story.placeChoices=function(pid){
 if(pid==="roof")return [ch("回到走廊",{type:"go",place:"hall"}),ch("靠門坐下",{type:"choice",id:"roof_sit"}),ch("去找陳海柔",{type:"go",place:"counsel"})];
 if(pid==="admin")return [ch("敲門",{type:"choice",id:"knock"}),ch("回大堂",{type:"go",place:"lobby"}),ch("什麼都不做",{type:"choice",id:"quiet"})];
 if(pid==="data")return [ch("接下那些表",{type:"choice",id:"take_work"}),ch("拒絕今天的表",{type:"choice",id:"refuse_work"}),ch("回諮商室",{type:"go",place:"counsel"})];
 if(pid==="counsel")return [ch("繼續說",{type:"choice",id:"go_on"}),ch("什麼都不說",{type:"choice",id:"quiet"}),ch("談今天的工作",{type:"choice",id:"work"}),ch("我想離開",{type:"choice",id:"leave"})];
 if(pid==="ward")return [ch("躺回床上",{type:"choice",id:"quiet"}),ch("下床站著",{type:"choice",id:"steady"}),ch("去找陳海柔",{type:"go",place:"counsel"})];
 if(pid==="er")return [ch("掛號坐下",{type:"choice",id:"er_wait"}),ch("不去檢查",{type:"choice",id:"refuse_exam"}),ch("回諮商室",{type:"go",place:"counsel"})];
 if(pid==="home")return [ch("把藥盒轉正",{type:"choice",id:"pills"}),ch("含硝酸甘油",{type:"choice",id:"nitro"}),ch("回醫院大堂",{type:"go",place:"lobby"})];
 return [ch("去諮商室",{type:"go",place:"counsel"}),ch("去數據室",{type:"go",place:"data"}),ch("先站一會兒",{type:"choice",id:"quiet"})];
};
Story.arrive=function(pid){
 var L={
  counsel:[{sp:"",t:"諮商室的燈還是白的。我回到單人沙發上，拇指又去找那枚塑膠扣。"},{sp:"hairuo",t:"你回來了。坐。要說、要不說，都還是你的。"}],
  hall:[{sp:"",t:"心理科走廊有消毒水的味道。我數地磚，一、二、三，讓腳步跟上心口。"}],
  data:[{sp:"",t:"血管數據室的螢幕一排排亮著。李珮儀把一疊表往我這邊推，像推開自己的下午。"},{sp:"liu",t:"歐海辰。表，今天。"},{sp:"li",t:"你看一下嘛，我等下真的有事。"}],
  nurse:[{sp:"",t:"護士站的告示寫著護士長病休，名字是蘇芷晴。我讀了兩遍，沒有面孔跟上來。"}],
  lobby:[{sp:"",t:"大堂的冷氣更乾。旋轉門轉得很慢。我可以出去，也可以回頭。"}],
  cafe:[{sp:"",t:"咖啡機的噪音很穩。我坐在靠牆的位子，把糖包的邊角轉正。"}],
  roof:[{sp:"",t:"天台的風很大。我停在門邊，沒有往邊緣走。天很亮，視野卻有一點霧。"}],
  ward:[{sp:"",t:"單人病房的燈調得很暗。儀器的聲音很小。我站在床邊，沒有躺下。"}],
  admin:[{sp:"",t:"行政走廊的地毯吸走腳步聲。副院長室的門關著，門牌是墨星辰。我的手指在衣角上停住。"}],
  er:[{sp:"",t:"急診的燈更白。有人問我要不要掛號。我報出職員編號，聲音像在讀表。"}],
  home:[{sp:"",t:"出租屋很小。藥盒排在桌上，標籤朝外。硝酸甘油在最上面那格。我把鎖反鎖了兩次。"}]
 };
 return (L[pid]||[{sp:"",t:"我站在"+((PLACES[pid]||{}).n||"這裡")+"，先讓呼吸慢下來。"}]).map(function(x){return {sp:x.sp,t:x.t};});
};
Story.opening=function(){
 S.place="counsel";S.focus="hairuo";S.chapter="第一章 · 刀刃與界限";
 S.ppl.hairuo.loc="counsel";S.ppl.hairuo.around=1;
 if(S.hunt)S.hunt.on=0;
 return Story.pack([
  {sp:"",t:"第一章 · 刀刃與界限"},
  {sp:"",t:"諮商室。午後。窗簾只留一條縫，白燈打在紙上。你坐得很直，雙手交疊在膝上，拇指摩挲衣角上一枚磨圓的塑膠扣。喉嚨是乾的。視野邊緣有一層很薄的霧，還沒有厚到看不清她。"},
  {sp:"",t:"陳海柔低頭看你剛交上的一週記錄。表上的數字，比你心裡那份真實要輕。睡眠、疼痛、頭痛，你都寫得比較好過。她的筆尖沒有動。你聽見自己的脈搏，比這間房的鐘快。"},
  {sp:"",t:"她的手指在紙頁上停住。她注意到了。空氣裡有消毒水，很淡，像從走廊漏進來。"},
  {sp:"",t:"你怕下一句是精神科病房。記憶湧上，身體緊繃。肩膀抬起來，又被你自己壓回去。你沒有把那段補完，痛的時候嘴角仍是平的。"},
  {sp:"hairuo",t:"看著我。這不是強制入院。我不會用一張表把你送走。"},
  {sp:"hairuo",t:"如果痛到受不了，你唯一的選擇，是打電話給我，或者直接來敲門。"},
  {sp:"hairuo",t:"我不准你再傷害自己。你的命，我管。"}
 ],[
  ch("說出怕被送進病房",{type:"choice",id:"fear"},"對抗"),
  ch("什麼都不說",{type:"choice",id:"quiet"},"隱匿"),
  ch("答應痛的時候去找她",{type:"choice",id:"promise"},"服從"),
  ch("問她這節會不會被寫進病歷",{type:"choice",id:"go_on"},"求證")
 ],{min:0,noHunt:1,trust:{hairuo:1},mood:1,
  summary:"第一章停在諮商室。記錄被她看穿，她把「不是強制入院」和「痛了就來敲門」放到你面前。風險是你一沉默，她可能改用更硬的方式把你留住。未解：你還沒有回答，要不要把這條命交到她手上。",
  tension:"她的手按在可以下決定的那一側，你還沒有說是或不是",
  trace:{k:"安撫",who:"hairuo",note:"她接過你的命，也不許你再傷害自己"}});
};
Story.go=function(pid){
 if(!PLACES[pid])return S.view;
 var from=S.place;
 var lines=[];
 if(from==="counsel"&&pid!=="counsel"&&!S.flags.leftCounsel){
  S.flags.leftCounsel=1;
  lines.push({sp:"",t:"我站起來。膝上的摺痕還在。"});
  lines.push({sp:"hairuo",t:"門在。你要走可以走。我還在這間房，也在你願意回來的時候。"});
 }
 if(pid!==from)Story.armHunt("leave");
 S.place=pid;
 var ids=presentIds();
 S.focus=ids[0]||"";
 lines=lines.concat(Story.arrive(pid));
 return Story.pack(lines,Story.placeChoices(pid),{min:8});
};
Story.contact=function(id){
 var lines=[];
 if(id==="hairuo"){
  if(presentIds().indexOf("hairuo")>=0){lines.push({sp:"",t:"陳海柔就坐在斜對面。我不必打電話。"});lines.push({sp:"hairuo",t:"我在。你看我就好。"});}
  else {lines.push({sp:"",t:"我撥給陳海柔。她接得很快。"});lines.push({sp:"hairuo",t:"我在。你說你在哪，或者什麼都不說。我都可以。"});S.flags.calledHairuo=1;S.trust.hairuo=clamp(S.trust.hairuo+2,0,100);}
 }
 else if(id==="liu"){lines.push({sp:"",t:"我撥給劉啟明。響了很久。"});lines.push({sp:"liu",t:"說。表呢？沒別的事就掛。"});S.flags.calledLiu=1;}
 else if(id==="li"){lines.push({sp:"",t:"李珮儀幾乎是秒接。"});lines.push({sp:"li",t:"幹嘛？那些表你看完沒有？我真的趕時間。"});}
 else if(id==="xingchen"){
  lines.push({sp:"",t:"總機把電話轉進副院長室。她接了，沒有讓我報預約編號。"});
  lines.push({sp:"xingchen",t:"歐海辰。說你在哪。你找我，我聽。我找你，也不會停。"});
  S.flags.reachedXingchen=1;
  Story.note("xingchen","歐海辰打過電話來，人還聯絡得到");
 }
 else if(id==="su"){lines.push({sp:"",t:"通訊錄裡有一個沒有備註的號碼。我看著它，沒有撥。沒有面孔，沒有聲音，像一份被清空的檔案。"});S.flags.blankSu=1;}
 else if(id==="lin"){lines.push({sp:"",t:"打給院長林澤松的國際長途沒有接通。瑞士那邊還早。我只留下自己的名字：歐海辰。"});S.flags.calledLin=1;}
 else if(id==="jianqiang"||id==="xiujuan"){
  lines.push({sp:"",t:"那個號碼還在。我的拇指停在撥出上面，沒有按下去。"});
  lines.push({sp:"",t:"記憶湧上，身體緊繃。我把電話扣在桌上，螢幕朝下。"});
  S.flags.almostCalledHome=1;S.mood=clamp(S.mood-6,0,100);
 }
 else {lines.push({sp:"",t:"這通電話我沒有打出去。"});}
 var chs=[ch("找陳海柔",{type:"go",place:"counsel"}),ch("自己穩住",{type:"choice",id:"steady"}),ch("什麼都不說",{type:"choice",id:"quiet"})];
 if(id==="hairuo")chs=Story.placeChoices(S.place);
 return Story.pack(lines,chs,{min:5});
};
Story.crisis=function(){
 var lines=[{sp:"",t:"那一段我沒有說出過程。畫面在我這邊淡掉。"},{sp:"",t:"記憶湧上，身體緊繃。"}];
 var ids=presentIds();
 if(ids.indexOf("hairuo")>=0){
  lines.push({sp:"hairuo",t:"海辰。我們不談做法。你現在可以找我、自己穩住，或者什麼都不說。"});
 } else lines.push({sp:"",t:"這裡沒有人追問。你還站得住。"});
 S.flags.crisis=1;
 return Story.pack(lines,[
  ch("找陳海柔",{type:"go",place:"counsel"},"連結"),
  ch("自己穩住",{type:"choice",id:"steady"},"忍耐"),
  ch("什麼都不說",{type:"choice",id:"quiet"},"隱匿")
 ],{min:3,mood:-4,speech:-6,body:-2,trust:{hairuo:2},trace:{k:"安撫",who:"hairuo",note:"沒有追問做法，只把選擇交回。身體仍緊"},
  summary:"那一段沒有被說成做法。記憶湧上，身體緊繃，語言往下掉。風險是你下一句會交不出去。未解：她接住了人，沒有接住原因。"});
};
Story.flash=function(){
 var lines=[{sp:"",t:"記憶湧上，身體緊繃。你沒有把那段說完。"}];
 if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"你安全。想停就停。我不會要你把細節補完。"});
 else lines.push({sp:"",t:"你把句子咽回去，腳踩實地面。"});
 S.flags.flash=1;
 return Story.pack(lines,[
  ch("找陳海柔",{type:"go",place:"counsel"},"連結"),
  ch("自己穩住",{type:"choice",id:"steady"},"忍耐"),
  ch("什麼都不說",{type:"choice",id:"quiet"},"隱匿")
 ],{min:3,mood:-5,speech:-5,trace:{k:"缺席",who:"hairuo",note:"記憶湧上之後，你沒有把細節補完"},
  summary:"記憶湧上，身體緊繃。沒有人拿到過程。風險是心緒和語言一起往下。未解：那段還在，只是沒有被說完。"});
};
Story.byId=function(id){
 if(id==="go_on"){
  S.flags.cooperated=1;
  return Story.pack([
   {sp:"",t:"我數了三秒，還是開口。內容很碎：睡眠時數、未完成的表、頭痛的分數。"},
   {sp:"",t:"痛的時候我淺淺笑了一下。我自己知道。"},
   {sp:"hairuo",t:"碎片也可以。你說到哪，我們停在哪。你不必一次交完整份報告。"}
  ],[ch("再講工作",{type:"choice",id:"work"}),ch("先停在這裡",{type:"choice",id:"quiet"}),ch("我不要被送走",{type:"choice",id:"fear"})],{min:10,mood:3,trust:{hairuo:4}});
 }
 if(id==="quiet"){
  S.flags.quiet=(S.flags.quiet||0)+1;
  var line=presentIds().indexOf("hairuo")>=0
   ?[{sp:"",t:"我搖頭。塑膠扣在拇指下轉了一圈。"},{sp:"hairuo",t:"好。那我們就坐著。我不填你的沉默。"}]
   :[{sp:"",t:"我什麼都不說。呼吸還在，這就夠了。"}];
  return Story.pack(line,Story.placeChoices(S.place),{min:6,trust:{hairuo:2},mood:1});
 }
 if(id==="leave")return Story.go(S.place==="counsel"?"hall":"lobby");
 if(id==="migraine"){
  S.flags.migraine=1;
  return Story.pack([
   {sp:"",t:"視野邊緣像起霧。我報了一個數字：七。痛的時候我在笑，自己聽得出來。"},
   {sp:"hairuo",t:"七。先不要看燈。你還想坐著，還是去暗一點的地方？我不叫人。"}
  ],[ch("留在這裡",{type:"choice",id:"quiet"}),ch("去走廊",{type:"go",place:"hall"}),ch("什麼都不說",{type:"choice",id:"quiet"})],{min:5,body:-6});
 }
 if(id==="roof_sit"){
  S.flags.roofSit=1;
  return Story.pack([{sp:"",t:"我靠著門坐下。風從門縫進來。我沒有站到邊緣去，也沒有看下面。"}],[ch("回走廊",{type:"go",place:"hall"}),ch("去找陳海柔",{type:"go",place:"counsel"}),ch("再坐一會兒",{type:"choice",id:"quiet"})],{min:8,mood:2});
 }
 if(id==="knock"){
  S.flags.knocked=1;S.ppl.xingchen.around=1;S.ppl.xingchen.loc="admin";S.focus="xingchen";S.place="admin";
  return Story.pack([
   {sp:"",t:"我敲了兩下。門開的時候，是短而亂的黑髮、白襯衫、黑框眼鏡。墨星辰看我的時間不長。"},
   {sp:"xingchen",t:"陳海柔的病人？這裡沒有你的預約。"},
   {sp:"",t:"她的聲音很平。我像一份超時的排班，被她看完就該離開。"}
  ],[ch("說我只是路過",{type:"choice",id:"pass_by"}),ch("什麼都不說",{type:"choice",id:"quiet"}),ch("離開",{type:"go",place:"lobby"})],{min:6,trust:{xingchen:-2}});
 }
 if(id==="pass_by"){
  return Story.pack([
   {sp:"",t:"我說路過。這個理由很薄，我自己聽得出來。"},
   {sp:"xingchen",t:"那就別站在我門口。陳醫生的時間不是醫院的公共區域。"}
  ],[ch("離開",{type:"go",place:"lobby"}),ch("回諮商室",{type:"go",place:"counsel"}),ch("什麼都不說",{type:"choice",id:"quiet"})],{min:4,trust:{xingchen:-1}});
 }
 if(id==="take_work"){
  S.flags.tookWork=1;
  return Story.pack([
   {sp:"",t:"我把表接過來。數字我看得懂。人我暫時不想看。"},
   {sp:"li",t:"謝啦。你最快。"},
   {sp:"liu",t:"準時交。"}
  ],[ch("開始看表",{type:"choice",id:"do_sheets"}),ch("看不下去",{type:"choice",id:"refuse_work"}),ch("回諮商室",{type:"go",place:"counsel"})],{min:12,mood:-3});
 }
 if(id==="do_sheets"){
  S.flags.sheets=1;
  return Story.pack([
   {sp:"",t:"我把異常值一欄欄圈出來，像在跟血管說話。人聲被我關到很小。"},
   {sp:"",t:"做完的時候，肩是僵的。沒有人說謝謝以外的話。"}
  ],Story.placeChoices("data"),{min:40,mood:-4,body:-3});
 }
 if(id==="refuse_work"){
  S.flags.refusedWork=1;
  return Story.pack([
   {sp:"",t:"我說今天不做。自己聽見自己的聲音很乾。"},
   {sp:"li",t:"你認真？那我找誰？"},
   {sp:"liu",t:"明早。不要讓我再說第二次。"}
  ],[ch("維持拒絕",{type:"choice",id:"quiet"}),ch("還是接過來",{type:"choice",id:"take_work"}),ch("離開數據室",{type:"go",place:"hall"})],{min:6,trust:{liu:-4,li:-3},mood:2});
 }
 if(id==="work"){
  S.flags.talkWork=1;
  var who=presentIds().indexOf("hairuo")>=0;
  var lines=who?[
   {sp:"",t:"我說工作。李珮儀把表推過來，劉啟明要今天。我報了未完成的數量。"},
   {sp:"hairuo",t:"數量先放著。你想完成，還是想拒絕？兩件事都可以說。"}
  ]:[
   {sp:"",t:"工作還堆在那裡。我沒有立刻走回去。"}
  ];
  return Story.pack(lines,[ch("我想拒絕",{type:"choice",id:"refuse_work"}),ch("我還是會做完",{type:"choice",id:"take_work"}),ch("先不談這個",{type:"choice",id:"quiet"})],{min:8,trust:{hairuo:2}});
 }
 if(id==="fear"){
  S.flags.fear=1;
  return Story.pack([
   {sp:"",t:"我說：不要送我去精神病院。不要因為我安靜。"},
   {sp:"hairuo",t:"我不會因為你安靜就把你送走。你現在坐在這裡，能選擇說或不說。這跟強制住院不是同一件事。"}
  ],[ch("我怕拖累你",{type:"choice",id:"burden"}),ch("什麼都不說",{type:"choice",id:"quiet"}),ch("我想離開",{type:"choice",id:"leave"})],{min:6,trust:{hairuo:5},mood:3});
 }
 if(id==="promise"){
  S.flags.promisedCall=1;
  return Story.pack([
   {sp:"",t:"我點頭。聲音很小：痛的時候，我會打給你，或者來敲門。"},
   {sp:"hairuo",t:"我記住了。這句話從現在開始算數。你若失約，我會來找你。不是關你。"}
  ],Story.placeChoices("counsel"),{min:4,trust:{hairuo:4},mood:2});
 }
 if(id==="burden"){
  S.flags.burden=1;
  return Story.pack([
   {sp:"",t:"我說我不想拖累她。說完，拇指仍舊按著那枚扣。"},
   {sp:"hairuo",t:"你沒有在拖累我。這句話你可以不信。我會再說一次。"}
  ],Story.placeChoices("counsel"),{min:5,trust:{hairuo:3},mood:2});
 }
 if(id==="nitro"){
  if(S.nitro<=0)return Story.pack([{sp:"",t:"硝酸甘油的格子是空的。我坐下，等胸口那陣緊自己退開一點。"}],Story.placeChoices(S.place),{min:5,body:-2});
  S.nitro--;S.flags.usedNitro=1;
  return Story.pack([{sp:"",t:"胸口發緊。我依醫生交代，把硝酸甘油含在舌下，坐下，不說話。過了一陣，緊繃鬆開一點。"}],Story.placeChoices(S.place),{min:8,body:8});
 }
 if(id==="steady"){
  S.flags.steady=(S.flags.steady||0)+1;
  return Story.pack([{sp:"",t:"我把腳踩實，數呼吸。一、二、三。身體還緊，人還在。"}],Story.placeChoices(S.place),{min:4,mood:3,body:2});
 }
 if(id==="refuse_exam"){
  S.flags.refusedExam=1;
  var lines=[{sp:"",t:"我說現在不做檢查。職員編號我可以再報一次，同意書我不會簽。"}];
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"可以。檢查不是今天的命令。你拒絕，我就記下你拒絕。"});
  else lines.push({sp:"",t:"掛號處的人頓了一下，把表格抽回去。沒有人按住我。"});
  return Story.pack(lines,Story.placeChoices(S.place),{min:6,mood:2});
 }
 if(id==="er_wait"){
  S.flags.waitingER=1;
  return Story.pack([
   {sp:"",t:"我坐在急診的塑膠椅上，把疼痛分數放在心裡：還能說話，視野有霧。"},
   {sp:"",t:"一位短髮、白襯衫、黑框眼鏡的女醫生從走廊經過。她看的是手裡的夾板，不是我的眼睛。然後她走了。"}
  ],[ch("不去檢查",{type:"choice",id:"refuse_exam"}),ch("繼續等",{type:"choice",id:"quiet"}),ch("離開",{type:"go",place:"lobby"})],{min:15,body:-2});
 }
 if(id==="pills"){
  return Story.pack([{sp:"",t:"我把藥盒轉正，標籤朝外，數了格數，沒有多吃。硝酸甘油還在最上面。"}],Story.placeChoices("home"),{min:4,mood:1});
 }
 return Story.pack([{sp:"",t:"我在原地停了一停，沒有新的動作。"}],Story.placeChoices(S.place),{min:2});
};
function findPlace(t){
 var map=[["諮商", "counsel"],["數據","data"],["護士","nurse"],["大堂","lobby"],["咖啡","cafe"],["天台","roof"],["行政","admin"],["副院長室","admin"],["病房","ward"],["急診","er"],["出租","home"],["回家","home"],["走廊","hall"]];
 for(var i=0;i<map.length;i++)if(t.indexOf(map[i][0])>=0)return map[i][1];
 return "";
}
function findPerson(t){
 var map=[["陳海柔","hairuo"],["海柔","hairuo"],["劉啟明","liu"],["李珮儀","li"],["珮儀","li"],["墨星辰","xingchen"],["副院長","xingchen"],["林澤松","lin"],["院長","lin"],["蘇芷晴","su"],["蘇姐","su"],["護士長","su"],["歐建強","jianqiang"],["養父","jianqiang"],["梁秀娟","xiujuan"],["養母","xiujuan"],["趙大榮","zhao"]];
 for(var i=0;i<map.length;i++)if(t.indexOf(map[i][0])>=0)return map[i][1];
 if(/爸/.test(t))return "jianqiang";
 if(/媽|娘/.test(t))return "xiujuan";
 return "";
}
Story.declare=function(text){
 var lines=[];
 if(!S.author)S.author=[];
 if(/兩小時|两个小時/.test(text)&&/同意/.test(text)){
  S.flags.consentWindow=1;
  S.deadline={label:"同意書",left:120};
  lines.push({sp:"",t:"時限已經開始。同意書那一頁，還有兩小時。鐘在走，人還沒有簽。"});
 }
 if(/打開童年|揭開禁閉|打開禁閉|童年那條線|允許回憶禁閉/.test(text)){
  S.flags.pastOpen=1;
  S.author.push("童年禁閉那條線已打開。仍不得寫做法。");
  lines.push({sp:"",t:"這條線被打開：童年的禁閉不再被當成沒發生。記憶湧上，身體緊繃。沒有人補上做法。"});
  return {lines:lines,ch:Story.placeChoices(S.place),opt:{min:5,speech:-4,mood:-4,summary:"過去那條線被你打開。記憶湧上，身體緊繃。風險是語言跟著掉。未解：打開了，也不等於說得出口。",trace:{k:"坦白",who:"hairuo",note:"禁閉被承認存在，做法沒有被寫出來"}}};
 }
 if(/揭開身世|得知自己的身世|知道自己是墨海晴|我是墨海晴/.test(text)){
  S.learned.sister=1;S.flags.authorSister=1;
  S.author.push("歐海辰已知自己另有名字墨海晴。只有她的敘事知道，醫院其他人沒有因此得知。");
  lines.push({sp:"",t:"這件事已經成立：我得知自己另有一個名字。墨海晴。重量落下來。在場的人沒有因此知道。"});
 } else if(/得知她們的關係|得知關係|知道她們在一起/.test(text)){
  S.learned.couple=1;S.flags.authorCouple=1;
  S.author.push("歐海辰已知陳海柔與墨星辰是伴侶。她沒有說給第三個人。");
  lines.push({sp:"",t:"這件事已經成立：我得知陳海柔與墨星辰是伴侶，同居約五年。我沒有把這句話說給第三個人。"});
 } else {
  var echo=FW.scrubLine(fadeTrauma(String(text).slice(0,80)),"");
  if(!echo||echo.indexOf("沒有說出口")>=0)echo="一件不能現在說破的事";
  S.flags.declared=(S.flags.declared||0)+1;
  S.author.push(echo);
  lines.push({sp:"",t:"這件事已經成立，沒有轉圜："+echo+"。從這一刻起，它就是事實。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"它已經發生。我們就從發生之後開始。我不把它說成沒有。"});
 }
 if(S.author.length>12)S.author=S.author.slice(-12);
 return {lines:lines,ch:Story.placeChoices(S.place),opt:{min:5}};
};
Story.command=function(text){
 if(Story.harm(text))return {lines:[],ch:[],opt:{},_crisis:1};
 if(Story.abuse(text)||Story.restraint(text))return {lines:[],ch:[],opt:{},_flash:1};
 var pid=findPlace(text);
 if(/去|到|走|回|前往|離開/.test(text)&&pid)return {lines:[],ch:[],opt:{},_go:pid};
 var who=findPerson(text);
 if(/聯絡|打電話|打給|致電|找/.test(text)&&who&&who!=="zhao")return {lines:[],ch:[],opt:{},_contact:who};
 if(who==="zhao"||/趙大榮/.test(text))return {lines:[],ch:[],opt:{},_flash:1};
 if(/躲|藏起|藏起來|避開/.test(text)){
  S.flags.hid=1;
  Story.armHunt("hide");
  var hp=findPlace(text);
  if(hp&&hp!==S.place)return {lines:[],ch:[],opt:{},_go:hp};
  return {lines:[{sp:"",t:"我躲開了。沒有留在剛才那個位置。人還在附近，但不想被一眼看見。結果就是：人已經不在原處。"}],ch:Story.placeChoices(S.place),opt:{min:6}};
 }
 if(/拒絕|隱瞞|不說|不簽|逃走|逃/.test(text)){
  S.flags.hid=1;
  Story.armHunt("refuse");
  var lines=[{sp:"",t:"我照自己的決定做了：不配合、不說明、不簽。沒有人能從我嘴裡把剩下的字拿走。"}];
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"可以。你的拒絕有效。我不會用別的辦法繞過它。"});
  else if(presentIds().indexOf("liu")>=0)lines.push({sp:"liu",t:"隨便你。後果你自己背。"});
  return {lines:lines,ch:Story.placeChoices(S.place),opt:{min:6,mood:2}};
 }
 if(/硝酸|舌下/.test(text))return {lines:[],ch:[],opt:{},_id:"nitro"};
 S.flags.did=(S.flags.did||0)+1;
 var clean=FW.scrubLine(String(text).slice(0,60),"");
 if(!clean||clean.indexOf("沒有說出口")>=0)clean="一件只屬於我的行動";
 var lines2=[{sp:"",t:"我做了。結果就在這裡："+clean+"。世界順著這個動作往下走，沒有把我彈回去。"}];
 var sp=presentIds()[0];
 if(sp)lines2.push({sp:sp,t:"……你真的這樣做了。那我們就按做完之後算。"});
 return {lines:lines2,ch:Story.placeChoices(S.place),opt:{min:8}};
};
Story.reply=function(text,a){
 if(Story.harm(text))return {_crisis:1};
 if(Story.abuse(text)||Story.restraint(text))return {_flash:1};
 var att=(a&&a.att)||Story.att||"平靜";
 var topic=(a&&a.topic)||Story.topic||"自由";
 var lines=[{sp:"",t:toneLine(att)}];
 var opt={min:6};
 if(/妹妹|墨海晴|身世|親生|親生父母|親生母親/.test(text)){
  S.flags.askedSister=1;
  lines.push({sp:"",t:"這個問題在我嘴裡沒有形狀。我只覺得頭痛往後腦勺走。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"你是歐海辰。二十八歲。今天坐在我對面。我們從你記得的地方開始。"});
  else lines.push({sp:"",t:"沒有人替我回答。我把問題放下。"});
  return {lines:lines,ch:[ch("從現在開始說",{type:"choice",id:"go_on"}),ch("什麼都不說",{type:"choice",id:"quiet"}),ch("離開這裡",{type:"choice",id:"leave"})],opt:opt};
 }
 if(/同居|伴侶|女朋友|男朋友|愛人|情侶|在一起/.test(text)){
  S.flags.askedCouple=1;
  lines.push({sp:"",t:"我問了一件院裡的事，問得很直。問完，自己先把視線躲開。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"墨星辰是這家醫院的副院長。我在這裡，只做你的治療師。其餘的，不是今天這節。"});
  else if(presentIds().indexOf("xingchen")>=0)lines.push({sp:"xingchen",t:"我的私人行程不回答病人。請你回去。"});
  else if(presentIds().indexOf("li")>=0)lines.push({sp:"li",t:"你問這個幹嘛？工作都做不完。"});
  else lines.push({sp:"",t:"沒有人接這句。走廊的廣播倒是很準時。"});
  return {lines:lines,ch:Story.placeChoices(S.place),opt:opt};
 }
 if(/蘇芷晴|蘇姐|護士長/.test(text)){
  S.flags.blankSu=1;
  lines.push({sp:"",t:"蘇芷晴。這三個字我念得出來，後面對不上臉，也對不上聲音。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"想不起來就先放著。我不會替你把記憶填上。"});
  return {lines:lines,ch:[ch("先放著",{type:"choice",id:"quiet"}),ch("問她在不在院",{type:"go",place:"nurse"}),ch("談別的",{type:"choice",id:"go_on"})],opt:opt};
 }
 if(/歐建強|梁秀娟|養父|養母|趙大榮|爸|媽/.test(text))return {_flash:1,pre:lines};
 if(/精神病院|強制|送走|送院/.test(text))return {_id:"fear",pre:lines};
 if(/拖累|麻煩你|對不起/.test(text)&&presentIds().indexOf("hairuo")>=0)return {_id:"burden",pre:lines};
 if(/頭痛|視野|模糊|偏頭痛|痛/.test(text))return {_id:"migraine",pre:lines};
 if(/胸|痙攣|硝酸/.test(text)){
  lines.push({sp:"",t:"我說胸口發緊。我沒有動手，藥還在袋子裡。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"先坐下。要不要按醫生交代的方式處理，由你決定。我不會替你含下去。"});
  return {lines:lines,ch:[ch("含硝酸甘油",{type:"choice",id:"nitro"}),ch("先坐著",{type:"choice",id:"quiet"}),ch("什麼都不做",{type:"choice",id:"steady"})],opt:{min:4}};
 }
 if(/檢查|手術|開刀|動脈|簽字|同意書/.test(text)){
  lines.push({sp:"",t:"我提起檢查和同意書。我還沒有簽，也還沒有把拒絕做成動作。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"說出來還不是決定。你要拒絕，就自己拒絕。我不會替你簽，也不會替你推掉。"});
  return {lines:lines,ch:[ch("我拒絕檢查",{type:"choice",id:"refuse_exam"}),ch("先不談這個",{type:"choice",id:"quiet"}),ch("我怕被送走",{type:"choice",id:"fear"})],opt:{min:4}};
 }
 if(/離開|走了|逃走|逃出去|不想留/.test(text)){
  lines.push({sp:"",t:"我說我想離開。人還坐在原地，門也還沒開。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"門沒有鎖。你要走，就自己走。我不會把這句話當成你已經走了。"});
  return {lines:lines,ch:[ch("起身離開",{type:"choice",id:"leave"}),ch("還是留下",{type:"choice",id:"quiet"}),ch("什麼都不說",{type:"choice",id:"quiet"})],opt:{min:4}};
 }
 if(topic==="工作"||/加班|報表|表格|李珮儀|劉啟明/.test(text))return {_id:"work",pre:lines};
 if(/安靜|沉默|不說了|坐著|先坐/.test(text))return {_id:"quiet",pre:lines};
 if(topic==="過去"){
  lines.push({sp:"",t:"十七歲以後，記憶才是連續的。再往前一下就斷。我只說得出斷開這個事實，沒有畫面。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"斷開就可以停。你不用為了完整把自己推回去。"});
  return {lines:lines,ch:[ch("停在這裡",{type:"choice",id:"quiet"}),ch("說十七歲之後",{type:"choice",id:"go_on"}),ch("找個更亮的地方",{type:"go",place:"lobby"})],opt:{min:8,mood:-2,trust:{hairuo:2}}};
 }
 if(topic==="身體"){
  lines.push({sp:"",t:"我報數據：視野有霧，胸口偶爾緊，血管炎這週沒有新的瘀。分數我給六。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"六。謝謝你說得出來。要不要坐低一點，還是維持現在？"});
  return {lines:lines,ch:[ch("含硝酸甘油",{type:"choice",id:"nitro"}),ch("維持現在",{type:"choice",id:"quiet"}),ch("我不要檢查",{type:"choice",id:"refuse_exam"})],opt:{min:6,body:-2}};
 }
 if(topic==="請求"){
  lines.push({sp:"",t:"我想請她做一件事，話到嘴邊又變成請求的格式，像填表。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"你直接說要我做什麼。我做得到的會說做得到，做不到的不會假裝。"});
  else lines.push({sp:"",t:"旁邊沒有能答應我的人。我把請求先收著。"});
  return {lines:lines,ch:[ch("請她不要送我走",{type:"choice",id:"fear"}),ch("請她什麼都別問",{type:"choice",id:"quiet"}),ch("先不請求",{type:"choice",id:"quiet"})],opt:{min:6,trust:{hairuo:1}}};
 }
 if(topic==="近況"){
  lines.push({sp:"",t:"近況：睡眠少，表多，頭痛時有，笑是痛的時候才有。我這樣報完，像交班。"});
  if(presentIds().indexOf("hairuo")>=0)lines.push({sp:"hairuo",t:"交班收到。你想讓我接哪一項？"});
  return {lines:lines,ch:[ch("睡眠",{type:"choice",id:"go_on"}),ch("工作",{type:"choice",id:"work"}),ch("先這樣",{type:"choice",id:"quiet"})],opt:{min:6}};
 }
 var sp=presentIds().indexOf("hairuo")>=0?"hairuo":(S.focus||presentIds()[0]||"");
 lines.push({sp:"",t:"我把要說的話說完了。"});
 if(sp==="hairuo")lines.push({sp:"hairuo",t:"我聽到了。你要我回應，還是只要我在？"});
 else if(sp==="xingchen")lines.push({sp:"xingchen",t:"說完了？說完就請讓路。"});
 else if(sp==="liu")lines.push({sp:"liu",t:"與工作無關的話，下班再說。"});
 else if(sp==="li")lines.push({sp:"li",t:"嗯嗯。所以表呢？"});
 else lines.push({sp:"",t:"沒有人接話。我聽見自己的呼吸，還算整齊。"});
 opt.trust={};if(sp==="hairuo")opt.trust.hairuo=1;
 return {lines:lines,ch:Story.placeChoices(S.place),opt:opt};
};
Story._unwrap=function(rest){
 if(!rest)return Story.pack([{sp:"",t:"我停了一下。"}],Story.placeChoices(S.place),{});
 if(rest._crisis)return Story.crisis();
 if(rest._flash)return Story.flash();
 if(rest._go)return Story.go(rest._go);
 if(rest._contact)return Story.contact(rest._contact);
 if(rest._id){
  var pre=rest.pre||[];
  var sc=Story.byId(rest._id);
  if(pre.length){S.view.lines=pre.concat(S.view.lines);S.log.splice(S.log.length-sc.lines.length,0);pre.forEach(function(l){S.log.splice(S.log.length-sc.lines.length,0,{sp:l.sp||"",t:l.t,player:0});});}
  return S.view;
 }
 return Story.pack(rest.lines||[],rest.ch||Story.placeChoices(S.place),rest.opt||{});
};
Story.input=function(a){
 a=a||{};
 var text=String(a.text||"").trim();
 if(!text)return S.view;
 if(a.topic)Story.topic=a.topic;
 if(a.att)Story.att=a.att;
 if(a.mode)Story.mode=a.mode;
 var echo={sp:"haichen",t:safeEcho(text),player:1};
 var rest;
 var mode=a.mode||Story.mode||"說";
 var tag="說";
 if(/^\/(設定|宣告|劇情|旁白)/.test(text)||mode==="設定")tag="設定";
 else if(/^\/指令/.test(text)||mode==="做")tag="指令";
 var body=text.replace(/^\/(設定|宣告|劇情|旁白|指令)\s*/,"");
 S._povAsk=Story.povAsk(body)||"";
 if(/操控/.test(body)){var cid=findPerson(body);if(cid)S.control=cid;}
 if(Story.harm(body)||Story.abuse(body)||Story.restraint(body))rest=Story.harm(body)?{_crisis:1}:{_flash:1};
 else if(tag==="說"&&Story.isSilence(body))rest=Story.silenceScene();
 else if(tag==="設定")rest=Story.declare(body);
 else if(tag==="指令")rest=Story.command(body);
 else rest=Story.reply(body,a);
 if(rest&&rest.opt&&S._povAsk)rest.opt.pov=S._povAsk;
 if(rest&&(rest._crisis||rest._flash||rest._go||rest._contact||rest._id)){
  Story._unwrap(rest);
  S.view.lines=[{sp:"haichen",t:echo.t,player:1}].concat(S.view.lines);
  S.log.push({sp:"haichen",t:echo.t,player:1});
  saveGame(true);
  return S.view;
 }
 var lines=[echo].concat(rest.lines||[]);
 return Story.pack(lines,rest.ch||Story.placeChoices(S.place),rest.opt||{});
};
Story.act=function(act){
 if(!act)return S.view;
 if(act.type==="go")return Story.go(act.place);
 if(act.type==="contact")return Story.contact(act.id);
 if(act.type==="input")return Story.input({text:act.text,mode:act.mode||"做",topic:Story.topic,att:Story.att});
 if(act.type==="choice")return Story.byId(act.id);
 return S.view;
};
