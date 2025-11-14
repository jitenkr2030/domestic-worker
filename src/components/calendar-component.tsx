"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { CalendarService } from "@/lib/calendar-integration"
import { 
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Video,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Bell,
  RefreshCw
} from "lucide-react"
import { format, isSameDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"

interface CalendarProps {
  userId: string
  userRole?: 'WORKER' | 'EMPLOYER' | 'AGENCY' | 'ADMIN'
  initialDate?: Date
  showFilters?: boolean
  showIntegration?: boolean
}

interface Appointment {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  location?: string
  isOnline?: boolean
  meetingUrl?: string
  attendees: Array<{
    id: string
    name: string
    email: string
    role: string
    avatar?: string
  }>
  reminders: Array<{
    type: 'email' | 'sms' | 'push'
    timing: number // minutes before appointment
    sent: boolean
  }>
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: Date
  }
  metadata: Record<string, any>
}

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
]

const APPOINTMENT_TYPES = [
  'Job Interview', 'Service Delivery', 'Consultation', 'Follow-up', 
  'Training', 'Assessment', 'Recurring Service', 'Emergency'
]

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-yellow-100 text-yellow-800'
}

export default function Calendar({
  userId,
  userRole = 'WORKER',
  initialDate = new Date(),
  showFilters = true,
  showIntegration = true
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  })
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  
  const calendarService = new CalendarService()

  useEffect(() => {
    loadAppointments()
  }, [currentDate, viewMode])

  useEffect(() => {
    filterAppointments()
  }, [appointments, filters])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      // Calculate date range based on view mode
      let startDate: Date
      let endDate: Date
      
      switch (viewMode) {
        case 'day':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          endDate = addDays(startDate, 1)
          break
        case 'week':
          startDate = startOfWeek(currentDate)
          endDate = endOfWeek(currentDate)
          break
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          break
      }
      
      // In real implementation, this would use the calendar service
      const appointmentsData = await calendarService.getAppointments(userId, startDate, endDate)
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error loading appointments:', error)
      // Set mock data for demonstration
      setAppointments(getMockAppointments())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockAppointments = (): Appointment[] => [
    {
      id: '1',
      title: 'House Cleaning Service',
      description: 'Regular weekly cleaning for the Johnson family',
      startTime: new Date(2025, 10, 15, 9, 0), // Nov 15, 2025, 9:00 AM
      endTime: new Date(2025, 10, 15, 12, 0),
      status: 'confirmed',
      location: '123 Oak Street, Mumbai',
      attendees: [
        { id: 'worker1', name: 'Sarah Worker', email: 'sarah@email.com', role: 'WORKER' },
        { id: 'employer1', name: 'John Johnson', email: 'john@email.com', role: 'EMPLOYER' }
      ],
      reminders: [
        { type: 'email', timing: 60, sent: true },
        { type: 'sms', timing: 30, sent: false }
      ],
      metadata: { serviceType: 'house_cleaning', duration: 180 }
    },
    {
      id: '2',
      title: 'Childcare Interview',
      description: 'Interview for part-time nanny position',
      startTime: new Date(2025, 10, 16, 14, 0),
      endTime: new Date(2025, 10, 16, 15, 30),
      status: 'scheduled',
      isOnline: true,
      meetingUrl: 'https://zoom.us/j/123456789',
      attendees: [
        { id: 'candidate1', name: 'Alice Smith', email: 'alice@email.com', role: 'WORKER' },
        { id: 'employer2', name: 'Mary Brown', email: 'mary@email.com', role: 'EMPLOYER' }
      ],
      reminders: [
        { type: 'email', timing: 120, sent: true },
        { type: 'push', timing: 15, sent: false }
      ],
      metadata: { interviewType: 'nanny', duration: 90 }
    },
    {
      id: '3',
      title: 'Elderly Care Follow-up',
      description: 'Monthly follow-up check-in',
      startTime: new Date(2025, 10, 17, 16, 0),
      endTime: new Date(2025, 10, 17, 17, 0),
      status: 'completed',
      location: '456 Pine Avenue, Delhi',
      attendees: [
        { id: 'caregiver1', name: 'Bob Wilson', email: 'bob@email.com', role: 'WORKER' },
        { id: 'family1', name: 'David Lee', email: 'david@email.com', role: 'EMPLOYER' }
      ],
      reminders: [
        { type: 'email', timing: 60, sent: true }
      ],
      metadata: { serviceType: 'elderly_care', duration: 60 }
    }
  ]

  const filterAppointments = () => {
    let filtered = appointments

    if (filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status)
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(apt => 
        apt.metadata.serviceType === filters.type || 
        apt.metadata.interviewType === filters.type
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.title.toLowerCase().includes(searchLower) ||
        apt.description.toLowerCase().includes(searchLower) ||
        apt.attendees.some(attendee => 
          attendee.name.toLowerCase().includes(searchLower)
        )
      )
    }

    setFilteredAppointments(filtered)
  }

  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      const newAppointment: Appointment = {
        id: `apt_${Date.now()}`,
        title: appointmentData.title || '',
        description: appointmentData.description || '',
        startTime: appointmentData.startTime || new Date(),
        endTime: appointmentData.endTime || new Date(Date.now() + 60 * 60 * 1000),
        status: 'scheduled',
        attendees: appointmentData.attendees || [],
        reminders: [
          { type: 'email', timing: 60, sent: false },
          { type: 'sms', timing: 30, sent: false }
        ],
        metadata: appointmentData.metadata || {}
      }

      if (appointmentData.isOnline) {
        newAppointment.isOnline = true
        newAppointment.meetingUrl = `https://meet.domaiclocator.com/room/${newAppointment.id}`
      }

      // In real implementation, this would use the calendar service
      // await calendarService.createAppointment(newAppointment)
      
      setAppointments(prev => [...prev, newAppointment])
      setShowNewAppointment(false)
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const updatedAppointments = appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, ...updates } : apt
      )
      setAppointments(updatedAppointments)
      // In real implementation, update in backend
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    try {
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      // In real implementation, delete from backend
    } catch (error) {
      console.error('Error deleting appointment:', error)
    }
  }

  const navigateCalendar = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1))
        break
      case 'week':
        setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7))
        break
      case 'month':
        setCurrentDate(prev => 
          new Date(prev.getFullYear(), prev.getMonth() + (direction === 'next' ? 1 : -1), 1)
        )
        break
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(apt =>
      isSameDay(apt.startTime, date)
    )
  }

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-3 w-3" />
      case 'confirmed': return <Check className="h-3 w-3" />
      case 'completed': return <Check className="h-3 w-3" />
      case 'cancelled': return <X className="h-3 w-3" />
      case 'rescheduled': return <RefreshCw className="h-3 w-3" />
    }
  }

  const AppointmentForm = ({ appointment, onSave, onCancel }: {
    appointment?: Appointment
    onSave: (data: Partial<Appointment>) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      title: appointment?.title || '',
      description: appointment?.description || '',
      startTime: appointment?.startTime ? format(appointment.startTime, 'yyyy-MM-dd') : '',
      startHour: appointment?.startTime ? format(appointment.startTime, 'HH:mm') : '09:00',
      endTime: appointment?.endTime ? format(appointment.endTime, 'yyyy-MM-dd') : '',
      endHour: appointment?.endTime ? format(appointment.endTime, 'HH:mm') : '10:00',
      type: appointment?.metadata?.serviceType || appointment?.metadata?.interviewType || '',
      location: appointment?.location || '',
      isOnline: appointment?.isOnline || false,
      attendees: appointment?.attendees || []
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const startDateTime = new Date(`${formData.startTime}T${formData.startHour}`)
      const endDateTime = new Date(`${formData.endTime}T${formData.endHour}`)
      
      onSave({
        title: formData.title,
        description: formData.description,
        startTime: startDateTime,
        endTime: endDateTime,
        location: formData.location,
        isOnline: formData.isOnline,
        metadata: {
          serviceType: formData.type,
          interviewType: formData.type
        }
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Appointment title"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Additional details"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="start-time">Start Time</Label>
            <Select value={formData.startHour} onValueChange={(value) => setFormData(prev => ({ ...prev, startHour: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="end-time">End Time</Label>
            <Select value={formData.endHour} onValueChange={(value) => setFormData(prev => ({ ...prev, endHour: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Enter location or leave blank for online meeting"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isOnline"
            checked={formData.isOnline}
            onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
          />
          <Label htmlFor="isOnline">Online meeting</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {appointment ? 'Update' : 'Create'} Appointment
          </Button>
        </div>
      </form>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateCalendar('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-32 text-center">
              {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
              {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM dd')}`}
              {viewMode === 'day' && format(currentDate, 'MMMM dd, yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateCalendar('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
          
          <Button onClick={() => setShowNewAppointment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <CalendarComponent
                mode="single"
                selected={selectedDate || currentDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentDate}
                onMonthChange={setCurrentDate}
                className="w-full"
                classNames={{
                  day_selected: 'bg-blue-500 text-white',
                  day_today: 'bg-blue-100 text-blue-900',
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Filters */}
          {showFilters && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {showFiltersPanel && (
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Search</Label>
                    <Input
                      placeholder="Search appointments..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {APPOINTMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAppointments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No appointments found
                </p>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{appointment.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(appointment.startTime, 'MMM dd, HH:mm')} - 
                            {format(appointment.endTime, 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={STATUS_COLORS[appointment.status]}
                          >
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Start Video Call
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Sync Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedAppointment.title}</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Edit functionality
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Date & Time</Label>
                    <p className="text-sm text-gray-600">
                      {format(selectedAppointment.startTime, 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(selectedAppointment.startTime, 'HH:mm')} - {format(selectedAppointment.endTime, 'HH:mm')}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={STATUS_COLORS[selectedAppointment.status]}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1 capitalize">{selectedAppointment.status}</span>
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {selectedAppointment.isOnline ? (
                        <>
                          <Video className="h-4 w-4" />
                          <span>Online Meeting</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span>{selectedAppointment.location || 'No location specified'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedAppointment.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-gray-600">{selectedAppointment.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Attendees ({selectedAppointment.attendees.length})</Label>
                    <div className="space-y-2">
                      {selectedAppointment.attendees.map((attendee) => (
                        <div key={attendee.id} className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{attendee.name}</p>
                            <p className="text-xs text-gray-500">{attendee.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Reminders</Label>
                    <div className="space-y-2">
                      {selectedAppointment.reminders.map((reminder, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{reminder.type}</span>
                          <div className="flex items-center space-x-2">
                            <span>{reminder.timing} min before</span>
                            {reminder.sent ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedAppointment.isOnline && selectedAppointment.meetingUrl && (
                    <div>
                      <Label className="text-sm font-medium">Meeting Link</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => window.open(selectedAppointment.meetingUrl, '_blank')}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => updateAppointment(selectedAppointment.id, { status: 'confirmed' })}
                  disabled={selectedAppointment.status === 'confirmed'}
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateAppointment(selectedAppointment.id, { status: 'cancelled' })}
                  disabled={selectedAppointment.status === 'cancelled'}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowNewAppointment(true)}
                >
                  Reschedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            onSave={createAppointment}
            onCancel={() => setShowNewAppointment(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}