"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Filter,
  Heart,
  Star,
  Users
} from "lucide-react"

interface Job {
  id: string
  title: string
  description: string
  category: string
  workType: string
  salaryAmount: number
  salaryType: string
  salaryCurrency: string
  address: string
  city: string
  state: string
  isUrgent: boolean
  createdAt: string
  employer: {
    firstName: string
    lastName: string
    companyName?: string
  }
  _count: {
    applications: number
  }
}

export default function JobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    workType: "",
    city: "",
    minSalary: "",
    maxSalary: ""
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId: string) => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ jobId })
      })

      if (response.ok) {
        alert("Application submitted successfully!")
        fetchJobs() // Refresh jobs to update application count
      } else {
        const error = await response.json()
        alert(error.error || "Failed to apply")
      }
    } catch (error) {
      console.error("Error applying to job:", error)
      alert("Failed to apply. Please try again.")
    }
  }

  const filteredJobs = jobs.filter(job => {
    return (
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.search.toLowerCase())
    ) && (
      !filters.category || job.category === filters.category
    ) && (
      !filters.workType || job.workType === filters.workType
    ) && (
      !filters.city || job.city.toLowerCase().includes(filters.city.toLowerCase())
    ) && (
      !filters.minSalary || job.salaryAmount >= parseInt(filters.minSalary)
    ) && (
      !filters.maxSalary || job.salaryAmount <= parseInt(filters.maxSalary)
    )
  })

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
              <h1 className="text-xl font-semibold text-gray-900">Browse Jobs</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user.role === "EMPLOYER" && (
                <Button onClick={() => router.push("/jobs/post")}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Post a Job
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Search & Filter Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                
                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="CLEANING">Cleaning</SelectItem>
                    <SelectItem value="COOKING">Cooking</SelectItem>
                    <SelectItem value="CHILDCARE">Childcare</SelectItem>
                    <SelectItem value="ELDERLY_CARE">Elderly Care</SelectItem>
                    <SelectItem value="DRIVING">Driving</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setFilters(prev => ({ ...prev, workType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Work Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="LIVE_IN">Live In</SelectItem>
                    <SelectItem value="LIVE_OUT">Live Out</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />

                <Input
                  type="number"
                  placeholder="Min Salary"
                  value={filters.minSalary}
                  onChange={(e) => setFilters(prev => ({ ...prev, minSalary: e.target.value }))}
                />

                <Input
                  type="number"
                  placeholder="Max Salary"
                  value={filters.maxSalary}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxSalary: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        {job.title}
                        {job.isUrgent && (
                          <Badge className="ml-2 bg-red-100 text-red-800">Urgent</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.city}, {job.state}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {job.employer.firstName?.[0]}{job.employer.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {job.employer.firstName} {job.employer.lastName}
                        </span>
                      </div>
                      <Badge variant="outline">{job.category}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Salary:</span>
                        <span className="font-medium text-green-600">
                          ₹{job.salaryAmount.toLocaleString()}/{job.salaryType}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Work Type:</span>
                        <Badge variant="secondary">{job.workType.replace('_', ' ')}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Applications:</span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {job._count.applications}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleApply(job.id)}
                        disabled={!session || session.user.role !== "WORKER"}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}