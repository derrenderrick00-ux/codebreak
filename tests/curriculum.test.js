import test from 'node:test';
import assert from 'node:assert/strict';
import { FLOORS, getFloor } from '../src/content/floors.js';
import { LESSON_STEPS, validateLesson } from '../src/learning/lesson.js';
import { DIAGNOSTIC, assessDiagnostic } from '../src/content/diagnostic.js';

test('Ten chapters have exactly 100 numbered floors plus Floor 0', () => {
  assert.equal(FLOORS.length,101);
  assert.deepEqual(FLOORS.map(x=>x.floor),Array.from({length:101},(_,i)=>i));
  assert.equal(getFloor(999), FLOORS[0]);
});
test('each floor includes all nine study stages and valid test definitions', () => {
  assert.equal(LESSON_STEPS.length,9);
  for(const floor of FLOORS){
    assert.equal(validateLesson(floor),true,`Floor ${floor.floor} missing study stages`);
    if(!floor.kind||floor.kind==='js')assert.match(floor.setup,new RegExp(`function ${floor.fn}\\s*\\(`));
    assert.ok(floor.tests.length>=2,`Floor ${floor.floor} has fewer than 2 checks`);
    for(const spec of floor.tests){
      if(!floor.kind||floor.kind==='js'){assert.ok(Array.isArray(spec.args));assert.ok(Object.hasOwn(spec,'expected'));}
      assert.ok(typeof spec.label==='string'&&spec.label.length>0);
    }
  }
});
test('diagnostic has unique options and defensible placement brackets', () => {
  assert.equal(DIAGNOSTIC.length,8);
  for (const q of DIAGNOSTIC) {
    assert.equal(q.choices.length,4);
    assert.ok(q.answer>=0 && q.answer<4);
  }
  assert.deepEqual(assessDiagnostic(DIAGNOSTIC.map(q=>q.answer)),{score:8,total:8,recommendedFloor:8});
  assert.equal(assessDiagnostic(Array(8).fill(null)).recommendedFloor,1);
});
