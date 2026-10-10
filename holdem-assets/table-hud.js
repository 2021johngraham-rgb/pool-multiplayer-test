/* Reference-inspired poker HUD. Four portraits, actual balances, and a compact betting rail. */
(function(){
'use strict';
const root=document.createElement('aside');root.className='he-edge-hud';root.setAttribute('aria-label','Players at the table');
root.innerHTML=Array.from({length:4},(_,i)=>'<section class="he-player-panel" data-player-panel="'+i+'"><div class="he-avatar"><img alt="" hidden><span class="he-avatar-fallback"></span><i class="he-seat-dot"></i></div><div class="he-player-copy"><div><b data-name></b><small data-dealer></small></div><strong data-stack></strong><span data-role></span><em data-action></em></div><span class="he-player-time"></span></section>').join('');
const stats=document.createElement('div');stats.className='he-table-stats';stats.innerHTML='<div><small>HAND</small><b data-hud-hand>—</b></div><div><small>BLINDS</small><b>$10 / $20</b></div><div><small>POT</small><b data-hud-pot>$0</b></div>';
const settings=document.createElement('button');settings.className='he-settings-button';settings.type='button';settings.setAttribute('aria-label','Table settings');settings.setAttribute('aria-expanded','false');settings.innerHTML='<i></i><i></i><i></i>';
const drawer=document.createElement('section');drawer.className='he-settings-drawer';drawer.hidden=true;drawer.innerHTML='<header><b>Table settings</b><button data-close aria-label="Close settings">×</button></header><button data-audio>♫ Sound & volume</button><button data-rules>♠ How to play</button><button data-main>← Cards menu</button><button data-room>← Game Room</button><p>45 seconds per decision.<br>Hold Em: check or fold on timeout.<br>Blackjack: minimum wager or stand.</p>';
document.body.append(root,stats,settings,drawer);
const panels=[...root.children],currency=n=>'$'+Number(n||0).toLocaleString('en-US');let snapshot=null,looks={},portraitQueue=[],portraitTimer=null,portraitKeys=new Map(),nextTick=0;
function close(){drawer.hidden=true;settings.setAttribute('aria-expanded','false')}
settings.onclick=()=>{drawer.hidden=!drawer.hidden;settings.setAttribute('aria-expanded',String(!drawer.hidden))};drawer.querySelector('[data-close]').onclick=close;
drawer.querySelector('[data-audio]').onclick=()=>{close();document.querySelector('.he-audio-toggle')?.click()};
drawer.querySelector('[data-rules]').onclick=()=>{close();document.getElementById('rulesButton').click()};
drawer.querySelector('[data-main]').onclick=()=>{close();window.HoldEmLobby.mainMenu()};
drawer.querySelector('[data-room]').onclick=()=>document.getElementById('exitGame').click();
document.addEventListener('keydown',e=>{if(e.code==='Escape')close()});
document.addEventListener('pointerdown',e=>{if(!drawer.hidden&&!drawer.contains(e.target)&&!settings.contains(e.target))close()});
function schedulePortrait(){if(document.hidden||portraitTimer||!portraitQueue.length)return;portraitTimer=window.requestIdleCallback?requestIdleCallback(renderNext,{timeout:1500}):setTimeout(renderNext,100)}
function queuePortraits(){
 for(let i=0;i<4;i++){const look=HoldEmWardrobe.normalize(looks[i]),key=JSON.stringify(look);if(portraitKeys.get(i)===key)continue;portraitKeys.set(i,key);portraitQueue=portraitQueue.filter(p=>p.i!==i);portraitQueue.push({i,look,key})}
 schedulePortrait();
}
function renderNext(){portraitTimer=null;if(document.hidden||!portraitQueue.length)return;const p=portraitQueue.shift();if(portraitKeys.get(p.i)===p.key){const url=window.HoldEmPortraits?.render(p.i,p.look);if(url){const img=panels[p.i].querySelector('img');img.src=url;img.hidden=false;panels[p.i].querySelector('.he-avatar-fallback').hidden=true}}schedulePortrait()}
function update(s){
 snapshot=s;const self=window.TablePoker?.self??s.self,humans=s.mode==='online'?window.HoldEmRoom?.humanSeats()||[]:[self];
 const order=[self,(self+1)%4,(self+2)%4,(self+3)%4];
 for(const p of s.players){
  const el=panels[p.id],slot=order.indexOf(p.id),active=p.id===s.actor&&!s.dealing&&s.phase!=='complete';
  el.dataset.slot=slot;el.style.setProperty('--seat-index',slot);el.classList.toggle('active',active);el.classList.toggle('folded',p.folded);el.classList.toggle('busted',p.stack===0&&!p.inHand);el.classList.toggle('is-self',p.id===self);
  el.querySelector('[data-name]').textContent=p.name+(p.id===self?' · YOU':'');el.querySelector('[data-stack]').textContent=currency(p.stack);
  el.querySelector('[data-dealer]').textContent=p.id===s.dealer?'D':'';
  el.querySelector('[data-role]').textContent=p.id===self?'YOUR SEAT':humans.includes(p.id)?window.HoldEmRoom?.roster[p.id]?.nickname||'ONLINE PLAYER':s.mode==='online'?'HARD BOT':s.difficulty.toUpperCase()+' BOT';
  el.querySelector('[data-action]').textContent=(s.gameType==='blackjack'&&p.hands?.length?p.hands.map((h,i)=>(p.hands.length>1?'H'+(i+1)+': ':'')+Blackjack.total(h.cards).value).join(' / ')+' · ':'')+(p.bet?'BET '+currency(p.bet)+' · ':'')+(p.lastAction||'');el.querySelector('.he-avatar-fallback').textContent=p.name.slice(0,1);
 }
 stats.querySelector('[data-hud-hand]').textContent=s.hand?'#'+String(s.hand).padStart(3,'0'):'—';stats.querySelector('[data-hud-pot]').textContent=currency(s.pot);
 const bj=s.gameType==='blackjack';stats.children[1].querySelector('small').textContent=bj?'HOUSE':'BLINDS';stats.children[1].querySelector('b').textContent=bj?'PAYS 3:2':'$10 / $20';stats.children[2].querySelector('small').textContent=bj?'WAGERS':'POT';
 const phaseIndex=['preflop','flop','turn','river'].indexOf(s.phase),steps=document.querySelector('[data-street-steps]');
 if(steps)for(const el of steps.children){const i=Number(el.dataset.index);el.classList.toggle('current',i===phaseIndex);el.classList.toggle('done',i<phaseIndex||s.phase==='complete');el.classList.toggle('up-next',i===phaseIndex+1&&phaseIndex>=0)}
 const next=document.querySelector('[data-street-next]');if(next)next.textContent=s.phase==='complete'?'HAND COMPLETE':s.dealing?'DEALING HOLE CARDS':phaseIndex<0?'NEXT UP · PRE-FLOP':phaseIndex===3?'NEXT UP · SHOWDOWN':'NEXT UP · '+['PRE-FLOP','FLOP','TURN','RIVER'][phaseIndex+1];
 if(bj&&next)next.textContent=s.phase==='betting'?'NEXT UP · THE DEAL':s.phase==='playing'?'NEXT UP · DEALER REVEAL':'ROUND COMPLETE';
 queuePortraits();
}
function clock(s,seconds){
 if(!s)return;const active=!s.dealing&&s.phase!=='complete'&&s.phase!=='idle'&&seconds>0;
 for(const el of panels){const current=active&&Number(el.dataset.playerPanel)===s.actor;el.querySelector('.he-player-time').textContent=current?Math.ceil(seconds)+'s':'';el.classList.toggle('time-urgent',current&&seconds<=10);el.style.setProperty('--clock',current?(seconds/45*100)+'%':'0%')}
}
window.addEventListener('holdem:cast-looks',e=>{looks=e.detail||{};queuePortraits()});
window.addEventListener('holdem:room',()=>{if(window.HoldEmRoom?.ready){looks={...looks,...window.HoldEmRoom.botLooks};for(const [id,p]of Object.entries(window.HoldEmRoom.roster))looks[id]=p.look;queuePortraits()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedulePortrait()});
window.addEventListener('pagehide',()=>{if(window.cancelIdleCallback)cancelIdleCallback(portraitTimer);clearTimeout(portraitTimer);portraitTimer=null;portraitQueue=[]});
window.HoldEmHud={update,clock,attachControls(controls){drawer.appendChild(controls)}};
})();
