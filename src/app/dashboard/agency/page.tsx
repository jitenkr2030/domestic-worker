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
  Building, 
  Users, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Eye,
  TrendingUp,
  Award,
  FileText
} from "lucide-react"

export default function AgencyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [agencyData, setAgencyData] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "AGENCY") {
      router.push("/unauthorized")
    } else {
      // TODO: Fetch agency data from API
      setAgencyData({
        name: "Premium Home Services Agency",
        email: session?.user?.email || "contact@premiumhome.com",
        phone: "+1 234 567 8900",
        licenseNumber: "AGENCY-2024-001",
        description: "Leading domestic worker placement agency with 10+ years of experience. We provide verified, trained, and reliable domestic helpers for households across the country.",
        address: "789 Business Center, Suite 100",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        isVerified: true,
        website: "https://premiumhome.com",
        stats: {
          totalWorkers: 45,
          activeWorkers: 32,
          totalJobs: 120,
          activeJobs: 18,
          completedPlacements: 89,
          totalRevenue: 125000,
          averageRating: 4.7
        },
        recentWorkers: [
          {
            id: "1",
            name: "Maria Garcia",
            skills: ["Cleaning", "Cooking", "Childcare"],
            status: "AVAILABLE",
            rating: 4.8,
            joinedDate: "2024-01-10"
          },
          {
            id: "2",
            name: "John Smith",
            skills: ["Driving", "Maintenance"],
            status: "PLACED",
            rating: 4.6,
            joinedDate: "2024-01-08"
          },
          {
            id: "3",
            name: "Lisa Chen",
            skills: ["Elderly Care", "Cooking"],
            status: "AVAILABLE",
            rating: 4.9,
            joinedDate: "2024-01-12"
          }
        ],
        recentJobs: [
          {
            id: "1",
            title: "Experienced Housekeeper Needed",
            client: "Johnson Family",
            status: "ACTIVE",
            applications: 12,
            postedDate: "2024-01-20"
          },
          {
            id: "2",
            title: "Part-time Nanny for 2 Children",
            client: "Smith Residence",
            status: "FILLED",
            applications: 8,
            postedDate: "2024-01-18"
          },
          {
            id: "3",
            title: "Driver for Family Transportation",
            client: "Wilson Household",
            status: "ACTIVE",
            applications: 6,
            postedDate: "2024-01-22"
          }
        ]
      })
    }
  }, [session, status, router])

  if (status === "loading" || !agencyData) {
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
      case "AVAILABLE": return "bg-green-100 text-green-800"
      case "PLACED": return "bg-purple-100 text-purple-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const getWorkerStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-100 text-green-800"
      case "PLACED": return "bg-blue-100 text-blue-800"
      case "UNAVAILABLE": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <div className="flex items-center space-x-2">
                {agencyData.isVerified && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Avatar>
                  <AvatarFallback>
                    {agencyData.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agency Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Agency Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{agencyData.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Badge variant="default">Placement Agency</Badge>
                    {agencyData.isVerified && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{agencyData.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{agencyData.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{agencyData.city}, {agencyData.state}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>License: {agencyData.licenseNumber}</span>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-700">{agencyData.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{agencyData.stats.totalWorkers}</p>
                    <p className="text-sm text-gray-600">Total Workers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Briefcase className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{agencyData.stats.activeJobs}</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{agencyData.stats.completedPlacements}</p>
                    <p className="text-sm text-gray-600">Placements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{agencyData.stats.averageRating}</p>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Overview
            </CardTitle>
            <CardDescription>
              Key metrics and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${((agencyData.stats.totalRevenue / agencyData.stats.completedPlacements) || 0).toFixed(0)}
                </div>
                <p className="text-sm text-gray-600">Average Revenue per Placement</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round((agencyData.stats.completedPlacements / agencyData.stats.totalJobs) * 100)}%
                </div>
                <p className="text-sm text-gray-600">Job Fill Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round((agencyData.stats.activeWorkers / agencyData.stats.totalWorkers) * 100)}%
                </div>
                <p className="text-sm text-gray-600">Worker Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="workers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Worker Management
                    </CardTitle>
                    <CardDescription>
                      Manage your agency workers and their availability
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Worker
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agencyData.recentWorkers.map((worker: any) => (
                    <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {worker.name?.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{worker.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span className="text-sm">{worker.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                              {worker.skills?.slice(0, 2).join(", ")}
                              {worker.skills?.length > 2 && "..."}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getWorkerStatusColor(worker.status)}>
                          {worker.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Job Management
                    </CardTitle>
                    <CardDescription>
                      Manage job postings and client requirements
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agencyData.recentJobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>Client: {job.client}</span>
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

          <TabsContent value="placements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Placement History
                </CardTitle>
                <CardDescription>
                  Track your successful worker placements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Maria Garcia → Johnson Family</h4>
                      <p className="text-sm text-gray-600">Housekeeper • Full-time • Placed on Jan 15, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$1,800/month</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">John Smith → Wilson Residence</h4>
                      <p className="text-sm text-gray-600">Driver • Part-time • Placed on Jan 10, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$800/month</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Lisa Chen → Brown Household</h4>
                      <p className="text-sm text-gray-600">Elderly Care • Live-in • Placed on Dec 20, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$2,200/month</p>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Agency Analytics
                </CardTitle>
                <CardDescription>
                  Detailed insights and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Worker Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Available Workers</span>
                        <span className="text-sm font-medium">{agencyData.stats.totalWorkers - agencyData.stats.activeWorkers}</span>
                      </div>
                      <Progress 
                        value={((agencyData.stats.totalWorkers - agencyData.stats.activeWorkers) / agencyData.stats.totalWorkers) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Placed Workers</span>
                        <span className="text-sm font-medium">{agencyData.stats.activeWorkers}</span>
                      </div>
                      <Progress 
                        value={(agencyData.stats.activeWorkers / agencyData.stats.totalWorkers) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Revenue Overview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Revenue</span>
                        <span className="text-sm font-medium">${agencyData.stats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg. Revenue per Placement</span>
                        <span className="text-sm font-medium">
                          ${Math.round(agencyData.stats.totalRevenue / agencyData.stats.completedPlacements)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <span className="text-sm font-medium">
                          ${Math.round(agencyData.stats.totalRevenue / 12)}
                        </span>
                      </div>
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