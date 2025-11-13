"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Calendar, 
  DollarSign, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function WorkerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workerData, setWorkerData] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "WORKER") {
      router.push("/auth/signin")
      return
    }

    // Fetch worker data
    fetchWorkerData()
  }, [session, status, router])

  const fetchWorkerData = async () => {
    try {
      const response = await fetch("/api/worker/profile")
      if (response.ok) {
        const data = await response.json()
        setWorkerData(data)
      }
    } catch (error) {
      console.error("Error fetching worker data:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!workerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading worker data...</div>
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
              <h1 className="text-xl font-semibold text-gray-900">Worker Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={workerData.avatar} />
                  <AvatarFallback>
                    {workerData.firstName?.[0]}{workerData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {workerData.firstName} {workerData.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Worker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  Almost complete
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Currently working
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹15,000</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">
                  Based on 12 reviews
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">My Jobs</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest updates and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New job application received</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Payment received from Mr. Sharma</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Profile verification in progress</p>
                          <p className="text-xs text-gray-500">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks you can perform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Browse Available Jobs
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <User className="mr-2 h-4 w-4" />
                      Update Profile
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Clock className="mr-2 h-4 w-4" />
                      Mark Attendance
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="mr-2 h-4 w-4" />
                      View Payment History
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="jobs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Jobs</CardTitle>
                    <CardDescription>Your current employment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">House Maid - Part Time</h4>
                            <p className="text-sm text-gray-600">Mrs. Sharma - Andheri, Mumbai</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary">Active</Badge>
                              <Badge variant="outline">Part Time</Badge>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Salary:</span>
                            <span className="font-medium">₹8,000/month</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Working Days:</span>
                            <span>Mon, Wed, Fri</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Jobs you've applied for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Full Time Housekeeper</h4>
                            <p className="text-sm text-gray-600">Mr. Patel - Bandra, Mumbai</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">Under Review</Badge>
                            </div>
                          </div>
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Applied:</span>
                            <span>2 days ago</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Salary:</span>
                            <span className="font-medium">₹12,000/month</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal and professional details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="w-24 text-gray-500">Name:</span>
                          <span>{workerData.firstName} {workerData.lastName}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Age:</span>
                          <span>{workerData.age} years</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Gender:</span>
                          <span>{workerData.gender}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Phone:</span>
                          <span>{workerData.user?.phone}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Email:</span>
                          <span>{workerData.user?.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Professional Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="w-24 text-gray-500">Experience:</span>
                          <span>{workerData.experience} years</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Hourly Rate:</span>
                          <span>₹{workerData.hourlyRate}/hour</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Available:</span>
                          <span>{workerData.isAvailable ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Location:</span>
                          <span>{workerData.city}, {workerData.state}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button>Update Profile</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Your verification documents and certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">ID Proof</h4>
                        <Badge variant={workerData.documents?.idProof?.verified ? "default" : "secondary"}>
                          {workerData.documents?.idProof?.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Aadhaar Card</p>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        View
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Address Proof</h4>
                        <Badge variant={workerData.documents?.addressProof?.verified ? "default" : "secondary"}>
                          {workerData.documents?.addressProof?.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Utility Bill</p>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        View
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Police Verification</h4>
                        <Badge variant={workerData.documents?.policeVerification?.verified ? "default" : "secondary"}>
                          {workerData.documents?.policeVerification?.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Police Clearance</p>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button>Upload New Document</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Your earnings and payment records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Monthly Salary - March 2024</h4>
                          <p className="text-sm text-gray-600">Mrs. Sharma - House Maid</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹8,000</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Bonus - Diwali 2023</h4>
                          <p className="text-sm text-gray-600">Mr. Patel - Housekeeper</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹2,000</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Earnings (Last 3 months)</p>
                        <p className="text-2xl font-bold">₹26,000</p>
                      </div>
                      <Button>Download Statement</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}