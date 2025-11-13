import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "AGENCY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()
    const applicationId = params.id

    // Find the application and verify ownership
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            employer: true,
            agency: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Verify the user owns this application
    const isOwner = 
      (session.user.role === "EMPLOYER" && application.job.employer?.userId === session.user.id) ||
      (session.user.role === "AGENCY" && application.job.agency?.userId === session.user.id)

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let newStatus: string
    switch (action) {
      case "REVIEWING":
        newStatus = "REVIEWING"
        break
      case "SHORTLIST":
        newStatus = "SHORTLISTED"
        break
      case "ACCEPT":
        newStatus = "ACCEPTED"
        break
      case "REJECT":
        newStatus = "REJECTED"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: true,
            workType: true,
            salaryAmount: true,
            salaryType: true
          }
        },
        worker: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                avatar: true
              }
            },
            skills: {
              include: {
                skill: {
                  select: {
                    name: true,
                    category: true
                  }
                }
              }
            },
            reviews: {
              select: {
                rating: true,
                comment: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applicationId = params.id

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            employer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true
                  }
                }
              }
            },
            agency: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        worker: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                avatar: true
              }
            },
            skills: {
              include: {
                skill: {
                  select: {
                    name: true,
                    category: true,
                    description: true
                  }
                }
              }
            },
            documents: {
              select: {
                type: true,
                name: true,
                isVerified: true
              }
            },
            reviews: {
              include: {
                reviewer: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Verify the user has permission to view this application
    const isWorker = session.user.role === "WORKER" && application.worker.userId === session.user.id
    const isEmployer = session.user.role === "EMPLOYER" && application.job.employer?.userId === session.user.id
    const isAgency = session.user.role === "AGENCY" && application.job.agency?.userId === session.user.id

    if (!isWorker && !isEmployer && !isAgency) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}