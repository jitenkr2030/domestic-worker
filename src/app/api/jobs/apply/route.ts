import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId } = await request.json()

    // Check if worker exists
    const worker = await prisma.worker.findUnique({
      where: { userId: session.user.id }
    })

    if (!worker) {
      return NextResponse.json({ error: "Worker profile not found" }, { status: 404 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: {
            workerId: worker.id
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if already applied
    if (job.applications.length > 0) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        workerId: worker.id,
        status: "PENDING"
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