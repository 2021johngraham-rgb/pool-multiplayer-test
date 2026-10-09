/* Pointer controls work without pointer lock or a keyboard. No idle animation loop. */
(function(){
'use strict';
const root=document.createElement('nav');root.className='cards-phone-controls';root.setAttribute('aria-label','Touch view controls');
root.innerHTML='<button type="button" data-hand>Lower cards</button><button type="button" data-look aria-expanded="false">Look around</button><div class="cards-look-pad" hidden><span>HOLD TO LOOK</span><button type="button" data-direction="up" aria-label="Look up">↑</button><button type="button" data-direction="left" aria-label="Look left">←</button><button type="button" data-center aria-label="Center view">◎</button><button type="button" data-direction="right" aria-label="Look right">→</button><button type="button" data-direction="down" aria-label="Look down">↓</button></div>';
document.body.appendChild(root);const pad=root.querySelector('.cards-look-pad'),hand=root.querySelector('[data-hand]');let timer=null;
function stop(){clearInterval(timer);timer=null}
root.querySelector('[data-look]').onclick=e=>{pad.hidden=!pad.hidden;e.currentTarget.setAttribute('aria-expanded',String(!pad.hidden));stop()};
hand.onclick=()=>{window.CardsView?.cards();label()};root.querySelector('[data-center]').onclick=()=>window.CardsView?.center();
for(const button of root.querySelectorAll('[data-direction]'))button.onpointerdown=e=>{e.preventDefault();stop();button.setPointerCapture(e.pointerId);const vector={up:[0,.02],down:[0,-.02],left:[.025,0],right:[-.025,0]}[button.dataset.direction],move=()=>window.CardsView?.look(...vector);move();timer=setInterval(move,35)};
for(const event of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(event,stop);
function label(){if(!window.TablePoker?.live){stop();pad.hidden=true;root.querySelector('[data-look]').setAttribute('aria-expanded','false')}hand.textContent=window.CardsView?.cardsDown?'Raise cards':'Lower cards';const s=window.TablePoker?.snapshot;if(s?.gameType==='blackjack')hand.textContent='Cards on table';hand.disabled=s?.gameType==='blackjack'||!s?.players[window.TablePoker.self]?.hole.length||s.dealing}
window.addEventListener('holdem:state',label);window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('pagehide',stop);
})();
