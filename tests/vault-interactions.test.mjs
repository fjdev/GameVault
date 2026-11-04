import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {cameraDistance,corridorPoint,LOOP_SECONDS} from '../dungeon.js';
const source=fs.readFileSync(new URL('../vault.js',import.meta.url),'utf8').replace("import {startDungeon} from './dungeon.js';",'');
function setup(reduce=false){
 const events={},timers=[],visits=[],classes=new Set(),nodes={};let active;
 function node(){return{hidden:false,textContent:'',dataset:{},events:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},setAttribute(){},focus(){active=this;},addEventListener(k,fn){this.events[k]=fn;}};}
 for(const id of ['.vault','#title-screen','#game-menu','#start','#back','#footer-hint','#motion','#dungeon'])nodes[id]=node();
 const links=['mastermind','othello','battleship'].map(href=>({...node(),href}));nodes['#game-menu'].querySelectorAll=()=>links;nodes['.vault'].dataset.screen='title';
 const document={querySelector:x=>nodes[x],addEventListener:(k,fn)=>events['doc-'+k]=fn,get activeElement(){return active;}};
 vm.runInNewContext(source,{document,matchMedia:()=>({matches:reduce,addEventListener(){}}),startDungeon:()=>Object.assign(()=>{},{time:3}),setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},addEventListener:(k,fn)=>events[k]=fn,navigator:{},location:{protocol:'http:',assign:href=>visits.push(href)}});
 return{nodes,links,events,timers,visits,active:()=>active};
}
test('Press Start opens game selection; Escape returns to title',()=>{
 const s=setup();s.nodes['#start'].events.click();assert.equal(s.nodes['.vault'].dataset.screen,'menu');assert.equal(s.nodes['#title-screen'].hidden,true);assert.equal(s.active(),s.links[0]);
 s.events['doc-keydown']({key:'ArrowUp',preventDefault(){}});assert.equal(s.active(),s.links[2]);
 s.events['doc-keydown']({key:'Escape',preventDefault(){}});assert.equal(s.nodes['#game-menu'].hidden,true);assert.equal(s.active(),s.nodes['#start']);
});
test('Game selection keeps modified clicks native and prevents double navigation',()=>{
 const s=setup();s.links[0].events.click({button:0,ctrlKey:true,preventDefault(){throw Error('native');}});assert.equal(s.timers.length,0);
 const e={button:0,preventDefault(){}};s.links[1].events.click(e);s.links[1].events.click(e);assert.equal(s.timers.length,1);s.timers[0].fn();assert.deepEqual(s.visits,['othello']);
});
test('Reduced motion starts paused and skips the departure delay',()=>{
 const s=setup(true);assert.equal(s.nodes['#motion'].textContent,'PLAY');s.links[0].events.click({button:0,preventDefault(){}});assert.equal(s.timers[0].delay,0);
});
test('Corridor geometry repeats seamlessly after sixteen seconds',()=>{
 assert.equal(cameraDistance(0),cameraDistance(LOOP_SECONDS));
 for(const [x,y] of [[5,20],[120,195],[230,370]])assert.deepEqual(corridorPoint(x,y,240,400,0),corridorPoint(x,y,240,400,LOOP_SECONDS));
 assert.notEqual(cameraDistance(4),cameraDistance(5));
});
