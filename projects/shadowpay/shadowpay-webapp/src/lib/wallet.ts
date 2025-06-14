import { NETWORK_CONFIG } from '@railgun-community/shared-models'
import CryptoJS from 'crypto-js'
import { Mnemonic, randomBytes } from 'ethers'

// Railgun SDK imports - using dynamic imports to avoid SSR issues
let startRailgunEngine: any = null
let createRailgunWallet: any = null
let loadWalletByID: any = null
let setOnBalanceUpdateCallback: any = null
let setOnUTXOMerkletreeScanCallback: any = null
let setOnTXIDMerkletreeScanCallback: any = null
let refreshBalances: any = null
let NetworkName: any = null
let TXIDVersion: any = null

// Dynamic import function for Railgun SDK
async function loadRailgunSDK() {
  if (typeof window === 'undefined') return false
  
  try {
    const walletModule = await import('@railgun-community/wallet')
    const sharedModule = await import('@railgun-community/shared-models')
    
    startRailgunEngine = walletModule.startRailgunEngine
    createRailgunWallet = walletModule.createRailgunWallet
    loadWalletByID = walletModule.loadWalletByID
    setOnBalanceUpdateCallback = walletModule.setOnBalanceUpdateCallback
    setOnUTXOMerkletreeScanCallback = walletModule.setOnUTXOMerkletreeScanCallback
    setOnTXIDMerkletreeScanCallback = walletModule.setOnTXIDMerkletreeScanCallback
    refreshBalances = walletModule.refreshBalances
    NetworkName = sharedModule.NetworkName
    TXIDVersion = sharedModule.TXIDVersion
    
    return true
  } catch (error) {
    console.error('Failed to load Railgun SDK:', error)
    return false
  }
}

// Types for our wallet system
export interface ShadowPayWallet {
  id: string
  name: string
  address: string // Railgun address (0zk...)
  encryptedMnemonic: string
  railgunWalletID: string
  createdAt: string
  lastUsed: string
}

export interface WalletBackup {
  version: 'SPB1'
  name: string
  address: string
  encryptedMnemonic: string
  railgunWalletID: string
  createdAt: string
}

// IndexedDB utilities
class WalletDB {
  private dbName = 'shadowpay-wallets'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB is only available in the browser')
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create wallets store
        if (!db.objectStoreNames.contains('wallets')) {
          const store = db.createObjectStore('wallets', { keyPath: 'id' })
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('address', 'address', { unique: true })
        }
      }
    })
  }

  async saveWallet(wallet: ShadowPayWallet): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['wallets'], 'readwrite')
      const store = transaction.objectStore('wallets')
      const request = store.put(wallet)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getWallets(): Promise<ShadowPayWallet[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['wallets'], 'readonly')
      const store = transaction.objectStore('wallets')
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getWallet(id: string): Promise<ShadowPayWallet | null> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['wallets'], 'readonly')
      const store = transaction.objectStore('wallets')
      const request = store.get(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async deleteWallet(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['wallets'], 'readwrite')
      const store = transaction.objectStore('wallets')
      const request = store.delete(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// Encryption utilities
export class WalletCrypto {
  static encrypt(data: string, password: string): string {
    return CryptoJS.AES.encrypt(data, password).toString()
  }

  static decrypt(encryptedData: string, password: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, password)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      
      // If decryption fails, CryptoJS returns an empty string
      if (!decrypted) {
        throw new Error('Invalid password - decryption failed')
      }
      
      return decrypted
    } catch (error) {
      // Handle any CryptoJS errors or our custom error
      throw new Error('Invalid password - unable to decrypt wallet')
    }
  }

  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString()
  }
}

// Mock Railgun address generator (fallback)
// Mock address generation removed - we only use real Railgun addresses

// Wallet manager implementation with real Railgun SDK
export class RailgunWalletManager {
  private static instance: RailgunWalletManager
  private walletDB: WalletDB
  private isInitialized = false
  private railgunEngineStarted = false
  private railgunSDKLoaded = false
  private currentEncryptionKey: Uint8Array | null = null
  private balanceCallbacks: Map<string, (balance: any) => void> = new Map()
  private latestBalances: Map<string, any> = new Map()

  private constructor() {
    this.walletDB = new WalletDB()
  }

  static getInstance(): RailgunWalletManager {
    if (!RailgunWalletManager.instance) {
      RailgunWalletManager.instance = new RailgunWalletManager()
    }
    return RailgunWalletManager.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    if (typeof window === 'undefined') return // Skip on server side

    try {
      await this.walletDB.init()
      
      // Load Railgun SDK
      console.log('📦 Loading Railgun SDK...')
      this.railgunSDKLoaded = await loadRailgunSDK()
      
      if (this.railgunSDKLoaded) {
        console.log('✅ Railgun SDK loaded successfully')
        
        // Wait a bit to ensure IndexedDB is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Initialize Railgun engine
        await this.initializeRailgunEngine()
      } else {
        console.error('❌ Failed to load Railgun SDK')
        throw new Error('Railgun SDK is required for wallet functionality')
      }
      
      this.isInitialized = true
      console.log('✅ ShadowPay Wallet Manager fully initialized with real Railgun functionality')
    } catch (error) {
      console.error('❌ Failed to initialize wallet manager:', error)
      console.error('📋 Initialization error details:', {
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      // Don't continue in fallback mode - we need real Railgun functionality
      throw new Error('Failed to initialize ShadowPay wallet manager: ' + (error instanceof Error ? error.message : error))
    }
  }

  private async initializeRailgunEngine(): Promise<void> {
    if (this.railgunEngineStarted) return
    if (!this.railgunSDKLoaded) {
      throw new Error('Railgun SDK not loaded')
    }

    try {
      console.log('🚀 Initializing Railgun engine...')
      
      // Initialize LevelDB database
      const LevelDOWN = await import('level-js')
      const db = new LevelDOWN.default('shadowpay-railgun-db')
      
      const shouldDebug = true
      const artifactStore = {
        // Artifact store implementation
        getArtifact: async () => undefined,
        storeArtifact: async () => {},
        deleteArtifact: async () => {}
      }
      
      // Start the Railgun engine
      await startRailgunEngine(
        'ShadowPay',
        db,
        shouldDebug,
        artifactStore,
        true, // useNativeArtifacts - true for better performance
        false, // skipMerkletreeScans - set to false to enable balance loading
        false // skipMerkletreeScans - MUST be false for wallets to load balances
      )
      
      console.log('✅ Railgun engine started successfully')
      
      this.railgunEngineStarted = true
      
      // Set up balance callbacks as per Railgun documentation
      this.setupBalanceCallbacks()
      
      console.log('🎉 Railgun engine initialization complete')
      
    } catch (error) {
      console.error('❌ Failed to initialize Railgun engine:', error)
      throw error
    }
  }

  async createWallet(name: string, password: string): Promise<{
    wallet: ShadowPayWallet
    mnemonic: string
  }> {
    if (typeof window === 'undefined') {
      throw new Error('Wallet creation is only available on the client side')
    }

    if (!this.isInitialized) await this.initialize()

    try {
      // Generate mnemonic using ethers
      const mnemonic = Mnemonic.fromEntropy(randomBytes(16)).phrase.trim()
      
      // Encrypt mnemonic with password
      const encryptedMnemonic = WalletCrypto.encrypt(mnemonic, password)

      // We ONLY create real Railgun wallets - no mock addresses
      console.log('🔧 Attempting to create Railgun wallet...')
      console.log('- SDK Loaded:', this.railgunSDKLoaded)
      console.log('- Engine Started:', this.railgunEngineStarted)
      console.log('- createRailgunWallet available:', !!createRailgunWallet)
      
      if (!this.railgunSDKLoaded) {
        throw new Error('Railgun SDK not loaded. Cannot create wallet without real Railgun functionality.')
      }
      
      if (!this.railgunEngineStarted) {
        throw new Error('Railgun engine not started. Cannot create wallet without initialized engine.')
      }
      
      if (!createRailgunWallet) {
        throw new Error('createRailgunWallet function not available. Cannot create wallet.')
      }

      console.log('🚀 Creating Railgun wallet with mnemonic...')
      
      // Generate the same encryption key from password
      const encryptionKey = new Uint8Array(
        CryptoJS.SHA256(password + 'ShadowPay-Salt').words.map(word => [
          (word >>> 24) & 0xff,
          (word >>> 16) & 0xff,
          (word >>> 8) & 0xff,
          word & 0xff
        ]).flat()
      )
      
      // Store the encryption key for later use
      this.currentEncryptionKey = encryptionKey
      
      const railgunWalletInfo = await createRailgunWallet(
        encryptionKey, // 32-byte encryption key (hex string)
        mnemonic, // mnemonic
        undefined, // creationBlockNumbers
      )
      
      console.log('📦 Railgun wallet creation result:', railgunWalletInfo)
      
      if (!railgunWalletInfo || !railgunWalletInfo.railgunAddress || !railgunWalletInfo.id) {
        console.error('❌ Railgun wallet creation returned invalid result')
        throw new Error('Invalid Railgun wallet creation result')
      }

      const railgunAddress = railgunWalletInfo.railgunAddress
      const railgunWalletID = railgunWalletInfo.id
      
      console.log('✅ Created REAL Railgun wallet:', railgunAddress)
      console.log('🆔 Railgun wallet ID:', railgunWalletID)

      // Create wallet object
      const wallet: ShadowPayWallet = {
        id: 'wallet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name,
        address: railgunAddress,
        encryptedMnemonic,
        railgunWalletID,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      }

      // Save to IndexedDB
      await this.walletDB.saveWallet(wallet)

      console.log('Created new ShadowPay wallet:', wallet.name)
      return { wallet, mnemonic }
    } catch (error) {
      console.error('Failed to create wallet:', error)
      throw error
    }
  }

  async loadWallet(walletId: string, password: string): Promise<{
    wallet: ShadowPayWallet
    mnemonic: string
  }> {
    if (typeof window === 'undefined') {
      throw new Error('Wallet loading is only available on the client side')
    }

    if (!this.isInitialized) await this.initialize()

    try {
      const wallet = await this.walletDB.getWallet(walletId)
      if (!wallet) {
        throw new Error('Wallet not found')
      }

      // Decrypt mnemonic
      const mnemonic = WalletCrypto.decrypt(wallet.encryptedMnemonic, password)
      if (!mnemonic) {
        throw new Error('Invalid password')
      }

      // Try to load Railgun wallet if SDK is available
      if (this.railgunSDKLoaded && this.railgunEngineStarted && loadWalletByID) {
        try {
          // Generate the same encryption key used during wallet creation
          const encryptionKey = new Uint8Array(
            CryptoJS.SHA256(password + 'ShadowPay-Salt').words.map(word => [
              (word >>> 24) & 0xff,
              (word >>> 16) & 0xff,
              (word >>> 8) & 0xff,
              word & 0xff
            ]).flat()
          )
          
          // Store the encryption key for later use
          this.currentEncryptionKey = encryptionKey
          
          await loadWalletByID(
            encryptionKey, // 32-byte encryption key (same as creation)
            wallet.railgunWalletID, // walletID
            false, // isViewOnlyWallet
          )
          console.log('Loaded Railgun wallet:', wallet.address)
        } catch (railgunError) {
          console.warn('Failed to load Railgun wallet:', railgunError)
        }
      }

      // Update last used
      wallet.lastUsed = new Date().toISOString()
      await this.walletDB.saveWallet(wallet)

      return { wallet, mnemonic }
    } catch (error) {
      console.error('Failed to load wallet:', error)
      throw error
    }
  }

  async getWallets(): Promise<ShadowPayWallet[]> {
    if (typeof window === 'undefined') return []
    
    if (!this.isInitialized) await this.initialize()
    
    try {
      return await this.walletDB.getWallets()
    } catch (error) {
      console.error('Failed to get wallets:', error)
      return []
    }
  }

  async exportWallet(walletId: string, password: string): Promise<WalletBackup> {
    const wallet = await this.walletDB.getWallet(walletId)
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    // Verify password by trying to decrypt
    WalletCrypto.decrypt(wallet.encryptedMnemonic, password)

    return {
      version: 'SPB1',
      name: wallet.name,
      address: wallet.address,
      encryptedMnemonic: wallet.encryptedMnemonic,
      railgunWalletID: wallet.railgunWalletID,
      createdAt: wallet.createdAt
    }
  }

  async importWallet(backup: WalletBackup, password: string, newName?: string): Promise<ShadowPayWallet> {
    if (backup.version !== 'SPB1') {
      throw new Error('Unsupported backup version')
    }

    // Verify password by trying to decrypt
    const mnemonic = WalletCrypto.decrypt(backup.encryptedMnemonic, password)
    if (!mnemonic) {
      throw new Error('Invalid password or corrupted backup')
    }

    const wallet: ShadowPayWallet = {
      id: 'wallet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: newName || backup.name,
      address: backup.address,
      encryptedMnemonic: backup.encryptedMnemonic,
      railgunWalletID: backup.railgunWalletID,
      createdAt: backup.createdAt,
      lastUsed: new Date().toISOString()
    }

    await this.walletDB.saveWallet(wallet)
    return wallet
  }

  async deleteWallet(walletId: string): Promise<void> {
    await this.walletDB.deleteWallet(walletId)
  }

  // Check if Railgun SDK is available
  isRailgunAvailable(): boolean {
    return this.railgunSDKLoaded && this.railgunEngineStarted
  }

  // Get Railgun USDC balance for a wallet using callbacks
  async getRailgunUSDCBalance(walletId: string): Promise<{
    balance: string
    balanceWei: string
    symbol: string
    decimals: number
  }> {
    if (!this.isRailgunAvailable()) {
      throw new Error('Railgun SDK not available')
    }

    if (!setOnBalanceUpdateCallback || !refreshBalances) {
      throw new Error('Balance functions not loaded from Railgun SDK')
    }

    try {
      console.log('🔍 Getting Railgun USDC balance for wallet:', walletId)
      
      // USDC contract address on Ethereum Sepolia testnet
      const USDC_CONTRACT_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
      
      // Use EthereumSepolia network
      const networkName = NetworkName.EthereumSepolia
      
      console.log('🌐 Using network:', networkName)
      
      // Check if we already have cached balances
      const cachedBalance = this.latestBalances.get(walletId)
      if (cachedBalance) {
        console.log('📋 Using cached balance data:', cachedBalance)
        
        // Find USDC in the ERC20 amounts
        const usdcBalance = cachedBalance.erc20Amounts.find((token: any) => 
          token.tokenAddress.toLowerCase() === USDC_CONTRACT_ADDRESS.toLowerCase()
        )
        
        if (usdcBalance) {
          const decimals = 6
          const balanceWei = usdcBalance.amount
          const balanceFormatted = (Number(balanceWei) / Math.pow(10, decimals)).toFixed(6)
          
          console.log(`💵 Cached USDC Balance: ${balanceFormatted} USDC (${balanceWei} wei)`)
          
          return {
            balance: balanceFormatted,
            balanceWei: balanceWei,
            symbol: 'USDC',
            decimals: decimals
          }
        }
      }
      
      // If no cached balance, trigger a refresh and wait for callback
      console.log('🔄 No cached balance found, refreshing...')
      console.log('⏳ This may take up to 5 minutes for initial wallet sync...')
      
      return new Promise((resolve, reject) => {
        let progressInterval: NodeJS.Timeout
        let startTime = Date.now()
        
        // Set up a callback for this specific wallet
        this.balanceCallbacks.set(walletId, (balancesEvent: any) => {
          try {
            const elapsedTime = Math.round((Date.now() - startTime) / 1000)
            console.log(`💰 Received balance update for wallet: ${walletId} (after ${elapsedTime}s)`)
            
            // Clear progress interval
            if (progressInterval) {
              clearInterval(progressInterval)
            }
            
            // Find USDC in the ERC20 amounts
            const usdcBalance = balancesEvent.erc20Amounts.find((token: any) => 
              token.tokenAddress.toLowerCase() === USDC_CONTRACT_ADDRESS.toLowerCase()
            )
            
            if (usdcBalance) {
              const decimals = 6
              const balanceWei = usdcBalance.amount
              const balanceFormatted = (Number(balanceWei) / Math.pow(10, decimals)).toFixed(6)
              
              console.log(`💵 Fresh USDC Balance: ${balanceFormatted} USDC (${balanceWei} wei)`)
              
              // Clean up callback
              this.balanceCallbacks.delete(walletId)
              
              resolve({
                balance: balanceFormatted,
                balanceWei: balanceWei,
                symbol: 'USDC',
                decimals: decimals
              })
            } else {
              console.log('💰 No USDC balance found, returning zero')
              
              // Clean up callback
              this.balanceCallbacks.delete(walletId)
              
              resolve({
                balance: '0.000000',
                balanceWei: '0',
                symbol: 'USDC',
                decimals: 6
              })
            }
          } catch (error) {
            console.error('❌ Error processing balance callback:', error)
            if (progressInterval) {
              clearInterval(progressInterval)
            }
            this.balanceCallbacks.delete(walletId)
            reject(error)
          }
        })
        
        // Show progress every 10 seconds
        progressInterval = setInterval(() => {
          const elapsedTime = Math.round((Date.now() - startTime) / 1000)
          const remainingTime = Math.round((300000 - (Date.now() - startTime)) / 1000)
          console.log(`⏳ Still waiting for balance update... (${elapsedTime}s elapsed, ${remainingTime}s remaining)`)
        }, 10000)
        
        // Trigger balance refresh
        refreshBalances(networkName, [walletId])
          .then(() => {
            console.log('✅ Balance refresh triggered successfully')
            console.log('🔍 Waiting for merkletree scan to complete...')
          })
          .catch((error: any) => {
            console.error('❌ Failed to trigger balance refresh:', error)
            if (progressInterval) {
              clearInterval(progressInterval)
            }
            this.balanceCallbacks.delete(walletId)
            reject(error)
          })
        
        // Set a timeout to avoid hanging forever
        setTimeout(() => {
          if (this.balanceCallbacks.has(walletId)) {
            if (progressInterval) {
              clearInterval(progressInterval)
            }
            this.balanceCallbacks.delete(walletId)
            reject(new Error('Balance refresh timeout after 5 minutes'))
          }
        }, 300000) // 5 minutes = 300,000 milliseconds
      })
    } catch (error) {
      console.error('❌ Failed to fetch Railgun USDC balance:', error)
      throw new Error(`Failed to fetch USDC balance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Set up Railgun balance callbacks
  private setupBalanceCallbacks(): void {
    if (!setOnBalanceUpdateCallback || !setOnUTXOMerkletreeScanCallback || !setOnTXIDMerkletreeScanCallback) {
      console.warn('⚠️ Balance callback functions not available')
      return
    }

    console.log('🔄 Setting up Railgun balance callbacks...')

    // Balance update callback - called when balances are updated
    const onBalanceUpdateCallback = (balancesEvent: any) => {
      console.log('💰 Balance update received:', balancesEvent)
      
      const { railgunWalletID, erc20Amounts, chain } = balancesEvent
      
      // Store the latest balances
      this.latestBalances.set(railgunWalletID, {
        erc20Amounts,
        chain,
        lastUpdated: new Date().toISOString()
      })
      
      // Notify any waiting callbacks
      const callback = this.balanceCallbacks.get(railgunWalletID)
      if (callback) {
        callback(balancesEvent)
      }
    }

    // Merkletree scan callbacks for progress updates
    const onUTXOMerkletreeScanCallback = (eventData: any) => {
      console.log('🔍 UTXO Merkletree scan progress:', {
        chain: eventData.chain?.type || 'Unknown',
        scanStatus: eventData.scanStatus,
        progress: eventData.progress,
        total: eventData.total,
        current: eventData.current,
        percentage: eventData.total > 0 ? Math.round((eventData.current / eventData.total) * 100) : 0
      })
      
      if (eventData.scanStatus === 'Complete') {
        console.log('✅ UTXO Merkletree scan completed!')
      } else if (eventData.scanStatus === 'Started') {
        console.log('🚀 UTXO Merkletree scan started...')
      }
    }

    const onTXIDMerkletreeScanCallback = (eventData: any) => {
      console.log('🔍 TXID Merkletree scan progress:', {
        chain: eventData.chain?.type || 'Unknown',
        scanStatus: eventData.scanStatus,
        progress: eventData.progress,
        total: eventData.total,
        current: eventData.current,
        percentage: eventData.total > 0 ? Math.round((eventData.current / eventData.total) * 100) : 0
      })
      
      if (eventData.scanStatus === 'Complete') {
        console.log('✅ TXID Merkletree scan completed!')
      } else if (eventData.scanStatus === 'Started') {
        console.log('🚀 TXID Merkletree scan started...')
      }
    }

    // Set the callbacks
    setOnBalanceUpdateCallback(onBalanceUpdateCallback)
    setOnUTXOMerkletreeScanCallback(onUTXOMerkletreeScanCallback)
    setOnTXIDMerkletreeScanCallback(onTXIDMerkletreeScanCallback)

    console.log('✅ Railgun balance callbacks set up successfully')
  }
}

// Export singleton instance
export const walletManager = RailgunWalletManager.getInstance()

// Utility function to download wallet backup
export async function downloadWalletBackup(wallet: ShadowPayWallet, password: string): Promise<void> {
  const manager = RailgunWalletManager.getInstance()
  const backup = await manager.exportWallet(wallet.id, password)
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${wallet.name.replace(/[^a-zA-Z0-9]/g, '_')}_backup.spb1`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
} 