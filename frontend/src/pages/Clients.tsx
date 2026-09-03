import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getClients, Client } from '../services/api'

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      setLoading(true)
      const data = await getClients()
      setClients(data.clients)
    } catch (err) {
      setError('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your content calendar clients</p>
          </div>
          <Link
            to="/generate"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            New Client
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading clients...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No clients yet. Create your first client to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {clients.map((client) => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">
                      {client.niche} • {client.platforms}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}