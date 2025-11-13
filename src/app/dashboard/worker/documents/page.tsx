"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Download,
  Trash2,
  Shield,
  IdCard,
  Home,
  Heart,
  Award
} from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  status: "PENDING" | "VERIFIED" | "REJECTED"
  uploadedAt: string
  fileUrl?: string
  fileSize?: string
  rejectionReason?: string
}

export default function WorkerDocuments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "WORKER") {
      router.push("/unauthorized")
    } else {
      // TODO: Fetch documents from API
      setDocuments([
        {
          id: "1",
          name: "Government ID",
          type: "ID_PROOF",
          status: "VERIFIED",
          uploadedAt: "2024-01-15",
          fileUrl: "/documents/id-proof.pdf",
          fileSize: "2.4 MB"
        },
        {
          id: "2",
          name: "Police Verification Certificate",
          type: "POLICE_VERIFICATION",
          status: "PENDING",
          uploadedAt: "2024-01-20",
          fileSize: "1.8 MB"
        },
        {
          id: "3",
          name: "Address Proof",
          type: "ADDRESS_PROOF",
          status: "VERIFIED",
          uploadedAt: "2024-01-18",
          fileUrl: "/documents/address-proof.pdf",
          fileSize: "3.1 MB"
        },
        {
          id: "4",
          name: "Health Certificate",
          type: "HEALTH_CERTIFICATE",
          status: "REJECTED",
          uploadedAt: "2024-01-22",
          rejectionReason: "Certificate is expired. Please upload a valid one."
        }
      ])
    }
  }, [session, status, router])

  const handleFileUpload = async (documentType: string, file: File) => {
    setUploading(documentType)
    setError("")

    try {
      // TODO: Implement file upload logic
      console.log(`Uploading ${documentType}:`, file)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess("Document uploaded successfully! It will be reviewed within 24 hours.")
      
      // Update documents list
      const newDocument: Document = {
        id: Date.now().toString(),
        name: getDocumentName(documentType),
        type: documentType,
        status: "PENDING",
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      }
      
      setDocuments(prev => [...prev, newDocument])
    } catch (error) {
      setError("Failed to upload document. Please try again.")
    } finally {
      setUploading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "PENDING": return <Clock className="w-4 h-4 text-yellow-500" />
      case "REJECTED": return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "ID_PROOF": return <IdCard className="w-5 h-5" />
      case "POLICE_VERIFICATION": return <Shield className="w-5 h-5" />
      case "ADDRESS_PROOF": return <Home className="w-5 h-5" />
      case "HEALTH_CERTIFICATE": return <Heart className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getDocumentName = (type: string) => {
    switch (type) {
      case "ID_PROOF": return "Government ID"
      case "POLICE_VERIFICATION": return "Police Verification Certificate"
      case "ADDRESS_PROOF": return "Address Proof"
      case "HEALTH_CERTIFICATE": return "Health Certificate"
      case "SKILL_CERTIFICATE": return "Skill Certificate"
      case "EXPERIENCE_CERTIFICATE": return "Experience Certificate"
      default: return "Document"
    }
  }

  const requiredDocuments = [
    { type: "ID_PROOF", name: "Government ID", description: "Passport, Driver's License, or National ID" },
    { type: "POLICE_VERIFICATION", name: "Police Verification", description: "Police clearance certificate" },
    { type: "ADDRESS_PROOF", name: "Address Proof", description: "Utility bill or rental agreement" },
    { type: "HEALTH_CERTIFICATE", name: "Health Certificate", description: "Medical fitness certificate" }
  ]

  const optionalDocuments = [
    { type: "SKILL_CERTIFICATE", name: "Skill Certificate", description: "Training or course certificates" },
    { type: "EXPERIENCE_CERTIFICATE", name: "Experience Certificate", description: "Previous employment certificates" }
  ]

  const handleFileChange = (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(documentType, file)
    }
  }

  const getVerificationProgress = () => {
    const totalDocuments = requiredDocuments.length
    const verifiedDocuments = documents.filter(doc => 
      requiredDocuments.some(req => req.type === doc.type) && doc.status === "VERIFIED"
    ).length
    return (verifiedDocuments / totalDocuments) * 100
  }

  if (status === "loading") {
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
              <h1 className="text-2xl font-bold text-gray-900">Verification Documents</h1>
            </div>
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

        {/* Verification Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Verification Progress
            </CardTitle>
            <CardDescription>
              Complete your verification to increase trust and get more job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Verification</span>
                <span className="text-sm text-gray-600">{getVerificationProgress().toFixed(0)}% Complete</span>
              </div>
              <Progress value={getVerificationProgress()} className="h-2" />
              <p className="text-sm text-gray-600">
                {documents.filter(doc => doc.status === "VERIFIED").length} of {requiredDocuments.length} required documents verified
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Required Documents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Required Documents
            </CardTitle>
            <CardDescription>
              These documents are mandatory for profile verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requiredDocuments.map((docType) => {
                const existingDoc = documents.find(doc => doc.type === docType.type)
                const isUploading = uploading === docType.type
                
                return (
                  <div key={docType.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getDocumentIcon(docType.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{docType.name}</h4>
                          <p className="text-sm text-gray-600">{docType.description}</p>
                        </div>
                      </div>
                      
                      {existingDoc ? (
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(existingDoc.status)}
                          <Badge className={getStatusColor(existingDoc.status)}>
                            {existingDoc.status}
                          </Badge>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id={`file-${docType.type}`}
                            className="hidden"
                            onChange={(e) => handleFileChange(docType.type, e)}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                          >
                            <label htmlFor={`file-${docType.type}`} className="cursor-pointer">
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {existingDoc && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Uploaded on {existingDoc.uploadedAt}</span>
                          {existingDoc.fileSize && <span>{existingDoc.fileSize}</span>}
                        </div>
                        {existingDoc.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Rejection Reason:</strong> {existingDoc.rejectionReason}
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          {existingDoc.fileUrl && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                          <input
                            type="file"
                            id={`reupload-${docType.type}`}
                            className="hidden"
                            onChange={(e) => handleFileChange(docType.type, e)}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                          >
                            <label htmlFor={`reupload-${docType.type}`} className="cursor-pointer">
                              {isUploading ? "Uploading..." : "Re-upload"}
                            </label>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Optional Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Optional Documents
            </CardTitle>
            <CardDescription>
              These documents can help improve your profile credibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optionalDocuments.map((docType) => {
                const existingDoc = documents.find(doc => doc.type === docType.type)
                const isUploading = uploading === docType.type
                
                return (
                  <div key={docType.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getDocumentIcon(docType.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{docType.name}</h4>
                          <p className="text-sm text-gray-600">{docType.description}</p>
                        </div>
                      </div>
                      
                      {existingDoc ? (
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(existingDoc.status)}
                          <Badge className={getStatusColor(existingDoc.status)}>
                            {existingDoc.status}
                          </Badge>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id={`optional-file-${docType.type}`}
                            className="hidden"
                            onChange={(e) => handleFileChange(docType.type, e)}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                          >
                            <label htmlFor={`optional-file-${docType.type}`} className="cursor-pointer">
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {existingDoc && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Uploaded on {existingDoc.uploadedAt}</span>
                          {existingDoc.fileSize && <span>{existingDoc.fileSize}</span>}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {existingDoc.fileUrl && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}