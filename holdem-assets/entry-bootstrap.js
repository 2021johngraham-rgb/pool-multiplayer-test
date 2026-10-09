/* Start the entry UI before WebGL; rendering failure must not remove navigation. */
(function(){
'use strict';
if(!document.body.classList.contains('tableDesign'))return;
const catalog=window.HoldEmCast(()=>{},{mode:'catalog'});let handlers=null,lastEvent=null,lastConfig=null,menu=null,front=null,intro=null;
const message=document.createElement('div');message.className='he-preview-message';message.setAttribute('role','status');
const text=document.createElement('p');text.textContent='Preparing your character…';message.appendChild(text);
const reload=document.createElement('button');reload.type='button';reload.textContent='Reload table';reload.hidden=true;reload.onclick=()=>location.reload();message.appendChild(reload);
function failed(){text.textContent='The 3D table could not load. Your character choices are saved.';reload.hidden=false;message.hidden=false;front?.setError('The table could not load. Reload this page to try again.')}
function dispatch(event,config){lastEvent=event;lastConfig=config;if(!handlers){if(event==='enter'){menu.open();failed()}return}try{handlers[{enter:'onEnter',preview:'onPreview',lobby:'onLobby'}[event]](config);message.hidden=true;front?.setError('')}catch(error){console.error('Hold Em scene:',error);failed();if(event==='enter')menu.open()}}
function mainMenu(){window.TablePoker?.pause();menu.close();front.show();dispatch('lobby',menu.current)}
function cinematic(active){window.HoldEmCinematicActive=active;window.dispatchEvent(new Event('holdem:cinematic'));front.element.inert=active}
menu=window.HoldEmEntry({cast:catalog.cast,initialOpen:false,onBack:mainMenu,onPreview:config=>dispatch('preview',config),async onEnter(config){try{if(window.TablePoker?.mode==='online')await window.HoldEmRoom.claim(config,true);menu.close();dispatch('enter',config);window.TablePoker?.start(config.chosen)}catch(e){menu.open();menu.setError(e.message)}}});
menu.previewHost.appendChild(message);
front=window.HoldEmMainMenu({getConfig:()=>menu.current,onPlay(options){window.TablePoker?.configure(options);menu.setAvailable(options.mode==='online'?window.HoldEmRoom.availableSeats():[0,1,2,3]);front.hide();menu.open()},onReplay(){if(intro){cinematic(true);intro.replay()}}});
window.addEventListener('holdem:room',()=>{if(window.TablePoker?.mode==='online')menu.setAvailable(window.HoldEmRoom.availableSeats())});
window.addEventListener('holdem:room-status',event=>{if(window.TablePoker?.live&&window.TablePoker.mode==='online'&&!window.HoldEmRoom.ready){mainMenu();front.setError(event.detail)}});
lastEvent='lobby';lastConfig=menu.current;
window.HoldEmLobby={entry:menu,mainMenu,connect(callbacks){handlers=callbacks;if(lastEvent)dispatch(lastEvent,lastConfig)},failed};
if(window.HoldEmIntro){cinematic(true);try{intro=window.HoldEmIntro({onComplete(){cinematic(false);front.show()}})}catch(error){cinematic(false);console.error('Hold Em intro:',error)}}
window.addEventListener('error',event=>{if(String(event.filename).includes('holdem-assets/'))failed()});
})();
