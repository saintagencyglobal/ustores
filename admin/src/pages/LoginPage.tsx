import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { setToken, setUser } from '../store/auth'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    await client.post('/auth/send-otp', { phone })
    setStep('otp')
  }

  const handleVerifyOtp = async () => {
    const { data } = await client.post('/auth/verify-otp', { phone, code })
    setToken(data.access_token)
    setUser({ id: data.user_id, name: data.name, role: data.role, phone: data.phone })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Ustores Admin</h1>
        <p className="text-gray-500 text-center mb-6">
          {step === 'phone' ? 'Enter your phone' : 'Enter verification code'}
        </p>
        {step === 'phone' ? (
          <>
            <input className="w-full border rounded-lg p-3 mb-4" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="w-full bg-indigo-600 text-white rounded-lg p-3 font-medium hover:bg-indigo-700" onClick={handleSendOtp}>Send Code</button>
          </>
        ) : (
          <>
            <input className="w-full border rounded-lg p-3 mb-4" placeholder="000000" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="w-full bg-indigo-600 text-white rounded-lg p-3 font-medium hover:bg-indigo-700" onClick={handleVerifyOtp}>Verify</button>
            <button className="w-full text-gray-500 text-sm mt-4 hover:underline" onClick={() => setStep('phone')}>Back</button>
          </>
        )}
      </div>
    </div>
  )
}
