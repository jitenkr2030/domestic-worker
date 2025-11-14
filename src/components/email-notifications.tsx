"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailService } from "@/lib/email-notifications"
import { 
  Mail, 
  Bell, 
  Settings, 
  Send, 
  Template,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Plus,
  RefreshCw
} from "lucide-react"

interface EmailComponentProps {
  userId: string
  userRole?: 'WORKER' | 'EMPLOYER' | 'AGENCY' | 'ADMIN'
  showTemplates?: boolean
  showSettings?: boolean
  showHistory?: boolean
}

interface EmailTemplate {
  id: string
  name: string
  description: string
  category: 'welcome' | 'reminder' | 'update' | 'notification' | 'marketing'
  subject: string
  content: string
  variables: string[]
  isActive: boolean
  lastModified: Date
  usageCount: number
}

interface EmailNotification {
  id: string
  templateId?: string
  recipientId: string
  recipientEmail: string
  recipientName: string
  subject: string
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced'
  sentAt: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  errorMessage?: string
  metadata: Record<string, any>
}

interface EmailSettings {
  userId: string
  notifications: {
    newJobs: boolean
    jobUpdates: boolean
    payments: boolean
    reviews: boolean
    marketing: boolean
    security: boolean
  }
  frequency: {
    immediate: boolean
    daily: boolean
    weekly: boolean
    monthly: boolean
  }
  deliveryTime: string
  timezone: string
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

const EMAIL_TEMPLATES = [
  {
    category: 'welcome' as const,
    name: 'Welcome Email',
    description: 'Welcome new users to the platform'
  },
  {
    category: 'reminder' as const,
    name: 'Appointment Reminder',
    description: 'Remind users about upcoming appointments'
  },
  {
    category: 'update' as const,
    name: 'Job Update',
    description: 'Notify about job status changes'
  },
  {
    category: 'notification' as const,
    name: 'Payment Notification',
    description: 'Payment confirmations and receipts'
  },
  {
    category: 'marketing' as const,
    name: 'New Features',
    description: 'Announce new platform features'
  }
]

export default function EmailComponent({
  userId,
  userRole = 'WORKER',
  showTemplates = true,
  showSettings = true,
  showHistory = true
}: EmailComponentProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    userId,
    notifications: {
      newJobs: true,
      jobUpdates: true,
      payments: true,
      reviews: true,
      marketing: false,
      security: true
    },
    frequency: {
      immediate: true,
      daily: false,
      weekly: false,
      monthly: false
    },
    deliveryTime: '09:00',
    timezone: 'Asia/Kolkata',
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  
  const emailService = new EmailService()

  useEffect(() => {
    loadEmailData()
  }, [userId])

  const loadEmailData = async () => {
    try {
      setIsLoading(true)
      
      // In real implementation, this would use the email service
      const [templatesData, notificationsData, settingsData] = await Promise.all([
        emailService.getTemplates(userId),
        emailService.getEmailHistory(userId),
        emailService.getUserSettings(userId)
      ])
      
      setTemplates(templatesData)
      setNotifications(notificationsData)
      setEmailSettings(settingsData)
    } catch (error) {
      console.error('Error loading email data:', error)
      // Set mock data for demonstration
      setTemplates(getMockTemplates())
      setNotifications(getMockNotifications())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockTemplates = (): EmailTemplate[] => [
    {
      id: '1',
      name: 'Welcome New Worker',
      description: 'Welcome email for new workers joining the platform',
      category: 'welcome',
      subject: 'Welcome to DomesticWorker Platform!',
      content: 'Dear {{name}},\n\nWelcome to our platform! We\'re excited to have you join our community of professional domestic workers.\n\nHere\'s what you can do:\n- Browse available jobs\n- Set your availability\n- Connect with employers\n- Build your profile\n\nBest regards,\nThe DomesticWorker Team',
      variables: ['{{name}}', '{{email}}', '{{role}}'],
      isActive: true,
      lastModified: new Date(Date.now() - 86400000),
      usageCount: 45
    },
    {
      id: '2',
      name: 'Appointment Reminder',
      description: 'Reminds users about upcoming appointments',
      category: 'reminder',
      subject: 'Appointment Reminder - {{service_type}}',
      content: 'Hi {{name}},\n\nThis is a reminder for your upcoming appointment:\n\nService: {{service_type}}\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nLocation: {{location}}\n\nPlease confirm your attendance.\n\nThanks!',
      variables: ['{{name}}', '{{service_type}}', '{{appointment_date}}', '{{appointment_time}}', '{{location}}'],
      isActive: true,
      lastModified: new Date(Date.now() - 172800000),
      usageCount: 123
    }
  ]

  const getMockNotifications = (): EmailNotification[] => [
    {
      id: '1',
      templateId: '1',
      recipientId: 'worker1',
      recipientEmail: 'sarah@example.com',
      recipientName: 'Sarah Wilson',
      subject: 'Welcome to DomesticWorker Platform!',
      content: 'Welcome email content...',
      status: 'delivered',
      sentAt: new Date(Date.now() - 86400000),
      deliveredAt: new Date(Date.now() - 86300000),
      openedAt: new Date(Date.now() - 86200000),
      metadata: { templateName: 'Welcome New Worker' }
    },
    {
      id: '2',
      recipientId: 'employer1',
      recipientEmail: 'john@example.com',
      recipientName: 'John Johnson',
      subject: 'New Job Application Received',
      content: 'New job application content...',
      status: 'sent',
      sentAt: new Date(Date.now() - 3600000),
      metadata: { jobId: 'job123', workerName: 'Alice Smith' }
    }
  ]

  const sendEmail = async (recipientId: string, subject: string, content: string) => {
    try {
      setIsSending(true)
      const emailData = {
        to: recipientId,
        subject,
        content,
        userId
      }
      
      // In real implementation, this would use the email service
      // await emailService.sendEmail(emailData)
      
      const newNotification: EmailNotification = {
        id: `email_${Date.now()}`,
        recipientId,
        recipientEmail: 'recipient@example.com',
        recipientName: 'Recipient Name',
        subject,
        content,
        status: 'sent',
        sentAt: new Date(),
        metadata: { type: 'manual_send' }
      }
      
      setNotifications(prev => [newNotification, ...prev])
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setIsSending(false)
    }
  }

  const saveTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      const newTemplate: EmailTemplate = {
        id: template.id || `template_${Date.now()}`,
        name: template.name || '',
        description: template.description || '',
        category: template.category || 'notification',
        subject: template.subject || '',
        content: template.content || '',
        variables: template.variables || [],
        isActive: template.isActive ?? true,
        lastModified: new Date(),
        usageCount: template.usageCount || 0
      }

      // In real implementation, this would use the email service
      // await emailService.saveTemplate(newTemplate)
      
      setTemplates(prev => {
        const existing = prev.findIndex(t => t.id === newTemplate.id)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = newTemplate
          return updated
        } else {
          return [newTemplate, ...prev]
        }
      })
      
      setShowTemplateEditor(false)
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const updateSettings = async (settings: Partial<EmailSettings>) => {
    try {
      const updatedSettings = { ...emailSettings, ...settings }
      
      // In real implementation, this would use the email service
      // await emailService.updateSettings(userId, updatedSettings)
      
      setEmailSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const getStatusIcon = (status: EmailNotification['status']) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'opened': return <Eye className="h-4 w-4 text-green-600" />
      case 'clicked': return <CheckCircle className="h-4 w-4 text-green-700" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'bounced': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: EmailNotification['status']) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'opened': return 'bg-green-200 text-green-900'
      case 'clicked': return 'bg-green-300 text-green-900'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'bounced': return 'bg-orange-100 text-orange-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (statusFilter !== 'all') {
      filtered = filtered.filter(email => email.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(query) ||
        email.recipientName.toLowerCase().includes(query) ||
        email.recipientEmail.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const getFilteredTemplates = () => {
    let filtered = templates

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter)
    }

    return filtered
  }

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading email data...</p>
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
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Mail className="h-6 w-6" />
            <span>Email Notifications</span>
          </h2>
          <Badge variant="secondary">
            {notifications.filter(n => n.status === 'sent').length} sent today
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowTemplateEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Email History</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="opened">Opened</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Email List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Emails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {getFilteredNotifications().map((email) => (
                    <div key={email.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(email.status)}
                            <h4 className="font-medium">{email.subject}</h4>
                            <Badge variant="outline" className={getStatusColor(email.status)}>
                              {email.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            To: {email.recipientName} ({email.recipientEmail})
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            {email.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Sent: {email.sentAt.toLocaleString()}</span>
                            {email.deliveredAt && (
                              <span>Delivered: {email.deliveredAt.toLocaleString()}</span>
                            )}
                            {email.openedAt && (
                              <span>Opened: {email.openedAt.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              {/* Template Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search templates..."
                        onChange={(e) => {
                          // Template search logic
                        }}
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredTemplates().map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{template.category}</Badge>
                          {template.isActive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Subject:</span>
                          <span className="font-medium">{template.subject}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Used:</span>
                          <span>{template.usageCount} times</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Last modified:</span>
                          <span>{template.lastModified.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setShowTemplateEditor(true)
                          }}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Template className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {/* Email Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Delivery Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.2%</div>
                    <div className="text-sm text-green-600">↑ 2.1% from last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Open Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">67.8%</div>
                    <div className="text-sm text-green-600">↑ 1.5% from last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Click Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23.4%</div>
                    <div className="text-sm text-red-600">↓ 0.8% from last month</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sent Today</span>
                <span className="font-medium">{notifications.filter(n => 
                  n.sentAt.toDateString() === new Date().toDateString()
                ).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Opened</span>
                <span className="font-medium">{notifications.filter(n => n.openedAt).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Templates</span>
                <span className="font-medium">{templates.filter(t => t.isActive).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Failed</span>
                <span className="font-medium text-red-600">{notifications.filter(n => n.status === 'failed').length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Template className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Test Notifications
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 3).map((email) => (
                <div key={email.id} className="flex items-start space-x-2">
                  {getStatusIcon(email.status)}
                  <div className="flex-1">
                    <p className="text-sm">{email.subject}</p>
                    <p className="text-xs text-gray-500">
                      {email.sentAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          {showTemplateEditor && (
            <TemplateEditor
              template={selectedTemplate}
              onSave={saveTemplate}
              onCancel={() => {
                setShowTemplateEditor(false)
                setSelectedTemplate(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Email Settings</DialogTitle>
          </DialogHeader>
          {showSettingsPanel && (
            <EmailSettings
              settings={emailSettings}
              onSave={updateSettings}
              onCancel={() => setShowSettingsPanel(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Template Editor Component
function TemplateEditor({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: EmailTemplate | null
  onSave: (template: Partial<EmailTemplate>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'notification',
    subject: template?.subject || '',
    content: template?.content || ''
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Template Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMAIL_TEMPLATES.map(t => (
                <SelectItem key={t.category} value={t.category}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of this template"
        />
      </div>

      <div>
        <Label>Subject</Label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Email subject line"
        />
      </div>

      <div>
        <Label>Content</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Email content (use {{variable}} for dynamic content)"
          rows={8}
        />
      </div>

      <div className="text-sm text-gray-500">
        Available variables: {'{name}'}, {'{email}'}, {'{role}'}, {'{service_type}'}, {'{appointment_date}'}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onSave({
            ...template,
            ...formData,
            variables: ['{{name}}', '{{email}}'] // Extract from content
          })}
        >
          {template ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </div>
  )
}

// Email Settings Component
function EmailSettings({ 
  settings, 
  onSave, 
  onCancel 
}: { 
  settings: EmailSettings
  onSave: (settings: Partial<EmailSettings>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState(settings)

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium">Notification Types</Label>
        <div className="space-y-3 mt-2">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <Switch
                checked={formData.notifications[key as keyof typeof formData.notifications]}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [key]: checked
                    }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Delivery Frequency</Label>
        <div className="space-y-3 mt-2">
          {Object.entries(settings.frequency).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">{key}</span>
              <Switch
                checked={formData.frequency[key as keyof typeof formData.frequency]}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    frequency: {
                      ...prev.frequency,
                      [key]: checked
                    }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Quiet Hours</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            checked={formData.quietHours.enabled}
            onCheckedChange={(checked) => 
              setFormData(prev => ({
                ...prev,
                quietHours: {
                  ...prev.quietHours,
                  enabled: checked
                }
              }))
            }
          />
          <span className="text-sm">Enable quiet hours</span>
        </div>
        {formData.quietHours.enabled && (
          <div className="flex space-x-2 mt-2">
            <Input
              type="time"
              value={formData.quietHours.start}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours,
                    start: e.target.value
                  }
                }))
              }
            />
            <Input
              type="time"
              value={formData.quietHours.end}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours,
                    end: e.target.value
                  }
                }))
              }
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}