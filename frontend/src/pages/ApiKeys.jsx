import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateRawKey() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  return 'nsk_' + hex
}

function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [newKeyName, setNewKeyName] = useState('')
  const [rawKey, setRawKey] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function loadKeys() {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, last_used_at, created_at')
      .order('created_at', { ascending: false })
    if (!error) setKeys(data || [])
  }

  useEffect(() => {
    loadKeys()
  }, [])

  async function handleGenerate() {
    if (!newKeyName.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const raw = generateRawKey()
    const keyHash = await sha256Hex(raw)
    const { error } = await supabase.from('api_keys').insert({
      user_id: user.id,
      key_hash: keyHash,
      name: newKeyName.trim(),
    })
    setLoading(false)
    if (error) {
      alert('Error creating key: ' + error.message)
    } else {
      setRawKey(raw)
      setNewKeyName('')
      loadKeys()
    }
  }

  async function handleDelete(id) {
    await supabase.from('api_keys').delete().eq('id', id)
    loadKeys()
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <button
          className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600"
          onClick={() => navigate('/dashboard')}
        >
          Back to dashboard
        </button>
      </div>

      <p className="text-slate-400 mb-6 max-w-2xl">
        Generate a key for your Kali agent. You will see the raw key only once —
        copy it immediately. We store only a hash, so we cannot show it again.
      </p>

      <div className="flex gap-2 mb-8 max-w-md">
        <input
          className="flex-1 px-3 py-2 rounded bg-slate-700 text-white"
          placeholder="Key name (e.g. My Kali laptop)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-3">Your keys</h2>
      {keys.length === 0 ? (
        <p className="text-slate-500">No keys yet.</p>
      ) : (
        <table className="w-full max-w-2xl text-sm">
          <thead className="text-slate-400 text-left">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Created</th>
              <th className="py-2">Last used</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-slate-700">
                <td className="py-2">{k.name}</td>
                <td className="py-2">{new Date(k.created_at).toLocaleDateString()}</td>
                <td className="py-2">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'Never'}</td>
                <td className="py-2 text-right">
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(k.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {rawKey && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-bold mb-2">Copy your API key now</h3>
            <p className="text-slate-400 text-sm mb-4">
              This is the only time you will see it. Store it somewhere safe.
            </p>
            <code className="block bg-slate-900 p-3 rounded text-green-400 break-all mb-4">
              {rawKey}
            </code>
            <button
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
              onClick={() => setRawKey('')}
            >
              I've copied it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeys
