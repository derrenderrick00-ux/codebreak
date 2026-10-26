import { emit, bus } from '../core/bus.js';
import { FLOORS, getFloor } from '../content/floors.js';
import { LESSON_STEPS } from '../learning/lesson.js';
import { DIAGNOSTIC, assessDiagnostic } from '../content/diagnostic.js';
import { loadProgress, saveProgress, completeFloor, applyPlacement, registerAttempt, setCurrentFloor, summarize, exportProgress, importProgress, createProgress } from '../state/progress.js';
import { runChallenge } from '../runtime/sandbox.js';
import { sound } from '../core/sound.js';

const $ = (id) => document.getElementById(id);
const escapeHTML = (text) => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const codeHTML = (text) => `<pre class="code-example"><code>${escapeHTML(text)}</code></pre>`;
const button = (label, action, style='secondary-btn', extra='') => `<button type="button" class="${style}" data-action="${action}" ${extra}>${label}</button>`;
const LORE = {
  0: 'ROOT: Identity record not found. PATCH: Looks like you are an unfinished save file with legs.',
  1: 'The backup generator groans beneath the floor. PATCH needs enough power to reboot its logic controls.',
  2: 'Security cameras wake up. ROOT insists that nobody passes without the proper credentials.',
  3: 'Communication towers flicker. A transmitter alternates between valid and broken signals.',
  4: 'A staircase has vanished into the digital void. The missing steps must be generated algorithmically.',
  5: 'The power grid redirects to the wrong circuits. Every signal needs transformation.',
  6: 'A corridor reveals three unpredictable doors. The safe route hides in a collection of objects.',
  7: 'A distorted transmission from NULL cuts across the emergency channel.',
  8: 'Robotic machines refuse to run without a reusable energy function.',
  9: 'The Logic Core is partially alive. Count the functioning modules to bring it online.',
  10: 'ROOT begins an infinite reset cycle. The elevator must travel precisely, even when moving backwards.'
};
const DRAFT_KEY = 'codebreak:draft:v1:';

export class AppUI {
  constructor() {
    this.progress = loadProgress();
    this.activeModal = null;
    this.firstReady = false;
    this.running = false;
    this.lastFocus = null;
    this.bindActions();
    this.updateHud();
    sound.setEnabled(this.progress.sound);
    this.updateSoundButton();
    bus.addEventListener('game:ready', ({detail}) => {
      this.updateHud();
      if(!this.firstReady) {
        this.firstReady = true;
        if(this.progress.currentFloor !== detail.floor) this.gotoFloor(this.progress.currentFloor);
        if(!this.progress.onboarding) setTimeout(() => this.openIntro(), 150);
        else this.say(getFloor(this.progress.currentFloor).dialogue);
      } else this.say(getFloor(detail.floor).dialogue);
    });
    bus.addEventListener('ui:challenge',({detail})=>this.openChallenge(detail.floor));
    bus.addEventListener('ui:locked',()=>{this.say('PATCH: The elevator requires a successful terminal challenge.');sound.beep('error');});
    bus.addEventListener('ui:elevator',({detail})=>this.takeElevator(detail.floor));
    bus.addEventListener('game:near',({detail})=>{
      $('in-game-hint').textContent = detail.terminal ? 'TERMINAL IN RANGE · Press E or choose Open challenge' : detail.door ? 'ELEVATOR IN RANGE · Press E to enter when unlocked' : 'A/D or ←/→ to move · W/↑/Space to jump · E to interact';
    });
  }
  persist() { this.progress = saveProgress(this.progress); this.updateHud(); }
  say(message) { $('patch-message').textContent = message; }
  updateHud() {
    const { cleared, percentage, core } = summarize(this.progress);
    const floor = getFloor(this.progress.currentFloor);
    $('floor-label').textContent = `FLOOR ${String(floor.floor).padStart(2,'0')} / 100`;
    $('floor-summary').textContent = `${floor.title} · ${floor.topic}`;
    $('cores-count').textContent = core ? '1 / 1' : '0 / 1';
    $('cleared-count').textContent = `${cleared} / 10`;
    $('mode-label').textContent = this.progress.mode.toUpperCase();
    $('chapter-progress').textContent = `${percentage}% CHAPTER PROGRESS`;
    $('game-status').textContent = this.progress.completed.includes(floor.floor) ? 'SECURITY DOOR: UNLOCKED' : 'SECURITY DOOR: LOCKED';
  }
  updateSoundButton(){const btn=$('sound-toggle');btn.textContent=`Sound: ${this.progress.sound?'On':'Off'}`;btn.setAttribute('aria-pressed',String(this.progress.sound));}
  bindActions() {
    $('learn-button').addEventListener('click',()=>this.openChallenge(this.progress.currentFloor));
    $('floors-button').addEventListener('click',()=>this.openFloorMap());
    $('progress-button').addEventListener('click',()=>this.openProgress());
    $('help-button').addEventListener('click',()=>this.openHelp());
    $('sound-toggle').addEventListener('click',()=>{this.progress.sound=!this.progress.sound;this.persist();sound.setEnabled(this.progress.sound);this.updateSoundButton();sound.beep();});
    $('close-modal').addEventListener('click',()=>this.closeModal());
    $('modal-backdrop').addEventListener('click',(event)=>{if(event.target===$('modal-backdrop'))this.closeModal();});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&this.activeModal){event.preventDefault();this.closeModal();}
      if(event.key==='Tab' && this.activeModal){
        const items=[...$('modal').querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])')].filter(el=>el.offsetParent!==null);
        if(!items.length)return;
        if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
        else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
      }
    });
    $('modal-body').addEventListener('click',event=>{
      const target=event.target.closest('[data-action]');if(!target)return;
      const action=target.dataset.action;
      if(action==='start-beginner') this.startBeginner();
      else if(action==='diagnostic') this.openDiagnostic();
      else if(action==='grade-diagnostic')this.gradeDiagnostic();
      else if(action==='visit-recommended')this.visitRecommended();
      else if(action==='help')this.openHelp();
      else if(action==='floor')this.gotoFloor(Number(target.dataset.floor));
      else if(action==='challenge')this.openChallenge(this.progress.currentFloor);
      else if(action==='progress')this.openProgress();
      else if(action==='floor-map')this.openFloorMap();
      else if(action==='run')this.gradeChallenge();
      else if(action==='hint')this.showHint();
      else if(action==='reset-code')this.resetCode();
      else if(action==='elevator')this.takeElevator(this.progress.currentFloor);
      else if(action==='mode')this.changeMode(target.dataset.mode);
      else if(action==='export')this.downloadProgress();
      else if(action==='import')$('progress-import').click();
      else if(action==='reset-progress')this.confirmReset();
      else if(action==='confirm-reset')this.resetProgress();
      else if(action==='review-story')this.openStory();
    });
    $('modal-body').addEventListener('change',event=>{
      if(event.target.id==='progress-import')this.handleImport(event.target.files?.[0]);
    });
    for(const btn of document.querySelectorAll('[data-control]')){
      const name=btn.dataset.control;
      const press=event=>{event.preventDefault();btn.setPointerCapture?.(event.pointerId);emit('game:control',{name,pressed:true});};
      const release=event=>{event.preventDefault();emit('game:control',{name,pressed:false});};
      btn.addEventListener('pointerdown',press);btn.addEventListener('pointerup',release);btn.addEventListener('pointercancel',release);btn.addEventListener('lostpointercapture',()=>emit('game:control',{name,pressed:false}));
    }
  }
  showModal(kicker,title,html,kind='generic'){
    this.lastFocus = document.activeElement;
    this.activeModal=kind;
    $('modal-kicker').textContent=kicker;
    $('modal-title').textContent=title;
    $('modal-body').innerHTML=html;
    $('modal-backdrop').classList.remove('hidden');
    $('modal-backdrop').setAttribute('aria-hidden','false');
    document.body.classList.add('dialog-open');
    emit('game:lock',{locked:true});
    $('modal').scrollTop=0;
    $('modal-body').scrollTop=0;
    $('close-modal').focus();
  }
  closeModal(){
    if(!this.activeModal)return;
    this.activeModal=null;
    $('modal-backdrop').classList.add('hidden');
    $('modal-backdrop').setAttribute('aria-hidden','true');
    document.body.classList.remove('dialog-open');
    emit('game:lock',{locked:false});
    if(this.lastFocus?.isConnected)this.lastFocus.focus();
  }
  openIntro(){
    this.showModal('THE PROLOGUE / FLOOR 0','SUBJECT 404: IDENTITY NOT FOUND',`
      <div class="intro-art"><div class="stick-icon" aria-hidden="true"><i></i><b></b></div><div><span class="terminal-red">&gt; ERROR 404: IDENTITY NOT FOUND</span><br>&gt; CONSCIOUSNESS ONLINE<br>&gt; MEMORY: [CORRUPTED]<br>&gt; TOWER LEVELS: 100</div></div>
      <p>You wake up inside a sealed elevator. Your only companion is PATCH, a sarcastic little AI. ROOT controls the tower. Every floor is a software system waiting to be repaired.</p>
      <div class="quote">“Congratulations. You have successfully failed to exist.” — ROOT<br><br>“Ignore that idiot. I’m PATCH. Try writing some code.”</div>
      <h3>How do you want to begin?</h3><div class="action-row">${button('Start from Floor 0','start-beginner','primary-btn')}${button('Take skill assessment (8 questions)','diagnostic')}${button('Controls','help')}</div>
      <p class="muted small">New to programming? Start at Floor 0. Already know JavaScript? The diagnostic can unlock later floors, but never awards unearned mastery.</p>
    `,'intro');
  }
  openStory(){this.showModal('STORY ARCHIVE','THE TOWER OF CODE',`<p>Subject 404 is a memory-corrupted stickman trapped inside the hundred-floor Tower of Code. ROOT, the tower administrator, has sealed the exit after a catastrophic system failure.</p><p>PATCH guides you through repairs; NULL appears in the error logs, warning that not everything is as it seems. The Architect's legacy remains hidden at the tower summit.</p><p>This build covers <strong>Chapter I — The Awakening</strong>, Floors 0–10. Chapters II–X are planned future releases.</p>${button('Return to floor map','floor-map')}`,'story');}
  startBeginner(){this.progress.onboarding=true;this.progress.playedIntro=true;this.progress.currentFloor=0;this.persist();this.gotoFloor(0);}
  openDiagnostic(){
    const rows=DIAGNOSTIC.map((q,i)=>`<fieldset class="question"><legend><span>${String(i+1).padStart(2,'0')}</span> ${escapeHTML(q.question)}</legend><div class="answer-grid">${q.choices.map((a,j)=>`<label><input type="radio" name="diagnostic-${i}" value="${j}"> ${escapeHTML(a)}</label>`).join('')}</div></fieldset>`).join('');
    this.showModal('INITIALIZATION / SKILL CHECK','PLACEMENT DIAGNOSTIC',`<p class="muted">Eight short questions. Placement opens access to selected floors; completed challenges and mastery remain unchanged.</p><form id="diagnostic-form">${rows}<p id="diagnostic-error" class="error" role="alert"></p><div class="action-row">${button('Evaluate skills','grade-diagnostic','primary-btn')}</div></form>`,'diagnostic');
  }
  gradeDiagnostic(){
    const data=new FormData($('diagnostic-form'));const answers=DIAGNOSTIC.map((_,i)=>data.has(`diagnostic-${i}`)?Number(data.get(`diagnostic-${i}`)):null);
    if(answers.some(n=>n===null)){$('diagnostic-error').textContent='Answer every question before submitting.';return;}
    const result=assessDiagnostic(answers);
    this.progress=applyPlacement(this.progress,result);this.progress.playedIntro=true;this.persist();
    this.showModal('ASSESSMENT COMPLETE',`${result.score} / ${result.total} CORRECT`,`<div class="result-card"><strong>Recommended starting point: Floor ${result.recommendedFloor}</strong><p>Your placement gives you access to lessons through Floor ${result.recommendedFloor}. It does not mark them completed.</p></div><div class="action-row">${button(`Go to Floor ${result.recommendedFloor}`,'visit-recommended','primary-btn')}${button('Start from Floor 0 instead','start-beginner')}</div>`,'diagnostic-result');
  }
  visitRecommended(){this.gotoFloor(this.progress.diagnostic?.recommendedFloor ?? 1);}
  gotoFloor(floor){
    if(!Number.isInteger(floor)||floor<0||floor>this.progress.unlockedFloor){this.say('PATCH: Floor locked. Complete the earlier challenge first.');return;}
    this.progress=setCurrentFloor(this.progress,floor);this.persist();
    this.closeModal();emit('game:floor',{floor,solved:this.progress.completed.includes(floor)});
    this.say(getFloor(floor).dialogue);
    sound.beep();
  }
  openFloorMap(){
    const cells=FLOORS.map(f=>{
      const unlocked=f.floor<=this.progress.unlockedFloor;
      const completed=this.progress.completed.includes(f.floor);
      const current=f.floor===this.progress.currentFloor;
      return `<button type="button" class="floor-cell ${unlocked?'':'floor-locked'} ${current?'floor-current':''}" data-action="floor" data-floor="${f.floor}" ${unlocked?'':'disabled'} aria-label="Floor ${f.floor}: ${escapeHTML(f.title)}, ${unlocked?'unlocked':'locked'}"><span>${String(f.floor).padStart(2,'0')}</span><strong>${escapeHTML(f.title)}</strong><small>${completed?'✓ COMPLETE':current?'● CURRENT':unlocked?'AVAILABLE':'🔒 LOCKED'}</small></button>`;
    }).join('');
    this.showModal('CHAPTER I / 10 FLOORS','TOWER FLOOR MAP',`<p class="muted">Choose any unlocked floor for review. Completing a challenge unlocks the next floor. The placement diagnostic may also open earlier material.</p><div class="floor-grid">${cells}</div><div class="quote">CHAPTER II–X · FLOORS 11–100: Future development phases.</div><div class="action-row">${button('View story archive','review-story')}</div>`,'floor-map');
  }
  openProgress(){
    const stats=summarize(this.progress);
    const rows=FLOORS.map(f=>`<tr><td>${String(f.floor).padStart(2,'0')}</td><td>${escapeHTML(f.topic)}</td><td>${this.progress.mastered[f.floor]?'Passed':this.progress.completed.includes(f.floor)?'Cleared':'Not passed'}</td><td>${this.progress.attempts[f.floor]??0}</td></tr>`).join('');
    this.showModal('PLAYER RECORD','YOUR LEARNING PROGRESS',`
      <div class="stat-grid"><div><strong>${stats.percentage}%</strong><small>Chapter complete</small></div><div><strong>${stats.cleared}/10</strong><small>Floors cleared</small></div><div><strong>${this.progress.chapterCompleted?'1':'0'}</strong><small>Logic cores</small></div></div>
      <p class="muted">Mode: ${escapeHTML(this.progress.mode)} · ${this.progress.diagnostic?`Diagnostic: ${this.progress.diagnostic.score}/8`:'No diagnostic yet'}</p>
      <div class="action-row">${['guided','practice','mastery'].map(mode=>button(mode[0].toUpperCase()+mode.slice(1),'mode',this.progress.mode===mode?'primary-btn':'secondary-btn',`data-mode="${mode}"`)).join('')}</div>
      <p class="muted small"><strong>Guided:</strong> explanations and hints. <strong>Practice:</strong> fewer prompts. <strong>Mastery:</strong> examples collapsed, but all learning material is still accessible. All modes use the same tests.</p>
      <div class="table-scroll"><table><thead><tr><th>Floor</th><th>Topic</th><th>Verification</th><th>Attempts</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="action-row">${button('Export save (JSON)','export')}${button('Import save (JSON)','import')}${button('Reset progress','reset-progress','danger-btn')}</div><input id="progress-import" type="file" accept="application/json,.json" hidden><p class="muted small">Progress is stored locally in this browser. Export a backup before clearing browser data. This is not a cloud account.</p>
    `,'progress');
  }
  changeMode(mode){if(!['guided','practice','mastery'].includes(mode))return;this.progress.mode=mode;this.persist();this.openProgress();}
  openChallenge(floorNumber){
    const floor=getFloor(floorNumber);
    const solved=this.progress.completed.includes(floorNumber);
    const mode=this.progress.mode;
    const lesson=LESSON_STEPS.map(step=>{
      const content=floor.lesson[step.key];
      const isCode=step.key==='example';
      const collapsed=mode==='mastery'&&['explanation','example','miniProject'].includes(step.key);
      return `<details class="lesson-step" ${collapsed?'':'open'}><summary>${escapeHTML(step.name)} <span class="step-sub">${escapeHTML(step.summary)}</span></summary>${isCode?codeHTML(content):`<p>${escapeHTML(content)}</p>`}</details>`;
    }).join('');
    let draft=floor.setup;
    try{draft=localStorage.getItem(DRAFT_KEY+floorNumber)??floor.setup;}catch{}
    this.showModal(`FLOOR ${String(floorNumber).padStart(2,'0')} / ${floor.topic.toUpperCase()}`,floor.title,`
      <p class="mission-brief">${escapeHTML(LORE[floorNumber])}</p><div class="challenge-layout"><div class="lesson-panel"><div class="section-label">PATCH ACADEMY · NINE-STEP METHOD</div>${lesson}</div>
      <div class="editor-panel"><div class="editor-header"><span>⌨ JAVASCRIPT TERMINAL</span><span class="editor-language">main.js</span></div>
        <p class="editor-help">Complete <code>${escapeHTML(floor.fn)}()</code> and run your solution against multiple cases. <strong>All checks must pass</strong> to unlock the elevator.</p>
        <label for="code-input" class="sr-only">Editable JavaScript solution</label><textarea id="code-input" class="code-input" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="JavaScript solution editor"></textarea>
        <div class="editor-footer"><span id="test-count">${floor.tests.length} TESTS · ${solved?'✓ PREVIOUSLY CLEARED':'AWAITING EXECUTION'}</span><span>Ctrl+Enter to run</span></div>
        <div class="action-row editor-actions">${button('▶ Run tests','run','primary-btn')}${button('Hint','hint')}${button('Reset editor','reset-code')}</div><p id="hint-area" class="hint-area hidden" aria-live="polite"></p><div id="test-feedback" role="status" aria-live="polite">${solved?'<div class="pass-banner">✓ Elevator already unlocked. You can still practice this floor.</div>':''}</div>
        ${solved?`<div class="action-row">${button(floorNumber===10?'View chapter finale':'Enter next elevator','elevator','primary-btn')}</div>`:''}
      </div></div>
    `,'challenge');
    const input=$('code-input');input.value=draft;
    input.addEventListener('input',()=>{try{localStorage.setItem(DRAFT_KEY+floorNumber,input.value.slice(0,12000));}catch{}});
    input.addEventListener('keydown',event=>{
      if(event.key==='Tab'){event.preventDefault();const {selectionStart:start,selectionEnd:end}=input;input.setRangeText('  ',start,end,'end');input.dispatchEvent(new Event('input'));}
      if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();this.gradeChallenge();}
    });
  }
  showHint(){if(this.activeModal!=='challenge')return;const area=$('hint-area');area.textContent='PATCH: '+getFloor(this.progress.currentFloor).lesson.hint;area.classList.remove('hidden');}
  resetCode(){if(this.activeModal!=='challenge')return;const floor=this.progress.currentFloor;$('code-input').value=getFloor(floor).setup;try{localStorage.removeItem(DRAFT_KEY+floor);}catch{}$('test-feedback').textContent='Editor restored to the starter solution.';}
  async gradeChallenge(){
    if(this.activeModal!=='challenge'||this.running)return;
    const floorNumber=this.progress.currentFloor;
    const floor=getFloor(floorNumber);
    const input=$('code-input');const source=input?.value??'';
    const feedback=$('test-feedback');
    if(source.length>12000){feedback.textContent='Code too long (maximum 12,000 characters).';return;}
    this.running=true;
    const runButton=$('modal-body').querySelector('[data-action="run"]');if(runButton){runButton.disabled=true;runButton.textContent='RUNNING...';}
    feedback.innerHTML='<div class="pending-banner">Running isolated tests...</div>';
    this.progress=registerAttempt(this.progress,floorNumber);this.persist();
    let result;
    try{result=await runChallenge(source,floor);}catch(error){result={passed:false,error:String(error.message),results:[]};}
    this.running=false;
    // Ignore stale result if player closed or switched floors while running.
    if(this.activeModal!=='challenge'||this.progress.currentFloor!==floorNumber||!feedback.isConnected)return;
    if(runButton){runButton.disabled=false;runButton.textContent='▶ Run tests';}
    const headline=result.passed?'<div class="pass-banner">✓ ALL TESTS PASSED · ACCESS GRANTED</div>':`<div class="fail-banner">✕ ${escapeHTML(result.error??'Some tests failed. Fix the logic and retry.')}</div>`;
    const rows=(result.results??[]).map(r=>`<div class="test-case ${r.ok?'test-pass':'test-fail'}"><strong>${r.ok?'✓':'✕'} ${escapeHTML(r.label)}</strong><div>expected <code>${escapeHTML(r.expected)}</code><br>received <code>${escapeHTML(r.actual)}</code></div></div>`).join('');
    feedback.innerHTML=headline+rows;
    if(result.passed){
      this.progress=completeFloor(this.progress,floorNumber);this.persist();emit('game:solved',{floor:floorNumber});
      sound.beep('ok');this.say(getFloor(floorNumber).success);
      const area=$('test-feedback');area.insertAdjacentHTML('beforeend',`<p class="muted">You passed ${floor.tests.length} tests. Review the steps above or continue to the elevator.</p><div class="action-row">${button(floorNumber===10?'Claim Logic Core / Finale':'Enter elevator','elevator','primary-btn')}</div>`);
    }else{sound.beep('error');this.say('PATCH: Bugs are clues, not a verdict. Read the failing cases and try again.');}
  }
  takeElevator(floorNumber){
    if(!this.progress.completed.includes(floorNumber)){this.say('PATCH: The elevator is locked. Finish the terminal challenge.');return;}
    if(floorNumber===10){this.openFinale();return;}
    const next=floorNumber+1;
    if(next>10)return;
    this.gotoFloor(next);
    this.showModal(`FLOOR ${String(next).padStart(2,'0')} / ARRIVAL`,`WELCOME TO ${getFloor(next).title.toUpperCase()}`,`<div class="arrival-card"><span class="eyebrow">SECTOR 01 · CONTINUE ASCENT</span><p>${escapeHTML(LORE[next])}</p><div class="quote">${escapeHTML(getFloor(next).dialogue)}</div></div><div class="action-row">${button('Start coding mission','challenge','primary-btn')}${button('Explore floor','floor-map')}</div>`,'arrival');
  }
  openFinale(){
    this.showModal('CHAPTER I / COMPLETE','THE LOGIC CORE IS RESTORED',`<div class="finale"><div class="core-orb" aria-hidden="true">◇</div><p class="terminal-green">&gt; CHAPTER 01: COMPLETE<br>&gt; LOGIC CORE: ONLINE<br>&gt; SUBJECT 404: VERIFIED<br>&gt; TOWER STATUS: 10 / 100 FLOORS RESTORED</p><blockquote>ROOT: "Containment remains active. One core is not enough."<br><br>PATCH: "Ten floors, one core, and somehow we're still alive. I call that progress."<br><br>NULL: "If you're reading this... don't trust the elevator."</blockquote><p><strong>Chapter I unlocked a new mystery.</strong> Chapter II will teach HTML and the foundations of the Tower Control System.</p></div><div class="action-row">${button('Review progress','progress','primary-btn')}${button('Replay floors','floor-map')}${button('Story archive','review-story')}</div>`,'finale');
  }
  openHelp(){this.showModal('SYSTEM HELP','HOW TO PLAY',`
    <div class="help-grid"><div><kbd>A</kbd> / <kbd>←</kbd><p>Move left</p></div><div><kbd>D</kbd> / <kbd>→</kbd><p>Move right</p></div><div><kbd>W</kbd> / <kbd>↑</kbd> / <kbd>SPACE</kbd><p>Jump</p></div><div><kbd>SHIFT</kbd><p>Run</p></div><div><kbd>E</kbd><p>Interact with a terminal or elevator when nearby</p></div><div><kbd>Ctrl</kbd> + <kbd>Enter</kbd><p>Run code tests while editing</p></div></div><p>Touch controls appear below the game on small screens. You can also open the coding challenge using the button below the game from anywhere on the floor.</p><p>Learn the concepts using PATCH's nine-step lesson panels; then edit JavaScript and pass all automated tests. Errors don't cost lives.</p><div class="action-row">${button('Back to game','floor-map')}${button('Open coding terminal','challenge','primary-btn')}</div>`,'help');}
  downloadProgress(){const data=exportProgress(this.progress);const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='codebreak-save-v2.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async handleImport(file){
    if(!file)return;
    if(file.size>128000){this.say('PATCH: Save file exceeds the 128 KB limit.');this.openProgress();return;}
    try{this.progress=importProgress(await file.text());this.persist();this.gotoFloor(this.progress.currentFloor);this.say('PATCH: Save imported successfully. Welcome back.');}
    catch(error){this.openProgress();this.say('PATCH: Invalid or incompatible save. Nothing was overwritten.');}
  }
  confirmReset(){this.showModal('DANGER ZONE','RESET ALL LOCAL PROGRESS',`<p>Reset all chapter progress, diagnostic results, completion records, and floor unlocks on this browser?</p><p class="muted">Your existing downloaded save file will not be affected. Editor drafts remain locally stored separately.</p><div class="action-row">${button('Yes, reset everything','confirm-reset','danger-btn')}${button('Keep my progress','progress','secondary-btn')}</div>`,'confirm-reset');}
  resetProgress(){this.progress=createProgress();this.progress.onboarding=true;this.persist();this.gotoFloor(0);this.say('PATCH: Fresh start. We can rebuild this. Again.');}
}
