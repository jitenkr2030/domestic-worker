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
  Briefcase, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Edit
} from "lucide-react"

export default function WorkerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [workerData, setWorkerData] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "WORKER") {
      router.push("/unauthorized")
    } else {
      // TODO: Fetch worker data from API
      setWorkerData({
        firstName: "John",
        lastName: "Doe",
        email: session?.user?.email || "john.doe@example.com",
        phone: "+1 234 567 8900",
        avatar: "/placeholder-avatar.jpg",
        bio: "Experienced domestic worker with 5+ years in cleaning, cooking, and childcare. Reliable and trustworthy.",
        experience: 5,
        hourlyRate: 15,
        isAvailable: true,
        skills: [
          { name: "Cleaning", level: "Expert" },
          { name: "Cooking", level: "Advanced" },
          { name: "Childcare", level: "Intermediate" }
        ],
        documents: [
          { name: "ID Proof", status: "Verified" },
          { name: "Police Verification", status: "Pending" },
          { name: "Address Proof", status: "Verified" }
        ],
        stats: {
          completedJobs: 24,
          activeJobs: 2,
          rating: 4.8,
          totalEarnings: 3600
        }
      })
    }
  }, [session, status, router])

  if (status === "loading" || !workerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getSkillColor = (level: string) => {
    switch (level) {
      case "Expert": return "bg-purple-100 text-purple-800"
      case "Advanced": return "bg-blue-100 text-blue-800"
      case "Intermediate": return "bg-green-100 text-green-800"
      case "Beginner": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    return status === "Verified" ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertCircle className="w-4 h-4 text-yellow-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Avatar>
                <AvatarImage src={workerData.avatar} />
                <AvatarFallback>
                  {workerData.firstName?.[0]}{workerData.lastName?.[0]}
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
                  <AvatarImage src={workerData.avatar} />
                  <AvatarFallback className="text-lg">
                    {workerData.firstName?.[0]}{workerData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {workerData.firstName} {workerData.lastName}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Badge variant={workerData.isAvailable ? "default" : "secondary"}>
                      {workerData.isAvailable ? "Available" : "Not Available"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{workerData.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{workerData.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>New York, NY</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{workerData.experience} years experience</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>${workerData.hourlyRate}/hour</span>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-700">{workerData.bio}</p>
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
                    <p className="text-2xl font-bold">{workerData.stats.completedJobs}</p>
                    <p className="text-sm text-gray-600">Jobs Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{workerData.stats.activeJobs}</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{workerData.stats.rating}</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">${workerData.stats.totalEarnings}</p>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Skills & Expertise
                </CardTitle>
                <CardDescription>
                  Your skills and proficiency levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workerData.skills.map((skill: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{skill.name}</h4>
                          <Badge className={getSkillColor(skill.level)}>
                            {skill.level}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    Add New Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Verification Documents
                </CardTitle>
                <CardDescription>
                  Upload and manage your verification documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workerData.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getDocumentStatusIcon(doc.status)}
                            <span className={`text-sm ${
                              doc.status === "Verified" ? "text-green-600" : "text-yellow-600"
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {doc.status === "Verified" ? "View" : "Upload"}
                      </Button>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    Upload New Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Availability & Preferences
                </CardTitle>
                <CardDescription>
                  Set your working hours and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Availability Status</h4>
                      <p className="text-sm text-gray-600">Are you available for new jobs?</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        workerData.isAvailable ? "text-green-600" : "text-red-600"
                      }`}>
                        {workerData.isAvailable ? "Available" : "Not Available"}
                      </span>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Preferred Work Types</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Full Time</Badge>
                      <Badge>Part Time</Badge>
                      <Badge>Live Out</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Preferred Working Days</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Monday</Badge>
                      <Badge>Tuesday</Badge>
                      <Badge>Wednesday</Badge>
                      <Badge>Thursday</Badge>
                      <Badge>Friday</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Preferred Shift</h4>
                    <Badge>Morning</Badge>
                  </div>

                  <Button className="w-full">
                    Update Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your recent job applications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Applied to House Cleaning Job</h4>
                        <p className="text-sm text-gray-600">2 hours ago</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Profile Updated</h4>
                        <p className="text-sm text-gray-600">1 day ago</p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">New Review Received</h4>
                        <p className="text-sm text-gray-600">3 days ago</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm">5.0</span>
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