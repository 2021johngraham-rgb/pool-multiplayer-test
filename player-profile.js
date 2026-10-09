/* Shared nickname; no account or server is required. */
(()=>{
 'use strict';
 const clean=s=>String(s||'').replace(/[<>\x00-\x1f]/g,'').trim().replace(/\s+/g,' ').slice(0,20);
 let name=clean(new URLSearchParams(location.search).get('player')),pending=[];
 try{name=name||clean(localStorage.getItem('gameRoomPlayer'))}catch{}
 function promptName(){
  let dialog=document.querySelector('#playerNameDialog');if(dialog){if(!dialog.open)dialog.showModal();return}
  const style=document.createElement('style');style.textContent='#playerNameDialog{width:min(420px,calc(100vw - 32px));padding:30px;border:1px solid #c6b68466;border-radius:18px;background:#0e202c;color:#edf1e7;font:14px system-ui;box-shadow:0 25px 100px #0008}#playerNameDialog::backdrop{background:#030c16dc}#playerNameDialog h2{font:32px Georgia;margin:0 0 12px}#playerNameDialog p{color:#a3b9c0;line-height:1.7}#playerNameDialog label{display:block;margin:20px 0 8px}#playerNameDialog input{box-sizing:border-box;width:100%;min-height:52px;padding:10px 14px;border:1px solid #bdc5ad66;border-radius:8px;background:#07121b;color:#f1e7d6;font:20px system-ui}#playerNameDialog button{width:100%;min-height:50px;margin-top:16px;border:0;border-radius:8px;background:#dec38e;color:#13232c;font:700 14px system-ui}#playerNameDialog small{display:block;color:#ffbc9b;margin-top:9px}';document.head.append(style);
  dialog=document.createElement('dialog');dialog.id='playerNameDialog';dialog.innerHTML='<form><h2>Welcome to the Game Room</h2><p>Choose the name other players will see at your table or on the field.</p><label for="playerNameInput">PLAYER NAME</label><input id="playerNameInput" maxlength="20" minlength="2" required autocomplete="nickname" placeholder="Your name"><small role="status"></small><button type="submit">Enter Game Room</button></form>';
  document.body.append(dialog);dialog.oncancel=e=>e.preventDefault();dialog.querySelector('input').value=name;
  dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const value=clean(dialog.querySelector('input').value);if(value.length<2){dialog.querySelector('small').textContent='Enter at least two characters.';return}name=value;try{localStorage.setItem('gameRoomPlayer',name)}catch{}dialog.close();const tasks=pending;pending=[];tasks.forEach(fn=>fn());window.dispatchEvent(new Event('game-room:profile'))};dialog.showModal();
 }
 window.GameRoomProfile={get name(){return name},clean,require(fn){if(name.length>=2)fn();else{pending.push(fn);promptName()}},edit:promptName};
 if(document.querySelector('#launcher')){
  const button=document.createElement('button');button.type='button';button.style.cssText='background:#193341;border:1px solid #bdd7db30;color:#d1ddd3;border-radius:8px;padding:10px 14px;font:12px system-ui;min-height:44px';button.onclick=promptName;document.querySelector('.nav .edition')?.replaceWith(button);const update=()=>button.textContent=name||'Choose a name';addEventListener('game-room:profile',update);update();if(name.length<2)promptName();
 }
 else if(name.length<2)addEventListener('DOMContentLoaded',promptName,{once:true});
})();
