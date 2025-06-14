'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Download, 
  RefreshCw, 
  Send, 
  QrCode, 
  Copy, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  Search,
  MoreHorizontal,
  Wallet,
  TrendingUp,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmployeeHeader } from '@/components/EmployeeHeader'
import { walletManager } from '@/lib/wallet'

// Mock employee data - in real app this would come from context/API
const mockEmployeeData = {
  name: "John Doe",
  spwAddress: "SPW1xK9m2nF7qL8pR3vT6wY1zC4uB5eH9jN0sA2dG8fM7",
  metaAddress: "0x1234567890ABCDEF1234567890ABCDEF12345678.meta",
  balance: 4500, // USDC
  totalReceived: 18000,
  paymentsCount: 12,
  transactions: [
    {
      id: 1,
      type: 'received',
      amount: 4500,
      date: '2024-01-15',
      time: '14:30',
      from: 'TechCorp Payroll',
      memo: 'Salary - January 2024',
      status: 'completed',
      txHash: '0xabc123...'
    },
    {
      id: 2,
      type: 'received',
      amount: 4200,
      date: '2023-12-15',
      time: '09:15',
      from: 'TechCorp Payroll',
      memo: 'Salary - December 2023',
      status: 'completed',
      txHash: '0xdef456...'
    },
    {
      id: 3,
      type: 'received',
      amount: 4800,
      date: '2023-11-15',
      time: '16:45',
      from: 'TechCorp Payroll',
      memo: 'Salary + Bonus - November 2023',
      status: 'completed',
      txHash: '0xghi789...'
    },
    {
      id: 4,
      type: 'sent',
      amount: 500,
      date: '2023-11-20',
      time: '11:20',
      to: 'Personal Wallet',
      memo: 'Withdrawal to bank',
      status: 'completed',
      txHash: '0xjkl012...'
    }
  ]
}

// Railgun USDC Balance Component
function RailgunUSDCBalance() {
  const [balance, setBalance] = useState<{
    balance: string
    balanceWei: string
    symbol: string
    decimals: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Starting balance fetch...')
      
      // Get the active wallet ID from localStorage
      const activeWalletId = localStorage.getItem('shadowpay-active-wallet-id')
      const activeWalletPassword = localStorage.getItem('shadowpay-active-wallet-password')
      
      if (!activeWalletId) {
        throw new Error('No active wallet found. Please unlock your wallet first.')
      }
      
      if (!activeWalletPassword) {
        throw new Error('Wallet password not available. Please unlock your wallet again.')
      }
      
      console.log('🎯 Using active wallet ID:', activeWalletId)
      
      // Wait for Railgun SDK to be initialized
      console.log('⏳ Waiting for Railgun SDK initialization...')
      let attempts = 0
      const maxAttempts = 30 // 30 seconds max wait
      
      while (!walletManager.isRailgunAvailable() && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        attempts++
        console.log(`⏳ Waiting for Railgun... (${attempts}/${maxAttempts})`)
      }
      
      // Check if Railgun is available
      const isRailgunAvailable = walletManager.isRailgunAvailable()
      console.log('🚂 Railgun available:', isRailgunAvailable)
      
      if (!isRailgunAvailable) {
        throw new Error('Railgun SDK failed to initialize after 30 seconds. Please refresh the page and try again.')
      }
      
      // Ensure the wallet is unlocked (this will set the encryption key)
      console.log('🔓 Ensuring wallet is unlocked...')
      const { wallet } = await walletManager.loadWallet(activeWalletId, activeWalletPassword)
      console.log('✅ Wallet unlocked successfully')
      console.log('📝 Wallet details:', {
        id: wallet.id,
        name: wallet.name,
        address: wallet.address,
        railgunWalletID: wallet.railgunWalletID
      })
      
      // Now fetch the balance using the railgunWalletID
      console.log('💰 Fetching balance for Railgun wallet ID:', wallet.railgunWalletID)
      const balanceData = await walletManager.getRailgunUSDCBalance(wallet.railgunWalletID)
      setBalance(balanceData)
      console.log('✅ Balance fetched successfully:', balanceData)
    } catch (err) {
      console.error('❌ Failed to fetch Railgun USDC balance:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Railgun USDC Balance</h3>
            <p className="text-green-400 text-sm">Private Balance</p>
          </div>
        </div>
        <Button
          onClick={fetchBalance}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-green-600 text-green-400 hover:bg-green-800/20"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {error ? (
        <div className="text-red-400 text-sm">
          <p>Error: {error}</p>
          <p className="text-xs text-gray-500 mt-1">
            Make sure your Railgun wallet is properly set up and synced.
          </p>
        </div>
      ) : balance ? (
        <div>
          <div className="text-3xl font-bold text-white mb-2">
            {balance.balance} {balance.symbol}
          </div>
          <div className="text-xs text-gray-400">
            Wei: {balance.balanceWei}
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <Badge variant="outline" className="border-green-600 text-green-400">
              <Shield className="h-3 w-3 mr-1" />
              Private
            </Badge>
            <Badge variant="outline" className="border-blue-600 text-blue-400">
              Sepolia
            </Badge>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">
          {isLoading ? 'Loading balance...' : 'No balance data'}
        </div>
      )}
    </Card>
  )
}

export default function EmployeeDashboard() {
  const [showBalance, setShowBalance] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const router = useRouter()

  // Check authentication status and initialize Railgun
  useEffect(() => {
    const checkAuth = async () => {
      const hasWallet = localStorage.getItem('shadowpay-wallet-setup') === 'completed'
      
      if (!hasWallet) {
        router.push('/sign-in')
        return
      }
      
      // Initialize wallet manager (which will load Railgun SDK)
      try {
        console.log('🚀 Initializing wallet manager...')
        await walletManager.initialize()
        console.log('✅ Wallet manager initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize wallet manager:', error)
      }
      
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleScanForPayments = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
    }, 2000)
  }

  const handleSend = () => {
    console.log('Send funds')
  }

  const handleReceive = () => {
    console.log('Receive funds')
  }

  const handleWithdraw = () => {
    console.log('Withdraw funds')
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const filteredTransactions = mockEmployeeData.transactions.filter(tx => {
    const matchesSearch = tx.memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tx.from && tx.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tx.to && tx.to.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = selectedFilter === 'all' || tx.type === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="dark min-h-screen bg-black">
      <EmployeeHeader />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Wallet Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ShadowPay Wallet</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-green-400 text-sm">Active</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleScanForPayments}
            disabled={isScanning}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {isScanning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync
          </Button>
        </div>

        {/* Modern Tab Navigation */}
        <div className="flex items-center space-x-1 bg-gray-900/50 p-1 rounded-xl border border-gray-700/50 backdrop-blur-sm mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500/30 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Total Balance</p>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-3xl font-bold">
                        {showBalance ? `$${mockEmployeeData.balance.toLocaleString()}` : '••••••'}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-8 w-8 p-0 hover:bg-white/20 rounded-full"
                      >
                        {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-blue-100 text-sm">
                      {showBalance ? `${mockEmployeeData.balance.toLocaleString()} USDC` : '•••••• USDC'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-green-300 text-sm mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>+12.5%</span>
                    </div>
                    <p className="text-blue-100 text-xs">vs last month</p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-blue-100 text-xs">Total Received</p>
                    <p className="text-white font-semibold">
                      {showBalance ? `$${mockEmployeeData.totalReceived.toLocaleString()}` : '••••••'}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs">Payments</p>
                    <p className="text-white font-semibold">{mockEmployeeData.paymentsCount}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Railgun USDC Balance */}
            <RailgunUSDCBalance />

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Button 
                onClick={handleSend}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl"
              >
                <div className="text-center">
                  <Send className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Send</div>
                </div>
              </Button>

              <Button 
                onClick={handleReceive}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 rounded-xl"
              >
                <div className="text-center">
                  <QrCode className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Receive</div>
                </div>
              </Button>

              <Button 
                onClick={handleWithdraw}
                disabled={mockEmployeeData.balance === 0}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white py-6 rounded-xl disabled:opacity-50"
              >
                <div className="text-center">
                  <ArrowUpRight className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Withdraw</div>
                </div>
              </Button>
            </div>

            {/* Address Card */}
            <Card className="bg-gray-800/50 border-gray-700">
              <div className="p-6">
                <h3 className="text-white font-semibold mb-4">Wallet Address</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">ShadowPay Address</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(mockEmployeeData.spwAddress)}
                        className="h-8 w-8 p-0 hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-white font-mono text-sm break-all">
                      {mockEmployeeData.spwAddress}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Meta Address</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(mockEmployeeData.metaAddress)}
                        className="h-8 w-8 p-0 hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-white font-mono text-sm break-all">
                      {mockEmployeeData.metaAddress}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-800/50 border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Recent Activity</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('transactions')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockEmployeeData.transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'received' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {tx.type === 'received' ? 
                            <ArrowDownLeft className="h-4 w-4 text-green-400" /> : 
                            <ArrowUpRight className="h-4 w-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {tx.type === 'received' ? tx.from : tx.to}
                          </p>
                          <p className="text-gray-400 text-sm">{tx.date} • {tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.type === 'received' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tx.type === 'received' ? '+' : '-'}
                          {showBalance ? `$${tx.amount.toLocaleString()}` : '••••••'}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                  className={selectedFilter === 'all' ? 'bg-blue-600' : 'border-gray-600'}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === 'received' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('received')}
                  className={selectedFilter === 'received' ? 'bg-blue-600' : 'border-gray-600'}
                >
                  Received
                </Button>
                <Button
                  variant={selectedFilter === 'sent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('sent')}
                  className={selectedFilter === 'sent' ? 'bg-blue-600' : 'border-gray-600'}
                >
                  Sent
                </Button>
              </div>
            </div>

            {/* Transaction List */}
            <Card className="bg-gray-800/50 border-gray-700">
              <div className="p-6">
                <h3 className="text-white font-semibold mb-4">Transaction History</h3>
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          tx.type === 'received' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {tx.type === 'received' ? 
                            <ArrowDownLeft className="h-5 w-5 text-green-400" /> : 
                            <ArrowUpRight className="h-5 w-5 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {tx.type === 'received' ? `From ${tx.from}` : `To ${tx.to}`}
                          </p>
                          <p className="text-gray-400 text-sm">{tx.memo}</p>
                          <p className="text-gray-500 text-xs">{tx.date} • {tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          tx.type === 'received' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tx.type === 'received' ? '+' : '-'}
                          {showBalance ? `$${tx.amount.toLocaleString()}` : '••••••'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {tx.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-600"
                          >
                            <MoreHorizontal className="h-3 w-3 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Wallet Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <div className="p-6">
                <h3 className="text-white font-semibold mb-4">Wallet Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Privacy Mode</p>
                      <p className="text-gray-400 text-sm">Hide balance amounts</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="border-gray-600"
                    >
                      {showBalance ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Export Backup</p>
                      <p className="text-gray-400 text-sm">Download wallet backup file</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Income Proof</p>
                      <p className="text-gray-400 text-sm">Generate payment verification</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="bg-gray-800/50 border-gray-700">
              <div className="p-6">
                <h3 className="text-white font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Wallet Encrypted</p>
                      <p className="text-gray-400 text-sm">Your wallet is protected with password encryption</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-white font-medium">Change Password</p>
                      <p className="text-gray-400 text-sm">Update your wallet password</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 