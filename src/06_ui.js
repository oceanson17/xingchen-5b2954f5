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
 var ph={"說":"E.【自由輸入】","做":"E.【自由輸入】做一件事，或 /指令","設定":"E.【自由輸入】寫下一件已經成立的事"};
 var inp=document.getElementById("free");
 var mode=document.getElementById("mode");
 if(mode)mode.textContent=Story.mode;
 if(inp)inp.placeholder=ph[Story.mode]||"E.【自由輸入】";
}
function avatarHtml(id){
 var p=P(id)||PEOPLE[id]||{n:id,color:"#9bb"};
 if(PORTRAIT[id])return '<img class="av" alt="" src="assets/'+PORTRAIT[id]+'.webp?v=ch1">';
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
  var key=(typeof PLACE_BG!=="undefined"&&PLACE_BG[S.place])||"lobby";
  if(bg.getAttribute("data-k")!==key){
   bg.setAttribute("data-k",key);
   bg.style.backgroundImage="url('assets/bg_"+key+".webp?v=ch1')";
  }
 }
 renderMeters();
 renderTurn();
 var html="";
 (S.view.lines||[]).forEach(function(l){
  if(l.player||l.sp==="haichen"){html+='<p class="me">'+esc(l.t)+"</p>";return;}
  if(!l.sp){
   if(/^第.+章/.test(l.t))html+='<p class="chap">'+esc(l.t)+"</p>";
   else html+='<p class="nar">'+esc(l.t)+"</p>";
   return;
  }
  var p=P(l.sp)||PEOPLE[l.sp]||{n:l.sp,color:"#9bb"};
  html+='<div class="say"><div>'+avatarHtml(l.sp)+'</div><div class="sk"><div class="nm" style="color:'+esc(p.color||"#9bb")+'">'+esc(p.n||"")+'</div><div class="ln">'+esc(l.t)+"</div></div></div>";
 });
 document.getElementById("txt").innerHTML=html;
 var ch=document.getElementById("choices");ch.innerHTML="";
 var letters="ABCD";
 (S.view.ch||[]).slice(0,5).forEach(function(c,i){
  var b=document.createElement("button");b.type="button";
  var tag=c.tag||"探索";
  var mark=i<4?(letters.charAt(i)+"."):"";
  b.innerHTML=(mark?'<span class="tag">'+mark+"【"+esc(tag)+"】</span>":'<span class="tag">【'+esc(tag)+"】</span>")+esc(c.t);
  b.dataset.i=String(i);
  b.addEventListener("click",function(){
   var cur=S.view.ch[i];if(!cur)return;
   Story.act(cur.act);render();
   var box=document.getElementById("box");if(box)box.scrollTop=0;
  });
  ch.appendChild(b);
 });
 renderChips();
 syncPlaceholder();
 var box=document.getElementById("box");if(box)box.scrollTop=0;
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
 h+='<p class="logl">「說」只是說話。「做」和 /指令 會真的發生。/設定 已經成立。「...」或沉默，在場的人仍會先動。人物快照在「人物」。</p>';
 openSheet("選單",h);
 document.getElementById("mPeople").onclick=function(){sheetPeople();};
 document.getElementById("mSave").onclick=function(){saveGame(false);};
 document.getElementById("mTitle").onclick=function(){closeSheet();showScr("title");refreshCont();};
 document.getElementById("mSet").onclick=function(){closeSheet();openSettings();};
}
function openSettings(){
 var opts="";
 PRESET_ORDER.forEach(function(k){opts+='<option value="'+k+'"'+(SET.preset===k?" selected":"")+">"+esc(PRESETS[k].n)+"</option>";});
 var models=(PRESETS[SET.preset]||PRESETS.xai).models||[];
 var mh=models.map(function(m){return '<option value="'+esc(m)+'"'+(SET.model===m?" selected":"")+">"+esc(m)+"</option>";}).join("");
 var html="";
 html+='<label class="f"><input id="sAi" type="checkbox" '+(SET.ai?"checked":"")+"> 啟用 AI（失敗自動改離線）</label>";
 html+='<label class="f">服務</label><select class="f" id="sPre">'+opts+"</select>";
 html+='<label class="f">Base URL</label><input class="f" id="sBase" value="'+esc(SET.base)+'">';
 html+='<label class="f">模型</label><select class="f" id="sModel">'+mh+'</select><input class="f" id="sModel2" value="'+esc(SET.model)+'" style="margin-top:6px">';
 html+='<label class="f">API Key（只存在這部瀏覽器）</label><input class="f" id="sKey" type="password" value="'+esc(SET.key)+'" autocomplete="off">';
 html+='<p class="logl">'+esc((PRESETS[SET.preset]||{}).key||"")+"</p>";
 html+='<label class="f"><input id="sFw" type="checkbox" '+(SET.firewall?"checked":"")+"> 知情防火牆</label>";
 html+='<button class="row" id="sSave" type="button"><b>儲存設定</b></button>';
 openSheet("設定",html);
 document.getElementById("sPre").onchange=function(){
  var k=this.value;var p=PRESETS[k];if(!p)return;
  SET.preset=k;if(p.base)document.getElementById("sBase").value=p.base;
  if(p.model)document.getElementById("sModel2").value=p.model;
 };
 document.getElementById("sSave").onclick=function(){
  SET.ai=document.getElementById("sAi").checked;
  SET.preset=document.getElementById("sPre").value;
  SET.base=document.getElementById("sBase").value.trim();
  SET.model=(document.getElementById("sModel2").value||document.getElementById("sModel").value||"").trim();
  SET.key=document.getElementById("sKey").value.trim();
  SET.firewall=document.getElementById("sFw").checked;
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
