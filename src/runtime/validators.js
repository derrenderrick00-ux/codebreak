/** Trusted structural checks for beginner exercises. These are NOT a security
 * certification, semantic equivalence proof, SQL execution engine, or full CSS renderer. */
const text = value => String(value ?? '');
const testResult = (test, ok, actual) => ({label:test.label,ok,expected:'requirement satisfied',actual:text(actual).slice(0,180)});
export function validateHTML(source, challenge, {DOMParserClass=globalThis.DOMParser}={}) {
  if(!DOMParserClass)return {passed:false,error:'HTML parser unavailable in this environment.',results:[]};
  if(source.length>30000)return {passed:false,error:'HTML is too long.',results:[]};
  let doc;
  try{doc=new DOMParserClass().parseFromString(source,'text/html');}
  catch{return {passed:false,error:'HTML parser error.',results:[]};}
  const results=challenge.tests.map(check=>{
    try {
      const nodes=[...doc.querySelectorAll(check.selector)];
      const count=nodes.length;
      const enough=count>=(check.min??1);
      const attrOK=!check.attrNonEmpty||nodes.some(node=>Boolean(node.getAttribute(check.attrNonEmpty)?.trim()));
      return testResult(check,enough&&attrOK,`${count} matching element(s)${!attrOK?'; missing attribute':''}`);
    } catch { return testResult(check,false,'Invalid selector definition'); }
  });
  return {passed:results.every(x=>x.ok),results};
}
export function validateCSS(source,challenge,{CSSStyleSheetClass=globalThis.CSSStyleSheet}={}) {
  if(source.length>30000)return {passed:false,error:'CSS is too long.',results:[]};
  if(/@import\b|url\s*\(/i.test(source))return {passed:false,error:'External imports and URLs are not allowed in this exercise.',results:[]};
  if(!CSSStyleSheetClass)return {passed:false,error:'CSS parser unavailable in this browser.',results:[]};
  let sheet;
  try{sheet=new CSSStyleSheetClass();sheet.replaceSync(source);}
  catch(error){return {passed:false,error:`CSS parser: ${String(error.message).slice(0,130)}`,results:[]};}
  const results=challenge.tests.map(check=>{
    const rules=[];
    const gather=(list,media='')=>{
      for(const rule of list){
        if(rule.type===1)rules.push({selector:rule.selectorText,style:rule.style,media});
        else if(rule.type===4)gather(rule.cssRules,rule.conditionText.replace(/\s+/g,' ').replace(/[()]/g,'').trim());
      }
    };
    gather(sheet.cssRules);
    const mediaNormalize=m=>m?.toLowerCase().replace(/\s+/g,'').replace(/[()]/g,'')??'';
    // Compare CSSOM-canonicalized declarations (e.g. #fff -> rgb(255, 255, 255), 300ms -> 0.3s).
    let expectedCSS=check.value;
    try{const expectedSheet=new CSSStyleSheetClass();expectedSheet.replaceSync(`${check.selector}{${check.property}:${check.value}}`);expectedCSS=expectedSheet.cssRules[0]?.style?.getPropertyValue(check.property)?.trim()??check.value;}catch{}
    const hit=rules.some(rule=>rule.selector.split(',').map(s=>s.trim()).includes(check.selector)
      &&(!check.media||mediaNormalize(rule.media).includes(mediaNormalize(check.media)))
      &&rule.style.getPropertyValue(check.property).trim().replace(/\s+/g,' ').toLowerCase()===expectedCSS.replace(/\s+/g,' ').toLowerCase());
    return testResult(check,hit,hit?'Matching CSS rule found':'Missing selector/property/value');
  });
  return {passed:results.every(x=>x.ok),results};
}
export function validateSQL(source,challenge) {
  if(source.length>30000)return {passed:false,error:'SQL is too long.',results:[]};
  const clean=source.replace(/--[^\n]*/g,' ').replace(/\/\*[\s\S]*?\*\//g,' ').replace(/\s+/g,' ').trim().toUpperCase();
  const results=challenge.tests.map(check=>{
    const missing=check.tokens.filter(part=>!clean.includes(part.toUpperCase().replace(/\s+/g,' ')));
    return testResult(check,missing.length===0,missing.length?`Missing: ${missing.join(', ')}`:'SQL structure contains expected clauses');
  });
  return {passed:results.every(x=>x.ok),results,warning:'Structural validation only; SQL is not executed against PostgreSQL.'};
}
export function validationMode(challenge){return challenge.kind??'js';}
export async function gradeContent(source,challenge,runJavaScript){
  switch(validationMode(challenge)){
    case 'html':return validateHTML(source,challenge);
    case 'css':return validateCSS(source,challenge);
    case 'sql':return validateSQL(source,challenge);
    default:return runJavaScript(source,challenge);
  }
}
/** Show HTML in an opaque, non-scriptable iframe with CSP. Do not attach the input
 * to the trusted DOM. The source cannot request remote assets or run scripts. */
export function inertHTMLPreview(source){
  const csp="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'none'; form-action 'none'; base-uri 'none'";
  const meta=`<meta http-equiv="Content-Security-Policy" content="${csp}">`;
  return meta+source.replace(/<head([^>]*)>/i,`<head$1>${meta}`);
}
