import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowLimiter} from '../src/limits.js';
test('bounded limiter rejects repeated attempts and allows them after expiry',()=>{
 let ms=0;
 const limiter=createWindowLimiter({limit:2,windowMs:1000,now:()=>ms});
 assert.equal(limiter.check('ip').allowed,true);
 assert.equal(limiter.check('ip').allowed,true);
 assert.deepEqual(limiter.check('ip'),{allowed:false,retryAfter:1});
 ms=1001;assert.equal(limiter.check('ip').allowed,true);
 limiter.reset('ip');assert.equal(limiter.check('ip').allowed,true);
});
test('limiter capacity bounded under distinct keys',()=>{
 const limiter=createWindowLimiter({maxKeys:3});
 for(let i=0;i<50;i++)limiter.check('ip'+i);
 assert.equal(limiter.size,3);
});
