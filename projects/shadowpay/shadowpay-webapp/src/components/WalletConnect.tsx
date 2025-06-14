'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Wallet, Copy, Download, LogOut, Check, Eye, EyeOff } from "lucide-react"
import { walletManager, downloadWalletBackup, type ShadowPayWallet } from '@/lib/wallet'

interface WalletDisplayData {
  address: string
  name: string
  balance: number
  isConnected: boolean
  walletId?: string
}

export function ShadowConnect() {
  const [wallet, setWallet] = useState<WalletDisplayData>({
    address: '',
    name: '',
    balance: 0,
    isConnected: false
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showBalance, setShowBalance] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Load actual wallet data when on dashboard
  useEffect(() => {
    const loadWalletData = async () => {
      if (pathname === '/employee/dashboard') {
        try {
          // Check if wallet setup is completed
          const isSetupCompleted = localStorage.getItem('shadowpay-wallet-setup') === 'completed'
          
          if (isSetupCompleted) {
            // Get the most recently used wallet
            const wallets = await walletManager.getWallets()
            
            if (wallets.length > 0) {
              // Sort by lastUsed and get the most recent
              const sortedWallets = wallets.sort((a, b) => 
                new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
              )
              const recentWallet = sortedWallets[0]
              
              // For testing: Try to load the wallet with a test password to get mnemonic
              // Note: This is just for testing - in production you wouldn't do this
              try {
                // We need the password to decrypt the mnemonic
                // For testing, we'll just show the encrypted version
                console.log('🔐 Wallet loaded for testing:')
                console.log('- Wallet Name:', recentWallet.name)
                console.log('- Railgun Address:', recentWallet.address)
                console.log('- Encrypted Mnemonic:', recentWallet.encryptedMnemonic)
                console.log('- Wallet ID:', recentWallet.id)
                console.log('- Created:', recentWallet.createdAt)
                console.log('- Last Used:', recentWallet.lastUsed)
                console.log('⚠️  To see decrypted mnemonic, unlock wallet with password first')
              } catch (error) {
                console.log('Could not decrypt mnemonic for testing:', error)
              }
              
              setWallet({
                address: recentWallet.address,
                name: recentWallet.name,
                balance: 0, // TODO: Implement balance fetching
                isConnected: true,
                walletId: recentWallet.id
              })
            }
          }
        } catch (error) {
          console.error('Failed to load wallet data:', error)
        }
      } else {
        // Reset wallet state when not on dashboard
        setWallet({
          address: '',
          name: '',
          balance: 0,
          isConnected: false
        })
      }
      setIsLoading(false)
    }

    loadWalletData()
  }, [pathname])

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportBackup = async () => {
    if (!wallet.walletId) {
      console.error('No wallet ID available for backup')
      return
    }

    try {
      // Prompt user for password to export backup
      const password = prompt('Enter your wallet password to export backup:')
      if (!password) return

      // Find the wallet and export backup
      const wallets = await walletManager.getWallets()
      const targetWallet = wallets.find(w => w.id === wallet.walletId)
      
      if (targetWallet) {
        await downloadWalletBackup(targetWallet, password)
        console.log('Backup exported successfully')
      } else {
        console.error('Wallet not found for backup')
      }
    } catch (error) {
      console.error('Failed to export backup:', error)
      alert('Failed to export backup. Please check your password and try again.')
    }
    
    setShowDropdown(false)
  }

  const handleDisconnect = () => {
    setWallet({
      address: '',
      name: '',
      balance: 0,
      isConnected: false
    })
    setShowDropdown(false)
    // Clear authentication data
    localStorage.removeItem('shadowpay-wallet-setup')
    // Redirect to sign-in page after disconnect
    window.location.href = '/sign-in'
  }

  if (isLoading) {
    return (
      <Button
        disabled
        className="h-12 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold px-4 rounded-xl opacity-50 flex items-center space-x-2"
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Loading...</span>
      </Button>
    )
  }

  if (!wallet.isConnected) {
    return (
      <Button
        onClick={() => window.location.href = '/employee'}
        className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </Button>
    )
  }

  return (
    <div className="relative">
      <Card 
        className="h-12 backdrop-blur-xl bg-gradient-to-br from-gray-800/80 via-gray-900/60 to-black/40 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="h-full px-4 flex items-center space-x-3">
          {/* Railgun Indicator */}
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-600 animate-pulse"></div>
          
          {/* Address Info */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-sm text-gray-400 font-medium truncate">
              {wallet.name}
            </span>
            <span className="text-sm text-white font-semibold">
              {formatAddress(wallet.address)}
            </span>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </Card>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-800/90 via-gray-900/80 to-black/60 border border-gray-600/40 shadow-2xl">
            <div className="p-4 space-y-4">
              {/* Wallet Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">Wallet Name</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-white font-medium">{wallet.name}</div>
                  <div className="text-xs text-blue-400">Railgun Privacy Wallet</div>
                </div>
              </div>

              {/* Railgun Address Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">Railgun Address</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="h-6 w-6 p-0 hover:bg-gray-700/50"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-gray-400" />}
                  </Button>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-xs text-white break-all">
                  {wallet.address}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  🔒 Private address for receiving payments
                </div>
              </div>

              {/* Balance Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">Balance</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="h-6 w-6 p-0 hover:bg-gray-700/50"
                  >
                    {showBalance ? <EyeOff className="h-3 w-3 text-gray-400" /> : <Eye className="h-3 w-3 text-gray-400" />}
                  </Button>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-white font-medium">
                    {showBalance ? `$${wallet.balance.toLocaleString()}` : '••••••'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {wallet.balance === 0 ? 'No payments received yet' : 'Available to withdraw'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-gray-700/50 space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleExportBackup}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Backup
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDisconnect}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
} 