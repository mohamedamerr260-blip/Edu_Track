import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

const ParentDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // حالة الوضع الداكن (Dark Mode) المتزامنة مع الهيدر
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
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

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

  // جلب بيانات الابن من قائمة الطلاب المسجلة
  const [student, setStudent] = useState<any>({
    fullName: 'الطالب المرتبط',
    class: 'الصف الدراسي',
    avatar: '',
    attendance: 0,
    grades: { math: 0, science: 0, arabic: 0, english: 0, history: 0, geography: 0 }
  });

  useEffect(() => {
    const savedStudents = localStorage.getItem('edu_students_list');
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents);
        if (parsed && parsed.length > 0) {
          const found = id ? parsed.find((s: any) => s.id === id) : parsed[0];
          if (found) {
            setStudent({
              fullName: `${found.firstName} ${found.lastName}`,
              class: found.class || 'الفصل الأول',
              avatar: found.avatar || '',
              attendance: found.attendance || 0,
              grades: found.grades || { math: 0, science: 0, arabic: 0, english: 0, history: 0, geography: 0 }
            });
          }
        }
      } catch (e) {
        console.error("Error reading student for parent dashboard", e);
      }
    }
  }, [id]);

  const gradesValues = Object.values(student.grades || {}) as number[];
  const averageGrade = gradesValues.length > 0 ? gradesValues.reduce((a, b) => a + b, 0) / gradesValues.length : 0;
  const attendancePercentage = student.attendance || 0;

  const subjectsMap: Record<string, string> = {
    math: 'الرياضيات',
    science: 'العلوم',
    arabic: 'اللغة العربية',
    english: 'اللغة الإنجليزية',
    history: 'التاريخ',
    geography: 'الجغرافيا'
  };

  return (
    <Layout>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className={`relative z-10 space-y-6 text-right pb-12 px-2 sm:px-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir="rtl">
        
        {/* الترحيب ومتابعة الابن */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {student.avatar ? (
              <img src={student.avatar} alt={student.fullName} className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold border-4 border-white/30 shadow-lg">
                {student.fullName.charAt(0)}
              </div>
            )}
            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-3xl font-bold">متابعة ولي الأمر للطالب: {student.fullName}</h1>
              <p className="text-blue-100 mt-1 font-medium">الصف الدراسي: {student.class}</p>
            </div>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>متوسط درجات الابن</p>
            <p className="text-3xl font-black text-blue-500 mt-1">{averageGrade.toFixed(1)}%</p>
          </div>
          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>نسبة الحضور</p>
            <p className="text-3xl font-black text-emerald-500 mt-1">{attendancePercentage}%</p>
          </div>
        </div>

        {/* درجات المواد */}
        <div className={`rounded-2xl shadow-xl p-6 border backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>درجات المواد الدراسية لابنك</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(student.grades || {}).map(([subj, val]) => (
              <div key={subj} className={`p-4 rounded-xl border ${Number(val) > 0 ? 'border-blue-500/30' : isDarkMode ? 'border-slate-800 bg-slate-950/40 text-slate-500' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base">{subjectsMap[subj] || subj}</h3>
                  <span className="text-xl font-black">{String(val)}%</span>
                </div>
                <div className="text-xs opacity-80">
                  {Number(val) > 0 ? 'الاختبار الدوري المعتمد' : 'لم يتم رصد درجات بعد من المعلم'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

ParentDashboard.displayName = 'ParentDashboard';

export default ParentDashboard;