require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const FAQ = require('../models/FAQ');
const SlotCapacity = require('../models/SlotCapacity');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const NotificationLog = require('../models/NotificationLog');

const seedUsers = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'admin@saathi.edu',
    password: 'admin123',
    role: 'admin',
    gender: 'Male',
    isActive: true,
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'counselor@saathi.edu',
    password: 'counselor123',
    role: 'counselor',
    gender: 'Female',
    phone: '+919876543200',
    isActive: true,
  },
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@student.edu',
    enrollmentNo: 'EN2024001',
    password: 'student123',
    role: 'student',
    branch: 'CSE',
    year: '2nd',
    gender: 'Male',
    phone: '+919876543201',
    isActive: true,
  },
  {
    name: 'Diya Gupta',
    email: 'diya.gupta@student.edu',
    enrollmentNo: 'EN2024002',
    password: 'student123',
    role: 'student',
    branch: 'IT',
    year: '3rd',
    gender: 'Female',
    phone: '+919876543202',
    isActive: true,
  },
  {
    name: 'Arjun Singh',
    email: 'arjun.singh@student.edu',
    enrollmentNo: 'EN2024003',
    password: 'student123',
    role: 'student',
    branch: 'ECE',
    year: '1st',
    gender: 'Male',
    phone: '+919876543203',
    isActive: true,
  },
  {
    name: 'Ananya Mishra',
    email: 'ananya.mishra@student.edu',
    enrollmentNo: 'EN2024004',
    password: 'student123',
    role: 'student',
    branch: 'EE',
    year: '4th',
    gender: 'Female',
    phone: '+919876543204',
    isActive: true,
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@student.edu',
    enrollmentNo: 'EN2024005',
    password: 'student123',
    role: 'student',
    branch: 'Mechanical',
    year: '2nd',
    gender: 'Male',
    phone: '+919876543205',
    isActive: true,
  },
  {
    name: 'Kavya Reddy',
    email: 'kavya.reddy@student.edu',
    enrollmentNo: 'EN2024006',
    password: 'student123',
    role: 'student',
    branch: 'Civil',
    year: '3rd',
    gender: 'Female',
    phone: '+919876543206',
    isActive: true,
  },
  {
    name: 'Ishaan Joshi',
    email: 'ishaan.joshi@student.edu',
    enrollmentNo: 'EN2024007',
    password: 'student123',
    role: 'student',
    branch: 'CSE',
    year: '1st',
    gender: 'Male',
    phone: '+919876543207',
    isActive: true,
  },
  {
    name: 'Meera Nair',
    email: 'meera.nair@student.edu',
    enrollmentNo: 'EN2024008',
    password: 'student123',
    role: 'student',
    branch: 'IT',
    year: '4th',
    gender: 'Female',
    phone: '+919876543208',
    isActive: true,
  },
  {
    name: 'Vikram Chauhan',
    email: 'vikram.chauhan@student.edu',
    enrollmentNo: 'EN2024009',
    password: 'student123',
    role: 'student',
    branch: 'ECE',
    year: '2nd',
    gender: 'Male',
    phone: '+919876543209',
    isActive: true,
  },
  {
    name: 'Sneha Iyer',
    email: 'sneha.iyer@student.edu',
    enrollmentNo: 'EN2024010',
    password: 'student123',
    role: 'student',
    branch: 'CSE',
    year: '3rd',
    gender: 'Female',
    phone: '+919876543210',
    isActive: true,
  },
];

const seedFAQs = [
  {
    category: 'Understanding Mental Health',
    question: 'What is Depression and how does it feel?',
    answer:
      "Depression is more than just feeling sad — it's a persistent feeling of emptiness, hopelessness, or lack of interest in things you once enjoyed. You might feel constantly tired, have trouble concentrating, experience changes in appetite or sleep, or feel worthless. It can affect your body, mind, and daily life. Remember, depression is a real medical condition, not a sign of weakness, and it is very treatable with the right support.",
    order: 1,
  },
  {
    category: 'Understanding Mental Health',
    question: 'What is Anxiety Disorder?',
    answer:
      "Anxiety disorder goes beyond normal worrying. It's when feelings of fear, worry, or unease become so intense or constant that they interfere with your daily activities like studying, socializing, or sleeping. You may experience racing thoughts, restlessness, difficulty breathing, or a constant sense that something bad is about to happen — even when there's no clear reason. Anxiety disorders are very common among college students and respond well to counselling and coping strategies.",
    order: 2,
  },
  {
    category: 'Understanding Mental Health',
    question: 'What are the symptoms of Panic Disorder?',
    answer:
      "Panic disorder involves sudden, intense episodes of fear called panic attacks. During an attack, you might feel your heart racing, chest tightness, dizziness, sweating, trembling, or a feeling like you're losing control or dying. These episodes usually peak within 10 minutes and pass, but they can be very frightening. If you experience these, please know that panic attacks are not dangerous and effective help is available. Reach out to a counsellor — you don't have to manage this alone.",
    order: 3,
  },
  {
    category: 'About Counselling',
    question: 'What happens in a counselling session?',
    answer:
      "A counselling session is a safe, private conversation between you and a trained counsellor. You can talk about anything that's troubling you — academics, relationships, emotions, or life in general. The counsellor listens without judgment, helps you understand your feelings, and works with you to find healthy ways to cope. There's no pressure to share everything at once; you go at your own pace.",
    order: 1,
  },
  {
    category: 'About Counselling',
    question: 'How do I know if I need counselling?',
    answer:
      "If your emotions, thoughts, or behaviours are affecting your studies, relationships, sleep, appetite, or overall well-being for more than a couple of weeks, it may be a good time to talk to someone. You don't need to be in a crisis to seek help — counselling is for anyone who wants support in navigating life's challenges. Think of it as a wellness check-up for your mind.",
    order: 2,
  },
  {
    category: 'About Counselling',
    question: 'What is the difference between counselling and therapy?',
    answer:
      'Counselling typically focuses on specific issues or current challenges — like stress management, relationship problems, or academic pressure — and is usually shorter-term. Therapy (psychotherapy) may go deeper into long-standing emotional patterns, past experiences, or diagnosed mental health conditions and can be longer-term. At our centre, we provide counselling and can refer you to a therapist or psychiatrist if deeper support is needed.',
    order: 3,
  },
  {
    category: 'About Counselling',
    question: 'Is counselling confidential?',
    answer:
      'Yes, absolutely. Everything you share with your counsellor stays between you and them. Confidentiality is broken only in rare, extreme situations — such as if there is an immediate risk to your life or someone else\'s. Your counsellor will explain this clearly at the start. You can speak freely and honestly without worrying about anyone else finding out.',
    order: 4,
  },
  {
    category: 'About Counselling',
    question: 'How long does counselling take to work?',
    answer:
      "It varies from person to person. Some students feel better after just one or two sessions, while others benefit from regular sessions over several weeks. The key is consistency and openness. Even small shifts in perspective can make a big difference. Your counsellor will work with you to set realistic goals and track your progress together.",
    order: 5,
  },
  {
    category: 'About Counselling',
    question: 'Can I talk about anything with a counsellor?',
    answer:
      "Yes! There's no topic that's off-limits — whether it's academic pressure, family conflicts, heartbreak, identity questions, substance use, sexual health, or anything else on your mind. Counsellors are trained to be non-judgmental and supportive. The session is your space, and you decide what you want to talk about.",
    order: 6,
  },
  {
    category: 'Everyday Struggles',
    question: 'Why do I feel anxious for no reason?',
    answer:
      "Sometimes anxiety doesn't have an obvious trigger — and that's completely normal. It can stem from accumulated stress, subconscious worries, changes in routine, lack of sleep, or even genetic factors. Your body's stress system can sometimes overreact even when there's no immediate danger. If this happens often, speaking to a counsellor can help you identify hidden patterns and learn calming techniques that really work.",
    order: 1,
  },
  {
    category: 'Everyday Struggles',
    question: 'How can I control anger or mood swings?',
    answer:
      'Anger and mood swings are often signs that something deeper needs attention — stress, unmet needs, or emotional overload. Some helpful strategies include: pausing before reacting (count to 10 or step away), physical activity like a quick walk, journaling your feelings, and practising deep breathing. If mood swings are frequent and intense, a counsellor can help you explore the root causes and build healthier coping habits.',
    order: 2,
  },
  {
    category: 'Everyday Struggles',
    question: "Why do I feel lonely even when I'm around people?",
    answer:
      "Loneliness isn't about how many people are around you — it's about the quality of connection you feel. You might be surrounded by friends but still feel misunderstood or disconnected. This is more common than you think, especially in college where everyone seems to be having a great time. It's okay to feel this way. Talking to a counsellor can help you explore what kind of connection you're craving and how to build more meaningful relationships.",
    order: 3,
  },
  {
    category: 'Everyday Struggles',
    question: 'How to deal with heartbreak or rejection?',
    answer:
      'Heartbreak and rejection can feel devastating — and the pain is very real. Allow yourself to grieve without judging your emotions. Lean on friends or family you trust, keep up with basic routines (sleep, meals, classes), and avoid making big decisions while you\'re hurting. Journaling, creative outlets, and physical activity can also help. Remember, healing takes time — there\'s no shortcut. If the pain feels overwhelming, a counsellor can provide a safe space to process it.',
    order: 4,
  },
  {
    category: 'Everyday Struggles',
    question: 'What to do when I overthink a lot?',
    answer:
      'Overthinking is like a loop your mind gets stuck in — replaying past events or worrying about future ones. To break the cycle, try grounding techniques (name 5 things you can see, 4 you can hear, etc.), set a "worry time" (10 minutes a day, then move on), write down your thoughts to externalize them, or engage in an activity that demands your full attention. Regular exercise and good sleep also help calm an overactive mind. If it\'s constant and exhausting, counselling can teach you practical tools to manage it.',
    order: 5,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await FAQ.deleteMany({});
    await SlotCapacity.deleteMany({});
    await Appointment.deleteMany({});
    await Notification.deleteMany({});
    await NotificationLog.deleteMany({});

    console.log('Cleared existing collections.');

    // Seed users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const u = await User.create(userData);
      createdUsers.push(u);
    }
    console.log(`Seeded ${createdUsers.length} users.`);

    const counselor = createdUsers.find((u) => u.role === 'counselor');
    const students = createdUsers.filter((u) => u.role === 'student');

    // Seed FAQs
    await FAQ.insertMany(seedFAQs);
    console.log(`Seeded ${seedFAQs.length} FAQs.`);

    // Helper date generator relative to today
    const getDateRel = (daysOffset) => {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    // 28 realistic appointments spanning the past 60 days to next 7 days
    const appointmentTemplates = [
      // Past Completed Sessions with feedback & notes
      {
        studentIdx: 0, // Aarav (CSE 2nd)
        daysOffset: -55,
        slot: '10:00-10:45',
        category: 'Academic Stress',
        answers: [1, 2, 1, 0, 0],
        status: 'completed',
        duration: 48,
        summary: 'Student experiencing intense pressure with midterms and backlogs.',
        advice: 'Recommended Pomodoro technique, regular sleep schedule, and meeting course TA.',
        feedback: { rating: 5, comment: 'Extremely helpful advice, helped me structure my study plan.', wasHelpful: true },
      },
      {
        studentIdx: 1, // Diya (IT 3rd)
        daysOffset: -48,
        slot: '11:00-11:45',
        category: 'Career Confusion',
        answers: [1, 1, 1, 0, 0],
        status: 'completed',
        duration: 45,
        summary: 'Unsure between placement preparation and higher studies (GATE/GRE).',
        advice: 'Provided decision matrix framework and connected with college alumni mentor network.',
        feedback: { rating: 4, comment: 'Gained much better clarity on my next steps.', wasHelpful: true },
      },
      {
        studentIdx: 2, // Arjun (ECE 1st)
        daysOffset: -40,
        slot: '14:00-14:45',
        category: 'Loneliness / Social Issues',
        answers: [2, 2, 2, 1, 0],
        status: 'completed',
        duration: 52,
        summary: 'First-year hostel adjustment issues; feeling disconnected from peers.',
        advice: 'Encouraged joining the campus robotics club and participating in floor activities.',
        feedback: { rating: 5, comment: 'Dr. Priya is very empathetic. Felt heard.', wasHelpful: true },
      },
      {
        studentIdx: 3, // Ananya (EE 4th)
        daysOffset: -35,
        slot: '15:00-15:45',
        category: 'Anxiety / Panic',
        answers: [3, 2, 3, 2, 0],
        status: 'completed',
        duration: 40,
        summary: 'Panic symptoms during placement interviews and group discussions.',
        advice: 'Taught 4-7-8 breathing and progressive muscle relaxation technique.',
        feedback: { rating: 4, comment: 'The breathing exercises really reduced my interview anxiety.', wasHelpful: true },
      },
      {
        studentIdx: 4, // Rohan (Mechanical 2nd)
        daysOffset: -30,
        slot: '12:00-12:45',
        category: 'Relationship / Heartbreak',
        answers: [2, 3, 1, 1, 0],
        status: 'completed',
        duration: 45,
        summary: 'Recent breakup affecting concentration in core engineering classes.',
        advice: 'Explored grief stages, encouraged journaling, and scheduled a follow-up check.',
        feedback: { rating: 5, comment: 'Safe space to speak without being judged.', wasHelpful: true },
      },
      {
        studentIdx: 5, // Kavya (Civil 3rd)
        daysOffset: -25,
        slot: '16:00-16:45',
        category: 'Depression / Low Mood',
        answers: [3, 3, 2, 2, 1], // self-harm flag = 1 -> Severe
        status: 'completed',
        duration: 58,
        summary: 'Severe depressive feelings, persistent fatigue, isolated from family.',
        advice: 'Emergency supportive therapy; shared campus 24/7 hotline; follow-up arranged with Psychiatrist.',
        forwarded: true,
        forwardedTo: 'Psychiatrist',
        forwardedReason: 'Depressive symptoms requiring psychiatric evaluation & medical assessment.',
        feedback: { rating: 5, comment: 'Thank you for connecting me to the right care and being there.', wasHelpful: true },
      },
      {
        studentIdx: 6, // Ishaan (CSE 1st)
        daysOffset: -20,
        slot: '10:00-10:45',
        category: 'Anger / Mood Swings',
        answers: [1, 2, 2, 1, 0],
        status: 'completed',
        duration: 43,
        summary: 'Conflicts with hostel roommate escalating into shouting matches.',
        advice: 'Communication strategies: "I" statements, defusing anger through physical workouts.',
        feedback: { rating: 4, comment: 'Good practical tips for roommate conflict.', wasHelpful: true },
      },
      {
        studentIdx: 7, // Meera (IT 4th)
        daysOffset: -18,
        slot: '11:00-11:45',
        category: 'Academic Stress',
        answers: [2, 1, 2, 1, 0],
        status: 'completed',
        duration: 45,
        summary: 'Final year capstone project deadline stress.',
        advice: 'Milestone breakdown and task delegation with project teammates.',
        feedback: { rating: 3, comment: 'Standard advice but good reminder.', wasHelpful: true },
      },
      {
        studentIdx: 8, // Vikram (ECE 2nd)
        daysOffset: -15,
        slot: '14:00-14:45',
        category: 'Family Issues',
        answers: [1, 2, 2, 1, 0],
        status: 'completed',
        duration: 46,
        summary: 'Parental expectations regarding branch change and grade targets.',
        advice: 'Boundary setting, empathetic assertiveness conversation with parents.',
        feedback: { rating: 5, comment: 'Very practical roleplay on talking to parents.', wasHelpful: true },
      },
      {
        studentIdx: 9, // Sneha (CSE 3rd)
        daysOffset: -12,
        slot: '15:00-15:45',
        category: 'Anxiety / Panic',
        answers: [2, 3, 3, 2, 0],
        status: 'completed',
        duration: 50,
        summary: 'Social anxiety and speaking up in tech seminars.',
        advice: 'Gradual exposure hierarchy; rehearsing in front of close friends first.',
        feedback: { rating: 4, comment: 'Helped me give my seminar presentation today!', wasHelpful: true },
      },
      {
        studentIdx: 0, // Aarav (CSE 2nd) - follow-up
        daysOffset: -10,
        slot: '12:00-12:45',
        category: 'Academic Stress',
        answers: [0, 1, 1, 0, 0],
        status: 'completed',
        duration: 38,
        summary: 'Follow-up on study habits: grades improved significantly.',
        advice: 'Continue healthy balance of sports and studies.',
        feedback: { rating: 5, comment: 'Great follow up session.', wasHelpful: true },
      },
      {
        studentIdx: 1, // Diya (IT 3rd) - past rejected
        daysOffset: -8,
        slot: '16:00-16:45',
        category: 'Career Confusion',
        answers: [0, 1, 0, 0, 0],
        status: 'rejected',
        rejectionReason: 'Counselor attending mandatory university academic council meeting.',
      },
      {
        studentIdx: 2, // Arjun (ECE 1st) - past no-show
        daysOffset: -6,
        slot: '10:00-10:45',
        category: 'Loneliness / Social Issues',
        answers: [1, 1, 1, 0, 0],
        status: 'no_show',
      },
      {
        studentIdx: 3, // Ananya (EE 4th) - past cancelled by student
        daysOffset: -5,
        slot: '11:00-11:45',
        category: 'Anxiety / Panic',
        answers: [1, 2, 1, 0, 0],
        status: 'cancelled',
      },
      {
        studentIdx: 4, // Rohan (Mechanical 2nd) - past completed
        daysOffset: -4,
        slot: '14:00-14:45',
        category: 'Relationship / Heartbreak',
        answers: [1, 1, 0, 0, 0],
        status: 'completed',
        duration: 42,
        summary: 'Progress check: student feels much more emotionally stable.',
        advice: 'Continue creative hobbies and campus gym routine.',
        feedback: { rating: 5, comment: 'Life feels back on track. Thank you!', wasHelpful: true },
      },
      {
        studentIdx: 5, // Kavya (Civil 3rd) - past completed follow-up
        daysOffset: -3,
        slot: '15:00-15:45',
        category: 'Depression / Low Mood',
        answers: [2, 2, 1, 1, 0],
        status: 'completed',
        duration: 47,
        summary: 'Joint session after psychiatric consult; medication going well.',
        advice: 'Maintain sleep hygiene and morning sunlight walking routine.',
        feedback: { rating: 5, comment: 'Feeling much more optimistic.', wasHelpful: true },
      },
      {
        studentIdx: 6, // Ishaan (CSE 1st) - past completed
        daysOffset: -2,
        slot: '16:00-16:45',
        category: 'Other',
        customCategory: 'Sleep Schedule Disruption',
        answers: [1, 2, 1, 1, 0],
        status: 'completed',
        duration: 40,
        summary: 'Coding till 4 AM causing severe daytime grogginess.',
        advice: 'Digital sunset 1 hour before sleep; blue light filters.',
        feedback: { rating: 4, comment: 'Sleep schedule is getting better.', wasHelpful: true },
      },
      {
        studentIdx: 7, // Meera (IT 4th) - past completed
        daysOffset: -1,
        slot: '10:00-10:45',
        category: 'Career Confusion',
        answers: [1, 1, 1, 1, 0],
        status: 'completed',
        duration: 45,
        summary: 'Received an offer from product firm; negotiating joining date.',
        advice: 'Congratulated student; discussed work-life transition.',
        feedback: { rating: 5, comment: 'Wonderful support throughout college!', wasHelpful: true },
      },

      // Today's Queue (DaysOffset = 0)
      {
        studentIdx: 8, // Vikram (ECE 2nd) - Today 10:00 (Completed earlier today)
        daysOffset: 0,
        slot: '10:00-10:45',
        category: 'Family Issues',
        answers: [1, 1, 2, 0, 0],
        status: 'completed',
        duration: 44,
        summary: 'Discussed family support during upcoming semester exams.',
        advice: 'Share revised timetable with parents so expectations align.',
      },
      {
        studentIdx: 9, // Sneha (CSE 3rd) - Today 11:00 (In Progress right now!)
        daysOffset: 0,
        slot: '11:00-11:45',
        category: 'Anxiety / Panic',
        answers: [3, 2, 3, 2, 0],
        status: 'in_progress',
        isHighPriority: true,
        sessionStarted: true,
      },
      {
        studentIdx: 0, // Aarav (CSE 2nd) - Today 12:00 (Approved upcoming today)
        daysOffset: 0,
        slot: '12:00-12:45',
        category: 'Academic Stress',
        answers: [1, 1, 1, 0, 0],
        status: 'approved',
      },
      {
        studentIdx: 1, // Diya (IT 3rd) - Today 14:00 (Approved upcoming today, delayed by 10 min)
        daysOffset: 0,
        slot: '14:00-14:45',
        category: 'Career Confusion',
        answers: [1, 2, 1, 0, 0],
        status: 'approved',
        delayMinutes: 10,
        delayMessage: 'Morning session ran slightly over. Please come at 14:10.',
      },

      // Future Upcoming Bookings (Next 1 to 5 days)
      {
        studentIdx: 2, // Arjun (ECE 1st) - Tomorrow Approved (Online Meeting)
        daysOffset: 1,
        slot: '10:00-10:45',
        category: 'Loneliness / Social Issues',
        answers: [2, 2, 2, 1, 0],
        status: 'approved',
        meetingMode: 'online',
        meetingLink: 'https://meet.google.com/saa-thic-ons',
      },
      {
        studentIdx: 3, // Ananya (EE 4th) - Tomorrow Pending (Urgent / Severe alert)
        daysOffset: 1,
        slot: '11:00-11:45',
        category: 'Depression / Low Mood',
        answers: [3, 3, 3, 2, 1], // Self-harm = 1 -> Urgent and Severe!
        isUrgent: true,
        status: 'pending',
      },
      {
        studentIdx: 4, // Rohan (Mechanical 2nd) - Day 2 Pending
        daysOffset: 2,
        slot: '14:00-14:45',
        category: 'Relationship / Heartbreak',
        answers: [2, 2, 1, 0, 0],
        status: 'pending',
      },
      {
        studentIdx: 5, // Kavya (Civil 3rd) - Day 3 Pending
        daysOffset: 3,
        slot: '10:00-10:45',
        category: 'Academic Stress',
        answers: [2, 1, 2, 1, 0],
        status: 'pending',
      },
      {
        studentIdx: 6, // Ishaan (CSE 1st) - Day 4 Rescheduled (Approved)
        daysOffset: 4,
        slot: '15:00-15:45',
        category: 'Anger / Mood Swings',
        answers: [1, 2, 2, 1, 0],
        status: 'approved',
        rescheduleHistory: [
          {
            oldDate: getDateRel(2),
            oldSlot: '11:00-11:45',
            newDate: getDateRel(4),
            newSlot: '15:00-15:45',
            reason: 'Student had mid-semester lab evaluation clash.',
            by: counselor._id,
            at: new Date(),
          },
        ],
      },
      {
        studentIdx: 7, // Meera (IT 4th) - Day 5 Pending
        daysOffset: 5,
        slot: '16:00-16:45',
        category: 'Career Confusion',
        answers: [1, 2, 1, 0, 0],
        status: 'pending',
      },
    ];

    let createdCount = 0;
    for (const t of appointmentTemplates) {
      const student = students[t.studentIdx];
      const appointmentDate = getDateRel(t.daysOffset);
      const answers = t.answers || [1, 1, 1, 0, 0];
      const urgentFlag = answers[4] > 0 || Boolean(t.isUrgent);
      const score = answers[0] + answers[1] + answers[2] + answers[3];

      let severity;
      if (urgentFlag) severity = 'Severe';
      else if (score <= 4) severity = 'Mild';
      else if (score <= 8) severity = 'Moderate';
      else severity = 'Severe';

      let sessionStartedAt = null;
      let sessionEndedAt = null;
      if (t.status === 'in_progress') {
        sessionStartedAt = new Date(Date.now() - 25 * 60 * 1000); // 25 mins ago
      } else if (t.status === 'completed') {
        const d = new Date(appointmentDate);
        d.setHours(11, 0, 0, 0);
        sessionStartedAt = d;
        sessionEndedAt = new Date(d.getTime() + (t.duration || 45) * 60 * 1000);
      }

      const apt = await Appointment.create({
        studentId: student._id,
        name: student.name,
        email: student.email,
        enrollmentNo: student.enrollmentNo,
        branch: student.branch,
        year: student.year,
        gender: student.gender,
        date: appointmentDate,
        timeSlot: t.slot,
        issueCategory: t.category,
        customCategory: t.customCategory || '',
        description: `Student seeking guidance for ${t.category.toLowerCase()}.`,
        isUrgent: urgentFlag,
        screeningAnswers: answers,
        screeningScore: score,
        severity,
        urgentFlag,
        status: t.status,
        rejectionReason: t.rejectionReason || '',
        counselorId: counselor._id,
        approvedBy: ['approved', 'in_progress', 'completed'].includes(t.status) ? counselor._id : null,
        approvedAt: ['approved', 'in_progress', 'completed'].includes(t.status) ? new Date(appointmentDate.getTime() - 86400000) : null,
        sessionStartedAt,
        sessionEndedAt,
        actualDurationMins: t.duration || (t.status === 'completed' ? 45 : 0),
        delayMinutes: t.delayMinutes || 0,
        delayMessage: t.delayMessage || '',
        meetingMode: t.meetingMode || 'offline',
        meetingLink: t.meetingLink || '',
        meeting: {
          mode: t.meetingMode || 'offline',
          link: t.meetingLink || '',
          provider: t.meetingLink ? 'manual' : '',
          createdBy: counselor._id,
        },
        rescheduleHistory: t.rescheduleHistory || [],
        sessionNotes: {
          summary: t.summary || '',
          advice: t.advice || '',
          followUpNeeded: Boolean(t.forwarded),
          followUpDate: t.forwarded ? getDateRel(t.daysOffset + 14) : null,
          forwarded: Boolean(t.forwarded),
          forwardedTo: t.forwardedTo || '',
          forwardedReason: t.forwardedReason || '',
          updatedAt: t.status === 'completed' ? sessionEndedAt : null,
        },
        feedback: t.feedback
          ? {
              rating: t.feedback.rating,
              comment: t.feedback.comment,
              wasHelpful: t.feedback.wasHelpful,
              submittedAt: new Date(sessionEndedAt.getTime() + 7200000),
            }
          : undefined,
      });

      // Update SlotCapacity for active slots (pending, approved, in_progress)
      if (['pending', 'approved', 'in_progress'].includes(t.status)) {
        const dateStr = appointmentDate.toISOString().split('T')[0];
        await SlotCapacity.findOneAndUpdate(
          { date: dateStr, slot: t.slot },
          { $inc: { bookedCount: 1 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      // Create realistic notification log
      await NotificationLog.create({
        userId: student._id,
        appointmentId: apt._id,
        channel: 'in_app',
        to: 'in-app-bell',
        subject: `Appointment Status: ${t.status}`,
        body: `Your appointment request for ${appointmentDate.toISOString().split('T')[0]} is ${t.status}.`,
        status: 'sent',
      });

      // Email channel log (skipped if smtp unset)
      await NotificationLog.create({
        userId: student._id,
        appointmentId: apt._id,
        channel: 'email',
        to: student.email,
        subject: `Appointment ${t.status.toUpperCase()}`,
        body: `Details for your appointment on ${t.slot}`,
        status: process.env.SMTP_HOST ? 'sent' : 'skipped',
        error: process.env.SMTP_HOST ? '' : 'SMTP credentials not configured in environment',
      });

      createdCount++;
    }

    console.log(`Seeded ${createdCount} realistic appointments with full history, notes, and analytics.`);

    console.log('\n--- Seed Complete ---');
    console.log('Credentials:');
    console.log('  Admin:     admin@saathi.edu / admin123');
    console.log('  Counselor: counselor@saathi.edu / counselor123');
    console.log('  Student:   aarav.patel@student.edu / student123 (and 9 others)');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
