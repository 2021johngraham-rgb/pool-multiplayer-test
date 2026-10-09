/* Cigar and lighter meshes plus a shared, reversible reach/light choreography. */
(function(){
'use strict';
const S=()=>window.HoldEmSeating,identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)},sub=(a,b)=>a.map((v,i)=>v-b[i]),unit=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function transform(origin,destination,from,to,stretch=1){
 const a=unit(from),b=unit(to),v=cross(a,b),c=Math.max(-1,Math.min(1,a.reduce((s,x,i)=>s+x*b[i],0))),m=identity();
 if(c<-.999){m[0]=-1;m[10]=-1}else{const k=1/(1+c),[x,y,z]=v;m[0]=1-(y*y+z*z)*k;m[1]=z+x*y*k;m[2]=-y+x*z*k;m[4]=-z+y*x*k;m[5]=1-(x*x+z*z)*k;m[6]=x+y*z*k;m[8]=y+z*x*k;m[9]=-x+z*y*k;m[10]=1-(x*x+y*y)*k}
 for(const i of[0,1,2,4,5,6,8,9,10])m[i]*=stretch;
 m[12]=destination[0]-(m[0]*origin[0]+m[4]*origin[1]+m[8]*origin[2]);m[13]=destination[1]-(m[1]*origin[0]+m[5]*origin[1]+m[9]*origin[2]);m[14]=destination[2]-(m[2]*origin[0]+m[6]*origin[1]+m[10]*origin[2]);return m;
}
function rest(seat,kind='cigar'){const p=S().point(S().seats[seat],kind==='cigar'?-.36:.36,.37,.873),angle=Math.atan2(p[2]/1.115,p[0]/1.81);return [1.81*Math.cos(angle),kind==='cigar'?.873:.876,1.115*Math.sin(angle)]}
function armTo(rig,target){const P=rig.pivot,E=rig.elbow,H=rig.hand,a=Math.hypot(...sub(E,P)),b=Math.hypot(...sub(H,E)),d=Math.hypot(...sub(target,P)),stretch=Math.max(1,Math.min(1.45,d/(a+b-.004))),A=a*stretch,B=b*stretch,D=Math.max(.001,Math.min(d,A+B-.001)),axis=unit(sub(target,P));let bend=sub(sub(E,P),axis.map(v=>v*sub(E,P).reduce((n,x,k)=>n+x*axis[k],0)));if(Math.hypot(...bend)<.01)bend=cross(axis,[0,1,0]);bend=unit(bend);const along=Math.max(-1,Math.min(1,(A*A+D*D-B*B)/(2*A*D))),across=Math.sqrt(1-along*along),joint=P.map((v,k)=>v+axis[k]*A*along+bend[k]*A*across),end=P.map((v,k)=>v+axis[k]*D);return{upper:transform(P,P,sub(E,P),sub(joint,P),stretch),lower:transform(E,joint,sub(H,E),sub(end,joint),stretch),elbow:E,axis:unit(sub(H,E))}}
function build(add){
 const centers=[];
 for(let seat=0;seat<4;seat++){
  const origin=S().seats[seat];let partName='cigar';const point=p=>{const q=S().point(origin,p[0],p[2],p[1]),cigar=['cigar','ember'].includes(partName),old=S().point(origin,cigar?-.40:.10,cigar?.65:.70,.785),next=rest(seat,cigar?'cigar':'lighter');return q.map((v,i)=>v+next[i]-old[i])};
  function cylinder(a,b,r,color,part,mat=2){partName=part;const d=[],axis=unit(sub(b,a)),u=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);function vertex(p,n){d.push(...point(p),...S().direction(origin,[-n[0],n[1],-n[2]]),0,0)}for(let j=0;j<24;j++){const angle=j*Math.PI/12,next=(j+1)*Math.PI/12,n=t=>u.map((q,k)=>q*Math.cos(t)+v[k]*Math.sin(t)),p=(q,t)=>q.map((x,k)=>x+n(t)[k]*r),A=p(a,angle),B=p(a,next),C=p(b,next),D=p(b,angle);for(const [q,t]of[[A,angle],[B,next],[C,next],[A,angle],[C,next],[D,angle]])vertex(q,n(t));for(const q of[a,B,A])vertex(q,axis.map(x=>-x));for(const q of[b,D,C])vertex(q,axis)}add(d,color,mat,null,{part,seat})}
  // The player's right is local -X; the lighter is on local +X.
  const center=[-.40,.785,.65];centers.push(rest(seat));
  cylinder([-.40,.785,.57],[-.40,.785,.73],.011,[.28,.12,.047],'cigar');
  cylinder([-.40,.785,.621],[-.40,.785,.642],.0116,[.75,.52,.16],'cigar',4);
  cylinder([-.40,.785,.719],[-.40,.785,.732],.0109,[.49,.46,.40],'cigar');
  cylinder([-.40,.785,.728],[-.40,.785,.735],.0085,[1,.21,.025],'ember',6);
  function box(c,size,color,part,mat){partName=part;const d=[],p=(x,y,z)=>point([c[0]+x*size[0]/2,c[1]+y*size[1]/2,c[2]+z*size[2]/2]);for(const [ids,n]of[[[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[0,1,0]],[[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],[0,-1,0]],[[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[0,0,1]],[[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[0,0,-1]],[[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[1,0,0]],[[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[-1,0,0]]])for(const i of[0,1,2,0,2,3])d.push(...p(...ids[i]),...S().direction(origin,[-n[0],n[1],-n[2]]),0,0);add(d,color,mat,null,{part,seat})}
  box([.10,.779,.70],[.045,.025,.064],[.65,.46,.19],'lighter',4);box([.10,.794,.724],[.046,.009,.018],[.23,.20,.16],'lighter',4);box([.10,.802,.69],[.025,.007,.012],[.052,.054,.05],'lighter',2);
  cylinder([.10,.785,.735],[.10,.785,.762],.006,[1,.62,.11],'flame',6);
 }
 return centers;
}
function create(){
 let time=0,headPoses=null;const states=Array.from({length:4},()=>({start:-100,lit:false,returnAt:-100,lastSmoke:0,burst:false}));let actors=[],particles=[];
 function trigger(seat){if(!Number.isInteger(seat)||!states[seat])return false;const s=states[seat];if(time<s.returnAt+3.3)return false;s.start=time;s.returnAt=time+60;s.lit=false;s.burst=false;return true}
 function puff(seat,count=50){if(!Number.isInteger(seat))return;const center=rest(seat),direction=[Math.sin(S().seats[seat][2]),0,Math.cos(S().seats[seat][2])],tip=center.map((v,i)=>v+direction[i]*.085),m=pose({part:'cigar',seat}),origin=m?[m[0]*tip[0]+m[4]*tip[1]+m[8]*tip[2]+m[12],m[1]*tip[0]+m[5]*tip[1]+m[9]*tip[2]+m[13],m[2]*tip[0]+m[6]*tip[1]+m[10]*tip[2]+m[14]]:tip;for(let i=0;i<count&&particles.length<220;i++)particles.push({p:origin.slice(),v:[direction[0]*(count>2?.18:.03)+(Math.random()-.5)*.07,.10+Math.random()*.14,direction[2]*(count>2?.18:.03)+(Math.random()-.5)*.07],age:0,life:2+Math.random(),radius:.018+Math.random()*.023,seed:Math.random()*7,heavy:count>2})}
 function putDown(seat){const s=states[seat];if(!s||s.start<0||time>=s.returnAt)return false;s.returnAt=Math.max(time,s.start+8.2);return true}
 function update(dt,cast){dt=Math.min(dt,.1);time+=dt;armCache.clear();actors=cast?.actors||[];for(let seat=0;seat<states.length;seat++){const s=states[seat];s.lit=time>s.start+6.15&&time<s.returnAt+1.8;if(s.lit&&time-s.lastSmoke>.14){s.lastSmoke=time;puff(seat,1)}if(time>=s.returnAt&&time<s.returnAt+3&&s.start>=0&&!s.burst){s.burst=true;puff(seat,65)}}particles=particles.filter(p=>{p.age+=dt;if(p.age>=p.life)return false;for(let i=0;i<3;i++)p.p[i]+=p.v[i]*dt;return true})}

 const armCache=new Map();
 function pose(rig){if(!rig||!['cigar','ember','lighter','flame','arm'].includes(rig.part))return null;const seat=rig.seat??actors.find(a=>a.id===rig.actor)?.characterIndex;if(!Number.isInteger(seat))return null;const s=states[seat],t=time-s.start,seatDef=S().seats[seat],actor=actors.find(a=>a.characterIndex===seat),cigarRest=rest(seat),lighter=rest(seat,'lighter'),restDirection=[Math.sin(seatDef[2]),0,Math.cos(seatDef[2])];
  const lift=smooth((t-1.1)/1.4),lower=smooth((time-s.returnAt-.8)/1.2),attachment=lift*(1-lower),headPose=headPoses?.get(actor?.id)?.pose;
  let mouth=actor?.mouthAnchor||S().point(seatDef,-.024,.125,(actor?.headY||1.5)-.09),direction=unit(actor?.mouthForward||restDirection);
  if(headPose){mouth=[headPose[0]*mouth[0]+headPose[4]*mouth[1]+headPose[8]*mouth[2]+headPose[12],headPose[1]*mouth[0]+headPose[5]*mouth[1]+headPose[9]*mouth[2]+headPose[13],headPose[2]*mouth[0]+headPose[6]*mouth[1]+headPose[10]*mouth[2]+headPose[14]];direction=unit([headPose[0]*direction[0]+headPose[4]*direction[1]+headPose[8]*direction[2],headPose[1]*direction[0]+headPose[5]*direction[1]+headPose[9]*direction[2],headPose[2]*direction[0]+headPose[6]*direction[1]+headPose[10]*direction[2]])}
  // The back end is fixed to the lip anchor. The center sits half a cigar outward.
  const heldCenter=mouth.map((v,i)=>v+direction[i]*.077),cigar=mix(cigarRest,heldCenter,attachment),cigarDirection=unit(mix(restDirection,direction,attachment));
  const tip=cigar.map((v,i)=>v+cigarDirection[i]*.085);
  const lightUp=smooth((t-3.4)/1.5),lightDown=smooth((t-6.4)/1.1),lightTarget=tip.map((v,i)=>v+(i===1?-.055:0)),lightPosition=mix(lighter,lightTarget,lightUp*(1-lightDown));
  if(['cigar','ember'].includes(rig.part))return transform(cigarRest,cigar,restDirection,cigarDirection);
  if(['lighter','flame'].includes(rig.part))return transform(lighter,lightPosition,restDirection,unit(mix(restDirection,[0,1,0],lightUp*(1-lightDown))));
  if(rig.part==='arm'&&(t<9||time>=s.returnAt&&time<s.returnAt+3.3)){const right=rig.side===-1,restHand=rig.hand,reach=time>=s.returnAt?(right?smooth((time-s.returnAt)/.8):0):right?smooth(t/.85):smooth((t-2.7)/.65),returning=time>=s.returnAt?smooth((time-s.returnAt-2.2)/.8):right?smooth((t-2.6)/1.2):lightDown;const target=mix(restHand,right?cigar:lightPosition,reach*(1-returning));const key=rig.actor+':'+rig.side;if(!armCache.has(key)){
 armCache.set(key,armTo(rig,target));
 }return armCache.get(key).upper}
  return null;
 }
 function visible(rig){if(rig?.part==='ember')return states[rig.seat].lit;if(rig?.part==='flame'){const t=time-states[rig.seat].start;return t>5.1&&t<6.4}return true}
 return {setHeads(states){headPoses=states;armCache.clear()},trigger,putDown,puff,cancel(seat){const state=states[seat];if(state){state.start=-100;state.returnAt=-100;state.lit=false}armCache.clear()},update,pose,visible,held(seat){const s=states[seat];return s&&s.start>=0&&time<s.returnAt+3.3},get particles(){return particles},arm(rig){if(rig?.part!=='arm')return null;pose(rig);return armCache.get(rig.actor+':'+rig.side)||null},get active(){return particles.length>0||states.some(s=>s.start>=0&&time<s.returnAt+3.3)},get states(){return states},get time(){return time},gaze(seat){if(!Number.isInteger(seat)||!states[seat])return null;const t=time-states[seat].start;return t>2.5&&t<4.2?rest(seat,'lighter'):t>=4.2&&t<6.4?S().point(S().seats[seat],-.10,.90,(actors.find(a=>a.characterIndex===seat)?.headY||1.5)-.03):null}};
}
window.HoldEmProps={build,create,transform,rest,armTo};
})();
