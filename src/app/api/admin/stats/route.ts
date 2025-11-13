import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db, PrismaClient } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total counts
    const [
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalAgencies,
      totalJobs,
      totalApplications,
      totalPayments,
      activeContracts
    ] = await Promise.all([
      db.user.count(),
      db.worker.count(),
      db.employer.count(),
      db.agency.count(),
      db.job.count(),
      db.application.count(),
      db.payment.count(),
      db.contract.count({ where: { status: "ACTIVE" } })
    ])

    // Get total revenue (sum of all completed payments)
    const payments = await db.payment.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true }
    })
    const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

    const stats = {
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalAgencies,
      totalJobs,
      totalApplications,
      totalPayments,
      activeContracts,
      revenue
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}