import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {SignJWT,jwtVerify} from 'jose';
const scrypt=promisify(scryptCallback);
export function strongPassword(value){return typeof value==='string'&&value.length>=12&&value.length<=256;}
export function validEmail(value){return typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
export async function hashPassword(password){
  const salt=randomBytes(16).toString('hex');
  const hash=await scrypt(password,salt,64);
  return {salt,hash:hash.toString('hex')};
}
export async function verifyPassword(password,salt,expected){
  if(typeof password!=='string'||!salt||!/^[0-9a-f]{128}$/i.test(expected))return false;
  const actual=await scrypt(password,salt,64);
  const saved=Buffer.from(expected,'hex');
  return timingSafeEqual(actual,saved);
}
function key(secret){
  if(typeof secret!=='string'||new TextEncoder().encode(secret).length<32)throw new Error('JWT_SECRET must be at least 32 bytes');
  return new TextEncoder().encode(secret);
}
export async function issueToken(user,secret,issuer,audience){
  return new SignJWT({role:'user'}).setProtectedHeader({alg:'HS256'}).setSubject(String(user.id))
    .setIssuer(issuer).setAudience(audience).setIssuedAt().setExpirationTime('30m').sign(key(secret));
}
export async function validateToken(token,secret,issuer,audience){
  const {payload}=await jwtVerify(token,key(secret),{algorithms:['HS256'],issuer,audience});
  if(!/^[1-9]\d*$/.test(payload.sub??''))throw new Error('Invalid subject');
  return {id:payload.sub};
}
export function cleanCore(input){
  if(!input||typeof input!=='object'||typeof input.name!=='string'||!input.name.trim()||input.name.length>100||typeof input.online!=='boolean')return null;
  return {name:input.name.trim(),online:input.online};
}
