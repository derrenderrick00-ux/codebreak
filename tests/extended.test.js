import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS,EXTENDED_FLOORS} from '../src/content/extended.js';
import {FLOORS} from '../src/content/floors.js';
import {createProgress,completeFloor,loadProgress,saveProgress,summarize} from '../src/state/progress.js';
import {validateSQL,gradeContent} from '../src/runtime/validators.js';
test('100-floor chapters and all reference solutions are present',()=>{
  assert.equal(CHAPTERS.length,10);assert.equal(EXTENDED_FLOORS.length,90);
  for(let n=1;n<=100;n++){const room=FLOORS[n];assert.equal(room.floor,n);assert.equal(room.chapter,Math.ceil(n/10));assert.ok(room.reference||n<=10);}
  for(let n=10;n<=100;n+=10)assert.equal(FLOORS[n].difficulty,'boss');
});
test('all extended JavaScript solutions pass their authored edge cases',async()=>{
  let total=0;
  for(const floor of EXTENDED_FLOORS.filter(f=>f.kind==='js')){
    let solve;
    try{solve=new Function(`"use strict";\n${floor.reference}\nreturn ${floor.fn};`)();}
    catch(e){throw new Error(`Floor ${floor.floor} invalid reference code: ${e.message}`);}
    for(const caseOf of floor.tests){
      let result;
      try{result=await solve(...structuredClone(caseOf.args));}
      catch(e){throw new Error(`Floor ${floor.floor} ${caseOf.label}: ${e.message}`);}
      assert.deepEqual(result,caseOf.expected,`Floor ${floor.floor}: ${caseOf.label}`);
      total++;
    }
  }
  assert.ok(total>=160,`Expected 160+ fixtures, got ${total}`);
});
test('HTML and CSS challenges all contain individually authored checks',()=>{
  for(const floor of EXTENDED_FLOORS.filter(f=>['html','css'].includes(f.kind))){
    assert.ok(floor.reference.length>30);
    assert.ok(floor.tests.length>=2);
    assert.equal(new Set(floor.tests.map(t=>t.label)).size,floor.tests.length);
  }
});
test('SQL checks recognize authored statements and reject blank submissions',()=>{
  for(const floor of EXTENDED_FLOORS.filter(f=>f.kind==='sql')){
    assert.equal(validateSQL(floor.reference,floor).passed,true,`SQL Floor ${floor.floor}`);
    assert.equal(validateSQL('',floor).passed,false,`Blank SQL Floor ${floor.floor}`);
    assert.equal(validateSQL('-- '+floor.reference,floor).passed,false,`Comment-only SQL Floor ${floor.floor}`);
  }
});
test('extended progression unlocks each chapter and awards ten cores',()=>{
  let state=createProgress();
  state=completeFloor(state,0);
  for(let floor=1;floor<=100;floor++){
    state=completeFloor(state,floor);
    assert.equal(state.unlockedFloor,Math.min(100,floor+1));
  }
  const stats=summarize(state);
  assert.equal(stats.cleared,100);assert.equal(stats.percentage,100);assert.equal(stats.cores,10);assert.ok(stats.gameCompleted);
});
test('legacy v2 progress remains readable after upgrade',()=>{
 const memory=new Map();const store={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const old={...createProgress(),version:2,currentFloor:7,unlockedFloor:7,completed:[0,1,2,3],chapterCompleted:false};
 memory.set('codebreak:progress:v2',JSON.stringify(old));
 let state=loadProgress(store);
 assert.equal(state.currentFloor,7);assert.deepEqual(state.completed,[0,1,2,3]);
 state=completeFloor(state,7);saveProgress(state,store);
 assert.ok(loadProgress(store).completed.includes(7));
});
test('separate validators dispatch to a SQL grader, not the JS runner',async()=>{
 const floor=EXTENDED_FLOORS.find(f=>f.floor===73);
 const answer=await gradeContent(floor.reference,floor,()=>{throw new Error('JS must not run for SQL')});
 assert.equal(answer.passed,true);
});
