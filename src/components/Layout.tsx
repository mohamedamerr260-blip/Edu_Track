import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  CalendarCheck, 
  Smile, 
  BarChart3, 
  FileText, 
  Award, 
  MessageSquare, 
  Settings,
  LogOut,
  BookOpen,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // حالة الوضع الداكن (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('edu_theme');
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });

  // حالة اللغة الحالية
  const [currentLang, setCurrentLang] = useState<string>(() => {
    const savedLang = localStorage.getItem('edu_lang');
    return savedLang !== null ? savedLang : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('edu_theme', JSON.stringify(isDarkMode));
    window.dispatchEvent(new Event('storage'));
  }, [isDarkMode]);

  // إغلاق القائمة الجانبية تلقائياً على الموبايل عند تغيير الصفحة
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLanguageToggle = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setCurrentLang(newLang);
    localStorage.setItem('edu_lang', newLang);
    window.dispatchEvent(new Event('storage'));
  };

  const [userRole, setUserRole] = useState<string>('teacher');
  const [userProfile, setUserProfile] = useState({
    fullName: 'مستخدم المنصة',
    avatar: ''
  });

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('current_user') || localStorage.getItem('edu_current_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.role) {
          setUserRole(userObj.role);
        }
      }

      const savedProfile = localStorage.getItem('edu_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setUserProfile({
          fullName: parsed.fullName || 'مستخدم المنصة',
          avatar: parsed.avatar || ''
        });
      } else if (userStr) {
        const userObj = JSON.parse(userStr);
        setUserProfile({
          fullName: userObj.name || `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || 'مستخدم المنصة',
          avatar: ''
        });
      }
    } catch (e) {
      console.error("Error parsing user session in Layout", e);
    } finally {
      setIsReady(true);
    }
  }, [location.pathname]);

  // تأثير الجزيئات الاحترافي في الخلفية العامة
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const mouse = { x: -1000, y: -1000, radius: 140 };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const particlesCount = 45;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      baseVx: (Math.random() - 0.5) * 0.6,
      baseVy: (Math.random() - 0.5) * 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.5 + 1.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDarkMode ? 'rgba(59, 130, 246, 0.45)' : 'rgba(30, 64, 175, 0.35)';
      ctx.strokeStyle = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(30, 64, 175, 0.1)';

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

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.lineWidth = 0.9;
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
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode, isReady]);

  // قوائم التنقل حسب الدور
  const teacherMenuItems = [
    { text: 'لوحة التحكم', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { text: 'الطلاب', icon: <Users className="w-5 h-5" />, path: '/students' },
    { text: 'الدرجات', icon: <FileSpreadsheet className="w-5 h-5" />, path: '/grades' },
    { text: 'الحضور', icon: <CalendarCheck className="w-5 h-5" />, path: '/attendance' },
    { text: 'السلوك', icon: <Smile className="w-5 h-5" />, path: '/behavior' },
    { text: 'التحليلات', icon: <BarChart3 className="w-5 h-5" />, path: '/analytics' },
    { text: 'التقارير', icon: <FileText className="w-5 h-5" />, path: '/reports' },
    { text: 'التحفيز', icon: <Award className="w-5 h-5" />, path: '/gamification' },
    { text: 'ساحة الفصل', icon: <BookOpen className="w-5 h-5" />, path: '/classroom' },
    { text: 'الرسائل', icon: <MessageSquare className="w-5 h-5" />, path: '/communication' },
    { text: 'الإعدادات', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  const studentMenuItems = [
    { text: 'لوحة التحكم', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { text: 'درجاتى الشخصية', icon: <FileSpreadsheet className="w-5 h-5" />, path: '/grades' },
    { text: 'سجل الحضور', icon: <CalendarCheck className="w-5 h-5" />, path: '/attendance' },
    { text: 'التحفيز والنقاط', icon: <Award className="w-5 h-5" />, path: '/gamification' },
    { text: 'ساحة الفصل', icon: <BookOpen className="w-5 h-5" />, path: '/classroom' },
    { text: 'الرسائل والمراسلة', icon: <MessageSquare className="w-5 h-5" />, path: '/communication' },
    { text: 'الإعدادات', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  // القائمة المخصصة لولي الأمر (بدون الصفحات الزيادة)
  const parentMenuItems = [
    { text: 'لوحة التحكم', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { text: 'درجات الابن', icon: <FileSpreadsheet className="w-5 h-5" />, path: '/grades' },
    { text: 'سجل الحضور', icon: <CalendarCheck className="w-5 h-5" />, path: '/attendance' },
    { text: 'الرسائل والمراسلة', icon: <MessageSquare className="w-5 h-5" />, path: '/communication' },
    { text: 'الإعدادات', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  const isStudent = userRole === 'student' || userRole === 'STUDENT';
  const isParent = userRole === 'parent' || userRole === 'PARENT';

  let menuItems = teacherMenuItems;
  if (isStudent) {
    menuItems = studentMenuItems;
  } else if (isParent) {
    menuItems = parentMenuItems;
  }

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    localStorage.removeItem('edu_current_user'); 
    navigate('/login');
  };

  if (!isReady) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="animate-pulse font-bold text-lg">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-row-reverse font-sans transition-colors duration-500 relative overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-100 text-gray-900'}`} dir="rtl">
      
      {/* خلفية الجزيئات الثابتة */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* خلفية شفافة عند فتح القائمة على الموبايل */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* القائمة الجانبية (Sidebar) */}
      <aside className={`w-64 border-l flex flex-col fixed h-full right-0 top-0 z-40 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      } ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 backdrop-blur-md' : 'bg-white border-gray-200'
      }`}>
        
        <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {isStudent ? 'بوابة الطالب' : isParent ? 'بوابة ولي الأمر' : 'منصة تعليم'}
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                    : isDarkMode 
                      ? 'text-slate-400 hover:bg-slate-800/60 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            );
          })}
        </nav>

        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isDarkMode ? 'text-red-400 hover:bg-red-950/40' : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 md:mr-64 mr-0 relative z-10 flex flex-col min-h-screen transition-all">
        
        {/* الهيدر العلوي الثابت */}
        <header className={`h-16 border-b flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 right-0 md:mr-64 mr-0 z-30 transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-900/95 border-slate-800 backdrop-blur-md' : 'bg-white/95 border-gray-200 backdrop-blur-md'
        }`}>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl border transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-gray-100 border-gray-200 text-gray-800'
              }`}
              title="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-md flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-slate-900/90 border border-slate-700 text-amber-400 hover:border-amber-500/50 shadow-amber-500/10' 
                  : 'bg-slate-900 border border-slate-800 text-amber-300 hover:bg-slate-800 shadow-slate-900/20'
              }`}
              title="تبديل الوضع"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> :  <Moon className="w-4 h-4 text-indigo-300"/>}
            </button>

            {/* زر تبديل اللغة */}
            <button
              onClick={handleLanguageToggle}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-300 transform hover:scale-105 shadow-md shrink-0 ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="inline-flex items-center gap-1.5">
                {currentLang === 'ar' ? (
                  <>
                    <span className="font-bold">EN</span>
                    <img 
                      src="https://flagcdn.com/w40/gb.png" 
                      alt="UK Flag" 
                      className="w-5 h-3.5 object-cover rounded shadow-sm"
                    />
                  </>
                ) : (
                  <>
                    <span className="font-bold">AR</span>
                    <img 
                      src="https://flagcdn.com/w40/eg.png" 
                      alt="Egypt Flag" 
                      className="w-5 h-3.5 object-cover rounded shadow-sm"
                    />
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium hidden sm:inline ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
              {userProfile.fullName}
            </span>
            <div 
              onClick={() => navigate('/settings')}
              className={`w-9 h-9 rounded-full border overflow-hidden flex items-center justify-center font-bold text-sm cursor-pointer transition-transform hover:scale-110 shadow-sm ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
              }`}
              title="الانتقال إلى الإعدادات"
            >
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
          </div>
        </header>

        {/* محتويات الصفحات */}
        <main className="p-4 md:p-8 mt-16 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;