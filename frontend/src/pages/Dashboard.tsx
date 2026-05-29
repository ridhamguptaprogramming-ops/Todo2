export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-3xl font-black">Dashboard</h2>
      <p className="mt-2 text-slate-300">Placeholder. Wire real user stats + widgets with Socket.io.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur" />
        ))}
      </div>
    </div>
  )
}

