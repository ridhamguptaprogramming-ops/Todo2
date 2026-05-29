import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

type EventCategory =
  | 'conference'
  | 'workshop'
  | 'webinar'
  | 'festival'
  | 'meetup'
  | 'other'

type EventVenue =
  | { name?: string; city?: string }
  | string
  | null

type EventItem = {
  _id?: string
  id?: string
  title?: string
  description?: string
  category?: EventCategory | string
  status?: string
  date?: string
  venue?: EventVenue
  capacity?: number
  registered?: number
  image?: string
}

const categories: Array<{ value: EventCategory | ''; label: string }> = [
  { value: '', label: 'All categories' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'festival', label: 'Festival' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'other', label: 'Other' },
]

const getEventId = (e: EventItem) => String(e._id || e.id || '')

export default function Events() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<EventCategory | ''>('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiBase = useMemo(() => {
    const stored = localStorage.getItem('apiBase')
    return stored || `${window.location.origin.replace(/:\d+$/, '')}:5000/api`
  }, [])

  const token = useMemo(() => localStorage.getItem('token') || '', [])

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (search.trim()) params.set('search', search.trim())
        if (category) params.set('category', category)

        const res = await fetch(`${apiBase}/events?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch events')

        if (!ignore) {
          setEvents(Array.isArray(data.events) ? data.events : [])
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Something went wrong')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    // reset to page 1 when filters change
    setPage(1)
    load()

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category])

  const filtered = useMemo(() => {
    // Backend already supports search/category; keep a local fallback for robustness.
    const q = search.trim().toLowerCase()
    return events.filter((e) => {
      const matchesCategory = category ? String(e.category || '') === category : true
      if (!q) return matchesCategory
      const hay = `${e.title || ''} ${e.description || ''}`.toLowerCase()
      return matchesCategory && hay.includes(q)
    })
  }, [events, search, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const formatDate = (d?: string) => {
    if (!d) return 'Date pending'
    try {
      return new Date(d).toLocaleDateString()
    } catch {
      return 'Date pending'
    }
  }

  const formatVenue = (v?: EventVenue) => {
    if (!v) return 'Venue pending'
    if (typeof v === 'string') return v
    return v.name || v.city || 'Venue pending'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black">Events</h2>
          <p className="mt-2 text-slate-300">Search, filter, preview, and register. Premium list/grid UI.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`rounded-xl border px-4 py-2 font-bold transition ${
              view === 'grid'
                ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-200'
                : 'border-white/10 bg-white/5 text-slate-200/90 hover:bg-white/10'
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-xl border px-4 py-2 font-bold transition ${
              view === 'list'
                ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-200'
                : 'border-white/10 bg-white/5 text-slate-200/90 hover:bg-white/10'
            }`}
          >
            List
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-300">Page size</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-bold"
            >
              {[6, 8, 12].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events"
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 font-bold outline-none focus:border-indigo-500/50"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 font-bold outline-none focus:border-indigo-500/50 md:w-56"
            >
              {categories.map((c) => (
                <option key={c.value || 'all'} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-300">
            <span>{filtered.length} results</span>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className={view === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className={`h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5 ${
                  view === 'list' ? 'h-28' : ''
                }`}
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-xl font-black">No events found</div>
            <p className="mt-2 text-slate-300">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
            {pageItems.map((e) => {
              const id = getEventId(e)
              const seats = `${e.registered ?? 0}/${e.capacity ?? 0} registered`
              const categoryLabel = e.category ? String(e.category) : 'event'

              return (
                <motion.article
                  key={id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={
                    view === 'grid'
                      ? 'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur'
                      : 'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur'
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-indigo-200">
                          {categoryLabel}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-slate-200/90">
                          {e.status || 'draft'}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-black leading-snug">{e.title || 'Untitled event'}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-300">{e.description || 'No description yet.'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-200/90">{formatDate(e.date)}</div>
                      <div className="mt-2 text-xs font-extrabold text-slate-400">{formatVenue(e.venue)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs font-extrabold text-slate-200/80">{seats}</div>
                    <Link
                      to={id ? `/events/${id}` : '/events'}
                      className="rounded-xl bg-indigo-600/20 px-3 py-2 text-sm font-black text-indigo-100 transition hover:bg-indigo-600/30"
                    >
                      View
                    </Link>
                  </div>

                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
                    <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-pink-500/15 blur-2xl" />
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-sm font-extrabold text-slate-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`rounded-xl border px-4 py-2 font-bold transition ${
                currentPage === 1
                  ? 'cursor-not-allowed border-white/10 bg-white/5 text-slate-500'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
              const n = idx + 1
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`rounded-xl border px-4 py-2 font-bold transition ${
                    n === currentPage
                      ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-200'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`rounded-xl border px-4 py-2 font-bold transition ${
                currentPage === totalPages
                  ? 'cursor-not-allowed border-white/10 bg-white/5 text-slate-500'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}



