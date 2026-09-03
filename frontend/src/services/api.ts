import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Client {
  id: string
  name: string
  niche: string
  platforms: string
  tone: string
  created_at: string
}

export interface CalendarEntry {
  id: string
  client_id: string
  date: string
  post_type: string
  platform: string
  caption: string
  hashtags: string
  status: string
  created_at: string
}

export async function getClients(): Promise<{ clients: Client[] }> {
  const res = await api.get('/clients')
  return res.data
}

export async function createClient(data: {
  name: string
  niche?: string
  platforms?: string[]
  tone?: string
}): Promise<{ client_id: string }> {
  const res = await api.post('/clients', data)
  return res.data
}

export async function generateCalendar(
  clientId: string,
  data: { month?: string; posts_per_week?: number }
): Promise<{ generated: number; client: string; month: string }> {
  const res = await api.post(`/clients/${clientId}/generate`, data)
  return res.data
}

export async function getCalendar(
  clientId: string,
  month: string
): Promise<{ calendar: CalendarEntry[]; total: number }> {
  const res = await api.get(`/clients/${clientId}/calendar/${month}`)
  return res.data
}

export default api