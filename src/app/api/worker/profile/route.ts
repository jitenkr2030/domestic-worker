import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const worker = await prisma.worker.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            name: true,
            avatar: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        },
        documents: true
      }
    })

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 })
    }

    return NextResponse.json(worker)
  } catch (error) {
    console.error("Error fetching worker profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}