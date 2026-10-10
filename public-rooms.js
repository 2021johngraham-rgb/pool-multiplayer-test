/* Small, transient public lobby directory. Offers contain no gameplay data.
   The host keeps the page open. Private rooms are never advertised. */
(()=>{
 'use strict';
 window.PublicRooms=function(adapter){
  const prefix='game-room-public-v5-'+adapter.game+'-',slots=24;
  let ad=null,scanner=null,epoch=0,busy=false,publicWanted=false,owned=new Set();
  function mode(value){publicWanted=value;document.body.classList.toggle('public-room',value);adapter.mode?.(value)}
  const status=text=>adapter.status(text);
  function destroy(p){owned.delete(p);p?.destroy()}
  function stop(){epoch++;busy=false;destroy(scanner);scanner=null;destroy(ad);ad=null;for(const p of owned)p.destroy();owned.clear()}
  function alive(g){if(g!==epoch)throw Error('Search cancelled.')}
  function open(id){return new Promise((resolve,reject)=>{const p=new Peer(id,{debug:0});owned.add(p);let done=false;const timer=setTimeout(()=>finish(Error('The lobby service timed out.')),9000);function finish(err){if(done)return;done=true;clearTimeout(timer);if(err){destroy(p);reject(err)}else resolve(p)}p.on('open',()=>finish());p.on('error',e=>{if(!done)finish(e)});p.on('close',()=>finish(Error('Connection closed.')))})}
  function probe(p,slot){return new Promise(resolve=>{let c,done=false;const timer=setTimeout(()=>finish(null),2200);function finish(data){if(done)return;done=true;clearTimeout(timer);c?.close();resolve(data)}try{c=p.connect(prefix+slot,{reliable:true,serialization:'json'});c.on('data',m=>finish(m?.version===4&&m.available&&m.game===adapter.game&&/^[A-HJ-NP-Z2-9]{5}$/.test(m.code)?m:null));c.on('close',()=>finish(null));c.on('error',()=>finish(null))}catch{finish(null)}})}
  async function advertise(g){
   const offset=0;for(let n=0;n<slots;n++){alive(g);let p;try{p=await open(prefix+(n+offset)%slots)}catch(e){alive(g);if(e.type==='unavailable-id'){const scan=await open();scanner=scan;scan.on('error',()=>{});const offer=await probe(scan,(n+offset)%slots);destroy(scan);scanner=null;alive(g);if(offer){await adapter.join(offer.code);alive(g);status('PUBLIC · Connected. Choose your options and ready up.');return}continue}throw e}alive(g);ad=p;p.on('connection',c=>{c.on('open',()=>{const r=adapter.room();c.send({version:4,game:adapter.game,code:r.code,available:!!r.host&&r.available,name:window.GameRoomProfile?.name||'Player'});setTimeout(()=>c.close(),250)});c.on('error',()=>c.close())});status('PUBLIC · Waiting for another player…');return}
   throw Error('Public listings are busy. Your room is still joinable by code.');
  }
  async function run(find){if(busy)return;stop();const g=epoch;busy=true;mode(true);
   try{
    if(!window.Peer)throw Error('The room service is still loading. Try again shortly.');
    if(find){status('Searching '+adapter.label+' public rooms…');const p=await open();scanner=p;p.on('error',()=>{});for(let start=0;start<slots;start+=6){alive(g);const offers=(await Promise.all(Array.from({length:6},(_,i)=>probe(p,start+i)))).filter(Boolean);if(offers.length){destroy(p);scanner=null;await adapter.join(offers[0].code);alive(g);status('PUBLIC · Connected. Choose your options and ready up.');return}}destroy(p);scanner=null;status('No open room found. Creating a public room…')}
    await adapter.create();alive(g);await advertise(g);
   }catch(e){if(g===epoch)status(e.message||'Could not open a public room.')}finally{if(g===epoch)busy=false}
  }
  addEventListener('pagehide',stop);
  return{find:()=>run(true),create:()=>run(true),close(){mode(false);stop()},get public(){return publicWanted},get busy(){return busy}};
 };
})();
