import {startDungeon} from './dungeon.js';
const vault=document.querySelector('.vault');
const title=document.querySelector('#title-screen');
const menu=document.querySelector('#game-menu');
const start=document.querySelector('#start');
const back=document.querySelector('#back');
const hint=document.querySelector('#footer-hint');
const motion=document.querySelector('#motion');
const canvas=document.querySelector('#dungeon');
const links=[...menu.querySelectorAll('a')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let stop=null,paused=reduced.matches,leaving=false,navTimer=null;
function renderMotion(){const time=stop?.time??(paused?2:0);stop?.();stop=startDungeon(canvas,{reducedMotion:paused,initialTime:time});motion.textContent=paused?'PLAY':'PAUSE';motion.setAttribute('aria-pressed',String(paused));}
function showMenu(open){
 vault.dataset.screen=open?'menu':'title';title.hidden=open;menu.hidden=!open;
 hint.textContent=open?'SELECT / ENTER':'ENTER / TAP TO START';
 (open?links[0]:start).focus();
}
start.addEventListener('click',()=>showMenu(true));
back.addEventListener('click',()=>showMenu(false));
motion.addEventListener('click',()=>{paused=!paused;renderMotion();});
reduced.addEventListener('change',e=>{paused=e.matches;renderMotion();});
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||leaving)return;
 if(vault.dataset.screen==='title'){
  if((e.key==='Enter'||e.key===' ')&&document.activeElement!==motion){e.preventDefault();showMenu(true);}return;
 }
 if(e.key==='Escape'){e.preventDefault();showMenu(false);return;}
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  e.preventDefault();const n=links.indexOf(document.activeElement),step=e.key==='ArrowDown'?1:-1;
  links[(n+step+links.length)%links.length].focus();
 }
});
for(const link of links)link.addEventListener('click',e=>{
 if(e.defaultPrevented||e.button!==0||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
 e.preventDefault();if(leaving)return;leaving=true;vault.classList.add('leaving');
 navTimer=setTimeout(()=>location.assign(link.href),reduced.matches?0:350);
});
addEventListener('pageshow',()=>{if(navTimer!==null)clearTimeout(navTimer);leaving=false;vault.classList.remove('leaving');});
addEventListener('pagehide',()=>stop?.());
addEventListener('pageshow',()=>renderMotion());
renderMotion();
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
