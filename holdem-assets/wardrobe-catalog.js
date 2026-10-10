/* Shared wardrobe IDs, labels and migration for saved character looks. */
(function(){
'use strict';
const option=(id,label,color,description)=>({id,label,color,description});
const categories=[
 {key:'shirt',label:'Shirts',options:[
  option('signature','Signature','#9a707f','Your character’s original tailored outfit.'),
  option('evening','Black tie','#383d4c','A formal jacket, crisp shirt and bow tie.'),
  option('casual','Easy Sunday','#6d91a3','A relaxed crew-neck with a chest pocket.'),
  option('hoodie','After Hours','#7558a3','A cozy hoodie with a pouch and drawstrings.'),
  option('hawaiian','Vacation Mode','#287a67','A tropical shirt with oversized flower details.'),
  option('bowling','Lucky Strike','#b32c36','A retro bowling shirt with contrast panels.'),
  option('jersey','All Star','#355ca8','A sporty jersey with team trim and a big number.'),
  option('disco','Disco Royale','#ad66b6','A gleaming party jacket with loud lapels.')
 ]},
 {key:'pants',label:'Pants',options:[
  option('signature','Tailored','#394153','Classic dark trousers.'),
  option('denim','Blue Jeans','#4776a3','Denim with seams and stitched pockets.'),
  option('cream','Sunday Chinos','#c9b987','Light chinos for a relaxed table look.'),
  option('plaid','Check Mate','#a95c5c','Bold plaid trousers.'),
  option('joggers','Track Stars','#544f75','Sporty joggers with side stripes.'),
  option('neon','Neon Green','#39b451','Bright green pants that refuse to blend in.'),
  option('shorts','Holiday Shorts','#d28853','Short trousers, bare calves and casual shoes.')
 ]},
 {key:'hat',label:'Hats',options:[
  option('none','No Hat','#63727a','Show off your character’s hair.'),
  option('cowboy','High Roller','#b08c5b','A curved-brim cowboy hat.'),
  option('crown','Table Royalty','#d9b34f','A gold crown with colorful jewels.'),
  option('wizard','Pocket Wizard','#7369b4','A crooked wizard hat with stars.'),
  option('propeller','Brain Spinner','#d1a24b','A bright propeller cap.'),
  option('chef','All-In Chef','#e2ded2','A tall, puffy chef’s toque.'),
  option('pirate','Captain Chips','#64434a','A pirate hat with a skull emblem.'),
  option('viking','Full House Viking','#9197a1','A horned helmet with a metal band.'),
  option('frog','Frog Thoughts','#78a453','A frog bucket hat with raised eyes.'),
  option('traffic','Caution: Bluffing','#e88538','A miniature traffic cone with safety stripes.'),
  option('tophat','Ace of Hats','#454254','A tall silk top hat with a card tucked into its band.')
 ]},
 {key:'glasses',label:'Glasses',options:[
  option('none','No glasses','#77858a','Keep your face uncovered.'),
  option('round','Book Club','#c4a36a','Fine round brass frames with open, clear lenses.'),
  option('square','The Classic','#373d4b','Thick black square frames.'),
  option('aviator','High Stakes','#ad976c','Gold aviators with dark blue lenses.'),
  option('cat','Cat Eye','#a74064','Swept burgundy cat-eye frames.'),
  option('stars','Star Struck','#e9bb39','Oversized gold star-shaped party glasses.'),
  option('hearts','Love Blind','#ec548e','Big pink heart-shaped frames.'),
  option('spiral','Hypno Hustler','#76d9cb','Turquoise frames with hypnotic spiral lenses.'),
  option('pixel','Deal With It','#595583','Oversized pixel sunglasses with bright checker glints.')
 ]},
 {key:'costume',label:'Costumes',options:[
  option('none','Mix & Match','#6a8781','Use your chosen shirt and pants.'),
  option('shark','Card Shark','#558ca4','A plush shark suit with a toothy open hood and fins.'),
  option('dino','Jurassic Jackpot','#739448','A friendly dinosaur with a tail and back spines.'),
  option('chicken','Chicken Dinner','#d8cda6','A chicken suit with wings, a comb and fluffy details.'),
  option('hotdog','Big Frank','#ca925a','A hot-dog suit with buns and a mustard squiggle.'),
  option('astronaut','Space Cadet','#c2d1d9','A space suit with a helmet frame and mission gear.')
 ]},
 {key:'facialHair',label:'Facial hair',options:[
  option('signature','Signature','#79523d','Your character’s original facial hair.'),
  option('clean','Clean Shave','#b98e71','A clean-shaven face.'),
  option('stubble','Stubble','#796b60','Short, close facial hair.'),
  option('goatee','Goatee','#6c4e37','A sculpted chin beard and neat mustache.'),
  option('pencil','Pencil mustache','#604738','A fine, carefully groomed vintage mustache.'),
  option('handlebar','Handlebar','#63462e','Thick whiskers with curled ends and groomed strands.'),
  option('boxed','Boxed beard','#71543c','Short, shaped cheek lines and a clean beard edge.'),
  option('fullbeard','Full beard','#664731','A full textured beard with layered strands.'),
  option('muttonchops','Mutton chops','#725139','Broad sideburns, an open chin, and plenty of character.'),
  option('vandyke','Van Dyke','#51382b','A pointed chin beard with a separate swept mustache.'),
  option('braided','Braided beard','#674830','A long woven chin beard finished with a gold cuff.')
 ]}
];
const defaults={shirt:'signature',pants:'signature',hat:'none',glasses:'none',costume:'none',facialHair:'signature'};
function normalize(value){
 const input=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const result={};
 for(const category of categories){const candidate=category.key==='shirt'?(input.shirt||input.outfit):input[category.key];result[category.key]=category.options.some(o=>o.id===candidate)?candidate:defaults[category.key]}
 return result;
}
function label(key,id){return categories.find(c=>c.key===key)?.options.find(o=>o.id===id)?.label||''}
window.HoldEmWardrobe={categories,normalize,label};
})();
