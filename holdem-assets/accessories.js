/* Small, original costume sculpts. The cast builder supplies its batched helpers. */
(function(){
'use strict';
window.HoldEmAccessories=function(api,part){
 const {c,head,body,top,hem,b,waist,shoulder,standing,dealer,ell,sleeve,loft,trim,patch,material}=api;
 if(dealer)return;
 const costume=c.costume||'none',hat=c.hat||'none',big=c.style==='flat',round=c.style==='bald';
 const hw=big?.139:round?.137:c.style==='swept'?.094:.105;
 const gold=[.81,.58,.24],cream=[.94,.87,.69],white=[.92,.95,.92],ink=[.025,.040,.047],red=[.67,.085,.105];
 const shark=[.15,.40,.49],dino=[.17,.42,.21],chicken=[.92,.84,.64],orange=[.93,.43,.07],suit=[.79,.85,.87];
 const front=round?.259:.14*b+.035;
 const cloth=fn=>material(9,fn),metal=fn=>material(4,fn),rubber=fn=>material(2,fn);
 function ball(p,s,color,shape=1){ell(p,s,color,null,shape)}
 function pipe(points,r,color){trim(points,r,color)}
 function spike(a,mid,end,r,color){sleeve([a,mid,end],[r,r*.69,.0018],color,.80)}
 function star(x,y,z,size,color){const points=[];for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2,r=j%2?size*.43:size;points.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z])}patch(points,color)}
 function belly(color,depth=.025){ball([0,(hem+top)/2-.013,front],[waist*.83,(top-hem)*.435,depth],color,.88)}
 function hood(color){
  // A back shell and three framing pads leave the original face completely open.
  ball([0,head+.040,-.090],[hw+.051,.221,.115],color,.85);
  ball([0,head+.169,-.007],[hw+.052,.071,.137],color,.80);
  for(const s of[-1,1])ball([s*(hw+.027),head-.010,.047],[.030,.168,.079],color,.82);
  loft([[head-.194,.102,.073,.025],[head-.174,hw+.040,.116,.025],[head-.144,hw+.040,.107,.025]],color,.83);
 }
 function hoodRim(color,r=.004){
  pipe([[-hw-.008,head-.116,.112],[-hw-.029,head+.008,.119],[-hw-.006,head+.124,.118],[0,head+.147,.125],[hw+.006,head+.124,.118],[hw+.029,head+.008,.119],[hw+.008,head-.116,.112]],r,color);
 }

 if(part==='body'){
  if(costume==='shark')cloth(()=>{
   belly([.70,.82,.78]);
   pipe([[-waist*.54,hem+.066,front+.016],[0,hem+.047,front+.030],[waist*.54,hem+.066,front+.016]],.003,[.38,.61,.61]);
   for(const side of[-1,1]){
    // Fins are attached to the outer shoulders, leaving wrists and cards free.
    sleeve([[side*(shoulder+.010),body+.15,-.032],[side*(shoulder+.145),body+.056,-.096],[side*(shoulder+.171),body-.108,-.068]],[.052,.048,.004],shark,.35);
    pipe([[side*(shoulder+.010),body+.15,-.006],[side*(shoulder+.132),body+.05,-.061],[side*(shoulder+.169),body-.106,-.068]],.003,[.35,.60,.62]);
    for(let j=0;j<3;j++)pipe([[side*waist*.65,top-.11-j*.035,front-.003],[side*waist*.82,top-.13-j*.035,front-.009]],.0035,[.053,.19,.235]);
   }
   spike([0,body+.17,-.159],[0,body+.24,-.30],[0,body+.37,-.30],.092,shark);
   if(standing){
    sleeve([[0,hem+.04,-.12],[0,hem-.22,-.27],[.09,hem-.34,-.38]],[.09,.057,.020],shark,.72);
    for(const side of[-1,1])spike([.08,hem-.33,-.37],[.08+side*.105,hem-.36,-.40],[.08+side*.18,hem-.30,-.39],.046,shark);
   }
  });
  if(costume==='dino')cloth(()=>{
   belly([.70,.75,.33]);
   for(let j=0;j<4;j++){const yy=hem+.09+j*(top-hem-.17)/3;pipe([[-waist*.61,yy,front+.018],[0,yy-.008,front+.031],[waist*.61,yy,front+.018]],.003,[.40,.52,.19])}
   for(const side of[-1,1])for(let j=0;j<4;j++)ball([side*(waist*.77+.015),body-.055+j*.066,front-.013],[.015,.020,.0035],[.065,.26,.125]);
   for(let j=0;j<4;j++){const yy=hem+.07+j*.092;spike([0,yy,-.145],[0,yy+.042,-.245],[0,yy+.067,-.30],.040,[.78,.48,.125])}
   // A curled tail reads in the standing preview without a long obstructing prop.
   const tailY=standing?hem-.10:.62;
   sleeve([[0,tailY+.09,-.14],[.14,tailY-.02,-.34],[.34,tailY-.03,-.34],[.43,tailY+.12,-.23],[.37,tailY+.20,-.15]],[.100,.086,.062,.027,.0025],dino,.87);
   for(let j=0;j<3;j++){const x=.13+j*.09,z=-.34,yy=tailY+.04+j*.02;spike([x,yy,z],[x,yy+.07,z-.018],[x+.015,yy+.096,z-.009],.025,[.80,.48,.13])}
  });
  if(costume==='chicken')cloth(()=>{
   belly([.98,.91,.74],.030);
   for(const side of[-1,1]){
    // Overlapping short feather scallops decorate the sleeve, not the hand.
    for(let j=0;j<4;j++)ell([side*(shoulder+.025+j*.017),body+.078-j*.043,-.006],[.042,.071,.028],j%2?white:chicken,[side*.38,-1,.10],.88);
    pipe([[side*(shoulder-.015),body+.16,.043],[side*(shoulder+.025),body+.07,.056],[side*(shoulder+.055),body-.066,.041]],.004,[.72,.62,.40]);
    const footZ=standing?.088:.328,footX=side*.125*b;
    rubber(()=>{
     // Orange mascot boots replace the cast's shoes and meet the floor at y=.026.
     ball([footX,.072,footZ],[.080,.046,.122],orange,.67);
     for(let toe=0;toe<3;toe++){
      const spread=(toe-1)*.046,endZ=footZ+.173-(toe===1?0:.010);
      ell([footX+spread,.051,footZ+.100],[.020,.084,.020],orange,[(toe-1)*.21,.025,1],.74);
      spike([footX+spread*1.21,.048,endZ-.016],[footX+spread*1.23,.047,endZ+.001],[footX+spread*1.25,.039,endZ+.018],.010,[.98,.72,.27]);
      pipe([[footX+spread*.70,.073,footZ+.064],[footX+spread*.97,.072,footZ+.091]],.0017,[.67,.24,.026]);
     }
    });
   }
   for(let j=0;j<3;j++)ell([(j-1)*.049,hem+.075,-.205],[.046,.137,.030],chicken,[(j-1)*.3,.9,-.7],.85);
  });
  if(costume==='hotdog')cloth(()=>{
   const middle=(hem+top)/2-.015,height=(top-hem)*.57;
   for(const side of[-1,1]){
    ell([side*(waist*.89+.043),middle,.057],[.086,height,.140],[.70,.43,.18],[side*.05,1,0],.88);
    ell([side*(waist*.89+.020),middle,.137],[.063,height*.94,.080],[.93,.72,.38],[side*.04,1,0],.90);
    pipe([[side*(waist*.91+.021),middle-height*.83,.175],[side*(waist*.91+.040),middle,.205],[side*(waist*.91+.021),middle+height*.80,.175]],.004,[.99,.85,.55]);
    for(let j=0;j<9;j++){
     const yy=middle-height*.76+j*height*.183,xx=side*(waist*.89+.044)+(j%2?-.017:.016);
     ell([xx,yy,.211],[.0029,.007,.0020],cream,[.35,1,.05]);
    }
   }
   ball([0,middle,front+.003],[waist*.66,height*.89,.037],[.66,.19,.082],.80);
   const mustard=[];for(let j=0;j<13;j++)mustard.push([Math.sin(j*1.52)*waist*.47,middle-height*.74+j*height*1.48/12,front+.043]);
   pipe(mustard,.011,[.98,.69,.045]);
   for(let j=0;j<6;j++)ball([Math.sin(j*1.6+.6)*waist*.49,middle-height*.62+j*height*.22,front+.044],[.012,.006,.004],[.19,.42,.09],.63);
  });
  if(costume==='astronaut'){
   cloth(()=>{
    const silver=[.55,.64,.69],seam=[.30,.40,.46];
    // Soft suit panels and ribbed joints retain the character's silhouette.
    for(const side of[-1,1]){
     pipe([[side*waist*.77,hem+.042,front-.008],[side*waist*.89,body+.038,front-.020],[side*shoulder*.68,top-.065,.129]],.005,silver);
     for(let j=0;j<3;j++)pipe([[side*(shoulder-.015),body+.105-j*.019,.058],[side*(shoulder+.034),body+.082-j*.019,.075]],.003,seam);
    }
    ball([0,body+.010,front+.008],[waist*.71,.097,.026],silver,.45);
    ball([0,body+.021,front+.036],[waist*.60,.072,.0045],[.08,.17,.23],.45);
    for(let j=0;j<3;j++)ball([-.054+j*.05,body+.001,front+.043],[.012,.009,.003],[j===0?.80:.12,j===1?.75:.23,j===2?.72:.15],.48);
    pipe([[-.048,body+.044,front+.043],[.053,body+.044,front+.043]],.0025,[.59,.87,.87]);
    ball([0,body+.053,-.210],[shoulder*.76,.194,.109],suit,.58);
    for(const side of[-1,1]){
     ball([side*shoulder*.64,body+.06,-.261],[.048,.163,.065],silver,.70);
     pipe([[side*waist*.50,body-.031,front+.025],[side*(waist+.045),body-.080,.129],[side*(waist+.075),body-.044,-.046],[side*(waist+.045),body+.076,-.219]],.013,[.22,.30,.34]);
    }
   });
   metal(()=>{loft([[top-.056,.115,.103,0],[top-.038,.137,.123,0],[top-.014,.137,.123,0],[top+.010,.119,.106,0]],[.57,.68,.73],.84);for(const side of[-1,1])ball([side*.121,top-.019,.04],[.016,.023,.022],orange,.65)});
  }
  return;
 }
 if(part!=='head')return;
 // Attached to the same head rig as the face, including look-around animation.
 const glasses=c.glasses||'none';
 if(glasses!=='none'){
  const ex=big?.047:.042,ey=head+.034,z=round?.142:.139;
  const color=glasses==='hearts'?[.95,.12,.35]:glasses==='spiral'?[.12,.78,.67]:glasses==='cat'?[.40,.025,.12]:['round','aviator','stars'].includes(glasses)?gold:ink;
  metal(()=>{
   for(const side of[-1,1]){
    const cx=side*ex,points=[];
    if(glasses==='square'||glasses==='pixel'){
     for(const [x,y]of[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]])points.push([cx+x*.037,ey+y*.028,z]);
    }else if(glasses==='stars'){for(let j=0;j<=10;j++){const a=j*Math.PI/5+Math.PI/2,r=j%2?.023:.045;points.push([cx+Math.cos(a)*r,ey+Math.sin(a)*r,z]);}}else for(let i=0;i<=48;i++){
     const t=i/48*Math.PI*2;let x,y;
     if(glasses==='hearts'){x=Math.pow(Math.sin(t),3)*.040;y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.0026;}
     else if(glasses==='stars'){const r=i%5<2?.044:.028;x=Math.cos(t)*r;y=Math.sin(t)*r;}
     else{x=Math.cos(t)*.036;y=Math.sin(t)*.029;if(glasses==='cat')y+=Math.max(0,x*side)*.40;if(glasses==='aviator')y-=Math.max(0,-Math.sin(t))*.008;}
     points.push([cx+x,ey+y,z]);
    }
    pipe(points,glasses==='round'?.0024:.0042,color);
    pipe([[cx+side*.034,ey+.014,z],[side*(hw+.009),ey+.011,.070],[side*(hw+.010),ey-.014,.005]],.0032,color);
    if(['aviator','pixel'].includes(glasses))rubber(()=>patch(points.slice(0,-1).map(p=>[p[0],p[1],p[2]-.002]),[.025,.07,.10]));
    if(glasses==='spiral'){const spiral=[];for(let j=0;j<65;j++){const t=j/64*Math.PI*5,r=.030*j/64;spiral.push([cx+Math.cos(t)*r,ey+Math.sin(t)*r,z+.001])}pipe(spiral,.002,cream);}
    if(glasses==='pixel')for(let j=0;j<3;j++)rubber(()=>patch([[cx-.026+j*.012,ey+.015,z+.002],[cx-.016+j*.012,ey+.015,z+.002],[cx-.016+j*.012,ey+.005,z+.002],[cx-.026+j*.012,ey+.005,z+.002]],white));
   }
   pipe([[-.011,ey+.007,z],[0,ey+.013,z+.006],[.011,ey+.007,z]],.003,color);
   if(glasses==='aviator')pipe([[-ex,ey+.034,z],[ex,ey+.034,z]],.0025,gold);
  });
 }


 if(costume==='shark')cloth(()=>{
  hood(shark);hoodRim([.053,.21,.25],.006);
  ball([0,head+.193,.068],[hw*.89,.051,.107],shark,.75);
  for(const side of[-1,1]){
   ball([side*(hw+.020),head+.155,.082],[.022,.024,.015],white);
   rubber(()=>ball([side*(hw+.020),head+.157,.096],[.009,.013,.004],ink));
   for(let j=0;j<2;j++)pipe([[side*(hw+.040),head+.054-j*.04,.073],[side*(hw+.043),head+.03-j*.04,.073]],.003,[.046,.21,.255]);
  }
  for(let j=0;j<7;j++){const x=(j-3)*hw*.26,yy=head+.119+Math.abs(j-3)*.001;spike([x,yy,.127],[x,yy-.014,.128],[x,yy-.029,.128],.010,cream)}
  if(hat==='none')spike([0,head+.219,-.061],[0,head+.30,-.13],[0,head+.342,-.135],.037,shark);
 });
 if(costume==='dino')cloth(()=>{
  hood(dino);hoodRim([.44,.63,.30],.005);
  ball([0,head+.172,.084],[hw*.95,.056,.09],[.21,.48,.24],.74);
  for(const side of[-1,1]){
   ball([side*(hw+.018),head+.127,.086],[.021,.026,.013],cream);
   rubber(()=>ball([side*(hw+.018),head+.128,.098],[.006,.015,.0035],ink));
   ball([side*.043,head+.188,.161],[.009,.005,.003],[.055,.22,.095]);
  }
  if(hat==='none')for(let j=0;j<4;j++){const z=-.14+j*.063;spike([0,head+.19,z],[0,head+.25,z-.012],[0,head+.28-(j%2)*.02,z-.006],.026,[.91,.57,.16])}
 });
 if(costume==='chicken')cloth(()=>{
  hood(chicken);hoodRim([.98,.92,.74],.006);
  if(hat==='none')for(let j=0;j<3;j++)ball([0,head+.23+Math.sin(j*Math.PI/2)*.032,-.080+j*.063],[.026,.056,.041],red,.78);
  // Beak sits on the hood brow above the player's unobstructed face.
  ball([0,head+.165,.139],[.049,.026,.053],orange,.54);
  pipe([[-.037,head+.160,.178],[0,head+.158,.191],[.037,head+.160,.178]],.0025,[.60,.22,.035]);
  for(const side of[-1,1]){
   ball([side*(hw+.016),head+.119,.094],[.017,.022,.008],white);
   rubber(()=>ball([side*(hw+.016),head+.120,.102],[.007,.010,.003],ink));
   ball([side*(hw+.028),head-.131,.093],[.025,.038,.017],red,.86);
  }
 });
 if(costume==='astronaut'){
  cloth(()=>{
   hood(suit);
   for(const side of[-1,1])ball([side*(hw+.052),head+.016,.016],[.024,.059,.060],[.39,.51,.57],.73);
  });
  metal(()=>{
   const points=[];for(let j=0;j<=20;j++){const a=j*Math.PI*2/20;points.push([Math.cos(a)*(hw+.043),head+.008+Math.sin(a)*.174,.128-Math.abs(Math.cos(a))*.016])}
   pipe(points,.010,[.60,.73,.78]);
   for(const side of[-1,1])ball([side*(hw+.057),head+.015,.052],[.024,.042,.031],orange,.60);
  });
  material(11,()=>pipe([[hw*.50,head+.149,.137],[hw*.88,head+.123,.126],[hw+ .026,head+.070,.117]],.004,[.67,.88,.93]));
 }
 if(hat==='none')return;

 // Hood costumes raise hats a little; every face remains the primary focal point.
 const hooded=['shark','dino','chicken','astronaut'].includes(costume),y=head+(hooded?.244:.137),r=hw+.032;
 if(hat==='cowboy'){
  cloth(()=>{
   ball([0,y-.009,.009],[r+.084,.018,r+.053],[.54,.31,.12],.80);
   for(const side of[-1,1])ell([side*(r+.05),y+.006,.010],[.047,.074,.127],[.61,.37,.16],[side*.94,.32,0],.82);
   loft([[y,r*.84,r*.68,0],[y+.037,r*.91,r*.69,-.006],[y+.122,r*.80,r*.62,-.009],[y+.154,r*.58,r*.50,-.007]],[.61,.38,.17],.67);
   ball([0,y+.150,-.006],[r*.59,.012,r*.48],[.69,.46,.22],.70);
   pipe([[0,y+.159,-.065],[0,y+.163,0],[0,y+.158,.055]],.008,[.35,.19,.082]);
  });
  rubber(()=>loft([[y+.017,r*.90,r*.704,-.004],[y+.046,r*.90,r*.704,-.004]],[.18,.075,.03],.73));
  metal(()=>{ball([0,y+.032,r*.715-.004],[.029,.020,.003],gold,.55);star(0,y+.032,r*.715,.014,[.33,.18,.065])});
 }
 if(hat==='crown')metal(()=>{
  loft([[y-.004,r*.95,r*.80,0],[y+.021,r*.99,r*.85,0],[y+.048,r*.98,r*.83,0]],gold,.89);
  for(let j=0;j<7;j++){
   const a=j*Math.PI*2/7,x=Math.cos(a)*r*.95,z=Math.sin(a)*r*.80,h=.082+(j%2)*.022;
   spike([x,y+.032,z],[x*1.05,y+.063,z*1.05],[x*1.10,y+h,z*1.10],.023,gold);
   ball([x*1.10,y+h,z*1.10],[.008,.008,.008],[.95,.83,.43]);
  }
  for(const side of[-1,0,1])ball([side*r*.58,y+.027,r*.82*Math.sqrt(1-side*side*.30)],[.012,.016,.005],side===0?[.71,.065,.12]:[.10,.54,.65],.50);
  for(let j=0;j<9;j++){const a=j*Math.PI/8;ball([Math.cos(a)*r*.98,y+.005,Math.sin(a)*r*.83],[.0035,.0035,.0035],cream)}
 });
 if(hat==='wizard')cloth(()=>{
  const purple=[.22,.16,.43];ball([0,y,0],[r+.078,.016,r+.056],purple,.76);
  sleeve([[0,y+.022,0],[-.026,y+.145,-.006],[.017,y+.261,.006],[.103,y+.324,.018]],[r*.94,r*.62,r*.27,.0025],purple,.79);
  loft([[y+.009,r*.947,r*.751,0],[y+.035,r*.920,r*.730,0]],[.50,.32,.61],.88);
  for(const [x,yy,z,size]of[[-.039,y+.101,.090,.020],[.030,y+.158,.066,.015],[-.002,y+.234,.035,.010]])star(x,yy,z,size,[.95,.78,.29]);
  pipe([[-r-.039,y+.006,.060],[0,y+.014,r+.05],[r+.039,y+.006,.060]],.0025,[.62,.49,.73]);
 });
 if(hat==='propeller'){
  cloth(()=>{
   ball([0,y+.021,-.004],[r,.066,r*.86],[.10,.34,.56],.75);
   ball([-r*.43,y+.027,.036],[r*.53,.052,r*.54],red,.75);
   ball([r*.43,y+.027,.036],[r*.53,.052,r*.54],[.90,.64,.11],.75);
   ball([0,y-.008,.088],[r*.87,.014,.082],[.085,.25,.43],.74);
   loft([[y-.010,r*.99,r*.84,0],[y+.004,r*.99,r*.84,0]],[.055,.20,.35],.90);
  });
  metal(()=>{pipe([[0,y+.080,0],[0,y+.142,0]],.006,[.47,.59,.63]);ball([0,y+.142,0],[.014,.014,.014],gold)});
  rubber(()=>{ell([-.071,y+.148,-.020],[.025,.128,.009],red,[-1,0,-.28],.65);ell([.071,y+.148,.020],[.025,.128,.009],[.12,.50,.68],[1,0,.28],.65)});
 }
 if(hat==='chef')cloth(()=>{
  loft([[y-.016,r*.95,r*.80,0],[y+.055,r*.98,r*.82,0],[y+.120,r*1.08,r*.88,-.002]],white,.71);
  for(let j=0;j<6;j++){const a=j*Math.PI/3;ball([Math.cos(a)*r*.60,y+.132+(j%2)*.014,Math.sin(a)*r*.48],[r*.65,.091,r*.53],white,.82)}
  ball([0,y+.175,0],[r*.87,.071,r*.75],white,.85);
  for(let j=0;j<7;j++){const x=(j-3)*r*.24;pipe([[x,y+.007,r*.805],[x,y+.052,r*.823],[x*1.02,y+.098,r*.84]],.0018,[.72,.79,.77])}
  loft([[y-.012,r*.953,r*.807,0],[y+.007,r*.961,r*.812,0]],[.70,.18,.21],.79);
 });
 if(hat==='pirate'){
  rubber(()=>{
   ball([0,y+.026,-.015],[r,.080,r*.84],[.055,.049,.049],.79);
   patch([[-r-.071,y+.025,.074],[0,y+.160,.135],[r+.071,y+.025,.074],[0,y-.004,.125]],[.065,.055,.050]);
   for(const side of[-1,1])patch([[side*(r+.071),y+.025,.074],[0,y+.132,-r-.047],[0,y+.020,-.016]],[.048,.042,.044]);
   pipe([[-r-.069,y+.028,.076],[0,y+.161,.137],[r+.069,y+.028,.076]],.005,gold);
   for(const side of[-1,1])pipe([[side*(r+.066),y+.027,.073],[0,y+.134,-r-.049]],.004,[.52,.36,.15]);
   loft([[y-.008,r*.97,r*.825,0],[y+.016,r*.97,r*.825,0]],red,.79);
  });
  cloth(()=>{
   ball([0,y+.081,.126],[.020,.023,.004],cream,.77);
   for(const side of[-1,1])ball([side*.008,y+.085,.131],[.0045,.005,.002],ink);
   patch([[-.011,y+.066,.131],[.011,y+.066,.131],[.009,y+.060,.131],[-.009,y+.060,.131]],cream);
   pipe([[-.026,y+.056,.132],[.026,y+.044,.132]],.0033,cream);pipe([[-.026,y+.044,.133],[.026,y+.056,.133]],.0033,cream);
   sleeve([[r*.90,y+.008,-.055],[r*.94,y-.025,-.083],[r*.86,y-.089,-.070]],[.022,.016,.008],red,.40);
  });
 }
 if(hat==='viking'){
  metal(()=>{
   ball([0,y+.026,0],[r,.090,r*.84],[.39,.48,.53],.85);
   loft([[y-.010,r*1.01,r*.85,0],[y+.013,r*1.01,r*.85,0]],[.31,.23,.12],.85);
   pipe([[0,y+.002,-r*.85],[0,y+.080,-.044],[0,y+.114,0],[0,y+.080,.044],[0,y+.002,r*.85]],.008,gold);
   for(let j=0;j<7;j++){const a=j*Math.PI/6;ball([Math.cos(a)*r*1.017,y+.004,Math.sin(a)*r*.859],[.0045,.0045,.0045],gold)}
  });
  cloth(()=>{for(const side of[-1,1]){
   sleeve([[side*r*.90,y+.033,-.012],[side*(r+.088),y+.022,-.015],[side*(r+.125),y+.082,-.023],[side*(r+.095),y+.179,-.029]],[.034,.028,.018,.002],cream,.91);
   ball([side*r*.96,y+.030,-.014],[.018,.039,.038],[.42,.29,.13],.75);
  }});
 }
 if(hat==='frog')cloth(()=>{
  const green=[.27,.60,.22];ball([0,y+.025,-.006],[r,.066,r*.84],green,.75);ball([0,y-.010,.012],[r+.047,.016,r+.029],[.23,.48,.16],.71);
  for(const side of[-1,1]){
   ball([side*r*.58,y+.074,r*.32],[.044,.050,.037],green);
   ball([side*r*.58,y+.080,r*.55],[.033,.035,.012],cream);
   rubber(()=>{ball([side*r*.58,y+.081,r*.67],[.012,.020,.004],ink);ball([side*r*.58-.004,y+.088,r*.710],[.0035,.006,.001],white)});
  }
  pipe([[-.037,y+.020,r*.837],[0,y+.008,r*.859],[.037,y+.020,r*.837]],.0025,[.066,.26,.094]);
 });
 if(hat==='traffic'){
  rubber(()=>ball([0,y-.018,0],[r+.046,.018,r+.041],[.065,.076,.074],.40));
  cloth(()=>{
   loft([[y-.010,r*.99,r*.89,0],[y+.268,.009,.008,0]],orange,.81);
   for(const [yy,R]of[[.061,.745],[.145,.445]])loft([[y+yy,r*R,r*R*.9,0],[y+yy+.027,r*(R-.094),r*(R-.094)*.9,0]],white,.81);
   ball([0,y+.269,0],[.010,.005,.009],[.68,.25,.035],.75);
  });
 }
 if(hat==='tophat'){
  rubber(()=>{
   ball([0,y-.005,0],[r+.066,.017,r+.043],[.040,.044,.059],.76);
   loft([[y,r*.82,r*.73,0],[y+.177,r*.89,r*.79,-.011],[y+.198,r*.94,r*.83,-.011]],[.055,.057,.077],.73);
   ball([0,y+.196,-.011],[r*.94,.013,r*.83],[.075,.081,.10],.76);
  });
  cloth(()=>{
   loft([[y+.010,r*.825,r*.735,-.001],[y+.044,r*.838,r*.745,-.003]],[.40,.11,.27],.73);
   patch([[-.066,y+.019,r*.75],[-.023,y+.013,r*.77],[-.012,y+.078,r*.81],[-.057,y+.084,r*.78]],cream);
   ball([-.038,y+.056,r*.794],[.007,.009,.0015],ink);
   patch([[-.039,y+.053,r*.796],[-.046,y+.044,r*.796],[-.032,y+.042,r*.796]],ink);
   sleeve([[r*.86,y+.039,-.026],[r+.027,y+.118,-.042],[r+.003,y+.182,-.067]],[.016,.025,.002],[.51,.24,.45],.30);
  });
 }
};
})();
