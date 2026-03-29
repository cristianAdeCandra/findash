'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } },
        })
        if (error) throw error
        toast.success('Akun berhasil dibuat! Silakan cek email untuk verifikasi.')
        setMode('login')
      }
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-80 h-80 bg-fin-blue/8 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold tracking-tight mb-2">
            Fin<span className="text-accent-2">Track</span>
          </div>
          <p className="text-white/40 text-sm">
            {mode === 'login' ? 'Masuk ke akun kamu' : 'Buat akun baru gratis'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800
                       font-semibold py-3 rounded-xl text-sm mb-6 hover:bg-gray-100 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.7 12.27c0-.79-.07-1.54-.19-2.27H12v4.3h6.57a5.6 5.6 0 0 1-2.44 3.68v3.06h3.95c2.31-2.13 3.62-5.27 3.62-8.77z"/>
              <path fill="#34A853" d="M12 24c3.3 0 6.07-1.09 8.09-2.96l-3.95-3.06A7.18 7.18 0 0 1 12 19.28c-3.36 0-6.21-2.27-7.23-5.32H.69v3.16A12 12 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M4.77 13.96A7.26 7.26 0 0 1 4.39 12c0-.68.12-1.34.38-1.96V6.88H.69A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l3.49-3.42z"/>
              <path fill="#EA4335" d="M12 4.72a6.5 6.5 0 0 1 4.6 1.8l3.44-3.44A11.54 11.54 0 0 0 12 0 12 12 0 0 0 .69 6.88l3.08 2.39C4.77 6.99 8.14 4.72 12 4.72z"/>
            </svg>
            Lanjutkan dengan Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text" className="fin-input" placeholder="Budi Santoso"
                  value={name} onChange={e => setName(e.target.value)} required
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">
                Email
              </label>
              <input
                type="email" className="fin-input" placeholder="kamu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-1.5">
                Password
              </label>
              <input
                type="password" className="fin-input" placeholder="Min. 6 karakter"
                value={password} onChange={e => setPass(e.target.value)}
                required minLength={6}
              />
            </div>

            <button type="submit" className="btn-primary justify-center mt-2" disabled={loading}>
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
              ) : null}
              {mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-5">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-accent-2 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Data kamu dienkripsi dan aman di Supabase
        </p>
      </div>
    </div>
  )
}
