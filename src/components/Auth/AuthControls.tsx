import { useEffect, useState, type SubmitEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthControls() {
  const [session, setSession] = useState<Session | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
    if (mode === 'sign-up' && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstname: firstName.trim(),
              lastname: lastName.trim(),
            },
          },
        })
    setIsSubmitting(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }
    if (mode === 'sign-up' && !result.data.session) {
      setMessage('Check your email to confirm your account, then sign in.')
      return
    }

    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setIsOpen(false)
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const displayName = typeof session?.user.user_metadata.firstname === 'string'
    ? session.user.user_metadata.firstname
    : session?.user.email

  return (
    <>
      {session ? (
        <div className="flex items-center gap-3">
          <span className="hidden max-w-44 truncate text-md font-bold text-[#15251b] sm:block">{displayName}</span>
          <button type="button" onClick={() => void signOut()} className="rounded-md border border-[#d4d1c6] bg-[#15251b] px-4 py-1 cursor-pointer text-xs font-bold text-white transition hover:bg-green-800">Sign out</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="hidden rounded-md border border-[#d4d1c6] bg-white/45 px-3 py-2 text-xs font-semibold text-[#657168] sm:inline">VOICE ASSISTANT</span>
          <button type="button" onClick={() => openAuth('sign-in')} className="rounded-md border border-[#d4d1c6] bg-[#15251b] px-4 py-1 cursor-pointer text-xs font-bold text-white transition hover:bg-green-800">Sign in</button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#15251b]/45 p-3 backdrop-blur-sm sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="auth-heading" className="w-full max-w-md rounded-3xl border border-white/80 bg-[#f7f5ee] p-5 text-left shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#617468]">Optional account</p><h2 id="auth-heading" className="mt-2 font-display text-2xl font-bold text-[#18271e]">{mode === 'sign-in' ? 'Welcome back' : 'Create an account'}</h2></div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close authentication" className="grid h-9 w-9 place-items-center rounded-full text-xl text-[#657168] transition cursor-pointer hover:bg-green-800 hover:text-white">X</button>
            </div>
            <p className="mt-2 text-sm leading-5 text-[#657168]">Signing in is optional. You can close this window and continue as a guest.</p>
            <form onSubmit={submitAuth} className="mt-4 space-y-3">
              {mode === 'sign-up' && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><label htmlFor="auth-firstname" className="mb-1 block text-sm font-bold text-[#34473b]">First name</label><input id="auth-firstname" type="text" autoComplete="given-name" required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full rounded-md border border-[#d4d1c6] bg-white px-4 py-2.5 outline-none focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40" /></div>
                <div><label htmlFor="auth-lastname" className="mb-1 block text-sm font-bold text-[#34473b]">Last name</label><input id="auth-lastname" type="text" autoComplete="family-name" required value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full rounded-md border border-[#d4d1c6] bg-white px-4 py-2.5 outline-none focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40" /></div>
              </div>}
              <div><label htmlFor="auth-email" className="mb-1 block text-sm font-bold text-[#34473b]">Email</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-[#d4d1c6] bg-white px-4 py-2.5 outline-none focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40" /></div>
              <div><label htmlFor="auth-password" className="mb-1 block text-sm font-bold text-[#34473b]">Password</label><input id="auth-password" type="password" minLength={6} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-[#d4d1c6] bg-white px-4 py-2.5 outline-none focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40" /></div>
              {mode === 'sign-up' && <div><label htmlFor="auth-confirm-password" className="mb-1 block text-sm font-bold text-[#34473b]">Confirm password</label><input id="auth-confirm-password" type="password" minLength={6} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-md border border-[#d4d1c6] bg-white px-4 py-2.5 outline-none focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40" /></div>}
              {message && <p role="status" className="rounded-2xl bg-[#fff2ed] px-4 py-3 text-sm leading-6 text-[#8b3e31]">{message}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-[#24583c] px-6 py-2.5 font-bold text-white transition hover:bg-[#1b4931] disabled:cursor-wait cursor-pointer disabled:opacity-60">{isSubmitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
            </form>
            <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(null) }} className="mt-3 w-full text-center text-sm font-bold text-[#24583c] cursor-pointer underline decoration-[#91b89e] underline-offset-4">{mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
          </section>
        </div>
      )}
    </>
  )
}
