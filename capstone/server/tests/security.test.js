import test from 'node:test';
import assert from 'node:assert/strict';
import {strongPassword,validEmail,hashPassword,verifyPassword,cleanCore} from '../src/security.js';
test('password minimum and maximum',()=>{assert.equal(strongPassword('123456789012'),true);assert.equal(strongPassword('short'),false);assert.equal(strongPassword('x'.repeat(257)),false);});
test('email basic validation',()=>{assert.ok(validEmail('student@example.org'));assert.equal(validEmail('no-at-sign'),false);});
test('scrypt hashing and verification',async()=>{const digest=await hashPassword('correct horse battery');assert.ok(await verifyPassword('correct horse battery',digest.salt,digest.hash));assert.equal(await verifyPassword('wrong password',digest.salt,digest.hash),false);});
test('core validation rejects mass assignment and invalid input',()=>{assert.deepEqual(cleanCore({name:' Logic ',online:true,owner_id:999}),{name:'Logic',online:true});assert.equal(cleanCore({name:'',online:true}),null);assert.equal(cleanCore({name:'OK',online:'true'}),null);});
