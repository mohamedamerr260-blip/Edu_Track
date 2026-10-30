import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import {
  Trophy,
  Award,
  Star,
  TrendingUp,
  Users,
  Plus,
  Crown,
  Medal,
  Target,
  Zap,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
  email?: string;
  attendance: number;
  gpa: number;
  needsFollowUp: boolean;
  points?: number; 
  positiveBehaviorsCount?: number; 
}

interface ActivityLog {
  id: string;
  studentName: string;
  type: 'add' | 'deduct';
  points: number;
  reason: string;
  timestamp: number;
}

interface CustomBadge {
  id: string;
  studentId: string;
  badgeName: string;
  colorClass: string;
}

const Gamification: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [customBadges, setCustomBadges] = useState<CustomBadge[]>([]);
  
  const [userRole, setUserRole] = useState<string>('teacher');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('current_user') || localStorage.getItem('edu_current_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.role) {
          setUserRole(userObj.role);
        }
      }
    } catch (e) {
      console.error("Error reading role", e);
    }
  }, []);
  
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [showBadgeManagerModal, setShowBadgeManagerModal] = useState(false);
  
  const [modalStudentId, setModalStudentId] = useState('');
  const [actionType, setActionType] = useState<'add' | 'deduct'>('add');
  const [modalPoints, setModalPoints] = useState<number>(0);
  const [modalReason, setModalReason] = useState('');

  const [badgeStudentId, setBadgeStudentId] = useState('');
  const [badgeActionType, setBadgeActionType] = useState<'add' | 'deduct'>('add');
  const [badgeCountInput, setBadgeCountInput] = useState<number>(1);
  const [badgeNameInput, setBadgeNameInput] = useState('');
  const [badgeColorInput, setBadgeColorInput] = useState('from-blue-500 to-blue-700');

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
    const loadData = () => {
      const savedStudents = localStorage.getItem('edu_students_list');
      if (savedStudents) {
        try {
          const parsedStudents = JSON.parse(savedStudents) as Student[];
          const sanitized = parsedStudents.map(s => ({
            ...s,
            points: s.points ?? 0,
            positiveBehaviorsCount: s.positiveBehaviorsCount ?? 0,
            gpa: s.gpa ?? 0,
            attendance: s.attendance ?? 0
          }));
          setStudents(sanitized);
        } catch (e) {
          console.error("Error parsing students", e);
        }
      }

      const savedLogs = localStorage.getItem('edu_points_logs');
      if (savedLogs) {
        try {
          setLogs(JSON.parse(savedLogs));
        } catch (e) {
          console.error("Error parsing logs", e);
        }
      }

      const savedCustomBadges = localStorage.getItem('edu_custom_badges');
      if (savedCustomBadges) {
        try {
          setCustomBadges(JSON.parse(savedCustomBadges));
        } catch (e) {
          console.error("Error parsing custom badges", e);
        }
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const saveToStorage = (updatedStudents: Student[], updatedLogs: ActivityLog[], updatedCustomBadges?: CustomBadge[]) => {
    setStudents(updatedStudents);
    setLogs(updatedLogs);
    localStorage.setItem('edu_students_list', JSON.stringify(updatedStudents));
    localStorage.setItem('edu_points_logs', JSON.stringify(updatedLogs));
    
    if (updatedCustomBadges) {
      setCustomBadges(updatedCustomBadges);
      localStorage.setItem('edu_custom_badges', JSON.stringify(updatedCustomBadges));
    }
    
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteCustomBadge = (badgeId: string, studentName: string, badgeName: string) => {
    const updatedCustomBadges = customBadges.filter(b => b.id !== badgeId);
    const newLog: ActivityLog = {
      id: 'badge-del-' + Date.now().toString(),
      studentName: studentName,
      type: 'deduct',
      points: 0,
      reason: `تم سحب شارة مخصصة: [ ${badgeName} ]`,
      timestamp: Date.now()
    };
    const updatedLogs = [newLog, ...logs].slice(0, 20);
    saveToStorage(students, updatedLogs, updatedCustomBadges);
  };

  const sortedRanking = [...students].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  const isStudent = userRole === 'student' || userRole === 'STUDENT';
  const topStudents = sortedRanking.slice(0, 10);

  const totalBadgesCalculated = students.reduce((sum, s) => {
    let count = 0;
    if ((s.gpa ?? 0) >= 3.8) count++;
    if ((s.attendance ?? 0) >= 95) count++;
    if ((s.positiveBehaviorsCount ?? 0) >= 5) count++;
    if (sortedRanking[0] && s.id === sortedRanking[0].id && (s.points ?? 0) > 0) count++;
    
    const studentCustomCount = customBadges.filter(b => b.studentId === s.id).length;
    return sum + count + studentCustomCount;
  }, 0);

  const averagePoints = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + (s.points ?? 0), 0) / students.length) 
    : 0;

  const highestPoints = sortedRanking[0]?.points || 0;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const handlePointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStudentId || modalPoints <= 0) return;

    let targetStudentName = '';
    const updatedList = students.map(student => {
      if (student.id === modalStudentId) {
        targetStudentName = `${student.firstName} ${student.lastName}`;
        const currentPoints = student.points ?? 0;
        const currentBehaviors = student.positiveBehaviorsCount ?? 0;
        
        const newPoints = actionType === 'add' 
          ? currentPoints + modalPoints 
          : Math.max(0, currentPoints - modalPoints);

        return {
          ...student,
          points: newPoints,
          positiveBehaviorsCount: actionType === 'add' ? currentBehaviors + 1 : currentBehaviors
        };
      }
      return student;
    });

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      studentName: targetStudentName,
      type: actionType,
      points: modalPoints,
      reason: modalReason || (actionType === 'add' ? 'تميز وتفاعل في الحصة' : 'عدم الالتزام بالقواعد'),
      timestamp: Date.now()
    };

    const updatedLogs = [newLog, ...logs].slice(0, 20);
    saveToStorage(updatedList, updatedLogs, customBadges);
    
    setModalStudentId('');
    setModalPoints(0);
    setModalReason('');
    setActionType('add');
    setShowAddPointsModal(false);
  };

  const handleBadgeManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeStudentId || badgeCountInput <= 0) return;

    let targetStudentName = '';
    students.forEach(s => {
      if (s.id === badgeStudentId) targetStudentName = `${s.firstName} ${s.lastName}`;
    });

    let updatedCustomBadges = [...customBadges];

    if (badgeActionType === 'add') {
      const nameToUse = badgeNameInput.trim() || 'شارة مخصصة للتميز';
      for (let i = 0; i < badgeCountInput; i++) {
        updatedCustomBadges.push({
          id: `badge-add-${Date.now()}-${i}-${Math.random()}`,
          studentId: badgeStudentId,
          badgeName: nameToUse,
          colorClass: badgeColorInput
        });
      }

      const newLog: ActivityLog = {
        id: 'badge-mgr-' + Date.now().toString(),
        studentName: targetStudentName,
        type: 'add',
        points: 0,
        reason: `تمت إضافة عدد (${badgeCountInput}) من شارة: [ ${nameToUse} ] للطالب دفعة واحدة.`,
        timestamp: Date.now()
      };
      const updatedLogs = [newLog, ...logs].slice(0, 20);
      saveToStorage(students, updatedLogs, updatedCustomBadges);

    } else {
      const studentBadges = updatedCustomBadges.filter(b => b.studentId === badgeStudentId);
      const otherBadges = updatedCustomBadges.filter(b => b.studentId !== badgeStudentId);

      const remainingStudentBadges = studentBadges.slice(0, Math.max(0, studentBadges.length - badgeCountInput));
      updatedCustomBadges = [...otherBadges, ...remainingStudentBadges];

      const newLog: ActivityLog = {
        id: 'badge-mgr-del-' + Date.now().toString(),
        studentName: targetStudentName,
        type: 'deduct',
        points: 0,
        reason: `تم سحب وخصم عدد (${badgeCountInput}) شارة مخصصة من رصيد الطالب.`,
        timestamp: Date.now()
      };
      const updatedLogs = [newLog, ...logs].slice(0, 20);
      saveToStorage(students, updatedLogs, updatedCustomBadges);
    }

    setBadgeStudentId('');
    setBadgeNameInput('');
    setBadgeCountInput(1);
    setBadgeColorInput('from-blue-500 to-blue-700');
    setBadgeActionType('add');
    setShowBadgeManagerModal(false);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} د`;
    const hours = Math.floor(minutes / 60);
    return `منذ ${hours} س`;
  };

  const currentMotivMessage = sortedRanking[0] && (sortedRanking[0].points ?? 0) > 0
    ? `🌟 أحسنت يا ${sortedRanking[0].firstName} ${sortedRanking[0].lastName}! أنت صدارة اليوم!` 
    : '🎯 نظام النقاط والتحفيز الذكي لوحة التميز نشطة الآن!';

  return (
    <Layout>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0" 
      />

      <div className={`relative z-10 min-h-screen p-6 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir="rtl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'}`}>
                {isStudent ? '🏆 لوحة الشرف والمتصدرين' : '🎮 نظام النقاط والتحفيز'}
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {isStudent ? 'تعرف على العشرة الأوائل وتنافس معهم للوصول للقمة' : 'تتبع إنجازات الطلاب وحفزهم بالطريقة المختلطة الذكية'}
              </p>
            </div>
            {!isStudent && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBadgeManagerModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium shadow-md"
                >
                  <Sparkles className="w-5 h-5" />
                  إدارة الشارات (تعديل) 🏅
                </button>
                
                <button
                  onClick={() => setShowAddPointsModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  إدارة النقاط (تعديل)
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-center gap-4 text-white">
              <Zap className="w-8 h-8 animate-pulse" />
              <p className="text-2xl font-bold">{currentMotivMessage}</p>
              <Zap className="w-8 h-8 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl p-6 shadow-xl backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>إجمالي الطلاب</p>
                <p className="text-3xl font-bold text-yellow-500">{students.length}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-yellow-950/40 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>إجمالي الشارات</p>
                <p className="text-3xl font-bold text-blue-500">{totalBadgesCalculated}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <Award className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-green-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>متوسط النقاط</p>
                <p className="text-3xl font-bold text-emerald-500">{averagePoints}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-green-100 text-green-600'}`}>
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-purple-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>أعلى نقاط</p>
                <p className="text-3xl font-bold text-purple-500">{highestPoints}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-purple-950/40 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* التخطيط المتوازن لملء الفراغات وعرض العناصر بشكل مرتب */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className={`rounded-2xl shadow-xl p-6 backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-xl shadow-md">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">🏆 لوحة المتصدرين (أفضل 10 طلاب)</h2>
              </div>

              {topStudents.length === 0 ? (
                <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>لا يوجد طلاب مسجلين حالياً.</p>
              ) : (
                <div className="space-y-3">
                  {topStudents.map((student, index) => {
                    let badgeCount = 0;
                    if ((student.gpa ?? 0) >= 3.8) badgeCount++;
                    if ((student.attendance ?? 0) >= 95) badgeCount++;
                    if ((student.positiveBehaviorsCount ?? 0) >= 5) badgeCount++;
                    if (sortedRanking[0] && student.id === sortedRanking[0].id && (student.points ?? 0) > 0) badgeCount++;

                    const studentCustomBadges = customBadges.filter(b => b.studentId === student.id);
                    const combinedBadgeCount = badgeCount + studentCustomBadges.length;

                    return (
                      <div
                        key={student.id}
                        className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-lg border ${
                          index === 0
                            ? (isDarkMode ? 'border-yellow-500/40 bg-yellow-950/20' : 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50')
                            : index === 1
                            ? (isDarkMode ? 'border-slate-500/40 bg-slate-950/40' : 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50')
                            : index === 2
                            ? (isDarkMode ? 'border-amber-600/40 bg-amber-950/20' : 'border-amber-600 bg-gradient-to-r from-amber-50 to-orange-50')
                            : (isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-gray-200 bg-white')
                        }`}
                      >
                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {index < 3 ? (
                                <div className={`w-12 h-12 rounded-full ${getRankColor(index + 1)} flex items-center justify-center shadow-lg`}>
                                  {getRankIcon(index + 1)}
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                  {index + 1}
                                </div>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white/20 shadow-lg">
                                {student.firstName ? student.firstName.charAt(0) : 'ط'}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold truncate">{student.firstName} {student.lastName}</h3>
                              
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'text-gray-600 bg-gray-100'}`}>الصف: {student.class}</span>
                              </div>

                              {studentCustomBadges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {studentCustomBadges.map(b => (
                                    <span 
                                      key={b.id} 
                                      className={`inline-flex items-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r ${b.colorClass} pl-2 pr-2.5 py-0.5 rounded-full shadow-sm`}
                                    >
                                      <span>🏅 {b.badgeName}</span>
                                      {!isStudent && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCustomBadge(b.id, `${student.firstName} ${student.lastName}`, b.badgeName)}
                                          className="bg-white/20 hover:bg-red-600 p-0.5 rounded-full text-white transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* تنظيم العدادات والأرقام بشكل منسق وجذاب */}
                          <div className="flex items-center gap-4 bg-black/10 dark:bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
                            <div className="text-center px-2">
                              <p className="text-xl font-extrabold text-purple-400">{student.points ?? 0}</p>
                              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>نقطة</p>
                            </div>
                            <div className="h-8 w-[1px] bg-white/20"></div>
                            <div className="text-center px-2">
                              <p className="text-xl font-extrabold text-blue-400">{combinedBadgeCount}</p>
                              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>شارة</p>
                            </div>
                            <div className="h-8 w-[1px] bg-white/20"></div>
                            <div className="text-center px-2">
                              <p className="text-xl font-extrabold text-emerald-400">{(student.gpa ?? 0).toFixed(1)}</p>
                              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>المعدل</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`rounded-2xl shadow-xl p-6 backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-3 rounded-xl shadow-md">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">📊 توزيع النقاط المشهود</h2>
              </div>

              <div className="space-y-4">
                {topStudents.slice(0, 5).map((student) => {
                  const points = student.points ?? 0;
                  const maxPoints = highestPoints > 0 ? highestPoints : 1;
                  const percentage = (points / maxPoints) * 100;

                  return (
                    <div key={student.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="text-sm font-bold text-purple-400">{points} نقطة</span>
                      </div>
                      <div className={`w-full rounded-full h-3 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`rounded-2xl shadow-xl p-6 backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-purple-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl text-white shadow-md">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">🔔 حركة النقاط والشارات الحية</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>يحدث تلقائياً ومحفوظ باستمرار</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <p className={`text-center text-sm py-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>لم يتم تسجيل أي تفاعلات بعد.</p>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-xl border-r-4 transition-all ${
                        log.id.includes('-del-')
                          ? (isDarkMode ? 'bg-orange-950/30 border-orange-500 text-slate-200' : 'bg-orange-50 border-orange-500 text-gray-800') 
                          : log.points === 0
                          ? (isDarkMode ? 'bg-blue-950/30 border-blue-500 text-slate-200' : 'bg-blue-50/70 border-blue-500 text-gray-800') 
                          : log.type === 'add' 
                          ? (isDarkMode ? 'bg-emerald-950/30 border-emerald-500 text-slate-200' : 'bg-green-50/70 border-green-500 text-gray-800') 
                          : (isDarkMode ? 'bg-red-950/30 border-red-500 text-slate-200' : 'bg-red-50/70 border-red-500 text-gray-800')
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm truncate max-w-[140px]">{log.studentName}</h4>
                        <span className="text-[10px] opacity-70">{formatTimeAgo(log.timestamp)}</span>
                      </div>
                      <p className="text-xs opacity-90">{log.reason}</p>
                      {log.points > 0 && (
                        <div className="mt-1 text-xs font-bold">
                          {log.type === 'add' ? '+' : '-'}{log.points} نقطة
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {!isStudent && showAddPointsModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className={`rounded-2xl w-full max-w-lg shadow-2xl p-6 relative border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <h3 className="text-xl font-bold mb-4">إدارة نقاط وتحفيز الطالب</h3>
              <form onSubmit={handlePointsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">اختر الطالب</label>
                  <select 
                    value={modalStudentId} 
                    onChange={(e) => setModalStudentId(e.target.value)} 
                    required
                    className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="">-- اختر طالباً --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.class})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">نوع العملية</label>
                    <select 
                      value={actionType} 
                      onChange={(e) => setActionType(e.target.value as 'add' | 'deduct')}
                      className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <option value="add">إضافة نقاط (+)</option>
                      <option value="deduct">خصم نقاط (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">عدد النقاط</label>
                    <input 
                      type="number" 
                      min="1" 
                      required
                      value={modalPoints || ''} 
                      onChange={(e) => setModalPoints(Number(e.target.value))}
                      className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">السبب أو الملاحظة</label>
                  <input 
                    type="text" 
                    placeholder="مثال: تميز في حل الواجب المدرسي..."
                    value={modalReason} 
                    onChange={(e) => setModalReason(e.target.value)}
                    className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">حفظ وتطبيق</button>
                  <button type="button" onClick={() => setShowAddPointsModal(false)} className={`flex-1 font-semibold py-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!isStudent && showBadgeManagerModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className={`rounded-2xl w-full max-w-lg shadow-2xl p-6 relative border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <h3 className="text-xl font-bold mb-4">إدارة الشارات المخصصة</h3>
              <form onSubmit={handleBadgeManagerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">اختر الطالب</label>
                  <select 
                    value={badgeStudentId} 
                    onChange={(e) => setBadgeStudentId(e.target.value)} 
                    required
                    className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <option value="">-- اختر طالباً --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.class})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">الإجراء</label>
                    <select 
                      value={badgeActionType} 
                      onChange={(e) => setBadgeActionType(e.target.value as 'add' | 'deduct')}
                      className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <option value="add">منح شارة جديدة</option>
                      <option value="deduct">سحب شارة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">العدد</label>
                    <input 
                      type="number" 
                      min="1" 
                      required
                      value={badgeCountInput} 
                      onChange={(e) => setBadgeCountInput(Number(e.target.value))}
                      className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                    />
                  </div>
                </div>

                {badgeActionType === 'add' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-1">اسم الشارة</label>
                      <input 
                        type="text" 
                        placeholder="مثال: فارس القراءة / بطل الرياضيات..."
                        value={badgeNameInput} 
                        onChange={(e) => setBadgeNameInput(e.target.value)}
                        className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">تدرج اللون</label>
                      <select 
                        value={badgeColorInput} 
                        onChange={(e) => setBadgeColorInput(e.target.value)}
                        className={`w-full p-3 rounded-xl border focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <option value="from-blue-500 to-blue-700">أزرق متدرج</option>
                        <option value="from-purple-500 to-pink-500">بنفسجي وردي</option>
                        <option value="from-emerald-500 to-teal-700">أخضر زمردي</option>
                        <option value="from-yellow-500 to-amber-600">ذهبي فخم</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">تأكيد الشارات</button>
                  <button type="button" onClick={() => setShowBadgeManagerModal(false)} className={`flex-1 font-semibold py-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gamification;