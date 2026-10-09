/* Original club-table craftsmanship. Static geometry is batched by the scene. */
(function(){
'use strict';
window.HoldEmTableDetails=function(api){
 let detailRig=null;const {object:emit,box,disk,ring,texture,panel,seatPoint,dealerSeat}=api;
 const object=(data,color,mat,tex)=>emit(data,color,mat,tex,detailRig);
 const TAU=Math.PI*2,walnut=[.17,.080,.043],endGrain=[.085,.040,.025],brass=[.56,.375,.16],darkMetal=[.036,.045,.045],ivory=[.80,.74,.59];
 function v(data,p,n,u=0,w=0){data.push(...p,...n,u,w)}
 function norm(a){const l=Math.hypot(...a)||1;return a.map(q=>q/l)}
 function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
 function triangle(data,a,b,c,n){v(data,a,n);v(data,b,n,1,0);v(data,c,n,1,1)}
 function quad(data,a,b,c,d,n){triangle(data,a,b,c,n);triangle(data,a,c,d,n)}
 function profile(cx,cz,levels,color,mat=3,count=96){
  const data=[];
  function p(level,a){return [cx+level[1]*Math.cos(a),level[0],cz+level[2]*Math.sin(a)]}
  function n(k,a){const lo=levels[Math.max(0,k-1)],hi=levels[Math.min(levels.length-1,k+1)],dy=hi[0]-lo[0],dx=hi[1]-lo[1],dz=hi[2]-lo[2],rx=levels[k][1],rz=levels[k][2];return norm([rz*Math.cos(a)*dy,-dx*rz*Math.cos(a)**2-dz*rx*Math.sin(a)**2,rx*Math.sin(a)*dy])}
  for(let j=0;j<levels.length-1;j++)for(let i=0;i<count;i++){
   const a=i*TAU/count,b=(i+1)*TAU/count;
   for(const [k,t]of[[j,a],[j,b],[j+1,b],[j,a],[j+1,b],[j+1,a]])v(data,p(levels[k],t),n(k,t),i/count,k/(levels.length-1));
  }
  object(data,color,mat);
 }
 function tube(points,r,color,mat=4,sides=10){
  const data=[];
  function section(k){const a=points[Math.max(0,k-1)],b=points[Math.min(points.length-1,k+1)],dir=norm(b.map((q,j)=>q-a[j])),guide=Math.abs(dir[1])>.96?[0,0,1]:[0,1,0],u=norm(cross(dir,guide)),w=cross(dir,u);return {u,w}}
  const frames=points.map((_,k)=>section(k));
  function vert(k,i){const a=i*TAU/sides,n=frames[k].u.map((q,j)=>q*Math.cos(a)+frames[k].w[j]*Math.sin(a));return [points[k].map((q,j)=>q+n[j]*r),n]}
  for(let k=0;k<points.length-1;k++)for(let i=0;i<sides;i++)for(const [j,m]of[[k,i],[k+1,i],[k+1,i+1],[k,i],[k+1,i+1],[k,i+1]]){const [p,n]=vert(j,m);v(data,p,n)}
  object(data,color,mat);
 }
 function localBox(seat,x,y,z,w,h,d,color,mat=0){
  const corners=[];for(const yy of [y-h/2,y+h/2])for(const zz of [z-d/2,z+d/2])for(const xx of [x-w/2,x+w/2])corners.push(seatPoint(seat,xx,zz,yy));
  const data=[],a=seat[2],nx=[Math.cos(a),0,-Math.sin(a)],nz=[Math.sin(a),0,Math.cos(a)];
  for(const [ids,n]of[[[4,5,7,6],[0,1,0]],[[0,2,3,1],[0,-1,0]],[[0,1,5,4],nz.map(q=>-q)],[[2,6,7,3],nz],[[1,3,7,5],nx],[[0,4,6,2],nx.map(q=>-q)]])quad(data,...ids.map(i=>corners[i]),n);
  object(data,color,mat);
 }

 // The rounded apron steps down into a slim veneer fascia, like a built table.
 profile(0,0,[[.555,1.62,.935],[.566,1.688,.984],[.585,1.728,1.030],[.609,1.758,1.060],[.666,1.787,1.087],[.697,1.820,1.119]],walnut,3);
 profile(0,0,[[.658,1.787,1.087],[.666,1.791,1.091],[.671,1.796,1.096]],brass,4);
 profile(0,0,[[.603,1.753,1.055],[.611,1.762,1.064]],[.37,.24,.10],4);
 profile(0,0,[[.582,1.724,1.026],[.592,1.739,1.041]],endGrain,3);
 // Fine bookmatched fascia seams and small marquetry diamonds on the sides.
 const veneer=[],inlay=[];
 for(let i=0;i<24;i++){
  const a=(i+.5)*TAU/24,da=.0015,n=norm([Math.cos(a)/1.77,-.48,Math.sin(a)/1.075]);
  function at(y,t){const f=(y-.609)/.057;return [(1.7595+f*.029)*Math.cos(t),y,(1.0615+f*.027)*Math.sin(t)]}
  quad(veneer,at(.618,a-da),at(.618,a+da),at(.653,a+da),at(.653,a-da),n);
  if(i%3===1)quad(inlay,at(.624,a),at(.639,a+.011),at(.654,a),at(.639,a-.011),n);
 }
 object(veneer,[.075,.038,.024],3);object(inlay,[.45,.285,.11],4);

 // Two carved pedestal assemblies leave generous knee space around the table.
 for(const x of [-.91,.91]){
  profile(x,0,[[.027,.43,.36],[.038,.45,.37],[.074,.445,.365],[.095,.39,.31]],endGrain,3,56);
  profile(x,0,[[.043,.452,.372],[.052,.453,.373]],brass,4,56);
  profile(x,0,[[.095,.285,.24],[.15,.23,.21],[.24,.145,.157],[.41,.113,.124],[.50,.17,.175],[.559,.315,.26],[.581,.35,.283]],walnut,3,56);
  profile(x,0,[[.13,.246,.223],[.141,.242,.219]],brass,4,56);
  profile(x,0,[[.492,.166,.172],[.505,.18,.183]],brass,4,56);
  // A narrow brass spine makes the curve readable in the shaded base.
  for(const s of [-1,1])tube([[x+s*.19,.156,.159],[x+s*.12,.26,.138],[x+s*.10,.39,.111],[x+s*.155,.49,.15]],.008,[.35,.24,.115],4,8);
  disk(x,.096,0,.386,.306,[.10,.052,.031],3);
 }
 box(0,.165,0,1.82,.077,.091,endGrain,3);
 box(0,.201,.048,1.48,.012,.010,brass,4);
 box(0,.128,.048,1.48,.009,.010,[.26,.17,.08],4);

 // Recess-like cup wells sit flush with the crest of the padded rail.
 for(const a of [.43,Math.PI-.43,Math.PI+.5,TAU-.5]){
  const x=Math.cos(a)*1.766,z=Math.sin(a)*1.086;
  disk(x,.865,z,.080,.080,[.009,.011,.010]);
  profile(x,z,[[.865,.057,.057],[.867,.066,.066],[.875,.076,.076],[.876,.084,.084],[.872,.090,.090]],darkMetal,4,48);
  ring(x,.874,z,.087,.087,.0025,.0025,brass,4,48);
  ring(x,.866,z,.057,.057,.001,.0007,[.13,.15,.14],4,32);
  // Single reflected streak; subtle enough not to read as a disk on the rail.
  const glint=[];for(let j=0;j<10;j++){const b=3.5+j*.06,c=b+.06;quad(glint,[x+.072*Math.cos(b),.870,z+.072*Math.sin(b)],[x+.073*Math.cos(b),.871,z+.073*Math.sin(b)],[x+.073*Math.cos(c),.871,z+.073*Math.sin(c)],[x+.072*Math.cos(c),.870,z+.072*Math.sin(c)],[0,1,0])}object(glint,[.32,.30,.23],4);
 }

 // A few tiny diamond inlays, intentionally kept clear of hands and cups.
 const topInlays=[];
 for(const a of [0,Math.PI,.5*Math.PI,1.5*Math.PI]){
  const x=Math.cos(a)*1.787,z=Math.sin(a)*1.098,tx=-Math.sin(a)*.019,tz=Math.cos(a)*.019,rx=Math.cos(a)*.010,rz=Math.sin(a)*.010;
  quad(topInlays,[x+rx,.862,z+rz],[x+tx,.862,z+tz],[x-rx,.862,z-rz],[x-tx,.862,z-tz],[0,1,0]);
 }
 object(topInlays,[.55,.41,.22],4);

 // Five quiet card places leave the community-card area visually organized.
 const guide=texture((c,w,h)=>{
  c.strokeStyle='#426650';c.lineWidth=2;c.setLineDash([8,7]);
  c.beginPath();c.roundRect(8,8,w-16,h-16,14);c.stroke();c.setLineDash([]);
  c.fillStyle='#305640';c.font='30px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText('♠',w/2,h/2);
 },128,192);
 for(let i=0;i<5;i++){const x=(i-2)*.183;panel([[x-.071,.7603,-.113],[x+.071,.7603,-.113],[x+.071,.7603,-.318],[x-.071,.7603,-.318]],[0,1,0],guide,[.65,.69,.52],{part:'poker-only'})}

 // A dealer's bank: a low, fitted tray with channels and individual edge spots.
 const trayX=-.34,trayZ=.68,tw=.43,td=.175;
 localBox(dealerSeat,trayX,.779,trayZ,tw,.030,td,endGrain,3);
 localBox(dealerSeat,trayX,.796,trayZ,tw-.02,.009,td-.016,[.022,.028,.025],2);
 for(const sign of [-1,1]){
  localBox(dealerSeat,trayX+sign*(tw/2-.004),.801,trayZ,.008,.022,td,brass,4);
  localBox(dealerSeat,trayX,.801,trayZ+sign*(td/2-.004),tw,.022,.008,brass,4);
 }
 const bankColors=[[.60,.54,.39],[.35,.06,.055],[.025,.17,.115],[.06,.12,.21],[.10,.08,.13]];
 // Narrow cylinders lie on their side in each tray channel, tilted toward dealer.
 const spots=[];
 for(let lane=0;lane<5;lane++){
  const xx=trayX+(lane-2)*.079;
  localBox(dealerSeat,xx-.039,.803,trayZ,.004,.015,td-.022,[.065,.069,.054],4);
  const stack=[];
  for(let chip=0;chip<8;chip++){
   const zz=trayZ-.059+chip*.016,cy=.806,r=.031,depth=.009;
   for(let j=0;j<20;j++){
    const a=j*TAU/20,b=(j+1)*TAU/20;
    const pp=(t,z,rad=r)=>seatPoint(dealerSeat,xx+Math.cos(t)*rad,z,cy+Math.sin(t)*rad);
    const n=norm([Math.cos(a)*Math.cos(dealerSeat[2]),Math.sin(a),-Math.cos(a)*Math.sin(dealerSeat[2])]);
    quad(stack,pp(a,zz),pp(b,zz),pp(b,zz+depth),pp(a,zz+depth),n);
    if(j%5===1)quad(spots,pp(a,zz+.002,r+.00035),pp(b,zz+.002,r+.00035),pp(b,zz+depth-.001,r+.00035),pp(a,zz+depth-.001,r+.00035),n);
    if(chip===0||chip===7){const faceSign=chip===0?-1:1,zFace=chip===0?zz-.0001:zz+depth+.0001,p=seatPoint(dealerSeat,xx,zFace,cy),normal=[Math.sin(dealerSeat[2])*faceSign,0,Math.cos(dealerSeat[2])*faceSign];triangle(stack,p,pp(a,zFace),pp(b,zFace),normal)}
   }
  }
  object(stack,bankColors[lane],2);
 }
 object(spots,ivory);

 // The button is a real beveled counter with an engraved two-line face.
 const buttonX=.93,buttonZ=-.56;detailRig={part:'dealer-button'};
 profile(buttonX,buttonZ,[[.761,.052,.052],[.763,.061,.061],[.773,.061,.061],[.777,.056,.056]],ivory,2,48);
 const buttonArt=texture((c,w,h)=>{
  c.fillStyle='#e7ddbb';c.beginPath();c.arc(w/2,h/2,w*.495,0,TAU);c.fill();
  c.strokeStyle='#7d744f';c.lineWidth=4;c.beginPath();c.arc(w/2,h/2,w*.425,0,TAU);c.stroke();c.lineWidth=1.5;c.beginPath();c.arc(w/2,h/2,w*.37,0,TAU);c.stroke();
  c.textAlign='center';c.fillStyle='#354739';c.font='bold 33px Georgia';c.fillText('DEALER',w/2,h*.52);c.font='17px Georgia';c.fillText('HOLD EM',w/2,h*.66);
 },256,256);
 panel([[buttonX-.057,.778,buttonZ+.057],[buttonX+.057,.778,buttonZ+.057],[buttonX+.057,.778,buttonZ-.057],[buttonX-.057,.778,buttonZ-.057]],[0,1,0],buttonArt,[1,1,1],{part:'dealer-button'});
 return {guide,buttonArt};
};
})();
