import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    setError('')
    setLoading(true)
    // Ask Supabase to verify the email + password
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')   // success — send them to the dashboard
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="w-full max-w-sm bg-slate-800 p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Log in to NetSniff Cloud</h1>

        <input
          className="w-full mb-3 px-3 py-2 rounded bg-slate-700 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 px-3 py-2 rounded bg-slate-700 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-slate-400 text-sm mt-4">
          No account? <Link to="/signup" className="text-blue-400">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login