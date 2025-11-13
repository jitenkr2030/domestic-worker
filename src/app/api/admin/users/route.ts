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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

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
      take: limit,
      skip: offset
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()
    const userId = params.id

    let updateData: any = {}

    switch (action) {
      case "activate":
        updateData = { isActive: true }
        break
      case "deactivate":
        updateData = { isActive: false }
        break
      case "verify":
        updateData = { isVerified: true }
        break
      case "unverify":
        updateData = { isVerified: false }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}