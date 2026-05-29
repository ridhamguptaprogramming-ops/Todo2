import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { toggleTheme } from './store/themeSlice'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Registrations from './pages/Registrations'
import QrAttendance from './pages/QrAttendance'
import Certificates from './pages/Certificates'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.theme.value)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Optional: theme toggle shortcut (T)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') dispatch(toggleTheme())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  const pageKey = useMemo(() => location.pathname, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light via-transparent to-bg-light dark:from-bg-dark dark:to-bg-dark">
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/qr" element={<QrAttendance />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

