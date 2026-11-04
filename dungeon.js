// 2D sprite scaling in fixed depth steps, like a vintage dungeon crawler.
// Identical arches pass the camera and reappear at the horizon indefinitely.
export const LOOP_SECONDS=4.8;
export const mod=(n,p)=>((n%p)+p)%p;
const FPS=12;
const SPACING=1.82;
export const cameraDistance=s=>Math.floor(mod(s,LOOP_SECONDS)*FPS);
const plate=typeof Image==='undefined'?null:new Image();
const arch=typeof Image==='undefined'?null:new Image();
let ready=false;
if(plate)plate.src=new URL('./assets/art/corridor-plate.png',import.meta.url).href;
if(arch){arch.onload=()=>{ready=true};arch.src=new URL('./assets/art/corridor-arch-v7.png',import.meta.url).href}
export function corridorPoint(x,y,width,height,seconds){return {frame:cameraDistance(seconds),x,y,width,height}}
export function renderDungeon(ctx,seconds){
 const {width:w,height:h}=ctx.canvas;
 ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
 if(!ready)return;
 const phase=cameraDistance(seconds)/(LOOP_SECONDS*FPS);
 ctx.imageSmoothingEnabled=false;
 // The photographed/reduced floor supplies stone grain under sprite arches.
 if(plate.complete&&plate.naturalWidth){ctx.drawImage(plate,0,1080,plate.naturalWidth,plate.naturalHeight-1080,0,h*.66,w,h*.34)}
 ctx.fillStyle='#050707a8';ctx.fillRect(0,h*.65,w,h*.35);
 for(let bay=0;bay<7;bay++){
  const s=.095*Math.pow(SPACING,bay+phase);
  const yy=h*.69+s*h*.18,span=Math.min(w*1.1,s*w*.62);
  if(yy>h+4)continue;
  ctx.fillStyle=bay%2?'#10110f':'#242018';
  ctx.fillRect(Math.round(w/2-span),Math.round(yy),Math.round(span*2),Math.max(1,Math.round(2*s)));
 }
 for(let bay=0;bay<7;bay++){
  const s=.095*Math.pow(SPACING,bay+phase);
  const dw=w*s,dh=dw*arch.naturalHeight/arch.naturalWidth;
  const dx=(w-dw)/2,dy=h*.69-dh*.68;
  ctx.drawImage(arch,Math.round(dx),Math.round(dy),Math.ceil(dw),Math.ceil(dh));
 }
 // Restrained torch flicker. There is no blackout or crop reset.
 const glow=Math.round((.07+.02*Math.sin(2*Math.PI*phase*3))*100)/100;
 ctx.fillStyle=`rgba(0,0,0,${glow})`;ctx.fillRect(0,0,w,h);
}
export function startDungeon(canvas,{reducedMotion=false,initialTime=0}={}){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return()=>{};
 canvas.width=240;canvas.height=400;
 let elapsed=initialTime,previous=null,id=0,last=-1,stopped=false;
 const draw=()=>{if(!stopped)renderDungeon(ctx,elapsed)};
 if(arch&&!ready)arch.addEventListener('load',draw,{once:true});
 if(plate&&!plate.complete)plate.addEventListener('load',draw,{once:true});
 function tick(now){
  if(stopped)return;
  if(previous!==null&&!document.hidden&&!reducedMotion)elapsed+=Math.min(now-previous,100)/1000;
  previous=now;const frame=cameraDistance(elapsed);
  if(!document.hidden&&(frame!==last||ready&&last===-1)){draw();last=frame}
  if(!reducedMotion)id=requestAnimationFrame(tick);
 }
 id=requestAnimationFrame(tick);
 const halt=()=>{stopped=true;cancelAnimationFrame(id)};
 Object.defineProperty(halt,'time',{get:()=>elapsed});return halt;
}
