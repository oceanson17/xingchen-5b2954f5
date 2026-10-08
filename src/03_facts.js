/* ===== 知情防火牆 ===== */
var FW={};
FW.knows=function(id,key){
 if(id==="narr"||id===""||id==="me"||id==="haichen")return !!(S.learned&&S.learned[key]);
 if(S.learned&&S.learned[key]&&id==="haichen")return true;
 var card=PEOPLE[id];
 return !!(card&&card.know&&card.know.indexOf(key)>=0);
};
FW.hit=function(text){
 var hits=[];
 SECRETS.forEach(function(sec){if(sec.re.test(text))hits.push(sec.k);});
 return hits;
};
FW.scrubLine=function(text,speaker){
 if(SET.firewall===false)return text;
 var who=speaker||"";
 var parts=splitSent(String(text||""));
 var out=[];
 parts.forEach(function(s){
  if(!s)return;
  var hits=FW.hit(s);
  var leak=false;
  for(var i=0;i<hits.length;i++){
   if(!S.learned[hits[i]]){leak=true;break;}
  }
  if(!leak)out.push(s);
 });
 if(!out.length)return text&&FW.hit(text).length?"（有些話沒有說出口。）":text;
 return out.join("");
};
FW.scrubScene=function(sc){
 if(!sc)return sc;
 sc.lines=(sc.lines||[]).map(function(l){
  if(l.player)return l;
  return {sp:l.sp||"",t:FW.scrubLine(l.t,l.sp||""),player:0};
 }).filter(function(l){return l.t;});
 if(!sc.lines.length)sc.lines=[{sp:"",t:"話題在這裡輕輕岔開。我沒有再問。"}];
 sc.ch=(sc.ch||[]).map(function(c){c.t=FW.scrubLine(c.t,"");return c;});
 return sc;
};
FW.playerKnown=function(){
 var a=[];
 SECRETS.forEach(function(sec){if(S.learned[sec.k])a.push(sec.k);});
 return a;
};
function splitSent(t){
 var out=[],buf="";
 for(var i=0;i<t.length;i++){buf+=t[i];if("。！？\n".indexOf(t[i])>=0){out.push(buf);buf="";}}
 if(buf)out.push(buf);
 return out;
}
function aiKnowLine(id){
 var card=PEOPLE[id];if(!card)return "";
 var ks=(card.know||[]).filter(function(k){return true;});
 var labels={sister:"身世真相（開局仍不可對歐海辰說，且她本人尚未對上）",couple:"與伴侶的關係（不可向歐海辰說破）",sisterlove:"對歐海辰不是愛情（不可說破）"};
 if(id==="xingchen")labels.sister="她弄丟過妹妹，但開局還沒有把眼前這個人認出來。不可說破。";
 var bits=ks.map(function(k){return labels[k]||k;});
 return cn(id)+"所知（仍不可向玩家角色說破的部分）："+(bits.join("；")||"無須隱瞞的院內秘密");
}
