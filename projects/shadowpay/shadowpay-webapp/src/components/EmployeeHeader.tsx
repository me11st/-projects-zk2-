'use client'

import { Shield } from "lucide-react"
import { ShadowConnect } from '@/components/WalletConnect'
import Link from "next/link"

export function EmployeeHeader() {
  return (
    <nav className="container mx-auto px-6 py-6">
      <div className="bg-gray-800 rounded-xl px-5 py-3 flex items-center justify-between shadow-lg">
        <Link href="/" className="flex items-center space-x-3">
          <Shield className="h-7 w-7 text-white" />
          <span className="text-xl font-bold text-white">ShadowPay</span>
          <span className="text-sm text-blue-400 font-medium">Employee Portal</span>
        </Link>
        <div className="flex items-center space-x-6">
          <ShadowConnect />
        </div>
      </div>
    </nav>
  )
} 