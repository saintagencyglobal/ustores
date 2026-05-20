import { useEffect, useState } from 'react'
import client from '../api/client'

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])

  useEffect(() => {
    client.get('/work-sites/').then((r) => setSites(r.data))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Workers</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500">Name</th>
              <th className="p-4 text-sm font-medium text-gray-500">Phone</th>
              <th className="p-4 text-sm font-medium text-gray-500">Role</th>
              <th className="p-4 text-sm font-medium text-gray-500">Work Site</th>
              <th className="p-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {workers.map((w: any) => (
              <tr key={w.id}>
                <td className="p-4 font-medium">{w.name}</td>
                <td className="p-4 text-gray-500">{w.phone}</td>
                <td className="p-4"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">{w.role}</span></td>
                <td className="p-4 text-gray-500">{w.work_site_id || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${w.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {w.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {workers.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No workers found. Register in the mobile app first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
