"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PWAService } from "@/lib/pwa-service"
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Bell, 
  Wifi,
  WifiOff,
  CheckCircle,
  X,
  Star,
  Shield,
  Zap,
  Settings,
  Info,
  ChevronRight,
  Home,
  Globe,
  Battery,
  HardDrive,
  Clock
} from "lucide-react"

interface PWAInstallationProps {
  showInstallPrompt?: boolean
  autoDetect?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  theme?: 'light' | 'dark' | 'auto'
  showOfflineIndicator?: boolean
  showUpdateNotifications?: boolean
}

interface PWAStatus {
  isInstalled: boolean
  isInstallable: boolean
  isOnline: boolean
  updateAvailable: boolean
  installationProgress: number
  storageUsage: {
    used: number
    total: number
    percentage: number
  }
  serviceWorkerStatus: 'registered' | 'installing' | 'waiting' | 'activating' | 'active' | 'error'
  lastSync: Date | null
}

interface PWAFeatures {
  offlineSupport: boolean
  pushNotifications: boolean
  backgroundSync: boolean
  cameraAccess: boolean
  geolocation: boolean
  storage: boolean
  fullscreen: boolean
  addToHomeScreen: boolean
}

const PWA_FEATURES = [
  {
    key: 'offlineSupport',
    name: 'Offline Support',
    description: 'App works without internet connection',
    icon: WifiOff,
    enabled: false
  },
  {
    key: 'pushNotifications',
    name: 'Push Notifications',
    description: 'Receive real-time notifications',
    icon: Bell,
    enabled: false
  },
  {
    key: 'backgroundSync',
    name: 'Background Sync',
    description: 'Sync data when connection restored',
    icon: Sync,
    enabled: false
  },
  {
    key: 'cameraAccess',
    name: 'Camera Access',
    description: 'Take photos and videos',
    icon: Camera,
    enabled: false
  },
  {
    key: 'geolocation',
    name: 'Location Services',
    description: 'Access your location',
    icon: MapPin,
    enabled: false
  },
  {
    key: 'storage',
    name: 'Offline Storage',
    description: 'Store data locally',
    icon: HardDrive,
    enabled: false
  },
  {
    key: 'fullscreen',
    name: 'Fullscreen Mode',
    description: 'Immersive fullscreen experience',
    icon: Monitor,
    enabled: false
  },
  {
    key: 'addToHomeScreen',
    name: 'Add to Home Screen',
    description: 'Install as native app',
    icon: Download,
    enabled: false
  }
]

export default function PWAInstallation({
  showInstallPrompt = true,
  autoDetect = true,
  position = 'bottom-right',
  theme = 'auto',
  showOfflineIndicator = true,
  showUpdateNotifications = true
}: PWAInstallationProps) {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    installationProgress: 0,
    storageUsage: { used: 0, total: 0, percentage: 0 },
    serviceWorkerStatus: 'installing',
    lastSync: null
  })
  
  const [pwaFeatures, setPwaFeatures] = useState<PWAFeatures>({
    offlineSupport: false,
    pushNotifications: false,
    backgroundSync: false,
    cameraAccess: false,
    geolocation: false,
    storage: false,
    fullscreen: false,
    addToHomeScreen: false
  })
  
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showPWAInfo, setShowPWAInfo] = useState(false)
  const [installPromptDismissed, setInstallPromptDismissed] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState(false)
  
  const pwaService = new PWAService()

  useEffect(() => {
    initializePWA()
    
    // Listen for online/offline events
    const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (showInstallPrompt && autoDetect && pwaStatus.isInstallable && !installPromptDismissed) {
      // Show install prompt after a delay
      const timer = setTimeout(() => {
        setShowInstallDialog(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [pwaStatus.isInstallable, autoDetect, showInstallPrompt, installPromptDismissed])

  const initializePWA = async () => {
    try {
      // Check if app is installed
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true
      
      // Check if app is installable
      const isInstallable = 'serviceWorker' in navigator && 'beforeinstallprompt' in window
      
      // Check service worker status
      const serviceWorkerStatus = await checkServiceWorkerStatus()
      
      // Get storage usage
      const storageUsage = await getStorageUsage()
      
      setPwaStatus(prev => ({
        ...prev,
        isInstalled,
        isInstallable,
        serviceWorkerStatus,
        storageUsage
      }))
      
      // Enable features based on support
      setPwaFeatures(prev => ({
        ...prev,
        offlineSupport: 'serviceWorker' in navigator,
        cameraAccess: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        geolocation: 'geolocation' in navigator,
        storage: 'storage' in navigator,
        fullscreen: 'requestFullscreen' in document.documentElement
      }))
      
    } catch (error) {
      console.error('Error initializing PWA:', error)
    }
  }

  const checkServiceWorkerStatus = async (): Promise<PWAStatus['serviceWorkerStatus']> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        if (registration.installing) return 'installing'
        if (registration.waiting) return 'waiting'
        if (registration.active) return 'active'
      }
    }
    return 'error'
  }

  const getStorageUsage = async (): Promise<PWAStatus['storageUsage']> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage || 0,
          total: estimate.quota || 0,
          percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
        }
      } catch (error) {
        console.error('Error getting storage estimate:', error)
      }
    }
    return { used: 0, total: 0, percentage: 0 }
  }

  const handleInstall = async () => {
    try {
      setPwaStatus(prev => ({ ...prev, installationProgress: 0 }))
      
      // Simulate installation progress
      const progressInterval = setInterval(() => {
        setPwaStatus(prev => {
          const newProgress = Math.min(prev.installationProgress + 10, 90)
          return { ...prev, installationProgress: newProgress }
        })
      }, 200)

      // In real implementation, this would show the install prompt
      // and handle the actual installation
      const installResult = await pwaService.registerServiceWorker()
      
      clearInterval(progressInterval)
      setPwaStatus(prev => ({ 
        ...prev, 
        installationProgress: 100,
        isInstalled: true,
        isInstallable: false
      }))
      
      setTimeout(() => {
        setPwaStatus(prev => ({ ...prev, installationProgress: 0 }))
        setShowInstallDialog(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error installing PWA:', error)
      setPwaStatus(prev => ({ ...prev, installationProgress: 0 }))
    }
  }

  const enableNotifications = async () => {
    try {
      await pwaService.subscribeToPushNotifications('user123')
      setNotificationsEnabled(true)
      setPwaFeatures(prev => ({ ...prev, pushNotifications: true }))
    } catch (error) {
      console.error('Error enabling notifications:', error)
    }
  }

  const enableBackgroundSync = async () => {
    try {
      await pwaService.handleOfflineQueue()
      setBackgroundSyncEnabled(true)
      setPwaFeatures(prev => ({ ...prev, backgroundSync: true }))
    } catch (error) {
      console.error('Error enabling background sync:', error)
    }
  }

  const dismissInstallPrompt = () => {
    setInstallPromptDismissed(true)
    setShowInstallDialog(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: PWAStatus['serviceWorkerStatus']) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'installing': return 'text-blue-600'
      case 'waiting': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status: PWAStatus['serviceWorkerStatus']) => {
    switch (status) {
      case 'active': return 'Active'
      case 'installing': return 'Installing'
      case 'waiting': return 'Update Available'
      case 'activating': return 'Activating'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right': return 'bottom-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
      case 'top-right': return 'top-4 right-4'
      case 'top-left': return 'top-4 left-4'
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default: return 'bottom-4 right-4'
    }
  }

  return (
    <>
      {/* Offline Indicator */}
      {showOfflineIndicator && !pwaStatus.isOnline && (
        <div className={`fixed ${getPositionClasses()} z-50`}>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">You're offline</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && !pwaStatus.isInstalled && pwaStatus.isInstallable && !installPromptDismissed && (
        <div className={`fixed ${getPositionClasses()} z-50`}>
          <Card className="max-w-sm bg-white shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-sm">Install App</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissInstallPrompt}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Install DomesticWorker for a better experience with offline support and push notifications.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setShowInstallDialog(true)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPWAInfo(true)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Install Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Install DomesticWorker</span>
            </DialogTitle>
          </DialogHeader>
          
          {pwaStatus.installationProgress > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-medium">Installing...</div>
                <p className="text-sm text-gray-600">Setting up your app</p>
              </div>
              <Progress value={pwaStatus.installationProgress} className="w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Install as App</h3>
                <p className="text-sm text-gray-600">
                  Get the full app experience with offline support and native features.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Features you'll get:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Works offline</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Push notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Faster loading</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Add to home screen</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={dismissInstallPrompt}
                  className="flex-1"
                >
                  Not Now
                </Button>
                <Button onClick={handleInstall} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      {showUpdateDialog && (
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>App Update Available</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                A new version of the app is available. Update now for the latest features and improvements.
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Later
                </Button>
                <Button className="flex-1">
                  Update Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* PWA Info Dialog */}
      <Dialog open={showPWAInfo} onOpenChange={setShowPWAInfo}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Progressive Web App Features</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Installation</span>
                    </div>
                    <Badge variant={pwaStatus.isInstalled ? "default" : "secondary"}>
                      {pwaStatus.isInstalled ? "Installed" : "Not Installed"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Wifi className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Service Worker</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(pwaStatus.serviceWorkerStatus)}>
                      {getStatusText(pwaStatus.serviceWorkerStatus)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Storage Usage */}
            {pwaStatus.storageUsage.total > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Storage Usage</span>
                  <span className="text-sm text-gray-500">
                    {formatBytes(pwaStatus.storageUsage.used)} / {formatBytes(pwaStatus.storageUsage.total)}
                  </span>
                </div>
                <Progress value={pwaStatus.storageUsage.percentage} className="w-full" />
              </div>
            )}

            {/* Features Grid */}
            <div>
              <h4 className="font-medium mb-3">Available Features</h4>
              <div className="grid grid-cols-2 gap-3">
                {PWA_FEATURES.map((feature) => {
                  const IconComponent = feature.icon
                  return (
                    <div key={feature.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{feature.name}</p>
                        <p className="text-xs text-gray-500">{feature.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {pwaFeatures[feature.key as keyof PWAFeatures] ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Badge variant="outline" className="text-xs">Not Available</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">PWA Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-gray-500">Receive real-time updates</p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={enableNotifications}
                    disabled={!pwaFeatures.pushNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Background Sync</p>
                    <p className="text-xs text-gray-500">Sync when back online</p>
                  </div>
                  <Switch
                    checked={backgroundSyncEnabled}
                    onCheckedChange={enableBackgroundSync}
                    disabled={!pwaFeatures.backgroundSync}
                  />
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">App Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span>
                    {pwaStatus.lastSync ? pwaStatus.lastSync.toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <div className="flex items-center space-x-1">
                    {pwaStatus.isOnline ? (
                      <>
                        <Wifi className="h-3 w-3 text-green-500" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-red-500" />
                        <span>Offline</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}