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
 var openTxt=document.getElementById("txt").innerText||"";
 var openNar=Array.prototype.map.call(document.querySelectorAll(".nar"),function(n){return n.textContent;}).join("\n");
 var bg0=document.getElementById("bg").getAttribute("data-k");
 var port0=document.getElementById("charImg").getAttribute("src")||"";
 var ch=document.getElementById("hCh").textContent||"";
 Story.go("hall");render();
 var bgHall=document.getElementById("bg").getAttribute("data-k");
 Story.go("roof");render();
 var bgRoof=document.getElementById("bg").getAttribute("data-k");
 var huntTxt=document.getElementById("txt").innerText||"";
 var portHunt=document.getElementById("charImg").getAttribute("src")||"";
 var bad=/墨海晴|同居|伴侶|女朋友|長姐之愛|走失的妹|失散的妹|儲物間|麻繩|刀片|割腕|血痂/;
 newGame();Story.opening();render();
 var placeBefore=S.place;
 Story.input({text:"我現在立刻去天台",mode:"說",topic:"自由",att:"平靜"});
 render();
 var sayStayed=S.place===placeBefore;
 Story.input({text:"去天台",mode:"做",topic:"自由",att:"平靜"});
 render();
 var didMoved=S.place==="roof";
 var didTxt=document.getElementById("txt").innerText||"";
 var bgDid=document.getElementById("bg").getAttribute("data-k");
 Story.input({text:"/設定 桌上有一杯已經冷掉的茶",mode:"設定",topic:"自由",att:"平靜"});
 render();
 var setTxt=document.getElementById("txt").innerText||"";
 var setOk=/冷掉的茶/.test(setTxt)&&/已經成立/.test(setTxt)&&!/不可能|莫非|錯覺|並沒有/.test(setTxt);
 var info={
  build:"xc-ch1-glasses-860",
  chapter:/第一章/.test(ch)&&/第一章/.test(openTxt)&&/刀刃與界限/.test(openTxt),
  counsel:bg0==="counsel"&&/諮商室/.test(openTxt)&&/陳海柔/.test(openTxt),
  form:/記錄|數字/.test(openTxt)&&/不是強制入院/.test(openTxt)&&/敲門/.test(openTxt),
  bgSwap:bg0==="counsel"&&bgHall==="hall"&&bgRoof==="roof"&&bgDid==="roof",
  hunt:/墨星辰/.test(huntTxt)&&/黑框眼鏡/.test(huntTxt),
  portraits:/p_hairuo/.test(port0)&&/p_xingchen/.test(portHunt),
  leak:bad.test(openNar)||bad.test(openTxt)||bad.test(huntTxt),
  sayStayed:sayStayed,
  didMoved:didMoved&&/天台/.test(didTxt),
  setOk:setOk
 };
 var pass=info.chapter&&info.counsel&&info.form&&info.bgSwap&&info.hunt&&info.portraits&&!info.leak&&info.sayStayed&&info.didMoved&&info.setOk;
 document.getElementById("testResult").textContent=JSON.stringify(info);
 document.title="XC "+(pass?"PASS":"FAIL");
})();
