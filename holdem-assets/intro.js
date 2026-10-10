/* Original card-and-chip opener. All artwork is baked once; animation stays in one canvas. */
(function(){
'use strict';
window.HoldEmIntro=function({onComplete=()=>{}}={}){
 const duration=7.2,TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)},out=v=>1-Math.pow(1-clamp(v),3);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),gentle=()=>reduced.matches||window.GameStudio?.gentle;
 const overlay=document.createElement('section');overlay.className='he-cinematic';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Cards opening cinematic');
 overlay.innerHTML='<canvas aria-hidden="true"></canvas><div class="he-intro-presenter" aria-hidden="true">THE GAME ROOM PRESENTS</div><div class="he-intro-wordmark"><p class="he-intro-eyebrow">A SEAT FOR EVERY CHARACTER</p><h1>Cards<span>.</span></h1><div class="he-intro-suits" aria-hidden="true"><span>♠</span><span>♥</span><span>♣</span><span>♦</span></div></div><button class="he-intro-skip" type="button">Skip intro <span aria-hidden="true">Esc</span></button><div class="he-intro-progress" aria-hidden="true"></div>';
 document.body.appendChild(overlay);
 const canvas=overlay.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:false}),wordmark=overlay.querySelector('.he-intro-wordmark'),presenter=overlay.querySelector('.he-intro-presenter'),progress=overlay.querySelector('.he-intro-progress'),skip=overlay.querySelector('button');
 let frame=0,time=0,last=0,running=false,destroyed=false,previousFocus=null,width=1,height=1,dpr=1,hasSize=false;
 function art(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;const a=c.getContext('2d');if(a)paint(a,w,h);return c}
 function cardFallback(c,w,h,rank,back=false){c.fillStyle=back?'#264a55':'#f5ebd3';c.beginPath();c.roundRect(0,0,w,h,22);c.fill();c.strokeStyle=back?'#d0b56f':'#baa987';c.lineWidth=8;c.stroke();c.fillStyle=back?'#d0b56f':'#21303a';c.textAlign='center';c.font=Math.round(w*.28)+'px Georgia';c.fillText(back?'♠':rank,w*.5,h*.47);c.font=Math.round(w*.19)+'px Georgia';c.fillText('♠',w*.5,h*.70)}
 const ranks=['10','J','Q','K','A'];
 const cards=ranks.map(rank=>art(384,560,(a,w,h)=>{if(window.HoldEmCardArt)window.HoldEmCardArt(a,w,h,rank,'♠');else cardFallback(a,w,h,rank)}));
 const back=art(384,560,(a,w,h)=>{if(window.HoldEmCardBack)window.HoldEmCardBack(a,w,h);else cardFallback(a,w,h,'',true)});
 const chipColors=['#943c49','#315466','#bc9450','#367260'];
 const chipFaces=chipColors.map((color,i)=>art(256,256,(a,w,h)=>{
  if(window.HoldEmChipArt){window.HoldEmChipArt(a,w,h,[25,100,500,1000][i],color);return}
  a.fillStyle=color;a.beginPath();a.arc(w/2,h/2,w*.48,0,TAU);a.fill();a.strokeStyle='#e4d3a8';a.lineWidth=8;a.stroke();a.fillStyle='#f3e3ba';a.textAlign='center';a.textBaseline='middle';a.font='bold 47px Georgia';a.fillText(String([25,100,500,1000][i]),w/2,h/2);
 }));
 const dust=Array.from({length:42},(_,i)=>({x:Math.sin(i*73.79)*.5+.5,y:Math.cos(i*32.89)*.5+.5,size:.5+(i%5)*.22,phase:i*.72}));
 const chips=Array.from({length:30},(_,i)=>({id:i,type:i%4,angle:i*2.399963,radius:2.35+(i%5)*.20,depth:5.8+(i%4)*.39,spin:i*.83,delay:(i%10)*.036}));
 function resize(){width=Math.max(1,overlay.clientWidth);height=Math.max(1,overlay.clientHeight);dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);hasSize=true;if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0)}
 const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>{hasSize=false;if(running)schedule()}):null;observer?.observe(overlay);
 function project(p){const f=Math.min(width*1.19,height*.98);return {x:width*.5+p[0]*f/p[2],y:height*.47-p[1]*f/p[2],z:p[2]}}
 function rotation(p,yaw,pitch,roll){let x=p[0],y=p[1],z=p[2],c=Math.cos(yaw),s=Math.sin(yaw),xx=x*c+z*s,zz=z*c-x*s;x=xx;z=zz;c=Math.cos(pitch);s=Math.sin(pitch);let yy=y*c-z*s;zz=y*s+z*c;y=yy;z=zz;c=Math.cos(roll);s=Math.sin(roll);return [x*c-y*s,x*s+y*c,z]}
 function world(p,o){const q=rotation(p,o.yaw,o.pitch,o.roll);return [q[0]+o.x,q[1]+o.y,q[2]+o.z]}
 function polygon(points,fill,stroke=null,lineWidth=1){ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke()}}
 // A strip mesh supplies perspective-correct looking card faces without a second WebGL context.
 function triangle(image,source,destination){
  const [s0,s1,s2]=source,[a,b,c]=destination,den=s0.x*(s1.y-s2.y)+s1.x*(s2.y-s0.y)+s2.x*(s0.y-s1.y);if(Math.abs(den)<.00001)return;
  const A=(a.x*(s1.y-s2.y)+b.x*(s2.y-s0.y)+c.x*(s0.y-s1.y))/den,B=(a.y*(s1.y-s2.y)+b.y*(s2.y-s0.y)+c.y*(s0.y-s1.y))/den;
  const C=(a.x*(s2.x-s1.x)+b.x*(s0.x-s2.x)+c.x*(s1.x-s0.x))/den,D=(a.y*(s2.x-s1.x)+b.y*(s0.x-s2.x)+c.y*(s1.x-s0.x))/den;
  const E=(a.x*(s1.x*s2.y-s2.x*s1.y)+b.x*(s2.x*s0.y-s0.x*s2.y)+c.x*(s0.x*s1.y-s1.x*s0.y))/den,F=(a.y*(s1.x*s2.y-s2.x*s1.y)+b.y*(s2.x*s0.y-s0.x*s2.y)+c.y*(s0.x*s1.y-s1.x*s0.y))/den;
  const center={x:(a.x+b.x+c.x)/3,y:(a.y+b.y+c.y)/3};
  ctx.save();ctx.beginPath();for(const [i,p]of destination.entries()){const dx=p.x-center.x,dy=p.y-center.y,l=Math.hypot(dx,dy)||1;ctx[i?'lineTo':'moveTo'](p.x+dx/l*.45,p.y+dy/l*.45)}ctx.closePath();ctx.clip();ctx.transform(A,B,C,D,E,F);ctx.drawImage(image,0,0);ctx.restore();
 }
 function card(o){
  const image=Math.cos(o.yaw)>=0?cards[o.id]:back,w=.95,h=1.385;
  const local=[[-w/2,h/2,0],[w/2,h/2,0],[w/2,-h/2,0],[-w/2,-h/2,0]],corners=local.map(p=>project(world(p,o)));
  if(corners.some(p=>p.z<.12))return;
  ctx.save();ctx.globalAlpha=o.alpha;
  const edges=local.map(p=>project(world([p[0],p[1],-.016],o)));polygon([...corners,...edges.slice().reverse()],'#bcac8b');
  for(let strip=0;strip<8;strip++){
   const u=strip/8,U=(strip+1)/8,p=[[-w/2+u*w,h/2,0],[-w/2+U*w,h/2,0],[-w/2+U*w,-h/2,0],[-w/2+u*w,-h/2,0]].map(v=>project(world(v,o)));
   const uv=[{x:u*image.width,y:0},{x:U*image.width,y:0},{x:U*image.width,y:image.height},{x:u*image.width,y:image.height}];triangle(image,[uv[0],uv[1],uv[2]],[p[0],p[1],p[2]]);triangle(image,[uv[0],uv[2],uv[3]],[p[0],p[2],p[3]]);
  }
  const shade=(1-Math.abs(Math.cos(o.yaw)))*.32;polygon(corners,'rgba(5,17,23,'+shade+')');
  ctx.restore();
 }
 function chip(o){
  if(o.z<.18)return;
  const center=project([o.x,o.y,o.z]),radius=o.radius||.205;
  const u=rotation([radius,0,0],o.yaw,o.pitch,o.roll),v=rotation([0,-radius,0],o.yaw,o.pitch,o.roll),normal=rotation([0,0,.035],o.yaw,o.pitch,o.roll),a=project([o.x+u[0],o.y+u[1],o.z+u[2]]),b=project([o.x+v[0],o.y+v[1],o.z+v[2]]),rear=project([o.x-normal[0],o.y-normal[1],o.z-normal[2]]);
  if(a.z<.08||b.z<.08||rear.z<.08)return;
  const extent=Math.max(Math.hypot(a.x-center.x,a.y-center.y),Math.hypot(b.x-center.x,b.y-center.y));if(center.x+extent<-20||center.x-extent>width+20||center.y+extent<-20||center.y-extent>height+20)return;
  let ax=a.x-center.x,ay=a.y-center.y;const bx=b.x-center.x,by=b.y-center.y;
  if(ax*by-ay*bx<0){ax=-ax;ay=-ay}
  ctx.save();ctx.globalAlpha=o.alpha;
  // Offset disks give each chip a clay edge even when the printed face turns away.
  for(let j=3;j>=1;j--){const f=j/3;ctx.save();ctx.transform(ax,ay,bx,by,center.x+(rear.x-center.x)*f,center.y+(rear.y-center.y)*f);ctx.fillStyle=j===1?'#cab988':'#4c4a41';ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();ctx.restore()}
  ctx.save();ctx.transform(ax/128,ay/128,bx/128,by/128,center.x,center.y);ctx.drawImage(chipFaces[o.type],-128,-128);ctx.restore();
  ctx.restore();
 }
 function scene(t){
  if(!ctx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;
  ctx.fillStyle='#070d12';ctx.fillRect(0,0,width,height);
  const glow=ctx.createRadialGradient(width*.5,height*.44,0,width*.5,height*.47,Math.max(width,height)*.63);glow.addColorStop(0,'#183438');glow.addColorStop(.44,'#101e25');glow.addColorStop(1,'#070c12');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  const fadeIn=ease(t/.65),late=1-ease((t-5.55)/.65),brightness=fadeIn*late;
  ctx.globalAlpha=brightness;
  for(const p of dust){const drift=t*.004;ctx.fillStyle='rgba(201,184,131,'+(.08+.09*Math.sin(p.phase+t*.45))+')';ctx.beginPath();ctx.arc(p.x*width,(p.y+drift)%1*height,p.size,0,TAU);ctx.fill()}
  // Concentric, very faint orbit lines cue depth before the chips accelerate.
  const orbitAlpha=ease((t-1.9)/.8)*(1-ease((t-3.2)/.5));if(orbitAlpha>.001){ctx.save();ctx.globalAlpha=orbitAlpha*.14;ctx.strokeStyle='#b7a670';ctx.lineWidth=1;for(const scale of [1,1.13]){ctx.beginPath();ctx.ellipse(width*.5,height*.47,Math.min(width*.41,height*.67)*scale,Math.min(width*.18,height*.25)*scale,-.08,0,TAU);ctx.stroke()}ctx.restore()}
  const items=[];
  for(let i=0;i<5;i++){
   const offset=i-2,appear=out((t-.16-i*.10)/.70),flip=ease((t-.48-i*.18)/.75),leave=out((t-2.95-i*.045)/.86);
   items.push({kind:'card',id:i,x:offset*.49+offset*leave*.61,y:-Math.abs(offset)*.10+(1-appear)*-.7+leave*.9,z:4.6-Math.abs(offset)*.038+leave*1.8,yaw:Math.PI*(1-flip)+leave*offset*.45,pitch:.065+leave*.35,roll:-offset*.14+leave*offset*.18,alpha:fadeIn*appear*(1-leave)});
  }
  for(const c of chips){
   const flight=clamp((t-3.35-c.delay)/1.53),rush=flight*flight*flight,angle=c.angle+t*(.39+c.id%3*.025),gather=ease((t-1.1)/1.5),r=c.radius*(1-gather*.11)*(c.id%7===0?Math.pow(1-rush,2):1-rush*.69),z=c.depth-rush*(c.depth+1.1);
   items.push({kind:'chip',id:c.id,type:c.type,x:Math.cos(angle)*r,y:Math.sin(angle)*r*.60,z,yaw:Math.sin(c.spin+t*.85)*.72+flight*1.4,pitch:Math.cos(c.spin+t*.68)*.6+flight*.8,roll:c.spin+t*(.38+c.id%4*.13)+flight*2.8,alpha:fadeIn*ease((t-.10-c.id*.017)/.7)*late,radius:.16+(c.id%4)*.018});
  }
  items.sort((a,b)=>b.z-a.z);for(const item of items){if(item.alpha<.005)continue;if(item.kind==='card')card(item);else chip(item)}
  ctx.globalAlpha=1;
  const flare=Math.max(0,1-Math.abs(t-5.13)/.28)*.17;if(flare>0){const flash=ctx.createRadialGradient(width*.5,height*.48,0,width*.5,height*.48,Math.max(width,height)*.6);flash.addColorStop(0,'rgba(232,209,156,'+flare+')');flash.addColorStop(1,'rgba(232,209,156,0)');ctx.fillStyle=flash;ctx.fillRect(0,0,width,height)}
  const vignette=ctx.createRadialGradient(width*.5,height*.45,Math.min(width,height)*.14,width*.5,height*.45,Math.max(width,height)*.68);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(2,5,10,.65)');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
 }
 function draw(t,staticTitle){
  if(!hasSize)resize();scene(staticTitle?6:t);
  const reveal=staticTitle?1:out((t-5.04)/.9),scale=staticTitle?1:1+(1-reveal)*.22;
  wordmark.style.opacity=String(reveal);wordmark.style.transform='translate(-50%,-50%) scale('+scale+')';
  presenter.style.opacity=String(staticTitle?0:ease(t/.65)*(1-ease((t-4.7)/.5))*.72);
  progress.style.transform='scaleX('+clamp(t/(staticTitle?1.25:duration))+')';
 }
 function tick(stamp){frame=0;if(!running||destroyed||document.hidden)return;const dt=last?Math.min((stamp-last)/1000,.12):0;last=stamp;time+=dt;draw(time,gentle());if(time>=(gentle()?1.25:duration)){finish();return}schedule()}
 function schedule(){if(running&&!destroyed&&!document.hidden&&!frame)frame=requestAnimationFrame(tick)}
 function finish(){if(!running||destroyed)return;running=false;cancelAnimationFrame(frame);frame=0;overlay.hidden=true;document.body.classList.remove('holdem-intro-playing');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});onComplete()}
 function replay(){if(destroyed)return;cancelAnimationFrame(frame);frame=0;time=0;last=0;hasSize=false;previousFocus=document.activeElement;running=true;overlay.hidden=false;document.body.classList.add('holdem-intro-playing');draw(0,gentle());skip.focus({preventScroll:true});schedule()}
 function visibility(){last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()}
 function keyboard(e){if(!running)return;if(e.key==='Escape'){e.preventDefault();finish()}else if(e.key==='Tab'){e.preventDefault();skip.focus({preventScroll:true})}}
 function onResize(){hasSize=false;schedule()}
 function preference(){if(running&&reduced.matches){time=0;last=0;draw(0,true);schedule()}}
 function destroy(){if(destroyed)return;destroyed=true;running=false;cancelAnimationFrame(frame);frame=0;observer?.disconnect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',keyboard);window.removeEventListener('resize',onResize);reduced.removeEventListener('change',preference);document.body.classList.remove('holdem-intro-playing');overlay.remove()}
 skip.addEventListener('click',finish);document.addEventListener('visibilitychange',visibility);document.addEventListener('keydown',keyboard);window.addEventListener('resize',onResize);reduced.addEventListener('change',preference);
 replay();
 return {replay,finish,destroy};
};
})();
