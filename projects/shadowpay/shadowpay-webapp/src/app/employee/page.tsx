'use client'

import { useState, useEffect } from 'react'
import { Shield, Key, Upload, ArrowRight, Check, Copy, Lock, Eye, EyeOff, Wallet, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmployeeHeader } from '@/components/EmployeeHeader'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { walletManager, downloadWalletBackup, type ShadowPayWallet } from '@/lib/wallet'

type OnboardingStep = 'wallet-list' | 'set-password' | 'generating' | 'meta-address' | 'backup-download' | 'unlock-wallet'

// Use ShadowPayWallet type from wallet lib
type WalletInfo = ShadowPayWallet

// Mock wallets for demo - will be replaced with real IndexedDB data
const mockWallets: WalletInfo[] = [
  {
    id: '1',
    name: 'Personal Wallet',
    address: '0zk1xK9m2nF7qL8pR3vT6wY1zC4uB5eH9jN0sA2dG8fM7',
    encryptedMnemonic: 'encrypted_data_here',
    railgunWalletID: 'railgun_wallet_1',
    createdAt: '2024-01-15T10:00:00Z',
    lastUsed: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Work Salary',
    address: '0zk1aB3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2',
    encryptedMnemonic: 'encrypted_data_here',
    railgunWalletID: 'railgun_wallet_2',
    createdAt: '2024-01-10T10:00:00Z',
    lastUsed: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Freelance Projects',
    address: '0zk1zY9x8W7v6U5t4S3r2Q1p0O9n8M7l6K5j4I3h2G1f0',
    encryptedMnemonic: 'encrypted_data_here',
    railgunWalletID: 'railgun_wallet_3',
    createdAt: '2024-01-08T10:00:00Z',
    lastUsed: '2024-01-08T10:00:00Z'
  }
]

export default function EmployeePage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('wallet-list')
  const [createdWallet, setCreatedWallet] = useState<ShadowPayWallet | null>(null)
  const [createdMnemonic, setCreatedMnemonic] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [walletName, setWalletName] = useState<string>('')
  const [backupDownloaded, setBackupDownloaded] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const router = useRouter()

  // Check if user should have access to employee setup
  useEffect(() => {
    const initializeWalletCheck = async () => {
      try {
        // Check if user already has wallet setup completed
        const hasWallet = localStorage.getItem('shadowpay-wallet-setup') === 'completed'
        
        if (hasWallet) {
          // Already has wallet, redirect to dashboard
          router.push('/employee/dashboard')
          return
        }
        
        // Load real wallets from IndexedDB
        const realWallets = await walletManager.getWallets()
        
        if (realWallets.length > 0) {
          setWallets(realWallets)
        } else {
          // Fallback to mock wallets for demo
          setWallets(mockWallets)
        }
      } catch (error) {
        console.error('Failed to load wallets:', error)
        // Fallback to mock wallets
        setWallets(mockWallets)
      } finally {
        setIsLoading(false)
      }
    }

    initializeWalletCheck()
  }, [router])

  const handleSelectWallet = (wallet: WalletInfo) => {
    setSelectedWallet(wallet)
    setCurrentStep('unlock-wallet')
  }

  const handleGenerateWallet = () => {
    setCurrentStep('set-password')
  }

  const handlePasswordSubmit = async () => {
    if (!walletName.trim()) {
      alert('Please enter a wallet name')
      return
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    setCurrentStep('generating')
    setIsCreating(true)
    setCreateError('')

    try {
      // Create real Railgun wallet
      const { wallet, mnemonic } = await walletManager.createWallet(walletName, password)
      
      // Log the newly created wallet details for testing
      console.log('🎉 New wallet created successfully!')
      console.log('📝 New Wallet Details:')
      console.log('- Name:', wallet.name)
      console.log('- Railgun Address:', wallet.address)
      console.log('- Wallet ID:', wallet.id)
      console.log('- Created:', wallet.createdAt)
      console.log('🔑 GENERATED MNEMONIC (FOR TESTING):')
      console.log(mnemonic)
      console.log('🔑 Mnemonic word count:', mnemonic.split(' ').length)
      console.log('🔑 First 3 words:', mnemonic.split(' ').slice(0, 3).join(' '))
      console.log('🔑 Last 3 words:', mnemonic.split(' ').slice(-3).join(' '))
      
      setCreatedWallet(wallet)
      setCreatedMnemonic(mnemonic)
      setCurrentStep('meta-address')
    } catch (error) {
      console.error('Failed to create wallet:', error)
      setCreateError(error instanceof Error ? error.message : 'Failed to create wallet')
      setCurrentStep('set-password')
    } finally {
      setIsCreating(false)
    }
  }

  const handleImportWallet = () => {
    // TODO: Implement wallet import flow
    router.push('/employee/dashboard')
  }

  const handleUnlockWallet = async () => {
    if (!unlockPassword) {
      setUnlockError('Please enter your password')
      return
    }

    if (!selectedWallet) {
      setUnlockError('No wallet selected')
      return
    }

    setIsUnlocking(true)
    setUnlockError('')

    try {
      // Try to decrypt the wallet using the provided password
      const { wallet, mnemonic } = await walletManager.loadWallet(selectedWallet.id, unlockPassword)
      
      // If we get here, the password was correct and wallet was decrypted successfully
      console.log('🎉 Wallet unlocked successfully!')
      console.log('📝 Wallet Details:')
      console.log('- Name:', wallet.name)
      console.log('- Railgun Address:', wallet.address)
      console.log('- Wallet ID:', wallet.id)
      console.log('- Created:', wallet.createdAt)
      console.log('- Last Used:', wallet.lastUsed)
      console.log('🔑 FULL MNEMONIC (FOR TESTING):')
      console.log(mnemonic)
      console.log('🔑 Mnemonic word count:', mnemonic.split(' ').length)
      console.log('🔑 First 3 words:', mnemonic.split(' ').slice(0, 3).join(' '))
      console.log('🔑 Last 3 words:', mnemonic.split(' ').slice(-3).join(' '))
      
      // Store the active wallet info for the dashboard
      localStorage.setItem('shadowpay-active-wallet-id', wallet.id)
      localStorage.setItem('shadowpay-active-wallet-password', unlockPassword) // Store temporarily for balance fetching
      
      // Mark wallet as setup and redirect to dashboard
      localStorage.setItem('shadowpay-wallet-setup', 'completed')
      router.push('/employee/dashboard')
      
    } catch (error) {
      console.error('Failed to unlock wallet:', error)
      
      // Check if it's a password error or other error
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlock wallet'
      
      if (errorMessage.includes('Invalid password') || errorMessage.includes('decrypt')) {
        setUnlockError('Incorrect password. Please try again.')
      } else {
        setUnlockError('Failed to unlock wallet. Please try again.')
      }
      
      setIsUnlocking(false)
    }
  }

  const handleBackToWalletList = () => {
    setSelectedWallet(null)
    setUnlockPassword('')
    setUnlockError('')
    setCurrentStep('wallet-list')
  }

  const handleCopyAddress = async () => {
    if (!createdWallet) return
    try {
      await navigator.clipboard.writeText(createdWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleContinueToBackup = () => {
    setCurrentStep('backup-download')
  }

  const handleDownloadBackup = async () => {
    if (!createdWallet) return
    
    try {
      await downloadWalletBackup(createdWallet, password)
      setBackupDownloaded(true)
    } catch (error) {
      console.error('Failed to download backup:', error)
      alert('Failed to download backup. Please try again.')
    }
  }

  const handleContinue = () => {
    // Mark wallet as setup and redirect to dashboard
    localStorage.setItem('shadowpay-wallet-setup', 'completed')
    
    // Store the active wallet info for the dashboard
    if (createdWallet) {
      localStorage.setItem('shadowpay-active-wallet-id', createdWallet.id)
      localStorage.setItem('shadowpay-active-wallet-password', password) // Store the password used during creation
    }
    
    router.push('/employee/dashboard')
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallets...</p>
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
          {currentStep === 'wallet-list' && (
            <div>
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  <span className="text-white">Employee</span>{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Dashboard</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Choose an existing wallet or create a new one to receive private salary payments
                </p>
              </div>
              
              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Left Side - Wallet List */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Your Wallets</h2>
                    <span className="text-sm text-gray-400">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {wallets.map((wallet) => (
                      <Card 
                        key={wallet.id}
                        className="backdrop-blur-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 p-6 cursor-pointer transition-all duration-300 group"
                        onClick={() => handleSelectWallet(wallet)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Wallet className="h-6 w-6 text-blue-400" />
                            </div>
                                                         <div>
                               <h3 className="text-lg font-semibold text-white mb-1">{wallet.name}</h3>
                               <p className="text-sm text-gray-400">
                                 ShadowPay Wallet
                               </p>
                               <div className="mt-2">
                                 <div className="text-xs text-blue-400 font-medium">
                                   🔒 Encrypted
                                 </div>
                               </div>
                             </div>
                          </div>
                          <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-6">Create New</h2>
                    
                    <div className="space-y-4">
                                             {/* Generate New Wallet */}
                       <Card 
                         className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-indigo-500/10 hover:from-blue-500/20 hover:via-cyan-500/10 hover:to-indigo-500/20 border border-blue-400/20 hover:border-blue-400/40 p-4 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 group cursor-pointer"
                         onClick={handleGenerateWallet}
                       >
                         <div className="flex items-center space-x-3">
                           <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                             <Plus className="h-6 w-6 text-blue-400" />
                           </div>
                           <div className="text-left">
                             <h3 className="text-lg font-bold text-white">Generate Wallet</h3>
                             <p className="text-gray-400 text-sm">
                               Create a brand new secure wallet
                             </p>
                           </div>
                         </div>
                       </Card>

                       {/* Import Existing Wallet */}
                       <Card 
                         className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 hover:from-green-500/20 hover:via-emerald-500/10 hover:to-teal-500/20 border border-green-400/20 hover:border-green-400/40 p-4 shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 group cursor-pointer"
                         onClick={handleImportWallet}
                       >
                         <div className="flex items-center space-x-3">
                           <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                             <Upload className="h-6 w-6 text-green-400" />
                           </div>
                           <div className="text-left">
                             <h3 className="text-lg font-bold text-white">Import Wallet</h3>
                             <p className="text-gray-400 text-sm">
                               Import from backup file
                             </p>
                           </div>
                         </div>
                       </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'unlock-wallet' && selectedWallet && (
            <div className="text-center">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  <span className="text-white">Unlock</span>{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{selectedWallet.name}</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Enter your password to access this wallet
                </p>
              </div>

              <Card className="max-w-lg mx-auto backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-8">
                {/* Wallet Info Display */}
                <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-2xl flex items-center justify-center">
                      <Wallet className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Wallet Name</p>
                      <p className="text-white font-semibold">{selectedWallet.name}</p>
                    </div>
                    
                                         <div>
                       <p className="text-gray-400 text-sm">Wallet Type</p>
                       <p className="text-white text-sm">ShadowPay Encrypted Wallet</p>
                     </div>
                     
                     <div>
                       <p className="text-gray-400 text-sm">Status</p>
                       <p className="text-blue-400 text-sm font-medium">🔒 Encrypted & Secure</p>
                     </div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Wallet Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={unlockPassword}
                        onChange={(e) => {
                          setUnlockPassword(e.target.value)
                          setUnlockError('')
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleUnlockWallet()}
                        className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your wallet password"
                        disabled={isUnlocking}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        disabled={isUnlocking}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {unlockError && (
                      <p className="text-red-400 text-sm mt-2">{unlockError}</p>
                    )}
                  </div>

                  {/* Unlock Button */}
                  <Button
                    onClick={handleUnlockWallet}
                    disabled={!unlockPassword || isUnlocking}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed py-3"
                  >
                    {isUnlocking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock Wallet
                      </>
                    )}
                  </Button>

                  {/* Back Button */}
                  <Button
                    onClick={handleBackToWalletList}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    disabled={isUnlocking}
                  >
                    ← Back to Wallet List
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {currentStep === 'set-password' && (
            <div className="text-center">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  <span className="text-white">Create New</span>{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Wallet</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Set up your new secure wallet
                </p>
              </div>

              <Card className="max-w-md mx-auto backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Wallet Name
                    </label>
                    <input
                      type="text"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Personal Wallet, Work Salary"
                    />
                  </div>
                  
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
                    • Wallet name helps you identify this wallet<br/>
                    • Password must be at least 8 characters long<br/>
                    • This password encrypts your wallet locally<br/>
                    • Keep it safe - it cannot be recovered
                  </div>

                  <Button
                    onClick={handlePasswordSubmit}
                    disabled={!walletName.trim() || !password || !confirmPassword || password.length < 8}
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
                <p className="text-gray-400">Creating your secure wallet "{walletName}"</p>
              </Card>
            </div>
          )}

          {currentStep === 'meta-address' && (
            <div className="text-center">
              <Card className="max-w-2xl mx-auto backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Your Railgun Address</h2>
                
                {/* Large Meta-Address Display */}
                <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                  <div className="font-mono text-lg md:text-xl text-white break-all mb-4">
                    {createdWallet?.address || 'Generating...'}
                  </div>
                  <Button
                    onClick={handleCopyAddress}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!createdWallet}
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <p className="text-gray-400 mb-6">
                  This is your private Railgun address. Give this to HR so they can send you private salary payments.
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
                  Keep your wallet "{walletName}" safe with a secure backup file
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