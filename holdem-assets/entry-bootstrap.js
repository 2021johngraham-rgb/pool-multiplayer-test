/* Start the entry UI before WebGL; rendering failure must not remove navigation. */
(function(){
'use strict';
if(!document.body.classList.contains('tableDesign'))return;
const catalog=window.HoldEmCast(()=>{},{mode:'catalog'});let handlers=null,lastEvent=null,lastConfig=null,menu=null,front=null,intro=null,cancelReadyWait=null;
const message=document.createElement('div');message.className='he-preview-message';message.setAttribute('role','status');
const text=document.createElement('p');text.textContent='Preparing your character…';message.appendChild(text);
const reload=document.createElement('button');reload.type='button';reload.textContent='Reload table';reload.hidden=true;reload.onclick=()=>location.reload();message.appendChild(reload);
function failed(){text.textContent='The 3D table could not load. Your character choices are saved.';reload.hidden=false;message.hidden=false;front?.setError('The table could not load. Reload this page to try again.')}
function dispatch(event,config){lastEvent=event;lastConfig=config;if(!handlers){if(event==='enter'){menu.open();failed()}return}try{const result=handlers[{enter:'onEnter',preview:'onPreview',lobby:'onLobby'}[event]](config);message.hidden=true;front?.setError('');return result}catch(error){console.error('Hold Em scene:',error);failed();if(event==='enter')menu.open()}}
function mainMenu(){cancelReadyWait?.();if(window.TablePoker?.mode==='online'&&window.HoldEmRoom.ready)window.HoldEmRoom.claim(menu.current,false).catch(()=>{});window.TablePoker?.pause();menu.close();front.show();dispatch('lobby',menu.current)}
function cinematic(active){window.HoldEmCinematicActive=active;window.dispatchEvent(new Event('holdem:cinematic'));front.element.inert=active}
menu=window.HoldEmEntry({cast:catalog.cast,initialOpen:false,onBack:mainMenu,onPreview:config=>dispatch('preview',config),async onEnter(config){try{if(window.TablePoker?.mode==='online'){if(window.HoldEmMatch.public&&window.HoldEmRoom.participantCount<2)throw Error('PUBLIC · Waiting for another player to join before readying up.');await window.HoldEmRoom.claim(config,true);if(window.HoldEmMatch.public&&!window.HoldEmRoom.allReady){menu.setError('PUBLIC · You are ready. Waiting for the other players…');await new Promise((resolve,reject)=>{const check=()=>{if(!window.HoldEmRoom.ready){cleanup();reject(Error('Room closed.'))}else if(window.HoldEmRoom.allReady){cleanup();resolve()}};const cleanup=()=>{window.removeEventListener('holdem:room',check);cancelReadyWait=null};cancelReadyWait=()=>{cleanup();const error=Error('Ready cancelled.');error.name='AbortError';reject(error)};window.addEventListener('holdem:room',check);check()})}};menu.close();const entered=await dispatch('enter',config);if(entered!==false)window.TablePoker?.start(config.chosen)}catch(e){if(e.name!=='AbortError'){menu.open();menu.setError(e.message)}}}});
menu.previewHost.appendChild(message);
front=window.HoldEmMainMenu({getConfig:()=>menu.current,onPlay(options){window.TablePoker?.configure(options);menu.setAvailable(options.mode==='online'?window.HoldEmRoom.availableSeats():[0,1,2,3]);front.hide();menu.open();if(options.mode==='online'&&window.HoldEmMatch.public)document.getElementById('heTakeSeat').textContent='Ready up →'},onReplay(){if(intro){cinematic(true);intro.replay()}}});
window.addEventListener('holdem:room',()=>{if(window.TablePoker?.mode==='online')menu.setAvailable(window.HoldEmRoom.availableSeats());const readyButton=document.getElementById('heTakeSeat');if(readyButton&&window.TablePoker?.mode==='online'&&window.HoldEmMatch.public&&!readyButton.disabled)readyButton.textContent='Ready up →'});
window.addEventListener('holdem:room-status',event=>{if(window.TablePoker?.live&&window.TablePoker.mode==='online'&&!window.HoldEmRoom.ready){mainMenu();front.setError(event.detail)}});
lastEvent='lobby';lastConfig=menu.current;
window.HoldEmLobby={entry:menu,mainMenu,connect(callbacks){handlers=callbacks;if(lastEvent)dispatch(lastEvent,lastConfig)},failed};
if(window.HoldEmIntro){cinematic(true);try{intro=window.HoldEmIntro({onComplete(){cinematic(false);front.show()}})}catch(error){cinematic(false);console.error('Hold Em intro:',error)}}
window.addEventListener('error',event=>{if(String(event.filename).includes('holdem-assets/'))failed()});
})();
