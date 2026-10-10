/* A short, local entrance. Gameplay starts only after the camera settles. */
(function(){
'use strict';
let active=false,time=0,resolve=null;const impacts=new Set(),duration=7.4;
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)},mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const style=document.createElement('style');style.textContent='.cards-arriving .look-controls,.cards-arriving .he-edge-hud,.cards-arriving .he-table-stats,.cards-arriving .he-settings-button,.cards-arriving .table-caption,.cards-arriving #blackjackControls{visibility:hidden!important}.cards-arrival{position:fixed;inset:0;z-index:950;display:flex;align-items:flex-end;justify-content:space-between;padding:30px max(24px,env(safe-area-inset-right));box-sizing:border-box;background:linear-gradient(#02051155,transparent 20%,transparent 76%,#020511bb);touch-action:none}.cards-arrival[hidden]{display:none}.cards-arrival p{color:#f4e3bf;font:600 16px system-ui;letter-spacing:.12em;margin:0}.cards-arrival small{display:block;font:12px system-ui;color:#b9c5d9;letter-spacing:0;margin-top:7px}.cards-arrival button{border:1px solid #d1b67a77;border-radius:24px;background:#111b27dd;color:#f4e3bf;padding:12px 20px;cursor:pointer}';document.head.appendChild(style);
const overlay=document.createElement('div');overlay.className='cards-arrival';overlay.hidden=true;overlay.innerHTML='<p>A TABLE OUT OF THIS WORLD<small>Everyone has a seat. Some land better than others.</small></p><button type="button">Skip entrance</button>';document.body.appendChild(overlay);
function finish(ok=true){if(!active)return;active=false;overlay.hidden=true;document.body.classList.remove('cards-arriving');const done=resolve;resolve=null;done?.(ok)}
overlay.querySelector('button').onclick=()=>finish();
function start(){finish(false);time=0;impacts.clear();active=true;overlay.hidden=false;document.body.classList.add('cards-arriving');return new Promise(r=>resolve=r)}
function update(dt){if(!active)return;time+=Math.min(.06,dt);for(let i=0;i<5;i++){const at=2.3+i*.40;if(time>=at&&!impacts.has(i)){impacts.add(i);window.HoldEmAudio?.chip('land',i===1?.85:.45)}}if(time>=duration)finish()}
function pose(actor,part,chosen){if(!active)return null;if(part==='chair')return null;if(actor.characterIndex===chosen&&time>6.25)return false;
 const i=actor.dealer?4:actor.characterIndex,at=2.3+i*.40,u=clamp((time-(at-1.6))/1.6);let height=9*(1-u*u),lean=Math.sin(u*Math.PI)*.16*(i%2?1:-1),forward=0;
 if(i===1&&u<1){const approach=ease((u-.7)/.3);forward=.47*approach;lean+=.72*approach;height+=.10*approach;}
 if(u>=1){const land=time-at;height=-.065*Math.sin(clamp(land/.35)*Math.PI);lean=.10*Math.sin(clamp(land/.42)*Math.PI);if(i===1){const recovery=ease((land-.36)/1.35);forward=.47*(1-recovery);lean=.72*(1-recovery);height=.10*(1-recovery)+.045*Math.sin(clamp(land/.36)*Math.PI)}}
 const a=actor.yaw,cy=Math.cos(a),sy=Math.sin(a),cp=Math.cos(lean),sp=Math.sin(lean),m=new Float32Array([cy*cy+sy*cp*sy,-sp*sy,-sy*cy+cy*cp*sy,0,sy*sp,cp,cy*sp,0,-cy*sy+sy*cp*cy,-sp*cy,sy*sy+cy*cp*cy,0,0,0,0,1]),p=[actor.x,.92,actor.z],d=[p[0]+sy*forward,p[1]+height,p[2]+cy*forward];
 m[12]=d[0]-(m[0]*p[0]+m[4]*p[1]+m[8]*p[2]);m[13]=d[1]-(m[1]*p[0]+m[5]*p[1]+m[9]*p[2]);m[14]=d[2]-(m[2]*p[0]+m[6]*p[1]+m[10]*p[2]);return m;
}
function camera(eye,target,seat){if(!active)return;const wide=HoldEmSeating.point(seat,1.25,-1.7,2.7),up=[eye[0]*.35,8.8,eye[2]*.35],reveal=ease((time-.6)/2),home=ease((time-5.45)/1.95);const e=mix(eye,wide,reveal*(1-home)),t=mix(mix(up,[0,1.25,0],reveal),target,home);for(let k=0;k<3;k++){eye[k]=e[k];target[k]=t[k]}}
function tablePose(){if(!active)return null;let pulse=0;for(let i=0;i<5;i++){const t=time-(2.3+i*.40);if(t>=0&&t<1.0)pulse+=Math.sin(t*27)*Math.exp(-t*6)*(i===1?.024:.010)}if(window.GameStudio?.gentle)pulse*=.2;const m=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);m[12]=pulse*.25;m[13]=pulse*.45;m[14]=pulse*.20;return m}
window.CardsArrival={start,update,pose,camera,tablePose,cancel:()=>finish(false),get active(){return active}};window.addEventListener('pagehide',()=>finish(false));
})();
