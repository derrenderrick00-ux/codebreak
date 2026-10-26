import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { FLOORS } from '../src/content/floors.js';
// Test-only reference solutions, not shipped in game. Node vm is only used on
// trusted hardcoded solutions here; it is NOT a security sandbox for users.
const solutions = {
  0: `function identify(name) { const clean = name.trim(); return clean || 'Subject 404'; }`,
  1: `function powerOn(voltage) { return voltage >= 5; }`,
  2: `function checkAccess(hasKey, clearance) { return hasKey && clearance >= 3; }`,
  3: `function repairSignal(signal) { if (signal > 0) return 'ONLINE'; return 'OFFLINE'; }`,
  4: `function countSteps(target) { const out=[]; for (let i=1;i<=target;i++) out.push(i); return out; }`,
  5: `function doublePower(values) { return values.map(v => v*2); }`,
  6: `function findSafeDoor(doors) { return doors.find(d=>d.status==='safe')?.id ?? -1; }`,
  7: `function formatTransmission(message) { return message.trim().toUpperCase(); }`,
  8: `function calculateEnergy(base, bonus=0) { return base*2+bonus; }`,
  9: `function repairCore(modules) { return modules.filter(m=>m.active===true).length; }`,
  10: `function stabilizeLift(start,end) { const out=[]; const s=start<=end?1:-1;for(let n=start;;n+=s){out.push(n);if(n===end)break;}return out; }`
};
for(const floor of FLOORS){
  test(`Floor ${floor.floor}: expected solution passes every authored case`,()=>{
    const solution=solutions[floor.floor];assert.ok(solution);
    const fn=vm.runInNewContext(`${solution}; ${floor.fn}`,{}, {timeout:500});
    for(const spec of floor.tests){
      const actual=fn(...structuredClone(spec.args));
      assert.equal(JSON.stringify(actual),JSON.stringify(spec.expected),`${floor.title}: ${spec.label}`);
    }
  });
}
