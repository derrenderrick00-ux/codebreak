/** A small accessible flow stepper for every floor's visualization stage. */
const escape = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function visualSteps(text) {
  const input = String(text||'');
  const parts = input.split(/\s*(?:→|->|⟶|⇒)\s*/).map(s=>s.trim()).filter(Boolean);
  if(parts.length>1)return parts.slice(0,12);
  const phrases=input.split(/[.;]\s+/).map(s=>s.trim()).filter(Boolean);
  return phrases.length>1 ? phrases.slice(0,12) : [input || 'Read the objective','Apply the rule','Observe the output'];
}
export function mountVisualizer(host, text) {
  if(!host)return;
  const steps=visualSteps(text);let index=0;
  host.innerHTML=`<div class="visualizer-heading">INTERACTIVE CONCEPT TRACE <span id="trace-counter"></span></div><div class="trace-flow" id="trace-flow" role="list"></div><p class="trace-focus" id="trace-focus" aria-live="polite"></p><div class="action-row trace-controls"><button type="button" class="secondary-btn" id="trace-prev">← Previous</button><button type="button" class="secondary-btn" id="trace-next">Next →</button></div>`;
  const previous=host.querySelector('#trace-prev');const next=host.querySelector('#trace-next');
  const render=()=>{
    host.querySelector('#trace-flow').innerHTML=steps.map((s,i)=>`<div role="listitem" class="trace-node ${i===index?'trace-active':''}"><b>${i+1}</b><span>${escape(s)}</span></div>`).join('');
    host.querySelector('#trace-focus').textContent=`Step ${index+1}: ${steps[index]}`;
    host.querySelector('#trace-counter').textContent=`${index+1}/${steps.length}`;
    previous.disabled=index===0;next.disabled=index===steps.length-1;
  };
  previous.addEventListener('click',()=>{index=Math.max(0,index-1);render();});
  next.addEventListener('click',()=>{index=Math.min(steps.length-1,index+1);render();});
  render();
}
