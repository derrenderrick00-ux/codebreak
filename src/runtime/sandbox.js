/**
 * Untrusted learner JavaScript runs inside a Worker created by a sandboxed,
 * opaque-origin iframe with a restrictive CSP. The trusted page never evals it.
 * This is an educational, browser-local executor: not a production grading
 * service or a replacement for server-side VM/container isolation.
 */
const WORKER_SOURCE = String.raw`
self.onmessage = async (event) => {
  const { source, name, tests } = event.data;
  const safeName = /^[A-Za-z_$][\w$]*$/.test(name) ? name : null;
  if (!safeName || typeof source !== 'string' || source.length > 12000) {
    self.postMessage({ kind: 'result', error: 'Unsupported function name or code length.', passed: false, results: [] });
    return;
  }
  let solve;
  try {
    // This executes in a dedicated worker inside an opaque sandbox iframe.
    const factory = new Function('"use strict";\n' + source + '\n; return (typeof ' + safeName + ' === "function") ? ' + safeName + ' : null;');
    solve = factory();
    if (typeof solve !== 'function') throw new Error('Define a function named ' + safeName + '.');
  } catch (error) {
    self.postMessage({ kind: 'result', error: 'Compilation: ' + String(error.message).slice(0,200), passed: false, results: [] });
    return;
  }
  const outcomes = [];
  for (const test of tests) {
    try {
      // Clone inputs to prevent one test from mutating another test's values.
      const args = structuredClone(test.args);
      const actual = await Promise.resolve(solve(...args));
      const normalized = JSON.stringify(actual);
      const expected = JSON.stringify(test.expected);
      const ok = normalized === expected;
      outcomes.push({ label: String(test.label).slice(0,100), ok, expected: String(expected).slice(0,160), actual: String(normalized).slice(0,160) });
    } catch (error) {
      outcomes.push({ label: String(test.label).slice(0,100), ok: false, expected: JSON.stringify(test.expected), actual: String(error.message).slice(0,160) });
    }
  }
  self.postMessage({ kind: 'result', passed: outcomes.every(x => x.ok), results: outcomes });
};`;

const FRAME_CSP = `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; img-src 'none'; media-src 'none'; font-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'`;

function frameDocument() {
  const workerJson = JSON.stringify(WORKER_SOURCE).replaceAll('<', '\\u003c');
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}"></head><body><script>
    'use strict';
    let worker;
    let pendingToken = null;
    window.addEventListener('message', (event) => {
      if (event.source !== parent || !event.data || event.data.kind !== 'execute') return;
      pendingToken = event.data.token;
      try {
        const blob = new Blob([${workerJson}], {type:'text/javascript'});
        worker = new Worker(URL.createObjectURL(blob));
        worker.onmessage = (msg) => parent.postMessage({kind:'sandbox:result',token:pendingToken,result:msg.data}, '*');
        worker.onerror = () => parent.postMessage({kind:'sandbox:result',token:pendingToken,result:{passed:false,error:'Worker error',results:[]}}, '*');
        worker.postMessage({source:event.data.source,name:event.data.name,tests:event.data.tests});
      } catch (error) {
        parent.postMessage({kind:'sandbox:result',token:pendingToken,result:{passed:false,error:'Sandbox could not start: ' + String(error.message).slice(0,150),results:[]}}, '*');
      }
    });
    parent.postMessage({kind:'sandbox:ready'}, '*');
  <\/script></body></html>`;
}

export function runChallenge(source, challenge, { timeout = 2400 } = {}) {
  if (typeof document === 'undefined') return Promise.reject(new Error('Requires a browser'));
  const token = globalThis.crypto?.randomUUID?.() ?? String(Date.now()) + Math.random();
  return new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts'); // Intentionally no allow-same-origin.
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position:fixed;left:-10000px;width:1px;height:1px;border:0;pointer-events:none;';
    let settled = false;
    let timer;
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
      frame.remove(); // Terminates nested worker as well.
    };
    const finish = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const handleMessage = (event) => {
      // Opaque-origin sandbox frame emits null origin. Validate source and nonce.
      if (event.source !== frame.contentWindow || event.origin !== 'null') return;
      const data = event.data;
      if (data?.kind === 'sandbox:ready') {
        frame.contentWindow.postMessage({kind:'execute',token,source,name:challenge.fn,tests:challenge.tests}, '*');
      } else if (data?.kind === 'sandbox:result' && data.token === token) {
        finish(data.result);
      }
    };
    window.addEventListener('message', handleMessage);
    timer = setTimeout(() => finish({passed:false,error:'Execution timed out. Check for infinite loops or slow operations.',results:[],timeout:true}), timeout);
    frame.srcdoc = frameDocument();
    document.body.append(frame);
  });
}
