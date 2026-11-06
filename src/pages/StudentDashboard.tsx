import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

const StudentDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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
      baseVx: (Math.random() - 0.5) * 0.4,
      baseVy: (Math.random() - 0.5) * 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1.5,
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
          p.vx -= Math.cos(angle) * force * 0.04;
          p.vy -= Math.sin(angle) * force * 0.04;
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
            ctx.lineWidth = 0.5;
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

  // جلب الطالب الحقيقي وتصفير البيانات تماماً
  const [currentStudent, setCurrentStudent] = useState<any>(null);

  useEffect(() => {
    const savedStudents = localStorage.getItem('edu_students_list');
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents);
        if (parsed && parsed.length > 0) {
          const found = id ? parsed.find((s: any) => s.id === id) : parsed[0];
          if (found) {
            setCurrentStudent({
              id: found.id,
              fullName: `${found.firstName} ${found.lastName}`,
              class: found.class || 'الفصل الأول',
              avatar: found.avatar || '',
              attendance: found.attendance || 0,
              gpa: found.gpa || 0,
              grades: found.grades || { math: 0, science: 0, arabic: 0, english: 0, history: 0, geography: 0 },
              points: found.points || 0,
              badges: found.badges || []
            });
          }
        }
      } catch (e) {
        console.error("Error reading students list", e);
      }
    }
  }, [id]);

  const student = currentStudent || {
    fullName: 'طالب جديد',
    class: 'الصف الثاني الثانوي',
    avatar: '',
    attendance: 0,
    gpa: 0,
    grades: { math: 0, science: 0, arabic: 0, english: 0, history: 0, geography: 0 },
    points: 0,
    badges: []
  };

  // حساب الإحصائيات (متصفرة تماماً)
  const gradesValues = Object.values(student.grades || {}) as number[];
  const averageGrade = gradesValues.length > 0 ? gradesValues.reduce((a, b) => a + b, 0) / gradesValues.length : 0;
  const attendancePercentage = student.attendance || 0;
  const totalPoints = student.points || 0; // متصفرة تماماً بناءً على بيانات الطالب الحقيقية

  const overallLevel = Math.round((averageGrade * 0.5) + (attendancePercentage * 0.3) + (Math.min(totalPoints / 10, 20)));

  const recentGradesBySubject = Object.entries(student.grades || {}).map(([subj, val]) => {
    const subjectsMap: Record<string, string> = {
      math: 'الرياضيات',
      science: 'العلوم',
      arabic: 'اللغة العربية',
      english: 'اللغة الإنجليزية',
      history: 'التاريخ',
      geography: 'الجغرافيا'
    };
    return {
      subject: subjectsMap[subj] || subj,
      grade: {
        numericValue: val as number,
        assignmentName: (val as number) > 0 ? 'الاختبار الدوري المعتمد' : 'لم يتم رصد درجات بعد'
      }
    };
  });

  const getGradeColorClass = (value: number): string => {
    if (value === 0) return isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-500' : 'text-gray-400 bg-gray-50 border-gray-200';
    if (value >= 90) return isDarkMode ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'text-green-600 bg-green-50 border-green-200';
    if (value >= 75) return isDarkMode ? 'bg-blue-950/40 border-blue-500/30 text-blue-300' : 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return isDarkMode ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' : 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Layout>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className={`relative z-10 space-y-6 text-right pb-12 px-2 sm:px-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir="rtl">
        
        {/* قسم الترحيب بالطالب */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.fullName}
                className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold border-4 border-white/30 shadow-lg">
                {student.fullName.charAt(0)}
              </div>
            )}
            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-3xl font-bold">مرحباً، {student.fullName}</h1>
              <p className="text-blue-100 mt-1 font-medium">{student.class}</p>
            </div>
            <div className="text-center bg-white/10 border border-white/20 rounded-xl px-6 py-3 backdrop-blur-sm">
              <div className="text-3xl font-black">#-</div>
              <div className="text-xs text-blue-100 mt-0.5">الترتيب بالفصل</div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات الشخصية (متصفرة تماماً) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>متوسط درجاتي</p>
                <p className="text-3xl font-black text-blue-500 mt-1">{averageGrade.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>نسبة حضوري</p>
                <p className="text-3xl font-black text-emerald-500 mt-1">{attendancePercentage}%</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إجمالي نقاطي</p>
                <p className="text-3xl font-black text-purple-500 mt-1">{totalPoints} نقطة</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* المستوى العام */}
        <div className={`rounded-2xl shadow-xl p-6 border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>مستواك التعليمي العام</h2>
            <span className="text-2xl font-black text-blue-500">{overallLevel}%</span>
          </div>
          <div className="w-full bg-slate-800/40 rounded-full h-5 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${overallLevel}%` }}
            />
          </div>
          <div className={`mt-3 flex justify-between text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>مبتدئ</span>
            <span>متوسط</span>
            <span>متقدم</span>
            <span>خبير متميز</span>
          </div>
        </div>

        {/* أحدث الدرجات حسب المواد */}
        <div className={`rounded-2xl shadow-xl p-6 border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>درجات المواد الدراسية الحالية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentGradesBySubject.map(({ subject, grade }) => (
              <div
                key={subject}
                className={`p-4 rounded-xl border transition-all ${getGradeColorClass(grade.numericValue)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base">{subject}</h3>
                  <span className="text-xl font-black">{grade.numericValue}%</span>
                </div>
                <div className="text-xs opacity-80">
                  <div>{grade.assignmentName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الأوسمة والمكافآت */}
        <div className={`rounded-2xl shadow-xl p-6 border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>أوسمتك وشارات التميز</h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-blue-950 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>{student.badges.length} وسام</span>
          </div>
          {student.badges.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm font-medium">
              لم تحصل على أوسمة بعد. استمر في التميز ليتم تكريمك من المعلم!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* عرض الأوسمة المكتسبة */}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default StudentDashboard;