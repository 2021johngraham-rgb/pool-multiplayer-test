/* Grunge Rock Instrumental — Wayne John Bradley. CC BY 3.0. See audio/MENU-MUSIC-LICENSE.txt. */
(()=>{
 'use strict';const launcher=document.getElementById('launcher');if(!launcher)return;
 let unlocked=false,volume=.28,muted=false;try{volume=Math.max(0,Math.min(1,Number(localStorage.getItem('menuMusicVolume')??.28)));muted=localStorage.getItem('menuMusicMuted')==='true'}catch{}
 const track=new Audio('audio/grunge-rock-wayne-john-bradley.mp3');track.loop=true;track.preload='none';
 const controls=document.createElement('div');controls.className='menu-music';controls.innerHTML='<button type="button" aria-label="Toggle menu music">Music</button><label>VOLUME <input type="range" min="0" max="100" aria-label="Menu music volume"><output></output></label><small>Grunge Rock Instrumental · <a href="https://soundcloud.com/ayneohnradley" target="_blank" rel="noopener">Wayne John Bradley</a> · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> · <a href="https://www.free-stock-music.com/wayne-john-bradley-grunge-rock-instrumental.html" target="_blank" rel="noopener">Free Stock Music</a></small>';launcher.append(controls);
 const style=document.createElement('style');style.textContent='.menu-music{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:16px 0;color:#c1ced8;font:11px system-ui}.menu-music button{border:1px solid #b7c6d744;background:#142637;color:#e5decd;border-radius:10px;padding:10px 16px;min-height:44px}.menu-music label{display:flex;align-items:center;gap:8px}.menu-music input{width:100px;accent-color:#e5c58d}.menu-music output{width:30px}.menu-music small{font-size:10px}.menu-music a{color:#d7bf8c}';document.head.append(style);
 const button=controls.querySelector('button'),slider=controls.querySelector('input'),output=controls.querySelector('output');slider.value=volume*100;
 function ui(){button.textContent=muted?'Music off':'Music on';button.setAttribute('aria-pressed',String(!muted));output.textContent=Math.round(volume*100)+'%'}
 function visible(){return unlocked&&!muted&&volume>0&&!document.hidden&&!launcher.classList.contains('hidden')}
 function sync(){track.volume=volume*.65;if(visible())track.play().catch(()=>{});else track.pause()}
 function unlock(){unlocked=true;sync()}
 button.onclick=()=>{muted=!muted;try{localStorage.setItem('menuMusicMuted',muted)}catch{}ui();unlock()};slider.oninput=()=>{volume=Number(slider.value)/100;try{localStorage.setItem('menuMusicVolume',volume)}catch{}ui();unlock()};
 addEventListener('pointerdown',()=>{if(!unlocked)unlock()},{passive:true});addEventListener('keydown',()=>{if(!unlocked)unlock()});new MutationObserver(sync).observe(launcher,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);addEventListener('pagehide',()=>track.pause());ui();
})();
