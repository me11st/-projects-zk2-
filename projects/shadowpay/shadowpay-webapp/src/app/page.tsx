import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, FileCheck, Users, Zap, Lock, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="dark min-h-screen bg-black">
      <div className="relative">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="bg-gray-800 rounded-xl px-5 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-7 w-7 text-white" />
            <span className="text-xl font-bold text-white">ShadowPay</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#problem" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Problem</a>
            <a href="#solution" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Solution</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">About</a>
            <Button className="bg-white text-black hover:bg-gray-100 px-5 py-1.5 font-semibold text-sm">Open App</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-8 bg-gray-900 text-gray-300 border border-gray-700">
          🚀 &nbsp; Proper Crypto Payroll
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Get Them Paid. Keep It Private.
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-400 font-normal mb-8">
          Payroll that feels like a banking app but speaks blockchain
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
          Employees see funds; onlookers see nothing but a checkmark <CheckCircle className="inline h-6 w-6 text-green-400" />
        </p>
        <div className="flex justify-center mb-20">
          <Button size="lg" className="text-lg px-10 py-4 bg-white text-black hover:bg-gray-100 font-semibold">
            <Zap className="mr-2 h-5 w-5" />
            Open App
          </Button>
        </div>

      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            The Problem with Crypto Payroll
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Traditional crypto payments expose sensitive salary data on public blockchains
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-red-950/20 to-red-900/10 rounded-2xl border border-red-900/30 p-8">
          <div className="flex items-center mb-8">
            <div className="bg-red-500/20 p-3 rounded-full mr-4">
              <Eye className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Everyone Can See Your Payroll</h3>
              <p className="text-red-300/80">The transparency problem with public blockchains</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="bg-orange-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Workplace Tension</h4>
              <p className="text-gray-400 text-sm">Colleagues discover salary differences, causing internal conflicts</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Legal Compliance</h4>
              <p className="text-gray-400 text-sm">GDPR and privacy regulations require salary confidentiality</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Competitive Intelligence</h4>
              <p className="text-gray-400 text-sm">Competitors analyze your compensation strategy and talent costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Our Solution: Privacy-First Payroll
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Bundle, encrypt, and verify payments while maintaining complete privacy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                <Lock className="mr-2 h-6 w-6" />
                Bundle & Encrypt
              </CardTitle>
              <CardDescription>
                Combine entire payroll into one private transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Secure hardware enclaves process payments privately, sending to one-time addresses only employees can access.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800 dark:text-green-200">
                <Shield className="mr-2 h-6 w-6" />
                Prove Compliance
              </CardTitle>
              <CardDescription>
                Mathematical proofs without revealing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Zero-knowledge proofs verify total amounts and legal compliance while keeping individual salaries private.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800 dark:text-purple-200">
                <Users className="mr-2 h-6 w-6" />
                Simple Experience
              </CardTitle>
              <CardDescription>
                Easy for HR, employees, and auditors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Upload CSV, scan for payments, verify proofs - all with intuitive interfaces that hide complexity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* User Types Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Three Portals, One Solution
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Role-specific interfaces that make privacy-preserving payroll effortless
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">👩‍💼</div>
              <CardTitle>HR Staff</CardTitle>
              <CardDescription>Drag, drop, done</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Upload salary spreadsheet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Click "Run Payroll"</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Get secure vault confirmation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Celebrate with confetti! 🎉</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">👨‍💻</div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Scan, view, withdraw</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Open mobile-friendly wallet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Tap "Scan for salary"</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">See private payment amount</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Generate income proofs</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">🔍</div>
              <CardTitle>Auditors</CardTitle>
              <CardDescription>Paste, verify, confirm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Paste proof code</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Instant verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">See compliance confirmation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">No individual salary exposure</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span className="text-xl font-bold text-slate-100">ShadowPay</span>
          </div>
          <p className="text-slate-400">
            Privacy-first crypto payroll for the modern workplace
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}
