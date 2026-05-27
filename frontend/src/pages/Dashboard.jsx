import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">NetSniff Cloud Dashboard</h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/api-keys')}
          >
            API Keys
          </button>
          <button
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
      <p className="text-slate-400">You're logged in. Packet feed coming soon.</p>
    </div>
  )
}

export default Dashboard
