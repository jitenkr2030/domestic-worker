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
    } else if (session.user.role === "AGENCY") {
      const agency = await prisma.agency.findUnique({
        where: { userId: session.user.id }
      })
      if (!agency) {
        return NextResponse.json({ error: "Agency not found" }, { status: 404 })
      }
      userId = agency.id
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { workerId: session.user.role === "WORKER" ? userId : undefined },
          { employerId: session.user.role === "EMPLOYER" ? userId : undefined },
          { agencyId: session.user.role === "AGENCY" ? userId : undefined }
        ].filter(Boolean)
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
            },
            worker: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: "desc"
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "AGENCY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { contractId, amount, type, description, paymentMethod } = await request.json()

    // Find contract and verify ownership
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        job: true,
        worker: true,
        employer: true,
        agency: true
      }
    })

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    // Verify ownership
    const isOwner = 
      (session.user.role === "EMPLOYER" && contract.employer?.userId === session.user.id) ||
      (session.user.role === "AGENCY" && contract.agency?.userId === session.user.id)

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate commission (10% platform fee, 5% agency fee if applicable)
    const platformCommission = amount * 0.10
    const agencyCommission = contract.agencyId ? amount * 0.05 : 0

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        contractId,
        workerId: contract.workerId,
        employerId: contract.employerId,
        agencyId: contract.agencyId,
        amount,
        currency: "INR",
        type,
        description,
        platformCommission,
        agencyCommission,
        status: "PENDING",
        dueDate: new Date(),
        paymentMethod
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
            },
            worker: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // In a real app, you would integrate with a payment gateway here
    // For now, we'll simulate payment processing
    setTimeout(async () => {
      try {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            paidAt: new Date(),
            transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        })
      } catch (error) {
        console.error("Error updating payment status:", error)
      }
    }, 2000) // Simulate 2-second processing time

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}