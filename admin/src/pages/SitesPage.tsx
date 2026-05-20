import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import client from '../api/client'

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', radius_meters: '100' })

  const load = () => client.get('/work-sites/').then((r) => setSites(r.data))

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    await client.post('/work-sites/', {
      name: form.name,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      radius_meters: parseFloat(form.radius_meters),
    })
    setShowForm(false)
    setForm({ name: '', latitude: '', longitude: '', radius_meters: '100' })
    load()
  }

  const handleDelete = async (id: string) => {
    await client.delete(`/work-sites/${id}`)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Work Sites</h1>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add Site
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-2 gap-4">
          <input className="border rounded-lg p-3 col-span-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border rounded-lg p-3" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          <input className="border rounded-lg p-3" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          <input className="border rounded-lg p-3" placeholder="Radius (meters)" value={form.radius_meters} onChange={(e) => setForm({ ...form, radius_meters: e.target.value })} />
          <button className="col-span-2 bg-green-600 text-white rounded-lg p-3 hover:bg-green-700" onClick={handleCreate}>Create</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500">Name</th>
              <th className="p-4 text-sm font-medium text-gray-500">Latitude</th>
              <th className="p-4 text-sm font-medium text-gray-500">Longitude</th>
              <th className="p-4 text-sm font-medium text-gray-500">Radius</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sites.map((s: any) => (
              <tr key={s.id}>
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 text-gray-500">{s.latitude}</td>
                <td className="p-4 text-gray-500">{s.longitude}</td>
                <td className="p-4 text-gray-500">{s.radius_meters}m</td>
                <td className="p-4">
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(s.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {sites.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No work sites yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
