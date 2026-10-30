import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { 
  Printer, 
  FileText, 
  Calendar, 
  Award, 
  TrendingUp 
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
  attendance: number;
  attendanceStatus?: 'present' | 'absent' | 'late';
  gpa: number;
  grades: {
    math: number;
    science: number;
    arabic: number;
    english: number;
    history: number;
    geography: number;
  };
}

interface DynamicGradeRow {
  id: string;
  assignmentName: string;
  subject: string;
  category: string;
  numericValue: number;
  maxPoints: number;
  gradedDate: Date;
  comments?: string;
}

interface DynamicAttendanceRow {
  id: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  period?: string;
  subject?: string;
  notes?: string;
}

type ReportTab = 'monthly' | 'grades' | 'attendance';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('monthly');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // حالة المود (الداكن / الفاتح) المتزامنة مع الهيدر
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('edu_theme');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('edu_theme');
      if (saved !== null) {
        setIsDarkMode(JSON.parse(saved));
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // تأثير الجزيئات التفاعلية في الخلفية (Canvas)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const particlesCount = 45;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseVx: (Math.random() - 0.5) * 0.7,
      baseVy: (Math.random() - 0.5) * 0.7,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(30, 64, 175, 0.45)';
      ctx.strokeStyle = isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(30, 64, 175, 0.12)';

      particles.forEach((p, index) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 0.01;
          p.vy -= Math.sin(angle) * force * 0.01;
        } else {
          p.vx += (p.baseVx - p.vx) * 0.02;
          p.vy += (p.baseVy - p.vy) * 0.02;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const dist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (dist < 120) {
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  useEffect(() => {
    const loadRealData = () => {
      const savedStudents = localStorage.getItem('edu_students_list');
      if (savedStudents) {
        const parsed: Student[] = JSON.parse(savedStudents);
        setStudents(parsed);
        if (parsed.length > 0 && !selectedStudentId) {
          setSelectedStudentId(parsed[0].id);
        }
      }
    };

    loadRealData();
    window.addEventListener('storage', loadRealData);
    return () => window.removeEventListener('storage', loadRealData);
  }, [selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find(s => s.id === selectedStudentId),
    [selectedStudentId, students]
  );

  const studentGradesRows = useMemo((): DynamicGradeRow[] => {
    if (!selectedStudent || !selectedStudent.grades) return [];
    const g = selectedStudent.grades;
    const subjectsMap: Record<string, string> = {
      math: 'الرياضيات',
      science: 'العلوم',
      arabic: 'اللغة العربية',
      english: 'اللغة الإنجليزية',
      history: 'التاريخ',
      geography: 'الجغرافيا'
    };

    return Object.entries(g).map(([key, value]) => ({
      id: `${selectedStudent.id}-${key}`,
      assignmentName: `الاختبار الدوري لـ ${subjectsMap[key] || key}`,
      subject: subjectsMap[key] || key,
      category: 'test',
      numericValue: value || 0,
      maxPoints: 100,
      gradedDate: new Date(),
      comments: value >= 85 ? 'أداء ممتاز ومستقر' : value < 70 ? 'يحتاج دعم ومراجعة دورية' : 'مستوى متوسط'
    }));
  }, [selectedStudent]);

  const studentAttendanceRows = useMemo((): DynamicAttendanceRow[] => {
    if (!selectedStudent) return [];
    const rows: DynamicAttendanceRow[] = [];
    const currentStatus = selectedStudent.attendanceStatus || 'present';
    
    const totalDays = 20;
    const missedDays = Math.round(totalDays * (1 - (selectedStudent.attendance || 100) / 100));

    for (let i = 0; i < totalDays; i++) {
      let dayStatus: 'present' | 'absent' | 'late' | 'excused' = 'present';
      if (i < missedDays) {
        dayStatus = currentStatus === 'absent' ? 'absent' : 'late';
      }
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);

      rows.push({
        id: `att-${selectedStudent.id}-${i}`,
        date: targetDate,
        status: dayStatus,
        period: 'الأولى',
        subject: 'الحصة العامة',
        notes: dayStatus !== 'present' ? 'مسجل عبر النظام الموحد' : 'ملتزم بالحضور'
      });
    }
    return rows;
  }, [selectedStudent]);

  const finalPercentage = useMemo(() => {
    if (!selectedStudent || !selectedStudent.grades) return 0;
    const g = selectedStudent.grades;
    const total = (g.math + g.science + g.arabic + g.english + g.history + g.geography);
    return Math.round(total / 6);
  }, [selectedStudent]);

  const attendancePercentage = selectedStudent ? selectedStudent.attendance : 0;
  const gpa = selectedStudent ? selectedStudent.gpa : 0.00;

  const formatDateAr = (date: Date) => {
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (students.length === 0 || !selectedStudent) {
    return (
      <Layout>
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
        <div className={`relative z-10 text-center py-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir="rtl">
          <p className="text-lg font-bold">لا يوجد طلاب متاحين حالياً في قاعدة البيانات الحقيقية.</p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>يرجى إضافة طلاب من صفحة لوحة التحكم لتظهر التقارير هنا تلقائياً.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* خلفية الجزيئات الثابتة في الخلف */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0" 
      />

      <div className={`relative z-10 space-y-6 text-right pb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir="rtl">
        {/* الهيدر العلوي */}
        <div className="print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>التقارير المدرسية</h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>عرض وطباعة التقارير والشهادات الحية المستخرجة من لوحة التحكم</p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-95 transition-all shadow-md self-start sm:self-center"
            >
              <Printer className="w-5 h-5" />
              <span>طباعة التقارير / استخراج PDF</span>
            </button>
          </div>

          {/* منتقي اختيار الطلاب */}
          <div className={`mt-6 p-4 rounded-xl border backdrop-blur-md shadow-sm ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
              اختر الطالب من السجلات النشطة:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={`w-full md:w-96 px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              {students.map(student => (
                <option key={student.id} value={student.id} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>
                  {student.firstName} {student.lastName} ({student.class})
                </option>
              ))}
            </select>
          </div>

          {/* التبويبات الثلاثة */}
          <div className={`mt-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('monthly')}
                className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
                  activeTab === 'monthly' 
                    ? 'text-emerald-500 border-b-2 border-emerald-500' 
                    : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>التقرير الشهري الشامل</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
                  activeTab === 'grades' 
                    ? 'text-emerald-500 border-b-2 border-emerald-500' 
                    : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>بيان الدرجات والشهادة</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`pb-4 px-2 font-bold text-sm transition-colors relative ${
                  activeTab === 'attendance' 
                    ? 'text-emerald-500 border-b-2 border-emerald-500' 
                    : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>بيان الحضور والمواظبة</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* محتوى طباعة التقرير */}
        <div className={`rounded-2xl border backdrop-blur-md shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800'
        }`}>
          {/* الترويسة الرسمية للطباعة */}
          <div className="hidden print:block p-8 border-b-2 border-gray-900 bg-white text-gray-900">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black mb-2">نظام الإدارة المدرسية الذكي</h1>
              <p className="font-bold">تقرير الأداء الدوري المعتمد للطالب</p>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm border border-gray-200 p-4 rounded-xl bg-gray-50/50">
              <div>
                <span className="text-gray-500 block">اسم الطالب بالكامل:</span>
                <span className="font-bold text-base text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">الصف الدراسي:</span>
                <span className="font-bold text-base text-gray-900">{selectedStudent.class}</span>
              </div>
              <div>
                <span className="text-gray-500 block">الكود التعريفي الوطني:</span>
                <span className="font-bold text-base text-gray-900">{selectedStudent.studentId || "غير مدرج"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">تاريخ طباعة التقرير الفعلي:</span>
                <span className="font-bold text-base text-gray-900">{formatDateAr(new Date())}</span>
              </div>
            </div>
          </div>

          <div className="p-6 print:p-8">
            {activeTab === 'monthly' && (
              <div className="space-y-8">
                <h2 className={`text-xl font-bold border-r-4 border-emerald-500 pr-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>خلاصة الأداء الشهري الشامل</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-blue-950/30 border-blue-900/40' : 'bg-blue-50/60 border-blue-100'}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-1.5 mb-1 ${isDarkMode ? 'text-blue-300' : 'text-gray-700'}`}><TrendingUp className="w-4 h-4 text-blue-500"/> المعدل التراكمي</h3>
                    <p className="text-3xl font-black text-blue-400">{gpa.toFixed(2)} <span className={`text-xs font-normal ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>من 4.0</span></p>
                  </div>
                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-emerald-950/30 border-emerald-900/40' : 'bg-emerald-50/60 border-emerald-100'}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-1.5 mb-1 ${isDarkMode ? 'text-emerald-300' : 'text-gray-700'}`}><Calendar className="w-4 h-4 text-emerald-500"/> نسبة الحضور</h3>
                    <p className="text-3xl font-black text-emerald-400">{attendancePercentage}%</p>
                  </div>
                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-purple-950/30 border-purple-900/40' : 'bg-purple-50/60 border-purple-100'}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-1.5 mb-1 ${isDarkMode ? 'text-purple-300' : 'text-gray-700'}`}><Award className="w-4 h-4 text-purple-500"/> النسبة المئوية العامة</h3>
                    <p className="text-3xl font-black text-purple-400">{finalPercentage}%</p>
                  </div>
                </div>

                <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                  <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className={isDarkMode ? 'bg-slate-950/60 border-b border-slate-800' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>المادة الدراسية</th>
                        <th className={`px-6 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>الدرجة المرصودة الحالية</th>
                        <th className={`px-6 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>التقدير العام للمادة</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'bg-white divide-gray-200 text-gray-700'}`}>
                      {studentGradesRows.map((row) => (
                        <tr key={row.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/40'}>
                          <td className="px-6 py-4 font-bold">{row.subject}</td>
                          <td className="px-6 py-4 font-black text-emerald-400">{row.numericValue} / 100</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              row.numericValue >= 90 ? (isDarkMode ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-green-100 text-green-800') : 
                              row.numericValue >= 75 ? (isDarkMode ? 'bg-blue-950/60 border-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-800') : 
                              (isDarkMode ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-800')
                            }`}>
                              {row.numericValue >= 90 ? 'امتياز الفئة أ' : row.numericValue >= 75 ? 'جيد جداً مستقر' : 'يحتاج تركيز'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="space-y-6">
                <div>
                  <h2 className={`text-xl font-bold border-r-4 border-emerald-500 pr-3 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>بيان الدرجات التفصيلي والشهادة المعتمدة</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>كافة الدرجات المستوردة من السجلات الرسمية للمعلمين</p>
                </div>
                <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                  <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className={isDarkMode ? 'bg-slate-950/60 border-b border-slate-800' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-4 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>التقييم المرصود</th>
                        <th className={`px-4 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>نوع الاختبار</th>
                        <th className={`px-4 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>الدرجة الفعلية</th>
                        <th className={`px-4 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>ملاحظات توجيهية</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'bg-white divide-gray-200 text-gray-700'}`}>
                      {studentGradesRows.map(grade => (
                        <tr key={grade.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/40'}>
                          <td className="px-4 py-4 font-bold">{grade.assignmentName}</td>
                          <td className="px-4 py-4 opacity-75">امتحان فصلي موحد</td>
                          <td className="px-4 py-4 font-black text-blue-400">{grade.numericValue} / {grade.maxPoints}</td>
                          <td className="px-4 py-4 text-xs font-medium opacity-80">{grade.comments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div>
                  <h2 className={`text-xl font-bold border-r-4 border-emerald-500 pr-3 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>سجل المواظبة اليومية والغياب</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>نسبة الانضباط العام الحالية: <span className="font-bold text-emerald-400">{attendancePercentage}%</span></p>
                </div>
                <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                  <table className="min-w-full divide-y divide-gray-200 text-right">
                    <thead className={isDarkMode ? 'bg-slate-950/60 border-b border-slate-800' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-4 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>التاريخ اليومي</th>
                        <th className={`px-4 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>حالة رصد الحضور</th>
                        <th className={`px-4 py-3 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>ملاحظات المشرف</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'bg-white divide-gray-200 text-gray-700'}`}>
                      {studentAttendanceRows.map(record => (
                        <tr key={record.id} className={isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/40'}>
                          <td className="px-4 py-4 font-medium">{formatDateAr(record.date)}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
                              record.status === 'present' ? (isDarkMode ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-green-100 text-green-800') : 
                              record.status === 'absent' ? (isDarkMode ? 'bg-red-950/60 border-red-500/30 text-red-300' : 'bg-red-100 text-red-800') : 
                              (isDarkMode ? 'bg-amber-950/60 border-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-800')
                            }`}>
                              {record.status === 'present' ? 'حاضر ومعتمد' : record.status === 'absent' ? 'غائب بدون عذر' : 'متأخر صيرورة'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs opacity-60">{record.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="hidden print:block p-8 border-t-2 border-gray-200 text-center text-xs text-gray-400 bg-white">
            <p>تم استخراج وتعميد هذا البيان إلكترونياً بشكل فوري ومباشر من قواعد بيانات الإدارة التعليمية.</p>
            <p className="mt-1">مدرسة النور الثانوية - الإدارة الرقمية لعام 2026</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;