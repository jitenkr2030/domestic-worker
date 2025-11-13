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
  Home, 
  Users, 
  Briefcase, 
  DollarSign, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"

export default function EmployerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employerData, setEmployerData] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "EMPLOYER") {
      router.push("/auth/signin")
      return
    }

    // Fetch employer data
    fetchEmployerData()
  }, [session, status, router])

  const fetchEmployerData = async () => {
    try {
      const response = await fetch("/api/employer/profile")
      if (response.ok) {
        const data = await response.json()
        setEmployerData(data)
      }
    } catch (error) {
      console.error("Error fetching employer data:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading employer data...</div>
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
              <h1 className="text-xl font-semibold text-gray-900">Employer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={employerData.avatar} />
                  <AvatarFallback>
                    {employerData.firstName?.[0]}{employerData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {employerData.firstName} {employerData.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Employer</p>
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
                <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Currently employed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  2 active, 3 filled
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹35,000</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.6</div>
                <p className="text-xs text-muted-foreground">
                  Average rating
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workers">My Workers</TabsTrigger>
              <TabsTrigger value="jobs">Job Postings</TabsTrigger>
              <TabsTrigger value="household">Household</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New application received for Housekeeper position</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Payment sent to Sunita for March salary</p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Worker attendance marked for today</p>
                          <p className="text-xs text-gray-500">3 hours ago</p>
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
                      <Plus className="mr-2 h-4 w-4" />
                      Post New Job
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Browse Workers
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Home className="mr-2 h-4 w-4" />
                      Update Household Details
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Make Payment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="workers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Workers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Workers</CardTitle>
                    <CardDescription>Workers currently employed by you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>SM</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">Sunita Mishra</h4>
                              <p className="text-sm text-gray-600">House Maid - Full Time</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">Active</Badge>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs ml-1">4.8</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Salary:</span>
                            <span className="font-medium">₹12,000/month</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Working Days:</span>
                            <span>Mon-Fri</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>RK</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">Ramesh Kumar</h4>
                              <p className="text-sm text-gray-600">Driver - Part Time</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">Active</Badge>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs ml-1">4.5</span>
                                </div>
                              </div>
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
                            <span>Tue, Thu, Sat</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Worker Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>New applications for your job postings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>PD</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">Priya Desai</h4>
                              <p className="text-sm text-gray-600">Applied for: Housekeeper</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">New</Badge>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs ml-1">4.7</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Experience:</span>
                            <span>5 years</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Expected Salary:</span>
                            <span>₹15,000/month</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">View Profile</Button>
                          <Button size="sm">Schedule Interview</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="jobs" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Job Postings</h3>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Jobs</CardTitle>
                    <CardDescription>Currently open for applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Full Time Housekeeper</h4>
                            <p className="text-sm text-gray-600">Andheri, Mumbai</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="default">Active</Badge>
                              <Badge variant="outline">5 Applications</Badge>
                            </div>
                          </div>
                          <Briefcase className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Salary:</span>
                            <span className="font-medium">₹15,000/month</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Posted:</span>
                            <span>3 days ago</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">View Applications</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Closed Jobs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Closed Jobs</CardTitle>
                    <CardDescription>Successfully filled positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Part Time Cook</h4>
                            <p className="text-sm text-gray-600">Andheri, Mumbai</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary">Filled</Badge>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Salary:</span>
                            <span className="font-medium">₹10,000/month</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Worker:</span>
                            <span>Anita Sharma</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="household" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Household Information</CardTitle>
                  <CardDescription>Your family and household details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Family Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="w-24 text-gray-500">Family Size:</span>
                          <span>{employerData.familySize || 0} members</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Children:</span>
                          <span>{employerData.hasChildren ? "Yes" : "No"}</span>
                        </div>
                        {employerData.hasChildren && employerData.childrenAges && (
                          <div className="flex">
                            <span className="w-24 text-gray-500">Children Ages:</span>
                            <span>{JSON.parse(employerData.childrenAges).join(", ")}</span>
                          </div>
                        )}
                        <div className="flex">
                          <span className="w-24 text-gray-500">Elderly:</span>
                          <span>{employerData.hasElderly ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Pets:</span>
                          <span>{employerData.hasPets ? "Yes" : "No"}</span>
                        </div>
                        {employerData.hasPets && employerData.petDetails && (
                          <div className="flex">
                            <span className="w-24 text-gray-500">Pet Details:</span>
                            <span>{employerData.petDetails}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="w-24 text-gray-500">Name:</span>
                          <span>{employerData.firstName} {employerData.lastName}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Phone:</span>
                          <span>{employerData.phone}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Email:</span>
                          <span>{employerData.user?.email}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">Address:</span>
                          <span>{employerData.address}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24 text-gray-500">City:</span>
                          <span>{employerData.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button>Update Household Details</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Salary payments and transaction records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">March 2024 Salary - Sunita Mishra</h4>
                          <p className="text-sm text-gray-600">House Maid - Full Time</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹12,000</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">March 2024 Salary - Ramesh Kumar</h4>
                          <p className="text-sm text-gray-600">Driver - Part Time</p>
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
                          <h4 className="font-medium">March 2024 Salary - Anita Sharma</h4>
                          <p className="text-sm text-gray-600">Cook - Part Time</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹10,000</p>
                          <p className="text-sm text-green-600">Paid</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Total Payments (Last 3 months)</p>
                        <p className="text-2xl font-bold">₹90,000</p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline">Download Report</Button>
                        <Button>Make Payment</Button>
                      </div>
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