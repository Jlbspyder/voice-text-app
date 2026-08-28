import { useEffect, useState, type SubmitEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthControls() {
  const [session, setSession] = useState<Session | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  function openAuth(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage(null)
    setIsOpen(true)
  }

  async function submitAuth(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (!supabase) {
      setMessage('Authentication is not configured yet. You can continue using the app as a guest.')
      return
    }

    setIsSubmitting(true)
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setIsSubmitting(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }
    if (mode === 'sign-up' && !result.data.session) {
      setMessage('Check your email to confirm your account, then sign in.')
      return
    }

    setEmail('')
    setPassword('')
    setIsOpen(false)
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <>
      {session ? (
        <div className="flex items-center gap-3">
          <span className="hidden max-w-44 truncate text-xs text-[#657168] sm:block">{session.user.email}</span>
          <button type="button" onClick={() => void signOut()} className="rounded-md border border-[#d4d1c6] bg-[#15251b] px-4 py-1 cursor-pointer text-xs font-bold text-white transition hover:bg-green-800">Sign out</button>
        </div>
      ) : (
        <button type="button" onClick={() => openAuth('sign-in')} className="rounded-md border border-[#d4d1c6] bg-[#15251b] px-4 py-1 cursor-pointer text-xs font-bold text-white transition hover:bg-green-800">Sign in</button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#15251b]/45 px-5 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="auth-heading" className="w-full max-w-md rounded-4xl border border-white/80 bg-[#f7f5ee] p-7 text-left shadow-2xl sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#617468]">Optional account</p><h2 id="auth-heading" className="mt-2 font-display text-2xl font-bold text-[#18271e]">{mode === 'sign-in' ? 'Welcome back' : 'Create an account'}</h2></div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close authentication" className="grid h-9 w-9 place-items-center rounded-full text-xl text-[#657168] transition cursor-pointer hover:bg-green-800 hover:text-white">X</button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#657168]">Signing in is optional. You can close this window and continue as a guest.</p>
            <form onSubmit={submitAuth} className="mt-6 space-y-4">
              <div><label htmlFor="auth-email" className="mb-2 block text-sm font-bold text-[#34473b]">Email</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-[#d4d1c6] bg-white px-4 py-3 outline-none focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40" /></div>
              <div><label htmlFor="auth-password" className="mb-2 block text-sm font-bold text-[#34473b]">Password</label><input id="auth-password" type="password" minLength={6} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-[#d4d1c6] bg-white px-4 py-3 outline-none focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40" /></div>
              {message && <p role="status" className="rounded-2xl bg-[#fff2ed] px-4 py-3 text-sm leading-6 text-[#8b3e31]">{message}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#24583c] px-6 py-3 font-bold text-white transition hover:bg-[#1b4931] disabled:cursor-wait cursor-pointer disabled:opacity-60">{isSubmitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
            </form>
            <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(null) }} className="mt-5 w-full text-center text-sm font-bold text-[#24583c] cursor-pointer underline decoration-[#91b89e] underline-offset-4">{mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
          </section>
        </div>
      )}
    </>
  )
}
