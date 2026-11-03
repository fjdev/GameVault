import {COLORS, LEVELS, expertSettings, createSecret, scoreGuess} from './engine.js';

const app=document.querySelector('#app');
const toastEl=document.querySelector('#toast');
const SAVE_KEY='super-codigo-sesion-v1';
const STATS_KEY='super-codigo-stats-v1';
const DEFAULT_STATS={played:0,won:0,bestExpert:0};
const colorLookup=Object.fromEntries(COLORS.map(c=>[c.id,c]));
let toastTimer;

function saved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
let stats={...DEFAULT_STATS,...saved(STATS_KEY,{})};
let state=saved(SAVE_KEY,null);
if(!state || !['home','levels','local-setup','game','pass','end'].includes(state.view)){
  state={view:'home',game:null,variant:'super',allowRepeats:true,modal:null};
}
state.modal=null;
if(state.game?.mode==='solo' && !LEVELS[state.game.level]) state.game.level = state.game.level==='beginner'?'easy':'normal';
if(state.game)state.game.revealSecret=false;
if(state.game && (!Array.isArray(state.game.history)||!Array.isArray(state.game.secret))) {
  state={view:'home',game:null,variant:'super',allowRepeats:true,modal:null};
}

function persist(){
  const {_transient,...rest}=state;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({...rest,modal:null}));localStorage.setItem(STATS_KEY,JSON.stringify(stats))}catch{}
}
function setView(view){state.view=view;state.modal=null;persist();render();}
function toast(text){
  toastEl.textContent=text;toastEl.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2400);
}
function safeText(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
function icon(name){
 const paths={
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back:'<path d="m14 6-6 6 6 6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>',
  hide:'<path d="m3 3 18 18M10.8 6.1c.4-.1.8-.1 1.2-.1 6.5 0 10 6 10 6a17 17 0 0 1-3.3 3.8M6.6 6.6C3.5 8.4 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.7"/>',
  check:'<path d="m5 12 5 5L20 7"/>',
  question:'<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.7 2.7 0 0 1 5.2 1c0 2-2.7 2.4-2.7 4.5M12 18h.01"/>',
  redo:'<path d="M21 11a9 9 0 1 1-2.6-6.3M21 3v8h-8"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  trash:'<path d="M4 7h16M10 4h4M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M19 20h2v-2a6 6 0 0 0-4-5.7"/>',
  star:'<path d="m12 2 3.1 6.3 7 .9-5 5 .9 7-6-3.3-6 3.3.9-7-5-5 7-.9z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
  undo:'<path d="M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-2"/>'
 };
 return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.question}</svg>`;
}
function peg(id,klass='',label=''){const c=colorLookup[id];return c?`<span class="peg ${klass}" style="--peg:${c.hex};--peg-light:${c.light};--peg-dark:${c.dark}" title="${c.name}" ${label?`aria-label="${label}"`:''}></span>`:`<span class="hole ${klass}"></span>`;}
function crumb(){return '<div class="eyebrow">EDICIÓN DE BOLSILLO <span class="eyebrow-dot">✦</span> 2026</div>'}
function header(title,back='home'){
 return `<div class="topbar"><button class="icon-btn" data-action="${back==='reset'?'ask-reset':`go-${back}`}" aria-label="Volver">${icon('back')}</button><div class="topbar-logo">SUPER <b>CÓDIGO</b></div><button class="icon-btn" data-action="open-rules" aria-label="Cómo jugar">${icon('question')}</button></div>${title?`<h1 class="screen-title">${title}</h1>`:''}`;
}
function heroBoard(){
 let rows='';
 const colors=[['red','blue','yellow','green','white'],['white','yellow','red','blue','brown'],['green','orange','blue','red','yellow']];
 for(let i=0;i<8;i++){
  const filled=i>=5;
  rows+=`<div class="sample-row">${Array.from({length:5},(_,j)=>peg(filled?colors[i-5][j]:null,'sample-peg')).join('')}<span class="sample-divider"></span>${Array.from({length:5},(_,j)=>i>=5&&j<(i===6?3:1)?`<span class="key-peg ${j===0?'black':'white'}"></span>`:'<span class="key-hole"></span>').join('')}</div>`;
 }
 return `<div class="hero-board"><div class="sample-code">${peg('red')}${peg('yellow')}${peg('blue')}${peg('green')}${peg('white')}</div>${rows}<div class="engraved">SUPER · CÓDIGO</div></div>`;
}
function home(){
 return `<main class="page home-screen">
 <a class="vault-back-link" href="../../">← GAME VAULT</a>
 <div class="home-kicker">UN CLÁSICO DE LÓGICA · REINVENTADO</div>
 <div class="home-heading"><div class="word-light">SUPER</div><h1>CÓDIGO<span class="title-spark">✳</span></h1><p>Cinco posiciones. Un secreto.<br>Infinitas posibilidades.</p></div>
 <div class="hero-wrap"><div class="hero-glow"></div>${heroBoard()}</div>
 <div class="home-actions">
 <button class="mode-tile" data-action="go-levels"><div class="tile-icon">${icon('sun')}</div><span><strong>Jugar en solitario</strong><small>4 dificultades · Desafía tu lógica</small></span>${icon('arrow')}</button>
 <button class="mode-tile" data-action="go-local-setup"><div class="tile-icon">${icon('people')}</div><span><strong>Dos jugadores</strong><small>Un móvil · Por turnos</small></span>${icon('arrow')}</button>
 </div>
 <div class="home-footer"><button class="text-link" data-action="open-rules">${icon('info')} Cómo se juega</button><span>${stats.played} partidas · ${stats.won} victorias</span></div>
 </main>`;
}
function levels(){
 return `<main class="page narrow">${header('Elige tu desafío','home')}<p class="muted center intro">Empieza por lo sencillo o salta al desafío original. Cada combinación se genera al azar.</p>
 <div class="levels">${Object.entries(LEVELS).map(([key,l])=>{
 const s=key==='expert'?expertSettings(Math.max(1,stats.bestExpert||1)):l;
 return `<button class="level-card ${key==='expert'?'level-expert':''}" data-action="start-solo" data-value="${key}"><span class="level-index">${l.num}</span><span class="level-copy"><strong>${l.label}</strong><small>${key==='expert'?`Nivel ${Math.max(1,stats.bestExpert||1)} · ${l.subtitle}`:l.subtitle}</small><span class="level-spec">${s.slots} huecos <em>·</em> ${s.colorCount} colores <em>·</em> ${s.maxAttempts} intentos ${s.repeats?'· repeticiones':''}</span></span><span class="level-arrow">${icon('arrow')}</span></button>`;
 }).join('')}</div><p class="note center">En Experto, la dificultad aumenta cada vez que resuelves una combinación.</p></main>`;
}
function localSetup(){
 return `<main class="page narrow">${header('Dos jugadores','home')}
 <p class="muted center intro">Un jugador crea el código. El otro lo descifra. Os pasáis el móvil sin revelar la combinación.</p>
 <div class="setup-section"><div class="setting-head">01 <span>Elige tablero</span></div>
 <div class="variant-pair">
 <button data-action="set-variant" data-value="super" class="variant ${state.variant==='super'?'selected':''}"><strong>SUPER</strong><span>5 posiciones</span><small>8 colores · 12 intentos</small></button>
 <button data-action="set-variant" data-value="classic" class="variant ${state.variant==='classic'?'selected':''}"><strong>CLÁSICO</strong><span>4 posiciones</span><small>6 colores · 10 intentos</small></button>
 </div></div>
 <div class="setup-section"><div class="setting-head">02 <span>Reglas de combinación</span></div>
 <button class="toggle-row" data-action="toggle-repeats"><span><strong>Permitir colores repetidos</strong><small>Un color puede aparecer varias veces</small></span><span class="toggle ${state.allowRepeats?'on':''}"><i></i></span></button>
 </div>
 <div class="instruction-card"><div class="instruction-icon">${icon('lock')}</div><p>La app oculta el código al pasar el móvil. Quien lo creó coloca las pistas negras y blancas después de cada intento.</p></div>
 <button class="primary-btn wide" data-action="start-local">Empezar partida ${icon('arrow')}</button>
 </main>`;
}
function currentSettings(){return state.game?.settings;}
function renderBoard(g,overridePhase=null){
 const phase=overridePhase||g.phase;
 const current = phase==='set-secret'?g.secret:phase==='breaker'?g.draft:null;
 const history=g.history;
 const isSetting=phase==='set-secret';
 const pending=phase==='keeper' ? g.pendingGuess : null;
 const isInteractive=isSetting||phase==='breaker';
 const activeTurn=history.length+1;
 let rows='';
 const total=isSetting?g.settings.maxAttempts:g.settings.maxAttempts;
 for(let n=total;n>=1;n--){
  const historyEntry=history[n-1];
  const isPending=(n===activeTurn && pending);
  const active=(n===activeTurn && isInteractive);
  const vals=historyEntry?historyEntry.guess:isPending?pending:active?current:null;
  const clue=historyEntry?historyEntry:null;
  rows+=`<div class="board-row ${active?'active-row':''} ${historyEntry?'past-row':''} ${isPending?'pending-row':''}" aria-label="Intento ${n}">
  <span class="turn-number">${String(n).padStart(2,'0')}</span>
  <div class="guess-holes" style="--slots:${g.settings.slots}">${Array.from({length:g.settings.slots},(_,j)=>{
  const selected=active && g.selected===j;
  const body=peg(vals?vals[j]:null,selected?'selected-hole':'');
  return active?`<button class="peg-btn ${selected?'chosen':''}" data-action="select-hole" data-value="${j}" aria-label="Posición ${j+1}">${body}</button>`:`<span class="peg-cell">${body}</span>`;
  }).join('')}</div>
  <div class="board-divider"></div>
  <div class="clue-holes" style="--clue-cols:${g.settings.slots>5?4:3}">${Array.from({length:g.settings.slots},(_,j)=>clue&&j<clue.black?'<span class="key-peg black"></span>':clue&&j<clue.black+clue.white?'<span class="key-peg white"></span>':'<span class="key-hole"></span>').join('')}</div>
 </div>`;
 }
 return `<div class="board-frame"><div class="board-toptag"><span>SUPER CÓDIGO</span><span>✦</span><span>EDICIÓN ORIGINAL</span></div><div class="board-rows">${rows}</div><div class="board-bottom"><span>INVICTA · 1975</span><span>EL ARTE DE DEDUCIR</span></div></div>`;
}
function palette(g,phase){
 const vals=phase==='set-secret'?g.secret:g.draft;
 const filled=vals.filter(Boolean).length;
 const title=phase==='set-secret'?'Crea tu código secreto':'Elige tu combinación';
 return `<section class="play-dock"><div class="dock-top"><div><strong>${title}</strong><span>${filled} / ${g.settings.slots} posiciones</span></div><button class="icon-btn mini" data-action="clear-draft" aria-label="Borrar combinación">${icon('trash')}</button></div>
 <div class="palette" aria-label="Colores disponibles">${COLORS.slice(0,g.settings.colorCount).map(c=>`<button class="color-option" data-action="put-color" data-value="${c.id}" aria-label="Color ${c.name}">${peg(c.id)}<span>${c.name}</span></button>`).join('')}</div>
 <div class="dock-buttons"><button class="secondary-btn" data-action="undo">${icon('undo')} Deshacer</button><button class="primary-btn" data-action="${phase==='set-secret'?'lock-secret':'submit-guess'}" ${filled!==g.settings.slots?'disabled':''}>${phase==='set-secret'?'Ocultar código':'Confirmar intento'} ${icon(phase==='set-secret'?'lock':'arrow')}</button></div></section>`;
}
function secretPanel(g){
 return `<div class="secret-toggle"><button class="secondary-btn secret-button" data-action="toggle-secret">${icon(g.revealSecret?'hide':'eye')} ${g.revealSecret?'Taparlo':'Mostrar código secreto'}</button>
 ${g.revealSecret?`<div class="revealed-code"><span>CÓDIGO ORIGINAL</span><div class="revealed-pegs">${g.secret.map(c=>peg(c)).join('')}</div></div>`:'<p>Solo la persona que creó el código debe pulsarlo.</p>'}</div>`;
}
function keeperDock(g){
 const numBlack=g.feedbackDraft.filter(x=>x==='black').length;
 const numWhite=g.feedbackDraft.filter(x=>x==='white').length;
 return `<section class="play-dock keeper-dock"><div class="dock-top"><div><strong>Coloca las pistas</strong><span>Negro = exacto · Blanco = desplazado</span></div></div>
 <div class="clue-input-row"><div class="clue-inputs">${Array.from({length:g.settings.slots},(_,i)=>`<button data-action="cycle-clue" data-value="${i}" class="clue-btn ${g.feedbackDraft[i]||''}" aria-label="Pista ${i+1}: ${g.feedbackDraft[i]||'sin pista'}">${g.feedbackDraft[i]?`<span class="key-peg ${g.feedbackDraft[i]}"></span>`:'<span class="key-hole"></span>'}</button>`).join('')}</div><div class="clue-count"><b>${numBlack}</b> negras <b>${numWhite}</b> blancas</div></div>
 <p class="clue-help">Toca cada hueco para alternar: sin pista → negro → blanco.</p>
 <div class="dock-buttons keeper-actions"><button class="secondary-btn" data-action="auto-feedback">${icon('check')} Calcular pistas</button><button class="primary-btn" data-action="submit-feedback">Confirmar pistas ${icon('arrow')}</button></div>
 </section>`;
}
function game(){
 const g=state.game;
 if(!g) return home();
 const isSetter=g.phase==='set-secret';
 const isKeeper=g.phase==='keeper';
 const modeLabel=g.mode==='solo'?'UN JUGADOR':'DOS JUGADORES';
 const status=isSetter?'CREADOR DEL CÓDIGO':isKeeper?'CREADOR DEL CÓDIGO':'DESCIFRADOR';
 const turnCount=g.history.length+1;
 return `<main class="page game-page">${header('','reset')}
 <div class="game-heading"><div><div class="game-kicker">${modeLabel} <span>·</span> ${g.mode==='solo'?safeText(g.level==='expert'?`EXPERTO · NIVEL ${g.stage}`:LEVELS[g.level].label.toUpperCase()):g.settings.slots+' POSICIONES'}</div><h1>${isSetter?'Crea el secreto':isKeeper?'Da las pistas':'Descifra el código'}</h1></div><span class="role-badge">${icon(isSetter||isKeeper?'lock':'eye')} ${status}</span></div>
 <div class="status-line"><span><i class="status-dot"></i>${isSetter?'Solo tú puedes ver la combinación':isKeeper?'Comprueba el intento y marca las pistas':'Piensa antes de colocar tus piezas'}</span><b>${isSetter?'PREPARACIÓN':`${Math.min(turnCount,g.settings.maxAttempts)} / ${g.settings.maxAttempts} INTENTOS`}</b></div>
 ${isKeeper?secretPanel(g):''}
 <div class="game-board-holder">${renderBoard(g)}</div>
 ${isKeeper?keeperDock(g):palette(g,g.phase)}
 <button class="abandon" data-action="ask-reset">${icon('redo')} Reiniciar o salir de la partida</button>
 </main>`;
}
function passScreen(){
 const g=state.game;
 if(!g)return home();
 const toSetter=g.phase==='handoff-to-keeper';
 return `<main class="page pass-screen">${header('','reset')}<div class="pass-content"><div class="pass-symbol"><div class="pass-ring r1"></div><div class="pass-ring r2"></div>${icon('lock')}</div>
 <div class="eyebrow">PANTALLA DE PRIVACIDAD</div><h1>${toSetter?'Turno del creador':'Turno del descifrador'}</h1><p>${toSetter?'El intento está guardado. Pasa el móvil a quien creó el código para que coloque las pistas.':'El código está oculto. Pasa el móvil a quien debe resolverlo.'}</p>
 <div class="handoff-notice">${icon('people')} Pasa el móvil antes de continuar</div>
 <button class="primary-btn wide" data-action="complete-handoff">${toSetter?'Soy el creador':'Estoy listo para jugar'} ${icon('arrow')}</button>
 <small>La combinación no aparece en esta pantalla.</small></div></main>`;
}
function endScreen(){
 const g=state.game;
 if(!g) return home();
 const won=g.history.length>0 && g.history.at(-1).black===g.settings.slots;
 const isExpert=g.mode==='solo'&&g.level==='expert';
 const title=won?'¡Código descifrado!':g.mode==='solo'?'El código ganó':'¡Gana el creador!';
 const copy=won?`Has encontrado la combinación en ${g.history.length} ${g.history.length===1?'intento':'intentos'}.`:g.mode==='solo'?'Te has quedado sin intentos. Prueba con una nueva combinación.':'Se agotaron los intentos sin descubrir la combinación.';
 return `<main class="page end-screen">${header('','home')}<div class="end-body"><div class="result-star ${won?'success':'failure'}">${won?icon('star'):icon('lock')}</div><div class="eyebrow">PARTIDA TERMINADA</div><h1>${title}</h1><p>${copy}</p>
 <div class="end-code"><span>EL CÓDIGO ERA</span><div class="end-code-row">${g.secret.map(c=>peg(c)).join('')}</div></div>
 <div class="result-number"><strong>${String(g.history.length).padStart(2,'0')}</strong><span>INTENTOS EMPLEADOS</span></div>
 ${isExpert&&won?`<button class="primary-btn wide" data-action="next-expert">Siguiente nivel · ${g.stage+1} ${icon('arrow')}</button>`:`<button class="primary-btn wide" data-action="play-again">Nueva partida ${icon('arrow')}</button>`}
 <button class="secondary-btn wide" data-action="go-home">Volver al inicio</button>
 </div></main>`;
}
function rulesModal(){
 return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-panel" role="dialog" aria-modal="true" aria-label="Cómo jugar"><div class="modal-title"><h2>Cómo se juega</h2><button data-action="close-modal" class="icon-btn" aria-label="Cerrar">${icon('close')}</button></div>
 <p>El objetivo es adivinar los colores secretos <strong>y su posición exacta</strong> antes de agotar los intentos.</p>
 <div class="rule-item"><div class="rule-example">${peg('red')}${peg('blue')}${peg('green')}${peg('yellow')}${peg('white')}</div><span>Coloca una combinación de colores en cada intento.</span></div>
 <div class="rule-item"><div class="rule-example"><span class="key-peg black"></span><span class="key-peg black"></span></div><span><strong>Negro:</strong> un color está en la posición correcta.</span></div>
 <div class="rule-item"><div class="rule-example"><span class="key-peg white"></span><span class="key-peg white"></span></div><span><strong>Blanco:</strong> el color está presente, pero en otra posición.</span></div>
 <p>Las pistas <strong>no indican a qué posición corresponden</strong>. Las fichas negras y blancas se calculan sin contar un color más veces de las que aparece.</p>
 <p>En <strong>solitario</strong>, la app genera el código y las pistas. En <strong>dos jugadores</strong>, una persona crea el código y coloca las pistas manualmente tras cada intento. Si se equivoca, puede usar «Calcular pistas».</p>
 <button class="primary-btn wide" data-action="close-modal">Entendido ${icon('check')}</button></section></div>`;
}
function resetModal(){
 return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-panel small-modal" role="dialog" aria-modal="true" aria-label="Reiniciar partida"><div class="modal-title"><h2>¿Salir de la partida?</h2><button class="icon-btn" data-action="close-modal" aria-label="Cerrar">${icon('close')}</button></div><p>Se perderá el progreso de esta partida.</p><button class="primary-btn wide" data-action="reset-to-home">Salir al inicio</button><button class="secondary-btn wide" data-action="close-modal">Continuar jugando</button></section></div>`;
}
function render(){
 let page;
 switch(state.view){case 'levels':page=levels();break;case 'local-setup':page=localSetup();break;case 'game':page=game();break;case 'pass':page=passScreen();break;case 'end':page=endScreen();break;default:page=home()}
 app.innerHTML=page+(state.modal==='rules'?rulesModal():state.modal==='reset'?resetModal():'');
 const boardScroller=app.querySelector('.board-rows');
 const activeBoardRow=boardScroller?.querySelector('.active-row, .pending-row');
 if(activeBoardRow) boardScroller.scrollTop=activeBoardRow.offsetTop-boardScroller.offsetTop-boardScroller.clientHeight*0.65;
 document.body.className=`view-${state.view}`;
 persist();
}
function startSolo(level,stage=1){
 const settings=level==='expert'?expertSettings(stage):LEVELS[level];
 state.game={mode:'solo',level,stage,settings:{...settings},secret:createSecret(settings),history:[],draft:Array(settings.slots).fill(null),selected:0,phase:'breaker',pendingGuess:null,feedbackDraft:[],revealSecret:false};
 setView('game');
}
function startLocal(){
 const isSuper=state.variant==='super';
 const settings={slots:isSuper?5:4,colorCount:isSuper?8:6,maxAttempts:isSuper?12:10,repeats:state.allowRepeats};
 state.game={mode:'local',level:null,stage:1,settings,secret:Array(settings.slots).fill(null),history:[],draft:Array(settings.slots).fill(null),selected:0,phase:'set-secret',pendingGuess:null,feedbackDraft:[],revealSecret:false};
 setView('game');
}
function moveSelection(array,current){
 const next=array.findIndex((x,i)=>i>current&&!x);
 if(next>=0)return next;
 const wrap=array.findIndex(x=>!x);
 return wrap>=0?wrap:(current+1)%array.length;
}
function updateGame(){persist();render()}
function chooseColor(color){
 const g=state.game;
 const vals=g.phase==='set-secret'?g.secret:g.draft;
 if(!g.settings.repeats && vals.some((c,i)=>c===color&&i!==g.selected))return toast('En esta partida no se repiten colores.');
 vals[g.selected]=color;
 g.selected=moveSelection(vals,g.selected);
 updateGame();
}
function finishGame(){
 const g=state.game;
 stats.played++;
 const won=g.history.at(-1)?.black===g.settings.slots;
 if(won){stats.won++;if(g.mode==='solo'&&g.level==='expert')stats.bestExpert=Math.max(stats.bestExpert,g.stage+1)}
 setView('end');
}
function submitGuess(){
 const g=state.game;
 if(!g.draft.every(Boolean))return toast('Completa todos los huecos.');
 const guess=[...g.draft];
 if(g.mode==='solo'){
  const feedback=scoreGuess(g.secret,guess);
  g.history.push({guess,...feedback});
  g.draft=Array(g.settings.slots).fill(null);g.selected=0;
  if(feedback.black===g.settings.slots||g.history.length>=g.settings.maxAttempts)finishGame();
  else updateGame();
 } else {
  g.pendingGuess=guess;
  g.draft=Array(g.settings.slots).fill(null);
  g.feedbackDraft=Array(g.settings.slots).fill(null);
  g.revealSecret=false;
  g.phase='handoff-to-keeper';
  setView('pass');
 }
}
function cycleClue(i){
 const g=state.game;
 const cur=g.feedbackDraft[i];
 g.feedbackDraft[i]=cur===null?'black':cur==='black'?'white':null;
 updateGame();
}
function completeHandoff(){
 const g=state.game;
 if(g.phase==='handoff-to-breaker'){
  g.phase='breaker';g.selected=0;g.revealSecret=false;setView('game');
 }else if(g.phase==='handoff-to-keeper'){
  g.phase='keeper';g.revealSecret=false;setView('game');
 }
}
function applyAction(action,value){
 const g=state.game;
 switch(action){
  case 'go-home':state.game=null;setView('home');break;
  case 'go-levels':setView('levels');break;
  case 'go-local-setup':setView('local-setup');break;
  case 'open-rules':state.modal='rules';render();break;
  case 'close-modal':state.modal=null;render();break;
  case 'ask-reset':state.modal='reset';render();break;
  case 'reset-to-home':state.game=null;setView('home');break;
  case 'set-variant':state.variant=value;updateGame();break;
  case 'toggle-repeats':state.allowRepeats=!state.allowRepeats;updateGame();break;
  case 'start-solo':startSolo(value,value==='expert'?Math.max(1,stats.bestExpert||1):1);break;
  case 'start-local':startLocal();break;
  case 'select-hole':if(g) {g.selected=Number(value);updateGame()}break;
  case 'put-color':if(g&&['set-secret','breaker'].includes(g.phase))chooseColor(value);break;
  case 'undo':if(g){const vals=g.phase==='set-secret'?g.secret:g.draft;let idx=vals.findLastIndex(Boolean);if(idx>=0){vals[idx]=null;g.selected=idx;updateGame()}}break;
  case 'clear-draft':if(g){if(g.phase==='set-secret')g.secret=Array(g.settings.slots).fill(null);else g.draft=Array(g.settings.slots).fill(null);g.selected=0;updateGame()}break;
  case 'lock-secret':if(g&&g.phase==='set-secret'&&g.secret.every(Boolean)){g.phase='handoff-to-breaker';g.selected=0;setView('pass')}break;
  case 'complete-handoff':completeHandoff();break;
  case 'submit-guess':if(g&&g.phase==='breaker')submitGuess();break;
  case 'toggle-secret':if(g&&g.phase==='keeper'){g.revealSecret=!g.revealSecret;updateGame()}break;
  case 'cycle-clue':if(g&&g.phase==='keeper')cycleClue(Number(value));break;
  case 'auto-feedback':if(g&&g.phase==='keeper'){
   const {black,white}=scoreGuess(g.secret,g.pendingGuess);
   g.feedbackDraft=[...Array(black).fill('black'),...Array(white).fill('white'),...Array(g.settings.slots-black-white).fill(null)];
   updateGame();toast('Pistas calculadas correctamente.');
  }break;
  case 'submit-feedback':if(g&&g.phase==='keeper'){
   const black=g.feedbackDraft.filter(x=>x==='black').length;
   const white=g.feedbackDraft.filter(x=>x==='white').length;
   g.history.push({guess:[...g.pendingGuess],black,white});
   g.pendingGuess=null;g.feedbackDraft=[];g.revealSecret=false;
   if(black===g.settings.slots||g.history.length>=g.settings.maxAttempts){finishGame();}
   else {g.phase='handoff-to-breaker';setView('pass')}
  }break;
  case 'play-again':if(g){if(g.mode==='solo')startSolo(g.level,g.stage);else startLocal()}break;
  case 'next-expert':if(g&&g.level==='expert')startSolo('expert',g.stage+1);break;
 }
}
window.addEventListener('pagehide',()=>{if(state.game){state.game.revealSecret=false;persist()}});
app.addEventListener('click',event=>{
 const target=event.target.closest('[data-action]');
 if(!target)return;
 if(target.classList.contains('modal-backdrop') && event.target!==target)return;
 applyAction(target.dataset.action,target.dataset.value);
});
render();
