import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '../services/api'

export default function Generate() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('')
  const [platforms, setPlatforms] = useState('instagram,twitter')
  const [tone, setTone] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Client name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await createClient({
        name: name.trim(),
        niche: niche.trim() || undefined,
        platforms: platforms.split(',').map((p) => p.trim()).filter(Boolean),
        tone: tone.trim() || undefined,
      })
      navigate(`/clients/${result.client_id}`)
    } catch (err) {
      setError('Failed to create client')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Generate Content Calendar</h1>
        <p className="text-gray-600 mt-1">Create a new client and generate their content calendar</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
              Niche / Industry
            </label>
            <input
              id="niche"
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., SaaS, Healthcare, E-commerce"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="platforms" className="block text-sm font-medium text-gray-700 mb-1">
              Platforms (comma-separated)
            </label>
            <input
              id="platforms"
              type="text"
              value={platforms}
              onChange={(e) => setPlatforms(e.target.value)}
              placeholder="instagram,twitter,linkedin"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Tone of Voice
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="playful">Playful</option>
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}