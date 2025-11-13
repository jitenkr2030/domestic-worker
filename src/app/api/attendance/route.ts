import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let userId: string
    if (session.user.role === "WORKER") {
      const worker = await prisma.worker.findUnique({
        where: { userId: session.user.id }
      })
      if (!worker) {
        return NextResponse.json({ error: "Worker not found" }, { status: 404 })
      }
      userId = worker.id
    } else if (session.user.role === "EMPLOYER") {
      const employer = await prisma.employer.findUnique({
        where: { userId: session.user.id }
      })
      if (!employer) {
        return NextResponse.json({ error: "Employer not found" }, { status: 404 })
      }
      userId = employer.id
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        contract: session.user.role === "WORKER" 
          ? { workerId: userId }
          : { employerId: userId }
      },
      include: {
        contract: {
          include: {
            job: {
              include: {
                employer: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
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

    const { contractId, checkInTime, checkOutTime, latitude, longitude, notes } = await request.json()

    // Find worker
    const worker = await prisma.worker.findUnique({
      where: { userId: session.user.id }
    })

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 })
    }

    // Verify contract belongs to worker
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        job: true
      }
    })

    if (!contract || contract.workerId !== worker.id) {
      return NextResponse.json({ error: "Contract not found or unauthorized" }, { status: 404 })
    }

    // Check if attendance already exists for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        contractId,
        date: today
      }
    })

    if (existingAttendance) {
      return NextResponse.json({ error: "Attendance already recorded for today" }, { status: 400 })
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        contractId,
        workerId: worker.id,
        date: today,
        checkInTime: checkInTime ? new Date(checkInTime) : new Date(),
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        checkInLatitude: latitude,
        checkInLongitude: longitude,
        checkOutLatitude: longitude,
        checkOutLongitude: longitude,
        notes: notes || null,
        status: "PRESENT"
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}