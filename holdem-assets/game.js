(function(){
'use strict';
const $=id=>document.getElementById(id),game=new HoldEm.Game(),suit=['♣','♦','♥','♠'],rank=r=>r<11?String(r):({11:'J',12:'Q',13:'K',14:'A'})[r];
const tableDesign=new URLSearchParams(location.search).get('mode')!=='play';
document.body.classList.toggle('tableDesign',tableDesign);
if(tableDesign){$('welcome').classList.add('hidden');document.querySelector('.table-caption').textContent='TABLE DESIGN PREVIEW'}
let started=false,botTimer=null,raiseAmount=40,turnKey='',runningAction=false;
function chips(n){return n.toLocaleString('en-US')}
function card(c,back=false,winning=false,index=0){
 if(back)return '<span class="card back" aria-label="Face-down card"></span>';
 if(!c)return '<span class="card empty" aria-label="Undealt community card"></span>';
 return '<span class="card '+(c.s===1||c.s===2?'red ':'')+(winning?'winning':'')+'" style="animation-delay:'+(index*.04)+'s" aria-label="'+rank(c.r)+' of '+['clubs','diamonds','hearts','spades'][c.s]+'"><span class="corner">'+rank(c.r)+'</span><span class="pip">'+suit[c.s]+'</span></span>';
}
function render(){
 if(tableDesign){$('seats').replaceChildren();return}
 $('handNumber').textContent=game.hand||'—';$('pot').textContent=chips(game.pot());
 $('street').textContent=game.phase==='idle'?"TEXAS HOLD'EM":game.phase==='complete'?(game.showdown?'SHOWDOWN':'HAND COMPLETE'):game.phase==='preflop'?'PRE-FLOP':game.phase.toUpperCase();
 let winners=new Set(game.pots.filter(p=>!p.refund).flatMap(p=>p.winners)),winningCards=new Set();
 for(let id of winners){let result=game.players[id].result;if(result)result.cards.forEach(c=>winningCards.add(c.id))}
 let boardMarkup=Array.from({length:5},(_,i)=>card(game.board[i],false,winningCards.has(game.board[i]?.id),i)).join('');if($('board').innerHTML!==boardMarkup)$('board').innerHTML=boardMarkup;
 $('seats').innerHTML=game.players.map(p=>{
  let reveal=p.id===0||(game.phase==='complete'&&game.showdown&&!p.folded),action=p.lastAction,bet=p.bet;
  if(game.phase==='complete'&&p.result)action=p.result.name;
  if(game.phase==='idle')action=p.id===0?'YOUR SEAT':'BOT';
  let holes=p.hole.length?p.hole:[null,null];
  return '<section class="seat '+(p.folded&&p.inHand?'folded ':'')+(!p.stack&&!p.inHand?'out ':'')+(p.id===game.actor?'active ':'')+(winners.has(p.id)?'winner':'')+'" data-seat="'+p.id+'" aria-label="'+p.name+', '+chips(p.stack)+' chips"><div class="seat-cards">'+holes.map((c,i)=>card(c,!reveal||!c,winningCards.has(c?.id)&&winners.has(p.id),i)).join('')+'</div><div class="seat-label"><div class="seat-name">'+p.name+(p.id===0?' · YOU':'')+'</div><div class="seat-stack">'+chips(p.stack)+'</div>'+(p.id===game.dealer?'<span class="dealer" title="Dealer button">D</span>':'')+'</div><div class="seat-action">'+action+'</div>'+(bet&&game.phase!=='complete'?'<div class="bet"><span class="chip"></span>'+chips(bet)+'</div>':'')+'</section>';
 }).join('');
 $('history').innerHTML=game.history.map(s=>'<li>'+s+'</li>').join('');
 let done=game.phase==='complete',yourTurn=started&&game.actor===0&&!done;
 $('betting').classList.toggle('hidden',!yourTurn);$('result').classList.toggle('hidden',!done);$('waiting').classList.toggle('hidden',yourTurn||done);
 if(done){
  $('notice').textContent=game.notice;
  let won=game.players[0].stack===6000,bust=game.players[0].stack===0;
  $('resultNote').textContent=won?'You won the table. All 6,000 chips are yours.':bust?'Your stack is empty. Start a fresh table with 1,000 chips.':game.pots.length>1?game.pots.map((p,i)=>(p.refund?'Uncalled chips returned':i?'Side pot '+i:'Main pot')+': '+chips(p.amount)+' → '+p.winners.map(id=>game.players[id].name).join(' & ')).join(' · '):game.showdown?'Best five cards decide the hand. Gold outlines show the winning combination.':'Everyone else folded. The remaining player takes the pot.';
  $('nextHand').textContent=won||bust?'New table →':'Next hand →';
 }else if(yourTurn){
  let l=game.legal(),key=game.hand+'|'+game.phase+'|'+game.currentBet+'|'+game.players[0].stack;
  if(key!==turnKey){raiseAmount=Math.min(l.maxRaise,l.minRaise);turnKey=key}
  $('notice').textContent=l.check?'Your turn · Check or make a bet.':'Your turn · '+chips(l.call)+' to call'+(l.call<l.toCall?' (all in)':'')+'.';
  $('call').textContent=l.check?'Check':l.call===game.players[0].stack?'Call all in '+chips(l.call):'Call '+chips(l.call);
  let min=Math.min(l.minRaise,l.maxRaise);raiseAmount=Math.min(l.maxRaise,Math.max(min,raiseAmount));
  $('raiseSlider').min=String(min);$('raiseSlider').max=String(l.maxRaise);$('raiseSlider').value=String(raiseAmount);
  $('raiseLabel').textContent=game.currentBet?'RAISE TO':'BET';updateRaiseLabel();
  for(let id of ['raiseSlider','raise','minBet','halfPot','potBet','allIn'])$(id).disabled=!l.canRaise;
 }else{
  $('notice').textContent=game.notice;
  $('waiting').textContent=started&&game.actor>=0?game.players[game.actor].name+' is thinking…':'Five opponents. One table. Make your move.';
 }
}
function updateRaiseLabel(){ $('raiseValue').textContent=chips(raiseAmount);$('raise').textContent=(raiseAmount===game.players[0].bet+game.players[0].stack?'All in ':game.currentBet?'Raise to ':'Bet ')+chips(raiseAmount)}
function setRaise(n){let l=game.legal(0);if(!l?.canRaise)return;raiseAmount=Math.round(Math.min(l.maxRaise,Math.max(Math.min(l.minRaise,l.maxRaise),n)));$('raiseSlider').value=String(raiseAmount);updateRaiseLabel()}
function act(kind){
 if(!started||game.actor!==0||runningAction||!$('rules').classList.contains('hidden'))return;
 runningAction=true;let ok=game.act(kind,raiseAmount);runningAction=false;
 if(ok){render();scheduleBot()}
}
function scheduleBot(){
 clearTimeout(botTimer);botTimer=null;
 if(tableDesign||!started||game.phase==='complete'||game.actor<=0||document.hidden||!$('rules').classList.contains('hidden'))return;
 botTimer=setTimeout(()=>{botTimer=null;if(document.hidden)return;let choice=game.bot();if(choice)game.act(choice.kind,choice.target);render();scheduleBot()},750+Math.random()*600);
}
function nextHand(){
 clearTimeout(botTimer);
 if(game.players[0].stack===0||game.players.filter(p=>p.stack>0).length<2)game.reset();
 turnKey='';game.start();render();scheduleBot();
}
$('startGame').onclick=()=>{if(tableDesign)return;started=true;$('welcome').classList.add('hidden');nextHand()};
$('nextHand').onclick=nextHand;$('fold').onclick=()=>act('fold');$('call').onclick=()=>act('call');$('raise').onclick=()=>act('raise');
$('raiseSlider').oninput=e=>setRaise(Number(e.target.value));
$('minBet').onclick=()=>setRaise(game.legal()?.minRaise||20);
$('halfPot').onclick=()=>setRaise(game.currentBet+Math.round((game.pot()+(game.legal()?.call||0))*.5));
$('potBet').onclick=()=>setRaise(game.currentBet+game.pot()+(game.legal()?.call||0));
$('allIn').onclick=()=>setRaise(game.players[0].bet+game.players[0].stack);
function showRules(){clearTimeout(botTimer);$('rules').classList.remove('hidden');$('closeRules').focus()}
$('rulesButton').onclick=showRules;$('welcomeRules').onclick=showRules;$('closeRules').onclick=()=>{$('rules').classList.add('hidden');scheduleBot()};
addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('rules').classList.contains('hidden'))$('closeRules').click()});
$('exitGame').onclick=()=>{clearTimeout(botTimer);if(parent!==window)parent.postMessage({type:'hold-em:exit'},'*');else location.href='index.html'};
addEventListener('pagehide',()=>clearTimeout(botTimer));
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(botTimer);else scheduleBot()});
render();if(parent!==window)parent.postMessage({type:'hold-em:ready'},'*');
})();
