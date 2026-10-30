import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { Plus, Search, Pencil, Trash2, X, SlidersHorizontal, User } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
  email: string;
  attendance: number;
  gpa: number;
  needsFollowUp: boolean;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // تأثير جزيئات الخلفية المتحركة (تهرب ببطء شديد وبنعومة من الماوس)
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

    const particlesCount = 40;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseVx: (Math.random() - 0.5) * 0.7,
      baseVy: (Math.random() - 0.5) * 0.7,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1.8,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = isDarkMode ? 'rgba(59, 130, 246, 0.45)' : 'rgba(30, 64, 175, 0.4)';
      ctx.strokeStyle = isDarkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(30, 64, 175, 0.12)';

      particles.forEach((p, index) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // تم تقليل سرعة الهروب لتصبح بطيئة جداً وهادئة (0.06 بدلاً من 0.15)
          p.vx -= Math.cos(angle) * force * 0.01;
          p.vy -= Math.sin(angle) * force * 0.01;
        } else {
          // رجوع تدريجي وبطيء جداً للسرعة الطبيعية
          p.vx += (p.baseVx - p.vx) * 0.015;
          p.vy += (p.baseVy - p.vy) * 0.015;
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

          if (dist < 130) {
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

  // حقول الفورم
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const savedStudents = localStorage.getItem('edu_students_list');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  const saveToStorage = (updatedList: Student[]) => {
    setStudents(updatedList);
    localStorage.setItem('edu_students_list', JSON.stringify(updatedList));
  };

  const openAddModal = () => {
    setFirstName(''); setLastName(''); setStudentClass(''); setStudentId(''); setEmail('');
    setIsAddModalOpen(true);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !studentClass || !studentId || !email) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      firstName,
      lastName,
      class: studentClass,
      studentId,
      email,
      attendance: 0,
      gpa: 0,
      needsFollowUp: false
    };

    const updated = [...students, newStudent];
    saveToStorage(updated);
    setIsAddModalOpen(false);
  };

  const openEditModal = (student: Student) => {
    setSelectedStudentId(student.id);
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setStudentClass(student.class);
    setStudentId(student.studentId);
    setEmail(student.email);
    setIsEditModalOpen(true);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = students.map((s) => {
      if (s.id === selectedStudentId) {
        return { ...s, firstName, lastName, class: studentClass, studentId, email };
      }
      return s;
    });
    saveToStorage(updated);
    setIsEditModalOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟')) {
      const updated = students.filter((s) => s.id !== id);
      saveToStorage(updated);
    }
  };

  const uniqueClasses = Array.from(new Set(students.map(s => s.class)));

  const filteredStudents = students.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.includes(searchTerm);
    const matchesClass = selectedClass === 'all' || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <Layout>
      {/* خلفية الجزيئات ثابتة في الخلف */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0" 
      />

      <div className="relative z-10 space-y-6 text-right pb-10" dir="rtl">
        
        {/* الترويسة */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>إدارة الطلاب</h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>عرض وإدارة بيانات الطلاب والتحكم بها</p>
          </div>
          <button onClick={openAddModal} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/20">
            <Plus className="w-5 h-5" />
            <span>إضافة طالب</span>
          </button>
        </div>

        {/* شريط البحث والفلتر */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className={`p-3 rounded-xl border flex items-center gap-3 w-full md:max-w-md backdrop-blur-md shadow-sm ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-800'
          }`}>
            <Search className="text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="البحث عن طالب..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-gray-400" 
            />
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md shadow-sm w-full md:w-auto ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-transparent text-sm focus:outline-none cursor-pointer font-medium">
              <option value="all" className={isDarkMode ? 'bg-slate-900 text-white' : ''}>جميع الصفوف</option>
              {uniqueClasses.map((c, i) => <option key={i} value={c} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* جدول الطلاب */}
        <div className={`rounded-2xl border backdrop-blur-md shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-md'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className={`border-b text-sm font-semibold ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <th className="p-4">الاسم</th>
                  <th className="p-4">الصف</th>
                  <th className="p-4">الرقم التعريفي</th>
                  <th className="p-4">البريد الإلكتروني</th>
                  <th className="p-4">الحضور</th>
                  <th className="p-4">المتوسط</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'divide-gray-100 text-gray-700'}`}>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400 font-medium">لا يوجد طلاب مسجلين حالياً.</td></tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/50'}`}>
                      <td className="p-4 font-semibold">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isDarkMode ? 'bg-blue-950/60 border-blue-500/30 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'
                          }`}>
                            {student.firstName ? student.firstName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <span>{student.firstName} {student.lastName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          isDarkMode ? 'bg-blue-950/40 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {student.class}
                        </span>
                      </td>
                      <td className="p-4 opacity-75 font-mono">{student.studentId}</td>
                      <td className="p-4 opacity-75">{student.email}</td>
                      <td className="p-4 font-medium">{student.attendance}%</td>
                      <td className="p-4 font-semibold">{student.gpa.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(student)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-blue-950/50' : 'text-blue-600 hover:bg-blue-50'}`}><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteStudent(student.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-950/50' : 'text-red-600 hover:bg-red-50'}`}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* مودال إضافة طالب */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                <h3 className="text-xl font-bold">إضافة طالب جديد</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="opacity-70 hover:opacity-100"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">الاسم الأول</label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="أدخل الاسم الأول" className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">الاسم الأخير</label>
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="أدخل الاسم الأخير" className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">الصف</label>
                  <input type="text" required value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder="مثال: 10-أ" className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">الرقم التعريفي</label>
                  <input type="text" required value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="مثال: STD2024001" className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">البريد الإلكتروني لولي الأمر</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com" className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`} dir="ltr" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md">إضافة الطالب</button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className={`flex-1 font-semibold py-2.5 rounded-xl text-sm ${
                    isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* مودال تعديل بيانات الطالب */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                <h3 className="text-xl font-bold">تعديل بيانات الطالب</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="opacity-70 hover:opacity-100"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEditStudent} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">الاسم الأول</label>
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 opacity-80">الاسم الأخير</label>
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">الصف</label>
                  <input type="text" required value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">الرقم التعريفي</label>
                  <input type="text" required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">البريد الإلكتروني لولي الأمر</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`} dir="ltr" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md">حفظ التعديلات</button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className={`flex-1 font-semibold py-2.5 rounded-xl text-sm ${
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

export default Students;