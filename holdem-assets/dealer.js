/* Shared dealer commentary, sequential dealing, and winner announcements. */
(function(){
'use strict';
let clock=0,hand=0,first=false,token='',enabled=false,started=false,players=[],finished=false,introLine='',caption='',captionUntil=0,lineAt=0,spoken=false,resultKey='',kind='deal',blackjack=false,houseCount=2;
const label=document.createElement('div');label.className='dealer-caption';label.hidden=true;label.setAttribute('role','status');document.body.appendChild(label);
const welcome=[
 "Well now. Welcome to Hold Em. Two thousand chips apiece. Do try to leave with your dignity.",
 "Pull up a chair, friends. The cards are honest. The gentlemen holding them? We shall see.",
 "Welcome to my table. Fortune favors the patient. And occasionally the fellow with absolutely no sense.",
 "Evening, ladies and gentlemen. Let us keep the manners fine, and the bluffs finer.",
 "Settle in, friends. A little courage, a little cunning. That is a respectable start."
];
const nextLines=[
 "Fresh cards, friends. Let us see who has learned a little restraint.",
 "Another hand. Keep your wits close, and your chips a shade closer.",
 "Well now. New cards, same charming company. Let us deal.",
 "A clean slate, gentlemen. Your previous mistakes are our little secret.",
 "Cards coming round. No hurry. A fine bluff deserves a proper entrance."
];
const jokes=[
 "A rather elegant bit of larceny, if you ask me.",
 "Those chips appear to have found a more agreeable home.",
 "A fine hand. Modesty is optional. Good manners are not.",
 "Well played. Even fortune appreciates a little style.",
 "A gentleman knows when to call. And when to look terribly pleased.",
 "Now that was a respectable evening's work."
];
const pick=(array,key)=>array[Math.abs(key)%array.length],seat=[-.90,-1.35,Math.atan2(.90,1.35)],deck=()=>HoldEmSeating.point(seat,.31,.43,.81);
function say(text,seconds,voiceKey=''){caption=text;lineAt=clock;captionUntil=clock+(seconds||Math.max(4,Math.min(14,text.split(/\s+/).length/2.15)));label.textContent='DEALER · '+text;label.hidden=false;spoken=!!window.HoldEmAudio?.speak(text)}
function start(number,roster,intro=true,elapsed=0,id=String(number),button=-1,line=''){
 kind='deal';blackjack=window.TablePoker?.gameType==='blackjack';hand=number;token=id;clock=elapsed;first=intro;introLine=line||pick(first?welcome:nextLines,number+Math.floor(Math.random()*1000));players=[];
 for(let i=1;i<=roster.length;i++){const p=roster[(button+i+roster.length)%roster.length];if(p.inHand)players.push(p.id)}enabled=true;finished=false;started=false;caption='';if(elapsed<.3)say(introLine,undefined,first?'welcome':'deal');else{caption=introLine;captionUntil=first?introDuration():.8;label.textContent='DEALER · '+caption;label.hidden=false}
}
function introDuration(){return first?Math.max(5,Math.min(8,introLine.split(/\s+/).length/3+.6)):.65}
function step(){return blackjack?.62:.32}
function duration(){return kind==='reveal'?1.3+Math.max(0,houseCount-2)*.85+.6:introDuration()+(players.length+(blackjack?1:0))*step()*2+.85}
function reveal(number,id,count=2,elapsed=0){hand=number;kind='reveal';blackjack=true;token=id+'/reveal';houseCount=count;clock=elapsed;enabled=true;finished=false;started=true;caption='';say('Let us see what the house has tucked away.',duration())}
function update(dt){clock+=Math.min(dt,.1);if(enabled){started=kind==='reveal'||clock>=introDuration();if(kind!=='reveal'&&started&&clock>captionUntil){caption='Dealing hand '+hand+'. May fortune find you well.';captionUntil=duration();label.textContent='DEALER · '+caption}if(clock>=duration()){enabled=false;if(!finished){finished=true;window.TablePoker?.dealReady()}}}label.hidden=clock>captionUntil||!caption}
function card(rig){
 if(rig?.part==='house-card'){
  if(kind==='reveal'&&enabled){
   if(rig.index===1){const t=Math.max(0,Math.min(1,(clock-.25)/.85));if(rig.face===(t<.5))return false;const angle=Math.PI*(1-t),normal=[Math.sin(angle),Math.cos(angle),0],dst=rig.center.map((v,i)=>v+(i===1?Math.sin(t*Math.PI)*.12:0));return HoldEmProps.transform(rig.center,dst,[0,1,0],normal)}
   if(rig.face===false)return false;
   if(rig.index>=2){const at=1.3+(rig.index-2)*.85;if(clock<at)return false;const t=Math.min(1,(clock-at)/.65),e=t*t*(3-2*t),src=deck(),dst=rig.center.map((v,i)=>src[i]+(v-src[i])*e+(i===1?Math.sin(t*Math.PI)*.15:0));return HoldEmProps.transform(rig.center,dst,[0,1,0],[0,1,0])}
   return null;
  }
  if(kind==='deal'&&enabled&&rig.index===1&&window.TablePoker.snapshot.phase==='complete'){if(rig.face)return false}else if(rig.face===false)return false;if(rig.index>=2&&enabled)return false;
  if(!enabled)return null;
 }
 if(!enabled||kind==='reveal'||!['hole-card','house-card'].includes(rig?.part))return null;
 const index=rig.part==='house-card'?players.length:players.indexOf(rig.seat);if(index<0)return false;
 if(rig.index>1)return null;
 const at=introDuration()+(rig.index*(players.length+(blackjack?1:0))+index)*step(),t=Math.max(0,Math.min(1,(clock-at)/.7));if(clock<at)return false;const ease=t*t*(3-2*t),source=deck(),destination=rig.center.map((v,i)=>source[i]+(v-source[i])*ease+(i===1?Math.sin(t*Math.PI)*.10:0)),normal=[0,1,0].map((v,i)=>v+(rig.normal[i]-v)*Math.max(0,(t-.65)/.35));return HoldEmProps.transform(rig.center,destination,rig.normal,normal)
}
function arm(rig){if(!enabled||rig?.part!=='arm')return null;const actor=window.HoldEmDealer.cast?.actors.find(a=>a.id===rig.actor);if(!actor?.dealer)return null;if(kind==='reveal'){const t=Math.min(1,clock/1.2),lift=Math.sin(t*Math.PI)*.13;return HoldEmProps.armTo(rig,rig.side===-1?[.01,.80+lift,-.47]:deck())}const base=deck(),elapsed=Math.max(0,clock-introDuration()),phase=(elapsed%step())/step(),ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},out=ease(phase/.40)*(1-ease((phase-.55)/.45)),right=rig.side===-1,target=base.map((v,i)=>v+(i===1?.026+Math.sin(phase*Math.PI)*.012:0)+(right&&i===2?out*.16:0)+(right&&i===0?out*.075:-.025*(i===0)));return HoldEmProps.armTo(rig,target)}
function sync(s){
 if(s.dealing&&s.dealInfo?.token!==token){if(s.dealInfo.kind==='reveal')reveal(s.hand,s.dealInfo.token.replace(/\/reveal$/,''),s.dealerHand.length,s.dealInfo.clock||0);else start(s.dealInfo.hand,s.players,s.dealInfo.first,s.dealInfo.clock||0,s.dealInfo.token,s.dealer,s.dealInfo.line);}else if(!s.dealing&&enabled&&s.hand===hand)enabled=false;
 const key=s.session+'/'+s.hand;if(s.gameType==='blackjack'&&s.phase==='complete'&&!s.dealing&&resultKey!==key){resultKey=key;enabled=false;const winners=s.players.filter(p=>p.hands?.some(h=>['Win','Blackjack'].includes(h.outcome)));say((s.notice.split('. ')[0])+'. '+(winners.length?winners.map(p=>p.name).join(' and ')+' beat the house. A rather fine bit of arithmetic.':'The house keeps its hat this time. Another round, friends?'));return}if(s.phase==='complete'&&!s.dealing&&resultKey!==key){resultKey=key;enabled=false;const winners=(s.payouts||[]).filter(w=>!s.pots?.length||s.pots.some(p=>!p.refund&&p.winners.includes(w.id))).map(w=>({name:s.players[w.id].name,amount:w.amount-(s.pots||[]).filter(p=>p.refund&&p.winners.includes(w.id)).reduce((n,p)=>n+p.amount,0)}));
  if(winners.length){const money=n=>'$'+Number(n).toLocaleString('en-US'),names=winners.map(w=>w.name).join(' and '),line=winners.length===1?names+' takes '+money(winners[0].amount)+'! '+pick(jokes,s.hand+winners[0].amount):'A split pot. '+winners.map(w=>w.name+' receives '+money(w.amount)).join(', ')+'. A civilized outcome, for once.';say(line,undefined,winners.length===1?'winner-'+s.players.find(p=>p.name===winners[0].name).id:'split')}
 }
}
function mouth(rig){if(rig?.part!=='mouth'||!window.HoldEmAudio?.talking&&!(caption&&clock<captionUntil&&!spoken))return null;const m=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),sy=1+Math.abs(Math.sin((clock-lineAt)*13.2)*Math.sin((clock-lineAt)*5.3))*.9;m[5]=sy;m[13]=rig.pivot[1]*(1-sy);return m}
function cancel(){enabled=false;caption='';label.hidden=true;window.HoldEmAudio?.stopVoice()}
window.addEventListener('pagehide',cancel);window.HoldEmDealer={start,reveal,update,card,arm,mouth,sync,deck,cancel,get busy(){return enabled},get active(){return enabled||clock<captionUntil&&!!caption},get info(){return{hand,first,clock,token,kind,line:introLine}},get duration(){return duration()}};
})();