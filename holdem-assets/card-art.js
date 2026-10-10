/* Original, resolution-independent playing-card and clay-chip artwork. */
(function(){
'use strict';
const TAU=Math.PI*2;
function path(c,points,fill,stroke,width=1){c.beginPath();for(let i=0;i<points.length;i++)c[i?'lineTo':'moveTo'](...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function ellipse(c,x,y,rx,ry,fill,stroke,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function round(c,x,y,w,h,r,fill,stroke,width=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function suitMark(c,suit,x,y,size,ink){
 c.save();c.translate(x,y);c.scale(size,size);c.fillStyle=ink;c.beginPath();
 if(suit==='♥'||suit==='H'){
  c.moveTo(0,.45);c.bezierCurveTo(-.10,.29,-.51,-.06,-.48,-.29);c.bezierCurveTo(-.46,-.58,-.12,-.61,0,-.35);c.bezierCurveTo(.12,-.61,.46,-.58,.48,-.29);c.bezierCurveTo(.51,-.06,.10,.29,0,.45);c.fill();
 }else if(suit==='♦'||suit==='D'){
  path(c,[[0,-.58],[.39,0],[0,.58],[-.39,0]],ink);
 }else if(suit==='♣'||suit==='C'){
  for(const [xx,yy]of[[0,-.28],[-.25,.015],[.25,.015]])ellipse(c,xx,yy,.245,.25,ink);
  path(c,[[-.045,-.07],[-.085,.29],[-.21,.48],[.21,.48],[.085,.29],[.045,-.07]],ink);
 }else{
  c.moveTo(0,-.58);c.bezierCurveTo(.08,-.40,.51,-.12,.49,.14);c.bezierCurveTo(.48,.39,.18,.47,.055,.23);c.lineTo(.09,.36);c.lineTo(.21,.51);c.lineTo(-.21,.51);c.lineTo(-.09,.36);c.lineTo(-.055,.23);c.bezierCurveTo(-.18,.47,-.48,.39,-.49,.14);c.bezierCurveTo(-.51,-.12,-.08,-.40,0,-.58);c.fill();
 }
 c.restore();
}
function line(c,points,color,width=2){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.lineWidth=width;c.strokeStyle=color;c.lineCap='round';c.lineJoin='round';c.stroke()}
function courtHalf(c,rank,suit,ink){
 const gold='#bc9650',light='#e2c77f',night='#18333b',blue='#375762',red='#9e343a',skin='#e6b991',shadow='#c28c69';
 // Brocade shoulders lead into a mirrored jacket at the center of the card.
 path(c,[[103,280],[105,237],[123,215],[154,205],[230,205],[263,220],[280,245],[281,280]],blue,night,3);
 path(c,[[114,280],[124,227],[162,214],[193,258],[224,214],[258,226],[271,280]],gold,night,2);
 path(c,[[157,215],[166,212],[191,251],[219,212],[230,216],[204,279],[183,279]],red,night,2);
 path(c,[[124,235],[155,224],[184,273],[151,280],[120,271]],night,null);
 path(c,[[260,235],[231,224],[202,273],[233,280],[264,271]],night,null);
 for(let row=0;row<4;row++)for(let col=0;col<3;col++){
  const x=129+col*12+row*5,y=241+row*11;path(c,[[x,y-3],[x+3,y],[x,y+3],[x-3,y]],light);
  const xx=384-x;path(c,[[xx,y-3],[xx+3,y],[xx,y+3],[xx-3,y]],light);
 }
 line(c,[[117,267],[136,230],[148,227]],light,3);line(c,[[268,267],[249,230],[236,227]],light,3);
 // Short sword / scepter, held straight so the silhouette stays easy to read.
 path(c,[[117,275],[113,164],[117,151],[121,165],[121,275]],light,night,2);
 path(c,[[108,173],[108,169],[126,169],[126,173]],gold,night,1.5);
 ellipse(c,118,239,7,11,skin,night,2);line(c,[[114,235],[121,235]],shadow,1);
 // Ears, curls and face are separate shapes rather than a generic crown glyph.
 ellipse(c,154,178,7,14,skin,night,2);ellipse(c,232,178,7,14,skin,night,2);
 path(c,[[153,164],[160,139],[187,129],[222,141],[232,164],[230,203],[217,217],[164,214],[155,192]],night,night,2);
 for(const [x,y]of[[153,159],[153,177],[158,197],[226,157],[233,177],[228,200]])ellipse(c,x,y,8,9,night,gold,1);
 path(c,[[161,148],[185,139],[216,145],[225,159],[222,188],[213,202],[193,211],[173,202],[162,186]],skin,night,2.5);
 path(c,[[215,153],[218,177],[212,191],[199,204],[214,200],[223,186],[225,159]],shadow);
 line(c,[[167,168],[177,165],[183,166]],night,3);line(c,[[201,166],[209,165],[218,169]],night,3);
 ellipse(c,176,174,3,2.2,night);ellipse(c,209,174,3,2.2,night);
 line(c,[[193,170],[189,184],[196,185]],shadow,2.5);
 if(rank==='Q'){
  path(c,[[179,191],[188,187],[193,190],[198,187],[207,191],[196,197],[189,197]],red);
  ellipse(c,158,190,4,5,gold,night,1);ellipse(c,228,190,4,5,gold,night,1);
 }else{
  path(c,[[164,188],[169,195],[176,194],[182,191],[192,194],[202,191],[209,194],[217,192],[221,187],[218,205],[210,216],[195,222],[181,217],[171,207]],night);
  path(c,[[173,190],[183,185],[193,189],[202,185],[213,190],[205,196],[196,193],[192,192],[188,194],[180,196]],night);
  line(c,[[184,203],[197,206],[206,202]],gold,1.5);
  for(const [x,y]of[[178,202],[182,209],[210,203],[204,213],[194,215]])line(c,[[x,y],[x+2,y+4]],gold,1);
 }
 // A crown with cut edges, jewels and two rows of engraved arches.
 path(c,[[157,148],[149,119],[164,129],[171,112],[184,130],[194,109],[205,130],[221,115],[223,133],[237,123],[229,150]],gold,night,2.5);
 path(c,[[160,139],[228,139],[227,150],[160,150]],light,night,2);
 for(const [x,y]of[[163,141],[181,141],[201,141],[219,141]])ellipse(c,x,y+4,3,3,red,night,1);
 ellipse(c,194,119,4,5,red,night,1);ellipse(c,170,123,3,3,blue,night,1);ellipse(c,220,126,3,3,blue,night,1);
 line(c,[[164,150],[226,150]],night,2);
 suitMark(c,suit,250,182,23,ink);
 path(c,[[235,196],[257,196],[263,217],[245,211]],light,night,1.5);
 suitMark(c,suit,249,204,10,ink);
 // Ornamental sleeve cuff and seam finish the half at the mirror line.
 line(c,[[105,276],[280,276]],night,3);line(c,[[109,280],[277,280]],light,2);
}
window.HoldEmCardArt=function(c,w,h,rank,suit){
 c.save();c.scale(w/384,h/560);const red=suit==='♥'||suit==='♦'||suit==='H'||suit==='D',ink=red?'#a92835':'#19282e';
 const paper=c.createLinearGradient(0,0,320,560);paper.addColorStop(0,'#fff9e9');paper.addColorStop(.52,'#f7f0db');paper.addColorStop(1,'#e3d8be');
 round(c,2,2,380,556,20,paper,'#d4c7ac',2);
 round(c,7,7,370,546,17,null,'rgba(255,255,255,.85)',1);
 // Minute print texture is baked once, never generated in the animation loop.
 c.fillStyle='rgba(105,86,52,.025)';for(let y=12;y<548;y+=7)for(let x=12+(y%3);x<370;x+=7)c.fillRect(x,y,.75,.75);
 for(const flip of [false,true]){
  c.save();if(flip){c.translate(384,560);c.rotate(Math.PI)}
  c.fillStyle=ink;c.textAlign='center';c.font='bold 68px Georgia';c.fillText(rank,44,79);suitMark(c,suit,44,111,40,ink);c.restore();
 }
 if(['J','Q','K'].includes(String(rank))){
  round(c,88,98,208,364,2,'#eee3bd','#19323a',3);
  round(c,94,104,196,352,1,null,'#bb9550',2);
  c.save();c.beginPath();c.rect(97,107,190,346);c.clip();courtHalf(c,rank,suit,ink);c.translate(384,560);c.rotate(Math.PI);courtHalf(c,rank,suit,ink);c.restore();
 }else if(rank==='A'){
  suitMark(c,suit,192,267,131,ink);
  c.fillStyle=ink;c.textAlign='center';c.font='13px Georgia';c.fillText('H O L D   E M',192,370);
  line(c,[[152,379],[232,379]],'#ad9567',1);suitMark(c,suit,192,394,10,ink);
 }else{
  const count=Number(rank),layouts={2:[[0,-1],[0,1]],3:[[0,-1],[0,0],[0,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]],7:[[-1,-1],[1,-1],[0,-.5],[-1,0],[1,0],[-1,1],[1,1]],8:[[-1,-1],[1,-1],[0,-.5],[-1,0],[1,0],[0,.5],[-1,1],[1,1]],9:[[-1,-1],[1,-1],[-1,-.33],[1,-.33],[0,0],[-1,.33],[1,.33],[-1,1],[1,1]],10:[[-1,-1],[1,-1],[0,-.66],[-1,-.33],[1,-.33],[-1,.33],[1,.33],[0,.66],[-1,1],[1,1]]};
  for(const [x,y]of layouts[count]||[]){c.save();c.translate(192+x*68,280+y*137);if(y>0)c.rotate(Math.PI);suitMark(c,suit,0,0,count>=9?44:52,ink);c.restore()}
 }
 c.restore();return true;
};
window.HoldEmCardBack=function(c,w,h){
 const palette=({ruby:['#582c3d','#78394e','#3a192d','#58243b'],jade:['#245840','#34775b','#153b30','#235440']}[window.GameStudio?.get('cardBack')]||['#214b58','#315d68','#143742','#234b58']);c.save();c.scale(w/384,h/560);round(c,2,2,380,556,20,'#f1e7ca','#d6c9a9',2);
 round(c,17,17,350,526,12,palette[0],'#b69a5e',3);
 c.save();c.beginPath();c.roundRect(25,25,334,510,8);c.clip();
 const grad=c.createLinearGradient(0,0,384,560);grad.addColorStop(0,palette[1]);grad.addColorStop(.5,palette[2]);grad.addColorStop(1,palette[3]);c.fillStyle=grad;c.fillRect(25,25,334,510);
 for(let y=-12;y<600;y+=23)for(let x=-12+(Math.round(y/23)%2)*11.5;x<410;x+=23){path(c,[[x,y-8],[x+8,y],[x,y+8],[x-8,y]],null,'#68818a',.7);ellipse(c,x,y,1.3,1.3,'#b6ad83')}
 c.restore();round(c,29,29,326,502,7,null,'#baa46c',1.5);round(c,39,39,306,482,7,null,'#baa46c',1);
 for(const flip of [false,true]){
  c.save();if(flip){c.translate(384,560);c.rotate(Math.PI)}
  for(const x of [65,319]){
   ellipse(c,x,67,16,16,'#1c424c','#cfb97b',1.5);suitMark(c,'♠',x,68,16,'#d3bf85');
   line(c,[[x,88],[x,123],[x+(x<100?15:-15),143]],'#c9b376',1);
  }
  path(c,[[78,232],[108,193],[138,165],[192,145],[246,165],[276,193],[306,232],[268,264],[116,264]],'#183e49','#bda66c',2);
  c.beginPath();c.moveTo(104,244);c.bezierCurveTo(101,211,144,190,149,172);c.bezierCurveTo(167,191,166,208,151,218);c.bezierCurveTo(133,230,113,219,122,205);c.strokeStyle='#d5c28b';c.lineWidth=2;c.stroke();
  c.save();c.translate(384,0);c.scale(-1,1);c.beginPath();c.moveTo(104,244);c.bezierCurveTo(101,211,144,190,149,172);c.bezierCurveTo(167,191,166,208,151,218);c.bezierCurveTo(133,230,113,219,122,205);c.stroke();c.restore();
  suitMark(c,'♠',192,202,45,'#dac78e');
  c.restore();
 }
 ellipse(c,192,280,62,62,'#183d47','#dcc78b',3);ellipse(c,192,280,54,54,null,'#a58f59',1);
 for(let i=0;i<16;i++){const a=i*TAU/16;ellipse(c,192+Math.cos(a)*47,280+Math.sin(a)*47,1.5,1.5,'#d9c790')}
 c.fillStyle='#e9d8a5';c.textAlign='center';c.font='bold 27px Georgia';c.fillText('HOLD',192,276);c.font='22px Georgia';c.fillText('EM',192,304);
 c.restore();return true;
};
window.HoldEmChipArt=function(c,w,h,value,base){
 c.save();c.scale(w/256,h/256);ellipse(c,128,128,127,127,base||'#235e4c');
 c.save();c.beginPath();c.arc(128,128,126,0,TAU);c.clip();
 for(let i=0;i<8;i++){
  c.save();c.translate(128,128);c.rotate(i*TAU/8);round(c,-11,-130,22,38,3,'#e9dec2');round(c,13,-127,5,28,1,'#c3b185');c.restore();
 }
 c.restore();ellipse(c,128,128,96,96,null,'#d5c49b',2);ellipse(c,128,128,89,89,null,'#d5c49b',1);
 ellipse(c,128,128,74,74,'rgba(8,23,27,.4)','#f0e4bc',2);
 for(let i=0;i<16;i++){const a=i*TAU/16;ellipse(c,128+Math.cos(a)*82,128+Math.sin(a)*82,1.2,1.2,'#e3d2a3')}
 c.textAlign='center';c.fillStyle='#fcf0ce';c.font='bold '+(String(value).length>2?50:60)+'px Georgia';c.fillText(String(value),128,145);c.font='13px Georgia';c.fillText('H O L D  E M',128,172);suitMark(c,'♠',128,87,17,'#d9c89a');c.restore();return true;
};
})();
