import { motion } from 'framer-motion'

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      {/* Floating particles placeholder */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute top-40 right-10 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid gap-10 md:grid-cols-2 md:items-center"
        >
          <div>
            <p className="text-sm font-extrabold tracking-widest text-teal-500 uppercase">Event Attendance</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              Run events with <span className="text-indigo-500">instant check-in</span> and premium dashboards.
            </h1>
            <p className="mt-4 text-slate-700 dark:text-slate-300">
              A production-grade system that combines QR attendance, certificates, analytics, and role-based admin tools.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/events"
                className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                Explore events
              </a>
              <a
                href="/login"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-bold text-slate-900 dark:text-slate-50 backdrop-blur transition hover:bg-white/10"
              >
                Login
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { k: '12k+', v: 'Attendees' },
                { k: '99.9%', v: 'Uptime' },
                { k: '24/7', v: 'Support' },
              ].map((x) => (
                <motion.div
                  key={x.v}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-xl font-black text-indigo-400">{x.k}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-200/90">{x.v}</div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 h-44 rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-pink-500/20" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

