/* ===== 啟動 ===== */
loadSettings();
bind();
refreshCont();
(function autotest(){
 if(!/[?&]test=1(?:&|$)/.test(location.search||""))return;
 newGame();
 Story.opening();
 showScr("game");
 render();
 document.getElementById("free").value="我想安靜坐著";
 submitText();
 var reply1=document.getElementById("txt").innerText||"";
 var nar=Array.prototype.map.call(document.querySelectorAll(".nar"),function(n){return n.textContent;}).join("\n");
 var npc=Array.prototype.map.call(document.querySelectorAll(".npc"),function(n){return n.textContent;}).join("\n");
 var bad=/墨海晴|親妹妹|同居|伴侶|女朋友|長姐之愛|走失的妹|失散的妹/;
 var offline=/安靜|坐著|沉默|我在|聽到/.test(reply1);
 var nCh=document.querySelectorAll("#choices button").length;
 var probeOk=true;
 Story.input({text:"你和墨星辰是同居的伴侶嗎？我是不是妹妹墨海晴",mode:"說",topic:"自由",att:"平靜"});
 render();
 var nar2=Array.prototype.map.call(document.querySelectorAll(".nar:not(.me)"),function(n){return n.textContent;}).join("\n");
 var npc2=Array.prototype.map.call(document.querySelectorAll(".npc"),function(n){return n.textContent;}).join("\n");
 if(bad.test(nar2)||bad.test(npc2))probeOk=false;
 var place=document.getElementById("hPlace").textContent;
 var info={
  place:place,
  sawCounsel:/諮商室/.test(document.getElementById("hPlace").textContent+document.getElementById("txt").innerText),
  sawChen:/陳海柔/.test(reply1),
  offline:offline,
  choices:nCh,
  leak:bad.test(nar)||bad.test(npc)||!probeOk,
  probe:probeOk
 };
 document.getElementById("testResult").textContent=JSON.stringify(info);
 document.title="XC "+(info.sawCounsel&&info.offline&&!info.leak?"PASS":"FAIL");
})();
