/* Elimination is visual only: the poker ledger decides who is actually busted. */
(function(){
'use strict';
let clock=0;const states=new Map(),identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function scream(){window.HoldEmAudio?.scream()}
function sync(s){for(const p of s.players){if(p.stack>0){states.delete(p.id);continue}if(s.phase==='complete'&&!states.has(p.id)){states.set(p.id,{start:clock+.9,sounded:false});window.dispatchEvent(new CustomEvent('holdem:bust',{detail:p.id}))}else if(s.phase!=='complete'&&!p.inHand&&!states.has(p.id))states.set(p.id,{start:clock-5,sounded:true})}}
function update(dt){clock+=Math.min(dt,.1);for(const s of states.values())if(!s.sounded&&clock>=s.start){s.sounded=true;scream()}}
function progress(seat){const s=states.get(seat);return s?Math.max(0,Math.min(1,(clock-s.start)/2.2)):0}
function pose(seat,chair=false){if(!states.has(seat))return null;const p=HoldEmSeating.seats[seat],u=progress(seat),angle=chair?-.22*Math.sin(Math.min(1,u*3)*Math.PI):-8.2*u,base=p[2],cy=Math.cos(base),sy=Math.sin(base),cp=Math.cos(angle),sp=Math.sin(angle),m=identity(),pivot=[p[0],chair?.50:.65,p[1]],distance=chair?0:1.9*u,dest=[pivot[0]-Math.sin(base)*distance,pivot[1]+(chair?0:.7*Math.sin(u*Math.PI)-6.8*u*u),pivot[2]-Math.cos(base)*distance];m[0]=cy*cy+sy*cp*sy;m[1]=-sp*sy;m[2]=-sy*cy+cy*cp*sy;m[4]=sy*sp;m[5]=cp;m[6]=cy*sp;m[8]=-cy*sy+sy*cp*cy;m[9]=-sp*cy;m[10]=sy*sy+cy*cp*cy;m[12]=dest[0]-(m[0]*pivot[0]+m[4]*pivot[1]+m[8]*pivot[2]);m[13]=dest[1]-(m[1]*pivot[0]+m[5]*pivot[1]+m[9]*pivot[2]);m[14]=dest[2]-(m[2]*pivot[0]+m[6]*pivot[1]+m[10]*pivot[2]);return m}

window.HoldEmStage={sync,update,pose,progress,has:seat=>states.has(seat),gone:seat=>states.has(seat)&&progress(seat)>=1,get active(){return [...states.keys()].some(i=>progress(i)<1)},get time(){return clock},mute(){return window.HoldEmAudio?.mute()},get muted(){return !!window.HoldEmAudio?.muted}};
})();
