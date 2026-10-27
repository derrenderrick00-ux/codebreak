import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeCode,highlightCode,getEditorMetrics} from '../src/ui/editor.js';
import {visualSteps} from '../src/learning/visualizer.js';
test('editor highlights inert escaped text without executing HTML',()=>{
 const result=highlightCode('const x = "<img src=x onerror=alert(1)>";');
 assert.ok(result.includes('tok-keyword')); assert.ok(result.includes('&lt;img')); assert.ok(!result.includes('<img'));
});
test('editor includes line and character metrics including trailing newline',()=>{
 assert.deepEqual(getEditorMetrics('one\ntwo\n',5),{lines:3,characters:8,line:2});
 assert.equal(escapeCode('"<&'), '&quot;&lt;&amp;');
});
test('visualization can split arrow paths, bounded to twelve',()=>{
 assert.deepEqual(visualSteps('INPUT → CHECK → OUTPUT'),['INPUT','CHECK','OUTPUT']);
 assert.equal(visualSteps(Array(40).fill('node').join(' → ')).length,12);
});
