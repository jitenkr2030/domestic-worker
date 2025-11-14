import { PrismaClient, UserRole, Gender, WorkType, Shift, SkillCategory, SkillLevel, SalaryType, JobStatus, ApplicationStatus, ContractStatus, PaymentStatus, PaymentType, PaymentMethod, AttendanceStatus, DocumentType, TrainingDifficulty, TrainingStatus, SubscriptionPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting demo data seeding...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.workerTraining.deleteMany();
  await prisma.training.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.document.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.language.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data\n');

  // Create Skills
  console.log('📚 Creating skills...');
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'House Cleaning', category: SkillCategory.CLEANING, description: 'General household cleaning and maintenance' } }),
    prisma.skill.create({ data: { name: 'Deep Cleaning', category: SkillCategory.CLEANING, description: 'Thorough deep cleaning of all areas' } }),
    prisma.skill.create({ data: { name: 'Indian Cooking', category: SkillCategory.COOKING, description: 'Traditional Indian cuisine preparation' } }),
    prisma.skill.create({ data: { name: 'Continental Cooking', category: SkillCategory.COOKING, description: 'Western and continental dishes' } }),
    prisma.skill.create({ data: { name: 'Infant Care', category: SkillCategory.CHILDCARE, description: 'Care for infants 0-2 years' } }),
    prisma.skill.create({ data: { name: 'Child Care', category: SkillCategory.CHILDCARE, description: 'Care for children 3-12 years' } }),
    prisma.skill.create({ data: { name: 'Elderly Care', category: SkillCategory.ELDERLY_CARE, description: 'Care for elderly persons' } }),
    prisma.skill.create({ data: { name: 'Driving', category: SkillCategory.DRIVING, description: 'Personal driver services' } }),
    prisma.skill.create({ data: { name: 'Laundry & Ironing', category: SkillCategory.LAUNDRY, description: 'Washing, drying, and ironing clothes' } }),
    prisma.skill.create({ data: { name: 'Gardening', category: SkillCategory.GARDENING, description: 'Garden maintenance and plant care' } }),
  ]);
  console.log(`✓ Created ${skills.length} skills\n`);

  // Create Languages
  console.log('🌍 Creating languages...');
  const languages = await Promise.all([
    prisma.language.create({ data: { name: 'English', code: 'en' } }),
    prisma.language.create({ data: { name: 'Hindi', code: 'hi' } }),
    prisma.language.create({ data: { name: 'Spanish', code: 'es' } }),
    prisma.language.create({ data: { name: 'Tamil', code: 'ta' } }),
    prisma.language.create({ data: { name: 'Telugu', code: 'te' } }),
  ]);
  console.log(`✓ Created ${languages.length} languages\n`);

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Workers
  console.log('👷 Creating workers...');
  const worker1User = await prisma.user.create({
    data: {
      email: 'rajesh.kumar@example.com',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      role: UserRole.WORKER,
      isActive: true,
      isVerified: true,
      avatar: 'https://i.pravatar.cc/150?img=12',
    }
  });

  const worker1 = await prisma.worker.create({
    data: {
      userId: worker1User.id,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      gender: Gender.MALE,
      age: 32,
      nationality: 'Indian',
      address: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0760,
      longitude: 72.8777,
      bio: 'Experienced domestic helper with 8+ years of experience in cooking and cleaning. Dedicated and reliable.',
      experience: 8,
      hourlyRate: 150,
      monthlyRate: 15000,
      isAvailable: true,
      workType: JSON.stringify([WorkType.FULL_TIME, WorkType.LIVE_OUT]),
      preferredShift: Shift.MORNING,
      preferredDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      preferredLocation: 'South Mumbai',
      maxDistance: 10,
      languages: JSON.stringify(['hi', 'en']),
    }
  });

  const worker2User = await prisma.user.create({
    data: {
      email: 'priya.sharma@example.com',
      password: hashedPassword,
      name: 'Priya Sharma',
      role: UserRole.WORKER,
      isActive: true,
      isVerified: true,
      avatar: 'https://i.pravatar.cc/150?img=5',
    }
  });

  const worker2 = await prisma.worker.create({
    data: {
      userId: worker2User.id,
      firstName: 'Priya',
      lastName: 'Sharma',
      gender: Gender.FEMALE,
      age: 28,
      nationality: 'Indian',
      address: '456 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9716,
      longitude: 77.5946,
      bio: 'Certified childcare specialist with infant care training. Patient and caring.',
      experience: 5,
      hourlyRate: 200,
      monthlyRate: 20000,
      isAvailable: true,
      workType: JSON.stringify([WorkType.FULL_TIME, WorkType.LIVE_IN]),
      preferredShift: Shift.FLEXIBLE,
      preferredDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
      preferredLocation: 'Whitefield, Bangalore',
      maxDistance: 15,
      languages: JSON.stringify(['hi', 'en', 'ta']),
    }
  });

  const worker3User = await prisma.user.create({
    data: {
      email: 'amit.patel@example.com',
      password: hashedPassword,
      name: 'Amit Patel',
      role: UserRole.WORKER,
      isActive: true,
      isVerified: true,
      avatar: 'https://i.pravatar.cc/150?img=33',
    }
  });

  const worker3 = await prisma.worker.create({
    data: {
      userId: worker3User.id,
      firstName: 'Amit',
      lastName: 'Patel',
      gender: Gender.MALE,
      age: 45,
      nationality: 'Indian',
      address: '789 Park Street',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      latitude: 28.7041,
      longitude: 77.1025,
      bio: 'Professional driver with 15 years experience. Clean driving record and knowledge of Delhi NCR.',
      experience: 15,
      hourlyRate: 100,
      monthlyRate: 12000,
      isAvailable: false,
      workType: JSON.stringify([WorkType.FULL_TIME]),
      preferredShift: Shift.MORNING,
      preferredDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      preferredLocation: 'South Delhi',
      maxDistance: 20,
      languages: JSON.stringify(['hi', 'en']),
    }
  });
  console.log(`✓ Created 3 workers\n`);

  // Create Employers
  console.log('🏠 Creating employers...');
  const employer1User = await prisma.user.create({
    data: {
      email: 'anil.mehta@example.com',
      password: hashedPassword,
      name: 'Anil Mehta',
      role: UserRole.EMPLOYER,
      isActive: true,
      isVerified: true,
      avatar: 'https://i.pravatar.cc/150?img=14',
    }
  });

  const employer1 = await prisma.employer.create({
    data: {
      userId: employer1User.id,
      firstName: 'Anil',
      lastName: 'Mehta',
      address: 'A-101, Skyline Apartments, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0596,
      longitude: 72.8295,
      phone: '+91-9876543210',
      familySize: 4,
      hasChildren: true,
      childrenAges: JSON.stringify([5, 8]),
      hasElderly: false,
      hasPets: true,
      petDetails: 'One Golden Retriever',
    }
  });

  const employer2User = await prisma.user.create({
    data: {
      email: 'sneha.reddy@example.com',
      password: hashedPassword,
      name: 'Sneha Reddy',
      role: UserRole.EMPLOYER,
      isActive: true,
      isVerified: true,
      avatar: 'https://i.pravatar.cc/150?img=9',
    }
  });

  const employer2 = await prisma.employer.create({
    data: {
      userId: employer2User.id,
      firstName: 'Sneha',
      lastName: 'Reddy',
      address: 'Villa 203, Prestige Estates, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9698,
      longitude: 77.7499,
      phone: '+91-9876543211',
      familySize: 3,
      hasChildren: true,
      childrenAges: JSON.stringify([1]),
      hasElderly: true,
      hasPets: false,
    }
  });
  console.log(`✓ Created 2 employers\n`);

  // Create Agency
  console.log('🏢 Creating agency...');
  const agencyUser = await prisma.user.create({
    data: {
      email: 'contact@careconnect.com',
      password: hashedPassword,
      name: 'Care Connect Services',
      role: UserRole.AGENCY,
      isActive: true,
      isVerified: true,
      avatar: 'https://i.pravatar.cc/150?img=50',
    }
  });

  const agency = await prisma.agency.create({
    data: {
      userId: agencyUser.id,
      name: 'Care Connect Services',
      licenseNumber: 'MH-2020-12345',
      description: 'Premier domestic staffing agency serving Mumbai and Bangalore since 2020',
      address: 'Tower B, Business Park, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.1136,
      longitude: 72.8697,
      phone: '+91-22-12345678',
      email: 'contact@careconnect.com',
      website: 'https://careconnect.example.com',
      isVerified: true,
    }
  });
  console.log(`✓ Created 1 agency\n`);

  // Add Worker Skills
  console.log('🛠️  Adding worker skills...');
  await prisma.workerSkill.createMany({
    data: [
      { workerId: worker1.id, skillId: skills[0].id, level: SkillLevel.EXPERT, years: 8 },
      { workerId: worker1.id, skillId: skills[2].id, level: SkillLevel.ADVANCED, years: 8 },
      { workerId: worker1.id, skillId: skills[8].id, level: SkillLevel.INTERMEDIATE, years: 5 },
      { workerId: worker2.id, skillId: skills[4].id, level: SkillLevel.EXPERT, years: 5 },
      { workerId: worker2.id, skillId: skills[5].id, level: SkillLevel.ADVANCED, years: 5 },
      { workerId: worker2.id, skillId: skills[0].id, level: SkillLevel.INTERMEDIATE, years: 3 },
      { workerId: worker3.id, skillId: skills[7].id, level: SkillLevel.EXPERT, years: 15 },
    ]
  });
  console.log(`✓ Added worker skills\n`);

  // Create Jobs
  console.log('💼 Creating jobs...');
  const job1 = await prisma.job.create({
    data: {
      employerId: employer1.id,
      title: 'Full-Time Cook & Cleaner',
      description: 'Looking for an experienced cook who can prepare Indian meals and maintain household cleanliness. Must be reliable and punctual.',
      category: SkillCategory.COOKING,
      workType: WorkType.FULL_TIME,
      shift: Shift.MORNING,
      workingDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
      startTime: '08:00',
      endTime: '18:00',
      salaryType: SalaryType.MONTHLY,
      salaryAmount: 18000,
      salaryCurrency: 'INR',
      address: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0596,
      longitude: 72.8295,
      minExperience: 5,
      minAge: 25,
      maxAge: 50,
      languages: JSON.stringify(['hi', 'en']),
      status: JobStatus.ACTIVE,
      isUrgent: false,
    }
  });

  const job2 = await prisma.job.create({
    data: {
      employerId: employer2.id,
      title: 'Live-In Nanny for Infant',
      description: 'Seeking a caring and experienced nanny for our 1-year-old baby. Must have infant care certification and references.',
      category: SkillCategory.CHILDCARE,
      workType: WorkType.LIVE_IN,
      shift: Shift.FLEXIBLE,
      workingDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
      salaryType: SalaryType.MONTHLY,
      salaryAmount: 25000,
      salaryCurrency: 'INR',
      address: 'Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9698,
      longitude: 77.7499,
      minExperience: 3,
      minAge: 22,
      maxAge: 45,
      gender: Gender.FEMALE,
      languages: JSON.stringify(['hi', 'en', 'ta']),
      status: JobStatus.ACTIVE,
      isUrgent: true,
    }
  });

  const job3 = await prisma.job.create({
    data: {
      employerId: employer1.id,
      agencyId: agency.id,
      title: 'Part-Time Cleaning Help',
      description: 'Need someone for deep cleaning twice a week. 4 hours per day.',
      category: SkillCategory.CLEANING,
      workType: WorkType.PART_TIME,
      shift: Shift.MORNING,
      workingDays: JSON.stringify(['Tuesday', 'Friday']),
      startTime: '09:00',
      endTime: '13:00',
      salaryType: SalaryType.HOURLY,
      salaryAmount: 150,
      salaryCurrency: 'INR',
      address: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0596,
      longitude: 72.8295,
      minExperience: 2,
      status: JobStatus.FILLED,
      isUrgent: false,
    }
  });
  console.log(`✓ Created 3 jobs\n`);

  // Add Job Skills
  console.log('🎯 Adding job requirements...');
  await prisma.jobSkill.createMany({
    data: [
      { jobId: job1.id, skillId: skills[2].id, isRequired: true },
      { jobId: job1.id, skillId: skills[0].id, isRequired: true },
      { jobId: job1.id, skillId: skills[8].id, isRequired: false },
      { jobId: job2.id, skillId: skills[4].id, isRequired: true },
      { jobId: job2.id, skillId: skills[5].id, isRequired: false },
      { jobId: job3.id, skillId: skills[0].id, isRequired: true },
      { jobId: job3.id, skillId: skills[1].id, isRequired: false },
    ]
  });
  console.log(`✓ Added job requirements\n`);

  // Create Applications
  console.log('📝 Creating applications...');
  const application1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      workerId: worker1.id,
      status: ApplicationStatus.ACCEPTED,
      message: 'I have 8 years of experience in cooking and cleaning. I can start immediately.',
    }
  });

  const application2 = await prisma.application.create({
    data: {
      jobId: job2.id,
      workerId: worker2.id,
      status: ApplicationStatus.SHORTLISTED,
      message: 'I am a certified childcare specialist with 5 years of experience caring for infants. Would love to discuss this opportunity.',
    }
  });

  const application3 = await prisma.application.create({
    data: {
      jobId: job1.id,
      workerId: worker2.id,
      status: ApplicationStatus.PENDING,
      message: 'I am interested in this position.',
    }
  });

  const application4 = await prisma.application.create({
    data: {
      jobId: job3.id,
      workerId: worker1.id,
      status: ApplicationStatus.ACCEPTED,
      message: 'I can do deep cleaning on the specified days.',
    }
  });
  console.log(`✓ Created 4 applications\n`);

  // Create Contracts
  console.log('📜 Creating contracts...');
  const contract1 = await prisma.contract.create({
    data: {
      jobId: job1.id,
      applicationId: application1.id,
      workerId: worker1.id,
      employerId: employer1.id,
      startDate: new Date('2024-01-01'),
      isPermanent: false,
      salary: 18000,
      salaryType: SalaryType.MONTHLY,
      salaryCurrency: 'INR',
      workingHours: 'Monday-Saturday, 8:00 AM - 6:00 PM',
      duties: 'Cooking Indian meals for the family and maintaining household cleanliness.',
      terms: 'One day off per week. 10 days paid leave per year.',
      status: ContractStatus.ACTIVE,
      signedAt: new Date('2023-12-28'),
    }
  });

  const contract2 = await prisma.contract.create({
    data: {
      jobId: job3.id,
      applicationId: application4.id,
      workerId: worker1.id,
      employerId: employer1.id,
      agencyId: agency.id,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-04-30'),
      isPermanent: false,
      salary: 150,
      salaryType: SalaryType.HOURLY,
      salaryCurrency: 'INR',
      workingHours: 'Tuesday and Friday, 9:00 AM - 1:00 PM',
      duties: 'Deep cleaning of the apartment.',
      terms: 'Payment on completion of each session.',
      status: ContractStatus.ACTIVE,
      signedAt: new Date('2024-10-28'),
    }
  });
  console.log(`✓ Created 2 contracts\n`);

  // Create Payments
  console.log('💰 Creating payments...');
  await prisma.payment.createMany({
    data: [
      {
        contractId: contract1.id,
        workerId: worker1.id,
        employerId: employer1.id,
        amount: 18000,
        currency: 'INR',
        type: PaymentType.SALARY,
        description: 'Salary for January 2024',
        status: PaymentStatus.COMPLETED,
        dueDate: new Date('2024-01-31'),
        paidAt: new Date('2024-01-31'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionId: 'TXN001234567890',
      },
      {
        contractId: contract1.id,
        workerId: worker1.id,
        employerId: employer1.id,
        amount: 18000,
        currency: 'INR',
        type: PaymentType.SALARY,
        description: 'Salary for February 2024',
        status: PaymentStatus.COMPLETED,
        dueDate: new Date('2024-02-29'),
        paidAt: new Date('2024-02-29'),
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionId: 'TXN001234567891',
      },
      {
        contractId: contract1.id,
        workerId: worker1.id,
        employerId: employer1.id,
        amount: 18000,
        currency: 'INR',
        type: PaymentType.SALARY,
        description: 'Salary for October 2025',
        status: PaymentStatus.PENDING,
        dueDate: new Date('2025-11-30'),
      },
      {
        contractId: contract2.id,
        workerId: worker1.id,
        employerId: employer1.id,
        agencyId: agency.id,
        amount: 1200,
        currency: 'INR',
        type: PaymentType.SALARY,
        description: 'Payment for 8 hours of work in November 2024',
        agencyCommission: 120,
        platformCommission: 60,
        status: PaymentStatus.COMPLETED,
        dueDate: new Date('2024-11-15'),
        paidAt: new Date('2024-11-15'),
        paymentMethod: PaymentMethod.UPI,
        transactionId: 'UPI-001234567',
      },
    ]
  });
  console.log(`✓ Created 4 payments\n`);

  // Create Attendance
  console.log('📅 Creating attendance records...');
  const attendanceRecords = [];
  const startDate = new Date('2024-11-01');
  const endDate = new Date('2024-11-14');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeek !== 'Sunday') {
      const checkInTime = new Date(d);
      checkInTime.setHours(8, Math.floor(Math.random() * 15), 0);
      
      const checkOutTime = new Date(d);
      checkOutTime.setHours(18, Math.floor(Math.random() * 15), 0);
      
      attendanceRecords.push({
        contractId: contract1.id,
        workerId: worker1.id,
        date: new Date(d),
        checkInTime,
        checkOutTime,
        checkInLatitude: 19.0596 + (Math.random() - 0.5) * 0.001,
        checkInLongitude: 72.8295 + (Math.random() - 0.5) * 0.001,
        checkOutLatitude: 19.0596 + (Math.random() - 0.5) * 0.001,
        checkOutLongitude: 72.8295 + (Math.random() - 0.5) * 0.001,
        status: Math.random() > 0.9 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
      });
    }
  }
  await prisma.attendance.createMany({ data: attendanceRecords });
  console.log(`✓ Created ${attendanceRecords.length} attendance records\n`);

  // Create Reviews
  console.log('⭐ Creating reviews...');
  await prisma.review.createMany({
    data: [
      {
        reviewerId: employer1User.id,
        revieweeId: worker1User.id,
        contractId: contract1.id,
        rating: 5,
        comment: 'Rajesh is an excellent worker! Very punctual, hardworking, and his cooking is amazing. Highly recommended!',
        punctuality: 5,
        quality: 5,
        behavior: 5,
        communication: 4,
      },
      {
        reviewerId: worker1User.id,
        revieweeId: employer1User.id,
        contractId: contract1.id,
        rating: 5,
        comment: 'Great family to work with. Very respectful and clear about expectations. Payments are always on time.',
        punctuality: 5,
        quality: 5,
        behavior: 5,
        communication: 5,
      },
    ]
  });
  console.log(`✓ Created 2 reviews\n`);

  // Create Documents
  console.log('📄 Creating documents...');
  await prisma.document.createMany({
    data: [
      {
        workerId: worker1.id,
        type: DocumentType.ID_PROOF,
        name: 'Aadhaar Card',
        fileUrl: 'https://example.com/documents/aadhaar-rajesh.pdf',
        isVerified: true,
        verifiedAt: new Date('2023-12-15'),
      },
      {
        workerId: worker1.id,
        type: DocumentType.ADDRESS_PROOF,
        name: 'Address Proof',
        fileUrl: 'https://example.com/documents/address-rajesh.pdf',
        isVerified: true,
        verifiedAt: new Date('2023-12-15'),
      },
      {
        workerId: worker1.id,
        type: DocumentType.POLICE_VERIFICATION,
        name: 'Police Verification Certificate',
        fileUrl: 'https://example.com/documents/police-rajesh.pdf',
        isVerified: true,
        verifiedAt: new Date('2023-12-20'),
        expiryDate: new Date('2025-12-20'),
      },
      {
        workerId: worker2.id,
        type: DocumentType.ID_PROOF,
        name: 'Aadhaar Card',
        fileUrl: 'https://example.com/documents/aadhaar-priya.pdf',
        isVerified: true,
        verifiedAt: new Date('2024-01-10'),
      },
      {
        workerId: worker2.id,
        type: DocumentType.SKILL_CERTIFICATE,
        name: 'Infant Care Certification',
        fileUrl: 'https://example.com/documents/cert-priya.pdf',
        isVerified: true,
        verifiedAt: new Date('2024-01-10'),
      },
      {
        workerId: worker3.id,
        type: DocumentType.ID_PROOF,
        name: 'Aadhaar Card',
        fileUrl: 'https://example.com/documents/aadhaar-amit.pdf',
        isVerified: true,
        verifiedAt: new Date('2023-11-05'),
      },
      {
        workerId: worker3.id,
        type: DocumentType.OTHER,
        name: 'Driving License',
        fileUrl: 'https://example.com/documents/dl-amit.pdf',
        isVerified: true,
        verifiedAt: new Date('2023-11-05'),
        expiryDate: new Date('2028-05-15'),
      },
    ]
  });
  console.log(`✓ Created 7 documents\n`);

  // Create Training Modules
  console.log('🎓 Creating training modules...');
  const training1 = await prisma.training.create({
    data: {
      title: 'Introduction to Professional House Cleaning',
      description: 'Learn the basics of professional house cleaning including techniques, tools, and safety measures.',
      category: SkillCategory.CLEANING,
      duration: 120,
      difficulty: TrainingDifficulty.BEGINNER,
      isPublished: true,
      isPremium: false,
      content: JSON.stringify({
        modules: [
          { title: 'Cleaning Tools and Equipment', duration: 30 },
          { title: 'Surface-Specific Cleaning', duration: 45 },
          { title: 'Safety and Hygiene', duration: 45 },
        ]
      }),
    }
  });

  const training2 = await prisma.training.create({
    data: {
      title: 'Advanced Infant Care',
      description: 'Comprehensive training on infant care, feeding, sleep training, and emergency response.',
      category: SkillCategory.CHILDCARE,
      duration: 180,
      difficulty: TrainingDifficulty.ADVANCED,
      isPublished: true,
      isPremium: true,
      content: JSON.stringify({
        modules: [
          { title: 'Infant Nutrition and Feeding', duration: 60 },
          { title: 'Sleep Training Techniques', duration: 45 },
          { title: 'Common Health Issues', duration: 45 },
          { title: 'Emergency First Aid', duration: 30 },
        ]
      }),
    }
  });

  const training3 = await prisma.training.create({
    data: {
      title: 'Indian Cuisine Basics',
      description: 'Learn to cook popular Indian dishes with traditional techniques and recipes.',
      category: SkillCategory.COOKING,
      duration: 150,
      difficulty: TrainingDifficulty.INTERMEDIATE,
      isPublished: true,
      isPremium: false,
      content: JSON.stringify({
        modules: [
          { title: 'Spices and Ingredients', duration: 30 },
          { title: 'Bread and Rice Dishes', duration: 60 },
          { title: 'Curries and Gravies', duration: 60 },
        ]
      }),
    }
  });
  console.log(`✓ Created 3 training modules\n`);

  // Enroll Workers in Training
  console.log('📚 Enrolling workers in training...');
  await prisma.workerTraining.createMany({
    data: [
      {
        workerId: worker1.id,
        trainingId: training1.id,
        status: TrainingStatus.COMPLETED,
        progress: 100,
        completedAt: new Date('2023-06-15'),
        certificateUrl: 'https://example.com/certificates/rajesh-cleaning.pdf',
      },
      {
        workerId: worker1.id,
        trainingId: training3.id,
        status: TrainingStatus.IN_PROGRESS,
        progress: 65,
      },
      {
        workerId: worker2.id,
        trainingId: training2.id,
        status: TrainingStatus.COMPLETED,
        progress: 100,
        completedAt: new Date('2023-12-20'),
        certificateUrl: 'https://example.com/certificates/priya-childcare.pdf',
      },
      {
        workerId: worker2.id,
        trainingId: training1.id,
        status: TrainingStatus.STARTED,
        progress: 25,
      },
    ]
  });
  console.log(`✓ Enrolled workers in training\n`);

  // Create Subscriptions
  console.log('💳 Creating subscriptions...');
  await prisma.subscription.createMany({
    data: [
      {
        userId: worker1User.id,
        plan: SubscriptionPlan.WORKER_PREMIUM,
        price: 499,
        currency: 'INR',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        isActive: true,
      },
      {
        userId: worker2User.id,
        plan: SubscriptionPlan.WORKER_BASIC,
        price: 199,
        currency: 'INR',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-06-01'),
        isActive: true,
      },
      {
        userId: employer1User.id,
        plan: SubscriptionPlan.EMPLOYER_PREMIUM,
        price: 999,
        currency: 'INR',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2024-12-01'),
        isActive: true,
      },
      {
        userId: agencyUser.id,
        plan: SubscriptionPlan.AGENCY_PREMIUM,
        price: 4999,
        currency: 'INR',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        isActive: true,
      },
    ]
  });
  console.log(`✓ Created 4 subscriptions\n`);

  console.log('✅ Demo data seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   - 3 Workers (Rajesh Kumar, Priya Sharma, Amit Patel)');
  console.log('   - 2 Employers (Anil Mehta, Sneha Reddy)');
  console.log('   - 1 Agency (Care Connect Services)');
  console.log('   - 10 Skills across different categories');
  console.log('   - 5 Languages');
  console.log('   - 3 Jobs (2 active, 1 filled)');
  console.log('   - 4 Applications');
  console.log('   - 2 Active Contracts');
  console.log('   - 4 Payment records');
  console.log(`   - ${attendanceRecords.length} Attendance records`);
  console.log('   - 2 Reviews');
  console.log('   - 7 Documents');
  console.log('   - 3 Training modules');
  console.log('   - 4 Subscriptions\n');
  console.log('🔑 Login Credentials:');
  console.log('   Worker 1: rajesh.kumar@example.com / password123');
  console.log('   Worker 2: priya.sharma@example.com / password123');
  console.log('   Worker 3: amit.patel@example.com / password123');
  console.log('   Employer 1: anil.mehta@example.com / password123');
  console.log('   Employer 2: sneha.reddy@example.com / password123');
  console.log('   Agency: contact@careconnect.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
