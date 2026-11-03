/** Pure rules: no browser dependencies. */
export const COLORS = [
  {id:'white',name:'Blanco',hex:'#f7eee0',light:'#ffffff',dark:'#b7a595'},
  {id:'red',name:'Rojo',hex:'#d93d32',light:'#fc9c7b',dark:'#711c1d'},
  {id:'black',name:'Negro',hex:'#30313b',light:'#898994',dark:'#07070b'},
  {id:'yellow',name:'Amarillo',hex:'#f4c334',light:'#fff4a0',dark:'#9e5717'},
  {id:'blue',name:'Azul',hex:'#2682d2',light:'#a2d5ff',dark:'#143b7e'},
  {id:'green',name:'Verde',hex:'#40a46e',light:'#a2f4a1',dark:'#175d3d'},
  {id:'orange',name:'Naranja',hex:'#ed7f2f',light:'#ffd28d',dark:'#9e381c'},
  {id:'brown',name:'Marrón',hex:'#876045',light:'#ddac81',dark:'#36251e'},
  {id:'purple',name:'Morado',hex:'#a071c8',light:'#dfb9fa',dark:'#513274'},
  {id:'pink',name:'Rosa',hex:'#e78fa7',light:'#ffe0e5',dark:'#9d435f'}
];

export const LEVELS = {
  beginner: {label:'Beginner',subtitle:'Primeros pasos',slots:4,colorCount:4,maxAttempts:12,repeats:false,num:'01'},
  easy: {label:'Easy',subtitle:'Aprende a descifrar',slots:4,colorCount:6,maxAttempts:12,repeats:false,num:'02'},
  medium: {label:'Medium',subtitle:'Empieza el desafío',slots:5,colorCount:6,maxAttempts:11,repeats:true,num:'03'},
  hard: {label:'Hard',subtitle:'El tablero original',slots:5,colorCount:8,maxAttempts:10,repeats:true,num:'04'},
  expert: {label:'Experto',subtitle:'Dificultad progresiva',slots:5,colorCount:8,maxAttempts:10,repeats:true,num:'05'}
};

export function expertSettings(stage=1) {
  const s=Math.max(1,Math.floor(stage));
  const presets=[
    [5,8,10], [5,8,9], [6,8,10], [6,8,9],
    [6,9,9], [6,9,8], [7,9,9], [7,10,8], [7,10,7], [7,10,6]
  ];
  const [slots,colorCount,maxAttempts] = presets[Math.min(s,presets.length)-1];
  return {...LEVELS.expert, slots,colorCount,maxAttempts, stage:s};
}

// Rejection sampling avoids skew when picking indices from the cryptographic RNG.
export function randomIndex(max, rng=globalThis.crypto) {
  if (!Number.isInteger(max) || max < 1 || max > 4294967296) throw new RangeError('Invalid range');
  const range=4294967296;
  const limit=Math.floor(range/max)*max;
  const value = new Uint32Array(1);
  let n;
  do { rng.getRandomValues(value); n=value[0]; } while(n>=limit);
  return n%max;
}

export function createSecret({slots,colorCount,repeats},rng=globalThis.crypto) {
  if (!Number.isInteger(slots)||slots<1||slots>7||!Number.isInteger(colorCount)||colorCount<1||colorCount>COLORS.length||(!repeats && slots>colorCount)) {
    throw new RangeError('Invalid game settings');
  }
  const colors=COLORS.slice(0,colorCount).map(c=>c.id);
  const result=[];
  for(let i=0;i<slots;i++){
    const pool = repeats ? colors : colors.filter(c=>!result.includes(c));
    result.push(pool[randomIndex(pool.length,rng)]);
  }
  return result;
}

export function scoreGuess(secret,guess) {
  if(secret.length!==guess.length) throw new RangeError('Lengths differ');
  let black=0;
  const secretLeft=[],guessLeft=[];
  for(let i=0;i<secret.length;i++) {
    if(secret[i]===guess[i]) black++;
    else {secretLeft.push(secret[i]);guessLeft.push(guess[i]);}
  }
  const counts=new Map();
  secretLeft.forEach(c=>counts.set(c,(counts.get(c)||0)+1));
  let white=0;
  for(const c of guessLeft){
    if((counts.get(c)||0)>0) {white++;counts.set(c,counts.get(c)-1);}
  }
  return {black,white};
}
