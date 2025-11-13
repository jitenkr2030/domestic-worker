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

    const users = await prisma.user.findMany({
      include: {
        worker: {
          select: {
            firstName: true,
            lastName: true,
            city: true
          }
        },
        employer: {
          select: {
            firstName: true,
            lastName: true,
            city: true
          }
        },
        agency: {
          select: {
            name: true,
            city: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10 // Get last 10 users
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching recent users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}