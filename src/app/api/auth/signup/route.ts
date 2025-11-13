import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, phone, password, name, role } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: phone }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        name,
        role
      }
    })

    // Create profile based on role
    switch (role) {
      case "WORKER":
        await prisma.worker.create({
          data: {
            userId: user.id,
            firstName: name?.split(" ")[0] || "",
            lastName: name?.split(" ").slice(1).join(" ") || "",
            gender: "OTHER",
            age: 18,
            experience: 0,
            hourlyRate: 0,
            isAvailable: true
          }
        })
        break
      case "EMPLOYER":
        await prisma.employer.create({
          data: {
            userId: user.id,
            firstName: name?.split(" ")[0] || "",
            lastName: name?.split(" ").slice(1).join(" ") || "",
            address: "",
            city: "",
            state: "",
            country: ""
          }
        })
        break
      case "AGENCY":
        await prisma.agency.create({
          data: {
            userId: user.id,
            name: name || "",
            address: "",
            city: "",
            state: "",
            country: "",
            phone: phone || ""
          }
        })
        break
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}