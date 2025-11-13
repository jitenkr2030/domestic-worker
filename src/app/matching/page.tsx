"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Brain, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  ArrowRight
} from "lucide-react"

interface Match {
  id: string
  firstName?: string
  lastName?: string
  title?: string
  experience?: number
  hourlyRate?: number
  city?: string
  state?: string
  matchScore: number
  matchReasons: string[]
  user?: {
    name: string
    email: string
    avatar?: string
  }
  employer?: {
    firstName: string
    lastName: string
    email: string
  }
  skills?: Array<{
    skill: {
      name: string
      category: string
    }
    level: string
  }>
  reviews?: Array<{
    rating: number
    comment: string
  }>
  _count?: {
    applications: number
  }
}

export default function MatchingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [aiQuery, setAiQuery] = useState("")
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchMatches()
  }, [session, status, router])

  const fetchMatches = async () => {
    try {
      let endpoint = ""
      let body = {}

      if (session.user.role === "EMPLOYER") {
        // Get jobs for this employer and find matching workers
        const jobsResponse = await fetch("/api/jobs?employer=true")
        if (jobsResponse.ok) {
          const jobs = await jobsResponse.json()
          if (jobs.length > 0) {
            endpoint = "/api/matching"
            body = { jobId: jobs[0].id }
          }
        }
      } else if (session.user.role === "WORKER") {
        // Get worker profile and find matching jobs
        endpoint = "/api/matching"
        body = { workerId: session.user.id }
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        })

        if (response.ok) {
          const data = await response.json()
          setMatches(data)
        }
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAiRecommendations = async () => {
    if (!aiQuery.trim()) return

    setAiLoading(true)
    try {
      const response = await fetch(`/api/matching?type=${session.user.role === "WORKER" ? "job" : "worker"}&query=${encodeURIComponent(aiQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setAiRecommendations(data)
      }
    } catch (error) {
      console.error("Error getting AI recommendations:", error)
    } finally {
      setAiLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 75) return "bg-blue-100 text-blue-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-orange-100 text-orange-800"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <Brain className="mr-2 h-5 w-5 text-purple-600" />
                AI Matching
              </h1>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              Powered by AI
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* AI Assistant */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Career Assistant
              </CardTitle>
              <CardDescription>
                Get personalized recommendations for {session.user.role === "WORKER" ? "jobs" : "workers"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder={session.user.role === "WORKER" 
                    ? "e.g., I'm looking for a housekeeping job in Mumbai with flexible hours" 
                    : "e.g., I need a reliable cook for my family in Delhi"
                  }
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && getAiRecommendations()}
                  className="flex-1"
                />
                <Button onClick={getAiRecommendations} disabled={aiLoading}>
                  {aiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </div>

              {aiRecommendations && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">AI Recommendations:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-purple-800">Recommended Categories:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiRecommendations.categories?.map((cat: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-purple-800">Key Requirements:</h5>
                      <ul className="text-xs mt-1 space-y-1">
                        {aiRecommendations.keyRequirements?.map((req: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-purple-800">Salary Range:</h5>
                    <p className="text-sm text-purple-700">
                      ₹{aiRecommendations.salaryRange?.min} - ₹{aiRecommendations.salaryRange?.max} per month
                    </p>
                  </div>
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-purple-800">Advice:</h5>
                    <p className="text-sm text-purple-700">{aiRecommendations.advice}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matches Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{matches.length}</div>
                <p className="text-xs text-muted-foreground">
                  Found for you
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Matches</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {matches.filter(m => m.matchScore >= 80).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  80%+ match score
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {matches.length > 0 
                    ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average compatibility
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Fresh matches
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Simple Matches Display */}
          <Card>
            <CardHeader>
              <CardTitle>Your Matches</CardTitle>
              <CardDescription>
                {session.user.role === "WORKER" ? "Jobs that match your profile" : "Workers that match your requirements"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found yet</h3>
                  <p className="text-gray-600">Complete your profile to get better matches</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.slice(0, 5).map((match) => (
                    <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={match.user?.avatar} />
                            <AvatarFallback>
                              {(match.firstName?.[0] + (match.lastName?.[0] || "")) || (match.title?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {session.user.role === "WORKER" ? match.title : `${match.firstName} ${match.lastName}`}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {match.city}, {match.state}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getScoreColor(match.matchScore)}>
                            {match.matchScore}% Match
                          </Badge>
                          <Button 
                            size="sm"
                            onClick={() => router.push(session.user.role === "WORKER" ? `/jobs/${match.id}` : `/workers/${match.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}