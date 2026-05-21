import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import client from '../api/client'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    const params = filter ? { report_type: filter } : {}
    client.get('/report/photos', { params }).then((r) => setReports(r.data))
  }, [filter])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Photo Reports</h1>
        <select className="border rounded-lg p-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="cleaning">Cleaning</option>
          <option value="collection">Collection</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r: any) => (
          <div key={r.id} className="bg-white rounded-xl shadow overflow-hidden">
            <img src={`https://ustores-production.up.railway.app${r.photo_url}`} alt="" className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs ${r.report_type === 'cleaning' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                  {r.report_type}
                </span>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className={`flex items-center gap-1 ${r.verified_time ? 'text-green-600' : 'text-red-600'}`}>
                  {r.verified_time ? <CheckCircle size={14} /> : <XCircle size={14} />} Time
                </span>
                <span className={`flex items-center gap-1 ${r.verified_location ? 'text-green-600' : 'text-red-600'}`}>
                  {r.verified_location ? <CheckCircle size={14} /> : <XCircle size={14} />} Location
                </span>
              </div>
              {r.comment && <p className="text-sm text-gray-500 mt-2">{r.comment}</p>}
              {r.verification_error && <p className="text-xs text-red-500 mt-1">{r.verification_error}</p>}
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-20">No reports yet</div>
        )}
      </div>
    </div>
  )
}
