/* Exact-value visual chips. Money in flight belongs to neither pile until arrival. */
(function(root){
'use strict';
const denominations=[500,100,25,10,5,1];
function chips(value){
 let amount=Math.max(0,Math.round(value)),out=[];
 // A $2,000 buy-in reads as several usable stacks, rather than four chips.
 for(const d of denominations){const reserve=d===500?1000:d===100?200:0;const count=Math.max(0,Math.floor((amount-reserve)/d));for(let n=0;n<count;n++)out.push(d);amount-=count*d}
 while(amount>0){out.push(1);amount--}return out;
}
function create(){
 let stacks=[2000,2000,2000,2000],pot=0,flights=[],previous=null,clock=0,sequence=0,revision=0,houseSettling=false;
 function fly(value,from,to,delay=0){let offset=0;for(const denomination of chips(value)){flights.push({id:++sequence,value:denomination,from,to,start:clock+delay+offset,duration:.72});offset+=.035}}
 function sync(s){
  if(s.gameType==='blackjack'){
   if(previous&&s.session===previous.session&&s.hand===previous.hand&&s.phase===previous.phase&&s.players.every((p,i)=>p.stack===previous.players[i].stack)&&s.pot===previous.pot)return;
   for(const f of flights){if(f.to==='pot')pot+=f.value;else stacks[f.to]+=f.value}flights=[];
   if(!previous||s.session!==previous.session||s.hand!==previous.hand){stacks=s.players.map(p=>p.stack);pot=s.pot;houseSettling=false}
   else{const awards=s.phase==='complete'?s.payouts||[]:[];let incoming=0;s.players.forEach((p,i)=>{const before=p.stack-(awards.find(a=>a.id===i)?.amount||0),paid=Math.max(0,stacks[i]-before);stacks[i]=before;if(paid){incoming+=paid;fly(paid,i,'pot')}});if(s.phase==='complete'){houseSettling=true;const returns=awards.reduce((n,a)=>n+a.amount,0);pot=Math.max(0,returns-incoming);let delay=Math.max(.25,...flights.map(f=>f.start+f.duration-clock))+.25;for(const a of awards){fly(a.amount,'pot',a.id,delay);delay+=.12}if(!flights.length)pot=0}}
   previous=JSON.parse(JSON.stringify(s));revision++;return;
  }
  houseSettling=false;

  if(previous&&s.session===previous.session&&s.hand===previous.hand&&s.phase===previous.phase&&s.players.every((p,i)=>p.stack===previous.players[i].stack)&&s.pot===previous.pot)return;
  if(!previous||s.hand!==previous.hand||s.session!==previous.session){flights=[];stacks=s.players.map(p=>p.stack);pot=s.pot;revision++}
  else{
   // Settle an earlier bet before a subsequent authoritative action arrives.
   for(const f of flights){if(f.to==='pot')pot+=f.value;else stacks[f.to]+=f.value}flights=[];
   const awards=s.phase==='complete'?(s.payouts||[]):[];
   const totals=stacks.map((v,i)=>s.players[i].stack-(awards.find(a=>a.id===i)?.amount||0));
   totals.forEach((v,i)=>{const bet=Math.max(0,stacks[i]-v);stacks[i]=v;if(bet)fly(bet,i,'pot')});
   if(awards.length){
    // Final actions may themselves contribute chips before the payout.
    let delay=Math.max(.25,...flights.map(f=>f.start+f.duration-clock))+.20;for(const a of awards){fly(a.amount,'pot',a.id,delay);delay+=.12}
   }
   revision++;
  }
  previous=JSON.parse(JSON.stringify(s));
 }
 function update(dt){clock+=Math.min(dt,.1);let changed=false;flights=flights.filter(f=>{if(clock<f.start)return true;if(!f.departed){if(f.from==='pot')pot-=f.value;f.departed=true;changed=true;root.dispatchEvent?.(new CustomEvent('holdem:chip-sound',{detail:{kind:'slide',strength:f.from==='pot'?.9:.65}}))}if(clock>=f.start+f.duration){if(f.to==='pot')pot+=f.value;else stacks[f.to]+=f.value;changed=true;root.dispatchEvent?.(new CustomEvent('holdem:chip-sound',{detail:{kind:'land',strength:f.to==='pot'?.7:1}}));return false}return true});if(houseSettling&&!flights.length&&pot!==0){pot=0;changed=true}if(changed)revision++}
 return {sync,update,get stacks(){return stacks},get pot(){return pot},get flights(){return flights.filter(f=>f.departed)},get active(){return flights.length>0},get revision(){return revision},progress(f){return Math.max(0,Math.min(1,(clock-f.start)/f.duration))},get total(){return stacks.reduce((a,b)=>a+b,0)+pot+flights.reduce((a,f)=>a+(f.departed?f.value:f.from==='pot'?0:f.value),0)}};
}
root.HoldEmChips={chips,denominations,create};
})(typeof window!=='undefined'?window:globalThis);
