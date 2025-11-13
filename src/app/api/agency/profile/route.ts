import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agency = await prisma.agency.findUnique({
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
        workers: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            skills: {
              include: {
                skill: true
              }
            }
          }
        },
        jobs: {
          include: {
            employer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            applications: {
              include: {
                worker: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        contracts: {
          include: {
            worker: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            employer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    return NextResponse.json(agency)
  } catch (error) {
    console.error("Error fetching agency profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}