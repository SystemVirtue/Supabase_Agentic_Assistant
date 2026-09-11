import { useEffect, useMemo, useState } from 'react'
import { Brain, BookOpen, MessageSquare, Network, Activity, LogOut, Plus, Send, Upload, ChevronRight, ShieldCheck, AlertTriangle, Users, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { addDocument, askAurora, bootstrapWorkspace, createSession, getClaims, getDocuments, getMessages, getRuns, getSessions, getWorkspaces, type AuroraMode, type Document, type Message, type Run, type Session, type Workspace } from '../../services/aurora'

const nav = [
  ['chat', 'Ask AURORA', MessageSquare],
  ['knowledge', 'Knowledge', BookOpen],
  ['cognition', 'Cognition', Brain],
  ['history', 'Runs & History', Clock],
] as const

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-xl border border-white/10 bg-white/[0.035] ${className}`}>{children}</section> }
function Badge({ children }: { children: React.ReactNode }) { return <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">{children}</span> }

export default function AuroraMvp() {
  const { user, signOut } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [runs, setRuns] = useState<Run[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [view, setView] = useState('chat')
  const [mode, setMode] = useState<AuroraMode>('balanced')
  const [question, setQuestion] = useState('')
  const [answerMeta, setAnswerMeta] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [workspaceName, setWorkspaceName] = useState('AURORA Workspace')
  const [docName, setDocName] = useState('')
  const [docText, setDocText] = useState('')

  const refresh = async (w: string) => {
    const [ss, dd, rr, cc] = await Promise.all([getSessions(w), getDocuments(w), getRuns(w), getClaims(w)])
    setSessions(ss); setDocuments(dd); setRuns(rr); setClaims(cc)
    if (ss.length && !session) { setSession(ss[0]); setMessages(await getMessages(w, ss[0].id)) }
  }
  useEffect(() => { if (!user) return; getWorkspaces().then(ws => { setWorkspaces(ws); if (ws[0]) setWorkspace(ws[0]) }).catch(e => setError(e.message)) }, [user])
  useEffect(() => { if (workspace) refresh(workspace.id).catch(e => setError(e.message)) }, [workspace])

  const newSession = async () => {
    if (!workspace) return
    try { const s = await createSession(workspace.id); setSessions([s, ...sessions]); setSession(s); setMessages([]); setAnswerMeta(null); setView('chat') } catch (e: any) { setError(e.message) }
  }
  const selectSession = async (s: Session) => { if (!workspace) return; setSession(s); setMessages(await getMessages(workspace.id, s.id)); setView('chat') }
  const send = async () => {
    if (!workspace || !question.trim() || busy) return
    setBusy(true); setError('')
    try {
      const q = question.trim(); const data = await askAurora(workspace.id, session?.id ?? null, q, mode)
      const sid = data.session_id as string
      if (!session || session.id !== sid) { const ss = await getSessions(workspace.id); setSessions(ss); const s = ss.find(x => x.id === sid); if (s) setSession(s) }
      setAnswerMeta(data); setQuestion(''); setView('chat')
      setMessages(await getMessages(workspace.id, sid));
      await refresh(workspace.id)
    } catch (e: any) { setError(e.message) } finally { setBusy(false) }
  }
  const ingest = async () => {
    if (!workspace || !docName.trim() || !docText.trim()) return
    setBusy(true); setError('')
    try { await addDocument(workspace.id, docName.trim(), docText.trim()); setDocName(''); setDocText(''); await refresh(workspace.id) } catch (e: any) { setError(e.message) } finally { setBusy(false) }
  }
  const createWorkspace = async () => {
    setBusy(true); setError('')
    try { const w = await bootstrapWorkspace(workspaceName.trim() || 'AURORA Workspace'); setWorkspaces([...workspaces, w]); setWorkspace(w); setSessions([]); setSession(null) } catch (e: any) { setError(e.message) } finally { setBusy(false) }
  }
  const stats = useMemo(() => ({ documents: documents.length, sessions: sessions.length, runs: runs.length, claims: claims.length }), [documents, sessions, runs, claims])

  if (!user) return null
  if (!workspace) return <div className="min-h-screen bg-[#07090d] text-white flex items-center justify-center p-6"><Card className="max-w-lg w-full p-8"><div className="flex items-center gap-3 mb-2"><div className="rounded-lg bg-white/10 p-2"><Brain /></div><h1 className="text-2xl font-semibold">AURORA</h1></div><p className="text-white/60 mb-6">Create your first workspace to start building a transparent cognitive context.</p><input value={workspaceName} onChange={e=>setWorkspaceName(e.target.value)} className="w-full rounded-lg bg-black/30 border border-white/10 p-3 mb-3"/><button onClick={createWorkspace} disabled={busy} className="w-full rounded-lg bg-white text-black py-3 font-medium disabled:opacity-50">{busy ? 'Creating…' : 'Create workspace'}</button>{error && <p className="mt-4 text-red-300 text-sm">{error}</p>}</Card></div>

  return <div className="min-h-screen bg-[#07090d] text-white flex">
    <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0b0e14] hidden md:flex flex-col">
      <div className="p-5 border-b border-white/10"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-white/10"><Brain size={20}/></div><div><div className="font-semibold tracking-wide">AURORA</div><div className="text-[10px] uppercase tracking-[.2em] text-white/40">Transparent AI</div></div></div></div>
      <div className="p-3"><select value={workspace.id} onChange={e=>{const w=workspaces.find(x=>x.id===e.target.value);if(w){setWorkspace(w);setSession(null)}}} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm"><option value={workspace.id}>{workspace.name}</option>{workspaces.filter(w=>w.id!==workspace.id).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
      <nav className="px-3 space-y-1">{nav.map(([key,label,Icon])=><button key={key} onClick={()=>setView(key)} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${view===key?'bg-white/10 text-white':'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon size={17}/>{label}</button>)}</nav>
      <div className="mt-auto p-3 border-t border-white/10"><button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/50 hover:text-white"><LogOut size={16}/>Sign out</button></div>
    </aside>
    <main className="flex-1 min-w-0 flex flex-col">
      <header className="h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-5"><div><div className="font-medium">{view==='chat'?'Ask AURORA':view==='knowledge'?'Knowledge':view==='cognition'?'Cognitive State':'Runs & History'}</div><div className="text-xs text-white/35">{workspace.name}</div></div><div className="flex gap-2 items-center"><Badge><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"/>backend connected</Badge><Badge>{mode.toUpperCase()}</Badge></div></header>
      {error && <div className="mx-5 mt-4 rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200 flex justify-between"><span>{error}</span><button onClick={()=>setError('')}>×</button></div>}
      <div className="flex-1 overflow-auto p-5 lg:p-7">
        {view==='chat' && <div className="max-w-6xl mx-auto grid lg:grid-cols-[220px_minmax(0,1fr)_300px] gap-5 h-full min-h-[650px]">
          <Card className="p-3 h-fit"><button onClick={newSession} className="w-full flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2 text-sm font-medium mb-3"><Plus size={15}/>New session</button><div className="space-y-1">{sessions.map(s=><button key={s.id} onClick={()=>selectSession(s)} className={`w-full text-left rounded-lg p-2.5 ${session?.id===s.id?'bg-white/10':'hover:bg-white/5'}`}><div className="text-sm truncate">{s.title||'Untitled session'}</div><div className="text-[10px] text-white/35">{new Date(s.updated_at).toLocaleString()}</div></button>)}</div></Card>
          <Card className="flex flex-col overflow-hidden"><div className="flex-1 p-5 overflow-auto space-y-5">{messages.length===0?<div className="h-full flex flex-col items-center justify-center text-center"><Brain size={42} className="text-white/20 mb-4"/><h2 className="text-xl font-medium mb-2">Make cognition visible.</h2><p className="text-sm text-white/45 max-w-md">Ask AURORA a question. Its response is persisted with the reasoning run, claims, evidence, uncertainty and model provenance.</p></div>:messages.map(m=><div key={m.id} className={m.role==='user'?'ml-auto max-w-[85%]':'max-w-[90%]'}><div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{m.role==='user'?'You':'AURORA'}</div><div className={`rounded-xl p-4 whitespace-pre-wrap leading-7 ${m.role==='user'?'bg-white/10':'bg-black/20 border border-white/5'}`}>{m.content}</div>{m.model&&<div className="text-[10px] text-white/25 mt-1">{m.provider} · {m.model}</div>}</div>)}</div><div className="border-t border-white/10 p-4"><div className="flex gap-2 mb-2"><select value={mode} onChange={e=>setMode(e.target.value as AuroraMode)} className="bg-white/5 border border-white/10 rounded-lg px-2 text-xs"><option value="fast">Fast</option><option value="balanced">Balanced</option><option value="deep">Deep</option><option value="quorum">QUORUM</option></select><span className="text-xs text-white/30 self-center">{mode==='quorum'?'Independent model council + synthesis':'Evidence-aware single-model reasoning'}</span></div><div className="flex gap-2"><textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask AURORA…" rows={3} className="flex-1 resize-none rounded-lg bg-black/30 border border-white/10 p-3 outline-none focus:border-white/30"/><button onClick={send} disabled={busy||!question.trim()} className="self-end rounded-lg bg-white text-black p-3 disabled:opacity-30"><Send size={18}/></button></div></div></Card>
          <div className="space-y-4"><Card className="p-4"><div className="text-xs uppercase tracking-wider text-white/35 mb-3">Last reasoning run</div>{answerMeta?<><div className="text-sm mb-3">{answerMeta.mode?.toUpperCase()} · {answerMeta.provenance?.model}</div><div className="grid grid-cols-2 gap-2"><Badge>{answerMeta.provenance?.latency_ms ?? '—'} ms</Badge><Badge>{answerMeta.claims?.length??0} claims</Badge><Badge>{answerMeta.evidence?.length??0} evidence</Badge><Badge>{answerMeta.uncertainty?.length??0} uncertainty</Badge></div>{answerMeta.disagreements?.length>0&&<div className="mt-4 text-xs text-amber-200"><AlertTriangle size={14} className="inline mr-1"/>Disagreement detected</div>}</>:<p className="text-sm text-white/35">Run a question to populate provenance.</p>}</Card><Card className="p-4"><div className="text-xs uppercase tracking-wider text-white/35 mb-3">Workspace state</div><div className="grid grid-cols-2 gap-3">{Object.entries(stats).map(([k,v])=><div key={k}><div className="text-xl font-semibold">{v}</div><div className="text-[10px] text-white/35 uppercase">{k}</div></div>)}</div></Card></div>
        </div>}
        {view==='knowledge' && <div className="max-w-5xl mx-auto space-y-5"><Card className="p-5"><div className="flex items-center gap-2 mb-1"><BookOpen size={18}/><h2 className="font-medium">Knowledge ingestion</h2></div><p className="text-sm text-white/40 mb-5">Add text to AURORA's workspace. Documents become evidence available to reasoning runs.</p><div className="grid md:grid-cols-[240px_1fr] gap-3"><input value={docName} onChange={e=>setDocName(e.target.value)} placeholder="Document name" className="bg-black/30 border border-white/10 rounded-lg p-3 h-fit"/><textarea value={docText} onChange={e=>setDocText(e.target.value)} placeholder="Paste source text here…" rows={6} className="bg-black/30 border border-white/10 rounded-lg p-3"/></div><button onClick={ingest} disabled={busy||!docName.trim()||!docText.trim()} className="mt-3 flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm disabled:opacity-30"><Upload size={15}/>{busy?'Saving…':'Add to knowledge'}</button></Card><div className="grid gap-3">{documents.map(d=><Card key={d.id} className="p-4"><div className="flex justify-between gap-4"><div><div className="font-medium">{d.filename}</div><div className="text-xs text-white/35 mt-1">{d.mime_type||'text/plain'} · {new Date(d.created_at).toLocaleString()}</div></div><Badge>persisted</Badge></div><p className="mt-3 text-sm text-white/50 line-clamp-3 whitespace-pre-wrap">{d.content}</p></Card>)}{!documents.length&&<Card className="p-8 text-center text-white/35">No knowledge yet. Add a document above.</Card>}</div></div>}
        {view==='cognition' && <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-5"><Card className="p-5"><div className="flex items-center gap-2 mb-4"><Network size={18}/><h2 className="font-medium">Claims & beliefs</h2></div>{claims.length?claims.map(c=><div key={c.id} className="border-b border-white/5 py-3 last:border-0"><div className="text-sm">{c.text}</div><div className="flex gap-2 mt-2"><Badge>{c.status}</Badge>{c.confidence!=null&&<Badge>confidence {Math.round(Number(c.confidence)*100)}%</Badge>}</div></div>):<p className="text-sm text-white/35">No claims have been extracted yet. Ask a question after adding knowledge.</p>}</Card><Card className="p-5"><div className="flex items-center gap-2 mb-4"><ShieldCheck size={18}/><h2 className="font-medium">Transparency model</h2></div><div className="space-y-3 text-sm text-white/55"><div className="flex gap-3"><ShieldCheck className="text-emerald-300 shrink-0" size={17}/><span><b className="text-white">Provenance:</b> each reasoning run records provider, model and latency.</span></div><div className="flex gap-3"><Activity className="text-blue-300 shrink-0" size={17}/><span><b className="text-white">Evidence:</b> source excerpts are retained against extracted claims.</span></div><div className="flex gap-3"><Users className="text-purple-300 shrink-0" size={17}/><span><b className="text-white">QUORUM:</b> multiple independent model contributions can be inspected rather than collapsed into an opaque answer.</span></div><div className="flex gap-3"><AlertTriangle className="text-amber-300 shrink-0" size={17}/><span><b className="text-white">Uncertainty:</b> uncertainty and disagreement are first-class outputs.</span></div></div></Card></div>}
        {view==='history' && <div className="max-w-6xl mx-auto space-y-5"><Card className="p-5"><h2 className="font-medium mb-4">Reasoning runs</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-white/35 text-xs uppercase"><tr><th className="pb-3">Question</th><th>Mode</th><th>Status</th><th>Model</th><th>Latency</th><th>When</th></tr></thead><tbody>{runs.map(r=><tr key={r.id} className="border-t border-white/5"><td className="py-3 pr-4 max-w-md truncate">{r.question}</td><td><Badge>{r.mode}</Badge></td><td>{r.status}</td><td className="text-white/50">{r.model||'—'}</td><td className="text-white/50">{r.latency_ms?`${r.latency_ms} ms`:'—'}</td><td className="text-white/40">{new Date(r.started_at).toLocaleString()}</td></tr>)}</tbody></table></div>{!runs.length&&<p className="text-sm text-white/35">No reasoning runs yet.</p>}</Card></div>}
      </div>
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-white/10 bg-[#0b0e14] p-2 grid grid-cols-4">{nav.map(([key,label,Icon])=><button key={key} onClick={()=>setView(key)} className={`flex flex-col items-center gap-1 py-1 text-[10px] ${view===key?'text-white':'text-white/40'}`}><Icon size={17}/>{label.split(' ')[0]}</button>)}</div>
    </main>
  </div>
}
