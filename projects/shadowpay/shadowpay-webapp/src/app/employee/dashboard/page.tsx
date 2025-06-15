'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Wallet,
  ArrowUpRight, 
  Copy, 
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmployeeHeader } from '@/components/EmployeeHeader'
import { AztecWalletDisplay } from '@/components/AztecWalletDisplay'

import { useAccount } from '@nemi-fi/wallet-sdk/react'
import { aztecSdk } from '@/lib/aztec'

function EmployeeDashboardClient({ isConnected, onWithdraw }: { isConnected: boolean, onWithdraw: any }) {
  const [balance, setBalance] = useState('1,250.00');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    const success = await onWithdraw(withdrawAddress, withdrawAmount);
    setWithdrawStatus(success ? 'success' : 'error');
    if (success) {
        setBalance(prev => (parseFloat(prev.replace(/,/g, '')) - parseFloat(withdrawAmount)).toLocaleString('en-US', { minimumFractionDigits: 2 }));
    }
    setIsWithdrawing(false);
  }

  if (!isConnected) {
  return (
        <div className="text-center mt-20">
            <Wallet className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">
                Please connect your Aztec wallet using the button in the header to view your dashboard.
          </p>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500/30 text-white p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Private Balance</h3>
          </div>
                <p className="text-4xl font-bold mb-1">{balance} <span className="text-2xl text-blue-200">sUSDC</span></p>
                <p className="text-blue-200">Your shielded USDC ready for withdrawal.</p>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 p-6">
                 <div className="flex items-center space-x-3 mb-4">
                    <ArrowUpRight className="h-6 w-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Withdraw to Sepolia</h3>
          </div>
                <div className="space-y-4">
                     <Input 
                        placeholder="Amount (e.g., 100)"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="bg-gray-900 border-gray-600 text-white"
                     />
                     <Input 
                        placeholder="Sepolia Address (0x...)" 
                        value={withdrawAddress}
                        onChange={e => setWithdrawAddress(e.target.value)}
                        className="bg-gray-900 border-gray-600 text-white"
                    />
                     <Button onClick={handleWithdraw} disabled={isWithdrawing} className="w-full bg-green-600 hover:bg-green-700">
                        {isWithdrawing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                        Burn Tokens & Withdraw
                    </Button>
          </div>
            </Card>
        </div>
        </div>
  )
}

export default function EmployeeDashboard() {
    const sdkAccount = useAccount(aztecSdk);
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
        if (sdkAccount) {
            setIsConnected(true);
            setAddress(sdkAccount.address.toString() ?? null);
        } else {
            setIsConnected(false);
            setAddress(null);
        }
    }, [sdkAccount]);

    const connect = async () => {
        setIsConnecting(true);
        try {
            await aztecSdk.connect('azguard');
            // After connection, the `useAccount` hook will update,
            // which will trigger our `useEffect` to update the state.
        } catch (e) {
            console.error("Connection failed:", e);
        } finally {
            setIsConnecting(false);
        }
    }
    
    const disconnect = () => {
        aztecSdk.disconnect();
        setIsConnected(false);
        setAddress(null);
        
        // Remove the specific localStorage keys used by the AzGuard wallet.
        localStorage.removeItem('azguard:session:default');
        localStorage.removeItem('aztec-wallet-current-connector-uuid');

        console.log("Disconnected and cleared AzGuard session data.");
    }

    const handleWithdraw = async (to: string, amount: string) => {
        console.log(`Withdrawing ${amount} tokens to ${to} for account ${address}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return Math.random() > 0.2;
  }

  return (
    <div className="dark min-h-screen bg-black">
            <EmployeeHeader 
                isConnected={isConnected}
                isConnecting={isConnecting}
                address={address}
                connect={connect}
                disconnect={disconnect}
            />

            <div className="container mx-auto px-4 py-6 max-w-4xl pt-12">
                <EmployeeDashboardClient 
                    isConnected={isConnected}
                    onWithdraw={handleWithdraw}
                />
      </div>
    </div>
  )
} 