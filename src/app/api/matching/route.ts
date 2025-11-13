import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ZAI from 'z-ai-web-dev-sdk'

interface MatchScore {
  workerId: string
  score: number
  reasons: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "WORKER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId, workerId } = await request.json()

    let matches: MatchScore[] = []

    if (jobId) {
      // Find workers matching a specific job
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          skills: {
            include: {
              skill: true
            }
          },
          employer: true
        }
      })

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }

      // Get all available workers
      const workers = await prisma.worker.findMany({
        where: {
          isAvailable: true
        },
        include: {
          skills: {
            include: {
              skill: true
            }
          },
          user: true
        }
      })

      // Calculate match scores for each worker
      for (const worker of workers) {
        const score = calculateMatchScore(job, worker)
        if (score.score > 50) { // Only show matches with score > 50%
          matches.push(score)
        }
      }

      // Sort by score descending
      matches.sort((a, b) => b.score - a.score)

    } else if (workerId) {
      // Find jobs matching a specific worker
      const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        include: {
          skills: {
            include: {
              skill: true
            }
          },
          user: true
        }
      })

      if (!worker) {
        return NextResponse.json({ error: "Worker not found" }, { status: 404 })
      }

      // Get all active jobs
      const jobs = await prisma.job.findMany({
        where: {
          status: "ACTIVE"
        },
        include: {
          skills: {
            include: {
              skill: true
            }
          },
          employer: true
        }
      })

      // Calculate match scores for each job
      for (const job of jobs) {
        const score = calculateMatchScore(job, worker)
        if (score.score > 50) { // Only show matches with score > 50%
          matches.push(score)
        }
      }

      // Sort by score descending
      matches.sort((a, b) => b.score - a.score)
    }

    // Get detailed information for top matches
    const topMatches = matches.slice(0, 10) // Top 10 matches
    
    if (jobId) {
      const detailedMatches = await Promise.all(
        topMatches.map(async (match) => {
          const worker = await prisma.worker.findUnique({
            where: { id: match.workerId },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  avatar: true
                }
              },
              skills: {
                include: {
                  skill: true
                }
              },
              reviews: {
                select: {
                  rating: true,
                  comment: true
                }
              }
            }
          })
          return {
            ...worker,
            matchScore: match.score,
            matchReasons: match.reasons
          }
        })
      )
      return NextResponse.json(detailedMatches)
    } else {
      const detailedMatches = await Promise.all(
        topMatches.map(async (match) => {
          const job = await prisma.job.findUnique({
            where: { id: match.workerId }, // In this case, workerId is actually jobId
            include: {
              employer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              },
              skills: {
                include: {
                  skill: true
                }
              },
              _count: {
                select: {
                  applications: true
                }
              }
            }
          })
          return {
            ...job,
            matchScore: match.score,
            matchReasons: match.reasons
          }
        })
      )
      return NextResponse.json(detailedMatches)
    }

  } catch (error) {
    console.error("Error in matching:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function calculateMatchScore(job: any, worker: any): MatchScore {
  let score = 0
  const reasons: string[] = []

  // Skills match (40% of score)
  const jobSkills = job.skills.map((s: any) => s.skill.name)
  const workerSkills = worker.skills.map((s: any) => s.skill.name)
  
  const commonSkills = jobSkills.filter((skill: string) => workerSkills.includes(skill))
  const skillMatchPercentage = jobSkills.length > 0 ? (commonSkills.length / jobSkills.length) * 100 : 0
  
  score += skillMatchPercentage * 0.4
  if (commonSkills.length > 0) {
    reasons.push(`Has ${commonSkills.length} required skills`)
  }

  // Salary match (25% of score)
  const jobSalary = job.salaryAmount
  const workerMinRate = worker.hourlyRate
  const workerMaxRate = worker.hourlyRate * 1.5 // Allow some flexibility
  
  if (workerMinRate <= jobSalary && jobSalary <= workerMaxRate) {
    score += 25
    reasons.push("Salary expectations match")
  } else if (workerMinRate <= jobSalary * 1.2) {
    score += 15
    reasons.push("Salary within acceptable range")
  }

  // Location match (20% of score)
  if (job.city && worker.city && job.city.toLowerCase() === worker.city.toLowerCase()) {
    score += 20
    reasons.push("Same city location")
  } else if (job.state && worker.state && job.state.toLowerCase() === worker.state.toLowerCase()) {
    score += 10
    reasons.push("Same state location")
  }

  // Experience match (10% of score)
  if (job.minExperience && worker.experience >= job.minExperience) {
    score += 10
    reasons.push("Meets experience requirements")
  } else if (job.minExperience && worker.experience >= job.minExperience * 0.8) {
    score += 5
    reasons.push("Close to experience requirements")
  }

  // Work type match (5% of score)
  if (worker.workType && Array.isArray(worker.workType)) {
    const workerWorkTypes = JSON.parse(worker.workType)
    if (workerWorkTypes.includes(job.workType)) {
      score += 5
      reasons.push("Preferred work type matches")
    }
  }

  // Availability bonus (5%)
  if (worker.isAvailable) {
    score += 5
    reasons.push("Currently available")
  }

  return {
    workerId: worker.id,
    score: Math.round(score),
    reasons
  }
}

// AI-powered matching using ZAI SDK
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "worker" or "job"
    const query = searchParams.get("query")

    if (!type || !query) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const zai = await ZAI.create()

    const prompt = `
    You are an AI assistant for a domestic worker marketplace. Based on the following query, provide recommendations for ${type === "worker" ? "workers" : "jobs"}.
    
    Query: ${query}
    
    Please provide:
    1. A list of recommended ${type === "worker" ? "worker" : "job"} categories
    2. Key skills/requirements to look for
    3. Salary range suggestions
    4. Any additional advice
    
    Format your response as JSON with the following structure:
    {
      "categories": ["category1", "category2", ...],
      "keyRequirements": ["requirement1", "requirement2", ...],
      "salaryRange": {
        "min": number,
        "max": number,
        "currency": "INR"
      },
      "advice": "advice text"
    }
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for a domestic worker marketplace. Provide helpful, accurate, and concise recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })

    let response
    try {
      response = JSON.parse(completion.choices[0].message.content || "{}")
    } catch (error) {
      // If JSON parsing fails, return a structured response with the raw content
      response = {
        categories: [],
        keyRequirements: [],
        salaryRange: { min: 0, max: 0, currency: "INR" },
        advice: completion.choices[0].message.content || "No advice available"
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in AI matching:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}