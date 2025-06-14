'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield } from "lucide-react"
import { ConnectWallet } from '@/components/ConnectWallet'
import Link from "next/link"

export default function EmployeePage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push('/sign-in')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return (
      <div className="dark min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking wallet connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-black">
      <div className="relative">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="bg-gray-800 rounded-xl px-5 py-3 flex items-center justify-between shadow-lg">
            <Link href="/" className="flex items-center space-x-3">
              <Shield className="h-7 w-7 text-white" />
              <span className="text-xl font-bold text-white">ShadowPay</span>
              <span className="text-sm text-blue-400 font-medium">Employee Portal</span>
            </Link>
            <div className="flex items-center space-x-6">
              <ConnectWallet />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Employee</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              View your salary payments and transaction history
            </p>
          </div>
        </section>
      </div>
    </div>
  )
} 