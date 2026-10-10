/* Local presentation preferences. Cosmetic choices never alter room rules or physics. */
(() => {
 'use strict';
 const page=location.pathname.split('/').pop().toLowerCase();
 const game=page==='quarterback.html'?'quarterback':['holdem.html','cards.html'].includes(page)?'cards':['pool.html','pool-multiplayer.html'].includes(page)?'pool':'room';
 const storageKey='gameRoomStudio:'+game;
 const title=game==='pool'?'Pool style studio':game==='cards'?'Table appearance':'Display settings';
 const defaults={motion:'full',poolHands:'on',skin:'warm',sleeve:'midnight',cloth:'emerald',trim:'champagne',cardBack:'midnight',camera:'balanced',footballLook:'daylight'};
 let values={...defaults};try{const v=JSON.parse(localStorage.getItem(storageKey)||localStorage.getItem('gameRoomStudio')||'{}');for(const key in defaults)if(typeof v[key]==='string')values[key]=v[key]}catch{}
 const choices={motion:[['full','Full motion'],['gentle','Gentle motion']],poolHands:[['on','Show hands'],['off','Cue only']],skin:[['warm','Warm'],['light','Light'],['olive','Olive'],['deep','Deep']],sleeve:[['midnight','Midnight'],['ivory','Ivory'],['burgundy','Burgundy'],['emerald','Emerald']],cloth:[['emerald','Emerald club'],['ocean','Ocean blue'],['wine','Burgundy velvet'],['violet','Royal violet'],['charcoal','Carbon lounge']],trim:[['champagne','Champagne gold'],['silver','Brushed silver'],['copper','Warm copper']],cardBack:[['midnight','Midnight'],['ruby','Ruby'],['jade','Jade']],camera:[['balanced','Balanced'],['close','Closer'],['wide','Wide']],footballLook:[['daylight','Clear daylight'],['golden','Golden hour'],['night','Stadium lights']]};
 for(const key in values)if(!choices[key]?.some(o=>o[0]===values[key]))values[key]=defaults[key];
 function apply(){document.documentElement.dataset.studioMotion=values.motion;document.documentElement.dataset.studioGame=game;document.documentElement.dataset.studioCloth=values.cloth;window.dispatchEvent(new CustomEvent('studio:change',{detail:{...values}}))}
 function set(key,value){if(!choices[key]?.some(o=>o[0]===value))return;values[key]=value;try{localStorage.setItem(storageKey,JSON.stringify(values))}catch{}apply()}
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 window.GameStudio={get:key=>values[key],get gentle(){return values.motion==='gentle'||reducedMotion.matches},set,get values(){return {...values}},open:()=>open()};
 let dialog,opener;
 function open(){if(!dialog)return;dialog.showModal();dialog.querySelector('button')?.focus()}
 function init(){
  if(game==='room'){apply();return;}
  dialog=document.createElement('dialog');dialog.className='studio-dialog';dialog.setAttribute('aria-label',title);
  const keys=game==='pool'?['poolHands','skin','sleeve','camera','motion']:game==='cards'?['cloth','trim','cardBack','camera','motion']:game==='quarterback'?['footballLook','camera','motion']:['motion'];
  const labels={poolHands:'Player hands',skin:'Skin tone',sleeve:'Cue sleeve',cloth:'Table felt',trim:'Table hardware',cardBack:'Card backs',camera:'Camera framing',motion:'Animation style',footballLook:'Stadium lighting'};
  dialog.innerHTML='<header><div><small>MAKE IT YOURS</small><h2>'+title+'</h2></div><button type="button" aria-label="Close settings">×</button></header><p class="studio-note">A few finishing touches. Saved on this device.</p>'+keys.map(key=>'<fieldset><legend>'+labels[key]+'</legend><div class="studio-choices">'+choices[key].map(([v,label])=>'<button type="button" data-setting="'+key+'" data-value="'+v+'" aria-pressed="'+(values[key]===v)+'"><i style="--swatch:'+({emerald:'#286853',ocean:'#336f95',wine:'#853e59',violet:'#60518a',charcoal:'#3b4b53',champagne:'#d9bd7e',silver:'#b9c7d1',copper:'#bc805c',warm:'#bb815b',light:'#dfb393',olive:'#9a7551',deep:'#70492f',midnight:'#203b56',ivory:'#e6ddc8',burgundy:'#7c344a',ruby:'#9b4354',jade:'#347262'}[v]||'transparent')+'"></i>'+label+'</button>').join('')+'</div></fieldset>').join('')+'<footer>THE GAME ROOM · '+game.toUpperCase()+'</footer>';
  document.body.append(dialog);dialog.querySelector('header button').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}const b=e.target.closest('[data-setting]');if(!b)return;set(b.dataset.setting,b.dataset.value);for(const x of dialog.querySelectorAll('[data-setting="'+b.dataset.setting+'"]'))x.setAttribute('aria-pressed',String(x===b))});
  opener=document.createElement('button');opener.type='button';opener.className='studio-open';opener.textContent=title;opener.onclick=open;
  const place=game==='cards'?document.querySelector('.he-settings-drawer'):game==='quarterback'?document.querySelector('#qbMenu'):game==='pool'?document.querySelector('#pause .card, #pause .panel, #pause>div'):document.querySelector('.nav');
  (place||document.body).append(opener);if(!place)opener.classList.add('studio-floating');
  if(game==='pool'){const menuButton=opener.cloneNode(true);menuButton.onclick=open;(document.querySelector('#intro .card, #intro .panel, #intro>div')||document.querySelector('#intro')||document.body).append(menuButton)}
  if(game==='cards'){const menuButton=opener.cloneNode(true);menuButton.onclick=open;document.querySelector('.he-main-footer')?.append(menuButton)}
  const tools=game==='pool'?document.querySelector('.hudTools'):game==='quarterback'?document.querySelector('#proCameraControls'):null;
  if(tools){tools.classList.add('studio-compact-controls');if(!tools.id)tools.id='studioTableControls';const toggle=document.createElement('button');toggle.type='button';toggle.className='phone-tools-toggle';toggle.textContent='☰';toggle.setAttribute('aria-label','Table and game settings');toggle.setAttribute('aria-controls',tools.id);toggle.setAttribute('aria-expanded','false');const close=()=>{tools.classList.remove('phone-tools-open');toggle.setAttribute('aria-expanded','false')};toggle.onclick=()=>{const open=tools.classList.toggle('phone-tools-open');toggle.setAttribute('aria-expanded',String(open))};document.body.append(toggle);document.addEventListener('pointerdown',e=>{if(!tools.contains(e.target)&&!toggle.contains(e.target))close()});document.addEventListener('keydown',e=>{if(e.code==='Escape')close()});}
  if(game==='quarterback'&&tools){
   const phone=matchMedia('(pointer:coarse) and (max-width:1100px), (max-width:600px)'),moved=[];
   for(const id of ['qbMenuBack','qbAudioControls']){const node=document.getElementById(id);if(node){const marker=document.createComment('phone-settings-'+id);node.before(marker);moved.push({node,marker})}}
   const relocate=()=>{for(const {node,marker}of moved){if(phone.matches)tools.append(node);else marker.after(node)}};
   phone.addEventListener('change',relocate);relocate();
  }
  apply();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
