// An authored 2D step loop: discrete crops suggest motion without a 3D camera.
export const LOOP_SECONDS=3.2;
export const mod=(n,p)=>((n%p)+p)%p;
export const cameraDistance=s=>Math.floor(mod(s,LOOP_SECONDS)/(LOOP_SECONDS/4));
const plate=typeof Image==='undefined'?null:new Image();
if(plate)plate.src=new URL('./assets/art/corridor-plate.png',import.meta.url).href;
let ready=false;
if(plate)plate.onload=()=>{ready=true};
export function corridorPoint(x,y,width,height,seconds){return {frame:cameraDistance(seconds),x,y,width,height}}
export function renderDungeon(ctx,seconds){
 const {width:w,height:h}=ctx.canvas;
 ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
 if(!ready)return;
 const step=cameraDistance(seconds),zoom=[1,1.035,1.075,1.12][step];
 const iw=plate.naturalWidth,ih=plate.naturalHeight,ax=iw*.5,ay=ih*.63;
 const sw=iw/zoom,sh=ih/zoom,sx=ax-sw*.5,sy=ay-sh*.63;
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(plate,sx,sy,sw,sh,0,0,w,h);
 // The black beat conceals the step reset as in a tile-based dungeon crawler.
 if(mod(seconds,LOOP_SECONDS)>LOOP_SECONDS-.095){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,w,h)}
 const flicker=Math.floor(seconds*10)%5;
 if(flicker===0||flicker===3){ctx.fillStyle='rgba(0,0,0,.07)';ctx.fillRect(0,h*.38,w,h*.43)}
}
export function startDungeon(canvas,{reducedMotion=false,initialTime=0}={}){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return()=>{};
 canvas.width=240;canvas.height=400;
 let elapsed=initialTime,previous=null,id=0,last=-1,stopped=false;
 const draw=()=>{if(!stopped)renderDungeon(ctx,elapsed)};
 if(plate&&!ready)plate.addEventListener('load',draw,{once:true});
 function tick(now){
  if(stopped)return;
  if(previous!==null&&!document.hidden&&!reducedMotion)elapsed+=Math.min(now-previous,100)/1000;
  previous=now;const frame=Math.floor(elapsed*10);
  if(!document.hidden&&(frame!==last||ready&&last===-1)){draw();last=frame}
  if(!reducedMotion)id=requestAnimationFrame(tick);
 }
 id=requestAnimationFrame(tick);
 const halt=()=>{stopped=true;cancelAnimationFrame(id)};
 Object.defineProperty(halt,'time',{get:()=>elapsed});return halt;
}
