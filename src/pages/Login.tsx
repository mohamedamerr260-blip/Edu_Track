import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole, ROUTES } from '@/lib/index';
import { GraduationCap, User, Users, BookOpen, Eye, EyeOff } from 'lucide-react';

// مكون الخلفية المتحركة التفاعلية
const ParticleBackground: React.FC = () => {
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

    const particleCount = Math.min(Math.floor((width * height) / 6000), 200);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 3 + 1.5,
      });
    }

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const particleColor = 'rgba(79, 172, 254, ';
      const lineColor = '79, 172, 254';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 100) {
          p.x -= (dxMouse / distMouse) * 0.4;
          p.y -= (dyMouse / distMouse) * 0.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor + '0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4facfe';
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('register');
  const [isLoading, setIsLoading] = useState(false);
  
  // فصلنا حالات الخطأ لكل فورم لوحده تماماً
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.STUDENT);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.STUDENT);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const demoAccounts = [
      { email: 'teacher@school.com', password: 'demo123', role: UserRole.TEACHER },
      { email: 'student@school.com', password: 'demo123', role: UserRole.STUDENT },
      { email: 'parent@school.com', password: 'demo123', role: UserRole.PARENT }
    ];

    setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem('edu_users') || '[]');
      const allUsers = [...demoAccounts, ...existingUsers];

      const user = allUsers.find(
        (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && 
               u.password === loginPassword && 
               u.role === loginRole
      );

      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        navigate(ROUTES.DASHBOARD);
      } else {
        setLoginError('بيانات الدخول غير صحيحة، يرجى التحقق من البريد أو كلمة المرور.');
      }
      setIsLoading(false);
    }, 700);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('كلمتا المرور غير متطابقتين!');
      return;
    }

    if (!acceptTerms) {
      setRegisterError('يجب الموافقة على الشروط والأحكام أولاً.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem('edu_users') || '[]');
      const userExists = existingUsers.some(
        (u: any) => u.email.toLowerCase() === registerEmail.toLowerCase()
      );

      if (userExists || ['teacher@school.com', 'student@school.com', 'parent@school.com'].includes(registerEmail)) {
        setRegisterError('هذا البريد الإلكتروني مسجل مسبقاً!');
        setIsLoading(false);
        return;
      }

      const newUser = {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
      };

      existingUsers.push(newUser);
      localStorage.setItem('edu_users', JSON.stringify(existingUsers));
      localStorage.setItem('current_user', JSON.stringify(newUser));

      navigate(ROUTES.DASHBOARD);
      setIsLoading(false);
    }, 800);
  };

  const handleSocialAuth = (provider: string) => {
    alert(`جارٍ تسجيل الدخول باستخدام ${provider} قريباً...`);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-3 bg-slate-950 text-white select-none overflow-y-auto relative"
      dir="rtl"
    >
      <ParticleBackground />

      <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md my-auto py-2">
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-3 rounded-2xl shadow-xl shadow-blue-500/30 mb-2 border border-white/25 cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-blue-400/50">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
            Edu_Track
          </h1>
          <p className="text-[11px] text-blue-200/70">
            منصة شاملة لإدارة العملية التعليمية
          </p>
        </div>

        {/* نموذج تسجيل الدخول بخلفية شفافة وزجاجية بالكامل */}
        <Card className="border border-white/25 rounded-3xl backdrop-blur-md bg-transparent text-white shadow-2xl">         <CardContent className="p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <TabsList className="grid w-full grid-cols-2 mb-4 p-1 rounded-xl bg-white/5 border border-white/10">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg text-xs font-bold py-2 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow"
                >
                  تسجيل الدخول
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-lg text-xs font-bold py-2 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow"
                >
                  إنشاء حساب
                </TabsTrigger>
              </TabsList>

              {/* فورم تسجيل الدخول */}
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-3 text-right">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-blue-100 block text-right">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      placeholder="أدخل البريد الالكتروني"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="text-right text-xs h-10 rounded-xl bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-blue-100 block text-right">كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="text-right text-xs h-10 pl-9 rounded-xl bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400"
                      >
                        {showLoginPassword ? <Eye className="w-4 h-4 text-blue-400" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-right pt-0.5">
                      <a 
                        href="#forgot" 
                        onClick={(e) => { e.preventDefault(); alert("خاصية استعادة كلمة المرور قريباً"); }} 
                        className="text-[11px] text-blue-400 hover:underline font-medium"
                      >
                        هل نسيت كلمة المرور؟
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-right">
                    <Label className="text-xs font-semibold text-blue-100 block text-right">اختر نوع الحساب</Label>
                    <RadioGroup
                      value={loginRole}
                      onValueChange={(value) => setLoginRole(value as UserRole)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div>
                        <RadioGroupItem value={UserRole.TEACHER} id="l-teacher" className="peer sr-only" />
                        <Label htmlFor="l-teacher" className="flex flex-col items-center gap-1 p-2.5 border border-white/10 bg-white/5 rounded-xl cursor-pointer text-center peer-data-[state=checked]:border-blue-400 peer-data-[state=checked]:bg-blue-600/30 hover:bg-white/10 transition-all">
                          <GraduationCap className="w-4 h-4 text-blue-300" />
                          <span className="text-[11px] font-semibold text-slate-200">معلم</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value={UserRole.STUDENT} id="l-student" className="peer sr-only" />
                        <Label htmlFor="l-student" className="flex flex-col items-center gap-1 p-2.5 border border-white/10 bg-white/5 rounded-xl cursor-pointer text-center peer-data-[state=checked]:border-emerald-400 peer-data-[state=checked]:bg-emerald-600/30 hover:bg-white/10 transition-all">
                          <User className="w-4 h-4 text-emerald-300" />
                          <span className="text-[11px] font-semibold text-slate-200">طالب</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value={UserRole.PARENT} id="l-parent" className="peer sr-only" />
                        <Label htmlFor="l-parent" className="flex flex-col items-center gap-1 p-2.5 border border-white/10 bg-white/5 rounded-xl cursor-pointer text-center peer-data-[state=checked]:border-purple-400 peer-data-[state=checked]:bg-purple-600/30 hover:bg-white/10 transition-all">
                          <Users className="w-4 h-4 text-purple-300" />
                          <span className="text-[11px] font-semibold text-slate-200">ولي أمر</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {loginError && (
                    <Alert variant="destructive" className="py-1.5 text-xs rounded-xl bg-red-950/60 border-red-500/40 text-red-200">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white transition-all shadow-lg shadow-blue-500/25"
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                  </Button>

                  <div className="pt-1">
                    <div className="relative flex py-1.5 items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink mx-2 text-[10px] text-slate-400">أو المتابعة باستخدام</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Facebook')}
                        className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                        title="فيسبوك"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Google')}
                        className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                        title="جوجل"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12.24v4.51h6.47c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.95-5.17 3.95-9.17z"/><path fill="#34A853" d="M12.24 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.4v3.15C3.39 21.32 7.43 24 12.24 24z"/><path fill="#FBBC05" d="M5.52 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.4C.51 8.37 0 10.39 0 12.5s.51 4.13 1.4 5.9l4.12-3.15z"/><path fill="#EA4335" d="M12.24 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C18.19 1.19 15.48 0 12.24 0 7.43 0 3.39 2.68 1.4 6.6l4.12 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Microsoft')}
                        className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                        title="مايكروسوفت"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                      </button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              {/* فورم إنشاء حساب */}
              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-2 text-right">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-blue-100 block text-right">الاسم الكامل</Label>
                    <Input
                      type="text"
                      placeholder="أدخل اسمك كاملا"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="text-right text-xs h-9 rounded-xl bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-blue-100 block text-right">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      placeholder="أدخل البريد الالكتروني"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="text-right text-xs h-9 rounded-xl bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-right">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold text-blue-100 block text-right">تأكيد المرور</Label>
                      <Input
                        type="password"
                        placeholder="إعادة كلمة المرور"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        className="text-right text-xs h-9 rounded-xl bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold text-blue-100 block text-right">كلمة المرور</Label>
                      <div className="relative">
                        <Input
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="8+ أحرف وأرقام"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                          minLength={6}
                          className="text-right text-xs h-9 pl-8 rounded-xl bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400"
                        >
                          {showRegisterPassword ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <Label className="text-xs font-semibold text-blue-100 block text-right">اختر نوع الحساب</Label>
                    <RadioGroup
                      value={registerRole}
                      onValueChange={(value) => setRegisterRole(value as UserRole)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div>
                        <RadioGroupItem value={UserRole.TEACHER} id="r-teacher" className="peer sr-only" />
                        <Label htmlFor="r-teacher" className="flex flex-col items-center gap-1 p-2 border border-white/10 bg-white/5 rounded-xl cursor-pointer text-center peer-data-[state=checked]:border-blue-400 peer-data-[state=checked]:bg-blue-600/30 hover:bg-white/10 transition-all">
                          <GraduationCap className="w-4 h-4 text-blue-300" />
                          <span className="text-[11px] font-semibold text-slate-200">معلم</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value={UserRole.STUDENT} id="r-student" className="peer sr-only" />
                        <Label htmlFor="r-student" className="flex flex-col items-center gap-1 p-2 border border-white/10 bg-white/5 rounded-xl cursor-pointer text-center peer-data-[state=checked]:border-emerald-400 peer-data-[state=checked]:bg-emerald-600/30 hover:bg-white/10 transition-all">
                          <User className="w-4 h-4 text-emerald-300" />
                          <span className="text-[11px] font-semibold text-slate-200">طالب</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value={UserRole.PARENT} id="r-parent" className="peer sr-only" />
                        <Label htmlFor="r-parent" className="flex flex-col items-center gap-1 p-2 border border-white/10 bg-white/5 rounded-xl cursor-pointer text-center peer-data-[state=checked]:border-purple-400 peer-data-[state=checked]:bg-purple-600/30 hover:bg-white/10 transition-all">
                          <Users className="w-4 h-4 text-purple-300" />
                          <span className="text-[11px] font-semibold text-slate-200">ولي أمر</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center gap-2 pt-1 justify-start" style={{ direction: 'rtl' }}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-white/25 bg-white/5 focus:ring-blue-400 cursor-pointer shrink-0"
                    />
                    <label htmlFor="terms" className="text-[11px] text-slate-300 cursor-pointer select-none text-right">
                      أوافق على <span className="text-blue-400 underline font-medium">الشروط والأحكام</span> و <span className="text-blue-400 underline font-medium">سياسة الخصوصية</span>
                    </label>
                  </div>

                  {registerError && (
                    <Alert variant="destructive" className="py-1.5 text-xs rounded-xl bg-red-950/60 border-red-500/40 text-red-200">
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-9 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white transition-transform duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
                  </Button>

                  <div className="pt-1">
                    <div className="relative flex py-1.5 items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink mx-2 text-[10px] text-slate-400">أو المتابعة باستخدام</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Facebook')}
                        className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                        title="فيسبوك"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Google')}
                        className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                        title="جوجل"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12.24v4.51h6.47c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.95-5.17 3.95-9.17z"/><path fill="#34A853" d="M12.24 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.4v3.15C3.39 21.32 7.43 24 12.24 24z"/><path fill="#FBBC05" d="M5.52 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.4C.51 8.37 0 10.39 0 12.5s.51 4.13 1.4 5.9l4.12-3.15z"/><path fill="#EA4335" d="M12.24 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C18.19 1.19 15.48 0 12.24 0 7.43 0 3.39 2.68 1.4 6.6l4.12 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Microsoft')}
                        className="flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                        title="مايكروسوفت"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                      </button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-blue-200/50 mt-3">
          © {new Date().getFullYear()} نظام إدارة المدرسة. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
};

export default Login;