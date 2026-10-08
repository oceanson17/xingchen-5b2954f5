/* ===== 介面：故事閱讀，不是表單 ===== */
var UI={};
var toastT=null;
function toast(s){var n=document.getElementById("toast");if(!n)return;n.textContent=s;n.className="on";clearTimeout(toastT);toastT=setTimeout(function(){n.className="";},2200);}
function busy(on){var n=document.getElementById("busy");if(n)n.className=on?"on":"";}
function showScr(id){["title","game"].forEach(function(s){var n=document.getElementById(s);if(n)n.className="scr"+(s===id?" on":"");});}
function closeSheet(){var s=document.getElementById("sheet");if(s)s.className="";}
function openSheet(title,html){document.getElementById("shT").textContent=title;document.getElementById("shB").innerHTML=html;document.getElementById("sheet").className="on";}
function renderChips(){
 var box=document.getElementById("chips");if(!box)return;
 var h="";
 TOPICS.forEach(function(t){h+='<button type="button" data-k="topic" data-v="'+t+'"'+(Story.topic===t?' class="on"':"")+">"+t+"</button>";});
 ATTS.forEach(function(t){h+='<button type="button" data-k="att" data-v="'+t+'"'+(Story.att===t?' class="on"':"")+">"+t+"</button>";});
 box.innerHTML=h;
}
function syncPlaceholder(){
 var ph={"說":"回她一句","做":"做一件事，或 /指令","設定":"寫下一件已經成立的事"};
 var inp=document.getElementById("free");
 var mode=document.getElementById("mode");
 if(mode)mode.textContent=Story.mode;
 if(inp)inp.placeholder=ph[Story.mode]||"回她一句";
}
function avatarHtml(id){
 var p=P(id)||PEOPLE[id]||{n:id,color:"#9bb"};
 if(PORTRAIT[id])return '<img class="av" alt="" src="assets/'+PORTRAIT[id]+'.webp?v=thin2">';
 var ch=(p.n||"?").charAt(0);
 return '<span class="av ph" style="background:'+(p.color||"#8ec9bf")+'">'+esc(ch)+"</span>";
}
function renderMeters(){
 var box=document.getElementById("meters");if(!box||!S)return;
 var d=(S.delta)||{body:0,speech:0,mood:0,trust:0};
 var vals=[
  ["身體",S.body,d.body],
  ["語言",S.speech==null?58:S.speech,d.speech],
  ["心緒",S.mood,d.mood],
  ["信任",typeof S.rel==="number"?S.rel:(S.trust.hairuo||0),d.trust]
 ];
 var h="";
 vals.forEach(function(r){
  var n=+r[2]||0;
  var mark=n?('<em class="'+(n>0?"up":"dn")+'">'+(n>0?"+"+n:n)+"</em>"):"";
  h+='<div class="m"><span>'+r[0]+" <b>"+r[1]+"</b>"+mark+'</span><div class="track"><i style="width:'+clamp(r[1],0,100)+'%"></i></div></div>';
 });
 box.innerHTML=h;
}
function renderTurn(){
 if(!S)return;
 var turn=S.turn||{};
 var sum=document.getElementById("sum");
 if(sum)sum.textContent=turn.summary||"";
 var pres=document.getElementById("presence");
 if(pres){
  var ids=presentIds();
  pres.textContent=ids.length?("誰在場："+ids.map(cn).join("、")):"誰在場：只有你";
 }
 var count=document.getElementById("count");
 if(count){
  if(turn.countdown&&turn.countdown.left!=null){
   count.hidden=false;
   count.textContent="倒計時　"+turn.countdown.label+"　剩 "+turn.countdown.left+" 分鐘";
  }else{count.hidden=true;count.textContent="";}
 }
}
function sheetPeople(){
 if(!S)return;
 var snap=(S.turn&&S.turn.snap)||[];
 var h="";
 snap.forEach(function(p){
  h+='<div class="snapc"><b>'+esc(p.n)+'</b><small>'+esc(p.role||"")+'</small><p>'+esc(p.core||"")+'</p><p>'+esc(p.line||"")+'</p></div>';
 });
 if(!h)h='<p class="logl">這一幕還沒有人物快照。</p>';
 var eye=S.turn&&S.turn.pov&&S.turn.pov!=="haichen"?("這一幕的眼睛："+(S.turn.pov==="third"?"第三人稱":cn(S.turn.pov))+"。"):"";
 if(eye)h='<p class="logl">'+esc(eye)+"四條仍是歐海辰的。</p>"+h;
 openSheet("人物",h);
}
function sceneBgKey(){
 if(!S)return "counsel";
 var f=S.flags||{};
 var patient=S.place==="ward"||S.place==="er"||!!(f.admitted||f.inBed||f.inbed||f.bed||f.patient);
 if(patient)return "ward";
 return (typeof PLACE_BG!=="undefined"&&PLACE_BG[S.place])||"hall";
}
function youLine(t){
 var s=String(t||"").replace(/^「/,"").replace(/」$/,"").replace(/\s+/g," ").trim();
 if(!s)s="……";
 return "你說："+s;
}
function render(){
 if(!S||!S.view)return;
 var pl=PLACES[S.place]||{n:"",floor:""};
 var chEl=document.getElementById("hCh");
 if(chEl)chEl.textContent=S.chapter||"第一章 · 刀刃與界限";
 document.getElementById("hPlace").textContent=pl.n;
 document.getElementById("hFloor").textContent=pl.floor;
 document.getElementById("hTime").textContent=timeStr();
 var bg=document.getElementById("bg");
 if(bg){
  var key=sceneBgKey();
  if(bg.getAttribute("data-k")!==key){
   bg.setAttribute("data-k",key);
   bg.style.backgroundImage="url('assets/bg_"+key+".webp?v=early')";
  }
 }
 renderMeters();
 renderTurn();
 var html="";
 var src=(S.log&&S.log.length)?S.log:(S.view.lines||[]);
 var block=null;
 function flush(){
  if(!block)return;
  var person=P(block.sp)||PEOPLE[block.sp]||{n:block.sp,color:"#9bb"};
  var lines=block.lines.map(function(tx){return '<p class="ln">'+esc(tx)+"</p>";}).join("");
  html+='<div class="speech" data-who="'+esc(block.sp)+'">'+avatarHtml(block.sp)+'<div class="who"><div class="nm" style="color:'+esc(person.color||"#9bb")+'">'+esc(person.n||"")+"</div>"+lines+"</div></div>";
  block=null;
 }
 src.forEach(function(l){
  if(l.player||l.sp==="haichen"){
   flush();
   html+='<p class="yousaid">'+esc(youLine(l.t))+"</p>";
   return;
  }
  if(!l.sp){
   flush();
   if(/^第.+章/.test(l.t))html+='<p class="chap">'+esc(l.t)+"</p>";
   else html+='<p class="stage">'+esc(l.t)+"</p>";
   return;
  }
  if(block&&block.sp===l.sp)block.lines.push(l.t);
  else{flush();block={sp:l.sp,lines:[l.t]};}
 });
 flush();
 document.getElementById("txt").innerHTML=html;
 var ch=document.getElementById("choices");ch.innerHTML="";
 (S.view.ch||[]).slice(0,5).forEach(function(c,i){
  var b=document.createElement("button");b.type="button";
  var tag=c.tag||"探索";
  b.innerHTML='<span class="tag">【'+esc(tag)+"】</span>"+esc(c.t);
  b.dataset.i=String(i);
  b.addEventListener("click",function(){
   var cur=S.view.ch[i];if(!cur)return;
   var act=cur.act;if(act)act.label=cur.t;
   Story.act(act);render();
  });
  ch.appendChild(b);
 });
 renderChips();
 syncPlaceholder();
 var box=document.getElementById("box");if(box)box.scrollTop=box.scrollHeight;
}
function afterScene(){render();}
function submitText(){
 var inp=document.getElementById("free");
 var text=(inp.value||"").trim();
 if(!text)return;
 inp.value="";
 var a={text:text,mode:Story.mode,topic:Story.topic,att:Story.att,type:"free"};
 if(Story.harm(text)||Story.abuse(text)||Story.restraint(text)){
  Story.input(a);render();return;
 }
 if(AI.ready()){
  busy(true);
  AI.run(a).then(function(){busy(false);render();},function(e){busy(false);Story.input(a);render();toast((AI.errMsg(e))+"，已改用離線劇情");});
 }else{
  if(SET.ai&&!SET.key)toast("未填 API Key，使用離線劇情");
  Story.input(a);render();
 }
}
function sheetPlaces(){
 var h="";
 PLACE_ORDER.forEach(function(id){
  var p=PLACES[id];
  h+='<button class="row" data-go="'+id+'" type="button"><b>'+esc(p.n)+'</b><small>'+esc(p.floor)+(id===S.place?" · 現在":"")+"</small></button>";
 });
 openSheet("地點",h);
 document.getElementById("shB").querySelectorAll("[data-go]").forEach(function(b){
  b.addEventListener("click",function(){closeSheet();Story.go(b.getAttribute("data-go"));render();});
 });
}
function sheetCalls(){
 var list=[["hairuo","陳海柔","治療師"],["liu","劉啟明","主管"],["li","李珮儀","同事"],["xingchen","墨星辰","打給她，她會接"],["su","沒有備註的號碼","想不起面孔"],["lin","林澤松","院長 · 瑞士"],["jianqiang","歐建強","可以不打"],["xiujuan","梁秀娟","可以不打"]];
 var h="";
 list.forEach(function(x){h+='<button class="row" data-id="'+x[0]+'" type="button"><b>'+esc(x[1])+"</b><small>"+esc(x[2])+"</small></button>";});
 openSheet("聯絡",h);
 document.getElementById("shB").querySelectorAll("[data-id]").forEach(function(b){
  b.addEventListener("click",function(){closeSheet();Story.contact(b.getAttribute("data-id"));render();});
 });
}
function sheetLog(){
 var h="";
 (S.log||[]).slice(-80).forEach(function(l){
  var name=l.player?"你":(l.sp?cn(l.sp):"");
  h+='<p class="logl">'+(name?"<b>"+esc(name)+"</b> ":"")+esc(l.t)+"</p>";
 });
 if(!h)h='<p class="logl">還沒有紀錄。</p>';
 openSheet("紀錄",h);
}
function sheetMenu(){
 var h="";
 h+='<button class="row" id="mPeople" type="button"><b>人物</b><small>陳海柔、墨星辰、歐海辰</small></button>';
 h+='<button class="row" id="mSave" type="button"><b>存檔</b><small>寫入這部瀏覽器</small></button>';
 h+='<button class="row" id="mTitle" type="button"><b>回標題</b><small>進度已自動存</small></button>';
 h+='<button class="row" id="mSet" type="button"><b>AI 設定</b><small>'+(SET.ai?"已啟用":"未啟用")+"</small></button>";
 h+='<p class="logl">人在房間裡對你說話。「說」只是回一句。「做」和 /指令 會真的發生。/設定 已經成立。只打「...」，對方會把話接下去。人物在「人物」。</p>';
 openSheet("選單",h);
 document.getElementById("mPeople").onclick=function(){sheetPeople();};
 document.getElementById("mSave").onclick=function(){saveGame(false);};
 document.getElementById("mTitle").onclick=function(){closeSheet();showScr("title");refreshCont();};
 document.getElementById("mSet").onclick=function(){closeSheet();openSettings();};
}
function modelOptions(preset,current){
 var p=PRESETS[preset]||PRESETS.custom;
 var models=(p.models||[]).slice();
 if(current&&models.indexOf(current)<0)models.unshift(current);
 if(!models.length)return '<option value="">（自訂模型）</option>';
 return models.map(function(m){return '<option value="'+esc(m)+'"'+(m===current?" selected":"")+">"+esc(m)+"</option>";}).join("");
}
function applyPresetFields(k){
 var p=PRESETS[k]||PRESETS.custom;
 SET.preset=k;
 if(k!=="custom"){
  if(p.base)SET.base=p.base;
  if(p.model)SET.model=p.model;
 }
 var base=document.getElementById("sBase");
 var model=document.getElementById("sModel");
 var model2=document.getElementById("sModel2");
 var note=document.getElementById("sNote");
 var pre=document.getElementById("sPre");
 if(pre)pre.value=k;
 if(base)base.value=SET.base||"";
 if(model2)model2.value=SET.model||"";
 if(model)model.innerHTML=modelOptions(k,SET.model||"");
 if(note)note.textContent=p.key||"";
}
function readSettingsForm(){
 SET.ai=document.getElementById("sAi").checked;
 SET.preset=document.getElementById("sPre").value;
 SET.base=document.getElementById("sBase").value.trim();
 var listed=document.getElementById("sModel").value||"";
 var typed=(document.getElementById("sModel2").value||"").trim();
 SET.model=typed||listed;
 SET.key=document.getElementById("sKey").value.trim();
 SET.firewall=document.getElementById("sFw").checked;
 if(!SET.base&&SET.preset!=="custom")SET.base=(PRESETS[SET.preset]&&PRESETS[SET.preset].base)||"";
 if(!SET.model&&SET.preset!=="custom")SET.model=(PRESETS[SET.preset]&&PRESETS[SET.preset].model)||"";
}
function openSettings(){
 var opts="";
 PRESET_ORDER.forEach(function(k){opts+='<option value="'+k+'"'+(SET.preset===k?" selected":"")+">"+esc(PRESETS[k].n)+"</option>";});
 var cur=PRESETS[SET.preset]||PRESETS.deepseek;
 var html="";
 html+='<label class="f"><input id="sAi" type="checkbox" '+(SET.ai?"checked":"")+"> 啟用 AI（失敗自動改離線）</label>";
 html+='<label class="f">服務</label><select class="f" id="sPre">'+opts+"</select>";
 html+='<p class="logl" id="sNote">'+esc(cur.key||"")+"</p>";
 html+='<label class="f">Base URL</label><input class="f" id="sBase" value="'+esc(SET.base)+'" autocapitalize="off" autocorrect="off" spellcheck="false">';
 html+='<label class="f">模型</label><select class="f" id="sModel">'+modelOptions(SET.preset,SET.model)+'</select><input class="f" id="sModel2" value="'+esc(SET.model)+'" autocapitalize="off" autocorrect="off" spellcheck="false" style="margin-top:6px">';
 html+='<label class="f">API Key（只存在這部瀏覽器）</label><input class="f" id="sKey" type="password" value="'+esc(SET.key)+'" autocomplete="off" autocapitalize="off" spellcheck="false">';
 html+='<label class="f"><input id="sFw" type="checkbox" '+(SET.firewall?"checked":"")+"> 知情防火牆</label>";
 html+='<button class="row" id="sDef" type="button"><b>還原此服務的預設 Base／模型</b></button>';
 html+='<button class="row" id="sClr" type="button"><b>清除 API Key</b></button>';
 html+='<button class="row" id="sSave" type="button"><b>儲存設定</b></button>';
 openSheet("設定",html);
 document.getElementById("sPre").onchange=function(){
  applyPresetFields(this.value);
 };
 document.getElementById("sModel").onchange=function(){
  if(this.value)document.getElementById("sModel2").value=this.value;
 };
 document.getElementById("sDef").onclick=function(){
  var k=document.getElementById("sPre").value||"deepseek";
  applyPresetFields(k);
  readSettingsForm();
  saveSettings();
  toast("已還原「"+((PRESETS[k]||{}).n||"")+"」的 Base 與模型");
 };
 document.getElementById("sClr").onclick=function(){
  document.getElementById("sKey").value="";
  SET.key="";
  saveSettings();
  toast("已清除 API Key");
 };
 document.getElementById("sSave").onclick=function(){
  readSettingsForm();
  saveSettings();toast("設定已儲存");closeSheet();
 };
}
function refreshCont(){var b=document.getElementById("tCont");if(!b)return;b.disabled=!hasSave();b.style.opacity=hasSave()?1:.45;}
/* 把整頁釘在視覺視窗裡：鍵盤與 Safari 底欄蓋住的部分不把頁面頂走。 */
function pinFrame(){
 var app=document.getElementById("app");if(!app)return;
 var vv=window.visualViewport;
 if(!vv){app.style.height="";app.style.transform="";return;}
 var top=vv.offsetTop||0;
 var h=vv.height||window.innerHeight;
 app.style.height=Math.round(h)+"px";
 app.style.transform="translateY("+Math.round(top)+"px)";
}
function bind(){
 document.getElementById("tNew").onclick=function(){newGame();Story.opening();showScr("game");render();};
 document.getElementById("tCont").onclick=function(){if(!loadGame()){toast("沒有存檔");return;}showScr("game");render();};
 document.getElementById("hMenu").onclick=sheetMenu;
 document.getElementById("shX").onclick=closeSheet;
 document.getElementById("sheet").addEventListener("click",function(e){if(e.target.id==="sheet")closeSheet();});
 document.getElementById("send").onclick=submitText;
 var free=document.getElementById("free");
 free.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();submitText();}});
 free.addEventListener("focus",function(){
  pinFrame();
  var n=0;var id=setInterval(function(){pinFrame();if(++n>10)clearInterval(id);},50);
 });
 document.getElementById("mode").onclick=function(){
  var seq=["說","做","設定"];
  var i=seq.indexOf(Story.mode);Story.mode=seq[(i+1)%3];
  syncPlaceholder();
 };
 document.getElementById("chips").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b)return;
  if(b.dataset.k==="topic")Story.topic=b.dataset.v;
  if(b.dataset.k==="att")Story.att=b.dataset.v;
  renderChips();
 });
 document.getElementById("tabs").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b||!S)return;
  var t=b.getAttribute("data-tab");
  if(t==="place")sheetPlaces();
  else if(t==="call")sheetCalls();
  else if(t==="log")sheetLog();
  else if(t==="people")sheetPeople();
 });
 pinFrame();
 if(window.visualViewport){
  window.visualViewport.addEventListener("resize",pinFrame);
  window.visualViewport.addEventListener("scroll",pinFrame);
 }
 window.addEventListener("resize",pinFrame);
 window.addEventListener("orientationchange",pinFrame);
 window.addEventListener("scroll",function(){if(window.scrollX||window.scrollY)window.scrollTo(0,0);pinFrame();},{passive:true});
}
