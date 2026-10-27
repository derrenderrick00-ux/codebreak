/** Dependency-free, inert syntax display. The textarea remains the real accessible editor.
 * Only escaped text is ever inserted into the presentation layer. */
const ESCAPES = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
export const escapeCode = value => String(value).replace(/[&<>"']/g, c => ESCAPES[c]);
const TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|return|function|if|else|for|while|async|await|new|class|throw|try|catch|import|export|from|true|false|null|undefined|SELECT|FROM|WHERE|CREATE|TABLE|INSERT|INTO|UPDATE|DELETE|JOIN|PRIMARY|KEY|REFERENCES|NOT|NULL|VALUES|AND|OR|ORDER|BY|LIMIT)\b|\b\d+(?:\.\d+)?\b|<\/?[a-zA-Z][\w:-]*\b)/gi;
export function highlightCode(source) {
  const input = String(source);
  let output = '', last = 0;
  for(const m of input.matchAll(TOKEN_RE)) {
    output += escapeCode(input.slice(last,m.index));
    const token = m[0];
    const kind = token.startsWith('//') || token.startsWith('/*') || token.startsWith('<!--') ? 'comment'
      : /^["'`]/.test(token) ? 'string' : /^\d/.test(token) ? 'number'
      : token.startsWith('<') ? 'tag' : 'keyword';
    output += `<span class="tok-${kind}">${escapeCode(token)}</span>`;
    last = m.index + token.length;
  }
  return output + escapeCode(input.slice(last)) + '\n';
}
export function getEditorMetrics(value, selectionStart = 0) {
  const text = String(value);
  const lines = text.split('\n');
  return { lines: lines.length, characters: text.length, line: text.slice(0, selectionStart).split('\n').length };
}
export function setupEditor(textarea, {language='js',onChange=()=>{}}={}) {
  const display = document.getElementById('syntax-layer');
  const gutter = document.getElementById('editor-gutter');
  const metrics = document.getElementById('editor-metrics');
  const wrapper = document.getElementById('editor-surface');
  if(!textarea||!display||!gutter||!metrics||!wrapper)return ()=>{};
  const render = () => {
    const info = getEditorMetrics(textarea.value,textarea.selectionStart);
    display.innerHTML = highlightCode(textarea.value);
    gutter.textContent = Array.from({length:info.lines},(_,i)=>String(i+1)).join('\n');
    metrics.textContent = `${language.toUpperCase()} · Ln ${info.line}/${info.lines} · ${info.characters} chars`;
    onChange(textarea.value);
  };
  const syncScroll = () => {display.scrollTop=textarea.scrollTop;display.scrollLeft=textarea.scrollLeft;gutter.scrollTop=textarea.scrollTop;};
  const events=['input','click','keyup','select'];
  for(const name of events)textarea.addEventListener(name,render);
  textarea.addEventListener('scroll',syncScroll);
  render();
  return () => {for(const name of events) textarea.removeEventListener(name,render);textarea.removeEventListener('scroll',syncScroll);};
}
