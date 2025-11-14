"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { AnalyticsService } from "@/lib/analytics-dashboard"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Star,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Target,
  Activity,
  Briefcase,
  MapPin
} from "lucide-react"

interface AnalyticsDashboardProps {
  userId?: string
  userRole?: 'WORKER' | 'EMPLOYER' | 'AGENCY' | 'ADMIN'
  dateRange?: {
    start: Date
    end: Date
  }
  showComparison?: boolean
}

interface DashboardMetrics {
  overview: {
    totalUsers: number
    activeUsers: number
    totalJobs: number
    completedJobs: number
    totalRevenue: number
    averageRating: number
  }
  trends: {
    userGrowth: Array<{ date: string; users: number }>
    jobCompletion: Array<{ date: string; completed: number; created: number }>
    revenue: Array<{ date: string; revenue: number }>
    ratings: Array<{ date: string; rating: number }>
  }
  demographics: {
    usersByRole: Array<{ role: string; count: number; percentage: number }>
    servicesPopularity: Array<{ service: string; count: number; percentage: number }>
    locations: Array<{ location: string; count: number; percentage: number }>
  }
  performance: {
    completionRate: number
    averageResponseTime: number
    customerSatisfaction: number
    retentionRate: number
  }
  kpis: Array<{
    name: string
    value: number
    previousValue?: number
    target: number
    unit: string
    trend: 'up' | 'down' | 'stable'
    color: string
  }>
}

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
]

const DATE_RANGES = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last year', value: '1y' }
]

export default function AnalyticsDashboard({
  userId,
  userRole = 'ADMIN',
  dateRange,
  showComparison = false
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['overview'])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  const analyticsService = new AnalyticsService()

  useEffect(() => {
    loadDashboardData()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [selectedPeriod, userId, userRole, autoRefresh])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Calculate date range based on selected period
      const endDate = new Date()
      let startDate = new Date()
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '3m':
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const data = await analyticsService.getDashboardMetrics(
        userId || 'admin',
        { startDate, endDate }
      )
      
      setMetrics(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set mock data for demonstration
      setMetrics(getMockMetrics())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockMetrics = (): DashboardMetrics => ({
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalJobs: 3456,
      completedJobs: 2987,
      totalRevenue: 247890,
      averageRating: 4.3
    },
    trends: {
      userGrowth: [
        { date: '2025-01', users: 980 },
        { date: '2025-02', users: 1050 },
        { date: '2025-03', users: 1120 },
        { date: '2025-04', users: 1180 },
        { date: '2025-05', users: 1247 }
      ],
      jobCompletion: [
        { date: '2025-01', completed: 450, created: 500 },
        { date: '2025-02', completed: 520, created: 580 },
        { date: '2025-03', completed: 610, created: 650 },
        { date: '2025-04', completed: 680, created: 720 },
        { date: '2025-05', completed: 727, created: 750 }
      ],
      revenue: [
        { date: '2025-01', revenue: 45000 },
        { date: '2025-02', revenue: 52000 },
        { date: '2025-03', revenue: 61000 },
        { date: '2025-04', revenue: 68000 },
        { date: '2025-05', revenue: 74890 }
      ],
      ratings: [
        { date: '2025-01', rating: 4.1 },
        { date: '2025-02', rating: 4.2 },
        { date: '2025-03', rating: 4.2 },
        { date: '2025-04', rating: 4.3 },
        { date: '2025-05', rating: 4.3 }
      ]
    },
    demographics: {
      usersByRole: [
        { role: 'Workers', count: 687, percentage: 55.1 },
        { role: 'Employers', count: 423, percentage: 33.9 },
        { role: 'Agencies', count: 137, percentage: 11.0 }
      ],
      servicesPopularity: [
        { service: 'House Cleaning', count: 1156, percentage: 42.3 },
        { service: 'Childcare', count: 689, percentage: 25.2 },
        { service: 'Cooking', count: 456, percentage: 16.7 },
        { service: 'Elderly Care', count: 312, percentage: 11.4 },
        { service: 'Pet Care', count: 123, percentage: 4.4 }
      ],
      locations: [
        { location: 'Mumbai', count: 456, percentage: 36.6 },
        { location: 'Delhi', count: 312, percentage: 25.0 },
        { location: 'Bangalore', count: 234, percentage: 18.8 },
        { location: 'Pune', count: 156, percentage: 12.5 },
        { location: 'Others', count: 89, percentage: 7.1 }
      ]
    },
    performance: {
      completionRate: 86.4,
      averageResponseTime: 2.3,
      customerSatisfaction: 4.3,
      retentionRate: 78.9
    },
    kpis: [
      {
        name: 'Active Users',
        value: 892,
        previousValue: 856,
        target: 1000,
        unit: '',
        trend: 'up',
        color: '#10b981'
      },
      {
        name: 'Monthly Revenue',
        value: 74890,
        previousValue: 68000,
        target: 80000,
        unit: '₹',
        trend: 'up',
        color: '#3b82f6'
      },
      {
        name: 'Job Completion Rate',
        value: 86.4,
        previousValue: 84.2,
        target: 90,
        unit: '%',
        trend: 'up',
        color: '#f59e0b'
      },
      {
        name: 'Average Rating',
        value: 4.3,
        previousValue: 4.2,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        color: '#8b5cf6'
      }
    ]
  })

  const exportData = async (format: 'csv' | 'pdf') => {
    try {
      if (!metrics) return
      
      const exportData = {
        overview: metrics.overview,
        kpis: metrics.kpis,
        trends: metrics.trends,
        exportDate: new Date().toISOString(),
        period: selectedPeriod,
        userRole
      }
      
      // In a real implementation, this would call the analytics service
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.${format}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (isLoading && !metrics) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading analytics dashboard...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.kpis.map((kpi, index) => {
          const progress = (kpi.value / kpi.target) * 100
          const isPositive = kpi.trend === 'up'
          const changePercent = kpi.previousValue 
            ? ((kpi.value - kpi.previousValue) / kpi.previousValue * 100).toFixed(1)
            : null
          
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(kpi.trend)}
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold">
                      {kpi.unit === '₹' ? formatCurrency(kpi.value) : kpi.value}
                    </div>
                    {changePercent && (
                      <span className={`text-sm ${getTrendColor(kpi.trend)}`}>
                        {isPositive ? '+' : ''}{changePercent}%
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {kpi.unit === '₹' ? formatCurrency(kpi.target) : kpi.target}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <div 
                className="absolute bottom-0 left-0 right-0 h-1" 
                style={{ backgroundColor: kpi.color }}
              />
            </Card>
          )
        })}
      </div>

      <Tabs value={selectedMetrics[0]} onValueChange={(value) => setSelectedMetrics([value])}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="font-semibold">{metrics.overview.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="font-semibold text-green-600">{metrics.overview.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activity Rate</span>
                  <Badge variant="secondary">
                    {((metrics.overview.activeUsers / metrics.overview.totalUsers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Job Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Jobs</span>
                  <span className="font-semibold">{metrics.overview.totalJobs.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-semibold text-green-600">{metrics.overview.completedJobs.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <Badge variant="secondary">
                    {((metrics.overview.completedJobs / metrics.overview.totalJobs) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Revenue Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-semibold">{formatCurrency(metrics.overview.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg. Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{metrics.overview.averageRating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Per Job</span>
                  <span className="font-semibold">
                    {formatCurrency(metrics.overview.totalRevenue / metrics.overview.completedJobs)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.trends.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Users']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Job Completion Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Job Creation vs Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.trends.jobCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        value, 
                        name === 'created' ? 'Created Jobs' : 'Completed Jobs'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="created" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.trends.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ratings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Average Rating Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.trends.ratings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[3.5, 5]} />
                    <Tooltip 
                      formatter={(value) => [Number(value).toFixed(1), 'Rating']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users by Role */}
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.demographics.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, percentage }) => `${role} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.demographics.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Services Popularity */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.demographics.servicesPopularity} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="service" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.demographics.locations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ location, percentage }) => `${location} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.demographics.locations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Job Completion Rate</span>
                    <span className="text-sm text-gray-600">{metrics.performance.completionRate}%</span>
                  </div>
                  <Progress value={metrics.performance.completionRate} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-gray-600">{metrics.performance.customerSatisfaction}/5</span>
                  </div>
                  <Progress value={(metrics.performance.customerSatisfaction / 5) * 100} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Retention Rate</span>
                    <span className="text-sm text-gray-600">{metrics.performance.retentionRate}%</span>
                  </div>
                  <Progress value={metrics.performance.retentionRate} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg. Response Time</span>
                    <span className="text-sm text-gray-600">{metrics.performance.averageResponseTime}hrs</span>
                  </div>
                  <Progress value={100 - (metrics.performance.averageResponseTime / 24 * 100)} />
                </div>
              </CardContent>
            </Card>

            {/* Performance Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.performance.completionRate < 85 && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Low Completion Rate</p>
                      <p className="text-xs text-red-600">Job completion rate is below target (85%)</p>
                    </div>
                  </div>
                )}

                {metrics.performance.averageResponseTime > 4 && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Slow Response Times</p>
                      <p className="text-xs text-yellow-600">Average response time exceeds 4 hours</p>
                    </div>
                  </div>
                )}

                {metrics.performance.customerSatisfaction >= 4.0 && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">High Satisfaction</p>
                      <p className="text-xs text-green-600">Customer satisfaction is excellent</p>
                    </div>
                  </div>
                )}

                {metrics.performance.retentionRate >= 75 && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
                    <Target className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Good Retention</p>
                      <p className="text-xs text-green-600">User retention rate exceeds target</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}