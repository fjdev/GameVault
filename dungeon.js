// Software-rendered, low-resolution corridor. No video, network assets or 3D dependency.
export const LOOP_SECONDS = 16;
export const mod = (n, period) => ((n % period) + period) % period;
export const cameraDistance = seconds => mod(seconds, LOOP_SECONDS) * 0.5;
const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const SIZE=128;
const hash=(x,y)=>{let n=Math.imul(x+1349,374761393)^Math.imul(y+1723,668265263);n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0;};
function texture(kind){
 const data=new Uint8Array(SIZE*SIZE);
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const row=Math.floor(y/32),shift=(row%2)*32,xx=mod(x+shift,64),yy=y%32;
  let value=88+(hash(Math.floor((x+shift)/64),row)%29);
  const noise=(hash(x,y)%9)-4+(hash(Math.floor(x/4),Math.floor(y/3))%25)-12;
  if(kind==='wall'){
   if(xx<2||yy<2)value=20;
   else if(xx===2||yy===2)value+=27;
   else if(xx>61||yy>29)value-=17;
   // Sparse chipped corners, never an overlaid noisy/grunge texture.
   if((xx<6&&yy<5)&&(hash(xx,row)%3===0))value-=25;
   if(xx>10&&xx<52&&yy>8&&yy<26&&mod(xx+row*7,31)===Math.floor(yy/3)&&hash(row,Math.floor((x+shift)/64))%3===0)value-=32;
  }else{
   const a=x%64,b=y%64;
   value=73+(hash(Math.floor(x/64),Math.floor(y/64))%20);
   if(a<2||b<2)value=21;else if(a===2||b===2)value+=12;
  }
  data[y*SIZE+x]=Math.max(0,value+noise);
 }
 return data;
}
const WALL=texture('wall'),FLOOR=texture('floor');
const sample=(tex,u,v)=>tex[mod(Math.floor(v),SIZE)*SIZE+mod(Math.floor(u),SIZE)];
export function corridorPoint(x,y,width,height,seconds){
 const phase=mod(seconds,LOOP_SECONDS),bob=Math.sin(phase*Math.PI*4)*0.9;
 const focal=width*.78,horizon=height*.43+bob;
 const dx=(x-width/2)/focal,dy=(y-horizon)/focal;
 const side=Math.abs(dx)>.00001?1.55/Math.abs(dx):10000;
 const plane=dy>0?1.05/dy:dy<0?1.9/-dy:10000;
 const depth=Math.min(side,plane,70);
 return {depth,z:cameraDistance(seconds)+depth,x:dx*depth,y:1.05-dy*depth,wall:side<plane,ceiling:dy<0};
}
export function renderDungeon(ctx,seconds){
 const width=ctx.canvas.width,height=ctx.canvas.height;
 const phase=mod(seconds,LOOP_SECONDS),cam=cameraDistance(seconds);
 const frame=ctx.createImageData(width,height),pixels=frame.data;
 const bob=Math.sin(phase*Math.PI*4)*.9,focal=width*.78,horizon=height*.43+bob;
 const flicker=.95+Math.sin(phase*Math.PI*12)*.04+Math.sin(phase*Math.PI*26)*.025;
 for(let y=0;y<height;y++){
  const dy=(y-horizon)/focal;
  for(let x=0;x<width;x++){
   const dx=(x-width/2)/focal,side=Math.abs(dx)>.00001?1.55/Math.abs(dx):10000;
   const plane=dy>0?1.05/dy:dy<0?1.9/-dy:10000;
   const depth=Math.min(side,plane,70),wall=side<plane;
   const wx=dx*depth,wz=cam+depth,wy=1.05-dy*depth;
   let tex=wall?sample(WALL,wz*64,wy*64):sample(FLOOR,wx*48,wz*48);
   // Repeating engaged stone piers, visible as the player walks past.
   if(wall&&mod(wz,4)<.24)tex*=.67;
   if(!wall&&dy<0)tex*=.64;
   let light=0,warm=0;
   // Torchlight belongs to the room; there is no global daylight.
   const hand=2.1/(1+depth*depth*.7+wx*wx*.45);
   light+=hand*flicker;warm+=hand*.75;
   const nearest=Math.floor(wz/4);
   for(let k=nearest-1;k<=nearest+1;k++){
    const tz=k*4+2,dz=wz-tz,vertical=wy-1.65;
    for(const tx of [-1.42,1.42]){
     const dist=(wx-tx)**2+dz*dz+vertical*vertical;
     const torch=1.8/(1+dist*2.4)*flicker;
     light+=torch;warm+=torch;
    }
   }
   light*=Math.exp(-depth*.12);
   const dither=(BAYER[(y%4)*4+x%4]/16-.5)*.16;
   const level=Math.max(0,Math.min(1,(tex/128)*light*.58+dither));
   const step=Math.round(level*13)/13;
   const heat=Math.min(1,warm*.58);
   const i=(y*width+x)*4;
   const vignette=Math.max(.3,1-((x-width/2)/(width*.72))**2-((y-height*.5)/(height*.91))**2);
   pixels[i]=Math.round(step*(83+heat*83)*vignette);
   pixels[i+1]=Math.round(step*(103+heat*26)*vignette);
   pixels[i+2]=Math.round(step*(101-heat*37)*vignette);
   pixels[i+3]=255;
  }
 }
 ctx.putImageData(frame,0,0);
 // Overlaid masonry arch ribs recede along the same endlessly repeating corridor.
 const project=(x,y,z)=>[width/2+x*focal/z,horizon+(1.05-y)*focal/z];
 for(let zIndex=Math.floor(cam/4)+6;zIndex>=Math.floor(cam/4);zIndex--){
  const z=zIndex*4+1-cam;if(z<.25)continue;
  const brightness=Math.max(0,Math.floor(55*Math.exp(-z*.17)));
  ctx.strokeStyle=`rgb(${brightness},${brightness+3},${brightness+1})`;
  ctx.lineWidth=Math.max(1,Math.round(focal*.09/z));ctx.beginPath();
  for(let j=0;j<=20;j++){
   const angle=Math.PI-j*Math.PI/20;
   const xx=Math.cos(angle)*1.55,yy=1.55+Math.sin(angle)*1.37;
   const point=project(xx,yy,z);if(!j)ctx.moveTo(...point);else ctx.lineTo(...point);
  }
  ctx.stroke();
 }
 // Paired wall sconces repeat every four world units and pass out of view.
 for(let n=Math.floor(cam/4)+7;n>=Math.floor(cam/4)-1;n--){
  const z=n*4+2-cam;if(z<.4)continue;
  for(const side of [-1,1]){
   const [sx,sy]=project(side*1.43,1.65,z),scale=focal/z;
   if(sx<-30||sx>width+30)continue;
   const stem=Math.max(1,Math.round(scale*.035)),fh=Math.max(2,Math.round(scale*.25));
   const fw=Math.max(1,Math.round(scale*.075)),shake=Math.round(Math.sin(phase*Math.PI*16+side*.5)*fw*.35);
   ctx.fillStyle='#382b20';ctx.fillRect(Math.round(sx-stem),Math.round(sy),stem*2,Math.round(scale*.3));
   ctx.fillStyle='#9b4828';ctx.fillRect(Math.round(sx-fw),Math.round(sy-fh*.8),fw*2,Math.round(fh*.8));
   ctx.fillStyle='#d59442';ctx.fillRect(Math.round(sx-fw*.6+shake),Math.round(sy-fh),Math.max(1,fw),fh);
   ctx.fillStyle='#e5ce83';ctx.fillRect(Math.round(sx-fw*.3),Math.round(sy-fh*.65),Math.max(1,fw*.6),Math.max(1,fh*.6));
  }
 }
}
export function startDungeon(canvas,{reducedMotion=false,initialTime=0}={}){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return()=>{};
 canvas.width=240;canvas.height=400;
 let id=0,last=-100,elapsed=initialTime,previous=null,stopped=false;
 function tick(now){
  if(stopped)return;
  if(previous!==null&&!document.hidden&&!reducedMotion)elapsed+=Math.min(now-previous,100)/1000;
  previous=now;
  if(!document.hidden&&(now-last>=1000/20||reducedMotion&&last<0)){
   renderDungeon(ctx,elapsed);last=now;
  }
  if(!reducedMotion)id=requestAnimationFrame(tick);
 }
 id=requestAnimationFrame(tick);
 const halt=()=>{stopped=true;cancelAnimationFrame(id);};
 Object.defineProperty(halt,'time',{get:()=>elapsed});return halt;
}
