import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgress, completeFloor, setCurrentFloor, applyPlacement, loadProgress, saveProgress, importProgress, summarize } from '../src/state/progress.js';
const storage=()=>{
 const contents=new Map();
 return {getItem:k=>contents.get(k)??null,setItem:(k,v)=>contents.set(k,v),removeItem:k=>contents.delete(k)};
};
test('a fresh player starts on floor zero without mastery',()=>{
 const p=createProgress();assert.equal(p.currentFloor,0);assert.deepEqual(p.completed,[]);assert.equal(p.unlockedFloor,0);
});
test('completing a floor unlocks the next without skipping others',()=>{
 let p=completeFloor(createProgress(),0);
 assert.deepEqual(p.completed,[0]);assert.equal(p.unlockedFloor,1);
 p=completeFloor(p,1);assert.equal(p.unlockedFloor,2);assert.equal(p.mastered[1],true);
 assert.throws(()=>setCurrentFloor(p,3),/locked/);
 assert.equal(setCurrentFloor(p,2).currentFloor,2);
});
test('diagnostic grants access but never counts as completed or mastered',()=>{
 let p=applyPlacement(createProgress(),{score:8,total:8,recommendedFloor:8});
 assert.equal(p.unlockedFloor,8);assert.equal(p.currentFloor,8);
 assert.deepEqual(p.completed,[]);assert.deepEqual(p.mastered,{});
});
test('chapter boss completion awards logic core',()=>{
 const p=completeFloor(createProgress(),10);assert.equal(p.chapterCompleted,true);assert.equal(summarize(p).core,true);
});
test('save and load roundtrip preserves valid state',()=>{
 const store=storage();const before=completeFloor(createProgress(),1);
 saveProgress(before,store);const after=loadProgress(store);
 assert.deepEqual(after.completed,[1]);assert.equal(after.unlockedFloor,2);
});
test('malformed local save is recovered without crash',()=>{
 const store=storage();store.setItem('codebreak:progress:v2','{{ BROKEN');
 const p=loadProgress(store);assert.equal(p.currentFloor,0);
 assert.equal(store.getItem('codebreak:progress:v2'),null);
 assert.ok(store.getItem('codebreak:corrupt:last'));
});
test('import rejects unsupported schema versions',()=>{
 assert.throws(()=>importProgress(JSON.stringify({...createProgress(),version:999})),/Unsupported/);
});
test('import strips invalid keys and excludes forged mastery',()=>{
 const p=importProgress(JSON.stringify({...createProgress(),completed:[1,100,-1,'2'],mastered:{'1':true,'2':true}}));
 assert.deepEqual(p.completed,[1]);assert.equal(p.mastered[1],true);assert.equal(p.mastered[2],undefined);
});
