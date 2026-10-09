
/* Pool music: Cool Vibes by Kevin MacLeod, CC BY 4.0; see audio/CREDITS.txt. Football instrumental and effects are original procedural audio. */
(()=>{'use strict';
const activeAudio=new Set();
let gameRoomMenuOpen=false,audioChannel=null;
try{audioChannel=new BroadcastChannel('game-room-audio-v2');audioChannel.onmessage=event=>{
 if(event.data?.type==='menu-open'){gameRoomMenuOpen=true;for(const audio of activeAudio)audio.syncFocus()}
}}catch{}
function focusGameAudio(){if(!document.hidden&&document.hasFocus()){gameRoomMenuOpen=false;for(const audio of activeAudio)audio.syncFocus()}}
addEventListener('focus',focusGameAudio);
addEventListener('blur',()=>{for(const audio of activeAudio)audio.syncFocus()});
setInterval(()=>{for(const audio of activeAudio)audio.syncFocus()},300);
function stopGameAudio(){for(const audio of activeAudio)audio.stop()}
addEventListener('pagehide',stopGameAudio);
addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='game-room:stop-audio')stopGameAudio()});
class GameAudio{
 constructor(style,key){
  activeAudio.add(this);this.stopped=false;
  this.style=style;this.key=key;this.ctx=null;this.enabled=true;this.music=.55;this.effects=.80;this.crowd=.45;this.cooldowns={};
  try{let saved=JSON.parse(localStorage.getItem(key)||'null');if(saved){this.music=saved.music??.55;this.effects=saved.effects??.80;this.crowd=saved.crowd??.45;this.enabled=saved.enabled!==false}}catch(e){}
  const unlock=()=>{focusGameAudio();this.unlock()};addEventListener('pointerdown',unlock,{capture:true});addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)focusGameAudio();this.syncFocus()});
 }
 syncFocus(){
  if(!this.ctx||this.stopped||this.ctx.state==='closed')return;
  const audible=!document.hidden&&document.hasFocus()&&!gameRoomMenuOpen;
  this.syncRecordedMusic();if(this.focusAudible===audible)return;this.focusAudible=audible;
  // Mute immediately, even before an AudioContext suspension finishes.
  if(this.outputGate){this.outputGate.gain.cancelScheduledValues(this.ctx.currentTime);this.outputGate.gain.setValueAtTime(audible?1:0,this.ctx.currentTime)}
  if(audible&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
  else if(!audible&&this.ctx.state==='running')this.ctx.suspend().catch(()=>{});
 }
 stop(){
  this.stopped=true;this.started=false;
  if(this.musicElement){this.musicElement.pause();this.musicElement.removeAttribute('src');this.musicElement.load();this.musicElement=null}
  for(const source of [this.loop,this.crowdLoop]){try{source?.stop()}catch{}}
  if(this.ctx&&this.ctx.state!=='closed')this.ctx.close().catch(()=>{});
  if(this.style==='rock'&&window.speechSynthesis)window.speechSynthesis.cancel();
  activeAudio.delete(this);
 }
 unlock(){
  if(this.stopped)return;
  if(!this.ctx){let C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createDynamicsCompressor();this.master.threshold.value=-12;this.master.knee.value=14;this.master.ratio.value=5;this.outputGate=this.ctx.createGain();this.outputGate.gain.value=0;this.master.connect(this.outputGate);this.outputGate.connect(this.ctx.destination);this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();this.musicBus.connect(this.master);this.fxBus.connect(this.master);this.crowdBus=this.ctx.createGain();this.crowdBus.connect(this.master);
   this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);let data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   this.curve=new Float32Array(2048);for(let i=0;i<this.curve.length;i++){let x=i/1024-1;this.curve[i]=Math.tanh(x*7)*.65}
   this.apply();this.started=true;this.next=this.ctx.currentTime+.08;this.prepareMusicLoop();if(this.style==='rock')this.prepareCrowd();
  }
  this.syncFocus();this.syncRecordedMusic();
 }
 apply(){this.syncRecordedMusic();if(this.ctx){this.musicBus.gain.setTargetAtTime(this.enabled?this.music*.65:0,this.ctx.currentTime,.05);this.fxBus.gain.setTargetAtTime(this.effects,this.ctx.currentTime,.05);this.crowdBus.gain.setTargetAtTime(this.crowd,this.ctx.currentTime,.15)}try{localStorage.setItem(this.key,JSON.stringify({music:this.music,effects:this.effects,crowd:this.crowd,enabled:this.enabled}))}catch(e){}}
 setMusic(v){this.music=Math.max(0,Math.min(1,v));this.apply()}
 setEffects(v){this.effects=Math.max(0,Math.min(1,v));this.apply()}
 tone(freq,at,duration,volume,wave='sine',bus=this.musicBus,end=0){
  if(!this.ctx||!bus)return;let o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=wave;o.frequency.setValueAtTime(freq,at);if(end)o.frequency.exponentialRampToValueAtTime(end,at+duration);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g);g.connect(bus);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};
 }
 noiseHit(at,duration,volume,frequency=1600,bus=this.musicBus,type='bandpass'){
  let n=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();n.buffer=this.noise;f.type=type;f.frequency.value=frequency;f.Q.value=.7;g.gain.setValueAtTime(volume,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);n.connect(f);f.connect(g);g.connect(bus);n.start(at,Math.random());n.stop(at+duration);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect()};
 }
 prepareRecordedMusic(){
  if(this.musicElement||this.stopped)return;
  let track=new Audio(new URL('audio/cool-vibes-kevin-macleod.mp3',document.baseURI).href);
  track.loop=true;track.preload='auto';this.musicElement=track;
  track.addEventListener('error',()=>console.warn('Pool lounge recording could not load.',track.error?.code));
  this.syncRecordedMusic();
 }
 syncRecordedMusic(){
  let track=this.musicElement;if(!track)return;
  const audible=!this.stopped&&this.enabled&&this.music>0&&!document.hidden&&document.hasFocus()&&!gameRoomMenuOpen;
  track.volume=audible?Math.min(1,this.music*.55):0;
  if(!audible){track.pause();return}
  if(track.paused&&!this.musicPlayPending){
   this.musicPlayPending=true;
   track.play().then(()=>{if(this.stopped||document.hidden||!document.hasFocus()||gameRoomMenuOpen||!this.enabled)track.pause()}).catch(error=>{if(!['NotAllowedError','AbortError'].includes(error.name))console.warn('Pool music playback unavailable',error)}).finally(()=>this.musicPlayPending=false);
  }
 }

 setCrowd(v){this.crowd=Math.max(0,Math.min(1,v));this.apply()}
 prepareCrowd(){
  let c=this.ctx,rate=c.sampleRate,duration=12,buffer=c.createBuffer(2,rate*duration,rate);
  for(let ch=0;ch<2;ch++){let d=buffer.getChannelData(ch),low=0,band=0;
   for(let i=0;i<d.length;i++){let t=i/rate,n=Math.random()*2-1;low+=.065*(n-low);band+=.006*(low-band);
    let swell=.65+.18*Math.sin(t*Math.PI/6)+.12*Math.cos(t*Math.PI/3);
    let voices=Math.sin(2*Math.PI*143*t+2*Math.sin(t*3.1+ch))*Math.sin(t*7.8+ch)+.6*Math.sin(2*Math.PI*226*t+Math.sin(t*2.3))*Math.sin(t*5.2);
    let fade=Math.min(1,i/2400,(d.length-i)/2400);
    d[i]=((low-band)*.31+voices*.008)*swell*fade;
   }
  }
  let src=c.createBufferSource(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1800;src.buffer=buffer;src.loop=true;src.connect(filter);filter.connect(this.crowdBus);src.start();this.crowdLoop=src;
 }
 cheer(strength=1){if(!this.ctx||!this.crowdBus||this.style!=='rock')return;let t=this.ctx.currentTime;if(t-(this.lastCheer||-10)<1.4)return;this.lastCheer=t;
  this.noiseHit(t,1.7,.24*strength,720,this.crowdBus);this.noiseHit(t+.1,1.3,.13*strength,1300,this.crowdBus);
  for(let k=0;k<6;k++)this.noiseHit(t+k*.14,.035,.055*strength,2200,this.crowdBus);
 }
 guitar(f,at,duration,level){
  let c=this.ctx,rate=c.sampleRate,length=Math.ceil(rate*(duration+.03)),period=Math.round(rate/f),b=c.createBuffer(1,length,rate),d=b.getChannelData(0),ring=new Float32Array(period);
  for(let i=0;i<period;i++)ring[i]=(Math.random()*2-1)*.8;
  for(let i=0;i<length;i++){let j=i%period,next=(j+1)%period,damped=.498*(ring[j]+ring[next]);d[i]=ring[j];ring[j]=damped}
  let src=c.createBufferSource(),dist=c.createWaveShaper(),filter=c.createBiquadFilter(),g=c.createGain(),pan=c.createStereoPanner();src.buffer=b;dist.curve=this.curve;dist.oversample='2x';filter.type='lowpass';filter.frequency.value=3400;g.gain.setValueAtTime(level*2.7,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);pan.pan.value=f<130?-.45:.45;src.connect(dist);dist.connect(filter);filter.connect(g);g.connect(pan);pan.connect(this.musicBus);src.start(at);src.onended=()=>{src.disconnect();dist.disconnect();filter.disconnect();g.disconnect();pan.disconnect()};
 }

 async prepareMusicLoop(){
  if(this.style==='jazz'){this.prepareRecordedMusic();return}
  if(this.preparing)return;this.preparing=true;
  try{
   let Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)return;
   let beat=60/94,duration=beat*64,sampleRate=32000,offline=new Offline(2,Math.ceil(duration*sampleRate),sampleRate),composer=Object.create(GameAudio.prototype);
   composer.ctx=offline;composer.style=this.style;composer.noise=this.noise;composer.curve=this.curve;composer.musicBus=offline.createGain();
   let limit=offline.createDynamicsCompressor();limit.threshold.value=-14;limit.ratio.value=4;composer.musicBus.connect(limit);limit.connect(offline.destination);
   for(let bar=0;bar<16;bar++){composer.rock(bar*beat*4,beat,bar);await new Promise(resolve=>setTimeout(resolve,0))}
   let buffer=await offline.startRendering();if(!this.ctx||this.stopped)return;
   this.loop=this.ctx.createBufferSource();this.loop.buffer=buffer;this.loop.loop=true;this.loop.connect(this.musicBus);this.loop.start();
  }catch(error){console.warn('Instrumental loop unavailable',error)}
 }


 rock(at,beat,bar){
  let root=[40,40,43,38,40,45,43,38,40,43,45,38,40,40,43,38][bar%16],f=n=>440*Math.pow(2,(n-69)/12);
  let rhythm=bar%4===3?[0,.75,1.5,2,2.5,3,3.5]:[0,.5,1.5,2,2.75,3.5];
  for(let k of rhythm){let t=at+k*beat,d=beat*(k===0?.65:.38);for(let n of [root,root+7,root+12])this.guitar(f(n),t,d,.040);this.tone(f(root-12),t,beat*.48,.16,'triangle')}
  for(let k=0;k<8;k++)this.noiseHit(at+k*beat*.5,.07,k%2?.027:.047,7800);
  for(let k of [0,1.5,2,2.75]){this.tone(145,at+k*beat,.19,.33,'sine',this.musicBus,38);this.noiseHit(at+k*beat,.018,.13,2100)}
  for(let k of [1,3]){this.noiseHit(at+k*beat,.21,.22,1900);this.tone(185,at+k*beat,.13,.13,'triangle');this.noiseHit(at+k*beat,.08,.05,5500)}
  if(bar%4===0)this.noiseHit(at,1.2,.085,6400);
  if(bar%4===3)for(let k of [3.25,3.5,3.75]){this.tone(140-(k-3)*70,at+k*beat,.16,.15,'sine');this.noiseHit(at+k*beat,.09,.08,1200)}
  if(bar>=8&&bar%2===0)for(let [k,n] of [[0,19],[1.5,17],[2.5,14]])this.guitar(f(root+n),at+k*beat,beat*.7,.022);
 }

 effect(kind,strength=1,force=false){
  if(!this.ctx||this.ctx.state!=='running'||this.effects<=0)return false;
  if(this.style==='rock'&&['hit','catch','whistle'].includes(kind))this.cheer(kind==='hit'?.65:1);
  let t=this.ctx.currentTime,cool={ball:.027,rail:.07,block:.16,hit:.10,catch:.12,whistle:.7,hut:1.5}[kind]??.1;
  if(!force&&t-(this.cooldowns[kind]??-99)<cool)return false;this.cooldowns[kind]=t;let v=Math.max(.12,Math.min(1,strength)),bus=this.fxBus;
  if(kind==='ball'||kind==='cue'){this.tone(kind==='cue'?1150:2100,t,.033,.24*v,'sine',bus,kind==='cue'?600:1400);this.noiseHit(t,.018,.15*v,3200,bus)}
  else if(kind==='rail'){this.tone(180,t,.065,.20*v,'triangle',bus,95);this.noiseHit(t,.04,.11*v,900,bus)}
  else if(kind==='pocket'){this.tone(135,t,.12,.18,'triangle',bus,65);this.noiseHit(t+.03,.10,.13,600,bus)}
  else if(kind==='hit'||kind==='block'||kind==='catch'){let hard=kind==='hit',grab=kind==='catch';this.tone(hard?95:grab?260:160,t,hard?.22:.09,(hard?.45:.20)*v,'sine',bus,hard?38:70);this.noiseHit(t,hard?.18:grab?.055:.085,(hard?.35:.19)*v,grab?1600:hard?500:950,bus);if(hard)this.noiseHit(t+.055,.10,.13*v,1700,bus)}
  else if(kind==='whistle'){for(let offset of [0,.16]){this.tone(2700,t+offset,.12,.10,'sine',bus,2950);this.tone(3100,t+offset,.11,.045,'sine',bus,3200)}}
  else if(kind==='hut'){
   if(window.speechSynthesis){let utterance=new SpeechSynthesisUtterance('Hut!');utterance.rate=1.4;utterance.pitch=.65;utterance.volume=this.effects*.8;speechSynthesis.speak(utterance)}
   this.noiseHit(t,.075,.05,350,bus);
  }
  return true;
 }
 mount(parent){
  let wrap=document.createElement('details');wrap.className='gameAudioControls';wrap.innerHTML='<summary>♫ Audio</summary><div><label>Music <input type="range" min="0" max="100" value="'+Math.round(this.music*100)+'" aria-label="Music volume"><output>'+Math.round(this.music*100)+'%</output></label><label>Effects <input type="range" min="0" max="100" value="'+Math.round(this.effects*100)+'" aria-label="Sound effects volume"><output>'+Math.round(this.effects*100)+'%</output></label><button type="button">Music '+(this.enabled?'on':'off')+'</button></div>';
  if(this.style==='rock'){let label=document.createElement('label');label.innerHTML='Crowd <input type="range" min="0" max="100" value="'+Math.round(this.crowd*100)+'" aria-label="Crowd volume"><output>'+Math.round(this.crowd*100)+'%</output>';wrap.querySelector('div').insertBefore(label,wrap.querySelector('button'))}
  wrap.querySelectorAll('input').forEach((input,i)=>input.oninput=()=>{this.unlock();i===2?this.setCrowd(input.value/100):i===1?this.setEffects(input.value/100):this.setMusic(input.value/100);input.nextElementSibling.textContent=input.value+'%'});
  wrap.querySelector('button').onclick=e=>{this.unlock();this.enabled=!this.enabled;this.apply();e.target.textContent='Music '+(this.enabled?'on':'off')};
  parent.append(wrap);return wrap;
 }
}
GameAudio.stopAll=stopGameAudio;window.GameAudio=GameAudio;
let style=document.createElement('style');style.textContent='.gameAudioControls{position:relative;pointer-events:auto;color:#d7e6e9;font:11px system-ui;background:#122736;border:1px solid #a3c1ca40;border-radius:9px;padding:9px;z-index:50}.gameAudioControls summary{cursor:pointer;list-style:none}.gameAudioControls>div{position:absolute;right:0;bottom:calc(100% + 8px);width:250px;padding:15px;border:1px solid #a3c1ca40;border-radius:12px;background:#102330;box-shadow:0 12px 40px #0008}.gameAudioControls label{display:flex;align-items:center;gap:8px;margin:9px 0}.gameAudioControls input{width:125px;accent-color:#dcca90}.gameAudioControls output{min-width:32px;font-variant-numeric:tabular-nums}.gameAudioControls button{background:#334d5d;color:#f5ecd9;border:1px solid #bdd3d644;border-radius:6px;padding:7px 12px}';document.head.append(style);
})();
