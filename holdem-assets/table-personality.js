/* Four distinct performances. Reactions follow public poker events, never cards. */
(function(){
'use strict';
const names=['Vince','Bruno','Miles','Gus'],styles=['cool','power','nervous','warm'],identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),states=names.map((name,seat)=>({name,seat,style:styles[seat],at:-100,type:'idle',duration:3,habitAt:4+seat*2.3,habitUntil:-1}));
let time=0,previous=null,cast=null,paused=false;const cache=new Map();
function trigger(seat,type){const s=states[seat];if(type==='lose'&&s.type==='fold'&&time-s.at<s.duration){s.queued=type;return}s.type=type;s.at=time;s.duration=type==='fold'?2.65:type==='lose'?4.3:3.8;cache.clear()}
function sync(snapshot){if(previous?.session!==snapshot.session){for(const s of states){s.at=-100;s.queued=null;s.thump=-1;s.habitAt=time+4+s.seat*2.3;s.habitUntil=-1}previous=null}
 if(previous&&snapshot.hand===previous.hand)for(const p of snapshot.players)if(p.inHand&&p.folded&&!previous.players[p.id].folded)trigger(p.id,'fold');
 if(snapshot.phase==='complete'&&(previous?.phase!=='complete'||previous.hand!==snapshot.hand)){const winners=new Set((snapshot.pots||[]).filter(p=>!p.refund).flatMap(p=>p.winners));if(snapshot.gameType==='blackjack'){for(const p of snapshot.players)if(p.hands?.some(h=>['Win','Blackjack'].includes(h.outcome)))winners.add(p.id)}else if(!winners.size)for(const w of snapshot.payouts||[])winners.add(w.id);for(const p of snapshot.players)if(p.inHand&&p.stack>0)trigger(p.id,winners.has(p.id)?'win':'lose')}
 previous=JSON.parse(JSON.stringify(snapshot));
}
function update(dt,model,animate=true){cast=model;paused=!animate;cache.clear();if(paused)return;time+=Math.min(dt,.1);for(const s of states){if(s.queued&&time-s.at>=s.duration){const type=s.queued;s.queued=null;trigger(s.seat,type)}const beat=Math.floor((time-s.at)/.7);if(s.type==='lose'&&s.seat===1&&time-s.at<1.7&&beat>=0&&beat!==s.thump){s.thump=beat;window.HoldEmAudio?.chip('land',.55)}}for(const s of states)if(time>s.habitAt){s.habitUntil=time+[2.8,2.0,3.3,3.4][s.seat];s.habitAt=time+[13,17,9,15][s.seat]+Math.sin(time*.4+s.seat)*2}}
function performance(seat){const s=states[seat];if(!s||paused)return null;const t=time-s.at;if(t<s.duration){const u=t/s.duration,weight=Math.sin(Math.PI*u);return{s,t,u,weight,type:s.type}}if(time<s.habitUntil){const t=s.habitUntil-time;return{s,t,u:1-t/3.4,weight:Math.min(1,t/.45),type:'habit'}}return null}
function head(actor){const a=cast?.actors.find(p=>p.id===actor);if(!a||!Number.isInteger(a.characterIndex))return null;const p=performance(a.characterIndex);if(!p)return null;let turn=0,pitch=0,roll=0;const {s,t,weight:w,type}=p;
 if(type==='fold'){turn=[.12,-.045,.16,.065][s.seat]*Math.sin(t*4)*w;pitch=[.065,.11,.12,.10][s.seat]*Math.sin(t*3)*w}
 else if(type==='lose'){turn=[.18,.13,.28,.19][s.seat]*Math.sin(t*[2.4,3.1,4.6,2.1][s.seat])*w;pitch=[-.06,.08,-.15,.12][s.seat]*w;roll=s.seat===2?Math.sin(t*5)*.04*w:0}
 else if(type==='win'){turn=Math.sin(t*2.8)*.055*w;pitch=-Math.sin(t*[3,4,5,2.7][s.seat])*[.06,.09,.12,.09][s.seat]*w}
 else{turn=[.04,.025,.08,.035][s.seat]*Math.sin(t*[2,2,4.2,1.6][s.seat])*w;pitch=[.025,.04,.055,.045][s.seat]*Math.sin(t*2.5)*w}
 const pivot=a.headPivot||[a.x,a.headY-.12,a.z],base=a.yaw,m=HoldEmProps.transform(pivot,pivot,[Math.sin(base),0,Math.cos(base)],[Math.sin(base+turn)*Math.cos(pitch),Math.sin(pitch),Math.cos(base+turn)*Math.cos(pitch)]);if(roll){m[4]+=Math.cos(base)*roll;m[6]-=Math.sin(base)*roll}return m;
}
function body(rig){if(rig?.part!=='body')return null;const a=cast?.actors.find(p=>p.id===rig.actor),p=performance(a?.characterIndex);if(!p)return null;const m=identity(),weight=p.weight,amp=p.type==='lose'?.007:p.type==='win'?.009:.002;m[13]=Math.sin(p.t*(a.characterIndex===2?7:3.5))*amp*weight;return m}
function arm(rig){if(rig?.part!=='arm')return null;const a=cast?.actors.find(p=>p.id===rig.actor),p=performance(a?.characterIndex);if(!p)return null;const key=rig.actor+':'+rig.side;if(cache.has(key))return cache.get(key);const {s,t,u,weight:w,type}=p,right=rig.side===-1,point=(x,z,y)=>HoldEmSeating.point(HoldEmSeating.seats[s.seat],x,z,y);let target;
 if(type==='fold'){
  if(!right&&s.seat!==2)return null;
  target=point((right?-1:1)*(.19+Math.sin(u*Math.PI)*[.22,.13,.20,.10][s.seat]),.53+Math.sin(u*Math.PI)*.11,.84+Math.sin(t*4)*.015);
 }else if(type==='lose'){
  if(s.seat===0){if(right)return null;target=point(.23,.18,1.12)}
  if(s.seat===1){if(!right)return null;target=point(-.22,.55,.86+Math.pow(Math.max(0,Math.sin(t*7)),3)*.14)}
  if(s.seat===2)target=point((right?-1:1)*.30,.26,1.12+Math.sin(t*4)*.04);
  if(s.seat===3)target=point((right?-1:1)*.27,.39,.94+Math.sin(t*2.4)*.025);
 }else if(type==='win'){
  if(s.seat===0){if(!right)return null;target=point(-.21,.45,.90)}
  if(s.seat===1){if(!right)return null;target=point(-.18,.24,1.18)}
  if(s.seat===2)target=point((right?-1:1)*.27,.29,1.14+Math.sin(t*5)*.06);
  if(s.seat===3)target=point((right?-1:1)*.21,.51,.87+Math.sin(t*6)*.02);
 }else{
  if(s.seat===0){if(right)return null;target=point(.21,.25,1.04)}
  if(s.seat===1){if(!right)return null;target=point(-.19,.51,.845+Math.sin(t*3)*.012)}
  if(s.seat===2){if(!right)return null;target=point(-.15,.55,.855+Math.sin(t*12)*.008)}
  if(s.seat===3){if(right)return null;target=point(.27,.31,1.0)}
 }
 if(!target)return null;const result=HoldEmProps.armTo(rig,rig.hand.map((v,i)=>v+(target[i]-v)*w));cache.set(key,result);return result;
}
window.HoldEmPersonality={sync,update,head,body,arm,get active(){return !paused&&states.some(s=>time<s.at+s.duration||time<s.habitUntil)}};
})();
