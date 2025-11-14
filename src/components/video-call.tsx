"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { VideoCallService } from "@/lib/video-calling"
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Camera,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  Users,
  Square,
  MoreVertical,
  RotateCcw
} from "lucide-react"

interface VideoCallProps {
  sessionId?: string
  fromUserId: string
  toUserId: string
  toUser?: {
    id: string
    name: string
    avatar?: string
    role: 'WORKER' | 'EMPLOYER' | 'AGENCY' | 'ADMIN'
  }
  isInitiator: boolean
  onCallEnd?: () => void
  onCallStart?: (sessionId: string) => void
}

interface CallStats {
  duration: number
  connectionQuality: 'excellent' | 'good' | 'poor'
  participants: number
}

export default function VideoCall({
  sessionId,
  fromUserId,
  toUserId,
  toUser,
  isInitiator,
  onCallEnd,
  onCallStart
}: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId)
  const [callStats, setCallStats] = useState<CallStats>({
    duration: 0,
    connectionQuality: 'good',
    participants: 2
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showStats, setShowStats] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callContainerRef = useRef<HTMLDivElement>(null)
  const videoCallService = useRef(new VideoCallService())
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isInitiator && !sessionId) {
      startOutgoingCall()
    } else if (sessionId) {
      joinCall(sessionId)
    }
  }, [isInitiator, sessionId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
        setCallStats(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCallActive])

  const startOutgoingCall = async () => {
    try {
      const session = await videoCallService.current.initiateCall(fromUserId, toUserId)
      setCurrentSessionId(session.id)
      setIsCallActive(true)
      onCallStart?.(session.id)
      setupLocalVideo()
    } catch (error) {
      console.error("Error starting call:", error)
      alert("Failed to start video call. Please check your camera and microphone permissions.")
    }
  }

  const joinCall = async (sessionId: string) => {
    try {
      await videoCallService.current.joinCall(sessionId, fromUserId)
      setCurrentSessionId(sessionId)
      setIsCallActive(true)
      setupLocalVideo()
    } catch (error) {
      console.error("Error joining call:", error)
      alert("Failed to join video call.")
    }
  }

  const setupLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
      setIsVideoEnabled(false)
      setIsAudioEnabled(false)
    }
  }

  const toggleVideo = async () => {
    try {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.enabled = !isVideoEnabled
          setIsVideoEnabled(!isVideoEnabled)
        }
      }
    } catch (error) {
      console.error("Error toggling video:", error)
    }
  }

  const toggleAudio = async () => {
    try {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        const audioTrack = stream.getAudioTracks()[0]
        if (audioTrack) {
          audioTrack.enabled = !isAudioEnabled
          setIsAudioEnabled(!isAudioEnabled)
        }
      }
    } catch (error) {
      console.error("Error toggling audio:", error)
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await videoCallService.current.stopScreenShare(currentSessionId!)
        setIsScreenSharing(false)
      } else {
        await videoCallService.current.startScreenShare(currentSessionId!)
        setIsScreenSharing(true)
      }
    } catch (error) {
      console.error("Error toggling screen share:", error)
    }
  }

  const endCall = async () => {
    try {
      if (currentSessionId) {
        await videoCallService.current.endCall(currentSessionId)
      }
      
      // Stop all media tracks
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
      
      setIsCallActive(false)
      setCurrentSessionId(undefined)
      onCallEnd?.()
    } catch (error) {
      console.error("Error ending call:", error)
      // Still cleanup locally
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
      setIsCallActive(false)
      onCallEnd?.()
    }
  }

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        await videoCallService.current.startRecording(currentSessionId!)
        setIsRecording(true)
      } else {
        await videoCallService.current.stopRecording(currentSessionId!)
        setIsRecording(false)
      }
    } catch (error) {
      console.error("Error toggling recording:", error)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (callContainerRef.current?.requestFullscreen) {
        callContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const getConnectionQualityIndicator = () => {
    const baseClasses = "w-2 h-2 rounded-full"
    switch (callStats.connectionQuality) {
      case 'excellent': return <div className={`${baseClasses} bg-green-500`}></div>
      case 'good': return <div className={`${baseClasses} bg-yellow-500`}></div>
      case 'poor': return <div className={`${baseClasses} bg-red-500`}></div>
      default: return <div className={`${baseClasses} bg-gray-500`}></div>
    }
  }

  if (!isCallActive) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle className="text-lg mb-2">Video Call</CardTitle>
          <p className="text-sm text-gray-600 text-center mb-4">
            {isInitiator ? 'Calling...' : 'Incoming call from...'}
          </p>
          {toUser && (
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {toUser.avatar ? (
                  <img src={toUser.avatar} alt={toUser.name} className="w-12 h-12 rounded-full" />
                ) : (
                  <span className="text-lg font-medium">{toUser.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-medium">{toUser.name}</p>
                <p className="text-sm text-gray-500">{toUser.role}</p>
              </div>
            </div>
          )}
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onCallEnd}
              className="w-16 h-16 rounded-full"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button 
              size="lg" 
              onClick={() => startOutgoingCall()}
              className="w-16 h-16 rounded-full"
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      ref={callContainerRef}
      className="w-full h-[600px] relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="absolute inset-0 bg-black">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isMuted}
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className={`absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg transition-opacity ${showControls ? 'opacity-100' : 'opacity-75'}`}>
          <video
            ref={localVideoRef}
            className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            autoPlay
            playsInline
            muted
          />
          {!isVideoEnabled && (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">{toUser?.name?.charAt(0) || 'Y'}</span>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">You</Badge>
          </div>
        </div>

        {/* Call Status Overlay */}
        <div className={`absolute top-4 left-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-black/50 text-white px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {formatDuration(callDuration)}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-black/50 text-white px-3 py-2 rounded-lg">
              {getConnectionQualityIndicator()}
              <span className="text-xs">HD</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/50 text-white px-3 py-2 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="text-xs">{callStats.participants}</span>
            </div>
          </div>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-16 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-medium">REC</span>
          </div>
        )}

        {/* Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-center space-x-4">
            {/* Audio Toggle */}
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              className={`w-14 h-14 rounded-full ${!isAudioEnabled ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </Button>

            {/* Video Toggle */}
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              className={`w-14 h-14 rounded-full ${!isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>

            {/* Screen Share */}
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              className={`w-14 h-14 rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </Button>

            {/* Recording */}
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              className={`w-14 h-14 rounded-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={toggleRecording}
            >
              <Square className="w-6 h-6" />
            </Button>

            {/* More Options */}
            <Button
              variant="outline"
              size="lg"
              className="w-14 h-14 rounded-full"
              onClick={() => setShowStats(!showStats)}
            >
              <Settings className="w-6 h-6" />
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              className="w-14 h-14 rounded-full"
              onClick={endCall}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className={`absolute top-20 right-4 bg-black/80 text-white p-4 rounded-lg transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{formatDuration(callDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <span className={getQualityColor(callStats.connectionQuality)}>
                  {callStats.connectionQuality}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Resolution:</span>
                <span>1280x720</span>
              </div>
              <div className="flex justify-between">
                <span>FPS:</span>
                <span>30</span>
              </div>
              <div className="flex justify-between">
                <span>Bitrate:</span>
                <span>1.2 Mbps</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}