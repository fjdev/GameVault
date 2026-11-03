export const FLEET=[{name:'Portaaviones',size:5},{name:'Acorazado',size:4},{name:'Submarino',size:3},{name:'Patrullero',size:3},{name:'Destructor',size:2}];
export const emptySea=()=>Array(100).fill(-1);
export function cellsFor(start,size,vertical){const r=Math.floor(start/10),c=start%10;const out=[];for(let t=0;t<size;t++){const rr=r+(vertical?t:0),cc=c+(vertical?0:t);if(rr>9||cc>9)return null;out.push(rr*10+cc)}return out}
export function canPlace(sea,start,size,vertical){const cells=cellsFor(start,size,vertical);return cells&&cells.every(x=>sea[x]===-1)?cells:null}
export function place(sea,ships,start,size,vertical,name){const cells=canPlace(sea,start,size,vertical);if(!cells)return null;const out=sea.slice();const id=ships.length;for(const i of cells)out[i]=id;return{sea:out,ships:[...ships,{name,size,cells}]}}
export function randomFleet(rng=Math.random){let sea=emptySea(),ships=[];for(const f of FLEET){let options=[];for(let i=0;i<100;i++)for(const vertical of[false,true])if(canPlace(sea,i,f.size,vertical))options.push({i,vertical});const selected=options[Math.floor(rng()*options.length)];const next=place(sea,ships,selected.i,f.size,selected.vertical,f.name);sea=next.sea;ships=next.ships}return{sea,ships}}
export function fire(target,shots,pos){if(pos<0||pos>=100||shots[pos]!==0)return null;const next=shots.slice();next[pos]=target.sea[pos]===-1?1:2;const ship=target.sea[pos];const sunk=ship>=0&&target.ships[ship].cells.every(i=>next[i]===2);const finished=target.ships.every(s=>s.cells.every(i=>next[i]===2));return{shots:next,hit:ship>=0,sunk,ship:ship>=0?target.ships[ship].name:null,finished}}
export function possibleTargets(shots){return shots.map((v,i)=>v===0?i:-1).filter(i=>i>=0)}
export function chooseTarget(shots,difficulty='medium',rng=Math.random,remaining=[5,4,3,3,2]){const free=possibleTargets(shots);if(!free.length)return null;
const random=(pool)=>pool[Math.floor(rng()*pool.length)];if(difficulty==='beginner')return random(free);
const hitPositions=shots.map((s,i)=>s===2?i:-1).filter(i=>i>=0);
const nearHit=[];for(const hit of hitPositions){const r=Math.floor(hit/10),c=hit%10;for(const [dr,dc]of[[-1,0],[1,0],[0,-1],[0,1]]){let rr=r+dr,cc=c+dc;if(rr<0||rr>9||cc<0||cc>9)continue;const p=rr*10+cc;if(shots[p]===0)nearHit.push(p)}}
if(difficulty==='easy'){const checker=free.filter(i=>(Math.floor(i/10)+i%10)%2===0);return random(checker.length?checker:free)}
if(difficulty==='medium')return nearHit.length?random(nearHit):random(free.filter(i=>(Math.floor(i/10)+i%10)%2===0).length?free.filter(i=>(Math.floor(i/10)+i%10)%2===0):free);
// Scores are derived only from observed hits/misses, never the hidden fleet.
const score=Array(100).fill(0);for(const length of remaining){for(let i=0;i<100;i++)for(const vertical of [false,true]){const cells=cellsFor(i,length,vertical);if(!cells||cells.some(p=>shots[p]===1))continue;const hits=cells.filter(p=>shots[p]===2).length;const likelihood=(hits?Math.pow(difficulty==='expert'?7:4,hits):1);for(const p of cells)if(shots[p]===0)score[p]+=likelihood}}
let max=-1,best=[];for(const p of free){let value=score[p];if(difficulty==='hard'&&(Math.floor(p/10)+p%10)%2!==0)value*=.8;if(difficulty==='expert'&&nearHit.includes(p))value*=2;if(value>max+.0001){max=value;best=[p]}else if(Math.abs(value-max)<.0001)best.push(p)}return random(best.length?best:free)
}
export function remainingSizes(target,shots){return target.ships.filter(s=>!s.cells.every(i=>shots[i]===2)).map(s=>s.size)}
