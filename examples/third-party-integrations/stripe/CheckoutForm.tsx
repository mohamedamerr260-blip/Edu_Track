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

// خلفية الكانفاس المتحركة
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

    const particleCount = 150;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];

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

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor + '0.7)';
        ctx.fill();

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

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('register');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(ROUTES.DASHBOARD);
    }, 700);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      setError('كلمتا المرور غير متطابقتين!');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(ROUTES.DASHBOARD);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 bg-slate-950 text-white relative overflow-y-auto" dir="rtl">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center bg-blue-600 p-3 rounded-2xl shadow-lg mb-2">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-blue-400">Edu_Track</h1>
        </div>

        {/* الكارت بشفافية واضحة ومباشرة */}
            <Card className="border border-white/20 rounded-3xl backdrop-blur-md bg-transparent text-white shadow-2xl">          <CardContent className="p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/10 rounded-xl p-1">
                <TabsTrigger value="login" className="rounded-lg text-xs font-bold py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg text-xs font-bold py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">إنشاء حساب</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3 text-right">
                  <div>
                    <Label className="text-xs">البريد الإلكتروني</Label>
                    <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="bg-white/10 border-white/20 text-white text-xs h-10 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs">كلمة المرور</Label>
                    <Input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="bg-white/10 border-white/20 text-white text-xs h-10 rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-xl text-xs font-bold">تسجيل الدخول</Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-2 text-right">
                  <div>
                    <Label className="text-xs">الاسم الكامل</Label>
                    <Input type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required className="bg-white/10 border-white/20 text-white text-xs h-9 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs">البريد الإلكتروني</Label>
                    <Input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required className="bg-white/10 border-white/20 text-white text-xs h-9 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs">كلمة المرور</Label>
                    <Input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required className="bg-white/10 border-white/20 text-white text-xs h-9 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs">تأكيد كلمة المرور</Label>
                    <Input type="password" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required className="bg-white/10 border-white/20 text-white text-xs h-9 rounded-xl" />
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-9 rounded-xl text-xs font-bold mt-2">إنشاء حساب جديد</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;