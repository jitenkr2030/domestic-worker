"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SearchService } from "@/lib/search-filters"
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Star, 
  Clock, 
  ChevronDown,
  ChevronUp,
  X,
  Users,
  Briefcase,
  Sliders,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"

interface SearchFiltersProps {
  onResults?: (results: any[]) => void
  onFiltersChange?: (filters: any) => void
  searchType?: 'workers' | 'jobs'
  initialFilters?: Partial<SearchFilters>
  showSavedSearches?: boolean
}

interface SearchFilters {
  query: string
  location: {
    address?: string
    coordinates?: { lat: number; lng: number }
    radius?: number // in kilometers
  }
  workerFilters: {
    services: string[]
    experience: { min: number; max: number }
    rating: { min: number; max: number }
    hourlyRate: { min: number; max: number }
    availability: string[]
    languages: string[]
    gender?: 'MALE' | 'FEMALE' | 'ANY'
    age: { min: number; max: number }
    hasVehicle: boolean
    verified: boolean
  }
  jobFilters: {
    categories: string[]
    jobType: string[]
    salary: { min: number; max: number }
    duration: string[]
    urgency: string[]
    skills: string[]
    location: string
    remote: boolean
  }
  sorting: {
    field: string
    direction: 'asc' | 'desc'
  }
}

const WORKER_SERVICES = [
  'House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Laundry', 
  'Cooking', 'Childcare', 'Pet Care', 'Elderly Care', 'Tutoring',
  'Gardening', 'Errands', 'Personal Assistant'
]

const AVAILABILITY_OPTIONS = [
  'Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-22)', 
  'Weekends', 'Holidays', 'Overnight', 'Flexible'
]

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian'
]

const JOB_CATEGORIES = [
  'House Cleaning', 'Office Cleaning', 'Event Cleaning', 'Laundry',
  'Cooking', 'Childcare', 'Pet Care', 'Elderly Care', 'Tutoring',
  'Gardening', 'Personal Assistant', 'Errands', 'Moving Help'
]

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'On-demand']

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'hourly_rate', label: 'Hourly Rate' },
  { value: 'experience', label: 'Experience' },
  { value: 'distance', label: 'Distance' },
  { value: 'availability', label: 'Availability' }
]

export default function SearchFilters({
  onResults,
  onFiltersChange,
  searchType = 'workers',
  initialFilters,
  showSavedSearches = true
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: { radius: 10 },
    workerFilters: {
      services: [],
      experience: { min: 0, max: 20 },
      rating: { min: 0, max: 5 },
      hourlyRate: { min: 0, max: 100 },
      availability: [],
      languages: [],
      gender: 'ANY',
      age: { min: 18, max: 65 },
      hasVehicle: false,
      verified: false
    },
    jobFilters: {
      categories: [],
      jobType: [],
      salary: { min: 0, max: 5000 },
      duration: [],
      urgency: [],
      skills: [],
      location: '',
      remote: false
    },
    sorting: {
      field: 'relevance',
      direction: 'desc'
    },
    ...initialFilters
  })

  const [isSearching, setIsSearching] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [showSavedSearches, setShowSavedSearchesState] = useState(false)
  
  const searchService = useState(new SearchService())[0]

  useEffect(() => {
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  useEffect(() => {
    loadSavedSearches()
  }, [])

  const loadSavedSearches = async () => {
    // Mock saved searches - in real app, fetch from API
    setSavedSearches([
      {
        id: '1',
        name: 'Cleaning services near me',
        filters: {
          ...filters,
          location: { address: 'Mumbai, India', radius: 5 },
          workerFilters: { ...filters.workerFilters, services: ['House Cleaning'] }
        },
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Childcare providers',
        filters: {
          ...filters,
          workerFilters: { ...filters.workerFilters, services: ['Childcare'] }
        },
        createdAt: new Date()
      }
    ])
  }

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  const updateNestedFilters = useCallback((section: keyof SearchFilters, updates: any) => {
    setFilters(prev => ({
      ...prev,
      [section]: { ...prev[section] as any, ...updates }
    }))
  }, [])

  const search = async () => {
    setIsSearching(true)
    try {
      let results
      if (searchType === 'workers') {
        results = await searchService.searchWorkers(filters)
      } else {
        results = await searchService.searchJobs(filters)
      }
      onResults?.(results.data || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      location: { radius: 10 },
      workerFilters: {
        services: [],
        experience: { min: 0, max: 20 },
        rating: { min: 0, max: 5 },
        hourlyRate: { min: 0, max: 100 },
        availability: [],
        languages: [],
        gender: 'ANY',
        age: { min: 18, max: 65 },
        hasVehicle: false,
        verified: false
      },
      jobFilters: {
        categories: [],
        jobType: [],
        salary: { min: 0, max: 5000 },
        duration: [],
        urgency: [],
        skills: [],
        location: '',
        remote: false
      },
      sorting: {
        field: 'relevance',
        direction: 'desc'
      }
    }
    setFilters(clearedFilters)
    setLocationInput('')
  }

  const loadSavedSearch = (savedSearch: any) => {
    setFilters(savedSearch.filters)
    setLocationInput(savedSearch.filters.location.address || '')
    setShowSavedSearchesState(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.location.address) count++
    if (searchType === 'workers') {
      count += filters.workerFilters.services.length
      count += filters.workerFilters.availability.length
      count += filters.workerFilters.languages.length
      if (filters.workerFilters.gender !== 'ANY') count++
      if (filters.workerFilters.hasVehicle) count++
      if (filters.workerFilters.verified) count++
      if (filters.workerFilters.experience.min > 0 || filters.workerFilters.experience.max < 20) count++
      if (filters.workerFilters.rating.min > 0) count++
      if (filters.workerFilters.hourlyRate.min > 0 || filters.workerFilters.hourlyRate.max < 100) count++
      if (filters.workerFilters.age.min > 18 || filters.workerFilters.age.max < 65) count++
    } else {
      count += filters.jobFilters.categories.length
      count += filters.jobFilters.jobType.length
      count += filters.jobFilters.duration.length
      count += filters.jobFilters.urgency.length
      if (filters.jobFilters.salary.min > 0 || filters.jobFilters.salary.max < 5000) count++
      if (filters.jobFilters.remote) count++
      if (filters.jobFilters.location) count++
    }
    return count
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search {searchType === 'workers' ? 'Workers' : 'Jobs'}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {showSavedSearches && savedSearches.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavedSearchesState(!showSavedSearches)}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Saved ({savedSearches.length})
              </Button>
            )}
            <Badge variant="secondary">
              {getActiveFiltersCount()} filters active
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Saved Searches */}
        {showSavedSearches && showSavedSearchesState && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Saved Searches</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavedSearchesState(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:bg-gray-50"
                  onClick={() => loadSavedSearch(search)}
                >
                  <div>
                    <p className="font-medium text-sm">{search.name}</p>
                    <p className="text-xs text-gray-500">
                      {search.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Search */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder={`Search ${searchType}...`}
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="w-full"
            />
          </div>
          <Button 
            onClick={search} 
            disabled={isSearching}
            className="px-6"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            Clear
          </Button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </Label>
              <Input
                placeholder="Enter location..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onBlur={() => updateNestedFilters('location', { address: locationInput })}
              />
              <div className="space-y-2">
                <Label className="text-sm">Search radius: {filters.location.radius} km</Label>
                <Slider
                  value={[filters.location.radius || 10]}
                  onValueChange={(value) => updateNestedFilters('location', { radius: value[0] })}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {searchType === 'workers' && (
              <>
                {/* Services */}
                <div className="space-y-2">
                  <Label>Services</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORKER_SERVICES.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={filters.workerFilters.services.includes(service)}
                          onCheckedChange={(checked) => {
                            const services = checked
                              ? [...filters.workerFilters.services, service]
                              : filters.workerFilters.services.filter(s => s !== service)
                            updateNestedFilters('workerFilters', { services })
                          }}
                        />
                        <Label htmlFor={service} className="text-sm">{service}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Hourly Rate (₹)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.workerFilters.hourlyRate.min, filters.workerFilters.hourlyRate.max]}
                      onValueChange={(value) => updateNestedFilters('workerFilters', { 
                        hourlyRate: { min: value[0], max: value[1] }
                      })}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>₹{filters.workerFilters.hourlyRate.min}</span>
                      <span>₹{filters.workerFilters.hourlyRate.max}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {searchType === 'jobs' && (
              <>
                {/* Job Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {JOB_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={filters.jobFilters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            const categories = checked
                              ? [...filters.jobFilters.categories, category]
                              : filters.jobFilters.categories.filter(c => c !== category)
                            updateNestedFilters('jobFilters', { categories })
                          }}
                        />
                        <Label htmlFor={category} className="text-sm">{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label>Salary Range (₹)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.jobFilters.salary.min, filters.jobFilters.salary.max]}
                      onValueChange={(value) => updateNestedFilters('jobFilters', { 
                        salary: { min: value[0], max: value[1] }
                      })}
                      max={5000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>₹{filters.jobFilters.salary.min}</span>
                      <span>₹{filters.jobFilters.salary.max}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {searchType === 'workers' ? (
              <>
                {/* Experience */}
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.workerFilters.experience.min, filters.workerFilters.experience.max]}
                      onValueChange={(value) => updateNestedFilters('workerFilters', { 
                        experience: { min: value[0], max: value[1] }
                      })}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{filters.workerFilters.experience.min} years</span>
                      <span>{filters.workerFilters.experience.max} years</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Rating (stars)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.workerFilters.rating.min, filters.workerFilters.rating.max]}
                      onValueChange={(value) => updateNestedFilters('workerFilters', { 
                        rating: { min: value[0], max: value[1] }
                      })}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>{filters.workerFilters.rating.min}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>{filters.workerFilters.rating.max}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABILITY_OPTIONS.map((slot) => (
                      <div key={slot} className="flex items-center space-x-2">
                        <Checkbox
                          id={slot}
                          checked={filters.workerFilters.availability.includes(slot)}
                          onCheckedChange={(checked) => {
                            const availability = checked
                              ? [...filters.workerFilters.availability, slot]
                              : filters.workerFilters.availability.filter(s => s !== slot)
                            updateNestedFilters('workerFilters', { availability })
                          }}
                        />
                        <Label htmlFor={slot} className="text-sm">{slot}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={language}
                          checked={filters.workerFilters.languages.includes(language)}
                          onCheckedChange={(checked) => {
                            const languages = checked
                              ? [...filters.workerFilters.languages, language]
                              : filters.workerFilters.languages.filter(l => l !== language)
                            updateNestedFilters('workerFilters', { languages })
                          }}
                        />
                        <Label htmlFor={language} className="text-sm">{language}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="space-y-3">
                  <Label>Additional Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasVehicle"
                        checked={filters.workerFilters.hasVehicle}
                        onCheckedChange={(checked) => 
                          updateNestedFilters('workerFilters', { hasVehicle: checked })
                        }
                      />
                      <Label htmlFor="hasVehicle">Has vehicle</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.workerFilters.verified}
                        onCheckedChange={(checked) => 
                          updateNestedFilters('workerFilters', { verified: checked })
                        }
                      />
                      <Label htmlFor="verified">Verified only</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender preference</Label>
                    <Select 
                      value={filters.workerFilters.gender} 
                      onValueChange={(value) => 
                        updateNestedFilters('workerFilters', { gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Age range</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[filters.workerFilters.age.min, filters.workerFilters.age.max]}
                        onValueChange={(value) => updateNestedFilters('workerFilters', { 
                          age: { min: value[0], max: value[1] }
                        })}
                        max={65}
                        min={18}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{filters.workerFilters.age.min} years</span>
                        <span>{filters.workerFilters.age.max} years</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Job Type */}
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {JOB_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.jobFilters.jobType.includes(type)}
                          onCheckedChange={(checked) => {
                            const jobType = checked
                              ? [...filters.jobFilters.jobType, type]
                              : filters.jobFilters.jobType.filter(t => t !== type)
                            updateNestedFilters('jobFilters', { jobType })
                          }}
                        />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Duration */}
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Immediate', 'This week', 'This month', 'Ongoing'].map((duration) => (
                      <div key={duration} className="flex items-center space-x-2">
                        <Checkbox
                          id={duration}
                          checked={filters.jobFilters.duration.includes(duration)}
                          onCheckedChange={(checked) => {
                            const durationArray = checked
                              ? [...filters.jobFilters.duration, duration]
                              : filters.jobFilters.duration.filter(d => d !== duration)
                            updateNestedFilters('jobFilters', { duration: durationArray })
                          }}
                        />
                        <Label htmlFor={duration} className="text-sm">{duration}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Urgency */}
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Urgent', 'High', 'Normal', 'Low'].map((urgency) => (
                      <div key={urgency} className="flex items-center space-x-2">
                        <Checkbox
                          id={urgency}
                          checked={filters.jobFilters.urgency.includes(urgency)}
                          onCheckedChange={(checked) => {
                            const urgencyArray = checked
                              ? [...filters.jobFilters.urgency, urgency]
                              : filters.jobFilters.urgency.filter(u => u !== urgency)
                            updateNestedFilters('jobFilters', { urgency: urgencyArray })
                          }}
                        />
                        <Label htmlFor={urgency} className="text-sm">{urgency}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={filters.jobFilters.remote}
                    onCheckedChange={(checked) => 
                      updateNestedFilters('jobFilters', { remote: checked })
                    }
                  />
                  <Label htmlFor="remote">Remote work available</Label>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Sorting */}
        <div className="space-y-2">
          <Label>Sort by</Label>
          <div className="flex space-x-2">
            <Select 
              value={filters.sorting.field} 
              onValueChange={(value) => updateFilters({ 
                sorting: { ...filters.sorting, field: value }
              })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.sorting.direction} 
              onValueChange={(value: 'asc' | 'desc') => updateFilters({ 
                sorting: { ...filters.sorting, direction: value }
              })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">↑</SelectItem>
                <SelectItem value="desc">↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Active Filters</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {filters.query && (
                <Badge variant="secondary">Search: {filters.query}</Badge>
              )}
              {filters.location.address && (
                <Badge variant="secondary">Location: {filters.location.address}</Badge>
              )}
              {searchType === 'workers' && (
                <>
                  {filters.workerFilters.services.map(service => (
                    <Badge key={service} variant="secondary">{service}</Badge>
                  ))}
                  {filters.workerFilters.availability.map(slot => (
                    <Badge key={slot} variant="secondary">{slot}</Badge>
                  ))}
                  {filters.workerFilters.languages.map(lang => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                  {filters.workerFilters.hasVehicle && (
                    <Badge variant="secondary">Has vehicle</Badge>
                  )}
                  {filters.workerFilters.verified && (
                    <Badge variant="secondary">Verified</Badge>
                  )}
                </>
              )}
              {searchType === 'jobs' && (
                <>
                  {filters.jobFilters.categories.map(cat => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                  {filters.jobFilters.jobType.map(type => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                  {filters.jobFilters.remote && (
                    <Badge variant="secondary">Remote</Badge>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}