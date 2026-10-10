/* Public table discovery uses short-lived, fixed-ID PeerJS lobby advertisements.
   Private games remain code-only. No player cards enter the public directory. */
(function(){
'use strict';
const slots=24,prefix='cards-haul-public-v3-';let advertisement=null,publishedCode='',searchPeer=null,generation=0,searching=false,publicRoom=false,registrations=new Set();
const status=text=>window.dispatchEvent(new CustomEvent('holdem:match-status',{detail:text})),changed=()=>window.dispatchEvent(new Event('holdem:match'));
function destroyAdvertisement(){advertisement?.destroy();advertisement=null;publishedCode='';publicRoom=false;for(const p of registrations)p.destroy();registrations.clear();changed()}
function cancel(){generation++;searching=false;searchPeer?.destroy();searchPeer=null;for(const p of registrations)p.destroy();registrations.clear();changed()}
function check(g){if(g!==generation){const error=new Error('Search cancelled.');error.name='AbortError';throw error}}
function openPeer(id){return new Promise((resolve,reject)=>{const p=new Peer(id,{debug:0});registrations.add(p);let done=false;const timer=setTimeout(()=>finish(Error('The public table service did not respond.')),8000);function finish(error){if(done)return;done=true;clearTimeout(timer);registrations.delete(p);if(error){p.destroy();reject(error)}else resolve(p)}p.on('open',()=>finish());p.on('error',e=>{if(!done)finish(e)});p.on('close',()=>{if(!done)finish(Error('Search cancelled.'))})})}
function probe(p,slot,gameType){return new Promise(resolve=>{let done=false,connection=null;const timer=setTimeout(()=>finish(null),2300);function finish(value){if(done)return;done=true;clearTimeout(timer);connection?.close();resolve(value)}try{connection=p.connect(prefix+slot,{serialization:'json',reliable:true,metadata:{purpose:'holdem-table-search',version:3}});connection.on('data',data=>{if(data?.type==='table-offer'&&data.version===3&&data.available&&data.gameType===gameType&&/^[A-HJ-NP-Z2-9]{5}$/.test(data.code))finish({code:data.code,seats:data.seats,slot});else finish(null)});connection.on('error',()=>finish(null));connection.on('close',()=>finish(null));p.on('close',()=>finish(null))}catch(e){finish(null)}})}
function offer(p){p.on('connection',c=>{c.on('open',()=>{const room=window.HoldEmRoom,snapshot=room.snapshot,available=room.availableSeats().filter(i=>!room.roster[i]&&(!snapshot||snapshot.phase==='idle'||snapshot.players[i]?.stack>0)),capacity=room.pendingPlayers<3;const valid=room.ready&&room.isHost&&room.code===publishedCode;c.send({type:'table-offer',version:3,gameType:room.gameType,code:room.code,available:valid&&available.length>0&&capacity,seats:available.length,players:Object.keys(room.roster).length});setTimeout(()=>c.close(),600)});c.on('error',()=>c.close())});p.on('disconnected',()=>{publicRoom=false;changed();status('This table is still open by code, but public search is disconnected.')});p.on('error',()=>{publicRoom=false;changed()})}
async function lookup(slot,g){const p=await openPeer();searchPeer=p;check(g);const result=await probe(p,slot,HoldEmRoom.gameType);p.destroy();if(searchPeer===p)searchPeer=null;return result}
async function advertise(g,joinExisting=false){
 for(let slot=0;slot<slots;slot++){check(g);try{const p=await openPeer(prefix+slot);check(g);advertisement=p;publishedCode=HoldEmRoom.code;publicRoom=true;offer(p);changed();status('Your public table is open. Players can find it with Find game.');return 'host'}catch(e){check(g);if(e.type!=='unavailable-id')throw e;if(joinExisting){const result=await lookup(slot,g);check(g);if(result){try{await HoldEmRoom.join(result.code);check(g);publicRoom=true;changed();status('Found an open table. Choose an available character.');return 'joined'}catch(e){check(g)}}}}}
 throw Error('All public tables are busy right now. Try again shortly, or create a private room.');
}
async function create(config){
 cancel();destroyAdvertisement();HoldEmRoom.leave();const g=generation;searching=true;changed();status('Creating your room and five-character code…');
 try{await HoldEmRoom.create(config);check(g);status('Room '+HoldEmRoom.code+' created. Opening public matchmaking…');await advertise(g,false);return 'host'}catch(e){check(g);if(HoldEmRoom.ready&&HoldEmRoom.isHost)throw Error('Room '+HoldEmRoom.code+' is ready by code. Public listing failed: '+e.message+' Use Open to public matchmaking to retry.');throw e}finally{if(g===generation){searching=false;changed()}}
}
async function publish(){if(!HoldEmRoom.isHost||!HoldEmRoom.ready)throw Error('Create a room first.');if(publicRoom&&advertisement)return;cancel();destroyAdvertisement();const g=generation;await HoldEmRoom.load();await advertise(g,false)}
async function find(config){
 cancel();destroyAdvertisement();HoldEmRoom.leave();const g=generation;searching=true;changed();status('Searching for an open table…');
 try{await HoldEmRoom.load();check(g);const p=await openPeer();searchPeer=p;p.on('error',e=>{if(e.type!=='peer-unavailable')status('The search service is having trouble connecting.')} );
  let offers=[];for(let first=0;first<slots;first+=8){check(g);const results=await Promise.all(Array.from({length:8},(_,i)=>probe(p,first+i,config.gameType==='blackjack'?'blackjack':'holdem')));offers=results.filter(Boolean).sort((a,b)=>a.seats-b.seats);if(offers.length)break;status('Searching public tables…')}
  p.destroy();searchPeer=null;for(const found of offers){check(g);try{await HoldEmRoom.join(found.code);check(g);publicRoom=true;changed();status('Found an open table. Choose your character.');return 'joined'}catch(e){check(g)}}
  status('No open table yet. Creating a public table for you…');await HoldEmRoom.create(config);check(g);return await advertise(g,true);
 }catch(e){if(e.name==='AbortError')throw e;status(e.message);throw e}finally{if(g===generation){searching=false;searchPeer?.destroy();searchPeer=null;changed()}}
}
window.addEventListener('holdem:room',()=>{if(advertisement&&(!HoldEmRoom.ready||!HoldEmRoom.isHost||publishedCode!==HoldEmRoom.code))destroyAdvertisement();if(!HoldEmRoom.ready&&publicRoom&&!advertisement){publicRoom=false;changed()}});
window.addEventListener('pagehide',()=>{cancel();destroyAdvertisement()});
window.HoldEmMatch={create,find,publish,cancel,unpublish:destroyAdvertisement,get searching(){return searching},get public(){return publicRoom}};
})();
