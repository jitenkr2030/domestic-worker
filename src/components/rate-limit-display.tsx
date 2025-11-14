"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RateLimiter } from "@/lib/rate-limit"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Settings,
  RefreshCw,
  BarChart3,
  Info
} from "lucide-react"

interface RateLimitDisplayProps {
  userId?: string
  apiKey?: string
  showAllEndpoints?: boolean
  showHistory?: boolean
  realTime?: boolean
}

interface RateLimitStatus {
  endpoint: string
  method: string
  limit: number
  remaining: number
  resetTime: Date
  windowMs: number
  requests: number
  percentage: number
  status: 'safe' | 'warning' | 'critical' | 'exceeded'
}

interface EndpointStats {
  endpoint: string
  method: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  peakUsage: number
  usage24h: number
}

const API_ENDPOINTS = [
  { path: '/api/auth/login', method: 'POST', limit: 5, window: 300000 },
  { path: '/api/auth/register', method: 'POST', limit: 3, window: 600000 },
  { path: '/api/jobs/search', method: 'GET', limit: 100, window: 3600000 },
  { path: '/api/jobs/create', method: 'POST', limit: 10, window: 3600000 },
  { path: '/api/messages/send', method: 'POST', limit: 50, window: 3600000 },
  { path: '/api/payments/process', method: 'POST', limit: 20, window: 3600000 },
  { path: '/api/notifications/send', method: 'POST', limit: 1000, window: 3600000 },
  { path: '/api/analytics/dashboard', method: 'GET', limit: 200, window: 3600000 },
  { path: '/api/location/track', method: 'POST', limit: 500, window: 3600000 },
  { path: '/api/calendar/sync', method: 'POST', limit: 50, window: 3600000 }
]

export default function RateLimitDisplay({
  userId,
  apiKey,
  showAllEndpoints = true,
  showHistory = true,
  realTime = true
}: RateLimitDisplayProps) {
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([])
  const [endpointStats, setEndpointStats] = useState<EndpointStats[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy')
  
  const rateLimiter = new RateLimiter()

  useEffect(() => {
    loadRateLimitData()
    
    let interval: NodeJS.Timeout
    if (realTime) {
      interval = setInterval(loadRateLimitData, 10000) // Update every 10 seconds
    }
    
    return () => clearInterval(interval)
  }, [userId, apiKey, realTime])

  const loadRateLimitData = async () => {
    try {
      setIsLoading(true)
      
      // In real implementation, this would use the rate limiter
      const limits = await rateLimiter.getCurrentLimits(userId || 'default', apiKey)
      const stats = await rateLimiter.getEndpointStats(userId || 'default')
      
      setRateLimits(limits)
      setEndpointStats(stats)
      
      // Calculate overall health
      const avgPercentage = limits.reduce((sum, limit) => sum + limit.percentage, 0) / limits.length
      if (avgPercentage >= 90) {
        setOverallHealth('critical')
      } else if (avgPercentage >= 70) {
        setOverallHealth('warning')
      } else {
        setOverallHealth('healthy')
      }
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading rate limit data:', error)
      // Set mock data for demonstration
      setRateLimits(getMockRateLimits())
      setEndpointStats(getMockEndpointStats())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockRateLimits = (): RateLimitStatus[] => [
    {
      endpoint: '/api/auth/login',
      method: 'POST',
      limit: 5,
      remaining: 3,
      resetTime: new Date(Date.now() + 180000), // 3 minutes
      windowMs: 300000,
      requests: 2,
      percentage: 40,
      status: 'safe'
    },
    {
      endpoint: '/api/jobs/search',
      method: 'GET',
      limit: 100,
      remaining: 23,
      resetTime: new Date(Date.now() + 3540000), // 59 minutes
      windowMs: 3600000,
      requests: 77,
      percentage: 77,
      status: 'warning'
    },
    {
      endpoint: '/api/messages/send',
      method: 'POST',
      limit: 50,
      remaining: 8,
      resetTime: new Date(Date.now() + 3580000),
      windowMs: 3600000,
      requests: 42,
      percentage: 84,
      status: 'warning'
    },
    {
      endpoint: '/api/payments/process',
      method: 'POST',
      limit: 20,
      remaining: 18,
      resetTime: new Date(Date.now() + 3595000),
      windowMs: 3600000,
      requests: 2,
      percentage: 10,
      status: 'safe'
    },
    {
      endpoint: '/api/notifications/send',
      method: 'POST',
      limit: 1000,
      remaining: 156,
      resetTime: new Date(Date.now() + 3590000),
      windowMs: 3600000,
      requests: 844,
      percentage: 84,
      status: 'warning'
    }
  ]

  const getMockEndpointStats = (): EndpointStats[] => [
    {
      endpoint: '/api/auth/login',
      method: 'POST',
      totalRequests: 1245,
      successfulRequests: 1238,
      failedRequests: 7,
      averageResponseTime: 120,
      peakUsage: 5,
      usage24h: 89
    },
    {
      endpoint: '/api/jobs/search',
      method: 'GET',
      totalRequests: 5678,
      successfulRequests: 5645,
      failedRequests: 33,
      averageResponseTime: 250,
      peakUsage: 95,
      usage24h: 1234
    },
    {
      endpoint: '/api/messages/send',
      method: 'POST',
      totalRequests: 8901,
      successfulRequests: 8876,
      failedRequests: 25,
      averageResponseTime: 180,
      peakUsage: 42,
      usage24h: 567
    }
  ]

  const getStatusColor = (status: RateLimitStatus['status']) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'exceeded': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getStatusIcon = (status: RateLimitStatus['status']) => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'exceeded': return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const formatTimeRemaining = (resetTime: Date) => {
    const now = new Date()
    const diff = resetTime.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const resetEndpoint = async (endpoint: string, method: string) => {
    try {
      await rateLimiter.resetLimit(userId || 'default', endpoint, method)
      await loadRateLimitData()
    } catch (error) {
      console.error('Error resetting endpoint:', error)
    }
  }

  const getFilteredEndpoints = () => {
    if (selectedEndpoint === 'all') return rateLimits
    return rateLimits.filter(limit => 
      `${limit.method} ${limit.endpoint}` === selectedEndpoint
    )
  }

  if (isLoading && rateLimits.length === 0) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading rate limit data...</p>
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
            <Shield className="h-6 w-6" />
            <span>API Rate Limits</span>
          </h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getHealthColor(overallHealth)}`}>
            {getHealthIcon(overallHealth)}
            <span className="text-sm font-medium capitalize">{overallHealth}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {rateLimits.filter(l => l.status === 'safe').length} endpoints safe
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRateLimitData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Rate Limit Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rateLimits.length}</div>
                <p className="text-xs text-muted-foreground">
                  {rateLimits.filter(l => l.status === 'safe').length} within limits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests (24h)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {endpointStats.reduce((sum, stat) => sum + stat.totalRequests, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((endpointStats.reduce((sum, stat) => sum + stat.successfulRequests, 0) / 
                     endpointStats.reduce((sum, stat) => sum + stat.totalRequests, 0)) * 100).toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatResponseTime(
                    endpointStats.reduce((sum, stat) => sum + stat.averageResponseTime, 0) / 
                    endpointStats.length
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all endpoints
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rate Limit Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rate Limit Status</CardTitle>
                <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Endpoints</SelectItem>
                    {rateLimits.map((limit) => (
                      <SelectItem key={`${limit.method} ${limit.endpoint}`} value={`${limit.method} ${limit.endpoint}`}>
                        {limit.method} {limit.endpoint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {getFilteredEndpoints().map((limit) => (
                <div key={`${limit.method} ${limit.endpoint}`} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {limit.method}
                        </Badge>
                        <span className="font-mono text-sm">{limit.endpoint}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(limit.status)}
                        <Badge variant="outline" className={getStatusColor(limit.status)}>
                          {limit.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetEndpoint(limit.endpoint, limit.method)}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Requests</p>
                      <p className="text-sm font-medium">
                        {limit.requests} / {limit.limit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="text-sm font-medium">{limit.remaining}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reset in</p>
                      <p className="text-sm font-medium">{formatTimeRemaining(limit.resetTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Usage</p>
                      <p className="text-sm font-medium">{limit.percentage}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress 
                      value={limit.percentage} 
                      className={`h-2 ${
                        limit.percentage >= 90 ? 'bg-red-100' :
                        limit.percentage >= 70 ? 'bg-yellow-100' : 'bg-green-100'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Window: {Math.floor(limit.windowMs / 60000)} minutes</span>
                      <span>
                        Reset: {limit.resetTime.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {limit.status === 'exceeded' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">
                        Rate limit exceeded. Please wait {formatTimeRemaining(limit.resetTime)} before retrying.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Endpoints within limits</span>
                <span className="font-medium text-green-600">
                  {rateLimits.filter(l => l.status === 'safe').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Endpoints at warning</span>
                <span className="font-medium text-yellow-600">
                  {rateLimits.filter(l => l.status === 'warning').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Endpoints exceeded</span>
                <span className="font-medium text-red-600">
                  {rateLimits.filter(l => l.status === 'exceeded').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Success rate (24h)</span>
                <span className="font-medium text-green-600">
                  {endpointStats.length > 0 ? (
                    ((endpointStats.reduce((sum, stat) => sum + stat.successfulRequests, 0) / 
                      endpointStats.reduce((sum, stat) => sum + stat.totalRequests, 0)) * 100).toFixed(1)
                  ) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Top Endpoints by Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Endpoints (24h)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {endpointStats
                .sort((a, b) => b.usage24h - a.usage24h)
                .slice(0, 5)
                .map((stat) => (
                  <div key={`${stat.method} ${stat.endpoint}`} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{stat.endpoint}</p>
                      <p className="text-xs text-gray-500">{stat.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{stat.usage24h}</p>
                      <p className="text-xs text-gray-500">requests</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Rate Limit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>Rate Limit Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">How it works:</p>
                <ul className="text-xs text-gray-600 space-y-1 mt-1">
                  <li>• Each endpoint has request limits</li>
                  <li>• Limits reset after time windows</li>
                  <li>• Exceeding limits blocks requests</li>
                  <li>• Status updates in real-time</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Status levels:</p>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Safe (0-69%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs">Warning (70-89%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Critical (90-99%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs">Exceeded (100%+)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configure Limits
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Set Alerts
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}