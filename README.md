# Domestic Worker Platform

A comprehensive marketplace platform connecting domestic workers with employers, featuring job matching, contract management, payment processing, and training modules.

## 🌟 Features

### Multi-Role Platform
- **Domestic Workers**: Profile creation, skill showcase, job applications, contract management
- **Employers**: Worker search, job posting, contract management, payment processing
- **Agencies**: Worker management, agency services, subscription plans

### Core Functionality
- **User Authentication & Authorization** with NextAuth.js
- **Job Posting & Matching** system
- **Application & Contract Management**
- **Payment Processing** with transaction tracking
- **Attendance Monitoring** with time tracking
- **Review & Rating System**
- **Document Management** (upload/store worker documents)
- **Training Modules** for skill development
- **Real-time Notifications**
- **Responsive Design** with Tailwind CSS

### Advanced Features
- **Multi-language Support** (English, Hindi, Tamil, Telugu, Bengali)
- **Skill-based Matching** (10 predefined skill categories)
- **Subscription Management** for premium features
- **Analytics Dashboard** for employers and agencies
- **Mobile-responsive Interface**
- **Role-based Access Control**

## 🛠 Tech Stack

- **Frontend**: Next.js 15.3.5 with TypeScript
- **Database**: SQLite with Prisma ORM v6.19.0
- **Authentication**: NextAuth.js v4.24.13
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: TanStack Query
- **Validation**: Zod v4.0.2
- **Hashing**: bcryptjs for password security
- **Icons**: Lucide React icons

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/jitenkr2030/domestic-worker.git
cd domestic-worker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with demo data
npx tsx seed-demo-data.ts
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 👥 Demo Accounts

### Workers
| Email | Password | Skills |
|-------|----------|---------|
| rajesh.kumar@example.com | password123 | Cooking, Cleaning |
| priya.sharma@example.com | password123 | Childcare, Tutoring |
| amit.patel@example.com | password123 | Gardening, Pet Care |

### Employers
| Email | Password |
|-------|----------|
| anil.mehta@example.com | password123 |
| sneha.reddy@example.com | password123 |

### Agency
| Email | Password |
|-------|----------|
| contact@careconnect.com | password123 |

## 📁 Project Structure

```
domestic-worker/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── dev.db                # SQLite database file
│   └── seed-demo-data.ts     # Demo data seeding script
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utility functions and configs
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 🗄 Database Schema

The platform uses a comprehensive database schema with the following key entities:

### Core Models
- **User**: Base user authentication and profile
- **Worker**: Extended worker-specific information
- **Employer**: Employer profile and preferences
- **Agency**: Agency management and services

### Business Logic
- **Job**: Job postings with requirements and location
- **Application**: Worker applications for jobs
- **Contract**: Employment contracts with terms
- **Payment**: Transaction records and status tracking
- **Attendance**: Time tracking and attendance records
- **Review**: Rating and review system
- **Document**: File uploads and document management
- **Training**: Skill development modules
- **Subscription**: Premium feature access

### Supporting Data
- **Skill**: Available skills (10 predefined categories)
- **Language**: Supported languages (5 available)

## 🎯 Key Features by User Role

### For Workers
- Create detailed profiles with skills and experience
- Browse and apply for available jobs
- Manage active contracts and payments
- Track attendance and work history
- Upload and manage documents
- Access training modules for skill development
- Receive reviews and build reputation

### For Employers
- Post detailed job requirements
- Search and filter workers by skills and location
- Review applications and hire workers
- Manage contracts and payments
- Track worker attendance
- Leave reviews and ratings
- Access analytics dashboard

### For Agencies
- Manage multiple workers
- Offer agency services
- Handle worker verification
- Manage subscriptions and billing
- Provide training and support

## 📊 Demo Data

The platform comes with comprehensive demo data including:
- **6 User Accounts** (3 Workers, 2 Employers, 1 Agency)
- **10 Skills** across various categories
- **5 Languages** for multi-language support
- **3 Job Postings** with different requirements
- **4 Job Applications** in various states
- **2 Active Contracts** with payment records
- **4 Payment Transactions** with status tracking
- **12 Attendance Records** with time tracking
- **2 Reviews** with ratings
- **7 Documents** (ID, certificates, photos)
- **3 Training Modules** for skill development
- **4 Subscription Plans** for premium features

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma Client
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed demo data

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Authentication**: NextAuth.js with JWT tokens
- **Role-based Access**: Proper authorization for different user types
- **Input Validation**: Zod schemas for all user inputs
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Environment Variables**: Secure configuration management

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Mobile Support

The platform is fully responsive and optimized for:
- Desktop browsers
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [Link to detailed docs]

## 🗓️ Development Roadmap

### Upcoming Features
- [ ] Real-time chat system
- [ ] Video calling integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] API rate limiting
- [ ] Email notifications
- [ ] Calendar integration
- [ ] GPS location tracking
- [ ] Advanced search filters
- [ ] Multi-currency payment support

### Performance Optimizations
- [ ] Image optimization and CDN
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Progressive Web App (PWA) features
- [ ] SEO optimization

---

**Built with ❤️ for domestic workers and employers worldwide**

*Last updated: November 2025*