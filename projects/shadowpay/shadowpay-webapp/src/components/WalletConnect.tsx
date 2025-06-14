'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Wallet, Copy, Download, LogOut, Check, Eye, EyeOff } from "lucide-react"

interface ShadowPayWallet {
  address: string
  balance: number
  isConnected: boolean
}

// Mock ShadowPay wallet data - in real app this would come from context/state
const mockWallet: ShadowPayWallet = {
  address: 'SPW1:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
  balance: 0,
  isConnected: false
}

export function ShadowConnect() {
  const [wallet, setWallet] = useState<ShadowPayWallet>(mockWallet)
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportBackup = () => {
    // TODO: Implement backup export
    console.log('Export ShadowPay backup')
    setShowDropdown(false)
  }

  const handleDisconnect = () => {
    setWallet({ ...wallet, isConnected: false })
    setShowDropdown(false)
  }

  if (!wallet.isConnected) {
    return (
      <Button
        onClick={() => setWallet({ ...wallet, isConnected: true })}
        className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect ShadowPay</span>
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
          {/* ShadowPay Indicator */}
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-600 animate-pulse"></div>
          
          {/* Address Info */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className="text-sm text-gray-400 font-medium truncate">
              ShadowPay
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
        <div className="absolute top-full right-0 mt-2 w-64 z-50">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-800/90 via-gray-900/80 to-black/60 border border-gray-600/40 shadow-2xl">
            <div className="p-4 space-y-4">
              {/* Address Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">ShadowPay Address</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="h-6 w-6 p-0 hover:bg-gray-700/50"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-gray-400" />}
                  </Button>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-sm text-white break-all">
                  {wallet.address}
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