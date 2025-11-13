import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const workType = searchParams.get("workType")
    const city = searchParams.get("city")
    const minSalary = searchParams.get("minSalary")
    const maxSalary = searchParams.get("maxSalary")

    const skip = (page - 1) * limit

    const where: any = {
      status: "ACTIVE"
    }

    if (category) {
      where.category = category
    }

    if (workType) {
      where.workType = workType
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive"
      }
    }

    if (minSalary || maxSalary) {
      where.salaryAmount = {}
      if (minSalary) {
        where.salaryAmount.gte = parseInt(minSalary)
      }
      if (maxSalary) {
        where.salaryAmount.lte = parseInt(maxSalary)
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    const total = await prisma.job.count({ where })

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
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

    const body = await request.json()
    const {
      title,
      description,
      category,
      workType,
      salaryAmount,
      salaryType,
      address,
      city,
      state,
      country,
      workingDays,
      startTime,
      endTime,
      minExperience,
      isUrgent
    } = body

    // Get employer or agency based on role
    let posterId: string
    if (session.user.role === "EMPLOYER") {
      const employer = await prisma.employer.findUnique({
        where: { userId: session.user.id }
      })
      if (!employer) {
        return NextResponse.json({ error: "Employer not found" }, { status: 404 })
      }
      posterId = employer.id
    } else {
      const agency = await prisma.agency.findUnique({
        where: { userId: session.user.id }
      })
      if (!agency) {
        return NextResponse.json({ error: "Agency not found" }, { status: 404 })
      }
      posterId = agency.id
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        category,
        workType,
        salaryAmount,
        salaryType,
        address,
        city,
        state,
        country: country || "India",
        workingDays: workingDays ? JSON.parse(workingDays) : [],
        startTime,
        endTime,
        minExperience: minExperience ? parseInt(minExperience) : null,
        isUrgent: isUrgent || false,
        employerId: session.user.role === "EMPLOYER" ? posterId : null,
        agencyId: session.user.role === "AGENCY" ? posterId : null
      },
      include: {
        employer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true
          }
        },
        agency: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}