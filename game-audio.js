
/* Original procedural instrumentals and game effects. No sampled commercial recordings. */
(()=>{'use strict';
class GameAudio{
 constructor(style,key){
  this.style=style;this.key=key;this.ctx=null;this.bar=0;this.next=0;this.enabled=true;this.music=.55;this.effects=.80;this.cooldowns={};
  try{let saved=JSON.parse(localStorage.getItem(key)||'null');if(saved){this.music=saved.music??.55;this.effects=saved.effects??.80;this.enabled=saved.enabled!==false}}catch(e){}
  const unlock=()=>this.unlock();addEventListener('pointerdown',unlock,{capture:true});addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(!this.ctx)return;if(document.hidden)this.ctx.suspend();else if(this.started){this.ctx.resume();this.next=this.ctx.currentTime+.08}});
 }
 unlock(){
  if(!this.ctx){let C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createDynamicsCompressor();this.master.threshold.value=-12;this.master.knee.value=14;this.master.ratio.value=5;this.master.connect(this.ctx.destination);this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();this.musicBus.connect(this.master);this.fxBus.connect(this.master);
   this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);let data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   this.curve=new Float32Array(2048);for(let i=0;i<this.curve.length;i++){let x=i/1024-1;this.curve[i]=Math.tanh(x*7)*.65}
   this.apply();this.started=true;this.next=this.ctx.currentTime+.08;this.prepareMusicLoop();
  }
  if(this.ctx.state==='suspended'&&!document.hidden)this.ctx.resume().catch(()=>{});
 }
 apply(){if(this.ctx){this.musicBus.gain.setTargetAtTime(this.enabled?this.music*.65:0,this.ctx.currentTime,.05);this.fxBus.gain.setTargetAtTime(this.effects,this.ctx.currentTime,.05)}try{localStorage.setItem(this.key,JSON.stringify({music:this.music,effects:this.effects,enabled:this.enabled}))}catch(e){}}
 setMusic(v){this.music=Math.max(0,Math.min(1,v));this.apply()}
 setEffects(v){this.effects=Math.max(0,Math.min(1,v));this.apply()}
 tone(freq,at,duration,volume,wave='sine',bus=this.musicBus,end=0){
  if(!this.ctx||!bus)return;let o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=wave;o.frequency.setValueAtTime(freq,at);if(end)o.frequency.exponentialRampToValueAtTime(end,at+duration);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g);g.connect(bus);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};
 }
 noiseHit(at,duration,volume,frequency=1600,bus=this.musicBus,type='bandpass'){
  let n=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();n.buffer=this.noise;f.type=type;f.frequency.value=frequency;f.Q.value=.7;g.gain.setValueAtTime(volume,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);n.connect(f);f.connect(g);g.connect(bus);n.start(at,Math.random());n.stop(at+duration);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect()};
 }
 piano(f,at,duration,volume){for(let [ratio,level] of [[1,1],[2,.35],[3,.12],[4,.05]])this.tone(f*ratio,at,duration/Math.sqrt(ratio),volume*level,'sine')}
 guitar(f,at,duration,level){
  let c=this.ctx,o=c.createOscillator(),second=c.createOscillator(),dist=c.createWaveShaper(),filter=c.createBiquadFilter(),g=c.createGain();o.type=second.type='sawtooth';o.frequency.value=f;second.frequency.value=f*1.003;dist.curve=this.curve;dist.oversample='2x';filter.type='lowpass';filter.frequency.setValueAtTime(2600,at);filter.frequency.exponentialRampToValueAtTime(650,at+duration);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(level,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(dist);second.connect(dist);dist.connect(filter);filter.connect(g);g.connect(this.musicBus);o.start(at);second.start(at);o.stop(at+duration);second.stop(at+duration);o.onended=()=>{o.disconnect();second.disconnect();dist.disconnect();filter.disconnect();g.disconnect()};
 }

 async prepareMusicLoop(){
  if(this.preparing)return;this.preparing=true;
  try{
   let Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)return;
   let beat=60/(this.style==='rock'?94:106),duration=beat*32,sampleRate=22050,offline=new Offline(2,Math.ceil(duration*sampleRate),sampleRate),composer=Object.create(GameAudio.prototype);
   composer.ctx=offline;composer.style=this.style;composer.noise=this.noise;composer.curve=this.curve;composer.musicBus=offline.createGain();
   let limit=offline.createDynamicsCompressor();limit.threshold.value=-14;limit.ratio.value=4;composer.musicBus.connect(limit);limit.connect(offline.destination);
   for(let bar=0;bar<8;bar++){if(this.style==='rock')composer.rock(bar*beat*4,beat,bar);else composer.jazz(bar*beat*4,beat,bar);await new Promise(resolve=>setTimeout(resolve,0))}
   let buffer=await offline.startRendering();if(!this.ctx)return;
   this.loop=this.ctx.createBufferSource();this.loop.buffer=buffer;this.loop.loop=true;this.loop.connect(this.musicBus);this.loop.start();
  }catch(error){console.warn('Instrumental loop unavailable',error)}
 }

 schedule(){
  if(!this.ctx||this.ctx.state!=='running'||document.hidden)return;
  if(this.next<this.ctx.currentTime-.1)this.next=this.ctx.currentTime+.05;
  while(this.next<this.ctx.currentTime+.25){let beat=60/(this.style==='rock'?94:106),at=this.next,b=this.bar++;
   if(this.enabled&&this.music>0){if(this.style==='rock')this.rock(at,beat,b);else this.jazz(at,beat,b)}
   this.next+=beat*4;
  }
 }
 jazz(at,beat,bar){
  let roots=[48,45,50,43,48,57,50,55],midi=roots[bar%8],f=n=>440*Math.pow(2,(n-69)/12),voicing=bar%8===2?[3,7,10,14]:bar%8===3||bar%8===7?[4,7,10,14]:[3,7,10,14];
  for(let k=0;k<4;k++){this.tone(f(midi+[0,7,9,11][k]),at+k*beat,.38,.18,'triangle');this.noiseHit(at+k*beat,.13,.030,6900);this.tone(510,at+k*beat,.025,.012,'sine');this.noiseHit(at+k*beat+beat*.67,.06,.024,7300)}
  for(let k of [0,1.67,2.5])for(let n of voicing)this.piano(f(midi+12+n),at+k*beat,.55,.034);
  let melody=[19,22,24,26,22,19,17,14];for(let k=0;k<4;k++){let n=melody[(bar*3+k)%8];this.piano(f(midi+12+n),at+k*beat+(k%2?beat*.18:0),.33,.028)}
  this.noiseHit(at+beat,.20,.045,2200);this.noiseHit(at+beat*3,.22,.04,2200);
 }
 rock(at,beat,bar){
  let root=[40,40,43,38,40,45,43,38][bar%8],f=n=>440*Math.pow(2,(n-69)/12);
  for(let k=0;k<8;k++){let t=at+k*beat*.5,d=k===6?beat*.85:beat*.28;for(let n of [root,root+7,root+12])this.guitar(f(n),t,d,.029);this.tone(f(root-12),t,beat*.42,.13,'triangle');this.noiseHit(t,.055,.030,7400)}
  for(let k of [0,1.5,2,2.75])this.tone(125,at+k*beat,.17,.28,'sine',this.musicBus,40);
  for(let k of [1,3]){this.noiseHit(at+k*beat,.18,.16,2200);this.tone(190,at+k*beat,.09,.055,'triangle')}
  if(bar%4===0)this.noiseHit(at,.8,.055,6700);
 }
 effect(kind,strength=1,force=false){
  if(!this.ctx||this.ctx.state!=='running'||this.effects<=0)return false;
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
  wrap.querySelectorAll('input').forEach((input,i)=>input.oninput=()=>{this.unlock();i?this.setEffects(input.value/100):this.setMusic(input.value/100);input.nextElementSibling.textContent=input.value+'%'});
  wrap.querySelector('button').onclick=e=>{this.unlock();this.enabled=!this.enabled;this.apply();e.target.textContent='Music '+(this.enabled?'on':'off')};
  parent.append(wrap);return wrap;
 }
}
window.GameAudio=GameAudio;
let style=document.createElement('style');style.textContent='.gameAudioControls{position:relative;pointer-events:auto;color:#d7e6e9;font:11px system-ui;background:#122736;border:1px solid #a3c1ca40;border-radius:9px;padding:9px;z-index:50}.gameAudioControls summary{cursor:pointer;list-style:none}.gameAudioControls>div{position:absolute;right:0;bottom:calc(100% + 8px);width:250px;padding:15px;border:1px solid #a3c1ca40;border-radius:12px;background:#102330;box-shadow:0 12px 40px #0008}.gameAudioControls label{display:flex;align-items:center;gap:8px;margin:9px 0}.gameAudioControls input{width:125px;accent-color:#dcca90}.gameAudioControls output{min-width:32px;font-variant-numeric:tabular-nums}.gameAudioControls button{background:#334d5d;color:#f5ecd9;border:1px solid #bdd3d644;border-radius:6px;padding:7px 12px}';document.head.append(style);
})();
