"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChatService } from "@/lib/chat-system"
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreHorizontal,
  User,
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  File
} from "lucide-react"
import { format } from "date-fns"

interface ChatInterfaceProps {
  chatRoomId: string
  currentUserId: string
  participants: Array<{
    id: string
    name: string
    avatar?: string
    role: 'WORKER' | 'EMPLOYER' | 'AGENCY' | 'ADMIN'
    isOnline?: boolean
  }>
  onClose?: () => void
}

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  type: 'text' | 'file' | 'image'
  fileUrl?: string
  fileName?: string
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

export default function ChatInterface({ 
  chatRoomId, 
  currentUserId, 
  participants, 
  onClose 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [showParticipants, setShowParticipants] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatService = useRef(new ChatService())

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    loadChatHistory()
    const interval = setInterval(loadChatHistory, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [chatRoomId])

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      // Simulate loading chat history
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Hi! I'm interested in your cleaning service.",
          senderId: participants[0]?.id || "employer1",
          timestamp: new Date(Date.now() - 86400000),
          type: "text",
          status: "read"
        },
        {
          id: "2",
          content: "Hello! I'd be happy to help. I have availability this weekend.",
          senderId: currentUserId,
          timestamp: new Date(Date.now() - 86300000),
          type: "text",
          status: "read"
        },
        {
          id: "3",
          content: "Great! What are your rates?",
          senderId: participants[0]?.id || "employer1",
          timestamp: new Date(Date.now() - 86200000),
          type: "text",
          status: "delivered"
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error("Error loading chat history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !attachmentFile) return

    const messageId = `temp_${Date.now()}`
    const tempMessage: Message = {
      id: messageId,
      content: newMessage || "Attachment",
      senderId: currentUserId,
      timestamp: new Date(),
      type: attachmentFile ? 
        (attachmentFile.type.startsWith('image/') ? 'image' : 'file') : 
        'text',
      status: 'sending'
    }

    if (attachmentFile) {
      tempMessage.fileName = attachmentFile.name
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage("")
    setAttachmentFile(null)

    try {
      // In real implementation, this would use the ChatService
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sent' as const }
          : msg
      ))
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sending' as const }
          : msg
      ))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAttachmentFile(file)
    }
  }

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending': return <Clock className="h-3 w-3 text-gray-400" />
      case 'sent': return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered': return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
  }

  const getMessageBg = (message: Message) => {
    if (message.senderId === currentUserId) {
      switch (message.status) {
        case 'sending': return 'bg-gray-200'
        case 'sent': return 'bg-gray-100'
        case 'delivered': return 'bg-blue-100'
        case 'read': return 'bg-blue-500'
      }
    }
    return 'bg-gray-100'
  }

  const getMessageTextColor = (message: Message) => {
    return message.senderId === currentUserId ? 'text-white' : 'text-gray-900'
  }

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm')
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={participants[0]?.avatar} />
                <AvatarFallback>
                  {participants[0]?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {participants[0]?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {participants[0]?.name || 'Chat'}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={participants[0]?.isOnline ? "default" : "secondary"}>
                  {participants[0]?.isOnline ? 'Online' : 'Offline'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {participants.length > 1 ? `${participants.length} participants` : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showParticipants && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Participants</h4>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-xs">
                      {participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{participant.name}</span>
                  {participant.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId
              const prevMessage = messages[index - 1]
              const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId
              
              return (
                <div
                  key={message.id}
                  className={`flex items-end space-x-2 ${
                    isOwn ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isOwn && showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participants.find(p => p.id === message.senderId)?.avatar} />
                      <AvatarFallback className="text-xs">
                        {participants.find(p => p.id === message.senderId)?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!isOwn && !showAvatar && <div className="w-8"></div>}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn 
                        ? `${getMessageBg(message)} ${getMessageTextColor(message)}`
                        : 'bg-white border'
                    }`}
                  >
                    {message.type === 'file' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm">{message.fileName}</span>
                      </div>
                    )}
                    
                    {message.type === 'image' && (
                      <div className="mb-2">
                        <ImageIcon className="h-4 w-4 mb-1" />
                        <span className="text-sm">{message.fileName}</span>
                      </div>
                    )}
                    
                    <p className="text-sm">{message.content}</p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwn && (
                        <div className="ml-2">
                          {getStatusIcon(message.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {isTyping && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">...</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        {attachmentFile && (
          <div className="p-3 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {attachmentFile.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                ) : (
                  <File className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">{attachmentFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(attachmentFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAttachmentFile(null)}
              >
                ×
              </Button>
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              disabled={!newMessage.trim() && !attachmentFile}
              onClick={sendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx"
          />
        </div>
      </CardContent>
    </Card>
  )
}