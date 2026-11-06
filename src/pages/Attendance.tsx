import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { Search, SlidersHorizontal, CheckCircle, XCircle, Clock, Calendar as CalendarIcon, FileBarChart, ChevronLeft, ChevronRight, Save, CalendarRange, BarChart3, X, User } from 'lucide-react';

interface StudentAttendance {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
  email?: string;
  attendanceStatus: 'present' | 'absent' | 'late';
  attendanceRate: number;
}

const ALL_MONTHS = [
  'يناير 2026', 'فبراير 2026', 'مارس 2026', 'أبريل 2026', 'مايو 2026', 'يونيو 2026',
  'يوليو 2026', 'أغسطس 2026', 'سبتمبر 2026', 'أكتوبر 2026', 'نوفمبر 2026', 'ديسمبر 2026'
];

const Attendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [monthIndex, setMonthIndex] = useState(5); 

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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

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
          p.vx += (p.baseVx - p.vx) * 0.04;
          p.vy += (p.baseVy - p.vy) * 0.04;
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

  // تحميل الطلاب ومزامنتهم مباشرة من edu_students_list
  useEffect(() => {
    const loadStudents = () => {
      const savedStudents = localStorage.getItem('edu_students_list');
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          const mapped = parsed.map((student: any) => ({
            id: student.id || 'std-1',
            firstName: student.firstName || 'طالب',
            lastName: student.lastName || '',
            class: student.class || 'الصف الثاني الثانوي',
            studentId: student.studentId || 'STD-001',
            email: student.email || '',
            attendanceStatus: student.attendanceStatus || 'present',
            attendanceRate: Number(student.attendance) || 90
          }));
          setStudents(mapped);
        } catch (err) {
          console.error("Error reading students in attendance", err);
        }
      }
    };
    loadStudents();
  }, []);

  const handleNextMonth = () => {
    if (monthIndex < ALL_MONTHS.length - 1) setMonthIndex(prev => prev + 1);
  };

  const handlePrevMonth = () => {
    if (monthIndex > 0) setMonthIndex(prev => prev - 1);
  };

  const isRestrictedRole = userRole === 'student' || userRole === 'STUDENT' || userRole === 'parent' || userRole === 'PARENT';

  // تحديث حالة الحضور وحفظها فورا في الـ localStorage عشان ماتتضيعش لو خرجت من الصفحة
  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (isRestrictedRole) return;
    
    const updatedStudents = students.map((student) => {
      if (student.id === studentId) {
        let newRate = student.attendanceRate;
        if (status === 'present') newRate = Math.min(100, newRate + 2);
        if (status === 'late') newRate = Math.min(100, newRate + 1);
        if (status === 'absent') newRate = Math.max(0, newRate - 5);
        return { ...student, attendanceStatus: status, attendanceRate: Number(newRate.toFixed(1)) };
      }
      return student;
    });

    setStudents(updatedStudents);

    // الحفظ التلقائي الفوري في قاعدة التخزين المحلية
    const savedOriginal = localStorage.getItem('edu_students_list');
    if (savedOriginal) {
      try {
        const parsedOriginal = JSON.parse(savedOriginal);
        const newOriginal = parsedOriginal.map((orig: any) => {
          const match = updatedStudents.find((s) => s.id === orig.id);
          if (match) {
            return { ...orig, attendanceStatus: match.attendanceStatus, attendance: match.attendanceRate };
          }
          return orig;
        });
        localStorage.setItem('edu_students_list', JSON.stringify(newOriginal));
      } catch (e) {
        console.error("Error auto-saving attendance", e);
      }
    }
  };

  const handleSaveAttendance = () => {
    const savedOriginal = localStorage.getItem('edu_students_list');
    if (savedOriginal) {
      try {
        const parsedOriginal = JSON.parse(savedOriginal);
        const newOriginal = parsedOriginal.map((orig: any) => {
          const match = students.find((s) => s.id === orig.id);
          if (match) {
            return { ...orig, attendanceStatus: match.attendanceStatus, attendance: match.attendanceRate };
          }
          return orig;
        });
        localStorage.setItem('edu_students_list', JSON.stringify(newOriginal));
        alert('تم حفظ سجل الحضور بنجاح ومزامنة لوحة التحكم!');
      } catch (e) {
        console.error("Error saving attendance", e);
      }
    }
  };

  const uniqueClasses = useMemo(() => Array.from(new Set(students.map((s) => s.class))), [students]);

  const filteredStudents = useMemo(() => {
    if (isRestrictedRole) {
      const myRecord = students.find(s => s.email && s.email.toLowerCase() === currentUserEmail.toLowerCase());
      return myRecord ? [myRecord] : (students.length > 0 ? [students[0]] : []);
    }
    return students.filter((s) => {
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || (s.studentId && s.studentId.includes(searchTerm));
      const matchesClass = selectedClass === 'all' || s.class === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass, isRestrictedRole, currentUserEmail]);

  const averageTotalAttendance = useMemo(() => {
    if (students.length === 0) return '0.0';
    const total = students.reduce((sum, s) => sum + (s.attendanceRate || 0), 0);
    return (total / students.length).toFixed(1);
  }, [students]);

  return (
    <Layout>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 space-y-6 text-right pb-10 px-2 sm:px-0" dir="rtl">
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isRestrictedRole ? 'سجل الحضور والمواظبة' : 'تسجيل حضور الطلاب'}
            </h1>
            <p className={`text-xs md:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {isRestrictedRole ? 'متابعة سجل الحضور اليومي ونسبة التزام الطالب بالمواظبة المدرسية' : 'إدارة الحضور والغياب اليومي ومتابعة التقارير الشهرية'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setIsCalendarOpen(true)} className={`flex items-center gap-1.5 border font-bold py-2 px-3 md:px-4 rounded-xl text-xs transition-all shadow-sm ${
              isDarkMode ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
              <CalendarRange className="w-4 h-4 text-blue-400 shrink-0" />
              <span>عرض التقويم</span>
            </button>
            <button onClick={() => setIsStatsOpen(true)} className={`flex items-center gap-1.5 border font-bold py-2 px-3 md:px-4 rounded-xl text-xs transition-all shadow-sm ${
              isDarkMode ? 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
              <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isRestrictedRole ? 'إحصائيات التزام الطالب' : 'الإحصائيات'}</span>
            </button>
          </div>
        </div>

        <div className={`flex border-b overflow-x-auto ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
          <button onClick={() => setActiveTab('daily')} className={`flex items-center gap-2 py-3 px-4 md:px-6 font-semibold text-xs md:text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'daily' 
              ? 'border-blue-600 text-blue-500' 
              : (isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-gray-500 hover:text-gray-700')
          }`}>
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span>{isRestrictedRole ? 'سجل الحضور اليومي' : 'التسجيل اليومي'}</span>
          </button>
          <button onClick={() => setActiveTab('monthly')} className={`flex items-center gap-2 py-3 px-4 md:px-6 font-semibold text-xs md:text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'monthly' 
              ? 'border-blue-600 text-blue-500' 
              : (isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-gray-500 hover:text-gray-700')
          }`}>
            <FileBarChart className="w-4 h-4 shrink-0" />
            <span>التقرير الشهري</span>
          </button>
        </div>

        {!isRestrictedRole && (
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className={`p-3 rounded-xl border flex items-center gap-3 w-full md:max-w-md backdrop-blur-md shadow-sm ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800'
            }`}>
              <Search className="text-gray-400 w-5 h-5 shrink-0" />
              <input type="text" placeholder="البحث عن طالب أو الرقم التعريفي..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border-none focus:outline-none text-xs md:text-sm placeholder:text-gray-400" />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {activeTab === 'monthly' && (
                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border backdrop-blur-md shadow-sm text-xs md:text-sm font-bold select-none ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-700'
                }`}>
                  <button onClick={handlePrevMonth} disabled={monthIndex === 0} className="p-1 hover:bg-gray-500/10 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                  <span className="min-w-[70px] text-center text-blue-400">{ALL_MONTHS[monthIndex]}</span>
                  <button onClick={handleNextMonth} disabled={monthIndex === ALL_MONTHS.length - 1} className="p-1 hover:bg-gray-500/10 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                </div>
              )}

              {activeTab === 'daily' && (
                <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className={`px-3 py-2 rounded-xl border backdrop-blur-md shadow-sm text-xs md:text-sm font-semibold focus:outline-none ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-700'
                }`} />
              )}
              
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md shadow-sm ${
                isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-700'
              }`}>
                <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-transparent text-xs md:text-sm focus:outline-none cursor-pointer font-semibold">
                  <option value="all" className={isDarkMode ? 'bg-slate-900 text-white' : ''}>جميع الصفوف</option>
                  {uniqueClasses.map((c, i) => <option key={i} value={c} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* عرض الحضور بنظام الكروت المتجاوبة لتناسب التابلت والموبايل تماماً */}
        {activeTab === 'daily' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.length === 0 ? (
                <div className={`col-span-full p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                  لا يوجد بيانات حضور متاحة حالياً. تأكد من إضافة طلاب من صفحة إدارة الطلاب.
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col justify-between gap-4 transition-all ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isDarkMode ? 'bg-blue-950/60 border-blue-500/30 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'
                        }`}>
                          {student.firstName ? student.firstName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm truncate">{student.firstName} {student.lastName}</h3>
                          <span className="text-[11px] opacity-60 font-mono">{student.studentId || 'STD-001'}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap ${
                        isDarkMode ? 'bg-blue-950/40 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>{student.class || 'الصف الثاني الثانوي'}</span>
                    </div>

                    <div className={`pt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                      <span className="text-xs font-semibold opacity-70">الحالة اليومية:</span>
                      {isRestrictedRole ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          student.attendanceStatus === 'present' ? (isDarkMode ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-emerald-50 border-emerald-500 text-emerald-600') :
                          student.attendanceStatus === 'late' ? (isDarkMode ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'bg-amber-50 border-amber-500 text-amber-600') :
                          (isDarkMode ? 'bg-red-950/60 border-red-500 text-red-300' : 'bg-red-50 border-red-500 text-red-600')
                        }`}>
                          {student.attendanceStatus === 'present' ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : student.attendanceStatus === 'late' ? <Clock className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                          <span>{student.attendanceStatus === 'present' ? 'حاضر ومعتمد' : student.attendanceStatus === 'late' ? 'متأخر' : 'غائب'}</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleStatusChange(student.id, 'present')} className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                            student.attendanceStatus === 'present' 
                              ? (isDarkMode ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm' : 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm') 
                              : (isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                          }`} title="حاضر"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleStatusChange(student.id, 'late')} className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                            student.attendanceStatus === 'late' 
                              ? (isDarkMode ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm' : 'bg-amber-50 border-amber-500 text-amber-600 shadow-sm') 
                              : (isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                          }`} title="متأخر"><Clock className="w-4 h-4" /></button>
                          <button onClick={() => handleStatusChange(student.id, 'absent')} className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                            student.attendanceStatus === 'absent' 
                              ? (isDarkMode ? 'bg-red-950/80 border-red-500 text-red-300 shadow-sm' : 'bg-red-50 border-red-500 text-red-600 shadow-sm') 
                              : (isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                          }`} title="غائب"><XCircle className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {!isRestrictedRole && filteredStudents.length > 0 && (
              <div className="flex justify-end pt-2">
                <button onClick={handleSaveAttendance} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 md:py-3 px-5 md:px-6 rounded-xl transition-all shadow-md text-xs md:text-sm"><Save className="w-4 h-4 md:w-5 md:h-5 shrink-0" /><span>حفظ سجل الحضور النهائي</span></button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length === 0 ? (
              <div className={`col-span-full p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                لا يوجد بيانات لعرضها.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const totalDays = 22;
                const presentDays = Math.round(((student.attendanceRate || 0) / 100) * totalDays);
                const absentDays = totalDays - presentDays;
                return (
                  <div key={student.id} className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col justify-between gap-4 transition-all ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isDarkMode ? 'bg-blue-950/60 border-blue-500/30 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'
                        }`}>
                          {student.firstName ? student.firstName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm truncate">{student.firstName} {student.lastName}</h3>
                          <span className="text-[11px] opacity-60 font-mono">{student.studentId || 'STD-001'}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap ${
                        isDarkMode ? 'bg-blue-950/40 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>{student.class || 'الصف الثاني الثانوي'}</span>
                    </div>

                    <div className={`pt-3 border-t space-y-2 text-xs ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-gray-100 text-gray-600'}`}>
                      <div className="flex justify-between items-center">
                        <span>إجمالي أيام الحضور:</span>
                        <span className="text-emerald-500 font-bold">{presentDays} يوم</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>أيام الغياب:</span>
                        <span className="text-red-400 font-bold">{absentDays} يوم</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-500/20">
                        <span className="font-semibold">نسبة الالتزام ({ALL_MONTHS[monthIndex]}):</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-500/10 border-blue-500/30 text-blue-400">{student.attendanceRate || 0}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {isCalendarOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className={`rounded-2xl w-full max-w-md shadow-2xl p-6 relative border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <button onClick={() => setIsCalendarOpen(false)} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"><X className="w-5 h-5" /></button>
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4"><CalendarRange className="w-5 h-5 text-blue-400 shrink-0" /><span>تقويم الحضور الدراسي</span></h3>
              <div className={`p-4 rounded-xl text-xs md:text-sm space-y-2 border ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-blue-50/50 border-blue-100 text-gray-700'
              }`}>
                <p>🗓️ التاريخ الحالي المختار: <strong className="text-blue-400">{currentDate}</strong></p>
                <p>👥 عدد الطلاب المسجلين: <strong>{students.length} طالب</strong></p>
                <div className={`pt-2 border-t text-[11px] ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-blue-100 text-gray-500'}`}>هذه النافذة تعرض التقويم السنوي المربوط بجدول الحصص والأنشطة لعام 2026.</div>
              </div>
            </div>
          </div>
        )}

        {isStatsOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className={`rounded-2xl w-full max-w-md shadow-2xl p-6 relative border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <button onClick={() => setIsStatsOpen(false)} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"><X className="w-5 h-5" /></button>
              <h3 className="text-base md:text-lg font-bold flex items-center gap-2 border-b pb-2 mb-4"><BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" /><span>تحليل وإحصائيات الحضور</span></h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-xl flex items-center justify-between border ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-emerald-50/60 border-emerald-100 text-gray-700'
                }`}>
                  <span className="text-xs md:text-sm font-medium">متوسط الحضور العام:</span>
                  <span className="text-lg md:text-xl font-black text-emerald-400">{averageTotalAttendance}%</span>
                </div>
                {!isRestrictedRole && (
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}><div className="text-gray-400 mb-0.5">الحاضرون اليوم</div><div className="font-bold text-emerald-400 text-base">{students.filter(s=>s.attendanceStatus === 'present').length}</div></div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}><div className="text-gray-400 mb-0.5">الغائبون اليوم</div><div className="font-bold text-red-400 text-base">{students.filter(s=>s.attendanceStatus === 'absent').length}</div></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Attendance;