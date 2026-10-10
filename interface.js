/* Compact table controls reuse the live game controls and state; no duplicate game logic. */
(()=>{
 'use strict';
 const dock=document.querySelector('.action-dock');if(!dock)return;
 const phone=matchMedia('(max-width:700px), (pointer:coarse) and (max-width:1100px)');
 const table=document.createElement('button');table.type='button';table.className='ui-table-toggle ui-mobile-only';table.textContent='Table';table.setAttribute('aria-label','Show players and hand history');table.setAttribute('aria-expanded','false');
 const stack=document.createElement('div');stack.className='ui-self-stack ui-mobile-only';stack.innerHTML='<span>Your stack</span><strong>$2,000</strong>';
 document.body.append(table,stack);
 function closeTable(){document.body.classList.remove('ui-table-open');table.setAttribute('aria-expanded','false');table.textContent='Table'}
 table.onclick=()=>{const open=document.body.classList.toggle('ui-table-open');table.setAttribute('aria-expanded',String(open));table.textContent=open?'Close table':'Table';closeBet()};
 const amount=document.querySelector('.raise-control'),raise=document.getElementById('raise');
 let previousTurn='',lastFocus=null;
 function closeBet(){document.body.classList.remove('ui-bet-open');if(raise)raise.setAttribute('aria-expanded','false')}
 if(amount&&raise){
  amount.id='mobileRaisePanel';raise.setAttribute('aria-controls',amount.id);raise.setAttribute('aria-expanded','false');
  const head=document.createElement('div');head.className='ui-bet-heading';head.innerHTML='<strong>Choose raise total</strong><button type="button" aria-label="Close bet amount">×</button>';amount.prepend(head);
  head.querySelector('button').onclick=()=>{closeBet();raise.focus()};
  const confirm=document.createElement('button');confirm.type='button';confirm.className='ui-confirm-bet';confirm.textContent='Confirm raise';amount.append(confirm);let committing=false;
  confirm.onclick=()=>{if(raise.disabled)return;committing=true;raise.click();committing=false;closeBet();raise.focus()};
  raise.addEventListener('click',e=>{if(!phone.matches||committing)return;e.preventDefault();e.stopImmediatePropagation();if(raise.disabled)return;const open=document.body.classList.toggle('ui-bet-open');raise.setAttribute('aria-expanded',String(open));if(open){closeTable();lastFocus=raise;confirm.focus()}},true);
 }
 function state(s){if(!s)return;const self=window.TablePoker?.self??s.self,p=s.players?.find(p=>p.id===self);stack.querySelector('strong').textContent='$'+Number(p?.stack||0).toLocaleString('en-US');const turn=[s.hand,s.phase,s.actor,s.dealing].join('/');if(turn!==previousTurn){closeBet();previousTurn=turn}if(!window.TablePoker?.live){closeBet();closeTable()}}
 addEventListener('holdem:state',e=>state(e.detail));state(window.TablePoker?.snapshot);
 const size=new ResizeObserver(()=>document.documentElement.style.setProperty('--cards-dock',Math.ceil(dock.getBoundingClientRect().height)+'px'));size.observe(dock);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const had=document.body.classList.contains('ui-bet-open');closeTable();closeBet();if(had)lastFocus?.focus()}});
 document.addEventListener('pointerdown',e=>{if(!table.contains(e.target)&&!e.target.closest('.he-edge-hud,.log-wrap'))closeTable();if(!e.target.closest('.raise-control,#raise'))closeBet()});
 phone.addEventListener('change',()=>{closeBet();closeTable()});addEventListener('pagehide',()=>size.disconnect());addEventListener('pageshow',()=>size.observe(dock));
})();
