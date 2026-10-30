import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { Printer, SlidersHorizontal, TrendingUp, TrendingDown, Pencil, X, Save, User, FileSpreadsheet } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
  email: string;
  attendance: number;
  gpa: number;
  grades?: {
    math: number;
    science: number;
    arabic: number;
    english: number;
    history: number;
    geography: number;
  };
}

const Grades: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // التحقق من دور المستخدم الحالي (معلم أم طالب)
  const [userRole, setUserRole] = useState<string>('teacher');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('current_user') || localStorage.getItem('edu_current_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.role) {
          setUserRole(userObj.role);
        }
        if (userObj && userObj.email) {
          setCurrentUserEmail(userObj.email);
        }
      }
    } catch (e) {
      console.error("Error reading role", e);
    }
  }, []);

  // حقول تعديل الدرجات داخل المودال
  const [math, setMath] = useState(0);
  const [science, setScience] = useState(0);
  const [arabic, setArabic] = useState(0);
  const [english, setEnglish] = useState(0);
  const [history, setHistory] = useState(0);
  const [geography, setGeography] = useState(0);

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

  // تأثير الجزيئات العادية والخطوط الملساء في الخلفية (Canvas)
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

  // جلب قائمة الطلاب
  useEffect(() => {
    const fetchStudents = () => {
      const savedStudents = localStorage.getItem('edu_students_list');
      if (savedStudents) {
        const parsed: Student[] = JSON.parse(savedStudents);
        const updatedWithGrades = parsed.map(student => ({
          ...student,
          grades: student.grades || { math: 85, science: 90, arabic: 88, english: 92, history: 86, geography: 89 }
        }));
        setStudents(updatedWithGrades);
      } else {
        setStudents([]);
      }
    };

    fetchStudents();
    const interval = setInterval(fetchStudents, 500);
    return () => clearInterval(interval);
  }, []);

  const saveToStorage = (updatedList: Student[]) => {
    setStudents(updatedList);
    localStorage.setItem('edu_students_list', JSON.stringify(updatedList));
  };

  const openEditModal = (student: Student) => {
    setCurrentStudent(student);
    setMath(student.grades?.math || 0);
    setScience(student.grades?.science || 0);
    setArabic(student.grades?.arabic || 0);
    setEnglish(student.grades?.english || 0);
    setHistory(student.grades?.history || 0);
    setGeography(student.grades?.geography || 0);
    setIsEditModalOpen(true);
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const total = Number(math) + Number(science) + Number(arabic) + Number(english) + Number(history) + Number(geography);
    const calculatedAverage = total / 6;

    const updatedStudents = students.map((s) => {
      if (s.id === currentStudent.id) {
        return {
          ...s,
          gpa: calculatedAverage,
          grades: {
            math: Number(math),
            science: Number(science),
            arabic: Number(arabic),
            english: Number(english),
            history: Number(history),
            geography: Number(geography)
          }
        };
      }
      return s;
    });

    saveToStorage(updatedStudents);
    setIsEditModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // تصفية الطلاب حسب الدور (لو طالب يرى نفسه فقط، لو معلم يرى حسب الفلتر أو الكل)
  const filteredStudents = useMemo(() => {
    const isStudentRole = userRole === 'student' || userRole === 'STUDENT';
    if (isStudentRole) {
      // البحث عن الطالب المسجل حالياً بالبريد أو جلب أول طالب افتراضياً لو مش مطابق
      const myRecord = students.find(s => s.email && s.email.toLowerCase() === currentUserEmail.toLowerCase());
      return myRecord ? [myRecord] : (students.length > 0 ? [students[0]] : []);
    }
    if (selectedStudentFilter === 'all') return students;
    return students.filter(s => s.id === selectedStudentFilter);
  }, [students, selectedStudentFilter, userRole, currentUserEmail]);

  const isStudent = userRole === 'student' || userRole === 'STUDENT';

  return (
    <Layout>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 space-y-6 text-right pb-10" dir="rtl">
        {/* الهيدر العلوي وأزرار التحكم */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 no-print ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isStudent ? 'درجاتي الشخصية الفصلية' : 'رصد وإدارة الدرجات'}
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {isStudent ? 'مراجعة درجاتك ومستواك الأكاديمي في كافة المواد الدراسية المعتمدة' : 'تابع درجات الطلاب في مختلف المواد وقم بتعديلها وإصدار التقارير'}
            </p>
          </div>
          <button onClick={handlePrint} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/20">
            <Printer className="w-5 h-5" />
            <span>طباعة التقرير</span>
          </button>
        </div>

        {/* أدوات التصفية تظهر فقط للمعلم */}
        {!isStudent && (
          <div className="flex flex-col md:flex-row gap-4 items-center justify-start no-print">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-sm w-full md:w-80 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800'
            }`}>
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span className={`text-sm font-bold whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>تصفية حسب الطالب:</span>
              <select value={selectedStudentFilter} onChange={(e) => setSelectedStudentFilter(e.target.value)} className="w-full bg-transparent text-sm focus:outline-none cursor-pointer font-medium">
                <option value="all" className={isDarkMode ? 'bg-slate-900 text-white' : ''}>جميع الطلاب</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>{student.firstName} {student.lastName}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* جدول الدرجات الشامل أو الشخصي */}
        <div className={`rounded-2xl border backdrop-blur-md shadow-xl overflow-hidden print-table ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-md'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'
                }`}>
                  <th className="p-4">الطالب</th>
                  <th className="p-4">الصف</th>
                  <th className="p-4 text-center">الرياضيات</th>
                  <th className="p-4 text-center">العلوم</th>
                  <th className="p-4 text-center">اللغة العربية</th>
                  <th className="p-4 text-center">اللغة الإنجليزية</th>
                  <th className="p-4 text-center">التاريخ</th>
                  <th className="p-4 text-center">الجغرافيا</th>
                  <th className="p-4 text-center">المعدل</th>
                  {!isStudent && <th className="p-4 text-center no-print">إجراء</th>}
                </tr>
              </thead>
              <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'divide-gray-50 text-gray-700'}`}>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={isStudent ? 9 : 10} className="p-8 text-center text-gray-400 font-medium">لا توجد بيانات درجات متاحة حالياً.</td></tr>
                ) : (
                  filteredStudents.map((student) => {
                    const avg = student.gpa || 88;
                    const isHighGrade = avg >= 70;

                    return (
                      <tr key={student.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/50'}`}>
                        <td className="p-4 font-semibold">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                              isDarkMode ? 'bg-blue-950/60 border-blue-500/30 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'
                            }`}>
                              {student.firstName ? student.firstName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col">
                              <span>{student.firstName} {student.lastName}</span>
                              <span className="text-xs opacity-60 font-mono mt-0.5">{student.studentId || 'STD-001'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            isDarkMode ? 'bg-blue-950/40 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'
                          }`}>{student.class || 'الصف الثاني الثانوي'}</span>
                        </td>
                        <td className={`p-4 text-center font-bold ${isDarkMode ? 'bg-slate-950/30 text-blue-400' : 'bg-gray-50/30 text-blue-600'}`}>{student.grades?.math || 85}</td>
                        <td className="p-4 text-center font-bold text-emerald-500">{student.grades?.science || 90}</td>
                        <td className={`p-4 text-center font-bold ${isDarkMode ? 'bg-slate-950/30 text-purple-400' : 'bg-gray-50/30 text-purple-600'}`}>{student.grades?.arabic || 88}</td>
                        <td className="p-4 text-center font-bold text-indigo-400">{student.grades?.english || 92}</td>
                        <td className={`p-4 text-center font-bold ${isDarkMode ? 'bg-slate-950/30 text-amber-400' : 'bg-gray-50/30 text-amber-600'}`}>{student.grades?.history || 86}</td>
                        <td className="p-4 text-center font-bold text-teal-400">{student.grades?.geography || 89}</td>
                        
                        <td className="p-4">
                          <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs ${
                            isHighGrade 
                              ? (isDarkMode ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 text-emerald-600') 
                              : (isDarkMode ? 'bg-red-950/50 border border-red-500/30 text-red-300' : 'bg-red-50 text-red-600')
                          }`}>
                            {isHighGrade ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{avg.toFixed(0)}%</span>
                          </div>
                        </td>

                        {!isStudent && (
                          <td className="p-4 text-center no-print">
                            <button onClick={() => openEditModal(student)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-blue-950/50' : 'text-blue-600 hover:bg-blue-50'}`} title="تعديل درجات الطالب">
                              <Pencil className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* مودال تعديل الدرجات (خاص بالمعلم فقط) */}
        {!isStudent && isEditModalOpen && currentStudent && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
            <div className={`rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                <div>
                  <h3 className="text-lg font-bold">رصد درجات الطالب</h3>
                  <p className="text-xs opacity-70 mt-0.5">الطالب: {currentStudent.firstName} {currentStudent.lastName}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="opacity-70 hover:opacity-100"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveGrades} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">الرياضيات</label>
                    <input type="number" min="0" max="100" required value={math} onChange={(e) => setMath(Number(e.target.value))} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">العلوم</label>
                    <input type="number" min="0" max="100" required value={science} onChange={(e) => setScience(Number(e.target.value))} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">اللغة العربية</label>
                    <input type="number" min="0" max="100" required value={arabic} onChange={(e) => setArabic(Number(e.target.value))} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">اللغة الإنجليزية</label>
                    <input type="number" min="0" max="100" required value={english} onChange={(e) => setEnglish(Number(e.target.value))} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">التاريخ</label>
                    <input type="number" min="0" max="100" required value={history} onChange={(e) => setHistory(Number(e.target.value))} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">الجغرافيا</label>
                    <input type="number" min="0" max="100" required value={geography} onChange={(e) => setGeography(Number(e.target.value))} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                </div>

                <div className={`pt-4 flex gap-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md transition-all">
                    <Save className="w-4 h-4" />
                    <span>حفظ ورصد الدرجات</span>
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className={`flex-1 font-semibold py-2.5 rounded-xl text-sm transition-all ${
                    isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Grades;