/**
 * Disposable PostgreSQL + HTTP integration acceptance test.
 * Safety: only accepts a local database whose name contains "test";
 * creates its own random schema and removes that schema on completion.
 * No developer account or production data is touched.
 */
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
import {makeApp} from '../src/app.js';

const connectionString=process.env.CODEBREAK_TEST_DATABASE_URL;
if (!connectionString) {
  console.error('Set CODEBREAK_TEST_DATABASE_URL to a local disposable PostgreSQL database (e.g. codebreak_test).');
  process.exit(2);
}
let databaseURL;
try { databaseURL=new URL(connectionString); }
catch { console.error('Invalid CODEBREAK_TEST_DATABASE_URL.'); process.exit(2); }
const database=decodeURIComponent(databaseURL.pathname.replace(/^\//,''));
if (!['127.0.0.1','localhost','::1','[::1]'].includes(databaseURL.hostname) || !/(^|_)test($|_)/i.test(database)) {
  console.error('Safety refusal: integration tests require localhost and a database named *test* (e.g. codebreak_test).');
  process.exit(2);
}
if (!['postgresql:','postgres:'].includes(databaseURL.protocol)) {
  console.error('CODEBREAK_TEST_DATABASE_URL must use PostgreSQL.');
  process.exit(2);
}
const schema=`cb_verify_${randomBytes(8).toString('hex')}`;
const admin=new pg.Pool({connectionString,max:2,connectionTimeoutMillis:5000});
let isolated=null, server=null, schemaCreated=false;
const origin='http://127.0.0.1:4500';
const testName=`acceptance-${randomBytes(6).toString('hex')}`;
let checks=0;

function check(label, condition, actual){
  assert.ok(condition,`${label}: ${JSON.stringify(actual)}`);
  checks++;
  console.log(`  PASS ${label}`);
}

async function call(base,path,{method='GET',token,body,headers={}}={}){
  const options={method,headers:{...headers},signal:AbortSignal.timeout(6000)};
  if (token) options.headers.Authorization=`Bearer ${token}`;
  if (body !== undefined) {
    options.headers['Content-Type']='application/json';
    options.body=typeof body==='string'?body:JSON.stringify(body);
  }
  const response=await fetch(`${base}${path}`,options);
  const raw=await response.text();
  let json;
  try {json=raw?JSON.parse(raw):null;} catch {json={unparsed:raw.slice(0,200)};}
  return {status:response.status,json,headers:response.headers};
}

async function execute(){
  await admin.query(`CREATE SCHEMA "${schema}"`);
  schemaCreated=true;
  isolated=new pg.Pool({connectionString,options:`-c search_path=${schema}`,max:4,connectionTimeoutMillis:5000});
  const migrationPath=fileURLToPath(new URL('../sql/001_initial.sql',import.meta.url));
  await isolated.query(await readFile(migrationPath,'utf8'));
  const secret=randomBytes(48).toString('hex');
  const app=makeApp({db:isolated,secret,allowedOrigin:origin});
  server=await new Promise((resolve,reject)=>{
    const instance=app.listen(0,'127.0.0.1',()=>resolve(instance));
    instance.once('error',reject);
  });
  const base=`http://127.0.0.1:${server.address().port}`;
  const aEmail=`a-${testName}@example.invalid`;
  const bEmail=`b-${testName}@example.invalid`;
  const password='a long unique local test password';
  const health=await call(base,'/api/health');
  check('health endpoint',health.status===200&&health.json.status==='ok',health);
  check('restrict framing',health.headers.get('x-frame-options')==='DENY',Object.fromEntries(health.headers));
  const readiness=await call(base,'/api/ready');
  check('database readiness',readiness.status===200&&readiness.json.status==='ready',readiness);
  const noToken=await call(base,'/api/me');
  check('protected endpoint rejects unauthenticated client',noToken.status===401,noToken);
  const invalidRegister=await call(base,'/api/register',{method:'POST',body:{email:aEmail,password:'short',displayName:'A'}});
  check('registration validates password',invalidRegister.status===400,invalidRegister);
  const createdA=await call(base,'/api/register',{method:'POST',body:{email:aEmail,password,displayName:'Subject 404'}});
  check('register user A',createdA.status===201&&createdA.json.user.email===aEmail,createdA);
  const duplicate=await call(base,'/api/register',{method:'POST',body:{email:aEmail,password,displayName:'Repeat'}});
  check('duplicate account rejected',duplicate.status===409,duplicate);
  const createdB=await call(base,'/api/register',{method:'POST',body:{email:bEmail,password,displayName:'NULL'}});
  check('register user B',createdB.status===201,createdB);
  const invalidLogin=await call(base,'/api/login',{method:'POST',body:{email:aEmail,password:'incorrect-password'}});
  check('wrong password rejected',invalidLogin.status===401,invalidLogin);
  const loggedA=await call(base,'/api/login',{method:'POST',body:{email:aEmail,password}});
  check('user A receives JWT',loggedA.status===200&&typeof loggedA.json.accessToken==='string',loggedA.status);
  const loggedB=await call(base,'/api/login',{method:'POST',body:{email:bEmail,password}});
  check('user B receives JWT',loggedB.status===200&&typeof loggedB.json.accessToken==='string',loggedB.status);
  const tokenA=loggedA.json.accessToken,tokenB=loggedB.json.accessToken;
  const tamper=await call(base,'/api/me',{token:tokenA+'xyz'});
  check('tampered JWT rejected',tamper.status===401,tamper);
  const me=await call(base,'/api/me',{token:tokenA});
  check('authenticated identity',me.status===200&&me.json.user.email===aEmail,me);
  const invalidCreate=await call(base,'/api/cores',{method:'POST',token:tokenA,body:{name:'Logic',online:'yes',owner_id:999}});
  check('invalid core data rejected',invalidCreate.status===400,invalidCreate);
  const createdCore=await call(base,'/api/cores',{method:'POST',token:tokenA,body:{name:'Logic',online:false,owner_id:999}});
  check('A creates scoped core, ignores owner override',createdCore.status===201&&createdCore.json.core.name==='Logic',createdCore);
  const id=createdCore.json.core.id;
  const listB=await call(base,'/api/cores',{token:tokenB});
  check('B cannot list A cores',listB.status===200&&listB.json.cores.length===0,listB);
  const modifyB=await call(base,`/api/cores/${id}`,{method:'PATCH',token:tokenB,body:{name:'Stolen',online:true}});
  check('B cannot modify A core',modifyB.status===404,modifyB);
  const deleteB=await call(base,`/api/cores/${id}`,{method:'DELETE',token:tokenB});
  check('B cannot delete A core',deleteB.status===404,deleteB);
  const modifyA=await call(base,`/api/cores/${id}`,{method:'PATCH',token:tokenA,body:{name:'Restored',online:true}});
  check('A updates own core',modifyA.status===200&&modifyA.json.core.online===true,modifyA);
  const listA=await call(base,'/api/cores',{token:tokenA});
  check('A lists own updated core',listA.status===200&&listA.json.cores.length===1&&listA.json.cores[0].name==='Restored',listA);
  const disallowedOrigin=await call(base,'/api/cores',{token:tokenA,headers:{Origin:'https://attacker.example'}});
  check('cross-origin request blocked',disallowedOrigin.status===403,disallowedOrigin);
  const malformed=await call(base,'/api/register',{method:'POST',body:'{"oops":',headers:{Origin:origin}});
  check('malformed JSON rejected',malformed.status===400,malformed);
  const large=await call(base,'/api/login',{method:'POST',body:JSON.stringify({payload:'x'.repeat(17000)})});
  check('oversize JSON rejected',large.status===413,large);
  const removed=await call(base,`/api/cores/${id}`,{method:'DELETE',token:tokenA});
  check('A deletes own core',removed.status===204,removed);
  const listAfter=await call(base,'/api/cores',{token:tokenA});
  check('delete persisted',listAfter.status===200&&listAfter.json.cores.length===0,listAfter);
  console.log(`\nSUCCESS: ${checks} HTTP/database assertions passed using isolated schema ${schema}.`);
}

let failure=null;
try{await execute();}
catch(error){failure=error;console.error(`\nFAILED after ${checks} successful checks:`,error?.stack??error);}
finally{
  if(server)await new Promise(resolve=>server.close(resolve));
  if(isolated)await isolated.end();
  if(schemaCreated){try{await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);}catch(error){failure??=error;console.error('WARNING: test schema cleanup failed:',error.message);}}
  await admin.end();
}
if(failure)process.exitCode=1;
