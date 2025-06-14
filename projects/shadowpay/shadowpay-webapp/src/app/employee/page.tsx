'use client'

import { Shield } from "lucide-react"
import Link from "next/link"

export default function EmployeePage() {
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
          </div>
        </nav>

        {/* Main Content */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Employee</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Portal</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              Access your private salary with ShadowPay's secure wallet system
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to ShadowPay</h2>
                <p className="text-gray-400 mb-6">
                  Set up your secure wallet to receive and manage your private salary payments
                </p>
                <div className="text-sm text-blue-400">
                  Wallet setup stuff
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 