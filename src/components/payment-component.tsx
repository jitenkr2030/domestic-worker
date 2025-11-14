"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CurrencyService } from "@/lib/multi-currency"
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowUpDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  TrendingUp,
  Calculator,
  History,
  Settings,
  Eye,
  EyeOff
} from "lucide-react"

interface PaymentComponentProps {
  userId: string
  userRole?: 'WORKER' | 'EMPLOYER' | 'AGENCY' | 'ADMIN'
  defaultCurrency?: string
  showConverter?: boolean
  showHistory?: boolean
  showAnalytics?: boolean
}

interface PaymentTransaction {
  id: string
  type: 'payment' | 'transfer' | 'withdrawal' | 'deposit'
  amount: number
  currency: string
  convertedAmount?: number
  convertedCurrency?: string
  exchangeRate: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description: string
  recipientId?: string
  senderId?: string
  timestamp: Date
  fees: {
    amount: number
    currency: string
    type: 'processing' | 'currency_conversion' | 'platform'
  }
  metadata: Record<string, any>
}

interface CurrencyRate {
  code: string
  name: string
  symbol: string
  rate: number
  change24h: number
  lastUpdated: Date
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', flag: '🇷🇸' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' }
]

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: 0.029 },
  { id: 'bank', name: 'Bank Transfer', icon: Banknote, fee: 0.015 },
  { id: 'digital_wallet', name: 'Digital Wallet', icon: Smartphone, fee: 0.025 },
  { id: 'crypto', name: 'Cryptocurrency', icon: DollarSign, fee: 0.001 }
]

export default function PaymentComponent({
  userId,
  userRole = 'EMPLOYER',
  defaultCurrency = 'USD',
  showConverter = true,
  showHistory = true,
  showAnalytics = true
}: PaymentComponentProps) {
  const [currentBalance, setCurrentBalance] = useState<Record<string, number>>({})
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency)
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionCurrency, setTransactionCurrency] = useState(defaultCurrency)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [exchangeRates, setExchangeRates] = useState<Record<string, CurrencyRate>>({})
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConverter, setShowConverterState] = useState(showConverter)
  const [conversionAmount, setConversionAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState(defaultCurrency)
  const [toCurrency, setToCurrency] = useState('EUR')
  const [convertedAmount, setConvertedAmount] = useState('')
  const [showAmounts, setShowAmounts] = useState(false)
  
  const currencyService = new CurrencyService()

  useEffect(() => {
    loadPaymentData()
  }, [userId])

  const loadPaymentData = async () => {
    try {
      setIsLoading(true)
      
      // Load balance, transactions, and exchange rates
      const [balanceData, transactionsData, ratesData] = await Promise.all([
        currencyService.getUserBalance(userId),
        currencyService.getTransactionHistory(userId),
        currencyService.getExchangeRates(defaultCurrency)
      ])
      
      setCurrentBalance(balanceData)
      setTransactions(transactionsData)
      setExchangeRates(ratesData)
    } catch (error) {
      console.error('Error loading payment data:', error)
      // Set mock data for demonstration
      setCurrentBalance({ USD: 1250.50, EUR: 875.30, INR: 45000, GBP: 650.75 })
      setTransactions(getMockTransactions())
      setExchangeRates(getMockExchangeRates())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockTransactions = (): PaymentTransaction[] => [
    {
      id: '1',
      type: 'payment',
      amount: 150.00,
      currency: 'USD',
      convertedAmount: 139.50,
      convertedCurrency: 'EUR',
      exchangeRate: 0.93,
      status: 'completed',
      description: 'House cleaning service',
      recipientId: 'worker1',
      timestamp: new Date(Date.now() - 86400000),
      fees: {
        amount: 4.50,
        currency: 'USD',
        type: 'processing'
      },
      metadata: { serviceType: 'house_cleaning' }
    },
    {
      id: '2',
      type: 'transfer',
      amount: 250.00,
      currency: 'EUR',
      status: 'pending',
      description: 'Monthly childcare payment',
      recipientId: 'worker2',
      timestamp: new Date(Date.now() - 3600000),
      fees: {
        amount: 3.75,
        currency: 'EUR',
        type: 'currency_conversion'
      },
      metadata: { serviceType: 'childcare' }
    }
  ]

  const getMockExchangeRates = (): Record<string, CurrencyRate> => {
    const rates: Record<string, CurrencyRate> = {}
    CURRENCIES.forEach(currency => {
      rates[currency.code] = {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        rate: Math.random() * 2 + 0.1, // Random rate
        change24h: (Math.random() - 0.5) * 0.1, // Random change
        lastUpdated: new Date()
      }
    })
    return rates
  }

  const convertCurrency = async (amount: number, from: string, to: string) => {
    try {
      const result = await currencyService.convertCurrency(amount, from, to)
      return result
    } catch (error) {
      console.error('Error converting currency:', error)
      // Mock conversion for demonstration
      const mockRate = exchangeRates[to]?.rate || 1
      return amount * mockRate
    }
  }

  const processPayment = async () => {
    try {
      setIsProcessing(true)
      const amount = parseFloat(transactionAmount)
      const fromRate = exchangeRates[transactionCurrency]?.rate || 1
      const toRate = exchangeRates[selectedCurrency]?.rate || 1
      
      let finalAmount = amount
      let finalCurrency = transactionCurrency
      let exchangeRate = 1

      if (transactionCurrency !== selectedCurrency) {
        // Convert to target currency
        finalAmount = await convertCurrency(amount, transactionCurrency, selectedCurrency)
        exchangeRate = fromRate / toRate
      }

      const newTransaction: PaymentTransaction = {
        id: `tx_${Date.now()}`,
        type: 'payment',
        amount: finalAmount,
        currency: selectedCurrency,
        convertedAmount: transactionCurrency !== selectedCurrency ? amount : undefined,
        convertedCurrency: transactionCurrency !== selectedCurrency ? transactionCurrency : undefined,
        exchangeRate,
        status: 'pending',
        description: `Payment via ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}`,
        timestamp: new Date(),
        fees: {
          amount: finalAmount * (PAYMENT_METHODS.find(m => m.id === paymentMethod)?.fee || 0),
          currency: selectedCurrency,
          type: 'processing'
        },
        metadata: { paymentMethod, userRole }
      }

      // Simulate payment processing
      setTimeout(() => {
        setTransactions(prev => [newTransaction, ...prev])
        setCurrentBalance(prev => ({
          ...prev,
          [selectedCurrency]: (prev[selectedCurrency] || 0) - finalAmount - newTransaction.fees.amount
        }))
        setIsProcessing(false)
      }, 2000)

    } catch (error) {
      console.error('Error processing payment:', error)
      setIsProcessing(false)
    }
  }

  const handleConversion = async () => {
    try {
      const amount = parseFloat(conversionAmount)
      if (amount && fromCurrency && toCurrency) {
        const converted = await convertCurrency(amount, fromCurrency, toCurrency)
        setConvertedAmount(converted.toFixed(2))
      }
    } catch (error) {
      console.error('Error converting currency:', error)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency)
    const symbol = currencyInfo?.symbol || currency
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
    return `${symbol} ${formatted}`
  }

  const getStatusIcon = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTotalBalanceUSD = () => {
    let total = 0
    Object.entries(currentBalance).forEach(([currency, amount]) => {
      const rate = exchangeRates[currency]?.rate || 1
      total += amount * rate
    })
    return total
  }

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading payment data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <DollarSign className="h-6 w-6" />
            <span>Multi-Currency Payments</span>
          </h2>
          <Badge variant="secondary">
            {Object.keys(currentBalance).length} currencies
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAmounts(!showAmounts)}
          >
            {showAmounts ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {showAmounts ? 'Hide' : 'Show'} Amounts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPaymentData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payment Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentBalance).map(([currency, amount]) => (
                  <div key={currency} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {CURRENCIES.find(c => c.code === currency)?.flag || '🏳️'}
                        </span>
                        <span className="font-medium">{currency}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCurrency(currency)}
                        className={selectedCurrency === currency ? 'bg-blue-50' : ''}
                      >
                        {selectedCurrency === currency ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                    <div className="text-2xl font-bold">
                      {showAmounts ? formatCurrency(amount, currency) : '••••••'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {showAmounts && `≈ ${formatCurrency(amount * (exchangeRates[currency]?.rate || 1), 'USD')}`}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Balance (USD)</span>
                  <span className="text-xl font-bold">
                    {showAmounts ? formatCurrency(getTotalBalanceUSD(), 'USD') : '••••••'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Make Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={transactionCurrency} onValueChange={setTransactionCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.slice(0, 10).map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center space-x-2">
                            <span>{currency.flag}</span>
                            <span>{currency.code}</span>
                            <span className="text-gray-500">{currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PAYMENT_METHODS.map((method) => (
                    <Button
                      key={method.id}
                      variant={paymentMethod === method.id ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method.id)}
                      className="justify-start"
                      disabled={isProcessing}
                    >
                      <method.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="text-sm">{method.name}</div>
                        <div className="text-xs text-gray-500">Fee: {(method.fee * 100).toFixed(1)}%</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{showAmounts && transactionAmount ? formatCurrency(parseFloat(transactionAmount), transactionCurrency) : '••••••'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span>{showAmounts && transactionAmount ? 
                      formatCurrency(parseFloat(transactionAmount) * (PAYMENT_METHODS.find(m => m.id === paymentMethod)?.fee || 0), transactionCurrency) 
                      : '••••••'}</span>
                  </div>
                  {transactionCurrency !== selectedCurrency && (
                    <div className="flex justify-between">
                      <span>Exchange Rate:</span>
                      <span>
                        1 {transactionCurrency} = {(exchangeRates[selectedCurrency]?.rate / exchangeRates[transactionCurrency]?.rate).toFixed(4)} {selectedCurrency}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{showAmounts && transactionAmount ? 
                      formatCurrency(
                        parseFloat(transactionAmount) * (1 + (PAYMENT_METHODS.find(m => m.id === paymentMethod)?.fee || 0)),
                        transactionCurrency
                      ) 
                      : '••••••'}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={processPayment}
                disabled={!transactionAmount || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Exchange Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Exchange Rates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(exchangeRates).slice(0, 12).map(([currency, rate]) => (
                  <div key={currency} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span>{CURRENCIES.find(c => c.code === currency)?.flag || '🏳️'}</span>
                        <span className="font-medium">{currency}</span>
                      </div>
                      <Badge variant={rate.change24h >= 0 ? "default" : "destructive"}>
                        {rate.change24h >= 0 ? '+' : ''}{(rate.change24h * 100).toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="text-lg font-bold">
                      {rate.rate.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated {rate.lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Currency Converter */}
          {showConverter && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Currency Converter</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConverterState(!showConverter)}
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {showConverter && (
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">From</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={conversionAmount}
                        onChange={(e) => setConversionAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.slice(0, 10).map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const temp = fromCurrency
                        setFromCurrency(toCurrency)
                        setToCurrency(temp)
                      }}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <Label className="text-xs">To</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Converted"
                        value={convertedAmount}
                        readOnly
                        className="flex-1"
                      />
                      <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.slice(0, 10).map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleConversion}
                    disabled={!conversionAmount}
                  >
                    Convert
                  </Button>
                </CardContent>
              )}
            </Card>
          )}

          {/* Recent Transactions */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        <span className="text-sm font-medium">{transaction.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {showAmounts ? formatCurrency(transaction.amount, transaction.currency) : '••••••'}
                        </div>
                        {transaction.convertedAmount && (
                          <div className="text-xs text-gray-500">
                            {showAmounts ? formatCurrency(transaction.convertedAmount, transaction.convertedCurrency!) : '••••••'}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{transaction.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {transaction.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Banknote className="h-4 w-4 mr-2" />
                Add Money
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Exchange Currency
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                View All Transactions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Payment Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}