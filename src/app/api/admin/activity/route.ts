import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get recent activities from various tables
    const [recentUsers, recentJobs, recentApplications, recentPayments] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.job.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          employer: {
            select: {
              user: {
                select: {
                  name: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.application.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
          worker: {
            select: {
              user: {
                select: {
                  name: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.payment.findMany({
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
          worker: {
            select: {
              user: {
                select: {
                  name: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ])

    // Transform into activity log format
    const activities = [
      ...recentUsers.map(user => ({
        id: `user_${user.id}`,
        type: "USER_REGISTERED",
        description: `New user ${user.name} registered as ${user.role}`,
        timestamp: user.createdAt.toISOString(),
        user: {
          name: user.name,
          role: user.role
        }
      })),
      ...recentJobs.map(job => ({
        id: `job_${job.id}`,
        type: "JOB_POSTED",
        description: `New job posted: "${job.title}"`,
        timestamp: job.createdAt.toISOString(),
        user: job.employer.user
      })),
      ...recentApplications.map(application => ({
        id: `application_${application.id}`,
        type: "APPLICATION_SUBMITTED",
        description: `Job application submitted with status: ${application.status}`,
        timestamp: application.createdAt.toISOString(),
        user: application.worker.user
      })),
      ...recentPayments.map(payment => ({
        id: `payment_${payment.id}`,
        type: "PAYMENT_PROCESSED",
        description: `Payment of ₹${payment.amount} processed with status: ${payment.status}`,
        timestamp: payment.createdAt.toISOString(),
        user: payment.worker.user
      }))
    ]

    // Sort by timestamp and take latest 20
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(activities.slice(0, 20))
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}