import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { GradesBarChart, PerformanceLineChart } from '../components/Charts';
import { Users, TrendingUp, Calendar, AlertTriangle, UserPlus, ClipboardCheck, FileText, Bell, BellOff } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);

  // معرفة هل المود الحالي مظلم أو فاتح من خلال الـ localStorage
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

  // تأثير جزيئات الخلفية المتحركة (Canvas)
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

    // إنشاء جزيئات متحركة
    const particlesCount = 55;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // لون الجزيئات بناءً على المود (أزرق مضيء في الداكن، أزرق غامق في الفاتح)
      ctx.fillStyle = isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 64, 175, 0.35)';
      ctx.strokeStyle = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 64, 175, 0.1)';

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // ربط الجزيئات بخطوط خفيفة لو قريبة من بعضها
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.lineWidth = 2;
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
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('edu_students_list');
    if (saved) {
      try {
        setStudents(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing students list", e);
      }
    }
  }, []);

  const checkNeedsFollowUp = (student: any) => {
    const grade = student.gpa || 0;
    return grade > 0 && grade < 70;
  };

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeGradedStudents = students.filter(s => s.gpa > 0);
    const totalGPA = activeGradedStudents.reduce((sum, s) => sum + (s.gpa || 0), 0);
    const averageGPA = activeGradedStudents.length > 0 ? (totalGPA / activeGradedStudents.length).toFixed(1) : '0.0';

    const activeAttendanceStudents = students.filter(s => s.attendance > 0);
    const totalAttendance = activeAttendanceStudents.reduce((sum, s) => sum + (s.attendance || 0), 0);
    const averageAttendance = activeAttendanceStudents.length > 0 ? (totalAttendance / activeAttendanceStudents.length).toFixed(1) : '0.0';

    const studentsNeedingFollowUp = students.filter(s => checkNeedsFollowUp(s)).length;

    return { totalStudents, averageGPA, averageAttendance, studentsNeedingFollowUp };
  }, [students]);

  const customAlerts = useMemo(() => {
    const alerts: string[] = [];
    students.forEach(student => {
      const grade = student.gpa || 0;
      const studentFullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
      const displayName = studentFullName !== '' ? studentFullName : 'طالب غير مسمى';

      if (grade > 0 && grade < 70) {
        const formattedGrade = parseFloat(grade).toFixed(1);
        alerts.push(`الطالب (${displayName}) مستواه الأكاديمي منخفض (الدرجة الحالية: ${formattedGrade}%) وبحاجة لمتابعة عاجلة لرفع مستواه.`);
      }
    });
    return alerts;
  }, [students]);

  const recentGradesData = useMemo(() => {
    const subjects = ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 'التاريخ'];
    const baseGPA = parseFloat(stats.averageGPA);
    return subjects.map((subject, index) => ({
      subject,
      grade: baseGPA > 0 ? Math.min(100, Math.round(baseGPA + (index % 2 === 0 ? 3 : -4))) : 75
    }));
  }, [stats.averageGPA]);

  const monthlyAttendanceData = useMemo(() => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const baseAttendance = parseFloat(stats.averageAttendance);
    return days.map((day, index) => ({
      month: day,
      average: baseAttendance > 0 ? Math.min(100, Math.round(baseAttendance + (index % 2 === 0 ? 2 : -2))) : 92,
    }));
  }, [stats.averageAttendance]);

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden p-2 text-right" dir="rtl">
        
        {/* كانفاس الجزيئات المتحركة في الخلفية */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-none z-0" 
        />

        <div className="relative z-10 space-y-6">
          
          {/* الترويسة والعناوين */}
          <div className={`pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}>
              الرئيسية / لوحة التحكم
            </span>
            <h1 className={`text-3xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>لوحة تحكم المعلم</h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>نظرة عامة على أداء الطلاب والإحصائيات الحالية المتزامنة</p>
          </div>

          {/* شبكة كروت الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* كارت 1 */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-slate-950/50' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي الطلبة</p>
                  <h3 className="text-2xl font-black mt-2">{stats.totalStudents}</h3>
                </div>
                <div className="p-3 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* كارت 2 */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-slate-950/50' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>متوسط الدرجات</p>
                  <h3 className="text-2xl font-black mt-2">{stats.averageGPA}%</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* كارت 3 */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-slate-950/50' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>نسبة الحضور</p>
                  <h3 className="text-2xl font-black mt-2">{stats.averageAttendance}%</h3>
                </div>
                <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* كارت 4 */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white backdrop-blur-md shadow-slate-950/50' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>طلبة بحاجة للمتابعة</p>
                  <h3 className="text-2xl font-black mt-2">{stats.studentsNeedingFollowUp}</h3>
                </div>
                <div className="p-3 rounded-xl bg-amber-600/10 text-amber-500 border border-amber-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

          </div>

          {/* التنبيهات والإشعارات */}
          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">التنبيهات والإشعارات الحالية</h2>
            {customAlerts.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {customAlerts.map((alert, index) => (
                  <div key={index} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border shadow-sm transition-transform duration-200 hover:scale-[1.01] ${
                    isDarkMode ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}>
                <BellOff className="w-8 h-8 opacity-50 mb-2" />
                <p className="font-medium text-sm">لا توجد تنبيهات، جميع الطلاب تخطوا نسبة الـ 70% حالياً</p>
              </div>
            )}
          </div>

          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <h3 className="text-lg font-bold mb-4">متوسط الدرجات الحديثة للمواد</h3>
              <GradesBarChart data={recentGradesData} height={300} />
            </div>

            <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <h3 className="text-lg font-bold mb-4">نسبة الحضور الأسبوعية للطلاب</h3>
              <PerformanceLineChart data={monthlyAttendanceData} height={300} />
            </div>
          </div>

          {/* إجراءات سريعة */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <h3 className="text-lg font-bold mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/students')} 
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20"
              >
                <UserPlus className="w-5 h-5" />
                <span>إضافة طالب</span>
              </button>
              
              <button 
                onClick={() => navigate('/attendance')} 
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-600/20"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>تسجيل حضور</span>
              </button>
              
              <button 
                onClick={() => navigate('/grades')} 
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-600/20"
              >
                <FileText className="w-5 h-5" />
                <span>رصد وإدخال درجات</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;