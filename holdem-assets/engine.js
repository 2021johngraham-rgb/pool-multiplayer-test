/* Hold Em: integer play-chip accounting and no-limit Texas Hold'em. */
(function(root){
'use strict';
const names=['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush'];
const ranks='23456789TJQKA',suits='cdhs';
function deck(){return Array.from({length:52},(_,i)=>({id:i,r:2+i%13,s:Math.floor(i/13)}))}
function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){let d=(a[i]||0)-(b[i]||0);if(d)return Math.sign(d)}return 0}
function five(cards){
 let rs=cards.map(c=>c.r).sort((a,b)=>b-a),counts=new Map();
 rs.forEach(r=>counts.set(r,(counts.get(r)||0)+1));
 let groups=[...counts].sort((a,b)=>b[1]-a[1]||b[0]-a[0]),unique=[...new Set(rs)],straight=0;
 if(unique.length===5){if(unique[0]-unique[4]===4)straight=unique[0];else if(unique.join(',')==='14,5,4,3,2')straight=5}
 let flush=cards.every(c=>c.s===cards[0].s);
 if(flush&&straight)return [8,straight];
 if(groups[0][1]===4)return [7,groups[0][0],groups[1][0]];
 if(groups[0][1]===3&&groups[1][1]===2)return [6,groups[0][0],groups[1][0]];
 if(flush)return [5,...rs];
 if(straight)return [4,straight];
 if(groups[0][1]===3)return [3,groups[0][0],...groups.slice(1).map(g=>g[0])];
 if(groups[0][1]===2&&groups[1][1]===2)return [2,Math.max(groups[0][0],groups[1][0]),Math.min(groups[0][0],groups[1][0]),groups[2][0]];
 if(groups[0][1]===2)return [1,groups[0][0],...groups.slice(1).map(g=>g[0])];
 return [0,...rs];
}
function evaluate(cards){
 let best=null,chosen=[];
 for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){
  let hand=[cards[a],cards[b],cards[c],cards[d],cards[e]],rank=five(hand);
  if(!best||compare(rank,best)>0){best=rank;chosen=hand}
 }
 return {rank:best||[0,...cards.map(c=>c.r).sort((a,b)=>b-a)],cards:chosen,name:best?names[best[0]]:'High card'};
}
function shuffle(cards,rng){for(let i=cards.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}return cards}
let entropy=new Uint32Array(256),entropyAt=256;function secureRandom(){if(!root.crypto?.getRandomValues)return Math.random();if(entropyAt>=entropy.length){root.crypto.getRandomValues(entropy);entropyAt=0}return entropy[entropyAt++]/4294967296}
class Game{
 constructor(rng=secureRandom,options={}){this.rng=rng;this.options=options;this.reset()}
 reset(){const names=this.options.names||['Vince','Bruno','Miles','Gus'];this.startingStack=this.options.startingStack||2000;this.bankroll=names.length*this.startingStack;this.players=names.map((name,id)=>({id,name,stack:this.startingStack,hole:[],bet:0,total:0,inHand:false,folded:false,actedAt:null,lastAction:''}));this.small=10;this.big=20;this.dealer=-1;this.hand=0;this.phase='idle';this.actor=-1;this.board=[];this.pending=new Set();this.history=[];this.payouts=[];this.pots=[];this.notice='A seat at the table is waiting.';this.currentBet=0;this.lastRaise=20}
 live(){return this.players.filter(p=>p.inHand&&!p.folded)}
 actors(){return this.live().filter(p=>p.stack>0)}
 next(id,predicate){for(let n=1;n<=this.players.length;n++){let i=(id+n+this.players.length)%this.players.length;if(predicate(this.players[i]))return i}return -1}
 log(s){this.notice=s;this.history.unshift(s);this.history.length=Math.min(this.history.length,30)}
 pay(p,n){n=Math.max(0,Math.min(p.stack,Math.floor(n)));p.stack-=n;p.bet+=n;p.total+=n;return n}
 start(){
  if(!['idle','complete'].includes(this.phase))return false;
  if(this.players.filter(p=>p.stack>0).length<2)return false;
  this.hand++;this.phase='preflop';this.board=[];this.payouts=[];this.pots=[];this.showdown=false;this.history=[];
  for(let p of this.players){p.inHand=p.stack>0;p.folded=!p.inHand;p.hole=[];p.bet=0;p.total=0;p.actedAt=null;p.lastAction=p.inHand?'':'Out';p.result=null}
  this.dealer=this.next(this.dealer,p=>p.inHand);this.cards=shuffle(deck(),this.rng);
  for(let round=0;round<2;round++){let id=this.dealer;for(let n=0;n<this.live().length;n++){id=this.next(id,p=>p.inHand);this.players[id].hole.push(this.cards.pop())}}
  let heads=this.live().length===2;this.sb=heads?this.dealer:this.next(this.dealer,p=>p.inHand);this.bb=this.next(this.sb,p=>p.inHand);
  this.pay(this.players[this.sb],this.small);this.pay(this.players[this.bb],this.big);
  this.players[this.sb].lastAction='Small blind';this.players[this.bb].lastAction='Big blind';
  this.currentBet=this.big;this.lastRaise=this.big;this.pending=new Set(this.actors().map(p=>p.id));
  this.log('Hand '+this.hand+' · blinds '+this.small+' / '+this.big);this.advance(this.bb);return true;
 }
 legal(id=this.actor){
  let p=this.players[id];if(!p||id!==this.actor||!this.pending.has(id)||this.phase==='complete')return null;
  let call=Math.max(0,this.currentBet-p.bet),max=p.bet+p.stack,min=this.currentBet+this.lastRaise;
  let reopened=p.actedAt===null||this.currentBet-p.actedAt>=this.lastRaise||(p.actedAt===0&&p.lastAction==='Check'&&this.currentBet>0);
  return {call:Math.min(call,p.stack),toCall:call,check:call===0,minRaise:min,maxRaise:max,canRaise:reopened&&max>this.currentBet&&this.actors().some(q=>q.id!==id),shortAllIn:max<min};
 }
 act(kind,target){
  let id=this.actor,p=this.players[id],legal=this.legal();if(!legal)return false;
  if(kind==='fold'){p.folded=true;p.lastAction='Fold';this.log(p.name+' folds')}
  else if(kind==='call'||kind==='check'){
   if(kind==='check'&&!legal.check)return false;
   let chips=this.pay(p,legal.call);p.lastAction=chips?(p.stack?'Call '+chips:'All in '+chips):'Check';this.log(p.name+' '+(chips?(p.stack?'calls ':'is all in for ')+chips:'checks'));
  }else if(kind==='raise'){
   target=Math.floor(Number(target));
   if(!legal.canRaise||!Number.isFinite(target)||target<=this.currentBet||target>legal.maxRaise||(target<legal.minRaise&&target!==legal.maxRaise))return false;
   let old=this.currentBet,increase=target-old;this.pay(p,target-p.bet);this.currentBet=target;
   if(increase>=this.lastRaise)this.lastRaise=increase;
   for(let q of this.actors())if(q.id!==id&&q.bet<this.currentBet)this.pending.add(q.id);
   p.lastAction=(p.stack?'Raise to ':'All in ')+target;this.log(p.name+' '+(p.stack?(old?'raises to ':'bets '):'is all in for ')+target);
  }else return false;
  p.actedAt=this.currentBet;this.pending.delete(id);this.advance(id);return true;
 }
 advance(from){
  if(this.live().length===1){this.finish(false);return}
  for(let id of [...this.pending]){let p=this.players[id];if(p.folded||!p.inHand||p.stack===0)this.pending.delete(id)}
  let actors=this.actors();
  if(actors.length<=1){
   if(!actors.length||actors[0].bet>=Math.max(...this.live().map(p=>p.bet))){this.runout();return}
   this.pending=new Set([actors[0].id]);
  }
  if(!this.pending.size){this.street();return}
  this.actor=this.next(from,p=>this.pending.has(p.id));
 }
 dealStreet(){
  this.cards.pop(); // Burn one card before each community deal.
  if(!this.board.length){this.board.push(this.cards.pop(),this.cards.pop(),this.cards.pop());this.phase='flop'}
  else{this.board.push(this.cards.pop());this.phase=this.board.length===4?'turn':'river'}
 }
 street(){
  if(this.board.length===5){this.finish(true);return}
  this.dealStreet();this.currentBet=0;this.lastRaise=this.big;
  for(let p of this.players){p.bet=0;p.actedAt=null;if(p.inHand&&!p.folded)p.lastAction=p.stack?'':'All in'}
  this.pending=new Set(this.actors().map(p=>p.id));this.log(this.phase.toUpperCase()+' · new betting round');
  if(this.actors().length<=1){this.runout();return}
  this.actor=this.next(this.dealer,p=>this.pending.has(p.id));
 }
 runout(){while(this.board.length<5)this.dealStreet();this.finish(true)}
 finish(showdown){
  this.showdown=showdown;this.phase='complete';this.actor=-1;this.pending.clear();
  let live=this.live(),wins=new Map();this.pots=[];
  if(!showdown){let amount=this.players.reduce((s,p)=>s+p.total,0);wins.set(live[0].id,amount);this.pots.push({amount,winners:[live[0].id]})}
  else{
   for(let p of live)p.result=evaluate([...p.hole,...this.board]);
   let levels=[...new Set(this.players.map(p=>p.total).filter(Boolean))].sort((a,b)=>a-b),previous=0;
   for(let level of levels){
    let contributors=this.players.filter(p=>p.total>=level),amount=(level-previous)*contributors.length;previous=level;
    if(contributors.length===1){let id=contributors[0].id;wins.set(id,(wins.get(id)||0)+amount);this.pots.push({amount,winners:[id],refund:true});continue}
    let eligible=contributors.filter(p=>!p.folded),best=eligible[0].result.rank;
    for(let p of eligible)if(compare(p.result.rank,best)>0)best=p.result.rank;
    let winners=eligible.filter(p=>compare(p.result.rank,best)===0).map(p=>p.id);
    const count=this.players.length;winners.sort((a,b)=>((a-this.dealer-1+count)%count)-((b-this.dealer-1+count)%count));
    let share=Math.floor(amount/winners.length),odd=amount%winners.length;
    winners.forEach((id,i)=>wins.set(id,(wins.get(id)||0)+share+(i<odd?1:0)));this.pots.push({amount,winners});
   }
  }
  this.payouts=[...wins].map(([id,amount])=>({id,amount}));for(let w of this.payouts)this.players[w.id].stack+=w.amount;
  let paid=this.payouts.filter(w=>this.pots.some(p=>!p.refund&&p.winners.includes(w.id)));
  this.log(paid.map(w=>this.players[w.id].name+' wins '+w.amount+(this.players[w.id].result?' · '+this.players[w.id].result.name:'')).join(' / '));
 }
 pot(){return this.players.reduce((n,p)=>n+p.total,0)}
 bot(){
  let p=this.players[this.actor],l=this.legal();if(!p||!l)return null;
  let strength;
  if(!this.board.length){
   let [a,b]=p.hole.map(c=>c.r).sort((a,b)=>b-a);
   strength=.14+(a+b-4)/45+(a===b?.23:0)+(p.hole[0].s===p.hole[1].s?.045:0)+(a-b<=2?.035:0);strength=Math.min(.90,strength);
  }else{
   // Estimate with only this bot's private cards and the visible board.
   let known=new Set([...p.hole,...this.board].map(c=>c.id)),unknown=deck().filter(c=>!known.has(c.id)),score=0,trials=this.options.difficulty==='hard'?36:this.options.difficulty==='easy'?8:22,opponents=this.live().length-1;
   for(let k=0;k<trials;k++){
    let d=shuffle(unknown.slice(),this.rng),board=this.board.slice();while(board.length<5)board.push(d.pop());
    let own=evaluate([...p.hole,...board]).rank,tie=1,lost=false;
    for(let n=0;n<opponents;n++){let rival=evaluate([d.pop(),d.pop(),...board]).rank,c=compare(rival,own);if(c>0){lost=true;break}if(c===0)tie++}
    if(!lost)score+=1/tie;
   }strength=score/trials;
  }
  const level=this.options.difficulty||'medium';strength=Math.max(.02,Math.min(.98,strength+(this.rng()-.5)*(level==='easy'?.46:level==='hard'?.06:.18)));
  let price=l.call/(this.pot()+l.call||1),random=this.rng(),aggression=[.06,.08,.20,.13][p.id]||.10;
  if(l.canRaise&&((strength>.72&&random<.50+aggression)||(l.check&&random<.055+aggression*.2))){
   let target=Math.min(l.maxRaise,Math.max(l.minRaise,this.currentBet+Math.round(Math.max(this.big,this.pot()*(.4+this.rng()*.3))/10)*10));
   return {kind:'raise',target};
  }
  if(l.check)return {kind:'check'};
  if(strength>price+.10||random<.10||l.call<=this.big&&strength>.34)return {kind:'call'};
  return {kind:'fold'};
 }
}
root.HoldEm={Game,evaluate,compare,deck,ranks,suits,names};
})(typeof window!=='undefined'?window:globalThis);
