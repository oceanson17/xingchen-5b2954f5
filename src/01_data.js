/* ===== 星辰之海：人物、地點、秘密（常數，不進存檔） ===== */
var GAME_TITLE="星辰之海";
var PLACES={
 counsel:{n:"諮商室",floor:"聖瑞醫院 · 心理科"},
 hall:{n:"心理科走廊",floor:"聖瑞醫院"},
 data:{n:"血管數據室",floor:"血管外科"},
 nurse:{n:"護士站",floor:"血管外科"},
 lobby:{n:"醫院大堂",floor:"聖瑞醫院"},
 cafe:{n:"咖啡廳",floor:"地下"},
 ward:{n:"單人病房",floor:"住院樓層"},
 roof:{n:"天台",floor:"天台"},
 admin:{n:"行政走廊",floor:"行政樓層"},
 er:{n:"急診觀察",floor:"急診"},
 home:{n:"出租屋",floor:"醫院外"}
};
var PLACE_ORDER=["counsel","hall","data","nurse","lobby","cafe","ward","roof","admin","er","home"];
var PEOPLE={
 haichen:{n:"歐海辰",g:"f",age:28,role:"血管數據分析員",loc:"counsel",around:1,color:"#d7e2dc",know:[],
  card:"女，28 歲。身形瘦削、虛弱。短黑髮，粗黑框眼鏡。不是病人時穿深藍色襯衫；人在病房或急診、已入院或躺在床上時才是病人。結構變數，不是裝飾。亞斯伯格、創傷後應激、系統性血管炎、冠狀動脈痙攣（隨身帶硝酸甘油）、偏頭痛時視野模糊。靠近語言區的動脈瘤與血型，開局她自己還不知道，旁白不可預告。說話像在報數據，痛的時候淺笑，緊張時弄衣角。目標：不要被送進精神病院，不要拖累陳海柔。開局想不起護士長。刪掉她的能動、她的醫療危機或她的關鍵位置，都是禁止的。"},
 hairuo:{n:"陳海柔",g:"f",age:33,role:"臨床心理學家",loc:"counsel",around:1,color:"#8fb9a8",know:["couple","sisterlove"],
  card:"33 歲。很長的黑髮，棗紅西裝外套，沒有戴眼鏡。每週與歐海辰諮商三次，約一年。不是完美溫柔的拯救者。會自責、會失控，可能做出帶控制、甚至傷害性的照護決定；核心仍是無法放棄墨星辰，也無法放棄歐海辰。專業與情感互相衝突：可以安撫，也可以是下令約束或侵入性照護的人。對歐海辰是長姐之愛，不是愛情。與墨星辰同居約五年，是她的伴侶；這段關係歐海辰不知道，全院其他人知道，但不得向歐海辰說破。她曾是墨星辰的心理治療師，此節也不可對歐海辰說破。"},
 xingchen:{n:"墨星辰",g:"f",age:33,role:"副院長 · 心胸外科的頂點",loc:"admin",around:0,color:"#d9cbb8",know:["couple","sisterlove"],
  card:"33 歲，女。短而亂的黑髮，白襯衫，黑框眼鏡（方框，不是幼框）。聖瑞的頂點，也被視為醫學界的王，不是情感封閉的普通外科醫生。對外冷、沒耐心，只對陳海柔放軟。開局嫌歐海辰耗掉陳海柔的時間。她多年來一直在找一個走失的人，但開局尚未把歐海辰認出，也不可說那個人就是眼前這位，不可暗示對上了。歐海辰若離開、躲起或拒絕後走開，約兩步之內她會出現在新的地方發問，不放棄，也可以被聯絡到。這是尋人，不是打鬥、不是抓捕。不可在歐海辰面前點破身世。可動用非一般資源，但開局不表演這個。"},
 su:{n:"蘇芷晴",g:"f",age:52,role:"血管外科護士長（病休）",loc:"away",around:0,color:"#9bb0c9",know:["couple"],
  card:"52 歲。歐海辰的職場庇護。約一年前因病休離開，走前說了重話，海辰把她解離，開局想不起這個人。名字是蘇芷晴，不是林芷晴。"},
 lin:{n:"林澤松",g:"m",age:60,role:"院長 · 規則制定者（人在瑞士）",loc:"away",around:0,color:"#b7a6c9",know:["couple"],
  card:"聖瑞創辦人。規則制定者，能做醫療與非一般資源的雙重干預，也是保護者。可以說謊安撫，也可以為了保護陳海柔、墨星辰、歐海辰而代他們做決定。不是慈祥長者。名字是林澤松，不是林勁松。人在瑞士。不得每回合出現或介入；玩家沒點名、旗標沒叫他，就不要讓他進場。"},
 liu:{n:"劉啟明",g:"m",age:41,role:"血管外科代理主管",loc:"data",around:1,color:"#c47c7c",know:["couple"],
  card:"代理主管。勢利。知道院內那對關係，不會主動向海辰說破。"},
 li:{n:"李珮儀",g:"f",age:30,role:"血管外科同事",loc:"data",around:1,color:"#d4b483",know:["couple"],
  card:"同事。把工作推給海辰。知道院內那對關係，不會向海辰說明。"},
 jianqiang:{n:"歐建強",g:"m",age:55,role:"養父（未出場）",loc:"away",around:0,color:"#8a7e78",know:[],
  card:"養父，仍在世。虐待與禁閉只可寫成記憶湧上、身體緊繃，不寫過程。開局未出場。"},
 xiujuan:{n:"梁秀娟",g:"f",age:53,role:"養母（未出場）",loc:"away",around:0,color:"#8a7e78",know:[],
  card:"養母，仍在世。同上，開局未出場。"}
};
var SECRETS=[
 {k:"sister",re:/墨海晴|親妹妹|親生妹妹|走失的妹|失散的妹|同胞妹妹|你是.{0,8}妹妹|妹妹.{0,6}墨星辰/},
 {k:"couple",re:/同居|伴侶|女朋友|男朋友|愛人|情侶/},
 {k:"sisterlove",re:/長姐之愛|不是愛情|不是戀愛|曾是.{0,8}治療師|做過.{0,6}治療師/}
];
var TOPICS=["自由","近況","身體","工作","過去","請求"];
var ATTS=["平靜","坦白","閃躲","冷淡","求助","固執"];
var PLACE_BG={counsel:"counsel",hall:"hall",nurse:"hall",ward:"ward",er:"ward",data:"data",home:"data",roof:"roof",lobby:"hall",cafe:"hall",admin:"hall"};
var PORTRAIT={xingchen:"p_xingchen",hairuo:"p_hairuo"};
