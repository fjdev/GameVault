import assert from 'node:assert/strict';
import {createSecret,scoreGuess,expertSettings,COLORS} from '../engine.js';
const eq=(s,g,b,w)=>assert.deepEqual(scoreGuess(s,g),{black:b,white:w});
eq(['red','blue','green','yellow'],['red','green','yellow','blue'],1,3);
eq(['red','red','blue','blue'],['red','blue','blue','blue'],3,0);
eq(['red','blue','red','green'],['blue','red','yellow','yellow'],0,2);
eq(['red','red','red','red'],['blue','blue','blue','blue'],0,0);
eq(['red','blue','green','yellow','white'],['red','blue','green','yellow','white'],5,0);
for(const repeats of [false,true])for(const slots of [4,5,6,7]){
 const cfg={slots,colorCount:8,repeats};
 for(let k=0;k<300;k++){
  const secret=createSecret(cfg);
  assert.equal(secret.length,slots);
  assert(secret.every(c=>COLORS.slice(0,8).some(x=>x.id===c)));
  if(!repeats)assert.equal(new Set(secret).size,slots);
 }
}
assert.equal(expertSettings(1).slots,5);
assert.equal(expertSettings(10).slots,7);
assert.equal(expertSettings(900).maxAttempts,6);
console.log('Motor de juego: pruebas superadas');
