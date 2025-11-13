"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Home, Building, CheckCircle, Shield, Star, Clock, MapPin } from "lucide-react"

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const userTypes = [
    {
      id: "worker",
      title: "For Domestic Workers",
      icon: User,
      description: "Find great jobs, manage your profile, and get paid securely",
      features: [
        "Create detailed profile with skills & experience",
        "Browse and apply for jobs",
        "Track attendance and payments",
        "Access training and upskilling courses",
        "Get verified and build your reputation"
      ],
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      badgeColor: "bg-blue-500"
    },
    {
      id: "employer",
      title: "For Households",
      icon: Home,
      description: "Find trusted domestic helpers for your home",
      features: [
        "Post job requirements and find workers",
        "View verified profiles and ratings",
        "Manage contracts and payments",
        "Track worker attendance",
        "Access support and dispute resolution"
      ],
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      badgeColor: "bg-green-500"
    },
    {
      id: "agency",
      title: "For Placement Agencies",
      icon: Building,
      description: "Manage workers and connect with employers",
      features: [
        "Register and get verified as an agency",
        "Add and manage worker profiles",
        "Post jobs and handle applications",
        "Manage contracts and payments",
        "Access analytics and insights"
      ],
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      badgeColor: "bg-purple-500"
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "All workers and agencies undergo background verification"
    },
    {
      icon: CheckCircle,
      title: "Secure Payments",
      description: "Safe and transparent payment processing"
    },
    {
      icon: Star,
      title: "Rating System",
      description: "Build trust through reviews and ratings"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Monitor attendance and work progress"
    },
    {
      icon: MapPin,
      title: "Location-based",
      description: "Find workers and jobs near you"
    }
  ]

  const handleGetStarted = (role: string) => {
    setSelectedRole(role)
    // Navigate to sign-up page with selected role
    window.location.href = `/auth/signup?role=${role}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DomesticWorker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </a>
              <a href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Connecting Domestic Workers with Trusted Households
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A comprehensive platform for domestic workers, employers, and placement agencies. 
            Find the perfect match, manage contracts, and ensure secure payments.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="px-8 py-3">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Who are you?
            </h3>
            <p className="text-lg text-gray-600">
              Select your role to get started with the platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((userType) => {
              const Icon = userType.icon
              return (
                <Card 
                  key={userType.id} 
                  className={`cursor-pointer transition-all duration-300 ${userType.color} ${
                    selectedRole === userType.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleGetStarted(userType.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <Badge className={`${userType.badgeColor} text-white`}>
                        Popular
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{userType.title}</CardTitle>
                    <CardDescription>{userType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {userType.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6" variant={selectedRole === userType.id ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose DomesticWorker?
            </h3>
            <p className="text-lg text-gray-600">
              We provide a safe, efficient, and transparent platform for all users
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Verified Workers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Active Employers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Partner Agencies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Successful Placements</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of workers, employers, and agencies who trust DomesticWorker
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/auth/signup" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up Now
            </a>
            <a href="#contact" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold">DomesticWorker</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting domestic workers with trusted households since 2024.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Workers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Find Jobs</a></li>
                <li><a href="#" className="hover:text-white">Create Profile</a></li>
                <li><a href="#" className="hover:text-white">Training</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Post Jobs</a></li>
                <li><a href="#" className="hover:text-white">Find Workers</a></li>
                <li><a href="#" className="hover:text-white">Manage Contracts</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Agencies</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Register Agency</a></li>
                <li><a href="#" className="hover:text-white">Manage Workers</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 DomesticWorker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}