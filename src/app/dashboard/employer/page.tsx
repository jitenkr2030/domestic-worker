"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Home, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Eye
} from "lucide-react"

export default function EmployerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employerData, setEmployerData] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "EMPLOYER") {
      router.push("/unauthorized")
    } else {
      // TODO: Fetch employer data from API
      setEmployerData({
        firstName: "Sarah",
        lastName: "Johnson",
        email: session?.user?.email || "sarah.johnson@example.com",
        phone: "+1 234 567 8900",
        avatar: "/placeholder-avatar.jpg",
        address: "456 Oak Avenue",
        city: "San Francisco",
        state: "CA",
        country: "USA",
        familySize: 4,
        hasChildren: true,
        childrenAges: [8, 12],
        hasElderly: false,
        hasPets: true,
        petDetails: "1 friendly Golden Retriever",
        bio: "Looking for a reliable domestic helper to assist with household chores and childcare.",
        stats: {
          activeJobs: 3,
          totalWorkers: 5,
          completedContracts: 12,
          totalSpent: 8500
        },
        recentJobs: [
          {
            id: "1",
            title: "Housekeeper and Nanny",
            status: "ACTIVE",
            applications: 8,
            postedDate: "2024-01-20",
            salary: "$18/hour"
          },
          {
            id: "2", 
            title: "Part-time Cleaner",
            status: "FILLED",
            applications: 15,
            postedDate: "2024-01-15",
            salary: "$15/hour"
          },
          {
            id: "3",
            title: "Cook for Family Meals",
            status: "ACTIVE",
            applications: 5,
            postedDate: "2024-01-22",
            salary: "$20/hour"
          }
        ]
      })
    }
  }, [session, status, router])

  if (status === "loading" || !employerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "FILLED": return "bg-blue-100 text-blue-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Avatar>
                <AvatarImage src={employerData.avatar} />
                <AvatarFallback>
                  {employerData.firstName?.[0]}{employerData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={employerData.avatar} />
                  <AvatarFallback className="text-lg">
                    {employerData.firstName?.[0]}{employerData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {employerData.firstName} {employerData.lastName}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Badge variant="default">Household Employer</Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{employerData.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{employerData.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{employerData.city}, {employerData.state}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Family of {employerData.familySize}</span>
              </div>
              
              {employerData.hasChildren && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Children: {employerData.childrenAges?.join(", ")} years old</span>
                </div>
              )}
              
              {employerData.hasPets && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Pets: {employerData.petDetails}</span>
                </div>
              )}
              
              <div className="pt-4">
                <p className="text-sm text-gray-700">{employerData.bio}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{employerData.stats.activeJobs}</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{employerData.stats.totalWorkers}</p>
                    <p className="text-sm text-gray-600">Total Workers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{employerData.stats.completedContracts}</p>
                    <p className="text-sm text-gray-600">Completed Contracts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">${employerData.stats.totalSpent}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex-col" variant="outline">
                <Plus className="w-6 h-6 mb-2" />
                Post New Job
              </Button>
              <Button className="h-20 flex-col" variant="outline">
                <Users className="w-6 h-6 mb-2" />
                Browse Workers
              </Button>
              <Button className="h-20 flex-col" variant="outline">
                <Calendar className="w-6 h-6 mb-2" />
                View Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
            <TabsTrigger value="household">Household</TabsTrigger>
            <TabsTrigger value="workers">My Workers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Active Job Postings
                    </CardTitle>
                    <CardDescription>
                      Manage your current job postings and applications
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employerData.recentJobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{job.salary}</span>
                          <span>{job.applications} applications</span>
                          <span>Posted {job.postedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="household">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Household Information
                </CardTitle>
                <CardDescription>
                  Manage your household details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Family Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Family Size</span>
                        <span className="text-sm font-medium">{employerData.familySize} members</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Children</span>
                        <span className="text-sm font-medium">
                          {employerData.hasChildren ? `Yes (${employerData.childrenAges?.join(", ")} years)` : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Elderly Members</span>
                        <span className="text-sm font-medium">{employerData.hasElderly ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pets</span>
                        <span className="text-sm font-medium">
                          {employerData.hasPets ? employerData.petDetails : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Location</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Address</span>
                        <span className="text-sm font-medium">{employerData.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">City</span>
                        <span className="text-sm font-medium">{employerData.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">State</span>
                        <span className="text-sm font-medium">{employerData.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Country</span>
                        <span className="text-sm font-medium">{employerData.country}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Household Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  My Workers
                </CardTitle>
                <CardDescription>
                  View and manage your current workers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Jane Doe</h4>
                        <p className="text-sm text-gray-600">Housekeeper • Part-time</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>MS</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Maria Smith</h4>
                        <p className="text-sm text-gray-600">Nanny • Full-time</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Active</Badge>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                  </div>

                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You have 2 active workers</p>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Hire More Workers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  Track your payments to workers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Jane Doe - Salary</h4>
                      <p className="text-sm text-gray-600">Jan 15-31, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$720.00</p>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Maria Smith - Salary</h4>
                      <p className="text-sm text-gray-600">Jan 15-31, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$1,200.00</p>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Jane Doe - Bonus</h4>
                      <p className="text-sm text-gray-600">January 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$50.00</p>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}