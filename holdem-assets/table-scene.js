/* Seated table study. Batched geometry with lightweight character transforms. */
(function(){
'use strict';
if(!document.body.classList.contains('tableDesign'))return;
const host=document.querySelector('.table-wrap'),canvas=document.createElement('canvas');
canvas.className='table-scene';canvas.setAttribute('aria-label','Hold Em table with four players including you and one dealer');host.appendChild(canvas);
const gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'low-power'});
if(!gl){window.HoldEmLobby?.failed();return}
const vs=`attribute vec3 p,n;attribute vec2 uv;uniform mat4 vp,pose,forePose,lightVP;uniform vec3 armElbow,armAxis;uniform float articulated;uniform vec2 blink;varying vec3 pos,norm;varying vec2 tex;varying vec4 shadowPos;void main(){vec3 q=p;q.y=mix(q.y,blink.x,blink.y);float weight=articulated*smoothstep(-.024,.024,dot(q-armElbow,armAxis));vec4 world=mix(pose*vec4(q,1.),forePose*vec4(q,1.),weight);pos=world.xyz;norm=mix(mat3(pose)*n,mat3(forePose)*n,weight);tex=uv;shadowPos=lightVP*world;gl_Position=vp*world;}`;
const fs=`precision highp float;varying vec3 pos,norm;varying vec2 tex;varying vec4 shadowPos;uniform vec3 color,eye;uniform float mat,portrait,shadowEnabled,sceneTime;uniform sampler2D image,shadowMap;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float oval(vec2 p,vec2 center,vec2 size){vec2 d=(p-center)/size;return exp(-dot(d,d)*2.);}
float depth(vec2 uv){return dot(texture2D(shadowMap,uv),vec4(1./16777216.,1./65536.,1./256.,1.));}
float visibility(){if(shadowEnabled<.5)return 1.;vec3 s=shadowPos.xyz/shadowPos.w*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;float bias=.0013;vec2 d=vec2(1.7/1024.);float v=step(s.z-bias,depth(s.xy+vec2(-d.x,-d.y)))+step(s.z-bias,depth(s.xy+vec2(d.x,-d.y)))+step(s.z-bias,depth(s.xy+vec2(-d.x,d.y)))+step(s.z-bias,depth(s.xy+d));return mix(.28,1.,v*.25);}
vec3 cosmos(vec3 p){vec3 q=p*.65+vec3(sceneTime*.006,0.,sceneTime*.003);float mist=noise(q*.65)*noise(q*1.8);vec3 space=vec3(.006,.012,.032)+vec3(.085,.035,.14)*pow(mist,2.)+vec3(.018,.055,.10)*noise(q*.4);vec3 cell=floor(q*8.),f=fract(q*8.)-.5;float star=step(.975,hash(cell))*exp(-dot(f,f)*420.)*(.7+.3*sin(sceneTime*.7+hash(cell)*40.));return space+vec3(.7,.84,1.)*star;}
void main(){
 if(mat==13.){gl_FragColor=vec4(pow(cosmos(pos),vec3(1./2.2)),1.);return;}
 vec3 N=normalize(norm),V=normalize(eye-pos),base=color;float rough=.58,ao=1.,metal=0.;
 float shadow=visibility();
 float distanceToEye=length(eye-pos),detail=1.-smoothstep(1.2,6.,distanceToEye);
 if(mat==1.){float weave=sin(pos.x*920.)*sin(pos.z*920.);base*=.98+weave*.015*detail+noise(pos*80.)*.025;rough=.96;float edge=length(pos.xz/vec2(1.69,1.0));ao*=1.-smoothstep(.79,1.01,edge)*.20;}
 if(mat==2.){base*=.94+noise(pos*140.)*.10;rough=.40;}
 if(mat==3.){float wood=sin(pos.x*38.+noise(pos*4.)*8.);base*=.88+.12*wood;rough=.37;}
 if(mat==4.){rough=.24;metal=.75;}
 if(mat==5.){vec4 t=texture2D(image,tex);if(t.a<.10)discard;base*=t.rgb;rough=.63;}
 if(mat==7.)rough=.52;
 if(mat==9.){base*=.976+.024*noise(pos*160.);rough=.87;}
 if(mat==10.){rough=.42;base*=.94+.06*noise(pos*50.);}
 if(mat==11.)rough=.16;
 if(mat==12.){
  // An endless matte floor: subtle light under the cast, black beyond the stage.
  float pool=exp(-dot(pos.xz/vec2(3.7,2.8),pos.xz/vec2(3.7,2.8)));
  float shadows=oval(pos.xz,vec2(0,0),vec2(1.7,1.0))*.76;
  if(portrait<.5){shadows+=oval(pos.xz,vec2(-2.02,.08),vec2(.48,.50))*.46;shadows+=oval(pos.xz,vec2(2.02,.08),vec2(.48,.50))*.46;shadows+=oval(pos.xz,vec2(.50,-1.5),vec2(.45,.52))*.46;shadows+=oval(pos.xz,vec2(-.90,-1.35),vec2(.31,.36))*.35;}
  else{pool=exp(-dot(pos.xz/vec2(2.5,2.5),pos.xz/vec2(2.5,2.5)));shadows=oval(pos.xz,vec2(0,.07),vec2(.44,.43))*.60;}
  vec3 floorLight=mix(cosmos(vec3(pos.x*3.,-4.,pos.z*3.)),vec3(.10,.15,.18),.24*pool)*(1.-clamp(shadows,0.,.85))*(.55+.45*shadow);
  float horizon=smoothstep(6.,18.,length(pos.xz));gl_FragColor=vec4(pow(mix(floorLight,vec3(.026,.037,.051),horizon),vec3(1./2.2)),1.);return;
 }
 vec3 L=normalize(vec3(-2.2,4.1,1.8)-pos),F=normalize(vec3(2.5,2.8,2.3)-pos),Rim=normalize(vec3(.5,3.2,-3.)-pos);
 float nl=max(dot(N,L),0.),nf=max(dot(N,F),0.),nr=max(dot(N,Rim),0.);
 if(mat==7.)nl=max((dot(N,L)+.20)/1.20,0.);
 vec3 albedo=pow(max(base,vec3(0.)),vec3(2.2));
 vec3 hemisphere=mix(vec3(.24,.27,.34),vec3(.40,.44,.49),N.y*.5+.5);
 vec3 diffuse=hemisphere+nl*vec3(1.08,.91,.75)*shadow+nf*vec3(.40,.52,.62)+nr*vec3(.28,.32,.40);
 float exponent=mix(160.,9.,rough),strength=(1.-rough)*.32;
 float spec=pow(max(dot(N,normalize(L+V)),0.),exponent)*strength;
 float rimSpec=pow(max(dot(N,normalize(Rim+V)),0.),exponent)*strength*.6;
 vec3 lit=albedo*diffuse*ao+mix(vec3(1.,.91,.77),base,metal)*(spec*shadow+rimSpec);
 float fresnel=pow(1.-max(dot(N,V),0.),4.);
 lit+=mix(vec3(.06,.08,.10),albedo,metal)*fresnel*(1.-rough)*.35;
 if(mat==7.)lit+=albedo*vec3(.09,.027,.014)*pow(1.-nl,2.);
 if(mat==9.)lit+=albedo*fresnel*.08;
 if(mat==6.)lit=albedo*1.6;
 // Gentle highlight compression preserves saturated outfits and ivory card stock.
 lit=lit/(vec3(1.)+lit*.30);
 vec3 display=pow(max(lit,vec3(0.)),vec3(1./2.2));
 float fog=smoothstep(5.,16.,distanceToEye);display=mix(display,vec3(.026,.037,.051),fog*.8);
 gl_FragColor=vec4(display,1.);
}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(.026,.037,.051,1);
const loc={};for(const k of ['vp','forePose','armElbow','armAxis','articulated','color','eye','mat','image','pose','blink','portrait','lightVP','shadowMap','shadowEnabled','sceneTime'])loc[k]=gl.getUniformLocation(program,k);
const attrs=['p','n','uv'].map(k=>gl.getAttribLocation(program,k));const objects=[];
let buildTarget=objects;
function object(data,color,mat=0,texture=null,rig=null){buildTarget.push({data,color,mat,texture,rig})}
function uploadGeometry(list){
 const batches=new Map(),merged=[];
 for(const o of list){if(o.texture||o.rig){merged.push(o);continue}const key=o.color.join(',')+':'+o.mat;let batch=batches.get(key);if(!batch){batch={...o,data:[]};batches.set(key,batch);merged.push(batch)}for(let i=0;i<o.data.length;i++)batch.data.push(o.data[i])}
 list.length=0;for(const o of merged){o.b=gl.createBuffer();o.count=o.data.length/8;gl.bindBuffer(gl.ARRAY_BUFFER,o.b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(o.data),gl.STATIC_DRAW);delete o.data;list.push(o)}
}
function vertex(d,p,n,u=0,v=0){d.push(...p,...n,u,v)}
function tri(d,a,b,c,n){vertex(d,a,n,0,0);vertex(d,b,n,1,0);vertex(d,c,n,1,1)}
function quad(d,a,b,c,e,n){tri(d,a,b,c,n);tri(d,a,c,e,n)}
function box(x,y,z,w,h,depth,col,mat=0){const d=[],a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-depth/2,g=z+depth/2;quad(d,[a,e,g],[b,e,g],[b,e,f],[a,e,f],[0,1,0]);quad(d,[a,c,f],[b,c,f],[b,c,g],[a,c,g],[0,-1,0]);quad(d,[a,c,g],[b,c,g],[b,e,g],[a,e,g],[0,0,1]);quad(d,[b,c,f],[a,c,f],[a,e,f],[b,e,f],[0,0,-1]);quad(d,[b,c,g],[b,c,f],[b,e,f],[b,e,g],[1,0,0]);quad(d,[a,c,f],[a,c,g],[a,e,g],[a,e,f],[-1,0,0]);object(d,col,mat)}
function disk(x,y,z,rx,rz,col,mat=0){let d=[];for(let i=0;i<128;i++){let a=i*Math.PI/64,b=(i+1)*Math.PI/64;tri(d,[x,y,z],[x+rx*Math.cos(a),y,z+rz*Math.sin(a)],[x+rx*Math.cos(b),y,z+rz*Math.sin(b)],[0,1,0])}object(d,col,mat)}
function ring(x,y,z,rx,rz,tube,thick,col,mat=0,segments=128,sides=12){let d=[];function point(a,b){return [x+(rx+tube*Math.cos(b))*Math.cos(a),y+thick*Math.sin(b),z+(rz+tube*Math.cos(b))*Math.sin(a)]}function norm(a,b){const c=Math.cos(b),sa=Math.sin(a),ca=Math.cos(a);return normalize([thick*(rz+tube*c)*c*ca,tube*Math.sin(b)*((rx+tube*c)*sa*sa+(rz+tube*c)*ca*ca),thick*(rx+tube*c)*c*sa])}for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){let a=i*2*Math.PI/segments,A=(i+1)*2*Math.PI/segments,b=j*2*Math.PI/sides,B=(j+1)*2*Math.PI/sides;for(let [u,v]of[[a,b],[A,b],[A,B],[a,b],[A,B],[a,B]])vertex(d,point(u,v),norm(u,v))}object(d,col,mat)}
function cylinder(x,y,z,r,h,col,mat=0){let d=[];for(let i=0;i<32;i++){let a=i*Math.PI/16,b=(i+1)*Math.PI/16;quad(d,[x+r*Math.cos(a),y,z+r*Math.sin(a)],[x+r*Math.cos(b),y,z+r*Math.sin(b)],[x+r*Math.cos(b),y+h,z+r*Math.sin(b)],[x+r*Math.cos(a),y+h,z+r*Math.sin(a)],[Math.cos((a+b)/2),0,Math.sin((a+b)/2)])}object(d,col,mat);disk(x,y+h,z,r,r,col,mat)}
const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic')||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
function texture(draw,w=1024,h=512){let c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);const mip=(w&(w-1))===0&&(h&(h-1))===0;if(mip)gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);if(anisotropy&&mip)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));return t}
function panel(points,normal,t,col=[1,1,1],rig=null){let d=[];for(let i of [0,1,2,0,2,3])vertex(d,points[i],normal,...[[0,1],[1,1],[1,0],[0,0]][i]);object(d,col,5,t,rig)}
const brass=[.49,.32,.13],wood=[.11,.057,.035],leather=[.043,.033,.027];
const seats=window.HoldEmSeating.seats;
const dealerSeat=[-.90,-1.35,Math.atan2(.90,1.35)];
function seatPoint(seat,x,z,y=.766){const [sx,sz,a]=seat;return [sx+x*Math.cos(a)+z*Math.sin(a),y,sz-x*Math.sin(a)+z*Math.cos(a)]}
// Floating smoked-glass platform: the star field is visible beneath the seats.
disk(0,.026,0,2.92,2.12,[.04,.06,.08],12);
ring(0,.018,0,2.92,2.12,.025,.027,[.055,.12,.20],4);
ring(0,.05,0,2.89,2.09,.004,.004,[.20,.48,.72],6);
const sky=[];for(const [a,b,c,d,n] of [
[[-19,-10,19],[19,-10,19],[19,-10,-19],[-19,-10,-19],[0,1,0]],
[[-19,-10,-19],[19,-10,-19],[19,14,-19],[-19,14,-19],[0,0,1]],
[[19,-10,19],[-19,-10,19],[-19,14,19],[19,14,19],[0,0,-1]],
[[-19,-10,19],[-19,-10,-19],[-19,14,-19],[-19,14,19],[1,0,0]],
[[19,-10,-19],[19,-10,19],[19,14,19],[19,14,-19],[-1,0,0]],
[[-19,14,-19],[19,14,-19],[19,14,19],[-19,14,19],[0,-1,0]]])quad(sky,a,b,c,d,n);object(sky,[.015,.025,.08],13);
// Table. All edges are elliptical, including the rolled padded armrest.
disk(0,.695,0,1.84,1.13,wood,3);


disk(0,.758,0,1.69,1.0,[.034,.19,.139],1);
ring(0,.763,0,1.655,.966,.012,.008,brass,4);
ring(0,.779,0,1.79,1.1,.119,.082,leather,2);
ring(0,.814,0,1.868,1.178,.004,.003,[.23,.163,.095],4);
ring(0,.813,0,1.716,1.026,.003,.002,[.24,.17,.09]);
// Individual saddle stitches follow the cushion instead of a flat outline.
for(let i=0;i<260;i++){let a=i*Math.PI*2/260,b=a+.009;const d=[];quad(d,[1.721*Math.cos(a),.83,1.039*Math.sin(a)],[1.726*Math.cos(a),.83,1.044*Math.sin(a)],[1.726*Math.cos(b),.83,1.044*Math.sin(b)],[1.721*Math.cos(b),.83,1.039*Math.sin(b)],[0,1,0]);object(d,[.46,.34,.20])}
// An understated betting line woven into the felt.
ring(0,.7595,-.02,1.18,.59,.002,.0008,[.32,.35,.20],1);
const mark=texture((c,w,h)=>{c.fillStyle='#b3a36e';c.textAlign='center';c.font='82px Georgia';c.fillText('♠',w/2,130);c.font='bold 83px Georgia';c.fillText('H O L D  E M',w/2,260);c.font='24px sans-serif';c.fillText('T H E   G A M E   R O O M',w/2,322)});
panel([[-.51,.7605,.53],[.51,.7605,.53],[.51,.7605,.07],[-.51,.7605,.07]],[0,1,0],mark,[.65,.64,.5],{part:'poker-only'});
// A deck and a few neatly stacked chips are table props, not active players.
const deckPosition=seatPoint(dealerSeat,.31,.43,.81);box(deckPosition[0],deckPosition[1]-.025,deckPosition[2],.14,.047,.2,[.69,.66,.54]);const deck=texture((c,w,h)=>window.HoldEmCardBack(c,w,h),512,1024);
panel([[-.07,.10],[.07,.10],[.07,-.10],[-.07,-.10]].map(([x,z])=>[deckPosition[0]+x,deckPosition[1],deckPosition[2]+z]),[0,1,0],deck);
const chipTypes=[{value:25,color:[.40,.055,.065],ink:'#a0313b'},{value:100,color:[.04,.065,.085],ink:'#234050'},{value:500,color:[.045,.23,.15],ink:'#277257'}];
for(const c of chipTypes)c.texture=texture((ctx,w,h)=>window.HoldEmChipArt(ctx,w,h,c.value,c.ink),256,256);
function chipStack(x,z,count,type){const radius=.052,top=.768+count*.012;cylinder(x,.766,z,radius,count*.012,type.color,2);for(let i=0;i<count;i++){const y=.767+i*.012;ring(x,y,z,radius,radius,.0014,.0013,[.18,.16,.12],0,40,4);for(let j=0;j<6;j++){const a=j*Math.PI/3;box(x+Math.cos(a)*.049,y+.005,z+Math.sin(a)*.049,.009,.009,.009,[.79,.73,.57])}}panel([[x-radius,top,z+radius],[x+radius,top,z+radius],[x+radius,top,z-radius],[x-radius,top,z-radius]],[0,1,0],type.texture)}
const dealerLabel=texture((c,w,h)=>{c.fillStyle='#17392e';c.fillRect(0,0,w,h);c.strokeStyle='#b59a60';c.lineWidth=14;c.strokeRect(9,9,w-18,h-18);c.textAlign='center';c.fillStyle='#ecdbad';c.font='bold 70px Georgia';c.fillText('DEALER',w/2,h/2+25)},512,128);
panel([[-.18,.56],[.18,.56],[.18,.66],[-.18,.66]].map(([x,z])=>seatPoint(dealerSeat,x,z)),[0,1,0],dealerLabel);
// Sample hole cards for the table study: real surfaces at the player's seat.
function holeCard(rank,suit,x,angle,z){
 const t=texture((c,w,h)=>window.HoldEmCardArt(c,w,h,rank,suit),512,1024);
 const points=[[-.11,-.16],[.11,-.16],[.11,.16],[-.11,.16]].map(([u,v])=>[x+u*Math.cos(angle)-v*Math.sin(angle),.997+u*Math.sin(angle)+v*Math.cos(angle),z-v*.24]);
 panel(points,[-.24*Math.sin(angle),.24*Math.cos(angle),1],t);
}
window.HoldEmTableDetails({object,box,disk,ring,cylinder,texture,panel,seatPoint,seats,dealerSeat});
const propCenters=window.HoldEmProps.build(object);
let characterSet=null,portraitSet=null,characterMotion=null,portraitMotion=null,previewMode=false,lobbyMode=false,entry=null,lastCastKey='',lastPortraitKey='',chosenSeat=2,tableConfig=null,botLooks=HoldEmSeating.botLooks(HoldEmWardrobe);
const castObjects=[],portraitObjects=[],restPose=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const chipObjects=[],cardObjects=[],flightObjects=[],propMotion=HoldEmProps.create(),chipLedger=HoldEmChips.create(),cardTextures=new Map(),forcedHeads=new Map();let cardsDown=false,cardsLowerAmount=0;let tableSnapshot=window.TablePoker.snapshot,chipRevision=-1,lastVP=null,hoverTimer=null,hoverSeat=-1,flightIds='',lastLookSent=0;
const propTip=document.createElement('div');propTip.className='prop-tip';propTip.hidden=true;document.body.appendChild(propTip);
function actorSeat(rig){return rig?.seat??characterSet?.actors.find(a=>a.id===rig?.actor)?.characterIndex}
function armPose(o){const seat=actorSeat(o.rig);if(Number.isInteger(seat)&&HoldEmStage.has(seat))return null;const dealing=HoldEmDealer.arm(o.rig),prop=propMotion.arm(o.rig);if(dealing||prop)return dealing||prop;if(o.rig?.part==='arm'&&seat===chosenSeat&&cardsLowerAmount>.001){const lower=seatPoint(seats[seat],o.rig.side*.17,.44,.80),target=o.rig.hand.map((v,i)=>v+(lower[i]-v)*cardsLowerAmount);return HoldEmProps.armTo(o.rig,target)}return HoldEmPersonality.arm(o.rig)}
function resolvePose(o){
 if(!propMotion.visible(o.rig))return false;
 const mouth=HoldEmDealer.mouth(o.rig);if(mouth)return multiply(characterMotion?.states.get(o.rig.actor)?.pose||restPose,mouth);
 const seat=actorSeat(o.rig),fallen=Number.isInteger(seat)&&HoldEmStage.has(seat);
 if(fallen&&o.rig?.part!=='chair'&&HoldEmStage.gone(seat))return false;
 if(fallen&&['body','arm','head','eyes','chair'].includes(o.rig?.part))return HoldEmStage.pose(seat,o.rig.part==='chair');
 const bodyPose=HoldEmPersonality.body(o.rig);if(bodyPose)return bodyPose;
 if(o.rig?.part==='house-card'){const pose=HoldEmDealer.card(o.rig);return pose===null?restPose:pose}
 if(o.rig?.part==='hole-card'){
  if(fallen)return false;const dealing=HoldEmDealer.card(o.rig);if(dealing!==null)return dealing;
  if(tableSnapshot.gameType!=='blackjack'&&o.rig.seat===chosenSeat&&cardsLowerAmount>.001){const p=seatPoint(seats[chosenSeat],(o.rig.index-(tableSnapshot.players[chosenSeat].hole.length-1)/2)*.13,.44,.776+o.rig.index*.0005);return HoldEmProps.transform(o.rig.center,o.rig.center.map((v,i)=>v+(p[i]-v)*cardsLowerAmount),o.rig.normal,o.rig.normal.map((v,i)=>v+([0,1,0][i]-v)*cardsLowerAmount));}return restPose;
 }
 if(o.rig?.part==='poker-only'&&tableSnapshot.gameType==='blackjack')return false;
 if(o.rig?.part==='dealer-button'){if(tableSnapshot.gameType==='blackjack')return false;const seat=Math.max(0,tableSnapshot.dealer),p=seatPoint(seats[seat],-.16,.72);const m=restPose.slice();m[12]=p[0]-.93;m[14]=p[2]+.56;return m}
 if(o.rig?.part==='flight'){const flight=chipLedger.flights.find(f=>f.id===o.rig.id);if(!flight)return restPose;const t=chipLedger.progress(flight),ease=t*t*(3-2*t),from=chipPoint(flight.from,flight.id),to=chipLanding(flight),dest=from.map((v,i)=>v+(to[i]-v)*ease+(i===1?Math.sin(t*Math.PI)*.20:0)),m=restPose.slice();m[12]=dest[0];m[13]=dest[1];m[14]=dest[2];return m}
 return armPose(o)?.upper||propMotion.pose(o.rig);
}
function clearMeshes(list){for(const o of list)gl.deleteBuffer(o.b);list.length=0}
function cardTexture(card){if(!card)return deck;const key=card.r+'_'+card.s;if(!cardTextures.has(key))cardTextures.set(key,texture((c,w,h)=>HoldEmCardArt(c,w,h,card.r<11?String(card.r):({11:'J',12:'Q',13:'K',14:'A'})[card.r],['♣','♦','♥','♠'][card.s]),512,1024));return cardTextures.get(key)}
const blackjackLayout=texture((c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#d5bd82';c.textAlign='center';c.font='bold 64px Georgia';c.fillText('BLACKJACK PAYS 3 : 2',w/2,h*.36);c.font='27px Georgia';c.fillText('DEALER STANDS ON ALL 17s',w/2,h*.65)},1024,256);
 const blackjackSpot=texture((c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#d5bd82';c.lineWidth=5;c.beginPath();c.ellipse(w/2,h/2,w*.43,h*.43,0,0,Math.PI*2);c.stroke();c.fillStyle='#d5bd82';c.textAlign='center';c.font='26px Georgia';c.fillText('WAGER',w/2,h*.86)},256,256);
 function rebuildCards(s){
 const signature=JSON.stringify([chosenSeat,s?.gameType,s?.dealerHand,s?.players.map(p=>p.hands),s?.hand,s?.phase,s?.board,s?.players.map(p=>[p.hole,p.folded,p.inHand])]);if(rebuildCards.key===signature)return;rebuildCards.key=signature;clearMeshes(cardObjects);const previous=buildTarget;buildTarget=cardObjects;
 const own=s?.players[chosenSeat]?.hole||[];
 if(s?.gameType==='blackjack'){const label=blackjackLayout;panel([[-.55,.770,.08],[.55,.770,.08],[.55,.770,-.17],[-.55,.770,-.17]],[0,1,0],label,[1,1,1]);for(let seat=0;seat<4;seat++){const points=[[-.19,0],[.19,0],[.19,.29],[-.19,.29]].map(([u,v])=>seatPoint(seats[seat],u,.47+v,.769));panel(points,[0,1,0],blackjackSpot,[1,1,1])}}
 function dealtPanel(points,normal,texture,seat,index){const center=[0,1,2].map(k=>points.reduce((n,p)=>n+p[k],0)/4);panel(points,normal,texture,[1,1,1],{part:'hole-card',seat,index,center,normal})}
 if(s?.gameType!=='blackjack'&&own.length&&!s?.players[chosenSeat]?.folded)for(let i=0;i<own.length;i++){const hands=s?.players[chosenSeat]?.hands||[],firstCount=hands[0]?.cards.length||own.length,group=hands.length>1?(i<firstCount?0:1):-1,local=group===1?i-firstCount:i,count=group<0?own.length:hands[group].cards.length,offset=local-(count-1)/2,spread=Math.min(.17,.40/Math.max(1,count-1)),angle=offset*.10,x=offset*spread+(group<0?0:group===0?-.22:.22),z=1.30+local*.004,points=[[-.11,-.16],[.11,-.16],[.11,.16],[-.11,.16]].map(([u,v])=>HoldEmSeating.fromDefault([x+u*Math.cos(angle)-v*Math.sin(angle),.997+u*Math.sin(angle)+v*Math.cos(angle),z-v*.24],seats[chosenSeat]));dealtPanel(points,HoldEmSeating.direction(seats[chosenSeat],[-.24*Math.sin(angle),.24*Math.cos(angle),1]),cardTexture(own[i]),chosenSeat,i)}
 if(s?.gameType==='blackjack')for(let seat=0;seat<4;seat++){const p=s.players[seat];if(!p?.inHand)continue;let idx=0;for(let group=0;group<(p.hands||[]).length;group++){const h=p.hands[group];for(let j=0;j<h.cards.length;j++,idx++){const split=p.hands.length>1,x=(split?(group===0?-.23:.23):0)+(j-(h.cards.length-1)/2)*Math.min(.12,.34/Math.max(1,h.cards.length-1)),points=[[-.08,-.115],[.08,-.115],[.08,.115],[-.08,.115]].map(([u,v])=>seatPoint(seats[seat],x+u,.39+v,.778+j*.001));dealtPanel(points,[0,1,0],cardTexture(h.cards[j]),seat,idx)}}}
 for(let seat=0;seat<4;seat++)if(s?.gameType!=='blackjack'&&seat!==chosenSeat&&(s?.players[seat]?.inHand&&!s?.players[seat]?.folded))for(let index=0;index<(s?.gameType==='blackjack'?s.players[seat].hole.length:2);index++){const side=index-(s?.gameType==='blackjack'?s.players[seat].hole.length-1:1)/2,c=s?.gameType==='blackjack'||s?.phase==='complete'&&s.showdown?s.players[seat].hole[index]:null,points=[[-.061,0],[.061,0],[.061,.181],[-.061,.181]].map(([u,v])=>seatPoint(seats[seat],side*.13+u,.495-v*.20,.844+v)),n=[Math.sin(seats[seat][2]),.20,Math.cos(seats[seat][2])];dealtPanel(points,n,cardTexture(c),seat,index)}
 const centerCards=s?.gameType==='blackjack'?s.dealerHand||[]:s?.board||[];
 for(let i=0;i<centerCards.length;i++){const x=-.18+i*.19,z=s?.gameType==='blackjack'?-.47:-.11,points=[[x-.08,.780,z+.115],[x+.08,.780,z+.115],[x+.08,.780,z-.115],[x-.08,.780,z-.115]],rig=s?.gameType==='blackjack'?{part:'house-card',index:i,center:[x,.780,z],normal:[0,1,0],face:true}:null;panel(points,[0,1,0],centerCards[i]?cardTexture(centerCards[i]):deck,[1,1,1],rig);if(rig&&i===1&&centerCards[i])panel(points,[0,1,0],deck,[1,1,1],{...rig,face:false})}
 buildTarget=previous;uploadGeometry(cardObjects);shadowDirty=true;
}
const chipColors={500:[.045,.23,.15],100:[.04,.065,.085],25:[.40,.055,.065],10:[.14,.31,.51],5:[.52,.19,.07],1:[.76,.69,.53]},chipTextures=new Map(chipTypes.map(c=>[c.value,c.texture]));
for(const value of[10,5,1])chipTextures.set(value,texture((c,w,h)=>HoldEmChipArt(c,w,h,value,{10:'#326fa3',5:'#a15d24',1:'#d1bd94'}[value]),256,256));
function chipPoint(seat,index=0){return seat==='pot'?[(tableSnapshot.gameType==='blackjack'?-.68:-.18)+(index%(tableSnapshot.gameType==='blackjack'?2:5))*.09,.78,(tableSnapshot.gameType==='blackjack'?-.13:-.38)+(Math.floor(index/(tableSnapshot.gameType==='blackjack'?2:5))%3)*.08]:seatPoint(seats[seat],(tableSnapshot.gameType==='blackjack'?.46:.25)+(index%3)*.10,.71+Math.floor(index%6/3)*.10)}
function chipLanding(flight){const expected=flight.to==='pot'?(tableSnapshot.pot||tableSnapshot.awardedPot):tableSnapshot.players[flight.to].stack,values=HoldEmChips.chips(expected);let slot=0;for(const value of HoldEmChips.denominations){const count=values.filter(v=>v===value).length;if(value===flight.value){const p=chipPoint(flight.to,slot+Math.floor(Math.max(0,count-1)/15));p[1]=.77+(count?Math.min(15,count):1)*.011;return p}slot+=Math.ceil(count/15)}return chipPoint(flight.to,0)}
function stackMesh(x,z,count,value){const radius=.047,top=.767+count*.011;cylinder(x,.766,z,radius,count*.011,chipColors[value],2);for(let i=0;i<count;i++){ring(x,.768+i*.011,z,radius,radius,.001,.001,[.68,.59,.42],0,24,4)}panel([[x-radius,top,z+radius],[x+radius,top,z+radius],[x+radius,top,z-radius],[x-radius,top,z-radius]],[0,1,0],chipTextures.get(value))}
function rebuildChips(){clearMeshes(chipObjects);const old=buildTarget;buildTarget=chipObjects;for(const seat of[0,1,2,3,'pot']){const values=HoldEmChips.chips(seat==='pot'?chipLedger.pot:chipLedger.stacks[seat]);let slot=0;for(const value of HoldEmChips.denominations){let count=values.filter(v=>v===value).length;while(count){const n=Math.min(15,count),p=chipPoint(seat,slot++);stackMesh(p[0],p[2],n,value);count-=n}}}buildTarget=old;uploadGeometry(chipObjects)}
function updateFlights(){const ids=chipLedger.flights.map(f=>f.id).join(',');if(ids===flightIds)return;flightIds=ids;clearMeshes(flightObjects);const old=buildTarget;buildTarget=flightObjects;for(const f of chipLedger.flights){const data=[];for(let j=0;j<20;j++){const a=j*Math.PI/10,b=(j+1)*Math.PI/10;tri(data,[0,.008,0],[Math.cos(a)*.044,.008,Math.sin(a)*.044],[Math.cos(b)*.044,.008,Math.sin(b)*.044],[0,1,0]);quad(data,[Math.cos(a)*.044,0,Math.sin(a)*.044],[Math.cos(b)*.044,0,Math.sin(b)*.044],[Math.cos(b)*.044,.008,Math.sin(b)*.044],[Math.cos(a)*.044,.008,Math.sin(a)*.044],[Math.cos(a),0,Math.sin(a)])}object(data,chipColors[f.value],2,null,{part:'flight',id:f.id})}buildTarget=old;uploadGeometry(flightObjects)}
function pickProp(e){if(previewMode||lobbyMode||drag||!lastVP)return -1;const rect=canvas.getBoundingClientRect();let best=-1,distance=32;propCenters.forEach((p,i)=>{if(propMotion.held(i)||HoldEmStage.has(i))return;const q=[0,0,0,0];for(let r=0;r<4;r++)q[r]=lastVP[r]*p[0]+lastVP[4+r]*p[1]+lastVP[8+r]*p[2]+lastVP[12+r];if(q[3]<=0)return;const x=rect.left+(q[0]/q[3]*.5+.5)*rect.width,y=rect.top+(-q[1]/q[3]*.5+.5)*rect.height,d=Math.hypot(e.clientX-x,e.clientY-y);if(d<distance){best=i;distance=d}});return best}
function hoverProp(e){const seat=pickProp(e);if(seat===hoverSeat)return;clearTimeout(hoverTimer);hoverSeat=seat;propTip.hidden=seat<0;if(seat>=0){propTip.textContent=characterSet.cast[seat].name+' · Cigar & lighter';hoverTimer=setTimeout(()=>{if(hoverSeat===seat&&!drag){sendPropAction(seat);propTip.hidden=true;schedule()}},350)}}
canvas.addEventListener('pointermove',hoverProp);canvas.addEventListener('pointerleave',()=>{hoverSeat=-1;clearTimeout(hoverTimer);propTip.hidden=true});
canvas.addEventListener('pointerdown',e=>{const seat=pickProp(e);if(seat>=0){clearTimeout(hoverTimer);sendPropAction(seat);propTip.hidden=true;schedule()}});
window.addEventListener('holdem:look',()=>schedule());
function propAction(seat,action='pickup'){if(!Number.isInteger(seat)||HoldEmStage.has(seat))return;if(action==='puff'){if(propMotion.states[seat].lit)propMotion.puff(seat)}else if(action==='down')propMotion.putDown(seat);else propMotion.trigger(seat);schedule()}
function sendPropAction(seat,action='pickup'){if(window.HoldEmRoom?.ready)window.HoldEmRoom.animateProp(seat,action);else propAction(seat,action)}
window.addEventListener('holdem:prop',e=>{const p=typeof e.detail==='number'?{seat:e.detail,action:'pickup'}:e.detail;propAction(p.seat,p.action)});
window.addEventListener('holdem:bust',e=>propMotion.cancel(e.detail));
window.addEventListener('holdem:state',e=>{tableSnapshot=e.detail;controls.querySelector('[data-cards]').disabled=tableSnapshot.gameType==='blackjack';controls.querySelector('[data-cards]').textContent=tableSnapshot.gameType==='blackjack'?'Cards on table':cardsDown?'Raise cards':'Lower cards';if(!(tableSnapshot.gameType==='blackjack'&&tableSnapshot.phase==='complete'&&tableSnapshot.dealing))chipLedger.sync(tableSnapshot);HoldEmDealer.sync(tableSnapshot);if(!(tableSnapshot.gameType==='blackjack'&&tableSnapshot.phase==='complete'&&tableSnapshot.dealing)){HoldEmStage.sync(tableSnapshot);HoldEmPersonality.sync(tableSnapshot);}if(tableConfig)rebuildCharacters(tableConfig);rebuildCards(tableSnapshot);schedule()});
window.addEventListener('holdem:room',()=>{if(tableConfig&&!previewMode){lastCastKey='';rebuildCharacters(tableConfig);schedule()}});
chipLedger.sync(tableSnapshot);
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let animatePlayers=!motionPreference.matches,contextReady=true,disposed=false;
const shadows=window.HoldEmLighting?window.HoldEmLighting(gl):{enabled:false};let shadowDirty=true,lastShadowTime=-1000;
function lightProjection(size){const near=.1,far=12,ortho=[1/size,0,0,0,0,1/size,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1];return multiply(ortho,view([-2.2,4.1,1.8],[0,.8,0]))}
const tableLight=lightProjection(3.3),portraitLight=lightProjection(1.85);
function rebuildCharacters(config={},portrait=false){
 if(!portrait){tableConfig=config;chosenSeat=config.chosen;const looks={...(window.TablePoker?.mode==='online'?window.HoldEmRoom.botLooks:botLooks),[config.chosen]:config.customizations?.[config.chosen]};if(window.TablePoker?.mode==='online')for(const [seat,p]of Object.entries(window.HoldEmRoom.roster))looks[seat]=p.look;config={...config,customizations:looks}}
 const showSelf=!portrait&&HoldEmStage.has(config.chosen);const list=portrait?portraitObjects:castObjects,key=JSON.stringify([config.chosen,config.customizations,showSelf]);
 if(list.length&&key===(portrait?lastPortraitKey:lastCastKey)){shadowDirty=true;return portrait?portraitSet:characterSet}
 for(const o of list)gl.deleteBuffer(o.b);list.length=0;
 const set=window.HoldEmCast((data,color,mat,tex,rig)=>list.push({data,color,mat:mat??7,texture:tex,rig}),{...config,showSelf,seats,playerSeats:seats,dealerSeat,mode:portrait?'portrait':'table'});
 uploadGeometry(list);
 if(!portrait){forcedHeads.clear();window.dispatchEvent(new CustomEvent('holdem:cast-looks',{detail:config.customizations}))}
 const motion=window.HoldEmMotion?window.HoldEmMotion(set.actors):null;
 shadowDirty=true;
 if(portrait){portraitSet=set;portraitMotion=motion;lastPortraitKey=key}else{characterSet=set;HoldEmDealer.cast=set;characterMotion=motion;lastCastKey=key;document.querySelector('.table-caption').textContent=set.cast[set.chosen].name.toUpperCase()+' · YOUR SEAT'}
 return set;
}
characterSet=window.HoldEmCast(()=>{},{mode:'catalog'});
const controls=document.createElement('div');controls.className='look-controls';controls.innerHTML='<span>Drag to look around</span><button type="button" data-center>Center view</button><button type="button" data-cards>Lower cards</button><button type="button" data-options>Table options</button><div class="table-options" hidden><button type="button" data-space>View space</button><button type="button" data-puff>Puff</button><button type="button" data-cigar>Put cigar down</button><button type="button" data-sounds>Sounds on</button><button type="button" data-motion></button><button type="button" data-customize>Character menu</button><button type="button" data-menu>Main menu</button></div>';host.appendChild(controls);window.HoldEmHud?.attachControls(controls);
const motionButton=controls.querySelector('[data-motion]');function motionLabel(){motionButton.textContent=animatePlayers?'Pause players':'Animate players';motionButton.setAttribute('aria-pressed',String(animatePlayers))}motionLabel();motionButton.onclick=()=>{animatePlayers=!animatePlayers;motionLabel();schedule()};
motionPreference.addEventListener('change',e=>{animatePlayers=!e.matches;motionLabel();schedule()});
document.querySelector('.table-caption').textContent=(characterSet?characterSet.cast[characterSet.chosen].name.toUpperCase():'YOUR SEAT')+' · SAMPLE HAND';
let yaw=0,pitch=0,targetYaw=0,targetPitch=0,previewYaw=0,targetPreviewYaw=0,previewCharacter=-1,drag=null,lastTime=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
canvas.style.touchAction='none';
canvas.addEventListener('pointerdown',e=>{if(previewMode||lobbyMode||e.button!==0||drag)return;clearTimeout(hoverTimer);drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('looking')});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;targetYaw=clamp(targetYaw-(e.clientX-drag.x)*.0024,-.85,.85);targetPitch=clamp(targetPitch+(e.clientY-drag.y)*.0017,-.75,.20);drag.x=e.clientX;drag.y=e.clientY;schedule()});
function release(e){if(drag&&e.pointerId===drag.id){drag=null;canvas.classList.remove('looking')}}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
controls.querySelector('[data-options]').onclick=e=>{const panel=controls.querySelector('.table-options');panel.hidden=!panel.hidden;e.target.setAttribute('aria-expanded',String(!panel.hidden))};
controls.querySelector('[data-space]').onclick=()=>{targetPitch=-.72;targetYaw=.55;schedule()};
controls.querySelector('[data-cards]').onclick=e=>{if(tableSnapshot.gameType==='blackjack')return;cardsDown=!cardsDown;e.target.textContent=cardsDown?'Raise cards':'Lower cards';e.target.setAttribute('aria-pressed',String(cardsDown));schedule()};
controls.querySelector('[data-puff]').onclick=()=>sendPropAction(chosenSeat,'puff');
controls.querySelector('[data-cigar]').onclick=()=>sendPropAction(chosenSeat,'down');
controls.querySelector('[data-sounds]').onclick=e=>{const muted=HoldEmAudio.mute();e.target.textContent=muted?'Sounds off':'Sounds on';if(muted)window.speechSynthesis?.cancel()};
controls.querySelector('[data-center]').onclick=()=>{targetYaw=targetPitch=0;schedule()};
controls.querySelector('[data-customize]').onclick=()=>{window.TablePoker?.pause();entry?.open()};
controls.querySelector('[data-menu]').onclick=()=>window.HoldEmLobby?.mainMenu();
 window.CardsView={look(dx,dy){if(previewMode||lobbyMode)return;targetYaw=clamp(targetYaw+dx,-.85,.85);targetPitch=clamp(targetPitch+dy,-.75,.20);schedule()},center(){controls.querySelector('[data-center]').click()},cards(){controls.querySelector('[data-cards]').click()},get cardsDown(){return cardsDown}};
window.addEventListener('holdem:preview-rotate',event=>{if(!previewMode||!entry?.isOpen)return;const value=event.detail||{};if(value.reset){targetPreviewYaw=previewYaw+Math.atan2(-Math.sin(previewYaw),Math.cos(previewYaw))}else if(Number.isFinite(value.delta)){targetPreviewYaw+=clamp(value.delta,-Math.PI/2,Math.PI/2)}schedule()});
function multiply(a,b){let r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r}
function normalize(v){let l=Math.hypot(...v);return v.map(x=>x/l)}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function dot(a,b){return a.reduce((s,v,i)=>s+v*b[i],0)}
function view(eye,target){let z=normalize(eye.map((v,i)=>v-target[i])),x=normalize(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]}
const smoke=document.createElement('canvas');smoke.className='he-smoke';smoke.hidden=true;document.body.appendChild(smoke);const smokeContext=smoke.getContext('2d'),smokeSprite=document.createElement('canvas');smokeSprite.width=smokeSprite.height=96;const sc=smokeSprite.getContext('2d'),gradient=sc.createRadialGradient(48,48,1,48,48,48);gradient.addColorStop(0,'rgba(218,227,231,.48)');gradient.addColorStop(.35,'rgba(198,213,223,.25)');gradient.addColorStop(1,'rgba(164,190,210,0)');sc.fillStyle=gradient;sc.fillRect(0,0,96,96);
function project(p){const rect=canvas.getBoundingClientRect(),q=[0,0,0,0];for(let r=0;r<4;r++)q[r]=lastVP[r]*p[0]+lastVP[4+r]*p[1]+lastVP[8+r]*p[2]+lastVP[12+r];if(q[3]<=.03||q[2]/q[3]>1)return null;return{x:rect.left+(q[0]/q[3]*.5+.5)*rect.width,y:rect.top+(-q[1]/q[3]*.5+.5)*rect.height,depth:q[3]}}
function updateOverlays(){
 const visible=!previewMode&&!lobbyMode&&window.TablePoker.live&&!window.HoldEmCinematicActive;
 smoke.hidden=!visible||!propMotion.particles.length;
 if(!smoke.hidden){const width=innerWidth,height=innerHeight;if(smoke.width!==width||smoke.height!==height){smoke.width=width;smoke.height=height}smokeContext.clearRect(0,0,width,height);for(const p of propMotion.particles){const q=project(p.p);if(!q)continue;const age=p.age/p.life,r=Math.min(110,(p.radius+p.age*.036)*height/q.depth);smokeContext.globalAlpha=Math.sin(age*Math.PI)* (p.heavy?.8:.45);smokeContext.drawImage(smokeSprite,q.x-r,q.y-r,r*2,r*2)}smokeContext.globalAlpha=1}
 const widget=HoldEmEquity.element,own=tableSnapshot.players[chosenSeat],show=tableSnapshot.gameType!=='blackjack'&&visible&&widget.dataset.ready==='true'&&cardsLowerAmount<.15&&!HoldEmDealer.busy&&!HoldEmStage.has(chosenSeat)&&own?.hole.length===2;
 widget.hidden=!show;if(show){const anchor=project(HoldEmSeating.fromDefault([.285,1.03,1.30],seats[chosenSeat]));if(anchor){widget.style.left=clamp(anchor.x,12,innerWidth-widget.offsetWidth-12)+'px';widget.style.top=clamp(anchor.y,innerWidth<720?210:170,innerHeight-310)+'px'}else widget.hidden=true}
}
function render(time){
 frame=0;if(document.hidden||window.HoldEmCinematicActive||!contextReady||disposed)return;
 const cameraMoving=drag||Math.abs(yaw-targetYaw)+Math.abs(pitch-targetPitch)+(previewMode?Math.abs(previewYaw-targetPreviewYaw):0)>.0001;
 // Idle cast motion uses 30 fps; camera drags retain the display's refresh rate.
 const activeMotion=previewMode?portraitMotion:characterMotion;
 if(!cameraMoving&&lastTime&&time-lastTime<32){schedule();return}
 const dt=Math.min((time-lastTime)/1000||.016,.08);lastTime=time;const ease=1-Math.exp(-14*dt);yaw+=(targetYaw-yaw)*ease;pitch+=(targetPitch-pitch)*ease;previewYaw+=(targetPreviewYaw-previewYaw)*(1-Math.exp(-9*dt));
 cardsLowerAmount+=(Number(cardsDown)-cardsLowerAmount)*(1-Math.exp(-10*dt));activeMotion?.update(dt,animatePlayers);
 if(!previewMode){HoldEmDealer.update(dt);HoldEmStage.update(dt);HoldEmPersonality.update(dt,characterSet,animatePlayers);propMotion.update(dt,characterSet);const wasActive=window.HoldEmTableAnimating;chipLedger.update(dt);window.HoldEmTableAnimating=chipLedger.active||HoldEmStage.active; if(wasActive&&!window.HoldEmTableAnimating)window.dispatchEvent(new Event('holdem:chips-settled'));if(chipRevision!==chipLedger.revision){rebuildChips();chipRevision=chipLedger.revision}updateFlights();}
 let headMoving=false;if(!previewMode)for(const a of characterSet?.actors||[]){const human=window.TablePoker.mode==='online'?window.HoldEmRoom.roster[a.characterIndex]:null,gaze=propMotion.gaze(a.characterIndex)||(human&&a.characterIndex!==chosenSeat?[a.x+Math.sin(a.yaw+(human.yaw||0)),a.headY-.1+Math.sin(human.pitch||0),a.z+Math.cos(a.yaw+(human.yaw||0))]:null),state=activeMotion?.states.get(a.id);if(!state)continue;
 let desired=state.pose;if(gaze){const pivot=[a.x,a.headY-.12,a.z],target=gaze.map((v,i)=>v-pivot[i]);desired=HoldEmProps.transform(pivot,pivot,[Math.sin(a.yaw),0,Math.cos(a.yaw)],target)}
 if(gaze||forcedHeads.has(a.id)){const current=forcedHeads.get(a.id)||state.pose.slice(),blend=1-Math.exp(-9*dt);let difference=0;for(let k=0;k<16;k++){difference+=Math.abs(desired[k]-current[k]);current[k]+=(desired[k]-current[k])*blend}if(difference>.004)headMoving=true;state.pose=current.slice();if(!gaze&&difference<.002)forcedHeads.delete(a.id);else forcedHeads.set(a.id,current)}
 }
 if(!previewMode)for(const a of characterSet?.actors||[]){const state=activeMotion?.states.get(a.id);if(!state)continue;if(a.self&&a.characterIndex===chosenSeat&&!HoldEmStage.has(chosenSeat)){const pivot=a.headPivot||[a.x,a.headY-.12,a.z];state.pose=HoldEmProps.transform(pivot,pivot,[Math.sin(a.yaw),0,Math.cos(a.yaw)],[Math.sin(a.yaw+yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(a.yaw+yaw)*Math.cos(pitch)])}const reaction=HoldEmPersonality.head(a.id);if(reaction)state.pose=multiply(state.pose,reaction)}
 if(!previewMode)propMotion.setHeads(activeMotion?.states);
 if(!previewMode&&!lobbyMode&&cameraMoving&&time-lastLookSent>125){window.HoldEmRoom?.look(yaw,pitch);lastLookSent=time}
 controls.querySelector('[data-sounds]').textContent=HoldEmAudio.muted?'Sounds off':'Sounds on';
 controls.querySelector('[data-cards]').disabled=tableSnapshot.gameType==='blackjack'||!tableSnapshot.players[chosenSeat]?.hole.length||HoldEmDealer.busy||HoldEmStage.has(chosenSeat);
 controls.querySelector('[data-puff]').disabled=!propMotion.states[chosenSeat].lit;
 controls.querySelector('[data-cigar]').disabled=!propMotion.held(chosenSeat);
 const lightMatrix=previewMode?portraitLight:tableLight;
 if(shadows.enabled&&(shadowDirty||((animatePlayers||propMotion.active||chipLedger.active||HoldEmDealer.active||HoldEmStage.active||HoldEmPersonality.active)&&time-lastShadowTime>240))){shadows.render(previewMode?[portraitObjects]:[objects,castObjects,chipObjects,cardObjects],activeMotion,lightMatrix,previewMode?null:resolvePose,previewMode?null:armPose);lastShadowTime=time;shadowDirty=false}
 gl.useProgram(program);gl.uniform1f(loc.sceneTime,time*.001);gl.uniformMatrix4fv(loc.lightVP,false,lightMatrix);gl.uniform1f(loc.shadowEnabled,shadows.enabled?1:0);gl.uniform1i(loc.shadowMap,1);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadows.texture||deck);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(loc.image,0);
 const surface=canvas.parentElement,w=surface.clientWidth,h=surface.clientHeight;if(!w||!h)return;const dpr=window.GameDisplay?.ratio(w,h)||Math.min(devicePixelRatio||1,1.75),rw=Math.round(w*dpr),rh=Math.round(h*dpr);if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh}gl.viewport(0,0,rw,rh);gl.clearColor(.026,.037,.051,1);gl.uniform1f(loc.portrait,previewMode?1:0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const aspect=w/h,portraitDistance=Math.max(3.65,.88/(Math.tan(.36)*aspect)),eye=previewMode?[Math.sin(previewYaw)*portraitDistance,1.24,Math.cos(previewYaw)*portraitDistance]:(lobbyMode||HoldEmStage.has(chosenSeat)?[2.6,2.15,3.2]:HoldEmSeating.point(seats[chosenSeat],0,-.37,1.38)),fov=previewMode?.72:(aspect<1?1.36:1.08),f=1/Math.tan(fov/2),near=.04,far=70;const proj=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],tilt=-.244+pitch,target=previewMode?[0,1.24,0]:lobbyMode||HoldEmStage.has(chosenSeat)?[-.50,.91,0]:[eye[0]+Math.sin(seats[chosenSeat][2]+yaw)*Math.cos(tilt),eye[1]+Math.sin(tilt),eye[2]+Math.cos(seats[chosenSeat][2]+yaw)*Math.cos(tilt)];lastVP=multiply(proj,view(eye,target));gl.uniformMatrix4fv(loc.vp,false,lastVP);gl.uniform3fv(loc.eye,eye);
 function drawObjects(list){for(const o of list){
  const resolved=!previewMode?resolvePose(o):null;if(resolved===false)continue;const s=o.rig?activeMotion?.states.get(o.rig.actor):null,headPart=o.rig&&(o.rig.part==='head'||o.rig.part==='eyes'||o.rig.part==='mouth');
  gl.uniformMatrix4fv(loc.pose,false,resolved|| (s&&headPart?s.pose:restPose));
  const arm=!previewMode?armPose(o):null;gl.uniformMatrix4fv(loc.forePose,false,arm?.lower||restPose);gl.uniform3fv(loc.armElbow,arm?.elbow||[0,0,0]);gl.uniform3fv(loc.armAxis,arm?.axis||[0,1,0]);gl.uniform1f(loc.articulated,arm?1:0);
  gl.uniform2f(loc.blink,o.rig?.eyeY||0,s&&o.rig.part==='eyes'?s.blink:0);
  gl.bindBuffer(gl.ARRAY_BUFFER,o.b);attrs.forEach((a,i)=>{gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,i===2?2:3,gl.FLOAT,false,32,i===0?0:i===1?12:24)});gl.uniform3fv(loc.color,o.color);gl.uniform1f(loc.mat,o.mat);if(o.texture)gl.bindTexture(gl.TEXTURE_2D,o.texture);gl.drawArrays(gl.TRIANGLES,0,o.count)
 }}
 if(previewMode){drawObjects(objects.filter(o=>o.mat===12));drawObjects(portraitObjects)}else{drawObjects(objects);drawObjects(castObjects);drawObjects(chipObjects);drawObjects(cardObjects);drawObjects(flightObjects)}
 updateOverlays();
 if((animatePlayers&&activeMotion)||cameraMoving||headMoving||propMotion.active||chipLedger.active||HoldEmDealer.busy||HoldEmStage.active||!previewMode||Math.abs(cardsLowerAmount-Number(cardsDown))>.001)schedule();
}
rebuildCards(tableSnapshot);rebuildChips();uploadGeometry(objects);document.body.classList.add('seatedTable');let frame=0;
function schedule(){if(!frame&&contextReady&&!disposed&&!document.hidden&&!window.HoldEmCinematicActive)frame=requestAnimationFrame(render)}
window.addEventListener('holdem:cinematic',()=>{lastTime=0;if(window.HoldEmCinematicActive){cancelAnimationFrame(frame);frame=0}else schedule()});
const observer=new ResizeObserver(schedule);observer.observe(host);document.addEventListener('visibilitychange',()=>{lastTime=0;schedule()});
const lobbyCallbacks={onPreview(config){
 previewMode=true;lobbyMode=false;drag=null;canvas.classList.remove('looking');canvas.style.touchAction='pan-y';canvas.style.cursor='default';yaw=pitch=targetYaw=targetPitch=0;if(previewCharacter!==config.chosen){previewYaw=targetPreviewYaw=0;previewCharacter=config.chosen}rebuildCharacters(config,true);
 const slot=document.getElementById('holdemCharacterPreview');if(slot){slot.appendChild(canvas);observer.observe(slot)}lastTime=0;schedule();
},onEnter(config){rebuildCharacters(config);rebuildCards(tableSnapshot);previewMode=false;lobbyMode=false;host.appendChild(canvas);canvas.style.touchAction='none';canvas.style.cursor='';canvas.setAttribute('aria-label','Your seat as '+characterSet.cast[characterSet.chosen].name+' at the Hold Em table. Drag to look around.');yaw=pitch=targetYaw=targetPitch=0;lastTime=0;schedule()},onLobby(config){rebuildCharacters(config);previewMode=false;lobbyMode=true;drag=null;host.appendChild(canvas);canvas.classList.remove('looking');canvas.style.touchAction='auto';canvas.style.cursor='default';canvas.setAttribute('aria-label','The Hold Em table and cast');yaw=pitch=targetYaw=targetPitch=0;lastTime=0;schedule()}};
if(window.HoldEmLobby){entry=window.HoldEmLobby.entry;window.HoldEmLobby.connect(lobbyCallbacks)}else if(window.HoldEmEntry){entry=window.HoldEmEntry({cast:characterSet.cast,...lobbyCallbacks})}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextReady=false;cancelAnimationFrame(frame);frame=0;document.body.classList.remove('seatedTable')});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
window.addEventListener('pagehide',()=>{disposed=true;observer.disconnect();cancelAnimationFrame(frame);frame=0});
window.addEventListener('pageshow',e=>{if(e.persisted){disposed=false;lastTime=0;observer.observe(host);if(entry?.previewHost)observer.observe(entry.previewHost);schedule()}});schedule();
})();
