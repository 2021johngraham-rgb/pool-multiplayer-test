/* Independent attention and blink timings; GPU transforms keep meshes immutable. */
window.HoldEmMotion=function(actors){
 const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const states=new Map();
 actors.forEach((a,i)=>{
  let seed=8731+i*7919;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  states.set(a.id,{a,random,pose:identity(),turn:0,pitch:0,fromTurn:0,fromPitch:0,toTurn:0,toPitch:0,changeAt:.7+i*.63,moveAt:-2,duration:.8,blinkAt:1.3+i*.71,blinkStart:-5,blink:0});
 });
 let time=0;
 function update(dt,animate=true){
  if(!animate)return;time+=Math.min(dt,.08);
  for(const s of states.values()){
   if(time>s.changeAt){
    const a=s.a,r=s.random();let target;
    // Alternating attention: own cards, table center, other faces, occasionally you.
    if(a.standing){const side=(s.random()-.5)*.8;target=[a.x+Math.sin(a.yaw)*2+side,a.headY-.035+s.random()*.08,a.z+Math.cos(a.yaw)*2]}
    else if(r<.3)target=[a.x+Math.sin(a.yaw)*.46,.80,a.z+Math.cos(a.yaw)*.46];
    else if(r<.48)target=[0,.80,0];
    else if(r<.73){const self=actors.find(p=>p.self);target=self?[self.x,self.headY,self.z] :[0,1.38,1.87]}
    else{const peers=actors.filter(p=>p.id!==a.id);let p=peers[Math.floor(s.random()*peers.length)];target=p?[p.x,p.headY,p.z]:[0,1.38,1.87]}
    const dx=target[0]-a.x,dz=target[2]-a.z;
    s.fromTurn=s.turn;s.fromPitch=s.pitch;
    s.toTurn=clamp(wrap(Math.atan2(dx,dz)-a.yaw),-.58,.58);
    s.toPitch=clamp(-Math.atan2(target[1]-a.headY,Math.hypot(dx,dz)),-.14,.36);
    s.moveAt=time;s.duration=.82+s.random()*.48;s.changeAt=time+2.5+s.random()*3.6;
    if(s.random()<.45)s.blinkAt=Math.min(s.blinkAt,time+.08);
   }
   let u=clamp((time-s.moveAt)/s.duration,0,1);u=u*u*u*(u*(u*6-15)+10);
   s.turn=s.fromTurn+(s.toTurn-s.fromTurn)*u;s.pitch=s.fromPitch+(s.toPitch-s.fromPitch)*u+Math.sin(u*Math.PI)*.012;
   if(time>s.blinkAt){s.blinkStart=time;s.blinkAt=time+2.4+s.random()*3.8}
   const b=(time-s.blinkStart)/.145;s.blink=b>=0&&b<=1?Math.pow(Math.sin(b*Math.PI),1.3)*.97:0;
   const a=s.a,base=a.yaw,y=s.turn,p=s.pitch;
   // R_y(base + turn) * R_x(pitch) * R_y(-base), around the neck.
   const cy=Math.cos(base+y),sy=Math.sin(base+y),cb=Math.cos(base),sb=Math.sin(base),cp=Math.cos(p),sp=Math.sin(p),m=s.pose;
   m[0]=cy*cb+sy*cp*sb;m[1]=-sp*sb;m[2]=-sy*cb+cy*cp*sb;
   m[4]=sy*sp;m[5]=cp;m[6]=cy*sp;
   m[8]=-cy*sb+sy*cp*cb;m[9]=-sp*cb;m[10]=sy*sb+cy*cp*cb;
   const pivot=[a.x,a.headY-.12,a.z],lift=Math.sin(time*1.35+a.id*1.6)*.0018;
   m[12]=pivot[0]-(m[0]*pivot[0]+m[4]*pivot[1]+m[8]*pivot[2]);
   m[13]=pivot[1]-(m[1]*pivot[0]+m[5]*pivot[1]+m[9]*pivot[2])+lift;
   m[14]=pivot[2]-(m[2]*pivot[0]+m[6]*pivot[1]+m[10]*pivot[2]);
  }
 }
 return {update,states};
};
