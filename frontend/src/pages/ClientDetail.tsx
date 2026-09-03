import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCalendar, CalendarEntry } from '../services/api'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    if (id) loadCalendar()
  }, [id, month])

  async function loadCalendar() {
    if (!id) return
    try {
      setLoading(true)
      const data = await getCalendar(id, month)
      setEntries(data.calendar)
    } catch (err) {
      setError('Failed to load calendar')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">View and manage scheduled content</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <Link
              to="/clients"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Back to Clients
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading calendar...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No entries for this month. Generate content to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(entry.date)}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                        {entry.platform}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        {entry.post_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.caption}</p>
                    <p className="text-xs text-gray-500 mt-1">{entry.hashtags}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    entry.status === 'scheduled'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}