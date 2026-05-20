import { useEffect, useState } from 'react'
import { Users, MapPin, Camera, CheckCircle } from 'lucide-react'
import client from '../api/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({ workers: 0, sites: 0, reports: 0, todayCheckins: 0 })

  useEffect(() => {
    Promise.all([
      client.get('/work-sites/'),
      client.get('/report/photos'),
    ]).then(([sites, reports]) => {
      setStats((s) => ({ ...s, sites: sites.data.length, reports: reports.data.length }))
    })
  }, [])

  const cards = [
    { label: 'Workers', value: stats.workers, icon: Users, color: 'bg-blue-500' },
    { label: 'Work Sites', value: stats.sites, icon: MapPin, color: 'bg-green-500' },
    { label: 'Reports Today', value: stats.reports, icon: Camera, color: 'bg-purple-500' },
    { label: 'Checked In Today', value: stats.todayCheckins, icon: CheckCircle, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-6">
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
              <Icon size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-gray-500 text-sm">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
