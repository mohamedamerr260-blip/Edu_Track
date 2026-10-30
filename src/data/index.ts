import {
  Student,
  Grade,
  Attendance,
  Behavior,
  Message,
  Notification,
  Badge,
  StudentBadge,
  UserRole,
  AttendanceStatus,
  BehaviorType,
  MessagePriority,
  NotificationType,
  BadgeType,
  GradeCategory,
} from '../lib/index';

// Mock Students (10 students with Arabic names)
export const mockStudents: Student[] = [
  {
    id: 'std-001',
    firstName: 'أحمد',
    lastName: 'محمد',
    fullName: 'أحمد محمد',
    email: 'ahmed.mohamed@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=11',
    grade: 'الصف العاشر',
    class: '10-أ',
    parentId: 'par-001',
    dateOfBirth: new Date('2008-03-15'),
    enrollmentDate: new Date('2020-09-01'),
    studentId: 'STD2020001',
    address: 'شارع النيل، القاهرة',
    phone: '+20-123-456-7890',
    emergencyContact: {
      name: 'محمد أحمد',
      phone: '+20-123-456-7891',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.8,
    attendance: 95,
    createdAt: new Date('2020-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-002',
    firstName: 'فاطمة',
    lastName: 'علي',
    fullName: 'فاطمة علي',
    email: 'fatima.ali@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=5',
    grade: 'الصف العاشر',
    class: '10-أ',
    parentId: 'par-002',
    dateOfBirth: new Date('2008-07-22'),
    enrollmentDate: new Date('2020-09-01'),
    studentId: 'STD2020002',
    address: 'شارع الجامعة، الإسكندرية',
    phone: '+20-123-456-7892',
    emergencyContact: {
      name: 'علي حسن',
      phone: '+20-123-456-7893',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.9,
    attendance: 98,
    createdAt: new Date('2020-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-003',
    firstName: 'محمود',
    lastName: 'حسن',
    fullName: 'محمود حسن',
    email: 'mahmoud.hassan@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=12',
    grade: 'الصف العاشر',
    class: '10-ب',
    parentId: 'par-003',
    dateOfBirth: new Date('2008-01-10'),
    enrollmentDate: new Date('2020-09-01'),
    studentId: 'STD2020003',
    address: 'شارع الهرم، الجيزة',
    phone: '+20-123-456-7894',
    emergencyContact: {
      name: 'حسن محمود',
      phone: '+20-123-456-7895',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.5,
    attendance: 92,
    createdAt: new Date('2020-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-004',
    firstName: 'مريم',
    lastName: 'خالد',
    fullName: 'مريم خالد',
    email: 'mariam.khaled@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=9',
    grade: 'الصف العاشر',
    class: '10-ب',
    parentId: 'par-004',
    dateOfBirth: new Date('2008-05-18'),
    enrollmentDate: new Date('2020-09-01'),
    studentId: 'STD2020004',
    address: 'شارع المعادي، القاهرة',
    phone: '+20-123-456-7896',
    emergencyContact: {
      name: 'خالد أحمد',
      phone: '+20-123-456-7897',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 4.0,
    attendance: 99,
    createdAt: new Date('2020-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-005',
    firstName: 'يوسف',
    lastName: 'عبدالله',
    fullName: 'يوسف عبدالله',
    email: 'youssef.abdullah@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=13',
    grade: 'الصف التاسع',
    class: '9-أ',
    parentId: 'par-005',
    dateOfBirth: new Date('2009-09-25'),
    enrollmentDate: new Date('2021-09-01'),
    studentId: 'STD2021005',
    address: 'شارع الزمالك، القاهرة',
    phone: '+20-123-456-7898',
    emergencyContact: {
      name: 'عبدالله يوسف',
      phone: '+20-123-456-7899',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.6,
    attendance: 94,
    createdAt: new Date('2021-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-006',
    firstName: 'نور',
    lastName: 'إبراهيم',
    fullName: 'نور إبراهيم',
    email: 'nour.ibrahim@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=10',
    grade: 'الصف التاسع',
    class: '9-أ',
    parentId: 'par-006',
    dateOfBirth: new Date('2009-11-30'),
    enrollmentDate: new Date('2021-09-01'),
    studentId: 'STD2021006',
    address: 'شارع مصر الجديدة، القاهرة',
    phone: '+20-123-456-7900',
    emergencyContact: {
      name: 'إبراهيم محمد',
      phone: '+20-123-456-7901',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.7,
    attendance: 96,
    createdAt: new Date('2021-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-007',
    firstName: 'عمر',
    lastName: 'سعيد',
    fullName: 'عمر سعيد',
    email: 'omar.saeed@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=14',
    grade: 'الصف الحادي عشر',
    class: '11-أ',
    parentId: 'par-007',
    dateOfBirth: new Date('2007-04-12'),
    enrollmentDate: new Date('2019-09-01'),
    studentId: 'STD2019007',
    address: 'شارع المهندسين، الجيزة',
    phone: '+20-123-456-7902',
    emergencyContact: {
      name: 'سعيد عمر',
      phone: '+20-123-456-7903',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.4,
    attendance: 90,
    createdAt: new Date('2019-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-008',
    firstName: 'سارة',
    lastName: 'أحمد',
    fullName: 'سارة أحمد',
    email: 'sara.ahmed@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=20',
    grade: 'الصف الحادي عشر',
    class: '11-أ',
    parentId: 'par-008',
    dateOfBirth: new Date('2007-08-05'),
    enrollmentDate: new Date('2019-09-01'),
    studentId: 'STD2019008',
    address: 'شارع الدقي، الجيزة',
    phone: '+20-123-456-7904',
    emergencyContact: {
      name: 'أحمد محمود',
      phone: '+20-123-456-7905',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.9,
    attendance: 97,
    createdAt: new Date('2019-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-009',
    firstName: 'كريم',
    lastName: 'محمود',
    fullName: 'كريم محمود',
    email: 'karim.mahmoud@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=15',
    grade: 'الصف الثامن',
    class: '8-أ',
    parentId: 'par-009',
    dateOfBirth: new Date('2010-02-14'),
    enrollmentDate: new Date('2022-09-01'),
    studentId: 'STD2022009',
    address: 'شارع النزهة، القاهرة',
    phone: '+20-123-456-7906',
    emergencyContact: {
      name: 'محمود كريم',
      phone: '+20-123-456-7907',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.3,
    attendance: 88,
    createdAt: new Date('2022-09-01'),
    updatedAt: new Date(),
  },
  {
    id: 'std-010',
    firstName: 'ليلى',
    lastName: 'حسين',
    fullName: 'ليلى حسين',
    email: 'layla.hussein@school.edu',
    avatar: 'https://i.pravatar.cc/150?img=25',
    grade: 'الصف الثامن',
    class: '8-أ',
    parentId: 'par-010',
    dateOfBirth: new Date('2010-06-20'),
    enrollmentDate: new Date('2022-09-01'),
    studentId: 'STD2022010',
    address: 'شارع مدينة نصر، القاهرة',
    phone: '+20-123-456-7908',
    emergencyContact: {
      name: 'حسين علي',
      phone: '+20-123-456-7909',
      relationship: 'والد',
    },
    status: 'active',
    gpa: 3.8,
    attendance: 95,
    createdAt: new Date('2022-09-01'),
    updatedAt: new Date(),
  },
];

// Mock Grades (subjects × students matrix)
const subjects = ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا'];
const categories: GradeCategory[] = ['homework', 'quiz', 'test', 'project', 'participation', 'final'];

export const mockGrades: Grade[] = [];

mockStudents.forEach((student) => {
  subjects.forEach((subject, subjectIndex) => {
    categories.forEach((category, categoryIndex) => {
      const baseScore = 70 + (student.gpa || 3.0) * 7;
      const variance = Math.random() * 15 - 7.5;
      const score = Math.min(100, Math.max(50, baseScore + variance));
      
      mockGrades.push({
        id: `grade-${student.id}-${subjectIndex}-${categoryIndex}`,
        studentId: student.id,
        subject,
        category,
        value: Math.round(score),
        numericValue: Math.round(score),
        maxPoints: 100,
        weight: category === 'final' ? 2 : 1,
        assignmentName: `${subject} - ${getCategoryNameAr(category)}`,
        description: `تقييم ${getCategoryNameAr(category)} في مادة ${subject}`,
        dueDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        submittedDate: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
        gradedDate: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
        teacherId: 'tch-001',
        teacherName: 'أ. محمد السيد',
        comments: score >= 90 ? 'أداء ممتاز، استمر' : score >= 80 ? 'أداء جيد جداً' : score >= 70 ? 'أداء جيد' : 'يحتاج إلى تحسين',
        isLate: Math.random() > 0.9,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });
    });
  });
});

function getCategoryNameAr(category: GradeCategory): string {
  const names: Record<GradeCategory, string> = {
    homework: 'الواجب المنزلي',
    quiz: 'الاختبار القصير',
    test: 'الاختبار',
    project: 'المشروع',
    participation: 'المشاركة',
    final: 'الاختبار النهائي',
  };
  return names[category];
}

// Mock Attendance (monthly records)
export const mockAttendance: Attendance[] = [];

mockStudents.forEach((student) => {
  const attendanceRate = student.attendance || 95;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    let status: AttendanceStatus;
    const rand = Math.random() * 100;
    
    if (rand < attendanceRate) {
      status = AttendanceStatus.PRESENT;
    } else if (rand < attendanceRate + 3) {
      status = AttendanceStatus.LATE;
    } else if (rand < attendanceRate + 5) {
      status = AttendanceStatus.EXCUSED;
    } else {
      status = AttendanceStatus.ABSENT;
    }
    
    mockAttendance.push({
      id: `att-${student.id}-${i}`,
      studentId: student.id,
      date,
      status,
      period: 'الحصة الأولى',
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      teacherId: 'tch-001',
      teacherName: 'أ. محمد السيد',
      notes: status === AttendanceStatus.ABSENT ? 'غياب بدون عذر' : status === AttendanceStatus.EXCUSED ? 'غياب بعذر طبي' : '',
      notifiedParent: status === AttendanceStatus.ABSENT,
      createdAt: date,
      updatedAt: date,
    });
  }
});

// Mock Behavior Records
export const mockBehaviorRecords: Behavior[] = [
  {
    id: 'beh-001',
    studentId: 'std-001',
    type: BehaviorType.POSITIVE,
    title: 'مشاركة فعالة',
    description: 'شارك بفعالية في النقاش الصفي وقدم إجابات ممتازة',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    teacherId: 'tch-001',
    teacherName: 'أ. محمد السيد',
    severity: 'minor',
    actionTaken: 'تشجيع ومكافأة',
    followUpRequired: false,
    notifiedParent: true,
    points: 10,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'beh-002',
    studentId: 'std-003',
    type: BehaviorType.NEGATIVE,
    title: 'تأخر متكرر',
    description: 'تأخر عن الحصة الأولى لثلاث مرات هذا الأسبوع',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    teacherId: 'tch-001',
    teacherName: 'أ. محمد السيد',
    severity: 'moderate',
    actionTaken: 'تحذير شفهي وإبلاغ ولي الأمر',
    followUpRequired: true,
    notifiedParent: true,
    points: -5,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'beh-003',
    studentId: 'std-002',
    type: BehaviorType.POSITIVE,
    title: 'مساعدة الزملاء',
    description: 'ساعدت زملاءها في فهم الدرس وشرحت لهم بطريقة رائعة',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    teacherId: 'tch-002',
    teacherName: 'أ. فاطمة أحمد',
    severity: 'minor',
    actionTaken: 'شكر وتقدير',
    followUpRequired: false,
    notifiedParent: true,
    points: 15,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'beh-004',
    studentId: 'std-004',
    type: BehaviorType.POSITIVE,
    title: 'تفوق أكاديمي',
    description: 'حصلت على الدرجة الكاملة في جميع الاختبارات هذا الشهر',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    teacherId: 'tch-001',
    teacherName: 'أ. محمد السيد',
    severity: 'minor',
    actionTaken: 'شهادة تقدير',
    followUpRequired: false,
    notifiedParent: true,
    points: 20,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'beh-005',
    studentId: 'std-009',
    type: BehaviorType.NEGATIVE,
    title: 'عدم إحضار الواجب',
    description: 'لم يحضر الواجب المنزلي لثلاث مرات متتالية',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    teacherId: 'tch-003',
    teacherName: 'أ. أحمد حسن',
    severity: 'moderate',
    actionTaken: 'إنذار كتابي',
    followUpRequired: true,
    notifiedParent: true,
    points: -10,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: 'beh-006',
    studentId: 'std-005',
    type: BehaviorType.POSITIVE,
    title: 'قيادة فريق',
    description: 'قاد فريق المشروع بنجاح وحقق نتائج ممتازة',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    teacherId: 'tch-002',
    teacherName: 'أ. فاطمة أحمد',
    severity: 'minor',
    actionTaken: 'تكريم في الطابور',
    followUpRequired: false,
    notifiedParent: true,
    points: 15,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

// Mock Messages (between teacher and parent)
export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    senderId: 'tch-001',
    senderName: 'أ. محمد السيد',
    senderRole: UserRole.TEACHER,
    recipientId: 'par-001',
    recipientName: 'محمد أحمد',
    recipientRole: UserRole.PARENT,
    subject: 'تحسن ملحوظ في الأداء',
    body: 'السلام عليكم، أود إبلاغكم بأن ابنكم أحمد أظهر تحسناً ملحوظاً في مادة الرياضيات. استمر في التشجيع والدعم.',
    priority: MessagePriority.NORMAL,
    isRead: true,
    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-002',
    senderId: 'par-003',
    senderName: 'حسن محمود',
    senderRole: UserRole.PARENT,
    recipientId: 'tch-001',
    recipientName: 'أ. محمد السيد',
    recipientRole: UserRole.TEACHER,
    subject: 'استفسار عن الواجبات',
    body: 'السلام عليكم أستاذ، أرجو توضيح الواجبات المطلوبة لهذا الأسبوع لابني محمود.',
    priority: MessagePriority.NORMAL,
    isRead: true,
    readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'msg-003',
    senderId: 'tch-002',
    senderName: 'أ. فاطمة أحمد',
    senderRole: UserRole.TEACHER,
    recipientId: 'par-002',
    recipientName: 'علي حسن',
    recipientRole: UserRole.PARENT,
    subject: 'تهنئة بالتفوق',
    body: 'مبروك! ابنتكم فاطمة حصلت على المركز الأول في الصف. نفتخر بها.',
    priority: MessagePriority.HIGH,
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'msg-004',
    senderId: 'tch-001',
    senderName: 'أ. محمد السيد',
    senderRole: UserRole.TEACHER,
    recipientId: 'par-004',
    recipientName: 'خالد أحمد',
    recipientRole: UserRole.PARENT,
    subject: 'دعوة لاجتماع أولياء الأمور',
    body: 'ندعوكم لحضور اجتماع أولياء الأمور يوم الخميس القادم الساعة 4 مساءً لمناقشة تقدم الطلاب.',
    priority: MessagePriority.HIGH,
    isRead: true,
    readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-005',
    senderId: 'par-009',
    senderName: 'محمود كريم',
    senderRole: UserRole.PARENT,
    recipientId: 'tch-003',
    recipientName: 'أ. أحمد حسن',
    recipientRole: UserRole.TEACHER,
    subject: 'اعتذار عن الغياب',
    body: 'السلام عليكم، أعتذر عن غياب ابني كريم أمس بسبب ظرف صحي طارئ. أرفق التقرير الطبي.',
    priority: MessagePriority.NORMAL,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'par-001',
    type: NotificationType.GRADE,
    title: 'درجة جديدة',
    message: 'تم رفع درجة جديدة لأحمد في مادة الرياضيات: 95/100',
    isRead: false,
    actionUrl: '/grades',
    metadata: { studentId: 'std-001', subject: 'الرياضيات', grade: 95 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'notif-002',
    userId: 'par-002',
    type: NotificationType.BEHAVIOR,
    title: 'سلوك إيجابي',
    message: 'تم تسجيل سلوك إيجابي لفاطمة: مساعدة الزملاء',
    isRead: true,
    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    actionUrl: '/behavior',
    metadata: { studentId: 'std-002', type: 'positive' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'notif-003',
    userId: 'par-003',
    type: NotificationType.ATTENDANCE,
    title: 'تنبيه غياب',
    message: 'محمود غائب اليوم عن الحصة الأولى',
    isRead: false,
    actionUrl: '/attendance',
    metadata: { studentId: 'std-003', status: 'absent' },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'notif-004',
    userId: 'par-004',
    type: NotificationType.MESSAGE,
    title: 'رسالة جديدة',
    message: 'لديك رسالة جديدة من أ. محمد السيد',
    isRead: false,
    actionUrl: '/messages',
    metadata: { messageId: 'msg-004' },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'notif-005',
    userId: 'par-005',
    type: NotificationType.ASSIGNMENT,
    title: 'واجب جديد',
    message: 'تم إضافة واجب جديد في مادة العلوم - موعد التسليم: غداً',
    isRead: true,
    readAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    actionUrl: '/assignments',
    metadata: { subject: 'العلوم', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'notif-006',
    userId: 'par-001',
    type: NotificationType.ANNOUNCEMENT,
    title: 'إعلان مهم',
    message: 'اجتماع أولياء الأمور يوم الخميس الساعة 4 مساءً',
    isRead: false,
    actionUrl: '/announcements',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

// Mock Badges Definitions
export const mockBadges: Badge[] = [
  {
    id: 'badge-001',
    name: 'نجم الرياضيات',
    description: 'حصل على 95% أو أكثر في جميع اختبارات الرياضيات',
    type: BadgeType.ACADEMIC,
    icon: '🌟',
    color: '#FFD700',
    criteria: 'الحصول على 95% أو أكثر في 5 اختبارات متتالية',
    points: 50,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'badge-002',
    name: 'الحضور المثالي',
    description: 'حضور 100% لمدة شهر كامل',
    type: BadgeType.ATTENDANCE,
    icon: '✅',
    color: '#4CAF50',
    criteria: 'حضور جميع الحصص لمدة 30 يوم متتالية',
    points: 30,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'badge-003',
    name: 'السلوك المثالي',
    description: 'سلوك إيجابي متميز',
    type: BadgeType.PARTICIPATION,
    icon: '⭐',
    color: '#2196F3',
    criteria: 'الحصول على 5 تقييمات سلوك إيجابي دون أي سلبيات',
    points: 40,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'badge-004',
    name: 'المتفوق الأول',
    description: 'المركز الأول في الصف',
    type: BadgeType.ACHIEVEMENT,
    icon: '🏆',
    color: '#FF9800',
    criteria: 'الحصول على أعلى معدل في الصف',
    points: 100,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'badge-005',
    name: 'المشارك النشط',
    description: 'مشاركة فعالة في الأنشطة الصفية',
    type: BadgeType.PARTICIPATION,
    icon: '🎯',
    color: '#9C27B0',
    criteria: 'المشاركة في 10 أنشطة صفية أو أكثر',
    points: 25,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'badge-006',
    name: 'التحسن المستمر',
    description: 'تحسن ملحوظ في الأداء الأكاديمي',
    type: BadgeType.IMPROVEMENT,
    icon: '📈',
    color: '#00BCD4',
    criteria: 'تحسن بنسبة 15% أو أكثر في المعدل',
    points: 35,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'badge-007',
    name: 'القائد الملهم',
    description: 'قيادة فريق بنجاح',
    type: BadgeType.LEADERSHIP,
    icon: '👑',
    color: '#E91E63',
    criteria: 'قيادة مشروع جماعي وتحقيق نتائج ممتازة',
    points: 45,
    createdAt: new Date('2023-01-01'),
  },
];

// Mock Student Badges (awarded badges)
export const mockStudentBadges: StudentBadge[] = [
  {
    id: 'stdbadge-001',
    studentId: 'std-004',
    badgeId: 'badge-004',
    badge: mockBadges[3],
    awardedBy: 'tch-001',
    awardedByName: 'أ. محمد السيد',
    awardedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reason: 'حصلت على المركز الأول في الصف بمعدل 4.0',
  },
  {
    id: 'stdbadge-002',
    studentId: 'std-002',
    badgeId: 'badge-002',
    badge: mockBadges[1],
    awardedBy: 'tch-001',
    awardedByName: 'أ. محمد السيد',
    awardedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    reason: 'حضور مثالي لمدة شهر كامل',
  },
  {
    id: 'stdbadge-003',
    studentId: 'std-001',
    badgeId: 'badge-001',
    badge: mockBadges[0],
    awardedBy: 'tch-001',
    awardedByName: 'أ. محمد السيد',
    awardedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    reason: 'تفوق في مادة الرياضيات',
  },
  {
    id: 'stdbadge-004',
    studentId: 'std-002',
    badgeId: 'badge-003',
    badge: mockBadges[2],
    awardedBy: 'tch-002',
    awardedByName: 'أ. فاطمة أحمد',
    awardedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reason: 'سلوك إيجابي متميز ومساعدة الزملاء',
  },
  {
    id: 'stdbadge-005',
    studentId: 'std-005',
    badgeId: 'badge-007',
    badge: mockBadges[6],
    awardedBy: 'tch-002',
    awardedByName: 'أ. فاطمة أحمد',
    awardedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    reason: 'قيادة فريق المشروع بنجاح',
  },
  {
    id: 'stdbadge-006',
    studentId: 'std-008',
    badgeId: 'badge-005',
    badge: mockBadges[4],
    awardedBy: 'tch-001',
    awardedByName: 'أ. محمد السيد',
    awardedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    reason: 'مشاركة نشطة في جميع الأنشطة الصفية',
  },
];

// Mock Ranking (top students)
export interface StudentRanking {
  rank: number;
  studentId: string;
  studentName: string;
  class: string;
  gpa: number;
  totalPoints: number;
  badges: number;
  avatar?: string;
}

export const mockRanking: StudentRanking[] = mockStudents
  .map((student) => {
    const studentBadges = mockStudentBadges.filter(sb => sb.studentId === student.id);
    const totalPoints = studentBadges.reduce((sum, sb) => sum + sb.badge.points, 0);
    
    return {
      studentId: student.id,
      studentName: student.fullName,
      class: student.class,
      gpa: student.gpa || 0,
      totalPoints,
      badges: studentBadges.length,
      avatar: student.avatar,
    };
  })
  .sort((a, b) => {
    if (b.gpa !== a.gpa) return b.gpa - a.gpa;
    return b.totalPoints - a.totalPoints;
  })
  .map((student, index) => ({
    rank: index + 1,
    ...student,
  }));

// Helper function to get student by ID
export function getStudentById(id: string): Student | undefined {
  return mockStudents.find(s => s.id === id);
}

// Helper function to get grades by student ID
export function getGradesByStudentId(studentId: string): Grade[] {
  return mockGrades.filter(g => g.studentId === studentId);
}

// Helper function to get attendance by student ID
export function getAttendanceByStudentId(studentId: string): Attendance[] {
  return mockAttendance.filter(a => a.studentId === studentId);
}

// Helper function to get behavior records by student ID
export function getBehaviorByStudentId(studentId: string): Behavior[] {
  return mockBehaviorRecords.filter(b => b.studentId === studentId);
}

// Helper function to get badges by student ID
export function getBadgesByStudentId(studentId: string): StudentBadge[] {
  return mockStudentBadges.filter(sb => sb.studentId === studentId);
}

// Helper function to get student ranking
export function getStudentRanking(studentId: string): StudentRanking | undefined {
  return mockRanking.find(r => r.studentId === studentId);
}
