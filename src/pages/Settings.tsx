import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { 
  User, 
  Shield, 
  Bell, 
  Camera, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
  Trash2,
  Volume2,
  Database,
  Moon,
  Globe,
  Smartphone
} from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'مستخدم المنصة',
    email: 'user@example.com',
    phone: '01012345678',
    role: 'معلم',
    avatar: ''
  });

  // قراءة بيانات المستخدم الحالي والتحقق التلقائي من دوره (معلم، طالب، ولي أمر)
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('current_user') || localStorage.getItem('edu_current_user');
      const savedProfile = localStorage.getItem('edu_user_profile');
      
      let detectedRole = 'معلم';
      let detectedName = 'مستخدم المنصة';
      let detectedEmail = 'user@example.com';
      let detectedPhone = '01012345678';
      let detectedAvatar = '';

      if (userStr) {
        const userObj = JSON.parse(userStr);
        detectedName = userObj.name || `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || detectedName;
        detectedEmail = userObj.email || detectedEmail;
        
        // تحويل الرتبة الإنجليزية إلى العربية بشكل تلقائي دقيق
        const rawRole = (userObj.role || 'teacher').toLowerCase();
        if (rawRole.includes('student') || rawRole.includes('طالب')) {
          detectedRole = 'طالب';
        } else if (rawRole.includes('parent') || rawRole.includes('ولي')) {
          detectedRole = 'ولي أمر';
        } else {
          detectedRole = 'معلم';
        }
      }

      if (savedProfile) {
        const profObj = JSON.parse(savedProfile);
        detectedAvatar = profObj.avatar || '';
        if (profObj.phone) detectedPhone = profObj.phone;
      }

      setProfile({
        fullName: detectedName,
        email: detectedEmail,
        phone: detectedPhone,
        role: detectedRole,
        avatar: detectedAvatar
      });
    } catch (e) {
      console.error("Error reading session", e);
    }
  }, []);

  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [notifications, setNotifications] = useState({ chatMessages: true, studentProgress: true, pointsAndBadges: true, systemUpdates: false, emailAlerts: true });
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('ar');
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(false);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showStatus('error', 'حجم الصورة يجب ألا يتعدى 2 ميجابايت!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updated = { ...profile, avatar: base64String };
        setProfile(updated);
        localStorage.setItem('edu_user_profile', JSON.stringify(updated));
        showStatus('success', 'تم تحديث صورة البروفايل بنجاح وسيتم تطبيقها بالسيستم.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('edu_user_profile', JSON.stringify(profile));
    showStatus('success', 'تم حفظ التعديلات الشخصية بنجاح.');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      showStatus('error', 'يرجى ملء جميع حقول كلمة المرور.');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showStatus('error', 'كلمة المرور الجديدة غير متطابقة!');
      return;
    }
    showStatus('success', 'تم تحديث كلمة المرور بنجاح.');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleClearCache = () => {
    if (window.confirm('هل أنت متأكد من مسح البيانات المؤقتة؟')) {
      localStorage.removeItem('edu_chat_rooms');
      localStorage.removeItem('edu_points_logs');
      showStatus('success', 'تم تفريغ ذاكرة التخزين المؤقت بنجاح.');
    }
  };

  return (
    <Layout>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className={`relative z-10 min-h-screen p-4 md:p-6 text-right ${isDarkMode ? 'text-white' : 'text-slate-900'}`} dir="rtl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-indigo-500" />
            إعدادات المنصة ومركز التحكم
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>إدارة حسابك الشخصي، الأمان، والتنبيهات المتقدمة</p>
        </div>

        {statusMessage && (
          <div className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-sm font-bold transition-all animate-fade-in ${
            statusMessage.type === 'success' 
              ? (isDarkMode ? 'bg-emerald-950/90 border-emerald-500/55 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800') 
              : (isDarkMode ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800')
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
            {statusMessage.text}
          </div>
        )}

        {/* التبويبات */}
        <div className={`rounded-2xl p-2 shadow-xl border flex flex-wrap gap-2 mb-6 max-w-3xl backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <button onClick={() => setActiveTab('profile')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}>
            <User className="w-4 h-4" /> الملف الشخصي
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}>
            <Shield className="w-4 h-4" /> الأمان والحماية
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-md' : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}>
            <Bell className="w-4 h-4" /> الإشعارات
          </button>
          <button onClick={() => setActiveTab('system')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'system' ? 'bg-indigo-600 text-white shadow-md' : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}>
            <SettingsIcon className="w-4 h-4" /> إعدادات النظام
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className={`rounded-3xl shadow-2xl border p-6 max-w-4xl min-h-[450px] backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* تبويب الملف الشخصي */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <h3 className={`text-base font-bold border-b pb-2 ${isDarkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>معلومات الملف الشخصي والصورة</h3>
              
              <div className={`flex flex-col items-center sm:flex-row gap-6 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="relative group">
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-200 border-white text-slate-400'}`}>
                    {profile.avatar ? <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12" />}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="text-center sm:text-right">
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>تحميل صورة بروفايل جديدة</p>
                  <p className="text-xs text-slate-400 mt-1">يدعم صيغ JPG، PNG (الحد الأقصى 2MB) وستظهر فوراً في القائمة الجانبية.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>الاسم الكامل</label>
                  <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} required />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>البريد الإلكتروني</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} required />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>رقم الهاتف</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>الدور / الرتبة بالسيستم (تلقائي)</label>
                  <input type="text" value={profile.role} disabled className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed border ${isDarkMode ? 'bg-slate-950/40 border-slate-800 text-indigo-400' : 'bg-slate-100 border-slate-200 text-indigo-600'}`} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all">
                  <Save className="w-4 h-4" /> حفظ التغييرات الشخصية
                </button>
              </div>
            </form>
          )}

          {/* تبويب الأمان والحماية */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <h3 className={`text-base font-bold border-b pb-2 ${isDarkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>تحديث كلمة المرور الآمنة</h3>
                
                <div className="space-y-4 max-w-xl">
                  <div className="relative">
                    <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>كلمة المرور الحالية</label>
                    <input type={showPass.current ? 'text' : 'password'} value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} placeholder="••••••••" className={`w-full pr-4 pl-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} />
                    <button type="button" onClick={() => setShowPass({ ...showPass, current: !showPass.current })} className="absolute left-3 top-9 text-slate-400 hover:text-slate-200">
                      {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>كلمة المرور الجديدة</label>
                    <input type={showPass.new ? 'text' : 'password'} value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} placeholder="6 أحرف على الأقل" className={`w-full pr-4 pl-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} />
                    <button type="button" onClick={() => setShowPass({ ...showPass, new: !showPass.new })} className="absolute left-3 top-9 text-slate-400 hover:text-slate-200">
                      {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>تأكيد كلمة المرور الجديدة</label>
                    <input type={showPass.confirm ? 'text' : 'password'} value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} placeholder="أعد إدخال كلمة المرور" className={`w-full pr-4 pl-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} />
                    <button type="button" onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })} className="absolute left-3 top-9 text-slate-400 hover:text-slate-200">
                      {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all">
                    <Lock className="w-4 h-4" /> تحديث كلمة المرور 🔐
                  </button>
                </div>
              </form>

              {/* إعداد أمان إضافي جديد */}
              <div className={`p-4 rounded-2xl border mt-6 ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>التحقق بخطوتين (2FA)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">تأمين إضافي لحسابك عند تسجيل الدخول من أجهزة جديدة.</p>
                  </div>
                  <input type="checkbox" checked={twoFactorAuth} onChange={(e) => setTwoFactorAuth(e.target.checked)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* تبويب الإشعارات */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className={`text-base font-bold border-b pb-2 ${isDarkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>مركز التحكم في التنبيهات والأصوات</h3>
              <div className="space-y-4 max-w-2xl">
                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>إشعارات الرسائل والدردشة 💬</p>
                    <p className="text-xs text-slate-400">تنبيه فوري عند استلام رسائل جديدة في غرف الدردشة.</p>
                  </div>
                  <input type="checkbox" checked={notifications.chatMessages} onChange={(e) => setNotifications({ ...notifications, chatMessages: e.target.checked })} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                </div>

                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>تنبيهات تقدم الطلاب والدرجات 📈</p>
                    <p className="text-xs text-slate-400">الحصول على تحديثات عند رصد درجات أو تقارير جديدة.</p>
                  </div>
                  <input type="checkbox" checked={notifications.studentProgress} onChange={(e) => setNotifications({ ...notifications, studentProgress: e.target.checked })} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                </div>

                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>تنبيهات النقاط والأوسمة 🏆</p>
                    <p className="text-xs text-slate-400">إشعارك فور حصولك على نقاط تفوق أو أوسمة إنجاز.</p>
                  </div>
                  <input type="checkbox" checked={notifications.pointsAndBadges} onChange={(e) => setNotifications({ ...notifications, pointsAndBadges: e.target.checked })} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                </div>

                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>الأصوات والتأثيرات الصوتية 🔊</p>
                    <p className="text-xs text-slate-400">تشغيل نغمات تنبيه عند التفاعل مع الأزرار والرسائل.</p>
                  </div>
                  <input type="checkbox" checked={soundAlerts} onChange={(e) => setSoundAlerts(e.target.checked)} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* تبويب إعدادات النظام */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className={`text-base font-bold border-b pb-2 ${isDarkMode ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-800'}`}>إعدادات النظام والتفضيلات العامة</h3>
              <div className="space-y-4 max-w-2xl">
                
                {/* إعداد اختيار اللغة */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>لغة واجهة المنصة</p>
                      <p className="text-xs text-slate-400">اختر لغة العرض المفضلة لديك.</p>
                    </div>
                  </div>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">الإنجليزية (English)</option>
                  </select>
                </div>

                {/* تفريغ الكاش */}
                <div className={`flex items-center justify-between p-4 rounded-xl border border-rose-500/30 ${isDarkMode ? 'bg-rose-950/20' : 'bg-rose-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-rose-400" />
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-rose-300' : 'text-rose-800'}`}>تفريغ ذاكرة التخزين المؤقت</p>
                      <p className="text-xs text-rose-400/80">حذف البيانات المؤقتة لتنظيف الذاكرة وتسريع السيستم.</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleClearCache} className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> مسح المؤقت 🗑️
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Settings;