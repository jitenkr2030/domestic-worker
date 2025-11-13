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
  Users, 
  Briefcase, 
  Calendar, 
  Mail, 
  Phone, 
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Video,
  MapPin
} from "lucide-react"

interface Application {
  id: string
  status: string
  appliedAt: string
  message?: string
  job: {
    id: string
    title: string
    category: string
    workType: string
    salaryAmount: number
    salaryType: string
  }
  worker: {
    id: string
    firstName: string
    lastName: string
    age: number
    experience: number
    hourlyRate: number
    city: string
    user: {
      name: string
      email: string
      phone: string
      avatar?: string
    }
    skills: Array<{
      skill: {
        name: string
        category: string
      }
      level: string
    }>
    reviews: Array<{
      rating: number
      comment: string
    }>
  }
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "AGENCY")) {
      router.push("/auth/signin")
      return
    }

    fetchApplications()
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/applications")
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchApplications() // Refresh the list
      } else {
        alert("Failed to update application status")
      }
    } catch (error) {
      console.error("Error updating application:", error)
      alert("Failed to update application status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REVIEWING":
        return "bg-blue-100 text-blue-800"
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800"
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAverageRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const pendingApplications = applications.filter(app => app.status === "PENDING")
  const reviewingApplications = applications.filter(app => app.status === "REVIEWING")
  const shortlistedApplications = applications.filter(app => app.status === "SHORTLISTED")
  const acceptedApplications = applications.filter(app => app.status === "ACCEPTED")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Job Applications</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Total Applications:</span>
                <Badge variant="outline">{applications.length}</Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="reviewing">
                Reviewing ({reviewingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="shortlisted">
                Shortlisted ({shortlistedApplications.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({acceptedApplications.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                    <p className="text-gray-600">All applications have been reviewed or there are no new applications.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.worker.user.avatar} />
                              <AvatarFallback>
                                {application.worker.firstName?.[0]}{application.worker.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {application.worker.firstName} {application.worker.lastName}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.worker.city}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">{application.job.title}</h4>
                            <p className="text-xs text-gray-600">
                              {application.job.category} • {application.job.workType.replace('_', ' ')}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Applied:</span>
                            <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Experience:</span>
                            <span>{application.worker.experience} years</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Expected Rate:</span>
                            <span>₹{application.worker.hourlyRate}/hr</span>
                          </div>
                          
                          {application.worker.reviews.length > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Rating:</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="ml-1">{getAverageRating(application.worker.reviews)}</span>
                                <span className="text-gray-500 ml-1">({application.worker.reviews.length})</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-3 border-t">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {application.worker.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill.skill.name}
                                </Badge>
                              ))}
                              {application.worker.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{application.worker.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            {application.message && (
                              <div className="bg-gray-50 p-2 rounded text-sm">
                                <p className="text-gray-700">{application.message}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2 pt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => router.push(`/applications/${application.id}`)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleApplicationAction(application.id, "REVIEWING")}
                            >
                              Start Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviewing" className="space-y-4">
              {reviewingApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications under review</h3>
                    <p className="text-gray-600">Move applications from pending to start reviewing them.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {reviewingApplications.map((application) => (
                    <Card key={application.id} className="border-blue-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.worker.user.avatar} />
                              <AvatarFallback>
                                {application.worker.firstName?.[0]}{application.worker.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {application.worker.firstName} {application.worker.lastName}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.worker.city}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            Under Review
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">{application.job.title}</h4>
                            <p className="text-xs text-gray-600">
                              {application.job.category} • {application.job.workType.replace('_', ' ')}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2 pt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => router.push(`/applications/${application.id}`)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleApplicationAction(application.id, "SHORTLIST")}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Shortlist
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleApplicationAction(application.id, "REJECTED")}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shortlisted" className="space-y-4">
              {shortlistedApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No shortlisted applications</h3>
                    <p className="text-gray-600">Shortlist promising candidates to move to the next stage.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {shortlistedApplications.map((application) => (
                    <Card key={application.id} className="border-purple-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.worker.user.avatar} />
                              <AvatarFallback>
                                {application.worker.firstName?.[0]}{application.worker.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {application.worker.firstName} {application.worker.lastName}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.worker.city}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">
                            Shortlisted
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex space-x-2 pt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => router.push(`/applications/${application.id}`)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleApplicationAction(application.id, "ACCEPT")}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => router.push(`/applications/${application.id}/interview`)}
                            >
                              <Video className="mr-1 h-3 w-3" />
                              Interview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="accepted" className="space-y-4">
              {acceptedApplications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted applications</h3>
                    <p className="text-gray-600">Accept applications to hire workers and create contracts.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {acceptedApplications.map((application) => (
                    <Card key={application.id} className="border-green-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={application.worker.user.avatar} />
                              <AvatarFallback>
                                {application.worker.firstName?.[0]}{application.worker.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {application.worker.firstName} {application.worker.lastName}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.worker.city}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Accepted
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex space-x-2 pt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => router.push(`/applications/${application.id}`)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => router.push(`/contracts/create?applicationId=${application.id}`)}
                            >
                              <Briefcase className="mr-1 h-3 w-3" />
                              Create Contract
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => router.push(`/messages/${application.worker.user.id}`)}
                            >
                              <MessageSquare className="mr-1 h-3 w-3" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}