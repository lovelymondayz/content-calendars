import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Generate from './pages/Generate'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Navigate to="/clients" replace /></Layout>} />
        <Route path="/clients" element={<Layout><Clients /></Layout>} />
        <Route path="/clients/:id" element={<Layout><ClientDetail /></Layout>} />
        <Route path="/generate" element={<Layout><Generate /></Layout>} />
        <Route path="*" element={<Navigate to="/clients" replace />} />
      </Routes>
    </BrowserRouter>
  )
}