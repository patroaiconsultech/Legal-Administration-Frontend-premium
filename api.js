const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const ADMIN_CSRF_KEY='estevez_admin_csrf'
const PORTAL_CSRF_KEY='estevez_portal_csrf'

function cookie(name){
  return document.cookie.split('; ').find(x=>x.startsWith(name+'='))?.split('=').slice(1).join('=') || ''
}
function storedCsrf(admin=false){
  const key=admin?ADMIN_CSRF_KEY:PORTAL_CSRF_KEY
  return localStorage.getItem(key) || decodeURIComponent(cookie(admin?'efata_admin_csrf':'efata_csrf') || '')
}
function rememberCsrf(path,data){
  if(!data?.csrf)return
  if(path.includes('/api/admin/auth/verify')) localStorage.setItem(ADMIN_CSRF_KEY,data.csrf)
  if(path.includes('/api/account/login') || path.includes('/api/account/activation/complete') || path.includes('/api/access/consume')){
    localStorage.setItem(PORTAL_CSRF_KEY,data.csrf)
  }
}
function isPublicPost(path){
  return path==='/api/access-requests'
    || path==='/api/access/consume'
    || path==='/api/account/activation/start'
    || path==='/api/account/activation/complete'
    || path==='/api/account/login'
    || path.startsWith('/api/admin/auth/')
}
export async function api(path, opts={}){
  const headers={...(opts.headers||{})}
  const method=(opts.method||'GET').toUpperCase()
  if(opts.body && !headers['Content-Type']) headers['Content-Type']='application/json'
  if(method!=='GET' && !isPublicPost(path)){
    const token=storedCsrf(path.startsWith('/api/admin'))
    if(token) headers['X-CSRF-Token']=token
  }
  const r=await fetch(BASE+path,{...opts,headers,credentials:'include'})
  const ct=r.headers.get('content-type')||''
  const data=ct.includes('application/json')?await r.json():await r.text()
  if(!r.ok) throw new Error(data?.detail||data||`HTTP ${r.status}`)
  rememberCsrf(path,data)
  if(path==='/api/account/logout'){
    localStorage.removeItem(PORTAL_CSRF_KEY)
  }
  return data
}
export const assetUrl = (name)=>`${BASE}/api/content/asset/${name}`
export const receiptUrl = ()=>`${BASE}/api/legal/receipt`
