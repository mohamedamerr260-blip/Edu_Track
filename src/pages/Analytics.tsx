import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { 
  Users, 
  Award, 
  BookOpen, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// تعريف بنية البيانات طبقاً للصور والـ LocalStorage الخاص بك
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
  attendance: number;        // نسبة الحضور (مثال: 95)
  attendanceStatus?: 'present' | 'absent' | 'late';
  gpa: number;               // المعدل من 4.00 (مثال: 3.80)
  grades: {
    math: number;            // الدرجات من 100
    science: number;
    arabic: number;
    english: number;
    history: number;
    geography: number;
  };
}

const AnalyticsPage: React.FC = () => {
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

  // مزامنة وقراءة البيانات تلقائياً وفورياً
  useEffect(() => {
    const loadData = () => {
      const savedStudents = localStorage.getItem('edu_students_list');
      if (savedStudents) {
        const parsed: Student[] = JSON.parse(savedStudents);
        setStudents(parsed);
        if (parsed.length > 0 && !selectedStudentId) {
          setSelectedStudentId(parsed[0].id);
        }
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [selectedStudentId]);

  // حساب النسبة المئوية والترتيب الفعلي تلقائياً
  const studentsWithRank = useMemo(() => {
    return students.map(student => {
      const g = student.grades || { math: 0, science: 0, arabic: 0, english: 0, history: 0, geography: 0 };
      const total = (g.math + g.science + g.arabic + g.english + g.history + g.geography);
      const finalPercentage = Math.round(total / 6);
      return {
        ...student,
        finalPercentage
      };
    })
    .sort((a, b) => b.finalPercentage - a.finalPercentage)
    .map((student, index) => ({
      ...student,
      rank: index + 1
    }));
  }, [students]);

  // الإحصائيات العامة للمدرسة
  const totalStudents = studentsWithRank.length;

  const averageAttendance = useMemo(() => {
    if (totalStudents === 0) return 0;
    return Math.round(studentsWithRank.reduce((sum, s) => sum + (s.attendance || 0), 0) / totalStudents);
  }, [studentsWithRank, totalStudents]);

  const averageSchoolGPA = useMemo(() => {
    if (totalStudents === 0) return "0.00";
    const total = studentsWithRank.reduce((sum, s) => sum + (s.gpa || 0), 0);
    return (total / totalStudents).toFixed(2);
  }, [studentsWithRank, totalStudents]);

  // تجهيز رسمة الحضور الدائرية العامة
  const generalAttendancePie = useMemo(() => {
    if (totalStudents === 0) return [];
    const present = studentsWithRank.filter(s => s.attendanceStatus === 'present' || !s.attendanceStatus).length;
    const absent = studentsWithRank.filter(s => s.attendanceStatus === 'absent').length;
    const late = studentsWithRank.filter(s => s.attendanceStatus === 'late').length;
    return [
      { name: 'حاضر', value: present, color: '#10B981' },
      { name: 'غائب', value: absent, color: '#EF4444' },
      { name: 'متأخر', value: late, color: '#F59E0B' },
    ].filter(i => i.value > 0);
  }, [studentsWithRank, totalStudents]);

  // متوسط درجات المواد للمدرسة كاملة
  const schoolSubjectsBarData = useMemo(() => {
    if (totalStudents === 0) return [];
    const totals = studentsWithRank.reduce((acc, s) => {
      acc.math += s.grades?.math || 0;
      acc.science += s.grades?.science || 0;
      acc.arabic += s.grades?.arabic || 0;
      acc.english += s.grades?.english || 0;
      acc.history += s.grades?.history || 0;
      acc.geography += s.grades?.geography || 0;
      return acc;
    }, { math: 0, science: 0, arabic: 0, english: 0, history: 0, geography: 0 });

    return [
      { name: 'الرياضيات', الدرجة: Math.round(totals.math / totalStudents) },
      { name: 'العلوم', الدرجة: Math.round(totals.science / totalStudents) },
      { name: 'اللغة العربية', الدرجة: Math.round(totals.arabic / totalStudents) },
      { name: 'اللغة الإنجليزية', الدرجة: Math.round(totals.english / totalStudents) },
      { name: 'التاريخ', الدرجة: Math.round(totals.history / totalStudents) },
      { name: 'الجغرافيا', الدرجة: Math.round(totals.geography / totalStudents) },
    ];
  }, [studentsWithRank, totalStudents]);

  // الذكاء التلقائي للفئات والأوائل
  const topStudents = useMemo(() => {
    return [...studentsWithRank].slice(0, 5);
  }, [studentsWithRank]);

  const strugglingStudents = useMemo(() => {
    return [...studentsWithRank]
      .filter(s => s.finalPercentage < 70)
      .sort((a, b) => a.finalPercentage - b.finalPercentage);
  }, [studentsWithRank]);

  // بيانات الطالب المحدد حالياً
  const selectedStudentData = useMemo(() => {
    return studentsWithRank.find(s => s.id === selectedStudentId);
  }, [studentsWithRank, selectedStudentId]);

  const studentAnalysis = useMemo(() => {
    if (!selectedStudentData || !selectedStudentData.grades) return { strengths: [], weaknesses: [], radar: [] };
    
    const g = selectedStudentData.grades;
    const subjectsList = [
      { id: 'الرياضيات', score: g.math || 0 },
      { id: 'العلوم', score: g.science || 0 },
      { id: 'اللغة العربية', score: g.arabic || 0 },
      { id: 'اللغة الإنجليزية', score: g.english || 0 },
      { id: 'التاريخ', score: g.history || 0 },
      { id: 'الجغرافيا', score: g.geography || 0 },
    ];

    const strengths = subjectsList.filter(s => s.score >= 85);
    const weaknesses = subjectsList.filter(s => s.score < 70);

    return { strengths, weaknesses, radar: subjectsList };
  }, [selectedStudentData]);

  return (
    <Layout>
      {/* خلفية الجزيئات الثابتة في الخلف */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0" 
      />

      <div className="relative z-10 space-y-8 pb-12 text-right" dir="rtl">
        
        {/* العناوين الرئيسية */}
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>تحليلات الأداء</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>نظرة شاملة على أداء الطلاب والصف الدراسي</p>
        </div>

        {/* الجزء الأول: نظرة عامة على الصف (الرسومات الكبيرة) */}
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl space-y-6 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800 shadow-sm'
        }`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <Users className="w-5 h-5 text-emerald-500" />
            <span>نظرة عامة على الصف</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* إحصائيات الحضور الدائرية */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-50 bg-white'}`}>
              <h3 className={`font-bold text-center mb-4 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>إحصائيات الحضور</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={generalAttendancePie} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value">
                    {generalAttendancePie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderColor: isDarkMode ? '#334155' : '#ccc', color: isDarkMode ? '#fff' : '#000' }} />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#cbd5e1' : '#4b5563' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* متوسط الدرجات حسب المادة */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-50 bg-white'}`}>
              <h3 className={`font-bold text-center mb-4 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>متوسط الدرجات حسب المادة</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={schoolSubjectsBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#E5E7EB'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} style={{ fontSize: '12px', fontFamily: 'Cairo' }} />
                  <YAxis domain={[0, 100]} stroke={isDarkMode ? '#94a3b8' : '#6b7280'} style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderColor: isDarkMode ? '#334155' : '#ccc', color: isDarkMode ? '#fff' : '#000' }} />
                  <Bar dataKey="الدرجة" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* مربعات الأرقام الصغيرة أسفل المخططات */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
            <div className="text-center p-2">
              <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>إجمالي الطلاب</span>
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{totalStudents}</span>
            </div>
            <div className="text-center p-2">
              <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>سجلات الغياب</span>
              <span className="text-2xl font-black text-red-500">{students.filter(s=>s.attendanceStatus==='absent').length}</span>
            </div>
            <div className="text-center p-2">
              <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>نسبة الحضور</span>
              <span className="text-2xl font-black text-emerald-500">{averageAttendance}%</span>
            </div>
            <div className="text-center p-2">
              <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>المعدل التراكمي للغرفة</span>
              <span className="text-2xl font-black text-blue-500">{averageSchoolGPA}</span>
            </div>
          </div>
        </div>

        {/* الجزء الثاني: لوحة الأوائل وحالات المتابعة التلقائية المفتوحة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* صندوق الأوائل */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl space-y-4 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800 shadow-sm'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <Award className="w-5 h-5 text-amber-500" />
              <span>الطلاب المتفوقون</span>
            </h3>
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                      index === 1 ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30' : 
                      'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{student.firstName} {student.lastName}</h4>
                      <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{student.class}</p>
                    </div>
                  </div>
                  <div className="text-left flex items-center gap-4">
                    <div>
                      <span className={`text-xs block text-right ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>النسبة</span>
                      <span className={`text-sm font-bold block ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{student.finalPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-sm font-black text-emerald-500 block">{student.gpa.toFixed(2)}</span>
                      <span className={`text-[10px] block ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>شرفية</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* صندوق حالات بحاجة لمتابعة إرشادية وتدريسية - النسبة أقل من 70% */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl space-y-4 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800 shadow-sm'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>حالات بحاجة لمتابعة إرشادية وتدريسية</span>
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
              {strugglingStudents.length === 0 ? (
                <p className={`text-sm text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>لا توجد حالات أقل من 70% حالياً. أداء ممتاز! ✨</p>
              ) : (
                strugglingStudents.map((student) => (
                  <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDarkMode ? 'border-red-900/40 bg-red-950/20 text-white' : 'border-red-50 bg-red-50/30 text-gray-800'
                  }`}>
                    <div>
                      <h4 className="text-sm font-bold">{student.firstName} {student.lastName}</h4>
                      <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>المعدل: <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-600'}`}>{student.gpa.toFixed(2)}</span></p>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold text-red-400 block">النسبة: {student.finalPercentage}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* الجزء الثالث: خاصية اختيار الطالب وعرض بيانات التحليل المفصلة له */}
        <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-xl space-y-6 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>اختر طالباً لعرض تحليلاته الفردية</h3>
            <select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={`p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              {studentsWithRank.map(s => (
                <option key={s.id} value={s.id} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>
                  {s.firstName} {s.lastName} ({s.class})
                </option>
              ))}
            </select>
          </div>

          {selectedStudentData ? (
            <div className="space-y-6">
              {/* بطاقة تعريف الطالب المحدد */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <h2 className="text-xl font-bold">{selectedStudentData.firstName} {selectedStudentData.lastName}</h2>
                  <p className="text-xs text-blue-100 mt-1">كود الطالب: {selectedStudentData.studentId || "STD2026001"}</p>
                </div>
                <div className="flex items-center gap-6 text-left">
                  <div>
                    <span className="text-2xl font-black block text-center">#{selectedStudentData.rank}</span>
                    <span className="text-xs text-blue-100 block">الترتيب العام</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black block text-center">{selectedStudentData.finalPercentage}%</span>
                    <span className="text-xs text-blue-100 block">النسبة النهائية</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black block text-center">{selectedStudentData.gpa.toFixed(2)}</span>
                    <span className="text-xs text-blue-100 block">المعدل الدراسي</span>
                  </div>
                </div>
              </div>

              {/* نقاط الطالب وضعفه وراداره */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* قائمة نقاط القوة والضعف */}
                <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
                  {/* نقاط القوة */}
                  <div className={`border p-4 rounded-xl ${
                    isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
                  }`}>
                    <h4 className="text-xs font-bold mb-2">🚀 نقاط قوة في:</h4>
                    {studentAnalysis.strengths.length === 0 ? <p className="text-xs opacity-60">لم يتم رصد مواد تفوق حالياً</p> : (
                      <ul className="space-y-1">
                        {studentAnalysis.strengths.map(s => (
                          <li key={s.id} className={`text-xs flex justify-between ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                            <span>{s.id}</span> <span className="font-bold text-emerald-500">{s.score}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* نقاط الضعف */}
                  <div className={`border p-4 rounded-xl ${
                    isDarkMode ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-red-50/50 border-red-100 text-red-700'
                  }`}>
                    <h4 className="text-xs font-bold mb-2">📉 بحاجة لدعم في (ضعف):</h4>
                    {studentAnalysis.weaknesses.length === 0 ? <p className="text-xs opacity-60">لا توجد مواد تعثر، مستوى ممتاز!</p> : (
                      <ul className="space-y-1">
                        {studentAnalysis.weaknesses.map(s => (
                          <li key={s.id} className={`text-xs flex justify-between ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                            <span>{s.id}</span> <span className="font-bold text-red-400">{s.score}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* رسمة الرادار السداسي الخاص بالمواد للطالب المحدد */}
                <div className={`lg:col-span-2 border p-4 rounded-xl flex flex-col items-center justify-center ${
                  isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-gray-50 bg-white'
                }`}>
                  <h4 className={`text-xs font-bold mb-2 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>نقاط القوة والضعف حسب المادة للدرجات الفردية</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={studentAnalysis.radar}>
                      <PolarGrid stroke={isDarkMode ? '#334155' : '#E5E7EB'} />
                      <PolarAngleAxis dataKey="id" stroke={isDarkMode ? '#cbd5e1' : '#4b5563'} style={{ fontSize: '11px', fontFamily: 'Cairo' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#64748b' : '#9ca3af'} style={{ fontSize: '9px' }} />
                      <Radar name="الدرجة المرصودة" dataKey="score" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderColor: isDarkMode ? '#334155' : '#ccc', color: isDarkMode ? '#fff' : '#000' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

              </div>

            </div>
          ) : (
            <p className={`text-sm text-center py-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>الرجاء إضافة طلاب في لوحة التحكم لتفعيل التحليلات المخصصة.</p>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default AnalyticsPage;