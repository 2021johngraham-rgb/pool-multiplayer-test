/* Deterministic fictional rosters. Ratings are shared by the depth chart and simulation. */
(()=>{
 const teams={monarchs:{name:'Monarchs',attack:79,defend:77,QB:10,WR:3,OL:0,RB:-2,DB:1,DL:0,LB:1},sentinels:{name:'Sentinels',attack:73,defend:87,QB:-5,WR:-4,OL:5,RB:7,DB:3,DL:4,LB:6},tempest:{name:'Tempest',attack:87,defend:73,QB:6,WR:8,OL:-12,RB:-6,DB:-2,DL:2,LB:-4},forge:{name:'Forge',attack:80,defend:81,QB:-8,WR:-9,OL:10,RB:11,DB:-10,DL:8,LB:4},aurora:{name:'Aurora',attack:78,defend:83,QB:4,WR:5,OL:-4,RB:-5,DB:9,DL:-9,LB:0},vipers:{name:'Vipers',attack:83,defend:78,QB:1,WR:8,OL:-7,RB:3,DB:4,DL:9,LB:-7}};
 const positions=[['QB',7,'offense'],['RB',24,'offense'],['FB',44,'offense'],['WR',11,'offense'],['WR',18,'offense'],['SL',14,'offense'],['TE',87,'offense'],['LT',73,'offense'],['LG',66,'offense'],['C',61,'offense'],['RG',68,'offense'],['RT',75,'offense'],['DE',91,'defense'],['DT',95,'defense'],['DT',97,'defense'],['DE',93,'defense'],['LB',52,'defense'],['LB',54,'defense'],['LB',56,'defense'],['CB',21,'defense'],['CB',23,'defense'],['SS',31,'defense'],['FS',32,'defense']];
 const first=['Adrian','Bennett','Caleb','Dorian','Ellis','Felix','Gavin','Holden','Isaiah','Jonah','Kellan','Luca','Micah','Nolan','Owen','Parker','Quentin','Roman','Silas','Theo','Victor','Wesley','Zane'];
 const last=['Ashford','Bramwell','Calloway','Dunbar','Everett','Fairchild','Gresham','Hollis','Iverson','Jarrett','Keaton','Langford','Mercer','Norwood','Oakley','Prescott','Quinlan','Radford','Sterling','Tolliver','Underwood','Vaughn','Whitmore'];
 const clamp=v=>Math.max(48,Math.min(97,Math.round(v))),group=r=>['LT','LG','C','RG','RT'].includes(r)?'OL':['DE','DT'].includes(r)?'DL':['CB','SS','FS'].includes(r)?'DB':['WR','SL','TE'].includes(r)?'WR':r==='FB'?'RB':r;
 const keys=['speed','acceleration','agility','strength','awareness','accuracy','arm','catching','route','runBlock','passBlock','coverage','tackle','shed','balance','stamina'];
 const relevant={QB:['accuracy','accuracy','arm','awareness','agility'],RB:['speed','agility','balance','balance','strength','catching'],WR:['speed','catching','catching','route','agility'],OL:['strength','runBlock','passBlock','passBlock','awareness'],DL:['strength','shed','shed','tackle','acceleration'],DB:['speed','coverage','coverage','catching','agility'],LB:['tackle','tackle','coverage','shed','awareness']};
 const rosters={};
 Object.entries(teams).forEach(([id,t],ti)=>{rosters[id]=positions.map(([role,number,side],i)=>{
  const g=group(role),base=(side==='offense'?t.attack:t.defend)+(t[g]||0),attributes={};
  keys.forEach((k,j)=>attributes[k]=clamp(base+((number*17+ti*29+j*11)%13)-6));
  if(g==='OL'||g==='DL'){attributes.speed=clamp(55+(base-70)*.4);attributes.agility=clamp(53+(base-70)*.5);attributes.strength=clamp(base+5)}
  if(g==='WR'||g==='DB'){attributes.speed=clamp(base+5);attributes.strength=clamp(base-14)}
  if(g==='RB'){attributes.balance=clamp(base+6);attributes.strength=clamp(base+2)}
  if(g!=='QB'){attributes.accuracy=48;attributes.arm=clamp(base-18)}
  const weights=relevant[g]||relevant.RB,ovr=Math.round(weights.reduce((v,k)=>v+attributes[k],0)/weights.length);
  return {id:id+'-'+number,team:id,role,number,side,name:first[i]+' '+last[(i+ti*3)%last.length],attributes,ovr,style:g==='RB'?(attributes.strength>85?'Power runner':'One-cut runner'):g==='WR'?(attributes.speed>88?'Long-stride burner':'Quick separator'):g==='OL'?'Anchored blocker':g==='DL'?(attributes.strength>88?'Power rusher':'Swim rusher'):g==='DB'?'Fluid coverage':g==='QB'?'Balanced passer':'Pursuit tackler'};
 })});
 function player(id,number){return (rosters[id]||rosters.monarchs).find(p=>p.number===number)||rosters.monarchs[0]}
 function rating(id){const rows=rosters[id]||rosters.monarchs,avg=side=>Math.round(rows.filter(p=>p.side===side).reduce((n,p)=>n+p.ovr,0)/rows.filter(p=>p.side===side).length),offense=avg('offense'),defense=avg('defense');return {offense,defense,overall:Math.round((offense+defense)/2)}}
 function openDepthChart(selected='monarchs'){
  let dialog=document.getElementById('footballDepthChart');
  if(!dialog){
   const css=document.createElement('style');css.textContent='#footballDepthChart{color:#e9f0f7;background:#0b1b2b;border:1px solid #7999b8;border-radius:18px;width:min(960px,94vw);max-height:88dvh;padding:20px;font:13px system-ui}#footballDepthChart::backdrop{background:#000b}#footballDepthChart header,#footballDepthChart .filters{display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:16px}#footballDepthChart button,#footballDepthChart select{min-height:44px;background:#18334a;color:#eef3f6;border:1px solid #7d9eb655;border-radius:8px;padding:8px}#footballDepthChart table{border-collapse:collapse;width:100%;white-space:nowrap}#footballDepthChart th,#footballDepthChart td{padding:10px 12px;text-align:left;border-bottom:1px solid #9bb4ce22}#footballDepthChart th{color:#e4c988}#footballDepthChart .roster-scroll{overflow:auto;max-height:55dvh}#footballDepthChart td:first-child{position:sticky;left:0;background:#0b1b2b}';document.head.append(css);
   dialog=document.createElement('dialog');dialog.id='footballDepthChart';dialog.innerHTML='<header><div><small>TEAM PERSONNEL</small><h2>Depth chart</h2></div><button type="button" data-close>Close</button></header><div class="filters"><label>Team <select data-team><option value="all">All teams</option></select></label><label>Position <select data-position><option value="all">All positions</option></select></label></div><p data-summary></p><div class="roster-scroll"><table><thead></thead><tbody></tbody></table></div><p>Personnel by position. Starters change with the selected formation. Ratings influence gameplay; execution still matters.</p>';
   document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();
   for(const [id,t]of Object.entries(teams)){const o=new Option(t.name,id);dialog.querySelector('[data-team]').add(o)}
   for(const role of [...new Set(positions.map(p=>p[0]))])dialog.querySelector('[data-position]').add(new Option(role,role));
   const headings=['PLAYER','TEAM','POS','#','OVR','STYLE',...keys.map(k=>({acceleration:'ACC',awareness:'AWR',accuracy:'THA',runBlock:'RBK',passBlock:'PBK',coverage:'COV',catching:'CTH',route:'RTE',strength:'STR',speed:'SPD',agility:'AGI',arm:'ARM',tackle:'TAK',shed:'SHD',balance:'BAL',stamina:'STA'}[k]))];
   const tr=document.createElement('tr');headings.forEach(text=>{const th=document.createElement('th');th.textContent=text;tr.append(th)});dialog.querySelector('thead').append(tr);
   const redraw=()=>{const id=dialog.querySelector('[data-team]').value,pos=dialog.querySelector('[data-position]').value,rows=Object.values(rosters).flat().filter(p=>(id==='all'||p.team===id)&&(pos==='all'||p.role===pos)).sort((a,b)=>a.team.localeCompare(b.team)||a.role.localeCompare(b.role)||b.ovr-a.ovr),tbody=dialog.querySelector('tbody');tbody.replaceChildren();for(const p of rows){const tr=document.createElement('tr');[p.name,teams[p.team].name,p.role,p.number,p.ovr,p.style,...keys.map(k=>p.attributes[k])].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});tbody.append(tr)}const r=rating(id);dialog.querySelector('[data-summary]').textContent=id==='all'?rows.length+' players across six teams':teams[id].name+' · OVR '+r.overall+' · OFF '+r.offense+' · DEF '+r.defense};
   dialog.querySelectorAll('select').forEach(s=>s.onchange=redraw);dialog.redraw=redraw;
  }
  dialog.querySelector('[data-team]').value=teams[selected]?selected:'all';dialog.redraw();if(!dialog.open)dialog.showModal();
 }
 window.FootballRoster={teams,rosters,player,rating,keys,openDepthChart};
})();
