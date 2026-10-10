/* Four shared character seats against the house. Play chips only. */
(function(root){
'use strict';
function total(cards){let value=0,aces=0;for(const c of cards){if(c.r===14){value+=11;aces++}else value+=Math.min(10,c.r)}while(value>21&&aces){value-=10;aces--}return{value,soft:aces>0,natural:cards.length===2&&value===21}}
function random(){const v=new Uint32Array(1);root.crypto.getRandomValues(v);return v[0]/4294967296}
class Game{
 constructor(rng=random,options={}){this.rng=rng;this.options=options;this.reset()}
 reset(){this.players=['Vince','Bruno','Miles','Gus'].map((name,id)=>({id,name,stack:2000,hole:[],hands:[],activeHand:0,bet:0,total:0,inHand:false,folded:false,lastAction:''}));this.bankroll=8000;this.hand=0;this.phase='idle';this.actor=-1;this.dealer=-1;this.board=[];this.dealerCards=[];this.payouts=[];this.pots=[];this.notice='Choose a wager. Beat the dealer without going over 21.';this.showdown=false}
 pot(){return this.players.reduce((n,p)=>n+p.total,0)}
 start(){if(!['idle','complete'].includes(this.phase)||!this.players.some(p=>p.stack>=10))return false;this.hand++;this.phase='betting';this.board=[];this.dealerCards=[];this.payouts=[];this.pots=[];this.showdown=false;this.cards=Array.from({length:6},(_,pack)=>HoldEm.deck().map(c=>({...c,id:c.id+pack*52}))).flat();for(let i=this.cards.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[this.cards[i],this.cards[j]]=[this.cards[j],this.cards[i]]}for(const p of this.players){Object.assign(p,{hole:[],hands:[],activeHand:0,bet:0,total:0,inHand:p.stack>=10,folded:false,lastAction:p.stack>=10?'Choose wager':'Out',result:null,wagerPlaced:false})}this.actor=this.players.findIndex(p=>p.inHand);this.notice='Place your wager — $10 minimum. Blackjack pays 3:2.';return this.actor>=0}
 pay(p,n){p.stack-=n;p.bet+=n;p.total+=n}
 legal(id=this.actor){if(id!==this.actor||id<0||!['betting','playing'].includes(this.phase))return null;const p=this.players[id];if(this.phase==='betting')return{minBet:10,maxBet:Math.min(500,Math.floor(p.stack/10)*10)};const h=p.hands[p.activeHand],first=h.cards.length===2&&!h.done;return{hit:!h.done,stand:!h.done,double:first&&p.stack>=h.wager&&!h.splitAces,split:first&&p.hands.length<2&&p.stack>=h.wager&&(h.cards[0].r===14?11:Math.min(10,h.cards[0].r))===(h.cards[1].r===14?11:Math.min(10,h.cards[1].r))}}
 view(p){p.hole=p.hands.flatMap(h=>h.cards);p.handTotals=p.hands.map(h=>total(h.cards).value)}
 deal(){this.phase='playing';for(const p of this.players)if(p.inHand)p.hands=[{cards:[],wager:p.total,done:false,split:false,outcome:''}];for(let round=0;round<2;round++){for(const p of this.players)if(p.inHand)p.hands[0].cards.push(this.cards.pop());this.dealerCards.push(this.cards.pop())}for(const p of this.players)if(p.inHand){p.hands[0].done=total(p.hands[0].cards).natural;p.lastAction=p.hands[0].done?'Blackjack':'Playing';this.view(p)}this.actor=this.players.findIndex(p=>p.inHand&&!p.hands[0].done);this.notice='Hit, stand, double, or split a pair. Dealer stands on all 17s.';if(total(this.dealerCards).natural||this.actor<0)this.settle()}
 advance(){const p=this.players[this.actor];this.view(p);const next=p.hands.findIndex(h=>!h.done);if(next>=0){p.activeHand=next;return}const seat=this.players.findIndex(q=>q.id>p.id&&q.inHand&&q.hands.some(h=>!h.done));if(seat>=0){this.actor=seat;return}this.settle()}
 act(kind,target){const l=this.legal();if(!l)return false;const p=this.players[this.actor];if(this.phase==='betting'){if(kind!=='wager'||!Number.isFinite(target)||target%10||target<l.minBet||target>l.maxBet)return false;this.pay(p,target);p.wagerPlaced=true;p.lastAction='Wager $'+target;const next=this.players.findIndex(q=>q.inHand&&!q.wagerPlaced);if(next>=0)this.actor=next;else this.deal();return true}
  const h=p.hands[p.activeHand];if(!l[kind])return false;
  if(kind==='hit'){h.cards.push(this.cards.pop());const t=total(h.cards).value;h.done=t>=21;p.lastAction=t>21?'Bust':t===21?'21':'Hit'}
  if(kind==='stand'){h.done=true;p.lastAction='Stand'}
  if(kind==='double'){this.pay(p,h.wager);h.wager*=2;h.cards.push(this.cards.pop());h.done=true;p.lastAction=total(h.cards).value>21?'Double · bust':'Double down'}
  if(kind==='split'){this.pay(p,h.wager);const c=h.cards.pop(),aces=c.r===14;h.split=true;h.splitAces=aces;h.cards.push(this.cards.pop());const other={cards:[c,this.cards.pop()],wager:h.wager,done:false,split:true,splitAces:aces,outcome:''};p.hands.push(other);h.done=aces||total(h.cards).value>=21;other.done=aces||total(other.cards).value>=21;p.lastAction='Split pair'}
  this.advance();return true;
 }
 settle(){this.phase='complete';this.actor=-1;this.showdown=true;const dealerNatural=total(this.dealerCards).natural;if(!dealerNatural)while(total(this.dealerCards).value<17)this.dealerCards.push(this.cards.pop());const d=total(this.dealerCards).value;this.payouts=[];this.pots=[];for(const p of this.players){let returned=0;for(const h of p.hands){const t=total(h.cards);let paid=0;if(t.value>21)h.outcome='Bust';else if(t.natural&&!h.split&&!dealerNatural){paid=h.wager*2.5;h.outcome='Blackjack'}else if(dealerNatural&&!(t.natural&&!h.split)){h.outcome='Lose'}else if(d>21||t.value>d){paid=h.wager*2;h.outcome='Win'}else if(t.value===d){paid=h.wager;h.outcome='Push'}else h.outcome='Lose';h.payout=paid;returned+=paid;h.done=true}if(returned){p.stack+=returned;this.payouts.push({id:p.id,amount:returned})}p.lastAction=p.hands.map(h=>h.outcome).join(' / ');p.result={name:p.lastAction};this.view(p)}this.notice='Dealer '+(d>21?'busts with '+d:dealerNatural?'has Blackjack':'stands on '+d)+'. '+this.players.filter(p=>p.inHand).map(p=>p.name+': '+p.lastAction).join(' · ')}
 bot(){const p=this.players[this.actor],l=this.legal();if(!l)return null;if(this.phase==='betting')return{kind:'wager',target:Math.min(l.maxBet,50)};const h=p.hands[p.activeHand],t=total(h.cards),up=this.dealerCards[0].r===14?11:Math.min(10,this.dealerCards[0].r),pair=h.cards.length===2?h.cards[0].r:0;
  if(this.options.difficulty==='easy'&&this.rng()<.18)return{kind:t.value<12?'hit':'stand'};
  if(l.split&&(pair===14||pair===8||(pair===9&&up!==7&&up<10)||(pair===7&&up<=7)))return{kind:'split'};
  if(l.double&&((!t.soft&&(t.value===11&&up!==11||t.value===10&&up<10||t.value===9&&up>=3&&up<=6))||(t.soft&&t.value>=16&&t.value<=18&&up>=3&&up<=6)))return{kind:'double'};
  if(this.options.difficulty==='medium'&&this.rng()<.08)return{kind:t.value<17?'hit':'stand'};
  return{kind:t.soft?(t.value<=17||t.value===18&&up>=9?'hit':'stand'):t.value>=17||t.value>=13&&up<=6||t.value===12&&up>=4&&up<=6?'stand':'hit'};
 }
}
root.Blackjack={Game,total};
})(typeof window!=='undefined'?window:globalThis);
