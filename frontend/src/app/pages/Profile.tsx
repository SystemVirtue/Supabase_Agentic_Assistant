import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, CheckCircle2, KeyRound, LogOut, RefreshCw, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { deleteCredential, getAvailableModels, getCredentials, getProfile, registerCredential, saveProfile, type UserCredential } from '../../services/profile'

const inputClass = 'w-full rounded-lg bg-black/30 border border-white/10 p-3 text-sm outline-none focus:border-white/30'

export default function Profile() {
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [defaultModel, setDefaultModel] = useState('')
  const [models, setModels] = useState<{id:string;name:string;context:number;free:boolean}[]>([])
  const [credentials, setCredentials] = useState<UserCredential[]>([])
  const [provider, setProvider] = useState('OpenRouter')
  const [label, setLabel] = useState('OpenRouter')
  const [busy, setBusy] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setBusy(true); setError('')
    try {
      const [profile, creds] = await Promise.all([getProfile(), getCredentials()])
      setDisplayName(profile.display_name || '')
      setTimezone(profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
      setDefaultModel(profile.default_model || '')
      setCredentials(creds)
    } catch (e: any) { setError(e?.message || 'Could not load profile.') }
    finally { setBusy(false) }
  }

  const loadModels = async () => {
    setLoadingModels(true); setError('')
    try { setModels(await getAvailableModels()) }
    catch (e: any) { setError(`Could not load available models: ${e?.message || 'unknown error'}`) }
    finally { setLoadingModels(false) }
  }

  useEffect(() => { load(); loadModels() }, [])

  const save = async () => {
    setBusy(true); setError(''); setMessage('')
    try { await saveProfile({ display_name: displayName.trim() || null, timezone: timezone.trim() || null, default_model: defaultModel || null, preferences: {} }); setMessage('Profile saved.') }
    catch (e: any) { setError(e?.message || 'Could not save profile.') }
    finally { setBusy(false) }
  }

  const addProvider = async () => {
    setBusy(true); setError(''); setMessage('')
    try { const credential = await registerCredential(provider, label.trim() || provider, { source: 'profile', status: 'connected-via-app' }); setCredentials([credential, ...credentials]); setMessage(`${provider} connection registered.`) }
    catch (e: any) { setError(e?.message || 'Could not register provider.') }
    finally { setBusy(false) }
  }

  const removeProvider = async (id: string) => {
    setBusy(true); setError('')
    try { await deleteCredential(id); setCredentials(credentials.filter(c => c.id !== id)); setMessage('Provider connection removed.') }
    catch (e: any) { setError(e?.message || 'Could not remove provider.') }
    finally { setBusy(false) }
  }

  if (!user) return null
  return <div className="min-h-screen bg-[#07090d] text-white p-5 md:p-10">
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white mb-8"><ArrowLeft size={16}/>Back to AURORA</Link>
      <div className="flex items-center justify-between gap-4 mb-7"><div><div className="flex items-center gap-3"><UserRound size={22}/><h1 className="text-2xl font-semibold">Profile</h1></div><p className="text-sm text-white/45 mt-2">Identity, model preferences and provider connections used by AURORA.</p></div><button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:text-white"><LogOut size={15}/>Sign out</button></div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
          <h2 className="font-medium">Account</h2>
          <div className="mt-4 space-y-4">
            <div><label className="text-xs text-white/40">Email</label><div className="mt-2 rounded-lg bg-black/20 border border-white/5 p-3 text-sm text-white/70">{user.email}</div></div>
            <div><label className="text-xs text-white/40">Display name</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name" className={`${inputClass} mt-2`}/></div>
            <div><label className="text-xs text-white/40">Timezone</label><input value={timezone} onChange={e=>setTimezone(e.target.value)} placeholder="Pacific/Auckland" className={`${inputClass} mt-2`}/></div>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-medium">AURORA model</h2><p className="text-xs text-white/40 mt-1">Only currently advertised free OpenRouter models are listed.</p></div><button onClick={loadModels} disabled={loadingModels} title="Refresh model catalogue" className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"><RefreshCw size={16} className={loadingModels?'animate-spin':''}/></button></div>
          <select value={defaultModel} onChange={e=>setDefaultModel(e.target.value)} className={`${inputClass} mt-4`}><option value="">CONNECT PROVIDER(S) BELOW</option>{models.map(m=><option key={m.id} value={m.id}>{m.name} · {m.id}</option>)}</select>
          <div className="mt-3 text-xs text-white/35">If no provider is connected, AURORA can fall back to its configured keyless/free pathway where available.</div>
        </section>

        <section className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-start gap-3"><ShieldCheck size={19} className="text-emerald-300 mt-0.5"/><div><h2 className="font-medium">Provider connections</h2><p className="text-xs text-white/40 mt-1">These records identify providers available to this account. Secret values are deliberately never rendered back into the browser profile UI.</p></div></div>
          <div className="mt-5 grid md:grid-cols-[150px_1fr_auto] gap-3"><select value={provider} onChange={e=>setProvider(e.target.value)} className={inputClass}><option>OpenRouter</option><option>Puter</option><option>Anthropic</option><option>OpenAI</option><option>Google</option></select><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Connection label" className={inputClass}/><button onClick={addProvider} disabled={busy} className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-40">Connect</button></div>
          <div className="mt-4 space-y-2">{credentials.length===0?<div className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-white/35">No provider connection records yet.</div>:credentials.map(c=><div key={c.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/20 border border-white/5 p-3"><div className="flex items-center gap-3"><KeyRound size={16} className="text-white/40"/><div><div className="text-sm">{c.label}</div><div className="text-xs text-white/35">{c.provider} · {c.secret_id ? 'secure secret linked' : 'app-managed / keyless'}</div></div></div><div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-300"/><button onClick={()=>removeProvider(c.id)} aria-label={`Remove ${c.label}`} className="rounded-lg p-2 text-white/35 hover:bg-white/10 hover:text-red-200"><Trash2 size={15}/></button></div></div>)}</div>
          <p className="mt-4 text-[11px] text-amber-200/70">API-key entry is intentionally not persisted into ordinary profile metadata. AURORA must use a server-side secret/vault path before user-supplied keys are stored. The current test account continues to use the configured application key.</p>
        </section>
      </div>

      {(message || error) && <div className={`mt-5 rounded-lg border p-3 text-sm ${error?'border-red-400/20 bg-red-400/5 text-red-200':'border-emerald-400/20 bg-emerald-400/5 text-emerald-200'}`}>{error || message}</div>}
      <button onClick={save} disabled={busy} className="mt-5 rounded-lg bg-white text-black px-5 py-2.5 font-medium disabled:opacity-40">{busy?'Saving…':'Save profile'}</button>
    </div>
  </div>
}
