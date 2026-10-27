/** Bounded in-memory rate limiter for LOCAL DEVELOPMENT ONLY.
 * Production deployments need a shared datastore and trusted proxy configuration. */
export function createWindowLimiter({limit=10,windowMs=60_000,maxKeys=5000,now=Date.now}={}){
  if(!Number.isInteger(limit)||limit<1||windowMs<=0||maxKeys<1)throw new TypeError('Invalid limiter settings');
  const attempts = new Map();
  return {
    check(key){
      const stamp=now();
      let entry=attempts.get(key);
      if(!entry||stamp>=entry.reset){entry={count:0,reset:stamp+windowMs};}
      if(entry.count>=limit)return {allowed:false,retryAfter:Math.max(1,Math.ceil((entry.reset-stamp)/1000))};
      entry.count++;
      attempts.delete(key); // maintain least-recently-updated order
      attempts.set(key,entry);
      if(attempts.size>maxKeys)attempts.delete(attempts.keys().next().value);
      return {allowed:true,retryAfter:0};
    },
    reset(key){attempts.delete(key);},
    get size(){return attempts.size;}
  };
}
