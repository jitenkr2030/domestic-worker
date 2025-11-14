"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LocationService } from "@/lib/gps-location"
import { 
  MapPin, 
  Navigation, 
  Target, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Map,
  Maximize,
  Minimize,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Route,
  History,
  Shield,
  Eye,
  EyeOff
} from "lucide-react"

interface LocationMapProps {
  userId: string
  userRole?: 'WORKER' | 'EMPLOYER' | 'AGENCY' | 'ADMIN'
  showTracking?: boolean
  showGeofencing?: boolean
  showRoutes?: boolean
  allowRealTime?: boolean
  center?: { lat: number; lng: number }
  zoom?: number
}

interface Location {
  id: string
  userId: string
  userName: string
  userRole: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
  speed?: number
  heading?: number
  address?: string
  isOnline: boolean
  avatar?: string
}

interface Geofence {
  id: string
  name: string
  description?: string
  center: { lat: number; lng: number }
  radius: number // in meters
  type: 'circle' | 'polygon'
  isActive: boolean
  alerts: boolean
  coordinates?: Array<{ lat: number; lng: number }>
}

interface RouteData {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  distance: number
  duration: number
  points: Array<{ lat: number; lng: number; timestamp: Date }>
  status: 'active' | 'completed' | 'paused'
}

const MAP_STYLES = [
  { id: 'streets', name: 'Streets', value: 'streets-v11' },
  { id: 'satellite', name: 'Satellite', value: 'satellite-v9' },
  { id: 'hybrid', name: 'Hybrid', value: 'satellite-streets-v11' },
  { id: 'terrain', name: 'Terrain', value: 'outdoors-v11' }
]

const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 } // Mumbai coordinates

export default function LocationMap({
  userId,
  userRole = 'WORKER',
  showTracking = true,
  showGeofencing = true,
  showRoutes = true,
  allowRealTime = true,
  center = DEFAULT_CENTER,
  zoom = 12
}: LocationMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState('streets')
  const [showUserLocations, setShowUserLocations] = useState(true)
  const [showGeofenceAreas, setShowGeofenceAreas] = useState(true)
  const [showRoutesLines, setShowRoutesLines] = useState(true)
  const [isRealTimeTracking, setIsRealTimeTracking] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [geofenceRadius, setGeofenceRadius] = useState([500]) // meters
  const [showSettings, setShowSettings] = useState(false)
  const [mapCenter, setMapCenter] = useState(center)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const locationService = new LocationService()

  useEffect(() => {
    loadLocationData()
    
    let interval: NodeJS.Timeout
    if (isRealTimeTracking) {
      interval = setInterval(loadLocationData, 30000) // Update every 30 seconds
    }
    
    return () => clearInterval(interval)
  }, [isRealTimeTracking])

  const loadLocationData = async () => {
    try {
      setIsLoading(true)
      
      // In real implementation, this would use the location service
      const locationData = await locationService.getUserLocations(userId)
      const geofenceData = await locationService.getGeofences(userId)
      const routeData = await locationService.getRoutes(userId)
      
      setLocations(locationData)
      setGeofences(geofenceData)
      setRoutes(routeData)
      
      // Set current location if available
      const userLocation = locationData.find(loc => loc.userId === userId)
      if (userLocation) {
        setCurrentLocation(userLocation)
        setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude })
      }
    } catch (error) {
      console.error('Error loading location data:', error)
      // Set mock data for demonstration
      setLocations(getMockLocations())
      setGeofences(getMockGeofences())
      setRoutes(getMockRoutes())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockLocations = (): Location[] => [
    {
      id: '1',
      userId: 'worker1',
      userName: 'Sarah Wilson',
      userRole: 'WORKER',
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 5.2,
      timestamp: new Date(),
      speed: 0,
      heading: 0,
      address: 'Marine Drive, Mumbai',
      isOnline: true,
      avatar: undefined
    },
    {
      id: '2',
      userId: 'employer1',
      userName: 'John Johnson',
      userRole: 'EMPLOYER',
      latitude: 19.0785,
      longitude: 72.8785,
      accuracy: 8.1,
      timestamp: new Date(Date.now() - 300000),
      speed: 0,
      heading: 45,
      address: 'Colaba, Mumbai',
      isOnline: false,
      avatar: undefined
    },
    {
      id: '3',
      userId: 'worker2',
      userName: 'Mike Chen',
      userRole: 'WORKER',
      latitude: 19.0748,
      longitude: 72.8765,
      accuracy: 3.7,
      timestamp: new Date(Date.now() - 120000),
      speed: 15.5,
      heading: 180,
      address: 'Breach Candy, Mumbai',
      isOnline: true,
      avatar: undefined
    }
  ]

  const getMockGeofences = (): Geofence[] => [
    {
      id: '1',
      name: 'Office Area',
      description: 'Main office location',
      center: { lat: 19.0760, lng: 72.8777 },
      radius: 200,
      type: 'circle',
      isActive: true,
      alerts: true
    },
    {
      id: '2',
      name: 'Service Zone A',
      description: 'Primary service delivery area',
      center: { lat: 19.0785, lng: 72.8785 },
      radius: 500,
      type: 'circle',
      isActive: true,
      alerts: false
    }
  ]

  const getMockRoutes = (): RouteData[] => [
    {
      id: '1',
      userId: 'worker1',
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      endTime: new Date(Date.now() - 1800000), // 30 minutes ago
      distance: 2.4, // km
      duration: 30, // minutes
      points: [
        { lat: 19.0760, lng: 72.8777, timestamp: new Date(Date.now() - 3600000) },
        { lat: 19.0765, lng: 72.8780, timestamp: new Date(Date.now() - 3000000) },
        { lat: 19.0770, lng: 72.8783, timestamp: new Date(Date.now() - 2400000) },
        { lat: 19.0775, lng: 72.8786, timestamp: new Date(Date.now() - 1800000) }
      ],
      status: 'completed'
    }
  ]

  const createGeofence = async (geofenceData: Partial<Geofence>) => {
    try {
      const newGeofence: Geofence = {
        id: `gf_${Date.now()}`,
        name: geofenceData.name || 'New Geofence',
        description: geofenceData.description,
        center: geofenceData.center || mapCenter,
        radius: geofenceRadius[0],
        type: 'circle',
        isActive: true,
        alerts: true
      }

      // In real implementation, this would use the location service
      // await locationService.createGeofence(newGeofence)
      
      setGeofences(prev => [...prev, newGeofence])
    } catch (error) {
      console.error('Error creating geofence:', error)
    }
  }

  const startRouteTracking = async () => {
    try {
      const newRoute: RouteData = {
        id: `route_${Date.now()}`,
        userId,
        startTime: new Date(),
        distance: 0,
        duration: 0,
        points: [],
        status: 'active'
      }

      // In real implementation, this would start route tracking
      setRoutes(prev => [...prev, newRoute])
    } catch (error) {
      console.error('Error starting route tracking:', error)
    }
  }

  const stopRouteTracking = async (routeId: string) => {
    try {
      // In real implementation, this would stop route tracking and calculate final stats
      const route = routes.find(r => r.id === routeId)
      if (route) {
        const updatedRoute = {
          ...route,
          endTime: new Date(),
          status: 'completed' as const
        }
        setRoutes(prev => prev.map(r => r.id === routeId ? updatedRoute : r))
      }
    } catch (error) {
      console.error('Error stopping route tracking:', error)
    }
  }

  const getFilteredLocations = () => {
    let filtered = locations

    if (userFilter !== 'all') {
      filtered = filtered.filter(loc => loc.userRole.toLowerCase() === userFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(loc =>
        loc.userName.toLowerCase().includes(query) ||
        loc.address?.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const getLocationColor = (location: Location) => {
    switch (location.userRole) {
      case 'WORKER': return location.isOnline ? '#10b981' : '#6b7280'
      case 'EMPLOYER': return location.isOnline ? '#3b82f6' : '#6b7280'
      case 'AGENCY': return location.isOnline ? '#f59e0b' : '#6b7280'
      default: return '#6b7280'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return 'Just now'
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading map...</p>
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
            <MapPin className="h-6 w-6" />
            <span>Location Tracking</span>
          </h2>
          <Badge variant="secondary">
            {getFilteredLocations().length} users tracked
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={mapStyle} onValueChange={setMapStyle}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAP_STYLES.map(style => (
                <SelectItem key={style.id} value={style.value}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRealTimeTracking(!isRealTimeTracking)}
            className={isRealTimeTracking ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRealTimeTracking ? 'animate-spin' : ''}`} />
            Live
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="h-96">
            <CardContent className="p-0 h-full relative">
              {/* Map placeholder - in real implementation, use Google Maps, Mapbox, or similar */}
              <div 
                ref={mapRef}
                className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
                              linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
                              linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Map className="h-16 w-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-600">Interactive Map</p>
                      <p className="text-sm text-gray-500">
                        Map integration with {getFilteredLocations().length} user locations
                      </p>
                    </div>
                    {currentLocation && (
                      <div className="text-sm text-gray-500">
                        <p>Current: {currentLocation.userName}</p>
                        <p>{currentLocation.address}</p>
                        <p>Updated: {formatTimeAgo(currentLocation.timestamp)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mock location markers */}
                {showUserLocations && getFilteredLocations().map((location) => (
                  <div
                    key={location.id}
                    className="absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-2 -translate-y-2 hover:scale-125 transition-transform"
                    style={{
                      left: `${30 + (location.longitude - mapCenter.lng) * 1000}%`,
                      top: `${40 - (location.latitude - mapCenter.lat) * 1000}%`,
                      backgroundColor: getLocationColor(location)
                    }}
                    onClick={() => setSelectedLocation(location)}
                    title={location.userName}
                  >
                    {location.isOnline && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                ))}
                
                {/* Mock geofence circles */}
                {showGeofenceAreas && geofences.filter(g => g.isActive).map((geofence) => (
                  <div
                    key={geofence.id}
                    className="absolute border-2 border-dashed border-blue-400 rounded-full bg-blue-100 bg-opacity-20"
                    style={{
                      left: `${30 + (geofence.center.lng - mapCenter.lng) * 1000}%`,
                      top: `${40 - (geofence.center.lat - mapCenter.lat) * 1000}%`,
                      width: `${geofence.radius / 10}px`,
                      height: `${geofence.radius / 10}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={geofence.name}
                  ></div>
                ))}
                
                {/* Mock route lines */}
                {showRoutesLines && routes.filter(r => r.status === 'active' || r.status === 'completed').map((route) => (
                  <svg
                    key={route.id}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <polyline
                      points={route.points.map((point, index) => 
                        `${30 + (point.lng - mapCenter.lng) * 1000},${40 - (point.lat - mapCenter.lat) * 1000}`
                      ).join(' ')}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeDasharray={route.status === 'completed' ? 'none' : '5,5'}
                    />
                  </svg>
                ))}
              </div>
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserLocations(!showUserLocations)}
                  className="w-full"
                >
                  {showUserLocations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGeofenceAreas(!showGeofenceAreas)}
                  className="w-full"
                >
                  <Target className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoutesLines(!showRoutesLines)}
                  className="w-full"
                >
                  <Route className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Search Users</Label>
                <Input
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">User Type</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="worker">Workers</SelectItem>
                    <SelectItem value="employer">Employers</SelectItem>
                    <SelectItem value="agency">Agencies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Active Locations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">User Locations</CardTitle>
                <Badge variant="secondary">
                  {getFilteredLocations().filter(loc => loc.isOnline).length} online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {getFilteredLocations().map((location) => (
                <div
                  key={location.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedLocation?.id === location.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: getLocationColor(location) }}
                      >
                        {location.userName.charAt(0)}
                      </div>
                      {location.isOnline && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{location.userName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {location.userRole}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{location.address}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(location.timestamp)}</span>
                        </div>
                        <span>±{location.accuracy}m</span>
                      </div>
                      {location.speed && location.speed > 0 && (
                        <p className="text-xs text-gray-500">
                          Moving at {location.speed.toFixed(1)} km/h
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Route Tracking */}
          {showRoutes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Route Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {routes.filter(r => r.status === 'active').length === 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={startRouteTracking}
                  >
                    <Route className="h-4 w-4 mr-2" />
                    Start Tracking
                  </Button>
                ) : (
                  routes.filter(r => r.status === 'active').map((route) => (
                    <div key={route.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="default">Active</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => stopRouteTracking(route.id)}
                        >
                          Stop
                        </Button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Distance:</span>
                          <span>{route.distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{Math.floor((Date.now() - route.startTime.getTime()) / 60000)} min</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {routes.filter(r => r.status === 'completed').length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Recent Routes</Label>
                    {routes.filter(r => r.status === 'completed').slice(0, 3).map((route) => (
                      <div key={route.id} className="p-2 border rounded text-xs">
                        <div className="flex justify-between mb-1">
                          <span>{route.distance.toFixed(1)} km</span>
                          <span>{Math.floor(route.duration / 60)}h {route.duration % 60}m</span>
                        </div>
                        <p className="text-gray-500">{route.startTime.toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                <Target className="h-4 w-4 mr-2" />
                Add Geofence
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                Location History
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location Details Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Location Details</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
                  style={{ backgroundColor: getLocationColor(selectedLocation) }}
                >
                  {selectedLocation.userName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedLocation.userName}</h3>
                  <Badge variant="outline">{selectedLocation.userRole}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Current Location</Label>
                    <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Coordinates</Label>
                    <p className="text-sm text-gray-600">
                      {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Accuracy</Label>
                    <p className="text-sm text-gray-600">±{selectedLocation.accuracy} meters</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-gray-600">
                      {selectedLocation.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedLocation.speed && (
                    <div>
                      <Label className="text-sm font-medium">Speed</Label>
                      <p className="text-sm text-gray-600">{selectedLocation.speed.toFixed(1)} km/h</p>
                    </div>
                  )}
                  
                  {selectedLocation.heading && (
                    <div>
                      <Label className="text-sm font-medium">Direction</Label>
                      <p className="text-sm text-gray-600">{selectedLocation.heading}°</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${selectedLocation.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-sm text-gray-600">
                        {selectedLocation.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Location Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Real-time Tracking</Label>
                <Switch
                  checked={isRealTimeTracking}
                  onCheckedChange={setIsRealTimeTracking}
                />
              </div>
              <p className="text-xs text-gray-500">
                Automatically update locations every 30 seconds
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Default Geofence Radius</Label>
              <div className="space-y-2">
                <Slider
                  value={geofenceRadius}
                  onValueChange={setGeofenceRadius}
                  max={1000}
                  min={50}
                  step={50}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>50m</span>
                  <span>{geofenceRadius[0]}m</span>
                  <span>1000m</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show User Locations</Label>
                <Switch
                  checked={showUserLocations}
                  onCheckedChange={setShowUserLocations}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Geofence Areas</Label>
                <Switch
                  checked={showGeofenceAreas}
                  onCheckedChange={setShowGeofenceAreas}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Route Lines</Label>
                <Switch
                  checked={showRoutesLines}
                  onCheckedChange={setShowRoutesLines}
                />
              </div>
            </div>

            <Button className="w-full" onClick={() => setShowSettings(false)}>
              Apply Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}