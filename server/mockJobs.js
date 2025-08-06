const mongoose = require('mongoose');
const Job = require('./Models/jobModel');
const User = require('./Models/dbModel');
require('dotenv').config();

const mockJobs = [
    // Technology Jobs
    {
        title: 'Senior Frontend Developer',
        company: 'TechCorp Solutions',
        description: 'We are seeking a Senior Frontend Developer to join our dynamic team. You will be responsible for developing user-facing web applications using modern JavaScript frameworks. The ideal candidate has strong experience with React, Vue.js, or Angular and a passion for creating exceptional user experiences.',
        requirements: ['5+ years of frontend development experience', 'Expert in React/Vue/Angular', 'Strong JavaScript and TypeScript skills', 'Experience with state management (Redux/Vuex)', 'Knowledge of CSS preprocessors', 'Git version control'],
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: { min: 120000, max: 180000, currency: 'USD' },
        experience: 'Senior-level',
        category: 'Technology',
        skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Redux'],
        benefits: ['Health Insurance', '401k Matching', 'Remote Work Options', 'Professional Development Budget'],
        deadline: new Date('2025-09-15')
    },
    {
        title: 'Backend Engineer - Node.js',
        company: 'DataFlow Inc',
        description: 'Join our backend team to build scalable microservices and APIs. You will work with Node.js, Express, and various databases to create robust server-side applications that power our platform.',
        requirements: ['3+ years Node.js experience', 'Experience with Express.js', 'Database design skills (MongoDB/PostgreSQL)', 'RESTful API development', 'Docker containerization', 'AWS/GCP knowledge'],
        location: 'Austin, TX',
        type: 'Full-time',
        salary: { min: 95000, max: 140000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Technology',
        skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
        benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Learning Stipend'],
        deadline: new Date('2025-08-30')
    },
    {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        description: 'Looking for a versatile full stack developer to work on our cutting-edge SaaS platform. You will be involved in both frontend and backend development using modern technologies.',
        requirements: ['2+ years full stack experience', 'React and Node.js proficiency', 'Database management', 'API integration', 'Agile development experience'],
        location: 'Remote',
        type: 'Remote',
        salary: { min: 80000, max: 120000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Technology',
        skills: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'Git'],
        benefits: ['Fully Remote', 'Health Insurance', 'Equipment Provided', 'Unlimited PTO'],
        deadline: new Date('2025-09-01')
    },
    {
        title: 'DevOps Engineer',
        company: 'CloudFirst Technologies',
        description: 'Seeking a DevOps Engineer to manage our cloud infrastructure and deployment pipelines. You will work with containerization, CI/CD, and cloud platforms to ensure reliable and scalable deployments.',
        requirements: ['3+ years DevOps experience', 'Kubernetes/Docker expertise', 'CI/CD pipeline management', 'AWS/Azure/GCP experience', 'Infrastructure as Code (Terraform)', 'Monitoring and logging tools'],
        location: 'Seattle, WA',
        type: 'Full-time',
        salary: { min: 110000, max: 160000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Technology',
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'Prometheus'],
        benefits: ['Health Insurance', '401k', 'Stock Options', 'Conference Budget'],
        deadline: new Date('2025-09-10')
    },
    {
        title: 'Data Scientist',
        company: 'AI Innovations Lab',
        description: 'Join our data science team to build machine learning models and extract insights from large datasets. You will work on predictive analytics, recommendation systems, and data visualization.',
        requirements: ['PhD or Masters in Data Science/Statistics', 'Python/R programming', 'Machine Learning frameworks (TensorFlow/PyTorch)', 'SQL and data warehousing', 'Statistical analysis', 'Data visualization tools'],
        location: 'Boston, MA',
        type: 'Full-time',
        salary: { min: 130000, max: 190000, currency: 'USD' },
        experience: 'Senior-level',
        category: 'Technology',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Scikit-learn'],
        benefits: ['Health Insurance', 'Research Budget', 'Publication Support', 'Flexible Schedule'],
        deadline: new Date('2025-09-20')
    },
    {
        title: 'Mobile App Developer - iOS',
        company: 'MobileFirst Studios',
        description: 'Develop native iOS applications using Swift and modern iOS frameworks. You will work on consumer-facing apps with millions of users.',
        requirements: ['3+ years iOS development', 'Swift programming language', 'iOS SDK and frameworks', 'App Store submission process', 'UI/UX design principles', 'Core Data and networking'],
        location: 'Los Angeles, CA',
        type: 'Full-time',
        salary: { min: 100000, max: 145000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Technology',
        skills: ['Swift', 'iOS SDK', 'Xcode', 'Core Data', 'UIKit', 'SwiftUI'],
        benefits: ['Health Insurance', 'MacBook Pro', 'App Store Credits', 'Team Outings'],
        deadline: new Date('2025-08-25')
    },
    {
        title: 'Cybersecurity Analyst',
        company: 'SecureNet Solutions',
        description: 'Protect our organization and clients from cyber threats. Monitor security events, conduct vulnerability assessments, and implement security measures.',
        requirements: ['2+ years cybersecurity experience', 'Security frameworks (NIST, ISO 27001)', 'Penetration testing', 'SIEM tools', 'Incident response', 'Security certifications (CISSP, CEH)'],
        location: 'Washington, DC',
        type: 'Full-time',
        salary: { min: 85000, max: 125000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Technology',
        skills: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Incident Response', 'Risk Assessment'],
        benefits: ['Security Clearance Support', 'Certification Training', 'Health Insurance', 'Bonus Structure'],
        deadline: new Date('2025-09-05')
    },
    {
        title: 'Junior Software Developer',
        company: 'CodeCraft Academy',
        description: 'Perfect opportunity for new graduates or career changers. Join our supportive team where you will learn modern development practices while contributing to real projects.',
        requirements: ['Computer Science degree or bootcamp graduate', 'Basic programming knowledge (any language)', 'Understanding of web technologies', 'Eagerness to learn', 'Problem-solving skills'],
        location: 'Chicago, IL',
        type: 'Full-time',
        salary: { min: 55000, max: 75000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Technology',
        skills: ['JavaScript', 'HTML', 'CSS', 'Git', 'Problem Solving'],
        benefits: ['Mentorship Program', 'Learning Budget', 'Health Insurance', 'Career Development'],
        deadline: new Date('2025-08-28')
    },
    {
        title: 'UI/UX Designer',
        company: 'DesignHub Creative',
        description: 'Create beautiful and intuitive user interfaces for web and mobile applications. Work closely with developers and product managers to deliver exceptional user experiences.',
        requirements: ['3+ years UI/UX design experience', 'Proficiency in Figma/Sketch/Adobe XD', 'User research and testing', 'Prototyping skills', 'Understanding of frontend technologies', 'Portfolio of design work'],
        location: 'Portland, OR',
        type: 'Full-time',
        salary: { min: 75000, max: 110000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Design',
        skills: ['UI Design', 'UX Research', 'Figma', 'Prototyping', 'User Testing', 'Adobe Creative Suite'],
        benefits: ['Design Software Licenses', 'Conference Tickets', 'Health Insurance', 'Creative Freedom'],
        deadline: new Date('2025-09-12')
    },
    {
        title: 'Product Manager - Tech',
        company: 'InnovateTech Corp',
        description: 'Lead product strategy and development for our flagship SaaS platform. Work with engineering, design, and business teams to deliver products that customers love.',
        requirements: ['4+ years product management experience', 'Technical background preferred', 'Agile/Scrum methodology', 'Data-driven decision making', 'Stakeholder management', 'Roadmap planning'],
        location: 'New York, NY',
        type: 'Full-time',
        salary: { min: 130000, max: 180000, currency: 'USD' },
        experience: 'Senior-level',
        category: 'Product',
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Stakeholder Management', 'User Research'],
        benefits: ['Stock Options', 'Health Insurance', 'Unlimited PTO', 'Product Development Budget'],
        deadline: new Date('2025-09-18')
    },

    // Marketing Jobs
    {
        title: 'Digital Marketing Manager',
        company: 'GrowthHackers Inc',
        description: 'Lead our digital marketing efforts across multiple channels. Develop and execute strategies for SEO, SEM, social media, and content marketing to drive customer acquisition.',
        requirements: ['3+ years digital marketing experience', 'Google Ads and Analytics certification', 'SEO/SEM expertise', 'Social media marketing', 'Content strategy', 'A/B testing experience'],
        location: 'Miami, FL',
        type: 'Full-time',
        salary: { min: 70000, max: 95000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Marketing',
        skills: ['SEO', 'Google Ads', 'Social Media', 'Content Marketing', 'Analytics', 'Email Marketing'],
        benefits: ['Marketing Budget', 'Conference Attendance', 'Health Insurance', 'Performance Bonuses'],
        deadline: new Date('2025-09-08')
    },
    {
        title: 'Content Marketing Specialist',
        company: 'ContentKings Media',
        description: 'Create compelling content that engages our audience and drives conversions. Manage blog, social media content, video scripts, and email campaigns.',
        requirements: ['2+ years content marketing experience', 'Excellent writing skills', 'SEO content optimization', 'Social media management', 'Basic graphic design', 'Analytics and reporting'],
        location: 'Denver, CO',
        type: 'Full-time',
        salary: { min: 50000, max: 70000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Marketing',
        skills: ['Content Writing', 'SEO', 'Social Media', 'Graphic Design', 'Email Marketing'],
        benefits: ['Creative Freedom', 'Professional Development', 'Health Insurance', 'Remote Work Days'],
        deadline: new Date('2025-08-22')
    },
    {
        title: 'Social Media Manager',
        company: 'SocialBuzz Agency',
        description: 'Manage social media presence for multiple clients across various platforms. Create engaging content, manage communities, and drive brand awareness.',
        requirements: ['2+ years social media management', 'Platform expertise (Instagram, TikTok, LinkedIn)', 'Content creation skills', 'Community management', 'Analytics and reporting', 'Trend awareness'],
        location: 'Nashville, TN',
        type: 'Full-time',
        salary: { min: 45000, max: 65000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Marketing',
        skills: ['Social Media', 'Content Creation', 'Community Management', 'Analytics', 'Photography'],
        benefits: ['Social Media Tools', 'Creative Equipment', 'Health Insurance', 'Flexible Schedule'],
        deadline: new Date('2025-09-03')
    },
    {
        title: 'Marketing Coordinator',
        company: 'BrandBuilders LLC',
        description: 'Support marketing team with campaign coordination, event planning, and marketing operations. Great entry-level opportunity in marketing.',
        requirements: ['Bachelor\'s degree in Marketing or related field', 'Strong organizational skills', 'Basic marketing knowledge', 'Microsoft Office proficiency', 'Communication skills', 'Detail-oriented'],
        location: 'Phoenix, AZ',
        type: 'Full-time',
        salary: { min: 40000, max: 55000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Marketing',
        skills: ['Marketing Coordination', 'Event Planning', 'Microsoft Office', 'Communication', 'Organization'],
        benefits: ['Training Programs', 'Health Insurance', 'Career Growth Path', 'Team Events'],
        deadline: new Date('2025-08-30')
    },
    {
        title: 'Email Marketing Specialist',
        company: 'EmailPro Solutions',
        description: 'Design and execute email marketing campaigns that convert. Manage automation workflows, segment audiences, and optimize campaign performance.',
        requirements: ['2+ years email marketing experience', 'ESP platforms (Mailchimp, Klaviyo, HubSpot)', 'HTML/CSS for email', 'A/B testing', 'Segmentation strategies', 'Analytics and reporting'],
        location: 'Remote',
        type: 'Remote',
        salary: { min: 55000, max: 75000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Marketing',
        skills: ['Email Marketing', 'Marketing Automation', 'HTML/CSS', 'A/B Testing', 'Analytics'],
        benefits: ['Fully Remote', 'Marketing Tool Licenses', 'Health Insurance', 'Professional Development'],
        deadline: new Date('2025-09-15')
    },

    // Sales Jobs
    {
        title: 'Sales Development Representative',
        company: 'SalesForce Pro',
        description: 'Generate qualified leads and set up meetings for the sales team. Make outbound calls, send emails, and use social selling techniques to build pipeline.',
        requirements: ['1+ years sales experience preferred', 'Excellent communication skills', 'CRM experience (Salesforce preferred)', 'Cold calling and email outreach', 'Goal-oriented mindset', 'Coachable attitude'],
        location: 'Atlanta, GA',
        type: 'Full-time',
        salary: { min: 45000, max: 65000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Sales',
        skills: ['Lead Generation', 'Cold Calling', 'Email Outreach', 'CRM', 'Communication'],
        benefits: ['Commission Structure', 'Sales Training', 'Health Insurance', 'Career Advancement'],
        deadline: new Date('2025-08-26')
    },
    {
        title: 'Account Executive',
        company: 'Enterprise Solutions Group',
        description: 'Manage and grow existing client relationships while acquiring new enterprise accounts. Present solutions, negotiate contracts, and exceed sales targets.',
        requirements: ['3+ years B2B sales experience', 'Enterprise sales background', 'CRM proficiency', 'Presentation skills', 'Contract negotiation', 'Industry knowledge'],
        location: 'Dallas, TX',
        type: 'Full-time',
        salary: { min: 80000, max: 120000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Sales',
        skills: ['B2B Sales', 'Account Management', 'Presentation', 'Negotiation', 'CRM'],
        benefits: ['High Commission Potential', 'Car Allowance', 'Health Insurance', 'President\'s Club'],
        deadline: new Date('2025-09-10')
    },
    {
        title: 'Inside Sales Representative',
        company: 'TechSales Solutions',
        description: 'Sell software solutions to small and medium businesses via phone and video calls. Build relationships, demonstrate products, and close deals.',
        requirements: ['2+ years inside sales experience', 'Software/SaaS sales background', 'Phone and video selling skills', 'CRM management', 'Product demonstration', 'Quota achievement'],
        location: 'Salt Lake City, UT',
        type: 'Full-time',
        salary: { min: 60000, max: 85000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Sales',
        skills: ['Inside Sales', 'SaaS Sales', 'Product Demo', 'Phone Sales', 'CRM'],
        benefits: ['Commission Plan', 'Sales Contests', 'Health Insurance', 'Professional Development'],
        deadline: new Date('2025-09-01')
    },
    {
        title: 'Regional Sales Manager',
        company: 'NationWide Products',
        description: 'Lead a team of sales representatives in the Western region. Develop territory strategies, coach team members, and drive revenue growth.',
        requirements: ['5+ years sales experience', '2+ years management experience', 'Territory management', 'Team leadership', 'Sales forecasting', 'Travel flexibility'],
        location: 'San Diego, CA',
        type: 'Full-time',
        salary: { min: 100000, max: 150000, currency: 'USD' },
        experience: 'Senior-level',
        category: 'Sales',
        skills: ['Sales Management', 'Team Leadership', 'Territory Planning', 'Forecasting', 'Coaching'],
        benefits: ['Management Bonus', 'Company Car', 'Health Insurance', 'Stock Options'],
        deadline: new Date('2025-09-20')
    },

    // Finance Jobs
    {
        title: 'Financial Analyst',
        company: 'Capital Investments Corp',
        description: 'Analyze financial data, prepare reports, and support investment decisions. Work with large datasets to identify trends and opportunities.',
        requirements: ['Bachelor\'s degree in Finance or Accounting', '2+ years financial analysis experience', 'Excel advanced skills', 'Financial modeling', 'SQL knowledge preferred', 'CFA progress preferred'],
        location: 'New York, NY',
        type: 'Full-time',
        salary: { min: 70000, max: 95000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Finance',
        skills: ['Financial Analysis', 'Excel', 'Financial Modeling', 'SQL', 'Data Analysis'],
        benefits: ['CFA Study Support', 'Health Insurance', 'Bonus Structure', 'Professional Development'],
        deadline: new Date('2025-09-12')
    },
    {
        title: 'Accounting Manager',
        company: 'NumbersCorp LLC',
        description: 'Oversee accounting operations including month-end close, financial reporting, and compliance. Manage a small team of accounting professionals.',
        requirements: ['CPA certification required', '4+ years accounting experience', 'Management experience', 'GAAP knowledge', 'ERP systems experience', 'Team leadership skills'],
        location: 'Houston, TX',
        type: 'Full-time',
        salary: { min: 85000, max: 115000, currency: 'USD' },
        experience: 'Senior-level',
        category: 'Finance',
        skills: ['Accounting', 'GAAP', 'Financial Reporting', 'ERP Systems', 'Team Management'],
        benefits: ['CPA Maintenance Support', 'Health Insurance', 'Retirement Plan', 'Management Training'],
        deadline: new Date('2025-09-08')
    },
    {
        title: 'Investment Banking Analyst',
        company: 'Premier Investment Bank',
        description: 'Support senior bankers with financial modeling, due diligence, and client presentations. Work on M&A transactions and capital markets deals.',
        requirements: ['Top university degree in Finance/Economics', 'Investment banking internship', 'Advanced Excel and PowerPoint', 'Financial modeling', 'Long hours flexibility', 'Series 7/63 eligible'],
        location: 'New York, NY',
        type: 'Full-time',
        salary: { min: 100000, max: 150000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Finance',
        skills: ['Financial Modeling', 'Excel', 'PowerPoint', 'Valuation', 'Due Diligence'],
        benefits: ['High Bonus Potential', 'Series 7 Sponsorship', 'Health Insurance', 'Meal Allowances'],
        deadline: new Date('2025-08-20')
    },
    {
        title: 'Tax Specialist',
        company: 'TaxPro Services',
        description: 'Prepare and review tax returns for individuals and businesses. Provide tax planning advice and ensure compliance with tax regulations.',
        requirements: ['Bachelor\'s degree in Accounting', 'CPA or EA certification', '3+ years tax experience', 'Tax software proficiency', 'Client communication skills', 'Regulatory knowledge'],
        location: 'Las Vegas, NV',
        type: 'Full-time',
        salary: { min: 60000, max: 80000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Finance',
        skills: ['Tax Preparation', 'Tax Planning', 'Tax Software', 'Client Service', 'Compliance'],
        benefits: ['CPA Support', 'Seasonal Bonuses', 'Health Insurance', 'Flexible Schedule'],
        deadline: new Date('2025-09-05')
    },

    // Healthcare Jobs
    {
        title: 'Registered Nurse - ICU',
        company: 'Metropolitan Medical Center',
        description: 'Provide critical care nursing in our 40-bed ICU. Care for critically ill patients, collaborate with medical teams, and support patient families.',
        requirements: ['RN license in state', 'BSN preferred', '2+ years ICU experience', 'ACLS and BLS certification', 'Critical care knowledge', 'Strong communication skills'],
        location: 'Minneapolis, MN',
        type: 'Full-time',
        salary: { min: 75000, max: 95000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Healthcare',
        skills: ['Critical Care', 'Patient Assessment', 'Medical Equipment', 'Team Collaboration', 'Emergency Response'],
        benefits: ['Health Insurance', 'Retirement Plan', 'Continuing Education', 'Shift Differentials'],
        deadline: new Date('2025-09-01')
    },
    {
        title: 'Physical Therapist',
        company: 'Rehabilitation Specialists',
        description: 'Provide physical therapy services to patients recovering from injuries and surgeries. Develop treatment plans and track patient progress.',
        requirements: ['DPT degree required', 'State PT license', '1+ years experience preferred', 'Manual therapy skills', 'Patient education abilities', 'EMR experience'],
        location: 'Tampa, FL',
        type: 'Full-time',
        salary: { min: 80000, max: 100000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Healthcare',
        skills: ['Physical Therapy', 'Manual Therapy', 'Patient Education', 'Treatment Planning', 'Documentation'],
        benefits: ['Continuing Education Budget', 'Health Insurance', 'Malpractice Insurance', 'Flexible Schedule'],
        deadline: new Date('2025-08-28')
    },
    {
        title: 'Medical Assistant',
        company: 'Family Practice Associates',
        description: 'Support physicians and nurses in a busy family practice. Take vital signs, prepare patients for exams, and assist with procedures.',
        requirements: ['Medical Assistant certification', 'Clinical experience preferred', 'EHR system knowledge', 'Phlebotomy skills', 'Customer service skills', 'Multi-tasking ability'],
        location: 'Raleigh, NC',
        type: 'Full-time',
        salary: { min: 35000, max: 45000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Healthcare',
        skills: ['Clinical Skills', 'Phlebotomy', 'EHR Systems', 'Patient Care', 'Administrative Tasks'],
        benefits: ['Health Insurance', 'Paid Training', 'Career Advancement', 'Retirement Plan'],
        deadline: new Date('2025-09-10')
    },
    {
        title: 'Pharmacy Technician',
        company: 'Regional Pharmacy Network',
        description: 'Assist pharmacists with prescription preparation, inventory management, and customer service in retail pharmacy setting.',
        requirements: ['Pharmacy Tech certification', 'State license required', 'Retail pharmacy experience', 'Attention to detail', 'Customer service skills', 'Computer proficiency'],
        location: 'Oklahoma City, OK',
        type: 'Full-time',
        salary: { min: 32000, max: 42000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Healthcare',
        skills: ['Pharmacy Operations', 'Prescription Processing', 'Customer Service', 'Inventory Management', 'Insurance Processing'],
        benefits: ['Health Insurance', 'Employee Discounts', 'Flexible Scheduling', 'Training Programs'],
        deadline: new Date('2025-08-25')
    },

    // Education Jobs
    {
        title: 'Elementary School Teacher',
        company: 'Sunshine Elementary School',
        description: 'Teach 3rd grade students in a supportive learning environment. Develop lesson plans, assess student progress, and communicate with parents.',
        requirements: ['Bachelor\'s degree in Education', 'Teaching license/certification', 'Elementary education experience', 'Classroom management skills', 'Curriculum development', 'Technology integration'],
        location: 'Portland, OR',
        type: 'Full-time',
        salary: { min: 45000, max: 60000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Education',
        skills: ['Curriculum Development', 'Classroom Management', 'Student Assessment', 'Parent Communication', 'Educational Technology'],
        benefits: ['Health Insurance', 'Retirement Plan', 'Summer Break', 'Professional Development'],
        deadline: new Date('2025-08-15')
    },
    {
        title: 'High School Math Teacher',
        company: 'Lincoln High School',
        description: 'Teach Algebra and Geometry to high school students. Prepare students for standardized tests and college readiness.',
        requirements: ['Bachelor\'s degree in Mathematics', 'Secondary teaching certification', 'Math teaching experience', 'Standardized test prep knowledge', 'Technology skills', 'Extracurricular willingness'],
        location: 'Columbus, OH',
        type: 'Full-time',
        salary: { min: 48000, max: 65000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Education',
        skills: ['Mathematics Instruction', 'Curriculum Planning', 'Student Motivation', 'Test Preparation', 'Classroom Technology'],
        benefits: ['Health Insurance', 'Pension Plan', 'Tenure Track', 'Professional Development'],
        deadline: new Date('2025-08-10')
    },
    {
        title: 'Instructional Designer',
        company: 'EduTech Solutions',
        description: 'Design engaging online learning experiences for corporate training programs. Create multimedia content and assessment tools.',
        requirements: ['Master\'s degree in Instructional Design', 'E-learning development experience', 'LMS platforms knowledge', 'Multimedia creation skills', 'Adult learning principles', 'Project management'],
        location: 'Remote',
        type: 'Remote',
        salary: { min: 65000, max: 85000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Education',
        skills: ['Instructional Design', 'E-learning Development', 'LMS', 'Multimedia Creation', 'Project Management'],
        benefits: ['Fully Remote', 'Professional Development', 'Health Insurance', 'Equipment Provided'],
        deadline: new Date('2025-09-15')
    },
    {
        title: 'Corporate Trainer',
        company: 'SkillBoost Training',
        description: 'Deliver training programs on leadership, communication, and professional development to corporate clients.',
        requirements: ['Bachelor\'s degree in relevant field', '3+ years training experience', 'Public speaking skills', 'Curriculum development', 'Adult learning expertise', 'Travel flexibility'],
        location: 'Chicago, IL',
        type: 'Full-time',
        salary: { min: 55000, max: 75000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Education',
        skills: ['Training Delivery', 'Public Speaking', 'Curriculum Development', 'Adult Learning', 'Presentation Skills'],
        benefits: ['Travel Reimbursement', 'Professional Development', 'Health Insurance', 'Performance Bonuses'],
        deadline: new Date('2025-09-05')
    },

    // Customer Service Jobs
    {
        title: 'Customer Success Manager',
        company: 'ClientFirst Software',
        description: 'Ensure customer satisfaction and retention for our SaaS platform. Onboard new clients, provide ongoing support, and identify expansion opportunities.',
        requirements: ['2+ years customer success experience', 'SaaS platform knowledge', 'CRM proficiency', 'Problem-solving skills', 'Communication excellence', 'Account management'],
        location: 'San Antonio, TX',
        type: 'Full-time',
        salary: { min: 60000, max: 80000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Customer Service',
        skills: ['Customer Success', 'Account Management', 'SaaS Platforms', 'Problem Solving', 'Communication'],
        benefits: ['Customer Success Bonuses', 'Health Insurance', 'Professional Development', 'Flexible Work'],
        deadline: new Date('2025-09-12')
    },
    {
        title: 'Technical Support Specialist',
        company: 'HelpDesk Pro',
        description: 'Provide technical support to customers via phone, email, and chat. Troubleshoot software issues and escalate complex problems.',
        requirements: ['Associate degree or equivalent', 'Technical support experience', 'Software troubleshooting', 'Communication skills', 'Patience and empathy', 'Help desk systems'],
        location: 'Remote',
        type: 'Remote',
        salary: { min: 40000, max: 55000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Customer Service',
        skills: ['Technical Support', 'Troubleshooting', 'Customer Communication', 'Help Desk Systems', 'Problem Resolution'],
        benefits: ['Fully Remote', 'Training Provided', 'Health Insurance', 'Career Growth'],
        deadline: new Date('2025-08-30')
    },
    {
        title: 'Call Center Representative',
        company: 'Contact Solutions Inc',
        description: 'Handle inbound customer calls for various clients. Provide information, resolve issues, and maintain high customer satisfaction scores.',
        requirements: ['High school diploma', 'Customer service experience preferred', 'Phone communication skills', 'Computer proficiency', 'Multi-tasking ability', 'Positive attitude'],
        location: 'Phoenix, AZ',
        type: 'Full-time',
        salary: { min: 32000, max: 42000, currency: 'USD' },
        experience: 'Entry-level',
        category: 'Customer Service',
        skills: ['Phone Communication', 'Customer Service', 'Data Entry', 'Problem Resolution', 'Multi-tasking'],
        benefits: ['Health Insurance', 'Paid Training', 'Performance Bonuses', 'Flexible Shifts'],
        deadline: new Date('2025-08-22')
    },

    // Operations Jobs
    {
        title: 'Operations Manager',
        company: 'Efficient Operations Group',
        description: 'Oversee daily operations and improve efficiency across departments. Manage budgets, supervise staff, and implement process improvements.',
        requirements: ['Bachelor\'s degree in Business', '4+ years operations experience', 'Team management skills', 'Process improvement knowledge', 'Budget management', 'Analytical skills'],
        location: 'Detroit, MI',
        type: 'Full-time',
        salary: { min: 75000, max: 100000, currency: 'USD' },
        experience: 'Senior-level',
        category: 'Operations',
        skills: ['Operations Management', 'Team Leadership', 'Process Improvement', 'Budget Management', 'Analytics'],
        benefits: ['Management Bonus', 'Health Insurance', 'Retirement Plan', 'Professional Development'],
        deadline: new Date('2025-09-18')
    },
    {
        title: 'Supply Chain Coordinator',
        company: 'LogiFlow Systems',
        description: 'Coordinate supply chain activities including procurement, inventory management, and vendor relationships.',
        requirements: ['Bachelor\'s degree in Supply Chain/Business', '2+ years supply chain experience', 'ERP systems knowledge', 'Vendor management', 'Analytical skills', 'Communication skills'],
        location: 'Cleveland, OH',
        type: 'Full-time',
        salary: { min: 55000, max: 70000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Operations',
        skills: ['Supply Chain Management', 'Procurement', 'Inventory Management', 'ERP Systems', 'Vendor Relations'],
        benefits: ['Health Insurance', 'Professional Certifications', 'Career Advancement', 'Retirement Plan'],
        deadline: new Date('2025-09-08')
    },
    {
        title: 'Quality Assurance Specialist',
        company: 'Quality First Manufacturing',
        description: 'Ensure product quality through testing, inspection, and process monitoring. Develop and maintain quality standards.',
        requirements: ['Bachelor\'s degree in Engineering/Quality', 'QA experience in manufacturing', 'Statistical analysis skills', 'Audit experience', 'Problem-solving abilities', 'Attention to detail'],
        location: 'Milwaukee, WI',
        type: 'Full-time',
        salary: { min: 50000, max: 68000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Operations',
        skills: ['Quality Assurance', 'Statistical Analysis', 'Process Monitoring', 'Auditing', 'Problem Solving'],
        benefits: ['Health Insurance', 'Quality Certifications', 'Performance Bonuses', 'Training Programs'],
        deadline: new Date('2025-09-01')
    },

    // Human Resources Jobs
    {
        title: 'HR Generalist',
        company: 'People Solutions HR',
        description: 'Handle various HR functions including recruitment, employee relations, benefits administration, and compliance.',
        requirements: ['Bachelor\'s degree in HR/Business', '3+ years HR experience', 'HRIS systems knowledge', 'Employment law understanding', 'Communication skills', 'Confidentiality'],
        location: 'Richmond, VA',
        type: 'Full-time',
        salary: { min: 55000, max: 75000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Human Resources',
        skills: ['HR Operations', 'Recruitment', 'Employee Relations', 'HRIS', 'Employment Law'],
        benefits: ['HR Certification Support', 'Health Insurance', 'Professional Development', 'Flexible Work'],
        deadline: new Date('2025-09-10')
    },
    {
        title: 'Talent Acquisition Specialist',
        company: 'TalentFinder Agency',
        description: 'Source, screen, and recruit top talent for various positions. Manage the full recruiting lifecycle from job posting to offer negotiation.',
        requirements: ['Bachelor\'s degree preferred', '2+ years recruiting experience', 'ATS systems proficiency', 'Sourcing techniques', 'Interview skills', 'Relationship building'],
        location: 'Austin, TX',
        type: 'Full-time',
        salary: { min: 50000, max: 70000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Human Resources',
        skills: ['Talent Acquisition', 'Recruiting', 'ATS Systems', 'Sourcing', 'Interviewing'],
        benefits: ['Recruiting Bonuses', 'Health Insurance', 'Professional Development', 'Networking Events'],
        deadline: new Date('2025-09-05')
    },
    {
        title: 'Training and Development Coordinator',
        company: 'Learning Solutions Corp',
        description: 'Coordinate employee training programs, track completion, and assess training effectiveness. Support career development initiatives.',
        requirements: ['Bachelor\'s degree in HR/Education', '2+ years training experience', 'LMS administration', 'Program coordination', 'Presentation skills', 'Data analysis'],
        location: 'Kansas City, MO',
        type: 'Full-time',
        salary: { min: 45000, max: 60000, currency: 'USD' },
        experience: 'Mid-level',
        category: 'Human Resources',
        skills: ['Training Coordination', 'LMS Administration', 'Program Development', 'Data Analysis', 'Presentation'],
        benefits: ['Training Budget', 'Health Insurance', 'Professional Development', 'Conference Attendance'],
        deadline: new Date('2025-08-28')
    },

    // Internships
    {
        title: 'Software Engineering Intern',
        company: 'TechStartup Innovations',
        description: 'Join our development team for a summer internship. Work on real projects, learn modern development practices, and gain hands-on experience.',
        requirements: ['Computer Science student (Junior/Senior)', 'Programming knowledge (any language)', 'Problem-solving skills', 'Eagerness to learn', 'Team collaboration', 'Available for 12-week program'],
        location: 'Palo Alto, CA',
        type: 'Internship',
        salary: { min: 25, max: 35, currency: 'USD' }, // per hour
        experience: 'Entry-level',
        category: 'Technology',
        skills: ['Programming', 'Problem Solving', 'Git', 'Team Collaboration', 'Learning Agility'],
        benefits: ['Mentorship', 'Learning Opportunities', 'Networking', 'Potential Full-time Offer'],
        deadline: new Date('2025-08-15')
    },
    {
        title: 'Marketing Intern',
        company: 'Creative Marketing Agency',
        description: 'Support marketing campaigns, social media management, and content creation. Perfect for students interested in digital marketing.',
        requirements: ['Marketing/Communications student', 'Social media knowledge', 'Content creation interest', 'Basic design skills', 'Communication skills', 'Available 20+ hours/week'],
        location: 'Los Angeles, CA',
        type: 'Internship',
        salary: { min: 18, max: 22, currency: 'USD' }, // per hour
        experience: 'Entry-level',
        category: 'Marketing',
        skills: ['Social Media', 'Content Creation', 'Basic Design', 'Communication', 'Digital Marketing'],
        benefits: ['Portfolio Building', 'Industry Exposure', 'Networking', 'Course Credit Available'],
        deadline: new Date('2025-08-20')
    },
    {
        title: 'Finance Intern',
        company: 'Investment Partners LLC',
        description: 'Assist with financial analysis, research, and reporting. Gain exposure to investment banking and financial services.',
        requirements: ['Finance/Economics student', 'Excel proficiency', 'Analytical skills', 'Attention to detail', 'Professional demeanor', 'Available full-time summer'],
        location: 'New York, NY',
        type: 'Internship',
        salary: { min: 20, max: 28, currency: 'USD' }, // per hour
        experience: 'Entry-level',
        category: 'Finance',
        skills: ['Financial Analysis', 'Excel', 'Research', 'Data Analysis', 'Professional Communication'],
        benefits: ['Industry Experience', 'Mentorship', 'Networking Events', 'Series 7 Study Materials'],
        deadline: new Date('2025-08-10')
    },

    // Part-time Positions
    {
        title: 'Part-time Graphic Designer',
        company: 'Creative Studio Arts',
        description: 'Create graphics for marketing materials, social media, and websites. Flexible schedule for work-life balance.',
        requirements: ['Graphic design experience', 'Adobe Creative Suite proficiency', 'Portfolio of work', 'Time management skills', 'Creative thinking', 'Available 20 hours/week'],
        location: 'Seattle, WA',
        type: 'Part-time',
        salary: { min: 22, max: 30, currency: 'USD' }, // per hour
        experience: 'Mid-level',
        category: 'Design',
        skills: ['Graphic Design', 'Adobe Creative Suite', 'Branding', 'Web Design', 'Print Design'],
        benefits: ['Flexible Schedule', 'Creative Freedom', 'Portfolio Development', 'Professional Growth'],
        deadline: new Date('2025-09-01')
    },
    {
        title: 'Part-time Data Entry Clerk',
        company: 'Administrative Services Plus',
        description: 'Accurate data entry and file management. Perfect for students or those seeking supplemental income.',
        requirements: ['High school diploma', 'Typing speed 50+ WPM', 'Attention to detail', 'Computer proficiency', 'Reliability', 'Available evenings/weekends'],
        location: 'Orlando, FL',
        type: 'Part-time',
        salary: { min: 15, max: 18, currency: 'USD' }, // per hour
        experience: 'Entry-level',
        category: 'Administrative',
        skills: ['Data Entry', 'Typing', 'Attention to Detail', 'Computer Skills', 'Time Management'],
        benefits: ['Flexible Hours', 'Remote Work Options', 'Steady Income', 'Skill Development'],
        deadline: new Date('2025-08-25')
    }
];

async function populateJobs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for job population');
        
        // Clear existing jobs
        await Job.deleteMany({});
        console.log('Cleared existing jobs');
        
        // Get all employers to assign random employerIds
        const employers = await User.find({ type: 'Employer' });
        
        if (employers.length === 0) {
            console.log('No employers found. Creating sample employer...');
            const sampleEmployer = new User({
                firstName: 'John',
                lastName: 'Employer',
                email: 'employer@example.com',
                password: 'hashedpassword123',
                type: 'Employer',
                company: 'Sample Company'
            });
            await sampleEmployer.save();
            employers.push(sampleEmployer);
        }
        
        // Assign random employerIds to jobs
        const jobsWithEmployers = mockJobs.map(job => ({
            ...job,
            employerId: employers[Math.floor(Math.random() * employers.length)]._id
        }));
        
        // Insert all jobs
        const insertedJobs = await Job.insertMany(jobsWithEmployers);
        console.log(`✅ Successfully inserted ${insertedJobs.length} jobs into the database`);
        
        // Display summary
        const categories = [...new Set(mockJobs.map(job => job.category))];
        console.log('\n📊 Job Categories:');
        for (const category of categories) {
            const count = mockJobs.filter(job => job.category === category).length;
            console.log(`   ${category}: ${count} jobs`);
        }
        
        console.log('\n🎯 Job Types:');
        const types = [...new Set(mockJobs.map(job => job.type))];
        for (const type of types) {
            const count = mockJobs.filter(job => job.type === type).length;
            console.log(`   ${type}: ${count} jobs`);
        }
        
        console.log('\n💼 Experience Levels:');
        const experiences = [...new Set(mockJobs.map(job => job.experience))];
        for (const exp of experiences) {
            const count = mockJobs.filter(job => job.experience === exp).length;
            console.log(`   ${exp}: ${count} jobs`);
        }
        
    } catch (error) {
        console.error('❌ Error populating jobs:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Export for use in other files
module.exports = { mockJobs, populateJobs };

// Run directly if this file is executed
if (require.main === module) {
    populateJobs();
    ///check the size of mockJobs
    // console.log(`Mock jobs array contains ${mockJobs.length} jobs.`);
}
