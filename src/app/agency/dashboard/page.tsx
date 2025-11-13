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
  Building, 
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
  TrendingUp,
  Award,
  Clock
} from "lucide-react"

export default function AgencyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [agencyData, setAgencyData] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "AGENCY") {
      router.push("/auth/signin")
      return
    }

    // Fetch agency data
    fetchAgencyData()
  }, [session, status, router])

  const fetchAgencyData = async () => {
    try {
      const response = await fetch("/api/agency/profile")
      if (response.ok) {
        const data = await response.json()
        setAgencyData(data)
      }
    } catch (error) {
      console.error("Error fetching agency data:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!agencyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading agency data...</div>
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
              <h1 className="text-xl font-semibold text-gray-900">Agency Dashboard</h1>
              {agencyData.isVerified && (
                <Badge className="ml-3 bg-green-100 text-green-800">
                  <Award className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={agencyData.user?.avatar} />
                  <AvatarFallback>
                    {agencyData.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {agencyData.name}
                  </p>
                  <p className="text-xs text-gray-500">Agency</p>
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
                <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">
                  +3 this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Placements</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
                  Currently placed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹1,25,000</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  Placement success
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="workers">Workers</TabsTrigger>
              <TabsTrigger value="jobs">Job Postings</TabsTrigger>
              <TabsTrigger value="placements">Placements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                          <p className="text-sm font-medium">New worker registered: Priya Sharma</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Placement completed: Housekeeper at Mr. Patel's home</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New job posting received from Mrs. Desai</p>
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
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Worker
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Browse Job Requests
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      View Worker Availability
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Generate Invoice
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="workers" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Agency Workers</h3>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Worker
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agencyData.workers?.map((worker: any) => (
                  <Card key={worker.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {worker.firstName?.[0]}{worker.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-sm">
                              {worker.firstName} {worker.lastName}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {worker.experience} years experience
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={worker.isAvailable ? "default" : "secondary"}>
                          {worker.isAvailable ? "Available" : "Placed"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Skills:</span>
                          <span className="text-right">
                            {worker.skills?.slice(0, 2).map((skill: any) => skill.skill.name).join(", ")}
                            {worker.skills?.length > 2 && "..."}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rate:</span>
                          <span>₹{worker.hourlyRate}/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span>{worker.city}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Profile
                        </Button>
                        <Button size="sm" className="flex-1">
                          Place
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="jobs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Job Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Job Requests</CardTitle>
                    <CardDescription>Employers seeking workers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Full Time Housekeeper</h4>
                            <p className="text-sm text-gray-600">Mrs. Sharma - Andheri, Mumbai</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="default">Urgent</Badge>
                              <Badge variant="outline">2 days ago</Badge>
                            </div>
                          </div>
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Salary:</span>
                            <span className="font-medium">₹15,000/month</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Requirements:</span>
                            <span>Cooking, Cleaning</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm">Suggest Workers</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Applications</CardTitle>
                    <CardDescription>Worker applications to review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Sunita Mishra → Housekeeper</h4>
                            <p className="text-sm text-gray-600">Applied for Mr. Patel's job</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">Pending Review</Badge>
                            </div>
                          </div>
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Worker Rating:</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="ml-1">4.8</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Experience:</span>
                            <span>5 years</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">Review</Button>
                          <Button size="sm">Forward to Employer</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="placements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Placements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Placements</CardTitle>
                    <CardDescription>Successfully placed workers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Anita Sharma → Cook</h4>
                            <p className="text-sm text-gray-600">Placed at Mrs. Desai's home</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary">Completed</Badge>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span>Placement Date:</span>
                            <span>March 15, 2024</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Agency Fee:</span>
                            <span className="font-medium">₹5,000</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Placement Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Placement Statistics</CardTitle>
                    <CardDescription>Monthly placement overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-medium">8 Placements</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Fee</span>
                        <span className="font-medium">₹4,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="font-medium">₹36,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Worker Performance</CardTitle>
                    <CardDescription>Worker satisfaction and ratings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Rating</span>
                        <span className="font-medium">4.6/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Retention Rate</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Complaints</span>
                        <span className="font-medium">2 this month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Employer Satisfaction</CardTitle>
                    <CardDescription>Client feedback and reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Satisfaction Score</span>
                        <span className="font-medium">4.8/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Repeat Clients</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Referrals</span>
                        <span className="font-medium">12 this month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Revenue and commission tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Monthly Revenue</span>
                        <span className="font-medium">₹1,25,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Commission Rate</span>
                        <span className="font-medium">10-15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Growth</span>
                        <span className="font-medium text-green-600">+15%</span>
                      </div>
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