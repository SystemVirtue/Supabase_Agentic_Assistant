import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './routes'
import { useAuth } from '../hooks/useAuth'
import { Brain, HelpCircle } from 'lucide-react'
import { UserGuide } from './components/UserGuide'

const NAV_HELP: Record<string,string> = {
  'Ask AURORA': 'Ask questions and inspect each answer’s provenance, claims, evidence, uncertainty and reasoning mode.',
  'Knowledge': 'Add source material to this workspace so AURORA can use it as evidence.',
  'Cognition': 'Inspect persisted claims and the visible cognitive state produced by AURORA.',
  'Runs & History': 'Review previous reasoning runs, models, status, latency and timestamps.',
}

function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    setBusy(true); setError('')
    try { mode === 'signin' ? await signIn(email, password) : await signUp(email, password) }
    catch (e: any) { setError(e.message || 'Authentication failed') }
    finally { setBusy(false) }
  }
  return <div className="min-h-screen bg-[#07090d] text-white flex items-center justify-center p-6"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.035] p-8"><div className="flex items-center gap-3 mb-8"><div className="rounded-lg bg-white/10 p-2"><Brain/></div><div><div className="text-xl font-semibold">AURORA</div><div className="text-[10px] uppercase tracking-[.2em] text-white/35">Dawn for transparent AI</div></div></div><h1 className="text-2xl font-medium mb-2">{mode==='signin'?'Sign in':'Create account'}</h1><p className="text-sm text-white/45 mb-6">Access your persistent cognitive workspace.</p><div className="space-y-3"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg bg-black/30 border border-white/10 p-3"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" onKeyDown={e=>{if(e.key==='Enter')submit()}} className="w-full rounded-lg bg-black/30 border border-white/10 p-3"/><button onClick={submit} disabled={busy||!email||!password} className="w-full rounded-lg bg-white text-black py-3 font-medium disabled:opacity-30">{busy?'Working…':mode==='signin'?'Sign in':'Create account'}</button></div>{error&&<div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</div>}<button onClick={()=>{setMode(mode==='signin'?'signup':'signin');setError('')}} className="mt-5 text-sm text-white/45 hover:text-white">{mode==='signin'?'Need an account? Create one':'Already have an account? Sign in'}</button></div></div>
}

function HelpLayer({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const applyTooltips = () => {
      document.querySelectorAll('nav button').forEach((el) => {
        const button = el as HTMLElement
        const label = button.textContent?.replace(/\s+/g, ' ').trim() || ''
        const description = NAV_HELP[label]
        if (description) { button.setAttribute('title', description); button.setAttribute('aria-label', `${label}. ${description}`) }
      })
    }
    applyTooltips()
    const observer = new MutationObserver(applyTooltips)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
  return <button onClick={onOpen} aria-label="Open AURORA user guide" title="Open AURORA user guide" className="fixed right-5 bottom-5 z-[90] rounded-full border border-white/15 bg-[#111722] p-3 text-white/60 shadow-xl hover:bg-white/10 hover:text-white"><HelpCircle size={19}/></button>
}

export default function App() {
  const { user, loading } = useAuth()
  const [showGuide, setShowGuide] = useState(false)
  useEffect(() => { if (user && !localStorage.getItem('aurora-user-guide-v1')) setShowGuide(true) }, [user])
  const closeGuide = () => { localStorage.setItem('aurora-user-guide-v1', 'seen'); setShowGuide(false) }
  if (loading) return <div className="min-h-screen bg-[#07090d] text-white flex items-center justify-center">Loading AURORA…</div>
  if (!user) return <AuthScreen />
  return <><RouterProvider router={router} /><HelpLayer onOpen={() => setShowGuide(true)} />{showGuide && <UserGuide onClose={closeGuide} />}</>
}
