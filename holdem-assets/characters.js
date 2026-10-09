/* Tailored reference-inspired characters: lofted garments, expressive smooth heads,
   modeled hands and upholstery. Immutable material batches retain head/eye rigs. */
window.HoldEmCast=function(add,options={}){
 const cast=[
  {name:'Vince',look:'Plum blazer · gold chain',coat:[.28,.068,.18],shirt:[.065,.053,.07],hair:[.052,.026,.019],skin:[.75,.43,.27],build:.95,style:'swept'},
  {name:'Bruno',look:'Gold varsity jacket',coat:[.73,.43,.065],shirt:[.078,.10,.09],hair:[.071,.035,.024],skin:[.78,.48,.29],build:1.48,style:'flat'},
  {name:'Miles',look:'Blue shirt · suspenders',coat:[.12,.31,.49],shirt:[.12,.31,.49],hair:[.076,.039,.024],skin:[.79,.48,.30],build:.91,style:'wild'},
  {name:'Gus',look:'Forest cardigan · cream collar',coat:[.067,.23,.12],shirt:[.79,.72,.54],hair:[.18,.093,.047],skin:[.80,.50,.32],build:1.32,style:'bald'}
 ];
 let chosen=2;try{let v=Number(localStorage.getItem('holdem-character'));if(localStorage.getItem('holdem-character')!==null&&Number.isInteger(v)&&v>=0&&v<4)chosen=v}catch(e){}
 if(Number.isInteger(options.chosen)&&options.chosen>=0&&options.chosen<cast.length)chosen=options.chosen;
 if(options.mode==='catalog')return{cast,chosen,actors:[]};
 function dressed(c,index){
  const setting=options.customizations&&options.customizations[index]||{},normalized=window.HoldEmWardrobe?.normalize(setting)||{shirt:setting.shirt||setting.outfit||'signature',pants:setting.pants||'signature',hat:setting.hat||'none',costume:setting.costume||'none',facialHair:setting.facialHair||'signature'};
  const shirtStyle=['signature','evening','casual','hoodie','hawaiian','bowling','jersey','disco'].includes(normalized.shirt)?normalized.shirt:'signature',outfit=['signature','evening','casual'].includes(shirtStyle)?shirtStyle:'casual';
  const facialHair=['signature','clean','stubble','goatee','pencil','handlebar','boxed','fullbeard','muttonchops','vandyke','braided'].includes(normalized.facialHair)?normalized.facialHair:'signature';
  let result={...c,characterIndex:index,...normalized,shirt:shirtStyle,shirtColor:c.shirt,outfit,facialHair};
  if(outfit==='evening'){result.coat=c.coat.map(v=>v*.43+.025);result.shirtColor=[.87,.82,.70]}
  if(outfit==='casual'){result.coat=c.coat.map(v=>Math.min(.83,v*.72+.16));result.shirtColor=result.coat}
  const colors={hoodie:[.23,.12,.38],hawaiian:[.075,.40,.32],bowling:[.62,.085,.12],jersey:[.085,.23,.58],disco:[.54,.20,.62]};
  if(colors[shirtStyle]){result.coat=colors[shirtStyle].map((v,k)=>Math.min(.85,v*(.88+index*.055)+(k===index%3?.035:0)));result.shirtColor=result.coat}
  const pantsColors={signature:[.045,.055,.073],denim:[.065,.17,.28],cream:[.73,.66,.48],plaid:[.25,.075,.09],joggers:[.11,.12,.15],neon:[.16,.64,.25],shorts:[.54,.34,.12]};
  result.pantsColor=pantsColors[result.pants]||pantsColors.signature;
  const costumes={shark:[[.14,.38,.48],[.11,.27,.35]],dino:[[.16,.39,.19],[.12,.28,.14]],chicken:[[.88,.78,.54],[.82,.50,.08]],hotdog:[[.63,.20,.095],[.35,.105,.055]],astronaut:[[.76,.82,.84],[.67,.74,.77]]};
  if(costumes[result.costume]){result.coat=costumes[result.costume][0];result.shirtColor=result.coat;result.pantsColor=costumes[result.costume][1]}
  return result;
 }
 const batches=new Map(),actors=[],white=[.95,.90,.80],ink=[.017,.022,.020],gold=[.70,.49,.19];
 let ox=0,oz=0,angle=0,activeRig=null,activeMaterial=7,localPose=null,firstPersonSeat=null;
 function material(value,draw){const previous=activeMaterial;activeMaterial=value;draw();activeMaterial=previous}
 function batchFor(col){
  const key=(activeRig?activeRig.actor+':'+activeRig.part+':'+(activeRig.side||0):'static')+':'+activeMaterial+':'+col.join(',');
  let batch=batches.get(key);if(!batch){batch={data:[],color:col,material:activeMaterial,rig:activeRig};batches.set(key,batch)}return batch.data;
 }
 function world(p){if(localPose){const q=localPose;p=[p[0],q[1]-(p[2]-q[2]),q[2]+(p[1]-q[1])]}const q=[ox+p[0]*Math.cos(angle)+p[2]*Math.sin(angle),p[1],oz-p[0]*Math.sin(angle)+p[2]*Math.cos(angle)];return firstPersonSeat?HoldEmSeating.fromDefault(q,firstPersonSeat):q}
 function normal(p){if(localPose)p=[p[0],-p[2],p[1]];const q=[p[0]*Math.cos(angle)+p[2]*Math.sin(angle),p[1],-p[0]*Math.sin(angle)+p[2]*Math.cos(angle)];return firstPersonSeat?HoldEmSeating.direction(firstPersonSeat,q):q}
 function unit(v){let l=Math.hypot(...v)||1;return v.map(x=>x/l)}
 function power(v,e){return Math.sign(v)*Math.pow(Math.abs(v),e)}
 // Rounded superellipsoids give jaws and clipped hair deliberate, distinct silhouettes.
 function ell(p,s,col,axis=null,roundness=1){
  const d=batchFor(col),y=axis?unit(axis):[0,1,0],x=unit(Math.abs(y[1])<.98?[y[2],0,-y[0]]:[1,0,0]),z=[x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0]];
  const small=Math.max(...s)<.027||Math.min(s[0],s[2])<.016,lat=small?6:16,lon=small?10:24;
  function emit(a,b){let q=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)],v=p.map((t,i)=>t+x[i]*power(q[0],roundness)*s[0]+y[i]*power(q[1],roundness)*s[1]+z[i]*power(q[2],roundness)*s[2]),n=unit(p.map((_,i)=>x[i]*power(q[0],2-roundness)/s[0]+y[i]*power(q[1],2-roundness)/s[1]+z[i]*power(q[2],2-roundness)/s[2]));d.push(...world(v),...normal(n),0,0)}
  for(let j=0;j<lat;j++)for(let i=0;i<lon;i++){let a=j*Math.PI/lat,A=(j+1)*Math.PI/lat,b=i*2*Math.PI/lon,B=(i+1)*2*Math.PI/lon;for(let [u,v]of[[a,b],[A,B],[A,b],[a,b],[a,B],[A,B]])emit(u,v)}
 }
 function limb(a,b,r,col,depth=r){let v=b.map((n,i)=>n-a[i]);ell(a.map((n,i)=>(n+b[i])/2),[r,Math.hypot(...v)/2+r*.3,depth],col,v)}
 function strand(points,r,col){sleeve(points,points.map((_,i)=>Math.max(.001,r*(1-i/points.length))),col,.78)}
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const sub=(a,b)=>a.map((v,i)=>v-b[i]);
 // One continuous surface per garment. Ring interpolation keeps the shoulders,
 // waist, elbows and cuffs connected instead of overlapping primitive beads.
 function surface(fn,col,rows=20,cols=24){
  const d=batchFor(col),eps=.0001;
  function emit(u,v){const p=fn(u,v),du=sub(fn(Math.min(1,u+eps),v),fn(Math.max(0,u-eps),v)),dv=sub(fn(u,v+eps),fn(u,v-eps));let n=unit(cross(du,dv));d.push(...world(p),...normal(n),v,u)}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j/rows,A=(j+1)/rows,b=i/cols,B=(i+1)/cols;for(const [u,v]of[[a,b],[A,b],[A,B],[a,b],[A,B],[a,B]])emit(u,v)}
 }
 function interpolate(rings,u){
  let t=u*(rings.length-1),i=Math.min(rings.length-2,Math.floor(t)),f=t-i;
  const a=rings[Math.max(0,i-1)],b=rings[i],c=rings[i+1],d=rings[Math.min(rings.length-1,i+2)];
  return b.map((v,k)=>.5*((2*v)+(-a[k]+c[k])*f+(2*a[k]-5*v+4*c[k]-d[k])*f*f+(-a[k]+3*v-3*c[k]+d[k])*f*f*f));
 }
 function loft(rings,col,roundness=.85,cloth=false){surface((u,v)=>{let [y,w,depth,z,x=0]=interpolate(rings,u),a=v*Math.PI*2,ripple=cloth?1+(.009*Math.sin(a*7+u*21)+.005*Math.sin(a*11-u*13))*Math.sin(u*Math.PI):1;return [x+Math.max(.001,w)*power(Math.cos(a),roundness)*ripple,y,z+Math.max(.001,depth)*power(Math.sin(a),roundness)*ripple]},col,(rings.length-1)*3,28)}
 function bib(rows,col,front=null){surface((u,v)=>{const [y,w,z]=interpolate(rows,u),x=(v*2-1)*w;return [x,y,front?front(y,x)+.007:z-.008*Math.pow(x/w,2)]},col,26,10)}
 function sleeve(points,radii,col,depth=1,fold=0){
  const thin=Math.max(...radii)<.008,profile=radii.map(r=>[r]);
  surface((u,v)=>{const p=interpolate(points,u),a=interpolate(points,Math.max(0,u-.002)),b=interpolate(points,Math.min(1,u+.002)),axis=unit(sub(b,a)),basis=unit(Math.abs(axis[1])<.9?cross(axis,[0,1,0]):cross(axis,[0,0,1])),other=cross(basis,axis),theta=v*2*Math.PI,crease=1+fold*.025*Math.sin(theta*3+u*19)*Math.pow(Math.sin(u*Math.PI),2),r=Math.max(.0005,interpolate(profile,u)[0])*crease;return p.map((n,k)=>n+basis[k]*Math.cos(theta)*r+other[k]*Math.sin(theta)*r*depth)},col,(points.length-1)*(thin?3:7),thin?8:16);
 }
 function patch(points,col){const d=batchFor(col);let n=unit(cross(sub(points[1],points[0]),sub(points[2],points[0]))),reverse=n[2]<0;if(reverse)n=n.map(v=>-v);for(let i=1;i<points.length-1;i++)for(const p of(reverse?[points[0],points[i+1],points[i]]:[points[0],points[i],points[i+1]]))d.push(...world(p),...normal(n),0,0)}
 function trim(points,r,col){sleeve(points,points.map(()=>r),col)}
 function hand(p,side,skin,size=1,hang=false){
  const previousPose=localPose;if(hang)localPose=p;
  const [x,y,z]=p,shadow=skin.map(v=>v*.74);
  material(7,()=>{
   ell([x,y,z],[.048*size,.025*size,.067*size],skin,null,.75);
   for(let f=0;f<4;f++){
    const fx=x+(-.029+f*.019)*size,len=[.046,.062,.065,.053][f]*size;
    sleeve([[fx,y-.004,z+.035*size],[fx+side*.002,y-.008,z+.068*size],[fx+side*.004,y-.013,z+.035*size+len]], [.009*size,.009*size,.0065*size],skin,.77);
    ell([fx+side*.003,y-.006,z+.026*size+len],[.006*size,.0018,.010*size],skin.map(v=>Math.min(1,v*1.12)));
    trim([[fx-.007*size,y-.001,z+.052*size],[fx+.006*size,y-.001,z+.052*size]],.0009,shadow);
   }
   sleeve([[x-side*.035*size,y,z-.015*size],[x-side*.065*size,y-.005,z+.018*size],[x-side*.067*size,y-.013,z+.046*size]],[.016*size,.014*size,.010*size],skin,.9);
   trim([[x-side*.034*size,y+.016,z-.035*size],[x,y+.020,z-.030*size],[x+side*.034*size,y+.016,z-.035*size]],.001,shadow);
  });
  localPose=previousPose;
 }
 function person(c,x,z,yaw,dealer=false){
  ox=x;oz=z;angle=yaw;activeRig=null;
  const b=c.build,skin=c.skin,hair=c.hair,coat=c.coat,big=c.style==='flat',round=c.style==='bald',slick=c.style==='swept';
  const standing=options.mode==='portrait'&&!dealer,costumed=!dealer&&c.costume&&c.costume!=='none';
  const head=(dealer?1.76:big?1.52:round?1.46:1.50)+(standing?.185:0),body=dealer?1.24:standing?1.20:1.015;
  const actor={id:actors.length,x,z,yaw,headY:head,dealer,standing,self:options.showSelf&&c.characterIndex===chosen,characterIndex:c.characterIndex};actors.push(actor);
  const rig={actor:actor.id,pivot:[x,head-.12,z],yaw,eyeY:head+.033,headY:head};
  const bodyRig={actor:actor.id,part:'body'};activeRig=bodyRig;const headRig={...rig,part:'head'},eyeRig={...rig,part:'eyes'};
  // Tailored, continuous meshes follow each reference's body proportions.
  const waist=round?.244:big?.218:dealer?.113:.153,shoulder=big?.28:round?.223:dealer?.145:.185;
  const hem=dealer?.965:standing?.93:.745,top=body+.25,darkCoat=coat.map(v=>v*.67),lightCoat=coat.map(v=>Math.min(.95,v*1.13+.025));
  material(9,()=>{
   const trouserColor=dealer?[.34,.029,.046]:(c.pantsColor||[.045,.055,.073]),shorts=!costumed&&c.pants==='shorts',sport=!costumed&&['joggers','neon'].includes(c.pants);
   if(standing)loft([[.79,.022*b,.019,0],[.825,.075*b,.046,.002],[.875,.14*b,.093*b,.003],[.965,.155*b,.105*b,.003]],trouserColor,.88,true);
   for(const side of [-1,1]){
    const straight=standing||dealer,trouser=trouserColor,hip=[side*.093*b,standing?.965:dealer?.99:.66,-.015],upper=[side*.112*b,straight?.79:.595,straight?.018:.13],knee=[side*.124*b,straight?.55:.465,straight?.025:.24],calf=[side*.125*b,straight?.31:.285,straight?.034:.27],ankle=[side*.125*b,.107,straight?.040:.28];
    const legPoints=[hip,upper,knee,calf,ankle],legRadii=[.084*b,.078*b,big?.091:round?.081:.069,.063,sport?.043:.054];
    if(shorts){
     material(7,()=>sleeve([upper,knee,calf,ankle],[.075*b,big?.081:.065,.062,.043],skin,.93));
     const edge=[knee[0],knee[1]+.080,knee[2]-.025];sleeve([hip,upper,edge],[.093*b,.087*b,.084*b],trouser,1.06,1);
     sleeve([[edge[0],edge[1]+.012,edge[2]-.002],edge],[.087*b,.087*b],trouser.map(v=>v*.73),1.06);
    }else sleeve(legPoints,legRadii,trouser,1.03,1);
    if(!shorts)trim([[hip[0]+side*.062,hip[1],hip[2]],[knee[0]+side*.063,knee[1],knee[2]],[ankle[0]+side*.051,.15,ankle[2]]],.0028,trouser.map(v=>v*1.55));
    if(!costumed&&c.pants==='denim'){
     trim([[hip[0]-side*.025,hip[1]-.012,hip[2]+.069],[upper[0]-side*.035,upper[1]+.04,upper[2]+.074],[upper[0]+side*.021,upper[1]+.008,upper[2]+.073]],.0027,[.63,.45,.21]);
     for(let j=0;j<2;j++)trim([[knee[0]-.041,knee[1]+.025-j*.023,knee[2]+.070],[knee[0]+.036,knee[1]+.006-j*.023,knee[2]+.071]],.0021,[.17,.29,.40]);
    }
    if(!costumed&&c.pants==='plaid'){
     for(let u=.22;u<.93;u+=.12){const p=interpolate(legPoints,u),rr=interpolate(legRadii.map(r=>[r]),u)[0];trim([[p[0]-rr*.74,p[1],p[2]+rr*.63],[p[0],p[1],p[2]+rr*1.04],[p[0]+rr*.74,p[1],p[2]+rr*.63]],.0032,[.56,.37,.23])}
     for(const offset of[-.026,.026])trim(legPoints.map((p,i)=>[p[0]+offset,p[1],p[2]+legRadii[i]*1.02]),.0024,[.09,.11,.14]);
    }
    if(sport){
     for(let stripe=0;stripe<2;stripe++)trim(legPoints.map((p,i)=>[p[0]+side*(legRadii[i]*.81-stripe*.013),p[1],p[2]+legRadii[i]*.63]),.004,c.pants==='neon'?[.86,.14,.50]:[.77,.79,.74]);
     sleeve([[ankle[0],.148,ankle[2]],[ankle[0],.106,ankle[2]]],[.048,.046],darkCoat,1.02);
    }
    // Polished rounded shoes, separate soles and a toe cap.
    if(c.costume!=='chicken'){
     material(2,()=>{ell([ankle[0],.093,ankle[2]+.048],[.074,.045,.145],ink,null,.57);ell([ankle[0],.040,ankle[2]+.05],[.078,.014,.149],[.025,.02,.017],null,.53);ell([ankle[0],.121,ankle[2]+.008],[.049,.027,.068],[.053,.045,.038],null,.67)});
     for(let j=0;j<4;j++)trim([[ankle[0]-.029,.149-j*.0012,ankle[2]-.008+j*.017],[ankle[0]+.029,.149-j*.0012,ankle[2]+.002+j*.017]],.0025,[.105,.11,.115]);
    }
   }
   const torsoRings=[[hem,.9*waist,.11*b,.02],[hem+.04,waist,.117*b,.015],[body-.07,round?.269:waist*.99,round?.205:.13*b,round?.027:.015],[body+.065,shoulder*.94,round?.176:.13*b,.015],[body+.17,shoulder,.115*b,.002],[top,shoulder*.64,.080,-.004],[top+.01,.053,.053,0]],torsoRound=big?.73:.90;
   loft(torsoRings,coat,torsoRound,true);
   // Clothing overlays share the actual torso surface. A small measured gap
   // avoids intersections and jagged seams when the chest is seen obliquely.
   function front(y,x=0){
    let lo=0,hi=1;for(let k=0;k<12;k++){const u=(lo+hi)/2;if(interpolate(torsoRings,u)[0]<y)lo=u;else hi=u}
    const u=(lo+hi)/2,[,w,d,z]=interpolate(torsoRings,u),c=Math.max(-.999,Math.min(.999,Math.sign(x)*Math.pow(Math.abs(x)/Math.max(.001,w),1/torsoRound))),a=Math.acos(c),ripple=1+(.009*Math.sin(a*7+u*21)+.005*Math.sin(a*11-u*13))*Math.sin(u*Math.PI);
    return z+d*Math.pow(Math.sin(a),torsoRound)*ripple;
   }
   function fitted(points,col,gap=.012){
    const data=batchFor(col),steps=6;
    function emit(a,b,c,u,v){const x=a[0]+(b[0]-a[0])*u+(c[0]-a[0])*v,y=a[1]+(b[1]-a[1])*u+(c[1]-a[1])*v,z=front(y,x)+gap,e=.0006,n=unit([-(front(y,x+e)-front(y,x-e))/(2*e),-(front(y+e,x)-front(y-e,x))/(2*e),1]);data.push(...world([x,y,z]),...normal(n),u,v)}
    for(let j=1;j<points.length-1;j++){let a=points[0],b=points[j],c=points[j+1];if(cross(sub(b,a),sub(c,a))[2]<0)[b,c]=[c,b];for(let i=0;i<steps;i++)for(let k=0;k<steps-i;k++){
     for(const [u,v]of[[i/steps,k/steps],[(i+1)/steps,k/steps],[i/steps,(k+1)/steps]])emit(a,b,c,u,v);
     if(i+k<steps-1)for(const [u,v]of[[(i+1)/steps,k/steps],[(i+1)/steps,(k+1)/steps],[i/steps,(k+1)/steps]])emit(a,b,c,u,v);
    }}
   }
   function fittedTrim(points,r,col,gap=.014){trim(points.map(p=>[p[0],p[1],front(p[1],p[0])+gap]),r,col)}
   // A subtle forward fabric fold above the waistband and vertical front opening.
   trim([[-waist*.78,hem+.026,.086*b],[0,hem+.018,.115*b],[waist*.78,hem+.026,.086*b]],.004,darkCoat);
   if(!costumed&&c.outfit==='casual'){
    loft([[top-.046,.059,.056,.009],[top+.006,.057,.055,.004],[top+.013,.054,.052,.004]],darkCoat);
    if(c.shirt==='casual'){fitted([[-.113,body+.075,.145*b],[-.047,body+.075,.151*b],[-.049,body-.003,.153*b],[-.106,body-.003,.149*b]],lightCoat);fittedTrim([[-.112,body+.072,.15*b],[-.048,body+.072,.157*b]],.003,darkCoat)}
   }else if(!costumed){
    const shirtFront=round?.218:big?.215:dealer?.123:.151,frontOffset=big?.040:round?.020:0;
    const shirtRows=[[top-.004,.055,.084],[top-.069,.073,(dealer?.117:.140)+frontOffset],[body+.025,.079,shirtFront],[body-.072,.078,round?.246:big?.218:dealer?.117:.148],[hem+.026,.073,round?.194:.134*b+.021]];
    bib(shirtRows,c.shirtColor||c.shirt,front);
    function frontAt(y){return front(y)+.007}
    for(let side of[-1,1]){
     patch([[side*.007,top-.016,front(top-.016,side*.007)+.016],[side*.052,top+.008,.080],[side*.087,top-.047,front(top-.047,side*.087)+.018],[side*.055,top-.101,front(top-.101,side*.055)+.018]],white);
     trim([[side*.052,top+.003,.084],[side*.084,top-.044,front(top-.044,side*.084)+.022],[side*.055,top-.097,front(top-.097,side*.055)+.022]],.0018,[.71,.67,.55]);
    }
    for(let j=0;j<5;j++){const y=top-.102-j*.052;material(4,()=>ell([0,y,frontAt(y)+.006],[.005,.005,.003],dealer?gold:[.57,.51,.38]))}
   }
   for(const side of[-1,1]){
    const shoulderP=[side*shoulder*.46,body+.146,-.004],elbow=standing?[side*(shoulder+.067),body-.075,.023]:[side*(dealer?.22:round?.335:big?.365:.285),body-.06,.105],wrist=standing?[side*(shoulder+.105),.965,.055]:[!dealer&&side===1?.135:side*.205*b,.853,dealer?.425:.352];
    activeRig={actor:actor.id,part:'arm',side,pivot:world(shoulderP),elbow:world(elbow),hand:world(standing?[wrist[0],wrist[1]-.045,wrist[2]]:[wrist[0],wrist[1]+.005,wrist[2]+.048])};
    const sleeveColor=dealer?white:(big&&c.outfit!=='casual'&&!costumed)?[.86,.82,.68]:coat,shortSleeve=!dealer&&!costumed&&['hawaiian','bowling','jersey'].includes(c.shirt);
    const armPoints=[shoulderP,[side*shoulder*.91,body+.145,-.001],[side*(shoulder+.035),body+.055,.021],elbow,standing?[wrist[0],wrist[1]+.04,wrist[2]-.005]:[wrist[0],wrist[1]+.003,wrist[2]-.03],wrist],armRadii=[.015,dealer?.063:big?.107:round?.101:.077,dealer?.061:big?.10:round?.098:.072,dealer?.051:big?.088:round?.075:.066,dealer?.038:big?.060:.048,dealer?.036:big?.058:.046];
    if(shortSleeve){sleeve(armPoints.slice(0,4),armRadii.slice(0,4),sleeveColor,1,1);material(7,()=>sleeve([elbow,armPoints[4],wrist],[armRadii[3]*.88,armRadii[4]*.84,armRadii[5]*.88],skin))}else sleeve(armPoints,armRadii,sleeveColor,1,1);
    // Forearm crease, elbow seam and cuff are wrapped around the actual arm.
    trim([[elbow[0]-side*.02,elbow[1]+.029,elbow[2]+.052],[elbow[0]-side*.006,elbow[1]+.028,elbow[2]+.066],[elbow[0]+side*.043,elbow[1]+.008,elbow[2]+.053]],.0024,sleeveColor.map(v=>v*.7));
    if(!shortSleeve){sleeve(standing?[[wrist[0],wrist[1]+.025,wrist[2]],[wrist[0],wrist[1]-.013,wrist[2]]]:[[wrist[0],wrist[1],wrist[2]-.038],[wrist[0],wrist[1],wrist[2]+.005]],[big?.063:dealer?.040:.049,big?.062:dealer?.041:.05],costumed?coat:c.outfit==='casual'?darkCoat:white,.85);material(4,()=>ell([wrist[0]-side*.032,wrist[1]+.026,wrist[2]-.012],[.006,.005,.006],gold))}
    hand(standing?[wrist[0],wrist[1]-.045,wrist[2]]:[wrist[0],wrist[1]+.005,wrist[2]+.048],side,skin,big?1.17:dealer?.90:1,standing);
    if(slick&&side===-1&&!standing&&!costumed){
     material(2,()=>sleeve([[wrist[0],wrist[1],wrist[2]-.006],[wrist[0],wrist[1],wrist[2]+.021]],[.047,.047],[.036,.025,.021],.86));
     material(4,()=>ell([wrist[0],wrist[1]+.044,wrist[2]+.008],[.021,.006,.019],gold));
     material(11,()=>ell([wrist[0],wrist[1]+.050,wrist[2]+.008],[.016,.002,.014],[.083,.10,.09]));
     material(4,()=>{trim([[wrist[0],wrist[1]+.053,wrist[2]+.008],[wrist[0]+.008,wrist[1]+.053,wrist[2]+.005]],.0015,gold);trim([[wrist[0],wrist[1]+.053,wrist[2]+.008],[wrist[0]-.003,wrist[1]+.053,wrist[2]+.018]],.0013,gold)});
    }
   }
   activeRig=bodyRig;
   if(slick&&c.outfit!=='casual'&&!costumed){
    for(const side of[-1,1]){
     fitted([[side*.055,top-.011,.087],[side*.133,top-.038,.108],[side*.095,top-.091,.151],[side*.129,top-.105,.154],[side*.055,body-.03,.160]],lightCoat,.016);
     fittedTrim([[side*.057,top-.009,.090],[side*.098,top-.091,.155],[side*.13,top-.107,.159],[side*.054,body-.032,.164]],.0025,[.48,.22,.33],.020);
     fitted([[side*.14,body-.07,.137],[side*.082,body-.085,.153],[side*.085,body-.109,.15],[side*.142,body-.094,.133]],darkCoat);
    }
    fitted([[-.124,body+.062,.141],[-.080,body+.062,.155],[-.085,body+.094,.151],[-.098,body+.086,.149],[-.108,body+.103,.144]],white,.017);
    material(4,()=>{trim([[-.051,top-.105,.155],[0,top-.162,.166],[.053,top-.103,.154]],.0045,gold);ell([0,top-.169,.169],[.011,.015,.003],gold,null,.65)});
   }
   if(big&&c.outfit!=='casual'&&!costumed){
    const rib=[.15,.18,.135];
    trim([[-.20,hem+.026,.14],[0,hem+.017,.188],[.20,hem+.026,.14]],.016,rib);
    for(let y of [hem+.016,hem+.031])trim([[-.194,y,.151],[0,y,.202],[.194,y,.151]],.0028,[.81,.76,.59]);
    for(let side of [-1,1])trim([[side*.053,top-.004,.083],[side*.082,top-.050,.124],[side*.059,top-.096,.147]],.011,rib);
    fitted([[-.185,body+.087,.156],[-.109,body+.092,.180],[-.112,body-.004,.190],[-.182,body-.007,.168]],white);
    fittedTrim([[-.16,body+.078,.170],[-.16,body+.004,.182]],.006,[.18,.28,.22],.023);
    for(let y of[body+.055,body+.022])fittedTrim([[-.16,y+.015,.177],[-.129,y+.010,.186],[-.129,y-.006,.189],[-.16,y-.013,.181]],.005,[.18,.28,.22],.023);
   }
   if(round&&c.outfit!=='casual'&&!costumed){
    for(let side of[-1,1]){
     trim([[side*.050,top-.005,.081],[side*.086,body+.12,.185],[side*.106,body-.04,.235],[side*.087,hem+.033,.211]],.017,lightCoat);
     fitted([[side*.113,body-.077,.229],[side*.197,body-.077,.186],[side*.19,body-.149,.180],[side*.115,body-.151,.224]],darkCoat);
     fittedTrim([[side*.114,body-.078,.234],[side*.197,body-.078,.191]],.004,lightCoat,.018);
    }
    material(4,()=>{trim([[.010,body-.042,.257],[.052,body-.140,.251],[.117,body-.088,.228]],.003,gold);ell([.006,body-.042,.260],[.007,.007,.003],gold)});
   }
   if(c.style==='wild'&&!dealer&&c.outfit!=='casual'&&!costumed)for(let side of[-1,1]){
    trim([[side*.089,top-.036,.100],[side*.109,body+.01,.143],[side*.11,hem+.019,.128]],.010,[.055,.031,.024]);
    material(4,()=>ell([side*.108,body-.069,.154],[.016,.021,.004],gold,null,.6));
    ell([side*.108,body-.069,.159],[.009,.013,.003],darkCoat,null,.6);
   }
   if((c.outfit==='evening'&&!costumed)||dealer){
    const bow=dealer?[.14,.026,.031]:coat;
    patch([[-.055,top-.023,.129],[-.010,top-.036,.152],[-.009,top-.057,.152],[-.055,top-.077,.132]],bow);
    patch([[.055,top-.023,.129],[.010,top-.036,.152],[.009,top-.057,.152],[.055,top-.077,.132]],bow);
    ell([0,top-.046,.15],[.013,.016,.010],bow);
   }
   if(!dealer&&!costumed){
    if(c.shirt==='hoodie'){
     ell([0,top-.018,-.053],[.127,.105,.093],coat,null,.87);
     trim([[-.082,top-.028,.069],[-.041,top-.080,front(top-.080,-.041)+.020],[0,top-.100,front(top-.1)+.019],[.041,top-.080,front(top-.080,.041)+.020],[.082,top-.028,.069]],.012,darkCoat);
     fitted([[-waist*.61,body-.064,0],[waist*.61,body-.064,0],[waist*.73,body-.167,0],[waist*.56,hem+.025,0],[-waist*.56,hem+.025,0],[-waist*.73,body-.167,0]],darkCoat,.013);
     for(const side of[-1,1]){
      fittedTrim([[side*waist*.61,body-.066,0],[side*waist*.39,body-.106,0],[side*waist*.56,hem+.041,0]],.0035,lightCoat,.021);
      fittedTrim([[side*.035,top-.075,0],[side*.031,body+.028,0],[side*.045,body-.007,0]],.0037,[.81,.77,.64],.024);
      material(4,()=>ell([side*.045,body-.007,front(body-.007,side*.045)+.026],[.004,.014,.004],gold));
     }
    }
    if(['hawaiian','bowling','disco'].includes(c.shirt)){
     for(const side of[-1,1])fitted([[side*.012,top-.018,0],[side*.072,top-.010,0],[side*.113,top-.110,0],[side*.048,top-.077,0]],c.shirt==='disco'?[.78,.57,.19]:c.shirt==='bowling'?[.045,.055,.065]:lightCoat,.022);
     if(c.shirt!=='disco')for(let j=0;j<5;j++){const y=top-.128-j*.056;ell([0,y,front(y)+.014],[.004,.004,.003],white)}
    }
    if(c.shirt==='hawaiian'){
     for(let j=0;j<9;j++){
      const x=((j%3)-1)*waist*.72+(j%2?.014:-.010),y=body+.087-Math.floor(j/3)*.104,petals=[];
      for(let k=0;k<10;k++){const a=k*Math.PI/5,r=k%2?.009:.024;petals.push([x+Math.cos(a)*r,y+Math.sin(a)*r,0])}
      fitted(petals,j%2?[.92,.46,.18]:[.85,.69,.38],.012);
      ell([x,y,front(y,x)+.016],[.006,.006,.003],[.64,.13,.10]);
      fitted([[x+.009,y+.014,0],[x+.041,y+.034,0],[x+.029,y+.006,0]], [.30,.59,.29],.014);
     }
    }
    if(c.shirt==='bowling')for(const side of[-1,1]){
     fitted([[side*.061,top-.083,0],[side*.105,top-.100,0],[side*.13,hem+.020,0],[side*.079,hem+.020,0]], [.83,.76,.56],.012);
     fittedTrim([[side*.058,top-.09,0],[side*.076,hem+.023,0]],.0025,[.055,.042,.035],.017);
    }
    if(c.shirt==='jersey'){
     fittedTrim([[-.065,top-.018,0],[0,top-.097,0],[.065,top-.018,0]],.014,[.86,.82,.71],.020);
     const digits={0:[0,1,2,3,4,5],8:[0,1,2,3,4,5,6]},segments=[[-.02,.07,.04,.012],[.019,.012,.011,.06],[.019,-.06,.011,.06],[-.02,-.07,.04,.012],[-.03,-.06,.011,.06],[-.03,.012,.011,.06],[-.02,0,.04,.012]];
     for(const [index,digit]of[0,8].entries())for(const id of digits[digit]){const [dx,dy,w,h]=segments[id],x=(index-.5)*.085+dx,y=body+.003+dy;fitted([[x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0]],white,.019)}
     fittedTrim([[-waist*.80,hem+.032,0],[0,hem+.028,0],[waist*.80,hem+.032,0]],.009,[.73,.27,.12],.011);
    }
    if(c.shirt==='disco'){
     fitted([[-.033,top-.011,0],[.033,top-.011,0],[0,body+.063,0]], [.10,.033,.14],.010);
     material(4,()=>{for(let row=0;row<4;row++)for(let col=-2;col<=2;col++){const x=col*waist*.33,y=body+.071-row*.07;if(row===0&&col===0)continue;ell([x,y,front(y,x)+.012],[.0038,.0038,.002],[.83,.55,.17],null,.55)}});
     fittedTrim([[-waist*.79,hem+.020,0],[0,hem+.012,0],[waist*.79,hem+.020,0]],.007,[.68,.43,.12],.011);
    }
   }
   if(dealer){
    for(const side of[-1,1])fittedTrim([[side*.075,body+.17,.092],[side*.087,body+.015,.103],[side*.069,body-.21,.103]],.0026,[.67,.15,.16],.013);
    material(4,()=>{ell([-.071,body+.048,.127],[.038,.013,.004],gold,null,.45);ell([.071,body-.09,.133],[.014,.018,.005],gold)});
   }
  });
  const accessoryAPI={c,head,body,top,hem,b,waist,shoulder,standing,dealer,ell,limb,sleeve,loft,trim,patch,material};
  if(!dealer&&window.HoldEmAccessories)window.HoldEmAccessories(accessoryAPI,'body');
  material(7,()=>sleeve([[0,top-.015,0],[0,head-.145,0],[0,head-.10,0]],[big?.073:round?.071:dealer?.043:.052,big?.077:round?.07:dealer?.044:.052,big?.078:round?.072:dealer?.044:.053],skin));
  activeRig=headRig;activeMaterial=7;
  const hw=big?.139:round?.137:dealer?.084:slick?.094:.105,hd=big?.112:round?.12:.108,shadowSkin=skin.map((v,i)=>v*([.85,.80,.76][i])),lip=[.39,.17,.115];
  // A continuous cheek-to-jaw profile: narrow theatrical dealer, angular Vince,
  // broad square Bruno, long Miles and a full round chin for Gus.
  const faceRings=dealer?
   [[-.174,.018,.028,.012],[-.147,.040,.061,.020],[-.080,.064,.087,.012],[-.005,.084,.098,.002],[.074,.079,.098,-.006],[.137,.061,.071,-.009],[.172,.009,.013,-.013]]:
   big?[[-.157,.055,.046,.027],[-.139,.102,.076,.021],[-.083,.126,.102,.012],[-.004,.139,.112,-.002],[.072,.131,.106,-.007],[.128,.119,.093,-.01],[.156,.064,.049,-.015],[.170,.008,.008,-.017]]:
   round?[[-.161,.031,.029,.019],[-.135,.087,.077,.033],[-.079,.129,.115,.018],[-.023,.142,.123,0],[.056,.135,.117,-.009],[.122,.097,.086,-.014],[.156,.039,.032,-.02],[.164,.007,.006,-.02]]:
   slick?[[-.167,.016,.025,.040],[-.14,.046,.063,.022],[-.079,.066,.086,.018],[-.018,.094,.103,.003],[.075,.092,.100,-.008],[.131,.073,.078,-.014],[.154,.022,.024,-.02]]:
   [[-.161,.027,.031,.019],[-.132,.061,.065,.016],[-.061,.089,.098,.006],[.003,.105,.108,-.003],[.078,.101,.099,-.011],[.133,.072,.070,-.015],[.159,.016,.018,-.019]];
  loft(faceRings.map(r=>[head+r[0],r[1],r[2],r[3]]),skin,big?.79:.97);
  for(let side of [-1,1]){
   const ex=side*(hw+.002);
   ell([ex,head-.005,.002],[dealer?.025:.024,.044,.024],skin);
   ell([ex+side*.005,head-.001,.023],[.012,.028,.006],shadowSkin);
   trim([[ex,head-.028,.026],[ex+side*.013,head-.014,.027],[ex+side*.012,head+.017,.025],[ex,head+.026,.023]],.0036,skin.map(v=>Math.min(1,v*1.06)));
   ell([ex-side*.007,head-.012,.028],[.006,.009,.006],skin);
   // Flush cheek pads below the sockets keep smiles expressive without a bobble head.
   ell([side*(big?.080:round?.078:.059),head-.030,big?.077:round?.091:.077],[big?.036:round?.045:.029,.025,.021],skin);
  }
  // Smaller almond openings, partly covered irises and soft lids avoid the startled stare.
  const eyeX=big?.047:dealer?.034:.042,eyeZ=big?.100:round?.106:.101;
  const opening=slick?.016:big?.018:round?.019:dealer?.021:.020;
  const eyeWidth=big?.030:dealer?.025:.028;
  for(const side of[-1,1])ell([side*eyeX,head+.031,eyeZ-.004],[eyeWidth+.004,opening+.010,.013],skin.map((v,i)=>v*([.92,.88,.86][i])));
  activeRig=eyeRig;activeMaterial=11;
  for(const side of[-1,1]){
   ell([side*eyeX,head+.033,eyeZ],[eyeWidth,opening,.018],[.86,.84,.77]);
   ell([side*(eyeX-.001),head+.034,eyeZ+.017],[.0135,.016,.006],[.034,.043,.029]);
   ell([side*(eyeX-.001),head+.034,eyeZ+.020],[.012,.0145,.005],slick?[.32,.20,.075]:big?[.23,.19,.09]:round?[.28,.19,.08]:[.17,.29,.19]);
   ell([side*(eyeX-.001),head+.034,eyeZ+.024],[.0065,.010,.003],ink);
   ell([side*(eyeX-.001)-.004,head+.040,eyeZ+.027],[.0026,.003,.0014],white);
  }
  activeRig=headRig;activeMaterial=7;
  for(const side of[-1,1]){
   const upper=[],lower=[];
   for(let j=0;j<13;j++){
    const u=j/12,x=(u*2-1)*eyeWidth,arch=Math.sin(u*Math.PI);
    upper.push([side*eyeX+x,head+.033+arch*opening*.72+(slick?side*x*.09:0),eyeZ+.012+arch*.014]);
    lower.push([side*eyeX+x,head+.032-arch*opening*.76,eyeZ+.012+arch*.012]);
   }
   trim(upper,big?.0055:.0045,skin);trim(lower,.0028,skin.map(v=>v*.89));
   ell([side*eyeX,head+.033+opening*.92,eyeZ+.014],[eyeWidth+.001,.0085,.017],skin);
   trim(upper.map(p=>[p[0],p[1]+.008,p[2]-.004]),.0012,shadowSkin);
   const brow=big?[[side*.012,head+.070,.112],[side*.049,head+.075,.110],[side*.088,head+.065,.089]]:
    slick?[[side*.014,head+.067,.112],[side*.043,head+.079+(side===-1?.006:0),.108],[side*.077,head+.064,.088]]:
    round?[[side*.013,head+.067,.115],[side*.046,head+.081,.112],[side*.082,head+.054,.090]]:
    dealer?[[side*.009,head+.070,.110],[side*.036,head+.089,.106],[side*.065,head+.064,.088]]:
    [[side*.012,head+.070,.110],[side*.038,head+.091,.108],[side*.078,head+.060,.089]];
   material(10,()=>{
    strand(brow,big?.010:round?.009:slick?.0065:.008,hair);
    for(let j=0;j<(slick?5:9);j++){
     const u=j/10,p=interpolate(brow,Math.min(.98,u));
     strand([[p[0],p[1]-.004,p[2]+.002],[p[0]+side*.003,p[1]+(round?.003:.005),p[2]+.003]],.0014,hair.map(v=>v*1.30+.01));
    }
   });
   limb([side*.025,head-.004,eyeZ+.006],[side*.061,head-.008,eyeZ-.001],.0035,shadowSkin);
  }
  // A modeled bridge, bulb and nostrils replace the generic button noses.
  ell([0,head+.002,.123],[dealer?.020:big?.029:.023,dealer?.052:.040,.029],skin);
  ell([0,head-(dealer?.036:.025),dealer?.158:.146],[round?.036:big?.030:.027,.023,dealer?.033:.026],skin);
  for(let side of [-1,1])ell([side*.018,head-.037,.141],[.013,.009,.010],shadowSkin);
  const mouthY=head-(dealer?.093:big?.092:round?.096:.094),mouthZ=round?.128:big?.115:.103;
  actor.mouthAnchor=world([-.024,mouthY+.004,mouthZ+.020]);actor.mouthForward=normal([-.35,-.02,.94]);actor.headPivot=[x,head-.12,z];
  if(dealer)activeRig={actor:actor.id,part:'mouth',pivot:world([0,mouthY,mouthZ])};
  if(slick){strand([[-.023,mouthY,.104],[.014,mouthY+.007,.112],[.048,mouthY+.025,.10]],.007,lip);limb([-.015,mouthY+.004,.110],[.032,mouthY+.016,.112],.006,white)}
  else{ell([0,mouthY,mouthZ],[big?.036:dealer?.025:.032,.010,.012],lip);ell([0,mouthY+.005,mouthZ+.010],[dealer?.018:.026,.004,.004],white)}
  activeRig=headRig;
  activeMaterial=10;
  const beard=dealer?'signature':c.facialHair||'signature';
  if(beard==='signature'){
   if(dealer){
    for(let side of [-1,1])strand([[0,head-.054,.154],[side*.024,head-.058,.152],[side*.044,head-.05,.137],[side*.062,head-.066,.119]],.012,hair);
    ell([0,head-.135,.084],[.013,.038,.016],hair,[0,1,-.20]);
   }else if(slick){
    for(let side of [-1,1])strand([[0,head-.053,.150],[side*.029,head-.049,.147],[side*.059,head-.032,.127],[side*.067,head-.021,.112]],.012,hair);
    ell([0,head-.145,.074],[.015,.023,.011],hair);
   }else if(big){
    for(let side of [-1,1]){limb([side*.006,head-.054,.145],[side*.067,head-.048,.128],.017,hair);strand([[side*.061,head-.049,.130],[side*.075,head-.068,.120],[side*.076,head-.09,.105]],.018,hair);limb([side*.126,head+.028,-.006],[side*.120,head-.086,.028],.027,hair)}
    ell([0,head-.132,.097],[.022,.025,.012],hair);
   }else if(round){
    for(let side of [-1,1]){ell([side*.043,head-.052,.143],[.054,.026,.025],hair,[side*.8,-.3,0]);strand([[side*.054,head-.048,.142],[side*.086,head-.064,.126],[side*.107,head-.071,.11]],.024,hair)}
    for(let j=0;j<9;j++){let t=j/8*Math.PI;ell([Math.cos(t)*.066,head-.102-Math.sin(t)*.030,.103],[.007,.010,.004],shadowSkin)}
   }else{
    for(let side of [-1,1]){ell([side*.027,head-.048,.15],[.040,.025,.023],hair,[side*.75,-.1,0]);strand([[side*.040,head-.05,.15],[side*.074,head-.064,.137],[side*.102,head-.047,.113],[side*.108,head-.018,.102],[side*.092,head-.012,.108]],.023,hair)}
    ell([0,head-.121,.085],[.043,.025,.017],shadowSkin);for(let j=0;j<7;j++)ell([-.035+j*.012,head-.123+Math.abs(j-3)*.004,.102],[.003,.009,.003],hair);
   }
  }else if(beard==='stubble'){
   for(let row=0;row<4;row++)for(let j=0;j<9;j++){
    let t=(j-4)/4,yy=head-.078-row*.015,zz=.111-Math.abs(t)*.032;
    if(row===0&&Math.abs(t)<.50)continue;
    ell([t*(big?.089:round?.093:.069),yy,zz],[.0032,.0045,.003],hair);
   }
  }else if(beard==='goatee'||beard==='vandyke'){
   ell([0,head-.127,.103],[beard==='vandyke'?.017:.024,beard==='vandyke'?.043:.034,.014],hair,[0,1,-.2]);
   for(const side of[-1,1])strand([[0,head-.058,.145],[side*.026,head-.055,.145],[side*(beard==='vandyke'?.055:.038),head-(beard==='vandyke'?.047:.065),.131]],.009,hair);
  }else if(beard==='pencil'||beard==='handlebar'){
   for(const side of[-1,1]){
    const points=beard==='handlebar'?[[side*.005,head-.053,.152],[side*.032,head-.052,.150],[side*.063,head-.046,.135],[side*.078,head-.030,.119],[side*.068,head-.021,.116]]:[[side*.004,head-.057,.151],[side*.023,head-.054,.149],[side*.044,head-.061,.135]];
    strand(points,beard==='handlebar'?.015:.0045,hair);
    if(beard==='handlebar')for(let j=0;j<4;j++)strand(points.map(p=>[p[0],p[1]+j*.002,p[2]+.006]),.0013,hair.map(v=>v*1.4+.018));
   }
  }else if(['boxed','fullbeard','muttonchops','braided'].includes(beard)){
   const full=beard==='fullbeard'||beard==='braided',width=big?.10:round?.095:.075;
   for(const side of[-1,1]){
    const points=[[side*width,head-.010,.073],[side*(width+.008),head-.060,.071],[side*width*.80,head-.113,.079],[side*.028,head-.147,.091]];
    sleeve(points,[.012,full?.024:.016,full?.032:.019,beard==='muttonchops'?.006:.017],hair,.58);
    if(beard!=='muttonchops')strand([[side*.003,head-.056,.153],[side*.031,head-.053,.148],[side*.055,head-.064,.129]],full?.012:.008,hair);
    for(let j=0;j<9;j++){
     const x=side*(.032+j*.006);
     strand([[x,head-.087,.093-Math.abs(x)*.19],[x-side*.004,head-.119,.103-Math.abs(x)*.20],[x-side*.014,head-.145,.103-Math.abs(x)*.14]],.0018,hair.map(v=>v*(j%2?1.35:.7)+.008));
    }
   }
   if(beard!=='muttonchops'){
    ell([0,head-.147,.092],[full?.058:.038,full?.046:.018,full?.021:.014],hair);
    for(let j=0;j<11;j++)strand([[(j-5)*.008,head-.122,.111],[(j-5)*.006,head-.166,.109],[(j-5)*.004,head-(full?.182:.157),.087]],.0016,hair.map(v=>v*(j%2?1.35:.75)+.007));
   }
   if(beard==='braided'){
    for(let j=0;j<8;j++)ell([Math.sin(j*2.5)*.004,head-.176-j*.007,.083-j*.001],[.012-j*.0008,.007,.010],hair);
    material(4,()=>ell([0,head-.219,.077],[.012,.005,.009],gold));
   }
  }
  const hairLight=hair.map((v,i)=>v*1.34+[.018,.012,.006][i]);
  const coveredHair=!dealer&&((c.hat&&c.hat!=='none')||['shark','dino','chicken','astronaut'].includes(c.costume));
  if(!coveredHair){
  if(big){
   ell([0,head+.136,-.014],[.128,.047,.102],hair,null,.47);
   for(let j=0;j<8;j++)limb([-.102+j*.029,head+.18,-.031],[-.102+j*.029,head+.178,.045],.003,hairLight);
  }else if(round){
   for(let side of [-1,1]){ell([side*.120,head+.025,-.035],[.034,.077,.053],hair);for(let j=0;j<3;j++)strand([[side*.121,head+.06+j*.012,-.034],[side*.158,head+.073+j*.011,-.026],[side*.17,head+.091+j*.009,-.019]],.009,hair)}
   for(let j=0;j<5;j++)strand([[-.113,head+.083,-.012],[-.082+j*.008,head+.155,.012],[-.027+j*.018,head+.164,.020],[.039+j*.012,head+.146,.013]],.0065,j%2?hairLight:hair);
  }else if(slick){
   ell([0,head+.113,-.025],[.098,.063,.096],hair);ell([-.014,head+.165,.021],[.073,.059,.077],hair,[-.35,1,-.25]);
   for(let j=0;j<7;j++){let t=(j-3)*.022;strand([[t,head+.104,.082],[t-.021,head+.192,.060],[t+.006,head+.215,-.004],[t+.057,head+.173,-.064]],.018,hair);strand([[t-.002,head+.134,.094],[t-.012,head+.190,.071],[t+.005,head+.207,.015]],.0035,hairLight)}
   for(let side of [-1,1])limb([side*.095,head+.07,-.019],[side*.089,head-.015,.015],.015,hair);
  }else{
   ell([0,head+.119,-.029],[hw*1.05,.066,.104],hair);
   // Broad curved locks sweep from a connected crown, then fold and taper.
   // The asymmetrical silhouette reads as tousled hair, not upright antlers.
   const locks=[
    [[-.067,.119,-.018],[-.10,.172,-.005],[-.158,.171,.014],[-.142,.139,.035]],
    [[-.037,.145,-.021],[-.059,.209,.009],[-.112,.223,.028],[-.124,.204,.040]],
    [[-.008,.143,-.024],[.003,.217,-.001],[-.018,.242,.020],[-.057,.222,.027]],
    [[.025,.137,-.026],[.081,.195,-.014],[.125,.19,.01],[.141,.163,.02]],
    [[.061,.115,-.01],[.107,.147,.021],[.148,.129,.049],[.134,.107,.049]],
    [[-.060,.131,.045],[-.075,.150,.075],[-.118,.116,.089],[-.107,.081,.073]],
    [[.029,.145,.049],[.065,.167,.092],[.061,.115,.110],[.039,.086,.105]],
    [[-.012,.149,.048],[-.004,.177,.083],[-.029,.124,.108],[-.053,.102,.095]],
    [[.055,.122,-.047],[.098,.184,-.058],[.081,.211,-.067],[.042,.205,-.074]]
   ];
   locks.forEach((lock,j)=>{
    const points=lock.map(p=>[p[0]*(dealer?.96:1),head+p[1],p[2]]),r=dealer?.023:.027;
    sleeve(points,[r*.79,r,r*.66,.0015],j%3===0?hairLight:hair,.62);
    const groove=points.map((p,k)=>[p[0]+.003,p[1]+.003,p[2]+.016*(1-k/4)]);
    strand(groove,.0023,j%3===0?hair:hairLight);
   });
   for(let side of [-1,1])strand([[side*.062,head+.133,.060],[side*.090,head+.090,.059],[side*.091,head+.041,.029]],.017,hair);
  }
  }else for(const side of[-1,1])limb([side*hw*.95,head+.045,-.005],[side*hw*.91,head-.02,.011],.012,hair);
  if(!dealer&&window.HoldEmAccessories)window.HoldEmAccessories(accessoryAPI,'head');
  activeRig={actor:actor.id,part:'chair'};
  if(!dealer&&!standing){
   const cw=big?.34:round?.31:.275,leather=[.068,.047,.034],piping=[.31,.22,.105];
   material(2,()=>{
    ell([0,.55,-.06],[cw,.062,.29],leather,null,.48);
    ell([0,.507,-.064],[cw+.009,.028,.296],[.035,.027,.023],null,.47);
    loft([[.57,cw*.85,.047,-.265],[.64,cw*.94,.057,-.275],[.93,cw,.065,-.30],[1.22,cw*.94,.062,-.34],[1.30,cw*.78,.054,-.355],[1.32,cw*.45,.027,-.36]],leather,.58);
    for(const side of[-1,1]){
     trim([[side*cw*.80,.61,-.20],[side*cw*.87,.88,-.236],[side*cw*.87,1.16,-.28],[side*cw*.70,1.29,-.31]],.004,piping);
     ell([side*(cw+.055),.795,.027],[.047,.039,.24],leather,null,.58);
    }
    for(const y of[.80,1.015,1.21])for(const side of[-1,0,1])ell([side*cw*.58,y,-.219-(y-.80)*.15],[.012,.012,.004],[.025,.021,.018]);
   });
   material(4,()=>{
    for(const side of[-1,1]){
     trim([[side*(cw-.06),.50,.10],[side*(cw-.035),.25,.12],[side*(cw+.022),.045,.18]],.025,[.12,.088,.048]);
     trim([[side*(cw-.058),.54,-.22],[side*(cw-.023),.26,-.29],[side*(cw+.018),.045,-.34]],.025,[.12,.088,.048]);
     trim([[side*(cw+.048),.59,-.14],[side*(cw+.057),.77,-.14]],.015,gold);
     trim([[side*(cw+.048),.59,.16],[side*(cw+.057),.77,.16]],.015,gold);
     for(let z of[.18,-.34])ell([side*(cw+.022),.035,z],[.032,.02,.036],[.21,.15,.074],null,.65);
    }
   });
  }
 }
 const dealer={build:.74,skin:[.81,.50,.31],hair:[.105,.058,.032],coat:[.49,.040,.057],shirt:white,style:'wild'};
 if(options.mode==='portrait'){
  person(dressed(cast[chosen],chosen),0,0,0,false);
 }else{
  person(dealer,...(options.dealerSeat||[-.25,-1.42,.03]),true);
  const seats=options.seats||[[-1.72,-.38,.92],[1.04,-1.18,-.48],[1.76,-.29,-.96]];
  cast.map((c,i)=>({c:dressed(c,i),index:i})).filter(item=>item.index!==chosen||options.showSelf).forEach((item,i)=>person(item.c,...(options.playerSeats?.[item.index]||seats[i])));
  // First-person sleeves identify the selected avatar without obscuring cards.
  if(!options.showSelf){ox=oz=angle=0;firstPersonSeat=options.playerSeats?.[chosen]||null;const me=dressed(cast[chosen],chosen),selfActor={id:actors.length,characterIndex:chosen,x:firstPersonSeat?.[0]||0,z:firstPersonSeat?.[1]||1.5,yaw:firstPersonSeat?.[2]||Math.PI,headY:1.38,self:true};selfActor.headPivot=HoldEmSeating.point(firstPersonSeat,0,-.37,1.26);selfActor.mouthAnchor=HoldEmSeating.point(firstPersonSeat,-.052,-.275,1.29);selfActor.mouthForward=HoldEmSeating.point(firstPersonSeat,-.35,.94,0).map((v,i)=>v-(i===0?firstPersonSeat[0]:i===2?firstPersonSeat[1]:0));actors.push(selfActor);for(let side of [-1,1]){
   activeRig={actor:selfActor.id,part:'arm',side:-side,pivot:world([side*.34,.70,1.76]),elbow:world([side*.245,.79,1.56]),hand:world([side*.17,.85,1.37])};
   const bareForearm=me.costume==='none'&&['hawaiian','bowling','jersey'].includes(me.shirt);
   if(bareForearm){material(9,()=>sleeve([[side*.34,.70,1.76],[side*.268,.775,1.60]],[.069,.065],me.coat));material(7,()=>sleeve([[side*.268,.775,1.60],[side*.22,.82,1.48],[side*.19,.84,1.41]],[.054,.049,.043],me.skin))}
   else material(9,()=>sleeve([[side*.34,.70,1.76],[side*.245,.79,1.56],[side*.19,.84,1.41]],[.069,.062,.047],me.coat));
   angle=Math.PI;hand([-side*.17,.85,-1.37],-side,me.skin);angle=0;
  }
 }}
 for(const {data,color,material,rig} of batches.values())add(data,color,material,null,rig);
 return {cast,chosen,actors,previewBounds:options.mode==='portrait'?{height:2.65,width:1.15,centerY:1.20}:null};
};
