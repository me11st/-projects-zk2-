'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Users, Zap, FileCheck, X } from "lucide-react"
import Link from "next/link"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

export default function SignInPage() {
  const [selectedRole, setSelectedRole] = useState<'employer' | 'employee' | 'auditor' | null>(null)

  return (
    <div className="dark min-h-screen bg-black">
      <div className="relative">
        <div className="absolute top-6 right-6 z-10">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 backdrop-blur-md transition-all duration-300"
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <section className="container mx-auto px-6 py-16 pt-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Choose Your</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Role</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select your role to access the appropriate ShadowPay portal
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Employer Card */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 hover:from-green-500/20 hover:via-emerald-500/10 hover:to-teal-500/20 border border-green-400/20 hover:border-green-400/40 p-8 text-center shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Employer</h3>
              <div className="h-16 flex items-center justify-center mb-8">
                <p className="text-gray-400 text-center">Manage payroll, run secure payments, and maintain employee privacy</p>
              </div>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  const ready = mounted
                  const connected = ready && account && chain

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button 
                              onClick={() => {
                                setSelectedRole('employer')
                                openConnectModal()
                              }}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              Continue as Employer
                            </Button>
                          )
                        }

                        return (
                          <Button 
                            onClick={() => {
                              console.log('Connected as employer:', account.address)
                            }}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Enter Employer Portal
                          </Button>
                        )
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-indigo-500/10 hover:from-blue-500/20 hover:via-cyan-500/10 hover:to-indigo-500/20 border border-blue-400/20 hover:border-blue-400/40 p-8 text-center shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Employee</h3>
              <div className="h-16 flex items-center justify-center mb-8">
                <p className="text-gray-400 text-center">Access your private salary, scan for payments, and generate income proofs</p>
              </div>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  const ready = mounted
                  const connected = ready && account && chain

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button 
                              onClick={() => {
                                setSelectedRole('employee')
                                openConnectModal()
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              Continue as Employee
                            </Button>
                          )
                        }

                        return (
                          <Button 
                            onClick={() => {
                              console.log('Connected as employee:', account.address)
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Enter Employee Portal
                          </Button>
                        )
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            </Card>

            {/* Auditor Card */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-fuchsia-500/10 hover:from-purple-500/20 hover:via-violet-500/10 hover:to-fuchsia-500/20 border border-purple-400/20 hover:border-purple-400/40 p-8 text-center shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileCheck className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Auditor</h3>
              <div className="h-16 flex items-center justify-center mb-8">
                <p className="text-gray-400 text-center">Verify compliance, validate proofs, and ensure regulatory adherence</p>
              </div>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  const ready = mounted
                  const connected = ready && account && chain

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button 
                              onClick={() => {
                                setSelectedRole('auditor')
                                openConnectModal()
                              }}
                              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              Continue as Auditor
                            </Button>
                          )
                        }

                        return (
                          <Button 
                            onClick={() => {
                              console.log('Connected as auditor:', account.address)
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Enter Auditor Portal
                          </Button>
                        )
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            </Card>
          </div>


        </section>
      </div>
    </div>
  )
} 