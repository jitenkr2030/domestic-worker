"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DollarSign, 
  CreditCard, 
  Building, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  Eye
} from "lucide-react"

interface Payment {
  id: string
  amount: number
  currency: string
  type: string
  description?: string
  status: string
  dueDate: string
  paidAt?: string
  paymentMethod?: string
  transactionId?: string
  contract: {
    id: string
    job: {
      title: string
      employer: {
        firstName: string
        lastName: string
      }
    }
    worker: {
      firstName: string
      lastName: string
      user: {
        name: string
        email: string
        avatar?: string
      }
    }
  }
}

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    contractId: "",
    amount: "",
    type: "SALARY",
    description: "",
    paymentMethod: "BANK_TRANSFER"
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchPayments()
  }, [session, status, router])

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments")
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentForm)
      })

      if (response.ok) {
        alert("Payment processed successfully!")
        setShowPaymentForm(false)
        setPaymentForm({
          contractId: "",
          amount: "",
          type: "SALARY",
          description: "",
          paymentMethod: "BANK_TRANSFER"
        })
        fetchPayments()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to process payment")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Failed to process payment. Please try again.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case "BANK_TRANSFER":
        return <Building className="w-4 h-4" />
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CreditCard className="w-4 h-4" />
      case "UPI":
      case "WALLET":
        return <Smartphone className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const totalEarnings = payments
    .filter(p => p.status === "COMPLETED")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const pendingPayments = payments.filter(p => p.status === "PENDING")
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.dueDate)
    const currentDate = new Date()
    return paymentDate.getMonth() === currentDate.getMonth() && 
           paymentDate.getFullYear() === currentDate.getFullYear()
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Payment Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user.role === "EMPLOYER" && (
                <Button onClick={() => setShowPaymentForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Make Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Payment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{thisMonthPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {thisMonthPayments.length} payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.length > 0 
                    ? Math.round((payments.filter(p => p.status === "COMPLETED").length / payments.length) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment success
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form Modal */}
          {showPaymentForm && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Make a Payment</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractId">Contract</Label>
                      <Select onValueChange={(value) => setPaymentForm(prev => ({ ...prev, contractId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set(payments.map(p => p.contract))).map(contract => (
                            <SelectItem key={contract.id} value={contract.id}>
                              {contract.job.title} - {contract.worker.firstName} {contract.worker.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 15000"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Payment Type</Label>
                      <Select onValueChange={(value) => setPaymentForm(prev => ({ ...prev, type: value }))} defaultValue="SALARY">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SALARY">Salary</SelectItem>
                          <SelectItem value="BONUS">Bonus</SelectItem>
                          <SelectItem value="TIP">Tip</SelectItem>
                          <SelectItem value="COMMISSION">Commission</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))} defaultValue="BANK_TRANSFER">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                          <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                          <SelectItem value="WALLET">Digital Wallet</SelectItem>
                          <SelectItem value="CASH">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="e.g., March salary payment"
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Process Payment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <div>
                              <h4 className="font-medium">{payment.type}</h4>
                              <p className="text-sm text-gray-600">
                                {payment.contract.job.title} • {payment.contract.worker.firstName} {payment.contract.worker.lastName}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold">₹{payment.amount.toLocaleString()}</span>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {payment.paidAt 
                              ? `Paid on ${new Date(payment.paidAt).toLocaleDateString()}`
                              : `Due on ${new Date(payment.dueDate).toLocaleDateString()}`
                            }
                          </div>
                        </div>
                      </div>
                      
                      {payment.description && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">{payment.description}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Method: {payment.paymentMethod?.replace('_', ' ')}</span>
                          {payment.transactionId && (
                            <span>Transaction ID: {payment.transactionId}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                          {payment.status === "PENDING" && session?.user.role === "WORKER" && (
                            <Button size="sm">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Confirm Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <Card key={payment.id} className="border-yellow-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <div>
                              <h4 className="font-medium">{payment.type}</h4>
                              <p className="text-sm text-gray-600">
                                {payment.contract.job.title} • {payment.contract.worker.firstName} {payment.contract.worker.lastName}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold">₹{payment.amount.toLocaleString()}</span>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Due on {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Awaiting processing by payment gateway
                        </div>
                        <div className="flex space-x-2">
                          {session?.user.role === "EMPLOYER" && (
                            <Button size="sm" variant="outline">
                              Cancel Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              <div className="space-y-4">
                {payments.filter(p => p.status === "COMPLETED").map((payment) => (
                  <Card key={payment.id} className="border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <h4 className="font-medium">{payment.type}</h4>
                              <p className="text-sm text-gray-600">
                                {payment.contract.job.title} • {payment.contract.worker.firstName} {payment.contract.worker.lastName}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-green-600">₹{payment.amount.toLocaleString()}</span>
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Paid on {new Date(payment.paidAt!).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Payment completed successfully via {payment.paymentMethod?.replace('_', ' ')}
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-3 w-3" />
                            Download Receipt
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="failed" className="space-y-4">
              <div className="space-y-4">
                {payments.filter(p => p.status === "FAILED").map((payment) => (
                  <Card key={payment.id} className="border-red-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <div>
                              <h4 className="font-medium">{payment.type}</h4>
                              <p className="text-sm text-gray-600">
                                {payment.contract.job.title} • {payment.contract.worker.firstName} {payment.contract.worker.lastName}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold">₹{payment.amount.toLocaleString()}</span>
                            <Badge className="bg-red-100 text-red-800">
                              Failed
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Failed on {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Payment failed. Please try again or contact support.
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm">
                              Retry Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}