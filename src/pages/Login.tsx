import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Building2, Lock, Mail, Loader2 } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            navigate('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        const { error } = await
            supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            })
        if (error) console.log(error)
    }

    return (
        <div className="min-h-screen bg-[#07090F] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
                        <Building2 className="text-white" size={24} />
                    </div>
                    <CardTitle className="text-3xl font-black text-white tracking-tight">Renoto</CardTitle>
                    <p className="text-slate-400 text-sm italic">Manage your properties like a pro.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="landlord@example.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Sign In to Dashboard</span>}
                        </button>
                    </form>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-800"></div>
                        <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold">OR</span>
                        <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border border-[#e0e0e0] transition-all flex items-center justify-center space-x-3"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.87 2.69-6.62z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.95v2.33C2.43 15.93 5.46 18 9 18z" />
                            <path fill="#FBBC05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.95a8.99 8.99 0 0 0 0 8.08l3.01-2.33z" />
                            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15.02 2.3C13.46.86 11.42 0 9 0 5.46 0 2.43 2.07.95 5.22l3.01 2.33c.71-2.13 2.7-3.71 5.04-3.71z" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <p className="text-center text-[10px] text-slate-600">
                        Don't have an account? <button className="text-orange-500 font-bold hover:underline">Contact Support</button>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
