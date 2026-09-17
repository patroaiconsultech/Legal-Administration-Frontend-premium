
import React,{useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {
  ShieldCheck,LockKeyhole,FileCheck2,ArrowRight,Send,RefreshCw,BrainCircuit,
  CheckCircle2,BellRing,UserCheck,UserX,Clock3,Building2,Mail,BriefcaseBusiness
} from 'lucide-react'
import {api,assetUrl,receiptUrl} from './api'
import './styles.css'

const path=window.location.pathname
const approvalToken=path.startsWith('/a/')?decodeURIComponent(path.slice(3)):null

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))
}

function Brand(){
  return <div className="brand"><img src="/assets/patroai-logo.png"/><div><b>EFATÁ</b><span>Secure Briefing</span></div></div>
}
function Shell({children,wide=false}){
  return <><header><Brand/><div className="conf">CONFIDENCIAL • ACESSO CONTROLADO</div></header><main className={wide?'wide':''}>{children}</main><footer>PatroAI Consultech Ltda. • Efatá • Ambiente privado</footer></>
}
function ErrorBox({text}){return text?<div className="error">{text}</div>:null}

function RequestAccess(){
  const [form,setForm]=useState({full_name:'',email:'',organization:'Estevez Guarda Administração Judicial Ltda.',role:'',purpose:'Acompanhar e avaliar o Projeto Estevez Guarda.'})
  const [state,setState]=useState('form'),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
  async function submit(e){
    e.preventDefault();setErr('');setBusy(true)
    try{
      await api('/api/access-requests',{method:'POST',body:JSON.stringify(form)})
      setState('pending')
    }catch(e){setErr(e.message)}finally{setBusy(false)}
  }
  return <Shell><section className="gate">
    <div className="gate-icon"><ShieldCheck/></div>
    <div className="eyebrow">EFATÁ • BRIEFING CONFIDENCIAL</div>
    <h1>Projeto Estevez Guarda</h1>
    <p className="lead">Este ambiente apresenta o status do projeto, a arquitetura prevista e a visão premium dos agentes da Efatá. O acesso é liberado individualmente pelo Super Admin.</p>
    <div className="trust"><span><UserCheck/>Aprovação humana</span><span><LockKeyhole/>Acesso individual</span><span><FileCheck2/>Confidencialidade registrada</span></div>
    <ErrorBox text={err}/>
    {state==='form'?<form className="form" onSubmit={submit}>
      <label>Nome completo<input required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label>
      <label>E-mail profissional<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Organização<input required value={form.organization} onChange={e=>setForm({...form,organization:e.target.value})}/></label>
      <label>Cargo / função<input required value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/></label>
      <label>Finalidade do acesso<textarea required value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})}/></label>
      <button disabled={busy}>{busy?'Enviando…':'SOLICITAR ACESSO'}<ArrowRight/></button>
    </form>:<div className="pending-card"><Clock3/><div><h2>Solicitação recebida.</h2><p>Seu acesso está aguardando análise do Super Admin. Se aprovado, você receberá um link individual de uso único por e-mail.</p></div></div>}
  </section></Shell>
}

function ApprovedAccess(){
  const [phase,setPhase]=useState('loading'),[err,setErr]=useState('')
  useEffect(()=>{(async()=>{
    try{
      await api('/api/access/consume',{method:'POST',body:JSON.stringify({token:approvalToken})})
      history.replaceState({},'', '/briefing')
      setPhase('ready')
    }catch(e){setErr(e.message);setPhase('error')}
  })()},[])
  if(phase==='loading')return <Shell><div className="center"><RefreshCw className="spin"/><p>Validando autorização do Super Admin…</p></div></Shell>
  if(phase==='error')return <Shell><section className="gate"><h1>Acesso indisponível</h1><ErrorBox text={err}/><p className="lead">Solicite um novo acesso se o link tiver expirado ou já tiver sido utilizado.</p></section></Shell>
  return <BriefingGate/>
}

function LegalTerm({term,onAccepted}){
  const [accepted,setAccepted]=useState(false),[representation,setRepresentation]=useState('PERSONAL')
  const [busy,setBusy]=useState(false),[err,setErr]=useState('')
  async function accept(){
    if(!accepted)return setErr('Você precisa marcar o aceite expresso.')
    setBusy(true);setErr('')
    try{
      await api('/api/legal/accept',{method:'POST',body:JSON.stringify({
        accepted:true,
        timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
        representation_mode:representation
      })})
      onAccepted()
    }catch(e){setErr(e.message)}finally{setBusy(false)}
  }
  return <Shell><section className="gate term">
    <div className="eyebrow">ANTES DE CONTINUAR</div><h1>Confidencialidade</h1>
    <div className="term-head"><div><h2>{term.name}</h2></div><div className="term-meta">v{term.version}<br/><code>{term.sha256.slice(0,18)}…</code></div></div>
    <pre>{term.content}</pre>
    <details><summary>Aviso de Privacidade</summary><pre>{term.privacy_notice}</pre></details>
    <ErrorBox text={err}/>
    <label className="check"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>Declaro que li, compreendi e aceito integralmente o Termo de Confidencialidade e Condições de Acesso, versão {term.version}, e concordo em ficar pessoalmente vinculado às obrigações nele estabelecidas.</span></label>
    <div className="representation"><b>Você também está aceitando em nome da organização?</b>
      <label><input type="radio" name="rep" checked={representation==='PERSONAL'} onChange={()=>setRepresentation('PERSONAL')}/>Não. Apenas em meu próprio nome.</label>
      <label><input type="radio" name="rep" checked={representation==='PERSONAL_AND_ORGANIZATION'} onChange={()=>setRepresentation('PERSONAL_AND_ORGANIZATION')}/>Sim. Declaro possuir poderes suficientes para vincular a organização.</label>
    </div>
    <button onClick={accept} disabled={busy||!accepted}>{busy?'Registrando aceite…':'LI E ACEITO — ACESSAR APRESENTAÇÃO'}<ShieldCheck/></button>
  </section></Shell>
}

function BriefingGate(){
  const [mode,setMode]=useState('loading'),[data,setData]=useState(null),[err,setErr]=useState('')
  async function resolve(){
    setMode('loading');setErr('')
    try{
      const p=await api('/api/content/presentation');setData(p);setMode('presentation');return
    }catch{}
    try{
      const t=await api('/api/legal/term');setData(t);setMode('term')
    }catch(e){setErr(e.message);setMode('error')}
  }
  useEffect(()=>{resolve()},[])
  if(mode==='loading')return <Shell><div className="center"><RefreshCw className="spin"/><p>Verificando sua autorização…</p></div></Shell>
  if(mode==='error')return <Shell><section className="gate"><h1>Sessão não autorizada</h1><ErrorBox text={err}/><p>Entre pelo link individual aprovado pelo Super Admin.</p></section></Shell>
  if(mode==='term')return <LegalTerm term={data} onAccepted={resolve}/>
  return <Presentation initial={data}/>
}

function Watermark({viewer}){
  if(!viewer)return null
  const txt=`CONFIDENCIAL • ${viewer.name} • ${viewer.organization} • ${viewer.access_id?.slice(0,8)}`
  return <div className="watermark" aria-hidden="true">{Array.from({length:18}).map((_,i)=><span key={i}>{txt}</span>)}</div>
}

function AgentCatalog({section}){
  return <section className="section intelligence-center">
    <div className="eyebrow">{section.eyebrow}</div><h2>{section.title}</h2><p className="intro">{section.body}</p>
    <div className="catalog-meta"><span>{section.registered_agent_count} identidades registradas</span><span>{section.catalog_status}</span></div>
    <div className="agent-catalog-grid">{section.agents.map(a=><article className="agent-card" key={a.agent_id}>
      <div className="agent-card__top"><div className="agent-avatar"><BrainCircuit/></div><small>{a.department}</small></div>
      <h3>{a.display_name}</h3><p>{a.role_label}</p>
      <div className="specialties">{a.specialties.map(x=><span key={x}>{x.replaceAll('_',' ')}</span>)}</div>
      <footer><span>IDENTIDADE ORGANIZACIONAL</span><b>{a.runtime_readiness}</b></footer>
    </article>)}</div>
    <div className="principles">{section.principles.map(x=><span key={x}><CheckCircle2/>{x}</span>)}</div>
  </section>
}

function HyperAgent({enabled}){
  const [q,setQ]=useState('')
  const [messages,setMessages]=useState([{role:'assistant',content:'Olá. Sou o Hyper Agente do Projeto Esteves. Posso explicar o status, os agentes premium da Efatá, a arquitetura, o escopo READ-ONLY, as dependências do TRF4 e os próximos marcos — somente com base no material autorizado.'}])
  const [thread,setThread]=useState(null),[busy,setBusy]=useState(false),[err,setErr]=useState('')
  async function send(e){
    e.preventDefault();if(!q.trim()||busy)return
    const question=q.trim();setQ('');setMessages(m=>[...m,{role:'user',content:question}]);setBusy(true);setErr('')
    try{
      const r=await api('/api/agent/chat',{method:'POST',body:JSON.stringify({question,thread_id:thread})})
      setThread(r.thread_id);setMessages(m=>[...m,{role:'assistant',content:r.answer,sources:r.sources}])
    }catch(e){setErr(e.message)}finally{setBusy(false)}
  }
  return <section className="agent-panel">
    <div className="agent-title"><div className="orb"><BrainCircuit/></div><div><div className="eyebrow">EFATÁ • HYPER AGENTE</div><h2>Converse com o projeto</h2></div><span className={enabled?'live':'locked'}>{enabled?'ATIVO':'CONTROLADO'}</span></div>
    <p className="agent-note">O agente não fixa preço, prazo ou posição do TRF4. Não acessa processos reais nem transforma identidade de catálogo em readiness não comprovada.</p>
    {!enabled?<div className="disabled-agent"><LockKeyhole/><div><b>Experiência preparada e governada.</b><p>A ativação depende da configuração do provider de IA no ambiente.</p></div></div>:<>
      <div className="chat">{messages.map((m,i)=><div className={'msg '+m.role} key={i}><div>{m.content}</div>{m.sources&&<small>Fontes: {m.sources.map(x=>'['+x+']').join(' ')}</small>}</div>)}{busy&&<div className="msg assistant typing">Analisando apenas o contexto autorizado…</div>}</div>
      <ErrorBox text={err}/>
      <div className="quick-prompts">{['O que já está construído?','Como funcionam os agentes premium?','O que falta do TRF4?','Como os dados são protegidos?'].map(x=><button type="button" key={x} onClick={()=>setQ(x)}>{x}</button>)}</div>
      <form className="chatbox" onSubmit={send}><textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="Pergunte sobre o projeto…"/><button disabled={busy}><Send/></button></form>
    </>}
  </section>
}

function Presentation({initial}){
  const [data,setData]=useState(initial||null),[err,setErr]=useState('')
  useEffect(()=>{if(!initial)api('/api/content/presentation').then(setData).catch(e=>setErr(e.message))},[])
  if(err)return <Shell><ErrorBox text={err}/></Shell>
  if(!data)return <Shell><div className="center"><RefreshCw className="spin"/><p>Carregando conteúdo autorizado…</p></div></Shell>
  return <Shell wide><Watermark viewer={data.viewer}/>
    <section className="hero" style={{backgroundImage:`linear-gradient(90deg,rgba(5,14,25,.95),rgba(5,14,25,.28)),url(${assetUrl(data.hero_asset)})`}}>
      <div className="hero-copy"><div className="eyebrow">{data.classification} • {data.updated_at}</div><h1>{data.title}</h1><p>{data.subtitle}</p><div className="hero-actions"><a href="#status">Ver atualização</a><a className="ghost" href={receiptUrl()} target="_blank">Comprovante de aceite</a></div></div>
    </section>
    <div className="content">
      {data.sections.map((s,i)=>{
        if(s.type==='status')return <section id="status" className="section" key={i}><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><p className="intro">{s.body}</p><div className="status-grid">{s.cards.map((c,j)=><div className="status-card" key={j}><span className={'dot '+c.tone}></span><small>{c.label}</small><b>{c.value}</b><p>{c.text}</p></div>)}</div></section>
        if(s.type==='split')return <section className="section split" key={i}><div><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><p>{s.body}</p><blockquote>{s.quote}</blockquote></div><img src={assetUrl(s.asset)}/></section>
        if(s.type==='listgrid')return <section className="section" key={i}><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><p className="intro">{s.body}</p><div className="list-grid">{s.groups.map((g,j)=><div className="info-card" key={j}><h3>{g.title}</h3><ul>{g.items.map(x=><li key={x}>{x}</li>)}</ul></div>)}</div></section>
        if(s.type==='architecture')return <section className="section" key={i}><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><p className="intro">{s.body}</p><div className="arch"><img src={assetUrl(s.asset)}/><div className="arch-rules">{s.rules.map(x=><span key={x}><CheckCircle2/>{x}</span>)}</div></div></section>
        if(s.type==='steps')return <section className="section" key={i}><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><div className="steps">{s.steps.map(x=><div className="step" key={x.n}><strong>{x.n}</strong><h3>{x.title}</h3><p>{x.text}</p></div>)}</div></section>
        if(s.type==='agent_catalog')return <AgentCatalog section={s} key={i}/>
        if(s.type==='agent')return <section className="section teaser" key={i}><div><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><p>{s.body}</p></div><div className="rule-pills">{s.rules.map(x=><span key={x}>{x}</span>)}</div></section>
        if(s.type==='closing')return <section className="section closing" key={i}><div className="eyebrow">{s.eyebrow}</div><h2>{s.title}</h2><p>{s.body}</p></section>
      })}
      <HyperAgent enabled={!!data.viewer.agent_enabled}/>
    </div>
  </Shell>
}

function urlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4)
  const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/')
  const raw=atob(base64)
  return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))
}

function Admin(){
  const [phase,setPhase]=useState('login'),[email,setEmail]=useState('daniel@patroai.com'),[password,setPassword]=useState(''),[code,setCode]=useState('')
  const [data,setData]=useState(null),[err,setErr]=useState(''),[pushState,setPushState]=useState('')
  async function start(e){e.preventDefault();setErr('');try{await api('/api/admin/auth/start',{method:'POST',body:JSON.stringify({email,password})});setPhase('otp')}catch(e){setErr(e.message)}}
  async function verify(e){e.preventDefault();setErr('');try{await api('/api/admin/auth/verify',{method:'POST',body:JSON.stringify({email,code})});setPhase('dash');refresh()}catch(e){setErr(e.message)}}
  async function refresh(){try{setData(await api('/api/admin/overview'))}catch(e){setErr(e.message)}}
  async function decide(id,kind){
    const reason=prompt(kind==='approve'?'Motivo da aprovação:':'Motivo da rejeição:')
    if(!reason)return
    try{await api(`/api/admin/access-requests/${id}/${kind}`,{method:'POST',body:JSON.stringify({reason})});await refresh()}
    catch(e){setErr(e.message)}
  }
  async function enablePush(){
    setPushState('Preparando…')
    try{
      if(!('serviceWorker'in navigator)||!('PushManager'in window))throw new Error('Push não suportado neste navegador.')
      const info=await api('/api/admin/push/public-key')
      if(!info.enabled||!info.public_key)throw new Error('Web Push ainda não está configurado no backend.')
      const permission=await Notification.requestPermission()
      if(permission!=='granted')throw new Error('Permissão de notificações não concedida.')
      const reg=await navigator.serviceWorker.ready
      let sub=await reg.pushManager.getSubscription()
      if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(info.public_key)})
      const raw=sub.toJSON()
      await api('/api/admin/push/subscribe',{method:'POST',body:JSON.stringify({endpoint:raw.endpoint,p256dh:raw.keys.p256dh,auth:raw.keys.auth})})
      setPushState('Push ativado neste dispositivo.')
    }catch(e){setPushState(e.message)}
  }
  if(phase!=='dash')return <Shell><section className="gate admin-login"><div className="eyebrow">EFATÁ CONTROL</div><h1>Super Admin</h1><p>Conta administrativa protegida por senha + segundo fator via e-mail.</p><ErrorBox text={err}/>{phase==='login'?<form className="form" onSubmit={start}><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button>CONTINUAR</button></form>:<form className="form compact" onSubmit={verify}><label>Código administrativo<input className="otp" value={code} maxLength="6" onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label><button>VALIDAR</button></form>}</section></Shell>
  const requests=data?.access_requests||[]
  const pending=requests.filter(x=>x.state==='PENDING_ADMIN_APPROVAL')
  return <Shell wide><div className="admin">
    <div className="admin-top"><div><div className="eyebrow">EFATÁ CONTROL</div><h1>Solicitações de acesso</h1><p className="intro">A decisão humana é a porta de entrada. O push apenas avisa; o banco mantém a fila oficial.</p></div><div className="admin-actions"><button className="secondary" onClick={refresh}>Atualizar</button><button onClick={enablePush}><BellRing/>Ativar push</button></div></div>
    {pushState&&<div className="push-state">{pushState}</div>}<ErrorBox text={err}/>
    <div className="metrics"><div><b>{pending.length}</b><span>Pendentes</span></div><div><b>{data?.acceptances?.length||0}</b><span>Aceites jurídicos</span></div><div><b>{data?.events?.length||0}</b><span>Eventos recentes</span></div></div>
    <section className="request-list"><h2>Fila de aprovação</h2>{requests.length===0?<p>Nenhuma solicitação.</p>:requests.map(r=><article className={'request-card '+r.state.toLowerCase()} key={r.id}>
      <div className="request-head"><div><b>{r.full_name}</b><span>{r.email}</span></div><small>{r.state}</small></div>
      <div className="request-meta"><span><Building2/>{r.organization}</span><span><BriefcaseBusiness/>{r.role}</span><span><Clock3/>{new Date(r.requested_at).toLocaleString()}</span></div>
      <p>{r.purpose}</p>
      {r.state==='PENDING_ADMIN_APPROVAL'?<div className="decision-actions"><button onClick={()=>decide(r.id,'approve')}><UserCheck/>Aprovar acesso</button><button className="danger-button" onClick={()=>decide(r.id,'reject')}><UserX/>Rejeitar</button></div>:<small>Revisado por {r.reviewed_by||'—'} • {r.reviewed_at?new Date(r.reviewed_at).toLocaleString():'—'}</small>}
    </article>)}</section>
    <section className="events"><h2>Trilha de auditoria</h2>{(data?.events||[]).slice(0,100).map((x,i)=><div className="event" key={i}><code>{x.event_type}</code><span>{new Date(x.created_at).toLocaleString()}</span></div>)}</section>
  </div></Shell>
}

function App(){
  if(path==='/admin')return <Admin/>
  if(approvalToken)return <ApprovedAccess/>
  if(path==='/briefing')return <BriefingGate/>
  return <RequestAccess/>
}
createRoot(document.getElementById('root')).render(<App/>)
