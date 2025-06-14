'use client'

import { useState, useEffect } from 'react'
import { Shield, Key, Upload, ArrowRight, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmployeeHeader } from '@/components/EmployeeHeader'
import Link from "next/link"
import { useRouter } from 'next/navigation'

type OnboardingStep = 'welcome' | 'set-password' | 'generating' | 'meta-address' | 'backup-download'

export default function EmployeePage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [metaAddress, setMetaAddress] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [backupDownloaded, setBackupDownloaded] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user should have access to employee setup
  useEffect(() => {
    // Check if user already has wallet setup completed
    const hasWallet = localStorage.getItem('shadowpay-wallet-setup') === 'completed'
    
    if (hasWallet) {
      // Already has wallet, redirect to dashboard
      router.push('/employee/dashboard')
      return
    }
    
    // Allow access to setup page
    setIsLoading(false)
  }, [router])

  const handleGenerateWallet = () => {
    setCurrentStep('set-password')
  }

  const handlePasswordSubmit = () => {
    if (password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setCurrentStep('generating')

    // todo: generate wallet
    setTimeout(() => {
      const mockMetaAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase() + '.meta'
      setMetaAddress(mockMetaAddress)
      
      setCurrentStep('meta-address')
    }, 1500) 
  }

  const handleImportWallet = () => {
    // TODO: Implement wallet import flow
    router.push('/employee/dashboard')
  }

  const handleCopyMetaAddress = async () => {
    try {
      await navigator.clipboard.writeText(metaAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleContinueToBackup = () => {
    setCurrentStep('backup-download')
  }

  const handleDownloadBackup = () => {
    const backupData = {
      version: 'SPB1',
      address: metaAddress,
      encrypted_key: 'encrypted_wallet_data_here',
      created: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shadowpay-backup-${Date.now()}.spb1`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleContinue = () => {
    // Mark wallet setup as completed
    localStorage.setItem('shadowpay-wallet-setup', 'completed')
    // Wallet setup complete, redirect to dashboard
    router.push('/employee/dashboard')
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-black">
      <div className="relative">
        <EmployeeHeader />

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

          {currentStep === 'set-password' && (
            <div className="text-center">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  <span className="text-white">Set Your</span>{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Password</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Secure your wallet with a strong password
                </p>
              </div>

              <Card className="max-w-md mx-auto backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                      minLength={8}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      minLength={8}
                    />
                  </div>

                  <div className="text-xs text-gray-400 text-left">
                    • Password must be at least 8 characters long<br/>
                    • This password encrypts your wallet locally<br/>
                    • Keep it safe - it cannot be recovered
                  </div>

                  <Button
                    onClick={handlePasswordSubmit}
                    disabled={!password || !confirmPassword || password.length < 8}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Wallet
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {currentStep === 'generating' && (
            <div className="text-center">
              <Card className="max-w-md mx-auto backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Generating...</h2>
                <p className="text-gray-400">Creating your secure wallet</p>
              </Card>
            </div>
          )}

          {currentStep === 'meta-address' && (
            <div className="text-center">
              <Card className="max-w-2xl mx-auto backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Your Meta-Address</h2>
                
                {/* Large Meta-Address Display */}
                <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                  <div className="font-mono text-lg md:text-xl text-white break-all mb-4">
                    {metaAddress}
                  </div>
                  <Button
                    onClick={handleCopyMetaAddress}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <p className="text-gray-400 mb-6">
                  Give this address to HR so they can pay you privately.
                </p>

                {/* Optional backup nudge */}
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-200 text-sm">
                    💡 Want to back this wallet up later? You can do that any time from Settings → Backup.
                  </p>
                </div>

                <Button
                  onClick={handleContinueToBackup}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8"
                >
                  Next: Backup Wallet →
                </Button>
              </Card>
            </div>
          )}

          {currentStep === 'backup-download' && (
            <div className="text-center">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  <span className="text-white">Download Your</span>{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Backup</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Keep your wallet safe with a secure backup file
                </p>
              </div>

              <Card className="max-w-lg mx-auto backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-8">
                <div className="space-y-6">
                  {/* Warning Box */}
                  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                    <h3 className="text-red-200 font-semibold mb-2">⚠️ Important</h3>
                    <p className="text-red-200 text-sm">
                      This backup file contains your encrypted wallet. Store it safely - if you lose both your password and this file, your funds cannot be recovered.
                    </p>
                  </div>

                  {/* Download Button */}
                  <Button
                    onClick={handleDownloadBackup}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4"
                  >
                    <ArrowRight className="h-5 w-5 mr-2 rotate-90" />
                    Download Backup File (.spb1)
                  </Button>

                  {/* Verification Checkbox */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={backupDownloaded}
                        onChange={(e) => setBackupDownloaded(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="text-sm">
                        <div className="text-white font-medium">
                          ✅ I have downloaded and safely stored my backup file
                        </div>
                        <div className="text-gray-400 mt-1">
                          I understand that I need both my password and this backup file to restore my wallet
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Continue Button */}
                  <Button
                    onClick={handleContinue}
                    disabled={!backupDownloaded}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Complete Setup →
                  </Button>

                  {/* Skip Option */}
                  <div className="text-center">
                    <button
                      onClick={handleContinue}
                      className="text-gray-400 hover:text-gray-300 text-sm underline"
                    >
                      Skip backup for now (not recommended)
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}


        </section>
      </div>
    </div>
  )
} 