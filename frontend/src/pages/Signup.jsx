import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setError('')
    setMessage('')
    setLoading(true)
    // Ask Supabase to create a new account
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMessage('Account created! Check your email to confirm, then log in.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="w-full max-w-sm bg-slate-800 p-8 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>

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
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-400 text-sm mb-3">{message}</p>}

        <button
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Sign up'}
        </button>

        <p className="text-slate-400 text-sm mt-4">
          Already have an account? <Link to="/login" className="text-blue-400">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup