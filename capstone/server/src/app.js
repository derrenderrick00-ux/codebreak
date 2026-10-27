import express from 'express';
import {issueToken,validateToken,hashPassword,verifyPassword,strongPassword,validEmail,cleanCore} from './security.js';
const jsonBodyLimit='16kb';
const invalid=(res,message)=>res.status(400).json({error:message});
export function makeApp({db,secret,issuer='codebreak-capstone',audience='codebreak-dashboard',allowedOrigin='http://127.0.0.1:4500'}){
  if(!db?.query)throw new TypeError('Database adapter required');
  if(!secret||new TextEncoder().encode(secret).length<32)throw new Error('JWT_SECRET must be at least 32 bytes');
  const app=express();
  app.disable('x-powered-by');
  app.use((req,res,next)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if(req.headers.origin){
      if(req.headers.origin!==allowedOrigin)return res.status(403).json({error:'Origin not allowed'});
      res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
      res.setHeader('Vary','Origin');
    }
    if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');return res.sendStatus(204);}
    next();
  });
  app.use(express.json({limit:jsonBodyLimit}));
  // Best-effort in-process limiter is development-only; use distributed limits in production.
  const loginAttempts=new Map();
  app.post('/api/register',async(req,res,next)=>{
    try{
      const {email,password,displayName}=req.body??{};
      if(!validEmail(email)||!strongPassword(password)||typeof displayName!=='string'||!displayName.trim()||displayName.length>80)return invalid(res,'Valid email, 12+ character password, and display name required');
      const {salt,hash}=await hashPassword(password);
      const result=await db.query('INSERT INTO accounts(email,display_name,password_salt,password_hash) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id,email,display_name',[email.trim().toLowerCase(),displayName.trim(),salt,hash]);
      if(!result.rows.length)return res.status(409).json({error:'Account already exists'});
      return res.status(201).json({user:{id:String(result.rows[0].id),email:result.rows[0].email,displayName:result.rows[0].display_name}});
    }catch(error){next(error);}
  });
  app.post('/api/login',async(req,res,next)=>{
    const ip=req.ip;const now=Date.now();const entry=loginAttempts.get(ip)??{n:0,reset:now+60000};
    if(now>entry.reset){entry.n=0;entry.reset=now+60000;}
    if(entry.n>=10)return res.status(429).json({error:'Try again later'});
    entry.n++;loginAttempts.set(ip,entry);
    try{
      const {email,password}=req.body??{};
      if(!validEmail(email)||typeof password!=='string')return res.status(401).json({error:'Invalid credentials'});
      const result=await db.query('SELECT id,email,display_name,password_salt,password_hash FROM accounts WHERE email=$1',[email.trim().toLowerCase()]);
      const user=result.rows[0];
      if(!user||!(await verifyPassword(password,user.password_salt,user.password_hash)))return res.status(401).json({error:'Invalid credentials'});
      entry.n=0;
      const token=await issueToken(user,secret,issuer,audience);
      return res.json({accessToken:token,user:{id:String(user.id),email:user.email,displayName:user.display_name}});
    }catch(error){next(error);}
  });
  const authenticate=async(req,res,next)=>{
    const match=/^Bearer (\S+)$/.exec(req.headers.authorization??'');
    if(!match)return res.status(401).json({error:'Missing token'});
    try{req.user=await validateToken(match[1],secret,issuer,audience);next();}
    catch{return res.status(401).json({error:'Invalid or expired token'});}
  };
  app.get('/api/health',(_req,res)=>res.json({status:'ok'}));
  app.get('/api/me',authenticate,async(req,res,next)=>{
    try{
      const found=await db.query('SELECT id,email,display_name FROM accounts WHERE id=$1',[req.user.id]);
      if(!found.rows.length)return res.status(401).json({error:'User no longer exists'});
      res.json({user:{id:String(found.rows[0].id),email:found.rows[0].email,displayName:found.rows[0].display_name}});
    }catch(e){next(e);}
  });
  app.get('/api/cores',authenticate,async(req,res,next)=>{
    try{const r=await db.query('SELECT id,name,online,created_at FROM cores WHERE owner_id=$1 ORDER BY id',[req.user.id]);res.json({cores:r.rows});}catch(e){next(e);}
  });
  app.post('/api/cores',authenticate,async(req,res,next)=>{
    const core=cleanCore(req.body);if(!core)return invalid(res,'Name and Boolean online are required');
    try{const r=await db.query('INSERT INTO cores(owner_id,name,online) VALUES($1,$2,$3) RETURNING id,name,online',[req.user.id,core.name,core.online]);res.status(201).json({core:r.rows[0]});}catch(e){next(e);}
  });
  app.patch('/api/cores/:id',authenticate,async(req,res,next)=>{
    const core=cleanCore(req.body);if(!core||!/^[1-9]\d*$/.test(req.params.id))return invalid(res,'Invalid core');
    try{
      const r=await db.query('UPDATE cores SET name=$1,online=$2 WHERE id=$3 AND owner_id=$4 RETURNING id,name,online',[core.name,core.online,req.params.id,req.user.id]);
      if(!r.rows.length)return res.status(404).json({error:'Core not found'});
      res.json({core:r.rows[0]});
    }catch(e){next(e);}
  });
  app.delete('/api/cores/:id',authenticate,async(req,res,next)=>{
    if(!/^[1-9]\d*$/.test(req.params.id))return invalid(res,'Invalid id');
    try{
      const r=await db.query('DELETE FROM cores WHERE id=$1 AND owner_id=$2 RETURNING id',[req.params.id,req.user.id]);
      if(!r.rows.length)return res.status(404).json({error:'Core not found'});
      res.sendStatus(204);
    }catch(e){next(e);}
  });
  app.use((error,req,res,next)=>{
    console.error('API error',error?.code??'unknown');
    if(error?.type==='entity.too.large')return res.status(413).json({error:'Body too large'});
    if(error instanceof SyntaxError && 'body' in error)return invalid(res,'Invalid JSON');
    res.status(500).json({error:'Internal server error'});
  });
  return app;
}
