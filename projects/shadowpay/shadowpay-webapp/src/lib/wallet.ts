import CryptoJS from 'crypto-js'
import { Mnemonic, randomBytes } from 'ethers'

// Railgun SDK imports - using dynamic imports to avoid SSR issues
let startRailgunEngine: any = null
let createRailgunWallet: any = null
let loadWalletByID: any = null
let NetworkName: any = null

// Dynamic import function for Railgun SDK
async function loadRailgunSDK() {
  if (typeof window === 'undefined') return false
  
  try {
    const walletModule = await import('@railgun-community/wallet')
    const sharedModule = await import('@railgun-community/shared-models')
    
    startRailgunEngine = walletModule.startRailgunEngine
    createRailgunWallet = walletModule.createRailgunWallet
    loadWalletByID = walletModule.loadWalletByID
    NetworkName = sharedModule.NetworkName
    
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
    if (this.railgunEngineStarted || !this.railgunSDKLoaded) return

    console.log('🚀 Starting Railgun engine...')
    
    try {
      // Import LevelDB for browser
      const LevelDB = (await import('level-js')).default
      
      // Create LevelDOWN compatible database for storing encrypted wallets
      const dbPath = 'shadowpay-railgun-engine.db'
      const db = new LevelDB(dbPath)
      
      // Start Railgun engine with proper database configuration as per documentation
      await startRailgunEngine(
        'ShadowPay', // walletSource - name for wallet implementation (max 16 chars, lowercase)
        db, // LevelDOWN compatible database
        false, // shouldDebug - disable debug to avoid potential issues
        undefined, // artifactStore - we'll implement this later if needed
        false, // useNativeArtifacts - false for browser
        false, // skipMerkletreeScans - MUST be false for wallet functionality
        [], // poiNodeURLs - empty array for now
        [], // customPOILists - empty array
        false, // verboseScanLogging
      )
      
      this.railgunEngineStarted = true
      console.log('✅ Railgun engine started successfully with LevelDB')
    } catch (error) {
      console.error('❌ Failed to start Railgun engine:', error)
      console.error('📋 Engine error details:', {
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Try alternative configuration with different parameters
      console.log('🔄 Trying alternative Railgun engine configuration...')
      try {
        // Import LevelDB for browser
        const LevelDB = (await import('level-js')).default
        
        // Create LevelDOWN compatible database with different name
        const dbPath = 'shadowpay-railgun-alt.db'
        const db = new LevelDB(dbPath)
        
        await startRailgunEngine(
          'shadowpay', // walletSource - lowercase
          db, // LevelDOWN compatible database
          false, // shouldDebug
          undefined, // artifactStore
          false, // useNativeArtifacts
          false, // skipMerkletreeScans
          [], // poiNodeURLs
          [], // customPOILists
          false, // verboseScanLogging
        )
        
        this.railgunEngineStarted = true
        console.log('✅ Railgun engine started with alternative configuration')
      } catch (altError) {
        console.error('❌ Alternative configuration also failed:', altError)
        throw new Error('Failed to initialize Railgun engine with any configuration: ' + (altError instanceof Error ? altError.message : altError))
      }
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
      
      // Generate a proper 32-byte encryption key for Railgun wallet
      // We'll derive it from the password to ensure it's consistent for the same user
      const encryptionKey = CryptoJS.SHA256(password + 'ShadowPay-Salt').toString().substring(0, 64) // 32 bytes as hex string
      
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
          const encryptionKey = CryptoJS.SHA256(password + 'ShadowPay-Salt').toString().substring(0, 64) // 32 bytes as hex string
          
          await loadWalletByID(
            encryptionKey, // 32-byte encryption key (same as creation)
            wallet.railgunWalletID, // walletID
            true, // isViewOnlyWallet
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