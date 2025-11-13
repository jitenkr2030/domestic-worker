import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "AGENCY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get employer or agency ID based on role
    let userId: string
    if (session.user.role === "EMPLOYER") {
      const employer = await prisma.employer.findUnique({
        where: { userId: session.user.id }
      })
      if (!employer) {
        return NextResponse.json({ error: "Employer not found" }, { status: 404 })
      }
      userId = employer.id
    } else {
      const agency = await prisma.agency.findUnique({
        where: { userId: session.user.id }
      })
      if (!agency) {
        return NextResponse.json({ error: "Agency not found" }, { status: 404 })
      }
      userId = agency.id
    }

    const applications = await prisma.application.findMany({
      where: {
        job: {
          OR: [
            { employerId: session.user.role === "EMPLOYER" ? userId : undefined },
            { agencyId: session.user.role === "AGENCY" ? userId : undefined }
          ]
        }
      },
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
      },
      orderBy: {
        appliedAt: "desc"
      }
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId, message } = await request.json()

    // Check if worker exists
    const worker = await prisma.worker.findUnique({
      where: { userId: session.user.id }
    })

    if (!worker) {
      return NextResponse.json({ error: "Worker profile not found" }, { status: 404 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        workerId: worker.id
      }
    })

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        workerId: worker.id,
        status: "PENDING",
        message: message || null
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
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
                phone: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}