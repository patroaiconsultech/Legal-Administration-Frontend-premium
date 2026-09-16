const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
function cookie(name){
  return document.cookie.split('; ').find(x=>x.startsWith(name+'='))?.split('=').slice(1).join('=') || ''
}
export async function api(path, opts={}){
  const headers={...(opts.headers||{})}
  if(opts.body && !headers['Content-Type']) headers['Content-Type']='application/json'
  if((opts.method||'GET')!=='GET' && !path.includes('/api/access-requests') && !path.includes('/api/access/consume') && !path.includes('/admin/auth/')){
    headers['X-CSRF-Token']=decodeURIComponent(cookie(path.startsWith('/api/admin')?'efata_admin_csrf':'efata_csrf'))
  }
  const r=await fetch(BASE+path,{...opts,headers,credentials:'include'})
  const ct=r.headers.get('content-type')||''
  const data=ct.includes('application/json')?await r.json():await r.text()
  if(!r.ok) throw new Error(data?.detail||data||`HTTP ${r.status}`)
  return data
}
export const assetUrl = (name)=>`${BASE}/api/content/asset/${name}`
export const receiptUrl = ()=>`${BASE}/api/legal/receipt`
