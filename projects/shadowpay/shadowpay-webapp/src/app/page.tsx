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
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-1.5 font-semibold text-sm">Open App</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex pt-30 pb-30 justify-center">
        <div className="container mx-auto px-6 text-center">
        <Badge className="mb-8 px-4 py-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-200 border border-blue-700/30">
          🚀 &nbsp; Proper Crypto Payroll
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="text-white">Get Them Paid.</span>{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Keep It Private.</span>
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-400 font-normal mb-12">
          Payroll that feels like a banking app but speaks blockchain
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            <Zap className="mr-2 h-5 w-5" />
            Open App
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-10 py-4 border-gray-600 text-gray-300 hover:bg-gray-900 hover:text-white transition-all duration-200">
            <FileCheck className="mr-2 h-5 w-5" />
            Learn More
          </Button>
        </div>
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
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <Eye className="h-6 w-6 text-red-400 mr-3" />
            <h3 className="text-2xl font-bold text-white">Everyone Can See Your Payroll</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-red-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-3">Workplace Tension</h4>
              <p className="text-gray-400 leading-relaxed">Colleagues discover salary differences, causing internal conflicts and damaging team dynamics</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-yellow-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-3">Legal Compliance</h4>
              <p className="text-gray-400 leading-relaxed">GDPR and privacy regulations require strict salary confidentiality protection</p>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-3">Competitive Intelligence</h4>
              <p className="text-gray-400 leading-relaxed">Competitors analyze your compensation strategy and talent acquisition costs</p>
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
