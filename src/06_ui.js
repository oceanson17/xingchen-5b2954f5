/* ===== 介面 ===== */
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
function portraitNow(){
 var lines=(S.view&&S.view.lines)||[];
 var i;
 for(i=lines.length-1;i>=0;i--){
  var id=lines[i].sp;
  if(id&&!lines[i].player&&PORTRAIT[id]&&presentIds().indexOf(id)>=0)return id;
 }
 if(S.focus&&PORTRAIT[S.focus]&&presentIds().indexOf(S.focus)>=0)return S.focus;
 var ids=presentIds();
 for(i=0;i<ids.length;i++)if(PORTRAIT[ids[i]])return ids[i];
 return "";
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
 var who=portraitNow();
 var holder=document.getElementById("char");
 var img=document.getElementById("charImg");
 if(holder&&img){
  if(who&&PORTRAIT[who]){
   var src="assets/"+PORTRAIT[who]+".webp?v=ch1";
   if(img.getAttribute("src")!==src)img.setAttribute("src",src);
   img.alt=cn(who);
   holder.hidden=false;
  }else holder.hidden=true;
 }
 document.getElementById("mBody").textContent=S.body;
 document.getElementById("mMood").textContent=S.mood;
 document.getElementById("mTrust").textContent=S.trust.hairuo||0;
 document.getElementById("mNitro").textContent=S.nitro;
 var html="";
 (S.view.lines||[]).forEach(function(l){
  if(!l.sp||l.player){html+='<p class="nar'+(l.player?" me":"")+'">'+esc(l.t)+"</p>";return;}
  var p=P(l.sp)||PEOPLE[l.sp]||{n:l.sp,color:"#9bb"};
  html+='<div class="say npc"><div class="nm" style="color:'+esc(p.color||"#9bb")+'">'+esc(p.n||"")+'</div><div class="bub">'+esc(l.t)+"</div></div>";
 });
 document.getElementById("txt").innerHTML=html;
 var ch=document.getElementById("choices");ch.innerHTML="";
 (S.view.ch||[]).forEach(function(c,i){
  var b=document.createElement("button");b.type="button";b.textContent=c.t;b.dataset.i=String(i);
  b.addEventListener("click",function(){var cur=S.view.ch[i];if(!cur)return;Story.act(cur.act);render();var box=document.getElementById("box");if(box)box.scrollTop=0;});
  ch.appendChild(b);
 });
 renderChips();
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
  var name=l.player?"我":(l.sp?cn(l.sp):"");
  h+='<p class="logl">'+(name?"<b>"+esc(name)+"</b> ":"")+esc(l.t)+"</p>";
 });
 if(!h)h='<p class="logl">還沒有紀錄。</p>';
 openSheet("紀錄",h);
}
function sheetMenu(){
 var h="";
 h+='<button class="row" id="mSave" type="button"><b>存檔</b><small>寫入這部瀏覽器</small></button>';
 h+='<button class="row" id="mTitle" type="button"><b>回標題</b><small>進度已自動存</small></button>';
 h+='<button class="row" id="mSet" type="button"><b>AI 設定</b><small>'+(SET.ai?"已啟用":"未啟用")+"</small></button>";
 h+='<p class="logl">「說」只是說話，不會被當成命令。「做」和 /指令 會真的發生，並寫出結果。/設定 或「設定」模式裡的事已經成立，不會被否定。秘密不會因為一句閒話傳開。</p>';
 openSheet("選單",h);
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
function bind(){
 document.getElementById("tNew").onclick=function(){newGame();Story.opening();showScr("game");render();};
 document.getElementById("tCont").onclick=function(){if(!loadGame()){toast("沒有存檔");return;}showScr("game");render();};
 document.getElementById("tSet").onclick=openSettings;
 document.getElementById("hMenu").onclick=sheetMenu;
 document.getElementById("shX").onclick=closeSheet;
 document.getElementById("sheet").addEventListener("click",function(e){if(e.target.id==="sheet")closeSheet();});
 document.getElementById("send").onclick=submitText;
 document.getElementById("free").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();submitText();}});
 document.getElementById("mode").onclick=function(){
  var seq=["說","做","設定"];
  var i=seq.indexOf(Story.mode);Story.mode=seq[(i+1)%3];
  this.textContent=Story.mode;
  var ph={"說":"想說的話。說出口不會被當成命令","做":"做一件事，或 /指令 …","設定":"寫下一件已經成立的事"};
  document.getElementById("free").placeholder=ph[Story.mode];
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
  else sheetMenu();
 });
}
