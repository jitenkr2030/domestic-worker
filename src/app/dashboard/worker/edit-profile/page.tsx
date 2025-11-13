"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Save,
  Upload,
  X,
  Plus
} from "lucide-react"

export default function EditWorkerProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    experience: "",
    hourlyRate: "",
    address: "",
    city: "",
    state: "",
    country: "",
    isAvailable: true,
    workTypes: [] as string[],
    preferredDays: [] as string[],
    preferredShift: "",
    skills: [] as Array<{ name: string; level: string }>,
    languages: [] as string[]
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "WORKER") {
      router.push("/unauthorized")
    } else {
      // TODO: Fetch worker data from API
      setProfileData({
        firstName: "John",
        lastName: "Doe",
        email: session?.user?.email || "john.doe@example.com",
        phone: "+1 234 567 8900",
        bio: "Experienced domestic worker with 5+ years in cleaning, cooking, and childcare. Reliable and trustworthy.",
        experience: "5",
        hourlyRate: "15",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        country: "USA",
        isAvailable: true,
        workTypes: ["FULL_TIME", "PART_TIME"],
        preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        preferredShift: "MORNING",
        skills: [
          { name: "Cleaning", level: "EXPERT" },
          { name: "Cooking", level: "ADVANCED" },
          { name: "Childcare", level: "INTERMEDIATE" }
        ],
        languages: ["English", "Spanish"]
      })
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // TODO: Implement profile update logic
      console.log("Update profile:", profileData)
      setSuccess("Profile updated successfully!")
      setTimeout(() => {
        router.push("/dashboard/worker")
      }, 2000)
    } catch (error) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    setProfileData({
      ...profileData,
      skills: [...profileData.skills, { name: "", level: "BEGINNER" }]
    })
  }

  const removeSkill = (index: number) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((_, i) => i !== index)
    })
  }

  const updateSkill = (index: number, field: string, value: string) => {
    const newSkills = [...profileData.skills]
    newSkills[index] = { ...newSkills[index], [field]: value }
    setProfileData({ ...profileData, skills: newSkills })
  }

  const toggleWorkType = (workType: string) => {
    setProfileData({
      ...profileData,
      workTypes: profileData.workTypes.includes(workType)
        ? profileData.workTypes.filter(wt => wt !== workType)
        : [...profileData.workTypes, workType]
    })
  }

  const toggleDay = (day: string) => {
    setProfileData({
      ...profileData,
      preferredDays: profileData.preferredDays.includes(day)
        ? profileData.preferredDays.filter(d => d !== day)
        : [...profileData.preferredDays, day]
    })
  }

  const workTypes = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "LIVE_IN", label: "Live In" },
    { value: "LIVE_OUT", label: "Live Out" },
    { value: "TEMPORARY", label: "Temporary" }
  ]

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const shifts = ["MORNING", "AFTERNOON", "EVENING", "NIGHT", "FLEXIBLE"]
  const skillLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]

  if (status === "loading" || !profileData.firstName) {
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            </div>
            <Button 
              type="submit" 
              form="profile-form"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6" variant="default">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your basic personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Update your work experience and rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profileData.hourlyRate}
                    onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Skills</Label>
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, "name", e.target.value)}
                      />
                      <Select
                        value={skill.level}
                        onValueChange={(value) => updateSkill(index, "level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map(level => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0) + level.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Availability & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Availability & Preferences
              </CardTitle>
              <CardDescription>
                Set your working preferences and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Work Types</Label>
                <div className="flex flex-wrap gap-2">
                  {workTypes.map(workType => (
                    <Badge
                      key={workType.value}
                      variant={profileData.workTypes.includes(workType.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleWorkType(workType.value)}
                    >
                      {workType.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Preferred Working Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map(day => (
                    <Badge
                      key={day}
                      variant={profileData.preferredDays.includes(day) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredShift">Preferred Shift</Label>
                <Select
                  value={profileData.preferredShift}
                  onValueChange={(value) => setProfileData({ ...profileData, preferredShift: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map(shift => (
                      <SelectItem key={shift} value={shift}>
                        {shift.charAt(0) + shift.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={profileData.isAvailable}
                  onChange={(e) => setProfileData({ ...profileData, isAvailable: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isAvailable">I am available for new jobs</Label>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Information
              </CardTitle>
              <CardDescription>
                Update your address and location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}