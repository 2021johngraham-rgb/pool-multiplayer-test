/* Hold Em wardrobe. The scene owns the standing model, rotation and seating. */
'use strict';
window.HoldEmEntry=function({cast=[],onEnter=()=>{},onPreview=()=>{},onBack=null,initialOpen=true}={}){
 const defaults=[
  {name:'Vince',tag:'The smooth operator',bio:'A sharp grin. A sharper wardrobe.',accent:'#c58aaf',signature:'Plum blazer',suit:'♠'},
  {name:'Bruno',tag:'The powerhouse',bio:'Big shoulders. Bigger table presence.',accent:'#dfb868',signature:'Gold varsity',suit:'♦'},
  {name:'Miles',tag:'The wildcard',bio:'Wild hair. Old-school charm.',accent:'#88b7dc',signature:'Blue suspenders',suit:'♣'},
  {name:'Gus',tag:'The familiar face',bio:'A warm smile and a very good poker face.',accent:'#92bfa5',signature:'Forest cardigan',suit:'♥'}
 ];
 const roster=defaults.map((base,i)=>({...base,...(cast[i]||{}),accent:base.accent,signature:base.signature}));
 // Safe defaults keep entry available if a cached page has not loaded the wardrobe catalog yet.
 const fallback=[{key:'shirt',label:'Shirts',options:[{id:'signature',label:'Signature',description:'Your character’s own outfit.'}]},{key:'pants',label:'Pants',options:[{id:'signature',label:'Signature'}]},{key:'hat',label:'Hats',options:[{id:'none',label:'No hat'}]},{key:'costume',label:'Costumes',options:[{id:'none',label:'No costume'}]},{key:'facialHair',label:'Facial hair',options:[{id:'signature',label:'Signature'},{id:'clean',label:'Clean shave'},{id:'stubble',label:'Stubble'},{id:'goatee',label:'Goatee'}]}];
 const wardrobe=window.HoldEmWardrobe,categories=wardrobe?.categories?.length?wardrobe.categories:fallback;
 function normalize(setting={}){if(wardrobe?.normalize)return wardrobe.normalize(setting);return Object.fromEntries(categories.map(c=>{const value=setting[c.key]||(c.key==='shirt'?setting.outfit:null);return [c.key,c.options.some(o=>o.id===value)?value:c.options[0].id]}))}
 function label(key,id){return wardrobe?.label?wardrobe.label(key,id):categories.find(c=>c.key===key)?.options.find(o=>o.id===id)?.label||id}
 let chosen=2,customizations={},previousFocus=null,open=initialOpen,activeCategory='shirt',optionCategory='',optionButtons=[];
 try{
  const saved=localStorage.getItem('holdem-character'),id=Number(saved);
  if(saved!==null&&Number.isInteger(id)&&id>=0&&id<4)chosen=id;
  const parsed=JSON.parse(localStorage.getItem('holdem-customizations')||'{}');if(parsed&&typeof parsed==='object')customizations=parsed;
 }catch(e){}
 customizations=Object.fromEntries(roster.map((_,i)=>[i,normalize(customizations[i]||{})]));
 if(!categories.some(c=>c.key===activeCategory))activeCategory=categories[0].key;
 const overlay=document.createElement('section');overlay.id='holdemEntry';overlay.className='holdem-entry he-entry he-wardrobe';overlay.hidden=!open;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','heEntryTitle');
 overlay.innerHTML=`
  <header class="he-entry-header">
   <div class="he-title-lockup"><span class="he-title-mark" aria-hidden="true">♠</span><div><span class="he-kicker">DRESS FOR THE TABLE</span><h1 id="heEntryTitle">Hold Em<span>.</span></h1></div></div>
   <p class="he-header-note">A seat for every character.</p>
   <button class="he-back" type="button" id="heEntryExit"><span aria-hidden="true">←</span> Game Room</button>
  </header>
  <div class="he-entry-layout">
   <section class="he-roster" aria-labelledby="heRosterLabel">
    <div class="he-section-heading"><span class="he-step">01</span><h2 id="heRosterLabel">Pick your player</h2></div>
    <p class="he-section-copy">Four personalities. Your choice.</p>
    <div id="heRosterChoices" class="he-roster-choices" role="group" aria-label="Playable characters"></div>
    <p class="he-table-note"><span aria-hidden="true">♠</span> Four seats. One dealer.<br>You bring the character.</p>
   </section>
   <section class="he-preview" aria-label="Standing character preview">
    <div class="he-preview-frame">
     <div class="he-portrait-meta" aria-hidden="true"><span>YOUR PLAYER</span><span id="hePortraitNumber"></span></div>
     <div class="he-preview-stage" id="holdemCharacterPreview"></div>
     <div class="he-preview-finish" aria-hidden="true"><i></i><span id="hePortraitFinish"></span><i></i></div>
     <div class="he-preview-toolbar" role="group" aria-label="Rotate your character"><button type="button" id="heRotateLeft" aria-label="Rotate character left">↶</button><button type="button" id="heRotateReset">Front view</button><button type="button" id="heRotateRight" aria-label="Rotate character right">↷</button></div>
    </div>
    <div class="he-preview-caption" aria-live="polite" aria-atomic="true"><span class="he-kicker" id="heCharacterTag"></span><h2 id="heCharacterName"></h2><p id="heCharacterBio"></p></div>
   </section>
   <section class="he-style" aria-labelledby="heStyleLabel">
    <div class="he-section-heading"><span class="he-step">02</span><h2 id="heStyleLabel">Make it yours</h2></div>
    <div class="he-wardrobe-tabs" id="heWardrobeTabs" role="tablist" aria-label="Clothing categories"></div>
    <div class="he-wardrobe-panel" id="heWardrobePanel" role="tabpanel"><div class="he-wardrobe-options" id="heWardrobeOptions" role="group" aria-label="Clothing choices"></div></div>
    <p class="he-option-description" id="heOptionDescription"></p>
    <div class="he-costume-note" id="heCostumeNote" hidden><p>Your costume covers your shirt and pants. Those choices stay saved.</p><button type="button" id="heRemoveCostume">Remove costume</button></div>
    <div class="he-wardrobe-actions"><button type="button" id="heRandomLook"><span aria-hidden="true">⤨</span> Random look</button><button type="button" id="heResetLook">Reset look</button></div>
    <div class="he-style-summary"><span class="he-kicker">YOUR LOOK</span><p id="heCurrentLook"></p></div>
    <p class="he-style-note">Saved separately for each character.</p>
   </section>
  </div>
  <footer class="he-entry-footer"><div class="he-selection-summary"><span class="he-kicker">READY TO TAKE YOUR SEAT</span><p id="heSelectionSummary"></p></div><button type="button" class="he-enter" id="heTakeSeat">Take a seat <span aria-hidden="true">↗</span></button></footer>`;
 document.body.appendChild(overlay);const $=id=>overlay.querySelector('#'+id);
 const characterButtons=roster.map((c,i)=>{
  const button=document.createElement('button');button.type='button';button.className='he-character';button.style.setProperty('--character-accent',c.accent);button.setAttribute('aria-pressed',String(chosen===i));
  const symbol=document.createElement('span');symbol.className='he-character-number';symbol.textContent=c.suit;symbol.setAttribute('aria-hidden','true');
  const text=document.createElement('span');text.className='he-character-copy';const name=document.createElement('strong');name.textContent=c.name;const detail=document.createElement('small');detail.textContent=c.signature;text.append(name,detail);
  const check=document.createElement('span');check.className='he-character-check';check.textContent='✓';check.setAttribute('aria-hidden','true');button.append(symbol,text,check);
  button.addEventListener('click',()=>selectCharacter(i));
  button.addEventListener('keydown',event=>{const step=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;if(!step&&event.key!=='Home'&&event.key!=='End')return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?roster.length-1:(i+step+roster.length)%roster.length;selectCharacter(next);characterButtons[next].focus({preventScroll:true})});
  $('heRosterChoices').appendChild(button);return button;
 });
 function icon(key,id){
  const common='fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"';
  let path='';
  if(id==='none')path='<circle cx="24" cy="24" r="15" fill="none"/><path d="m13 35 22-22" fill="none"/>';
  else if(key==='shirt')path=id==='hoodie'?'<path d="M17 10Q24 2 31 10L35 15 43 22 36 30 32 26V43H16V26L12 30 5 22 13 15Z"/><path d="M19 12Q24 21 29 12M20 34h8" stroke="#0c1820" fill="none"/>':'<path d="m15 10 9 5 9-5 11 10-8 9-5-4v17H17V25l-5 4-8-9Z"/><path d="M20 13q4 9 8 0M24 22v15" fill="none" stroke="#10232b"/>';
  else if(key==='pants')path=id==='shorts'?'<path d="M13 9h22l3 24-11 2-3-15-3 15-11-2Z"/><path d="M13 15h22" stroke="#12232b"/>':'<path d="M13 5h22l3 38H27l-3-26-3 26H10Z"/><path d="M13 12h22M24 6v11" stroke="#10212a" fill="none"/>';
  else if(key==='hat'){
   const hats={tophat:'<path d="M13 5h22l-2 29H15Z"/><ellipse cx="24" cy="37" rx="20" ry="5"/><path d="M15 27h18" stroke="#d7b876" stroke-width="5"/>',cowboy:'<path d="M5 30q5 10 38 0l-2 9H7ZM13 29l3-18 8 5 8-5 3 18Z"/>',crown:'<path d="m7 13 9 9 8-15 8 15 9-9-5 25H12Z"/><path d="M12 32h24" stroke="#17232b"/>',wizard:'<path d="m11 33 14-28 11 28Z"/><ellipse cx="24" cy="36" rx="20" ry="5"/><path d="m24 18 1 3 4 1-4 1-1 3-1-3-3-1 3-1Z" fill="#fff0bf" stroke="none"/>',propeller:'<path d="M8 31a16 16 0 0 1 32 0Z"/><path d="M24 10v10M10 11l14-3 14 3-14 3Z"/><path d="M8 32h35"/>',chef:'<path d="M14 23C-2 18 12 1 22 10c10-12 29 4 14 13v18H14Z"/><path d="M14 32h22" stroke="#14232b"/>',pirate:'<path d="m5 31 7-19 12 4 12-4 7 19-19-5Z"/><path d="m20 21 8 5m0-5-8 5" stroke="#e8dec4"/>',viking:'<path d="M11 34a13 16 0 0 1 26 0Z"/><path d="M13 17Q0 17 4 7q8 6 12 8m19 2Q48 17 44 7q-8 6-12 8" fill="none" stroke-width="4"/><path d="M24 14v20" stroke="#15232b"/>',frog:'<path d="M8 34Q7 12 24 15q17-3 16 19Z"/><circle cx="15" cy="16" r="7"/><circle cx="33" cy="16" r="7"/><circle cx="15" cy="16" r="2.5" fill="#14232b" stroke="none"/><circle cx="33" cy="16" r="2.5" fill="#14232b" stroke="none"/>',traffic:'<path d="m12 37 9-30h6l9 30ZM6 38h36v5H6Z"/><path d="M17 21h14M14 31h20" stroke="#fff0ce" stroke-width="4"/>'};
   path=hats[id]||'<path d="M9 31a15 18 0 0 1 30 0Z"/><ellipse cx="24" cy="35" rx="21" ry="5"/>';
  }else if(key==='costume'){
   const costumes={shark:'<path d="M12 40V20L24 4l12 16v20ZM12 24l-9 9 9-2m24-7 9 9-9-2"/><ellipse cx="24" cy="22" rx="7" ry="6" fill="#152632"/><path d="m18 20 3 3 3-3 3 3 3-3" fill="#f3e4b9" stroke="none"/>',dino:'<path d="M11 43V16q0-11 12-11h11l7 13-9 5v20Z"/><path d="m11 17-7 5 7 5-7 5 7 6"/><circle cx="29" cy="13" r="2" fill="#13222b" stroke="none"/>',chicken:'<ellipse cx="24" cy="29" rx="15" ry="16"/><circle cx="24" cy="12" r="10"/><path d="m21 5 1-4 4 3 3-2 1 6m-8 8 11 1-8 6" fill="#dd9161"/><circle cx="24" cy="12" r="2" fill="#15232b" stroke="none"/>',hotdog:'<rect x="10" y="5" width="28" height="38" rx="13"/><rect x="18" y="4" width="12" height="40" rx="6" fill="#b95743" stroke="none"/><path d="m23 10 4 5-6 5 6 5-6 5 4 6" stroke="#f1cc53" fill="none" stroke-width="3"/>',astronaut:'<circle cx="24" cy="13" r="11"/><path d="M13 27 5 35l7 7 6-6v9h12v-9l6 6 7-7-8-8Z"/><rect x="16" y="9" width="16" height="9" rx="3" fill="#263f51" stroke="none"/>'};path=costumes[id]||'<path d="M15 8h18l9 16-8 7-4-7v20H18V24l-4 7-8-7Z"/>';
  }else{path='<path d="M12 13q12-12 24 0v12q-1 13-12 18-11-5-12-18Z" fill="none"/>';if(id==='clean')path+='<path d="M17 32q7 5 14 0" fill="none"/>';else if(id==='goatee')path+='<path d="m20 32 4 9 4-9Z"/>';else if(id==='stubble')path+='<path d="m17 28 1 2m5-1 1 2m5-3 1 2m-9 4 1 2m5-2 1 2" fill="none"/>';else path+='<path d="M24 27q-9-9-15 2 7 8 15 0 8 8 15 0-6-11-15-2Z"/>'}
  return '<svg viewBox="0 0 48 48" aria-hidden="true" '+common+'>'+path+'</svg>';
 }
 const categoryButtons=categories.map((category,index)=>{
  const button=document.createElement('button');button.type='button';button.className='he-category';button.id='heCategory-'+category.key;button.setAttribute('role','tab');button.setAttribute('aria-controls','heWardrobePanel');button.textContent=category.label;
  button.addEventListener('click',()=>selectCategory(category.key));
  button.addEventListener('keydown',event=>{const step=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(!step&&event.key!=='Home'&&event.key!=='End')return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?categories.length-1:(index+step+categories.length)%categories.length;selectCategory(categories[next].key);categoryButtons[next].focus({preventScroll:true})});
  $('heWardrobeTabs').appendChild(button);return button;
 });
 function selectCategory(key){activeCategory=key;renderOptions()}
 function renderOptions(){
  const category=categories.find(c=>c.key===activeCategory),style=customizations[chosen];
  categoryButtons.forEach((button,index)=>{const active=categories[index].key===activeCategory;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});
  $('heWardrobePanel').setAttribute('aria-labelledby','heCategory-'+activeCategory);$('heWardrobeOptions').setAttribute('aria-label',category.label);
  if(optionCategory!==activeCategory){
   optionCategory=activeCategory;$('heWardrobeOptions').replaceChildren();
   optionButtons=category.options.map(option=>{
    const button=document.createElement('button');button.type='button';button.className='he-wardrobe-option';button.dataset.value=option.id;button.title=option.description||option.label;button.setAttribute('aria-pressed','false');
    const swatch=document.createElement('span');swatch.className='he-option-icon';swatch.style.color=typeof option.color==='string'?option.color:'var(--he-accent)';swatch.innerHTML=icon(category.key,option.id);
    const text=document.createElement('span');text.className='he-option-label';text.textContent=option.label;const check=document.createElement('span');check.className='he-option-check';check.textContent='✓';check.setAttribute('aria-hidden','true');button.append(swatch,text,check);
    button.addEventListener('click',()=>{if(customizations[chosen][category.key]!==option.id){customizations[chosen]=normalize({...customizations[chosen],[category.key]:option.id});update()}});$('heWardrobeOptions').appendChild(button);return button;
   });$('heWardrobePanel').scrollTop=0;
  }
  optionButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===style[activeCategory])));
  const selected=category.options.find(o=>o.id===style[activeCategory]);$('heOptionDescription').textContent=selected?.description||selected?.label||'';
  $('heCostumeNote').hidden=style.costume==='none'||!style.costume;
 }
 function selectCharacter(index){if(characterButtons[index].disabled)return;if(chosen!==index){chosen=index;update()}}
 function snapshot(){return {chosen,customizations:JSON.parse(JSON.stringify(customizations))}}
 function lookText(style){const clothes=style.costume&&style.costume!=='none'?label('costume',style.costume):[label('shirt',style.shirt),label('pants',style.pants)].join(' + ');return [clothes,style.hat&&style.hat!=='none'?label('hat',style.hat):'',label('facialHair',style.facialHair)].filter(Boolean).join(' · ')}
 function update(preview=true){
  const c=roster[chosen],style=customizations[chosen];overlay.style.setProperty('--he-accent',c.accent);characterButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===chosen)));renderOptions();
  $('heCharacterName').textContent=c.name;$('heCharacterTag').textContent=c.tag;$('heCharacterBio').textContent=c.bio;$('hePortraitNumber').textContent=String(chosen+1).padStart(2,'0')+' / 04';
  $('hePortraitFinish').textContent=style.costume&&style.costume!=='none'?label('costume',style.costume):'YOUR CUSTOM LOOK';$('heCurrentLook').textContent=lookText(style);$('heSelectionSummary').textContent=c.name+' · '+window.HoldEmSeating.labels[chosen]+' · '+lookText(style);$('heTakeSeat').setAttribute('aria-label','Take a seat as '+c.name);
  try{localStorage.setItem('holdem-character',String(chosen));localStorage.setItem('holdem-customizations',JSON.stringify(customizations))}catch(e){}
  if(preview)onPreview(snapshot());
 }
 function rotate(detail){window.dispatchEvent(new CustomEvent('holdem:preview-rotate',{detail}))}
 $('heRotateLeft').addEventListener('click',()=>rotate({delta:-Math.PI/4}));$('heRotateRight').addEventListener('click',()=>rotate({delta:Math.PI/4}));$('heRotateReset').addEventListener('click',()=>rotate({reset:true}));
 $('heRandomLook').addEventListener('click',()=>{const look={};for(const category of categories)look[category.key]=category.options[Math.floor(Math.random()*category.options.length)].id;customizations[chosen]=normalize(look);update()});
 $('heResetLook').addEventListener('click',()=>{customizations[chosen]=normalize({});update()});
 $('heRemoveCostume').addEventListener('click',()=>{customizations[chosen]=normalize({...customizations[chosen],costume:'none'});update()});
 function close(){open=false;overlay.hidden=true;document.body.classList.remove('holdem-entry-open');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true})}
 function show(){previousFocus=document.activeElement;open=true;overlay.hidden=false;document.body.classList.add('holdem-entry-open');update();requestAnimationFrame(()=>{if(open)characterButtons[chosen].focus({preventScroll:true})})}
 const entryError=document.createElement('p');entryError.className='he-entry-error';entryError.hidden=true;entryError.setAttribute('role','alert');$('heTakeSeat').parentElement.appendChild(entryError);
 $('heTakeSeat').addEventListener('click',async()=>{const config=snapshot(),button=$('heTakeSeat');button.disabled=true;button.textContent='Taking your seat…';entryError.hidden=true;try{await onEnter(config)}finally{button.disabled=false;button.textContent='Take your seat →'}});
 if(onBack)$('heEntryExit').innerHTML='<span aria-hidden="true">←</span> Main menu';
 $('heEntryExit').addEventListener('click',()=>{if(onBack){close();onBack()}else document.getElementById('exitGame')?.click()});
 overlay.addEventListener('keydown',event=>{if(event.key!=='Tab'||!open)return;const focusable=[...overlay.querySelectorAll('button:not([disabled]):not([tabindex="-1"]),[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
 document.body.classList.toggle('holdem-entry-open',open);update(false);requestAnimationFrame(()=>{if(open){onPreview(snapshot());characterButtons[chosen].focus({preventScroll:true})}});
 return {setAvailable(ids){characterButtons.forEach((b,i)=>{b.disabled=!ids.includes(i);b.title=b.disabled?'Taken by another player':''});if(!ids.includes(chosen)&&ids.length)selectCharacter(ids[0]);},setError(message){entryError.textContent=message||'';entryError.hidden=!message;},open:show,close,get selected(){return snapshot()},get current(){return snapshot()},get isOpen(){return open},element:overlay,previewHost:$('holdemCharacterPreview')};
};

