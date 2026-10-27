let token=null; // Intentional: not stored in localStorage/sessionStorage.
const $=id=>document.getElementById(id);
const show=message=>$('message').textContent=message;
async function api(path,options={}){
  const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...(token?{'Authorization':`Bearer ${token}`}:{})}});
  const data=response.status===204?{}:await response.json();
  if(!response.ok)throw new Error(data.error||`HTTP ${response.status}`);
  return data;
}
async function showCores(){
  const data=await api('/api/cores');const list=$('core-list');list.replaceChildren();
  for(const core of data.cores){
    const row=document.createElement('li');const label=document.createElement('span');
    label.textContent=`${core.name} · ${core.online?'ONLINE':'OFFLINE'}`;
    const remove=document.createElement('button');remove.textContent='Delete';
    remove.addEventListener('click',async()=>{try{await api(`/api/cores/${encodeURIComponent(core.id)}`,{method:'DELETE'});await showCores();}catch(e){show(e.message);}});
    row.append(label,remove);list.append(row);
  }
}
$('register').addEventListener('submit',async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.target));try{await api('/api/register',{method:'POST',body:JSON.stringify(values)});show('Account created. Log in below.');}catch(e){show(e.message);}});
$('login').addEventListener('submit',async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.target));try{const result=await api('/api/login',{method:'POST',body:JSON.stringify(values)});token=result.accessToken;$('account').hidden=true;$('dashboard').hidden=false;show(`Welcome, ${result.user.displayName}`);await showCores();}catch(e){show(e.message);}});
$('create').addEventListener('submit',async event=>{event.preventDefault();const fd=new FormData(event.target);try{await api('/api/cores',{method:'POST',body:JSON.stringify({name:fd.get('name'),online:fd.has('online')})});event.target.reset();await showCores();show('Core created.');}catch(e){show(e.message);}});
$('logout').addEventListener('click',()=>{token=null;$('account').hidden=false;$('dashboard').hidden=true;$('core-list').replaceChildren();show('Logged out on this browser.');});
