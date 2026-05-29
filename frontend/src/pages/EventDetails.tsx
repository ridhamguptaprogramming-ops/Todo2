import { useParams } from 'react-router-dom'

export default function EventDetails() {
  const { id } = useParams()
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-3xl font-black">Event Details</h2>
      <p className="mt-2 text-slate-300">Event ID: {id}</p>
    </div>
  )
}

