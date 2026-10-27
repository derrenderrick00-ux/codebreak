import { emit, bus } from '../core/bus.js';
import { FLOORS, getFloor } from '../content/floors.js';
import { CHAPTERS } from '../content/extended.js';
import { gradeContent, inertHTMLPreview } from '../runtime/validators.js';
import { LESSON_STEPS } from '../learning/lesson.js';
import { DIAGNOSTIC, assessDiagnostic } from '../content/diagnostic.js';
import { loadProgress, saveProgress, completeFloor, applyPlacement, registerAttempt, setCurrentFloor, summarize, exportProgress, importProgress } from '../state/progress.js';
import { runChallenge } from '../runtime/sandbox.js';
import { sound } from '../core/sound.js';
import { resetLocalGame } from '../state/reset.js';
import { setupEditor } from './editor.js';
import { mountVisualizer } from '../learning/visualizer.js';

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
    bus.addEventListener('game:elevator:arrived',({detail})=>this.finishElevator(detail.floor));
    bus.addEventListener('game:elevator:stage',({detail})=>{
      const labels={opening:'LIFT OPENING',approaching:'SUBJECT 404 APPROACHING LIFT',entering:'SUBJECT 404 BOARDING',closing:'ELEVATOR DOORS CLOSING',ascending:'ASCENDING TO NEXT FLOOR'};
      const status=document.getElementById('game-status');if(status&&labels[detail.stage])status.textContent=labels[detail.stage];
    });
    bus.addEventListener('game:near',({detail})=>{
      $('in-game-hint').textContent = detail.terminal ? 'TERMINAL IN RANGE · Press E or choose Open challenge' : detail.door ? 'ELEVATOR IN RANGE · Press E to enter when unlocked' : 'A/D or ←/→ to move · W/↑/Space to jump · E to interact';
    });
  }
  persist() { this.progress = saveProgress(this.progress); this.updateHud(); }
  say(message) { $('patch-message').textContent = message; }
  updateHud() {
    const {cleared, percentage, cores, chapter} = summarize(this.progress);
    const floor = getFloor(this.progress.currentFloor);
    $('floor-label').textContent = `FLOOR ${String(floor.floor).padStart(2,'0')} / 100`;
    $('chapter-heading').textContent = CHAPTERS[chapter-1].title.toUpperCase();
    $('chapter-tag').textContent = `CHAPTER ${String(chapter).padStart(2,'0')} · ${CHAPTERS[chapter-1].topic.toUpperCase()}`;
    $('floor-summary').textContent = `${floor.title} · ${floor.topic}`;
    $('cores-count').textContent = `${cores} / 10`;
    $('cleared-count').textContent = `${cleared} / 100`;
    $('mode-label').textContent = this.progress.mode.toUpperCase();
    $('chapter-progress').textContent = `${percentage}% TOWER REPAIRED`;
    $('game-status').textContent = this.progress.completed.includes(floor.floor) ? 'SECURITY DOOR: UNLOCKED' : 'SECURITY DOOR: LOCKED';
  }
  updateSoundButton(){const btn=$('sound-toggle');btn.textContent=`Sound: ${this.progress.sound?'On':'Off'}`;btn.setAttribute('aria-pressed',String(this.progress.sound));}
  bindActions() {
    $('learn-button').addEventListener('click',()=>this.openChallenge(this.progress.currentFloor));
    $('floors-button').addEventListener('click',()=>this.openFloorMap());
    $('progress-button').addEventListener('click',()=>this.openProgress());
    $('new-game-button').addEventListener('click',()=>this.confirmReset());
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
      else if(action==='toggle-syntax')this.toggleSyntax();
      else if(action==='elevator')this.takeElevator(this.progress.currentFloor);
      else if(action==='mode')this.changeMode(target.dataset.mode);
      else if(action==='export')this.downloadProgress();
      else if(action==='import')$('progress-import').click();
      else if(action==='reset-progress')this.confirmReset();
      else if(action==='confirm-reset')this.resetProgress();
      else if(action==='cancel-reset')this.closeModal();
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
  openStory(){this.showModal('STORY ARCHIVE','THE TOWER OF CODE',`<p>Subject 404 is a memory-corrupted stickman trapped inside the hundred-floor Tower of Code. ROOT, the tower administrator, has sealed the exit after a catastrophic system failure.</p><p>PATCH guides you through repairs; NULL appears in the error logs, warning that not everything is as it seems. The Architect's legacy remains hidden at the tower summit.</p><p>This playable release contains all ten chapters and Floors 0–100. The backend and SQL chapters use browser simulations; complete the separate Tower Control System capstone for real Express/PostgreSQL practice.</p>${button('Return to floor map','floor-map')}`,'story');}
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
    const sections=CHAPTERS.map(ch=>{
      const group=FLOORS.filter(f=>f.chapter===ch.chapter || (ch.chapter===1&&f.floor===0));
      const cells=group.map(f=>{
        const unlocked=f.floor<=this.progress.unlockedFloor;
        const completed=this.progress.completed.includes(f.floor);
        const current=f.floor===this.progress.currentFloor;
        return `<button type="button" class="floor-cell ${unlocked?'':'floor-locked'} ${current?'floor-current':''}" data-action="floor" data-floor="${f.floor}" ${unlocked?'':'disabled'} aria-label="Floor ${f.floor}: ${escapeHTML(f.title)}, ${unlocked?'unlocked':'locked'}"><span>${String(f.floor).padStart(2,'0')}</span><strong>${escapeHTML(f.title)}</strong><small>${completed?'✓ COMPLETE':current?'● CURRENT':unlocked?'AVAILABLE':'🔒 LOCKED'}</small></button>`;
      }).join('');
      const won=this.progress.completed.includes(ch.chapter*10);
      return `<details class="chapter-group" ${ch.chapter===Math.ceil(Math.max(1,this.progress.currentFloor)/10)?'open':''}><summary><strong>CH ${String(ch.chapter).padStart(2,'0')} · ${escapeHTML(ch.title)}</strong> <span>${won?'✓ '+escapeHTML(ch.core):escapeHTML(ch.topic)}</span></summary><div class="floor-grid">${cells}</div></details>`;
    }).join('');
    this.showModal('TEN CHAPTERS / 100 FLOORS','TOWER FLOOR MAP',`<p class="muted">Choose any unlocked floor. The final floor of each chapter awards its core. Your diagnostic placement can unlock lessons without claiming completion.</p>${sections}<div class="action-row">${button('Story archive','review-story')}${button('Progress report','progress')}</div>`,'floor-map');
  }
  openProgress(){
    const stats=summarize(this.progress);
    const rows=FLOORS.map(f=>`<tr><td>${String(f.floor).padStart(2,'0')}</td><td>${escapeHTML(f.topic)}</td><td>${this.progress.mastered[f.floor]?'Passed':this.progress.completed.includes(f.floor)?'Cleared':'Not passed'}</td><td>${this.progress.attempts[f.floor]??0}</td></tr>`).join('');
    this.showModal('PLAYER RECORD','YOUR LEARNING PROGRESS',`
      <div class="stat-grid"><div><strong>${stats.percentage}%</strong><small>Tower complete</small></div><div><strong>${stats.cleared}/100</strong><small>Floors cleared</small></div><div><strong>${stats.cores}</strong><small>Recovered cores</small></div></div>
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
      <p class="mission-brief">${escapeHTML(LORE[floorNumber] ?? `${CHAPTERS[floor.chapter-1].title}: ${floor.dialogue}`)}</p><div class="challenge-layout"><div class="lesson-panel"><div class="section-label">PATCH ACADEMY · NINE-STEP METHOD</div>${lesson}<div id="lesson-visualizer" class="lesson-visualizer" aria-label="Interactive concept visualization"></div></div>
      <div class="editor-panel"><div class="editor-header"><span>⌨ ${escapeHTML((floor.kind??'js').toUpperCase())} TERMINAL</span><span class="editor-language">${floor.kind==='html'?'index.html':floor.kind==='css'?'style.css':floor.kind==='sql'?'query.sql':'main.js'}</span></div>
        <p class="editor-help">${floor.kind==='html'?'Write HTML and pass the structural checks.':floor.kind==='css'?'Write CSS and pass the selector/declaration checks.':floor.kind==='sql'?'Write PostgreSQL SQL and pass the structural checks (not a live database).':`Complete <code>${escapeHTML(floor.fn)}()</code> and pass multiple tests.`} <strong>All checks must pass</strong> to unlock the elevator.${floor.chapter>=6&&floor.kind==='js'?' This lab models a backend concept in browser JavaScript; see capstone/ for live server exercises.':''}</p>
        <label for="code-input" class="sr-only">Editable programming solution</label><div class="editor-surface" id="editor-surface"><div class="editor-gutter" id="editor-gutter" aria-hidden="true"></div><div class="editor-stack"><pre class="syntax-layer" id="syntax-layer" aria-hidden="true"></pre><textarea id="code-input" class="code-input" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Code solution editor"></textarea></div></div><div class="editor-toolbar"><span id="editor-metrics" aria-live="off">Editor ready</span><button type="button" class="quiet-btn" data-action="toggle-syntax" id="syntax-toggle" aria-pressed="true">Highlight: On</button></div>
        ${floor.kind==='html'||floor.kind==='css'?'<div class="preview-row"><span>LIVE PREVIEW · isolated frame</span><iframe title="Sandboxed code preview" id="code-preview" sandbox="" referrerpolicy="no-referrer"></iframe></div>':''}<div class="editor-footer"><span id="test-count">${floor.tests.length} TESTS · ${solved?'✓ PREVIOUSLY CLEARED':'AWAITING EXECUTION'}</span><span>Ctrl+Enter to run</span></div>
        <div class="action-row editor-actions">${button('▶ Run tests','run','primary-btn')}${button('Hint','hint')}${button('Reset editor','reset-code')}</div><p id="hint-area" class="hint-area hidden" aria-live="polite"></p><div id="test-feedback" role="status" aria-live="polite">${solved?'<div class="pass-banner">✓ Elevator already unlocked. You can still practice this floor.</div>':''}</div>
        ${solved?`<div class="action-row">${button(floorNumber===100?'Reach the surface':floorNumber%10===0?'Claim chapter core':'Board elevator','elevator','primary-btn')}</div>`:''}
      </div></div>
    `,'challenge');
    const input=$('code-input');input.value=draft;
    setupEditor(input,{language:floor.kind??'js'});
    mountVisualizer($('lesson-visualizer'),floor.lesson.visualization);
    const updatePreview=()=>{const preview=$('code-preview');if(!preview)return;if(floor.kind==='html')preview.srcdoc=inertHTMLPreview(input.value);else if(floor.kind==='css')preview.srcdoc=inertHTMLPreview(`<style>${input.value.replace(/<\/style/gi,'')}</style><div class=\"dashboard\"><div class=\"card\">Tower Control</div><div class=\"card\">Logic Core</div></div><div class=\"panel cores layout\"><button class=\"btn control door\">Signal</button></div>`);};
    updatePreview();
    input.addEventListener('input',()=>{try{localStorage.setItem(DRAFT_KEY+floorNumber,input.value.slice(0,12000));}catch{}updatePreview();});
    input.addEventListener('keydown',event=>{
      if(event.key==='Tab'){event.preventDefault();const {selectionStart:start,selectionEnd:end}=input;input.setRangeText('  ',start,end,'end');input.dispatchEvent(new Event('input'));}
      if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();this.gradeChallenge();}
    });
  }
  toggleSyntax(){
    const holder=$('editor-surface');if(!holder)return;
    const off=holder.classList.toggle('syntax-off');const btn=$('syntax-toggle');
    btn.textContent=`Highlight: ${off?'Off':'On'}`;btn.setAttribute('aria-pressed',String(!off));
    $('code-input').focus();
  }
  showHint(){if(this.activeModal!=='challenge')return;const area=$('hint-area');area.textContent='PATCH: '+getFloor(this.progress.currentFloor).lesson.hint;area.classList.remove('hidden');}
  resetCode(){if(this.activeModal!=='challenge')return;const floor=this.progress.currentFloor;$('code-input').value=getFloor(floor).setup;$('code-input').dispatchEvent(new Event('input'));try{localStorage.removeItem(DRAFT_KEY+floor);}catch{}$('test-feedback').textContent='Editor restored to the starter solution.';}
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
    try{result=await gradeContent(source,floor,runChallenge);}catch(error){result={passed:false,error:String(error.message),results:[]};}
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
      const area=$('test-feedback');area.insertAdjacentHTML('beforeend',`<p class="muted">You passed ${floor.tests.length} checks. The security door has opened. Board the lift to see the next story scene.</p><div class="action-row">${button(floorNumber===100?'Face ROOT':floorNumber%10===0?'Claim Core & Board':'Board elevator','elevator','primary-btn')}</div>`);
    }else{sound.beep('error');this.say('PATCH: Bugs are clues, not a verdict. Read the failing cases and try again.');}
  }
  takeElevator(floorNumber){
    if(!this.progress.completed.includes(floorNumber)){this.say('PATCH: Elevator locked. Solve the terminal first.');return;}
    if(this.elevatorInProgress)return;
    this.elevatorInProgress=true;
    this.closeModal();
    this.say('PATCH: Elevator doors open. Try to look like you know where we are going.');
    emit('game:elevator:begin',{floor:floorNumber});
  }
  finishElevator(floorNumber){
    if(!this.elevatorInProgress||this.progress.currentFloor!==floorNumber)return;
    this.elevatorInProgress=false;
    if(floorNumber===100){this.openFinale();return;}
    const next=floorNumber+1;
    this.gotoFloor(next);
    const previousChapter=getFloor(floorNumber).chapter;
    const coreScene=floorNumber>0&&floorNumber%10===0;
    const header=coreScene?`CORE ${previousChapter} RESTORED · ${CHAPTERS[previousChapter-1].core.toUpperCase()}`:`FLOOR ${String(next).padStart(2,'0')} / ARRIVAL`;
    const story=coreScene?`<p>ROOT: "Core recovered. Containment holds." PATCH: "Another chapter survived. Nine kinds of problem-solving and only a few existential crises."</p>`:`<p>${escapeHTML(getFloor(next).dialogue)}</p>`;
    this.showModal(header,`WELCOME TO ${getFloor(next).title.toUpperCase()}`,`<div class="arrival-card"><span class="eyebrow">CHAPTER ${getFloor(next).chapter} · CONTINUE ASCENT</span>${story}<div class="quote">${escapeHTML(getFloor(next).dialogue)}</div></div><div class="action-row">${button('Start next mission','challenge','primary-btn')}${button('Explore tower','floor-map')}</div>`,'arrival');
  }
  openFinale(){
    this.showModal('TOWER OF CODE / THE END','SYSTEM RESTORED · FREEDOM GRANTED',`<div class="finale"><div class="core-orb" aria-hidden="true">◇</div><p class="terminal-green">&gt; ALL TEN CHAPTERS CLEARED<br>&gt; ROOT: CONTAINMENT RELEASED<br>&gt; IDENTITY: DEVELOPER<br>&gt; TOWER STATUS: 100 / 100</p><blockquote>ROOT: "Containment was never meant to imprison you. It protected the world from an incomplete system."<br><br>PATCH: "You escaped a hundred floors of bugs. Now you’re qualified to create your own."<br><br>NULL: "See you outside, Subject 404."</blockquote><p>The city lights turn on. Subject 404 steps into the outside world. Your next mission is independent full-stack engineering.</p><p class="muted">Game completion documents in-game assessment only. Build, test and deploy the included real Tower Control System capstone separately for hands-on Node, Express, PostgreSQL, JWT and production practice.</p></div><div class="action-row">${button('Review progress','progress','primary-btn')}${button('Replay floors','floor-map')}${button('Story archive','review-story')}</div>`,'finale');
  }
  openHelp(){this.showModal('SYSTEM HELP','HOW TO PLAY',`
    <div class="help-grid"><div><kbd>A</kbd> / <kbd>←</kbd><p>Move left</p></div><div><kbd>D</kbd> / <kbd>→</kbd><p>Move right</p></div><div><kbd>W</kbd> / <kbd>↑</kbd> / <kbd>SPACE</kbd><p>Jump</p></div><div><kbd>SHIFT</kbd><p>Run</p></div><div><kbd>E</kbd><p>Interact with a terminal or elevator when nearby</p></div><div><kbd>Ctrl</kbd> + <kbd>Enter</kbd><p>Run code tests while editing</p></div></div><p>Touch controls appear below the game on small screens. You can also open the coding challenge using the button below the game from anywhere on the floor.</p><p>Learn using PATCH's nine-step panels and the interactive concept stepper. The editor offers line numbers and optional syntax highlighting; press Ctrl+Enter to run tests. Errors don't cost lives.</p><div class="action-row">${button('Back to game','floor-map')}${button('Open coding terminal','challenge','primary-btn')}</div>`,'help');}
  downloadProgress(){const data=exportProgress(this.progress);const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='codebreak-save-v2-compatible.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async handleImport(file){
    if(!file)return;
    if(file.size>128000){this.say('PATCH: Save file exceeds the 128 KB limit.');this.openProgress();return;}
    try{this.progress=importProgress(await file.text());this.persist();this.gotoFloor(this.progress.currentFloor);this.say('PATCH: Save imported successfully. Welcome back.');}
    catch(error){this.openProgress();this.say('PATCH: Invalid or incompatible save. Nothing was overwritten.');}
  }
  confirmReset(){this.showModal('DANGER ZONE','START A NEW GAME',`
    <p>This will permanently erase your <strong>local floor progress, mastery, diagnostic placement, attempts, and saved editor drafts</strong> on this browser.</p>
    <p class="muted">To keep your work, export your save first. Downloaded backup files will not be deleted.</p>
    <div class="action-row">${button('Export backup first','export')}${button('Erase progress & start again','confirm-reset','danger-btn')}${button('Cancel','cancel-reset','secondary-btn')}</div>
  `,'confirm-reset');}
  resetProgress(){
    this.progress=resetLocalGame();
    this.running=false;
    this.elevatorInProgress=false;
    sound.setEnabled(false);
    this.updateSoundButton();
    this.gotoFloor(0);
    this.openIntro();
    this.say('PATCH: Everything is back to Floor 0. Our bugs are getting nostalgic.');
  }
}
