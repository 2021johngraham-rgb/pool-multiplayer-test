(function(){
'use strict';
const seats=[[-2.02,.06,Math.atan2(2.02,-.06)],[.50,-1.50,Math.atan2(-.50,1.50)],[2.02,.06,Math.atan2(-2.02,-.06)],[0,1.50,Math.PI]];
const labels=['West seat','North seat','East seat','South seat'];
function point(seat,x,z,y=.766){const [sx,sz,a]=seat;return[sx+x*Math.cos(a)+z*Math.sin(a),y,sz-x*Math.sin(a)+z*Math.cos(a)]}
function fromDefault(p,seat){return point(seat,-p[0],1.5-p[2],p[1])}
function direction(seat,v){const a=seat[2]-Math.PI;return[v[0]*Math.cos(a)+v[2]*Math.sin(a),v[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)]}
function botLooks(wardrobe,random=Math.random){
 const pick=key=>{const list=wardrobe.categories.find(c=>c.key===key).options;return list[Math.floor(random()*list.length)].id};
 const looks={};let lastShirt='';
 for(let i=0;i<4;i++){let shirt=pick('shirt');if(shirt===lastShirt)shirt=wardrobe.categories[0].options[(wardrobe.categories[0].options.findIndex(o=>o.id===shirt)+1)%8].id;lastShirt=shirt;looks[i]=wardrobe.normalize({shirt,pants:pick('pants'),hat:random()<.8?pick('hat'):'none',costume:random()<.30?pick('costume'):'none',facialHair:pick('facialHair')})}
 return looks;
}
window.HoldEmSeating={seats,labels,point,fromDefault,direction,botLooks};
})();
