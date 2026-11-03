export const SIZE=8;
export const BLACK=1,WHITE=-1;
const DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
export const WEIGHTS=[120,-28,18,5,5,18,-28,120,-28,-45,-8,-8,-8,-8,-45,-28,18,-8,14,2,2,14,-8,18,5,-8,2,1,1,2,-8,5,5,-8,2,1,1,2,-8,5,18,-8,14,2,2,14,-8,18,-28,-45,-8,-8,-8,-8,-45,-28,120,-28,18,5,5,18,-28,120];
export function initialBoard(){const b=Array(64).fill(0);b[3*8+3]=WHITE;b[4*8+4]=WHITE;b[3*8+4]=BLACK;b[4*8+3]=BLACK;return b}
export function flipsFor(board,pos,player){if(pos<0||pos>=64||board[pos])return [];let found=[];const r=Math.floor(pos/8),c=pos%8;for(const [dr,dc] of DIRS){let rr=r+dr,cc=c+dc,taken=[];while(rr>=0&&rr<8&&cc>=0&&cc<8){const v=board[rr*8+cc];if(v===-player){taken.push(rr*8+cc);rr+=dr;cc+=dc;continue}if(v===player&&taken.length)found.push(...taken);break}}return found}
export function legalMoves(board,player){let out=[];for(let i=0;i<64;i++)if(flipsFor(board,i,player).length)out.push(i);return out}
export function makeMove(board,pos,player){const flips=flipsFor(board,pos,player);if(!flips.length)return null;const out=board.slice();out[pos]=player;for(const i of flips)out[i]=player;return{board:out,flips}}
export function count(board){return{black:board.filter(x=>x===BLACK).length,white:board.filter(x=>x===WHITE).length}}
export function finished(board){return !legalMoves(board,BLACK).length&&!legalMoves(board,WHITE).length}
function score(board,player){let score=0;for(let i=0;i<64;i++)score+=board[i]*WEIGHTS[i]*player;const mine=legalMoves(board,player).length,other=legalMoves(board,-player).length;score+=(mine-other)*8;const n=count(board);score+=(n.black-n.white)*player*(n.black+n.white>48?5:.75);return score}
function minimax(board,turn,player,depth,alpha,beta,pass=0){const moves=legalMoves(board,turn);if(depth===0||pass===2||!moves.length&&!legalMoves(board,-turn).length)return score(board,player);
if(!moves.length)return minimax(board,-turn,player,depth-1,alpha,beta,pass+1);
let best=turn===player?-Infinity:Infinity;
for(const pos of moves.sort((a,b)=>WEIGHTS[b]-WEIGHTS[a])){const next=makeMove(board,pos,turn).board;const value=minimax(next,-turn,player,depth-1,alpha,beta,0);if(turn===player){best=Math.max(best,value);alpha=Math.max(alpha,best)}else{best=Math.min(best,value);beta=Math.min(beta,best)}if(alpha>=beta)break}return best
}
export function chooseMove(board,player,difficulty='normal',rng=Math.random){if(!['easy','normal','hard','expert'].includes(difficulty))difficulty='easy';const legal=legalMoves(board,player);if(!legal.length)return null;const depth=difficulty==='expert'?4:difficulty==='hard'?3:difficulty==='normal'?1:0;
const ranked=legal.map(pos=>{const next=makeMove(board,pos,player);let value;
if(difficulty==='easy')value=next.flips.length*7+WEIGHTS[pos]*.2;
else if(depth===1)value=score(next.board,player);
else value=score(next.board,player)*.18+minimax(next.board,-player,player,depth-1,-Infinity,Infinity);
return {pos,value:value+(rng()-.5)*(difficulty==='easy'?12:difficulty==='normal'?3:.04)}
}).sort((a,b)=>b.value-a.value);return ranked[0].pos}
