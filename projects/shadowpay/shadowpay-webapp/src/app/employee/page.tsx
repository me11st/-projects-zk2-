'use client'

import { useState } from 'react'
import { Shield, Key, Upload, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShadowConnect } from '@/components/WalletConnect'
import Link from "next/link"

type OnboardingStep = 'welcome' | 'dashboard'

export default function EmployeePage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')

  const handleGenerateWallet = () => {
    // TODO: Implement wallet generation
    setCurrentStep('dashboard')
  }

  const handleImportWallet = () => {
    // TODO: Implement wallet import
    setCurrentStep('dashboard')
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
              <ShadowConnect />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <section className="container mx-auto px-6 py-12">
          {currentStep === 'welcome' && (
            <div>
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  <span className="text-white">Employee</span>{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dashboard</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Set up your secure wallet to receive private salary payments
                </p>
              </div>
              
              {/* Simple Two-Option Layout */}
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* Generate New Wallet */}
                <Card 
                  className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-indigo-500/10 hover:from-blue-500/20 hover:via-cyan-500/10 hover:to-indigo-500/20 border border-blue-400/20 hover:border-blue-400/40 p-8 text-center shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 group cursor-pointer"
                  onClick={handleGenerateWallet}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Key className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Generate New Wallet</h3>
                  <p className="text-gray-400 mb-6">
                    Create a brand new secure wallet with just a password
                  </p>
                  <div className="text-sm text-blue-400 font-medium">
                    Click to Get Started →
                  </div>
                </Card>

                {/* Import Existing Wallet */}
                <Card 
                  className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 hover:from-green-500/20 hover:via-emerald-500/10 hover:to-teal-500/20 border border-green-400/20 hover:border-green-400/40 p-8 text-center shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 group cursor-pointer"
                  onClick={handleImportWallet}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Import Existing Wallet</h3>
                  <p className="text-gray-400 mb-6">
                    Already have a ShadowPay backup? Import it here
                  </p>
                  <div className="text-sm text-green-400 font-medium">
                    Click to Import →
                  </div>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 'dashboard' && (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Wallet Ready!</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                Scanning for your private salary payments...
              </p>
              
              <div className="max-w-2xl mx-auto">
                <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-8">
                  <h3 className="text-xl font-bold text-white mb-4">No Payments Yet</h3>
                  <p className="text-gray-400">
                    Your wallet is active and ready. Payments will appear here when payroll runs.
                  </p>
                </Card>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
} 