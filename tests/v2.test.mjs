import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../games/mastermind/engine.js';
import {initialBoard,legalMoves,chooseMove} from '../games/othello/engine.js';
import {emptySea,chooseTarget} from '../games/battleship/engine.js';

test('Los tres juegos ofrecen las mismas cuatro dificultades',()=>{
 assert.deepEqual(Object.keys(LEVELS),['easy','normal','hard','expert']);
 const board=initialBoard();
 for(const k of Object.keys(LEVELS)){
  assert.ok(legalMoves(board,1).includes(chooseMove(board,1,k)));
  const target=chooseTarget(Array(100).fill(0),k);
  assert.ok(target>=0&&target<100);
 }
});

test('Battleship muestra un aviso de hundimiento y marca el barco completo',async()=>{
 const storage=new Map(),app={innerHTML:'',querySelector:()=>null,addEventListener(_name,fn){this.clickHandler=fn}};
 const userShots=Array(100).fill(0);userShots[0]=2;
 const enemySea=emptySea();enemySea[0]=0;enemySea[1]=0;
 const data={screen:'turn',mode:'local',difficulty:'normal',players:[{sea:emptySea(),ships:[],shots:userShots},{sea:enemySea,ships:[{name:'Destroyer',size:2,cells:[0,1]}],shots:Array(100).fill(0)}],active:0,aiRemaining:[5,4,3,3,2],message:'',last:null};
 storage.set('game-vault-battleship-v1',JSON.stringify(data));
 global.document={querySelector:()=>app};
 global.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 global.window={setTimeout};global.location={href:''};
 await import('../games/battleship/app.js?test=v2-sunk');
 assert.match(app.innerHTML,/ENEMY WATERS/);
 app.clickHandler({target:{closest(selector){return selector==='[data-cell]'?{dataset:{cell:'1'}}:null}}});
 assert.match(app.innerHTML,/SHIP SUNK/);
 assert.match(app.innerHTML,/Destroyer sunk at B1/);
 assert.match(app.innerHTML,/cell [^"\n]*sunk/);
 assert.match(app.innerHTML,/Player victory: 1/);
});
