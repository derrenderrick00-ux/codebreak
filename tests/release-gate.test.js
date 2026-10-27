import test from 'node:test';
import assert from 'node:assert/strict';
import {assessAssets,budget} from '../scripts/check_bundle_budget.mjs';

test('bundle gate accepts separated small entry and cached large engine',()=>{
  const outcome=assessAssets([
    {name:'index-a.js',bytes:101_000,gzip:36_000},
    {name:'GameScene-b.js',bytes:1_210_000,gzip:325_000},
    {name:'index-c.css',bytes:18_000,gzip:5000}
  ]);
  assert.equal(outcome.passed,true);
  assert.equal(outcome.totalBytes,1_311_000);
});
test('bundle gate detects engine accidentally bundled into initial entry',()=>{
  const outcome=assessAssets([{name:'index-big.js',bytes:1_300_000,gzip:360_000}]);
  assert.equal(outcome.passed,false);
  assert.ok(outcome.warnings.some(x=>x.includes('Initial JavaScript')));
});
test('bundle gate detects missing entry chunk and oversized CSS',()=>{
  const outcome=assessAssets([{name:'GameScene-big.js',bytes:1000,gzip:700},{name:'index-big.css',bytes:budget.css+1,gzip:1000}]);
  assert.equal(outcome.passed,false);
  assert.equal(outcome.warnings.length,2);
});
