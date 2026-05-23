import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    // Try a simple call to Supabase Auth to confirm the client works
    supabase.auth.getSession().then(({ error }) => {
      if (error) {
        setStatus('Error: ' + error.message)
      } else {
        setStatus('Connected to Supabase!')
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">NetSniff Cloud</h1>
        <p className="text-slate-400">{status}</p>
      </div>
    </div>
  )
}

export default App