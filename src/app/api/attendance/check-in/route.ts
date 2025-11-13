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

    const { latitude, longitude, notes } = await request.json()

    // Find worker
    const worker = await prisma.worker.findUnique({
      where: { userId: session.user.id }
    })

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 })
    }

    // Find active contracts for this worker
    const activeContracts = await prisma.contract.findMany({
      where: {
        workerId: worker.id,
        status: "ACTIVE"
      }
    })

    if (activeContracts.length === 0) {
      return NextResponse.json({ error: "No active contracts found" }, { status: 404 })
    }

    // For simplicity, use the first active contract
    // In a real app, you might want to let the worker choose which contract
    const contract = activeContracts[0]

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        contractId: contract.id,
        date: today
      }
    })

    if (existingAttendance && existingAttendance.checkInTime) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    // Create or update attendance record
    let attendance
    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkInTime: new Date(),
          checkInLatitude: latitude,
          checkInLongitude: longitude,
          status: "PRESENT"
        }
      })
    } else {
      attendance = await prisma.attendance.create({
        data: {
          contractId: contract.id,
          workerId: worker.id,
          date: today,
          checkInTime: new Date(),
          checkInLatitude: latitude,
          checkInLongitude: longitude,
          status: "PRESENT"
        }
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error checking in:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}