import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { Search, SlidersHorizontal, Plus, ThumbsUp, ThumbsDown, Calendar, User, Check, Trash2, X } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
}

interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentFirstName?: string; // حقل اختياري لاستخراج الحرف الأول من الاسم بدقة
  studentClass: string;
  date: string;
  type: 'positive' | 'negative';
  category: string;
  notes: string;
  points: number;
  teacher: string;
}

const Behavior: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'positive' | 'negative'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    studentIndex: '0',
    type: 'positive' as 'positive' | 'negative',
    category: 'مشاركة فعالة',
    points: 5,
    notes: ''
  });

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

  //قراءة الطلاب الحقيقيين فقط وتصفية السجلات القديمة الوهمية
  useEffect(() => {
    const savedStudents = localStorage.getItem('edu_students_list');
    const actualStudents: Student[] = savedStudents ? JSON.parse(savedStudents) : [];
    setStudents(actualStudents);

    const savedRecords = localStorage.getItem('edu_behavior_records');
    let actualRecords: BehaviorRecord[] = savedRecords ? JSON.parse(savedRecords) : [];

    if (actualStudents.length > 0) {
      const validIds = actualStudents.map(s => s.studentId);
      actualRecords = actualRecords.filter(rec => validIds.includes(rec.studentId));
    } else {
      actualRecords = [];
    }

    setRecords(actualRecords);
    localStorage.setItem('edu_behavior_records', JSON.stringify(actualRecords));
  }, []);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    const targetStudent = students[Number(newRecord.studentIndex)];
    const pts = newRecord.type === 'positive' ? Math.abs(newRecord.points) : -Math.abs(newRecord.points);

    const createdRecord: BehaviorRecord = {
      id: Date.now().toString(),
      studentId: targetStudent.studentId,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      studentFirstName: targetStudent.firstName,
      studentClass: targetStudent.class,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: newRecord.type,
      category: newRecord.category,
      notes: newRecord.notes,
      points: pts,
      teacher: 'أ. محمد عامر'
    };

    const updatedRecords = [createdRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('edu_behavior_records', JSON.stringify(updatedRecords));

    const savedOriginal = localStorage.getItem('edu_students_list');
    if (savedOriginal) {
      const parsedOriginal = JSON.parse(savedOriginal);
      const newOriginal = parsedOriginal.map((orig: any) => {
        if (orig.studentId === targetStudent.studentId) {
          return {
            ...orig,
            needsFollowUp: orig.needsFollowUp || newRecord.type === 'negative'
          };
        }
        return orig;
      });
      localStorage.setItem('edu_students_list', JSON.stringify(newOriginal));
    }

    setIsModalOpen(false);
    setNewRecord({ studentIndex: '0', type: 'positive', category: 'مشاركة فعالة', points: 5, notes: '' });
  };

  const handleClearAllRecords = () => {
    if (window.confirm('هل تريد مسح جميع سجلات السلوك الحالية؟')) {
      setRecords([]);
      localStorage.removeItem('edu_behavior_records');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesStudent = selectedStudentFilter === 'all' || rec.studentId === selectedStudentFilter;
      const matchesType = typeFilter === 'all' || rec.type === typeFilter;
      return matchesStudent && matchesType;
    });
  }, [records, selectedStudentFilter, typeFilter]);

  return (
    <Layout>
      {/* خلفية الجزيئات الثابتة في الخلف */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0" 
      />

      <div className="relative z-10 space-y-6 text-right pb-10" dir="rtl">
        {/* الهيدر مع أزرار التحكم */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>إدارة السلوك</h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>تتبع وإدارة سجلات السلوك للطلاب المضافين في السيستم فقط</p>
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button 
                onClick={handleClearAllRecords}
                className={`flex items-center justify-center gap-1.5 font-bold py-2.5 px-4 rounded-xl transition-all text-sm border ${
                  isDarkMode ? 'bg-red-950/40 border-red-900/50 text-red-400 hover:bg-red-900/40' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح السجلات</span>
              </button>
            )}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة سجل سلوك</span>
            </button>
          </div>
        </div>

        {/* الفلاتر التفاعلية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-3 rounded-xl border flex items-center gap-2 backdrop-blur-md shadow-sm ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-xs opacity-70 font-medium whitespace-nowrap">اختر الطالب:</span>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer font-bold w-full"
            >
              <option value="all" className={isDarkMode ? 'bg-slate-900 text-white' : ''}>جميع الطلاب المضافين فعلياً</option>
              {students.map((st) => (
                <option key={st.id} value={st.studentId} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>
                  {st.firstName} {st.lastName} ({st.class})
                </option>
              ))}
            </select>
          </div>

          <div className={`p-2 rounded-xl border flex items-center justify-between backdrop-blur-md shadow-sm ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <span className="text-xs opacity-70 font-medium mr-2">تصفية حسب النوع:</span>
            <div className={`p-1 rounded-lg flex gap-1 ${isDarkMode ? 'bg-slate-950/60' : 'bg-gray-50'}`}>
              <button onClick={() => setTypeFilter('all')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                typeFilter === 'all' 
                  ? (isDarkMode ? 'bg-slate-800 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm') 
                  : 'text-gray-400 hover:opacity-100'
              }`}>الكل ({records.length})</button>
              <button onClick={() => setTypeFilter('positive')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                typeFilter === 'positive' 
                  ? (isDarkMode ? 'bg-emerald-950/60 text-emerald-300 shadow-sm border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 shadow-sm') 
                  : 'text-gray-400 hover:opacity-100'
              }`}>إيجابي</button>
              <button onClick={() => setTypeFilter('negative')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                typeFilter === 'negative' 
                  ? (isDarkMode ? 'bg-red-950/60 text-red-300 shadow-sm border border-red-500/30' : 'bg-red-50 text-red-600 shadow-sm') 
                  : 'text-gray-400 hover:opacity-100'
              }`}>سلبي</button>
            </div>
          </div>
        </div>

        {/* جدول عرض السجلات النظيف */}
        <div className={`rounded-2xl border backdrop-blur-md shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-700 shadow-md'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className={`border-b text-sm font-bold ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'
                }`}>
                  <th className="p-4 text-right">التاريخ</th>
                  <th className="p-4 text-right">الطالب</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">الفئة</th>
                  <th className="p-4 text-right max-w-xs">الملاحظات</th>
                  <th className="p-4">النقاط</th>
                  <th className="p-4">المعلم</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm font-medium ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'divide-gray-50 text-gray-700'}`}>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">لا توجد سجلات سلوك مرصودة. اضغط على "إضافة سجل سلوك" للبدء بالطلاب الذين ضفتهم.</td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50/40'}`}>
                      <td className="p-4 text-right text-xs opacity-60 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{record.date}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-3 justify-start">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isDarkMode ? 'bg-blue-950/60 border-blue-500/30 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-600'
                          }`}>
                            {record.studentFirstName ? record.studentFirstName.charAt(0).toUpperCase() : (record.studentName ? record.studentName.charAt(0).toUpperCase() : <User className="w-4 h-4" />)}
                          </div>
                          <div className="flex flex-col text-right">
                            <div className="font-bold">{record.studentName}</div>
                            <div className="text-xs opacity-60 font-mono mt-0.5">{record.studentClass}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          record.type === 'positive' 
                            ? (isDarkMode ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-600') 
                            : (isDarkMode ? 'bg-red-950/50 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-600')
                        }`}>
                          {record.type === 'positive' ? 'إيجابي' : 'سلبي'}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{record.category}</td>
                      <td className="p-4 text-right text-xs opacity-75 max-w-xs whitespace-normal leading-relaxed">{record.notes}</td>
                      <td className={`p-4 font-black text-base ${record.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {record.points > 0 ? `+${record.points}` : record.points}
                      </td>
                      <td className="p-4 text-xs opacity-60">{record.teacher}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* منبثق الإضافة */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className={`rounded-2xl w-full max-w-md shadow-2xl p-6 relative border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"><X className="w-5 h-5" /></button>
              <h3 className="text-lg font-bold border-b pb-2 mb-4">إضافة سجل سلوك جديد</h3>
              {students.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-red-400 font-bold mb-2">لم تقم بإضافة أي طلاب بعد!</p>
                  <p className="text-xs opacity-60">يرجى الذهاب لصفحة الطلاب أولاً وإضافة طلاب حقيقيين لتراهم هنا.</p>
                </div>
              ) : (
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold opacity-75 mb-1">اختر الطالب:</label>
                    <select
                      value={newRecord.studentIndex}
                      onChange={(e) => setNewRecord({ ...newRecord, studentIndex: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                      }`}
                    >
                      {students.map((st, idx) => (
                        <option key={st.id} value={idx} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>
                          {st.firstName} {st.lastName} ({st.class})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold opacity-75 mb-1">نوع السلوك:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setNewRecord({ ...newRecord, type: 'positive', category: 'مشاركة فعالة', points: 5 })} className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        newRecord.type === 'positive' 
                          ? (isDarkMode ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-emerald-50 border-emerald-500 text-emerald-600') 
                          : (isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-500')
                      }`}><span>إيجابي (+5)</span></button>
                      <button type="button" onClick={() => setNewRecord({ ...newRecord, type: 'negative', category: 'تأخر متكرر', points: 5 })} className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        newRecord.type === 'negative' 
                          ? (isDarkMode ? 'bg-red-950/60 border-red-500 text-red-300' : 'bg-red-50 border-red-500 text-red-600') 
                          : (isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-500')
                      }`}><span>سلبي (-5)</span></button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold opacity-75 mb-1">الفئة / نوع الملاحظة:</label>
                    <input type="text" value={newRecord.category} onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })} className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`} placeholder="مثال: تميز أكاديمي، عدم حل الواجب" required />
                  </div>

                  <div>
                    <label className="block text-xs font-bold opacity-75 mb-1">تفاصيل الملاحظة:</label>
                    <textarea value={newRecord.notes} onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20 resize-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`} placeholder="اكتب تفاصيل السلوك..." required />
                  </div>

                  <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                    <button type="button" onClick={() => setIsModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-bold ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}>إلغاء</button>
                    <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1"><Check className="w-4 h-4" /><span>حفظ السجل</span></button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Behavior;