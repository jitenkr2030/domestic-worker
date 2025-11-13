"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Users,
  QrCode,
  Smartphone
} from "lucide-react"

interface AttendanceRecord {
  id: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: string
  notes?: string
  contract: {
    id: string
    job: {
      title: string
      employer: {
        firstName: string
        lastName: string
      }
    }
  }
}

export default function AttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchAttendance()
    getCurrentLocation()
  }, [session, status, router])

  const fetchAttendance = async () => {
    try {
      const response = await fetch("/api/attendance")
      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    }
  }

  const handleCheckIn = async () => {
    if (!currentLocation) {
      alert("Please enable location services to check in")
      return
    }

    setCheckingIn(true)
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      })

      if (response.ok) {
        alert("Checked in successfully!")
        fetchAttendance()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to check in")
      }
    } catch (error) {
      console.error("Error checking in:", error)
      alert("Failed to check in. Please try again.")
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!currentLocation) {
      alert("Please enable location services to check out")
      return
    }

    setCheckingOut(true)
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      })

      if (response.ok) {
        alert("Checked out successfully!")
        fetchAttendance()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to check out")
      }
    } catch (error) {
      console.error("Error checking out:", error)
      alert("Failed to check out. Please try again.")
    } finally {
      setCheckingOut(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800"
      case "ABSENT":
        return "bg-red-100 text-red-800"
      case "LATE":
        return "bg-yellow-100 text-yellow-800"
      case "EARLY_LEAVE":
        return "bg-orange-100 text-orange-800"
      case "HOLIDAY":
        return "bg-blue-100 text-blue-800"
      case "SICK_LEAVE":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const todayAttendance = attendance.find(record => {
    const recordDate = new Date(record.date).toDateString()
    const today = new Date().toDateString()
    return recordDate === today
  })

  const thisMonthAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date)
    const currentDate = new Date()
    return recordDate.getMonth() === currentDate.getMonth() && 
           recordDate.getFullYear() === currentDate.getFullYear()
  })

  const presentDays = thisMonthAttendance.filter(record => record.status === "PRESENT").length
  const lateDays = thisMonthAttendance.filter(record => record.status === "LATE").length
  const absentDays = thisMonthAttendance.filter(record => record.status === "ABSENT").length

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
              <h1 className="text-xl font-semibold text-gray-900">Attendance Tracking</h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentLocation && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  Location Enabled
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Today's Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Today's Attendance
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  {todayAttendance?.checkInTime ? (
                    <div className="space-y-2">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="font-medium">Checked In</p>
                      <p className="text-sm text-gray-600">{todayAttendance.checkInTime}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        size="lg" 
                        className="w-full"
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                      >
                        {checkingIn ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Checking In...
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Check In
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-600">Click to check in for today</p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  {todayAttendance?.checkOutTime ? (
                    <div className="space-y-2">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-medium">Checked Out</p>
                      <p className="text-sm text-gray-600">{todayAttendance.checkOutTime}</p>
                    </div>
                  ) : todayAttendance?.checkInTime ? (
                    <div className="space-y-2">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full"
                        onClick={handleCheckOut}
                        disabled={checkingOut}
                      >
                        {checkingOut ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Checking Out...
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Check Out
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-600">Click to check out for today</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-medium">Not Started</p>
                      <p className="text-sm text-gray-600">Check in first</p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="font-medium">Status</p>
                    {todayAttendance ? (
                      <Badge className={getStatusColor(todayAttendance.status)}>
                        {todayAttendance.status.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                </div>
              </div>

              {currentLocation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Location services enabled. Your attendance will be tracked with GPS coordinates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{presentDays}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Days</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lateDays}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{absentDays}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {thisMonthAttendance.length > 0 
                    ? Math.round((presentDays / thisMonthAttendance.length) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History */}
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="methods">Check-in Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Calendar</CardTitle>
                  <CardDescription>View your attendance history for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="font-medium text-sm py-2">{day}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date()
                      date.setDate(1) // Set to first day of month
                      date.setDate(i - date.getDay() + 1) // Adjust for calendar start
                      
                      const attendanceRecord = attendance.find(record => {
                        const recordDate = new Date(record.date)
                        return recordDate.toDateString() === date.toDateString()
                      })
                      
                      const isCurrentMonth = date.getMonth() === new Date().getMonth()
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <div
                          key={i}
                          className={`
                            p-2 rounded-lg border min-h-[60px] flex flex-col items-center justify-center
                            ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                            ${isToday ? 'ring-2 ring-blue-500' : ''}
                          `}
                        >
                          <div className="text-sm font-medium">{date.getDate()}</div>
                          {attendanceRecord && (
                            <div className={`w-2 h-2 rounded-full mt-1 ${
                              attendanceRecord.status === 'PRESENT' ? 'bg-green-500' :
                              attendanceRecord.status === 'LATE' ? 'bg-yellow-500' :
                              attendanceRecord.status === 'ABSENT' ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Detailed view of your attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendance.slice(0, 10).map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-center">
                              <div className="text-lg font-medium">
                                {new Date(record.date).getDate()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">{record.contract.job.title}</h4>
                              <p className="text-sm text-gray-600">
                                {record.contract.job.employer.firstName} {record.contract.job.employer.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(record.status)}>
                              {record.status.replace('_', ' ')}
                            </Badge>
                            <div className="text-sm text-gray-600 mt-1">
                              {record.checkInTime && `In: ${record.checkInTime}`}
                              {record.checkOutTime && ` • Out: ${record.checkOutTime}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="methods" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Smartphone className="mr-2 h-5 w-5" />
                      GPS Check-in/out
                    </CardTitle>
                    <CardDescription>
                      Use your device's GPS for accurate location tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">High accuracy location tracking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Automatic time stamps</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Geofencing support</span>
                      </div>
                      <Button className="w-full" onClick={getCurrentLocation}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Refresh Location
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <QrCode className="mr-2 h-5 w-5" />
                      QR Code Check-in
                    </CardTitle>
                    <CardDescription>
                      Scan QR codes at workplace for quick check-in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Fast and convenient</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">No GPS required</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Employer-provided QR codes</span>
                      </div>
                      <Button variant="outline" className="w-full">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}