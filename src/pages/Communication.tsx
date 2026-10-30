import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { 
  MessageSquare, 
  Send, 
  Users, 
  GraduationCap, 
  Search,
  PlusCircle,
  X,
  Trash2,
  CheckCheck,
  Bot
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  studentId: string;
  email?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'parent' | 'student';
  text: string;
  timestamp: number;
}

interface ChatRoom {
  id: string; 
  title: string; 
  type: 'teacher-student' | 'teacher-parent'; 
  targetId: string; 
  lastMessage?: string;
  lastMessageTime?: number;
}

const Communication: React.FC = () => {
  // التحقق من دور المستخدم الحالي (معلم أم طالب)
  const [userRole, setUserRole] = useState<string>('teacher');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('المعلم (أنا)');
  const [currentUserId, setCurrentUserId] = useState<string>('teacher-main-account');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('current_user') || localStorage.getItem('edu_current_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.role) {
          setUserRole(userObj.role);
        }
        if (userObj && userObj.email) {
          setCurrentUserEmail(userObj.email);
        }
        if (userObj && (userObj.name || userObj.firstName)) {
          setCurrentUserName(userObj.name || `${userObj.firstName} ${userObj.lastName || ''}`);
        }
        if (userObj && userObj.id) {
          setCurrentUserId(userObj.id);
        }
      }
    } catch (e) {
      console.error("Error reading role", e);
    }
  }, []);

  const isStudent = userRole === 'student' || userRole === 'STUDENT';

  const [allStudents, setAllStudents] = useState<Student[]>([]); 
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);

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

  useEffect(() => {
    const savedStudents = localStorage.getItem('edu_students_list');
    let loadedStudents: Student[] = [];
    if (savedStudents) {
      try {
        loadedStudents = JSON.parse(savedStudents);
        setAllStudents(loadedStudents);
      } catch (e) {
        console.error("Error loading students list", e);
      }
    }

    const savedRooms = localStorage.getItem('edu_chat_rooms');
    if (savedRooms) {
      try {
        let rooms = JSON.parse(savedRooms) as ChatRoom[];
        // لو طالب، بنفلتر الغرف بحيث تظهر له غرفته الخاصة فقط إن وجدت
        if (isStudent) {
          const currentStudentObj = loadedStudents.find(s => s.email && s.email.toLowerCase() === currentUserEmail.toLowerCase()) || loadedStudents[0];
          if (currentStudentObj) {
            rooms = rooms.filter(r => r.targetId === currentStudentObj.id);
            // لو مفيش غرفة للشالب، بننشئ له غرفة افتراضية تلقائياً
            if (rooms.length === 0) {
              const defaultRoom: ChatRoom = {
                id: `teacher-student-${currentStudentObj.id}`,
                title: 'محادثة المعلم والاستفسارات',
                type: 'teacher-student',
                targetId: currentStudentObj.id,
                lastMessage: 'أهلاً بك يا بطل، اسأل معلمك عن أي استفسار دراسي.',
                lastMessageTime: Date.now()
              };
              rooms = [defaultRoom];
              localStorage.setItem('edu_chat_rooms', JSON.stringify(rooms));
            }
          }
        }
        setChatRooms(rooms);
        if (rooms.length > 0 && !activeRoomId) {
          setActiveRoomId(rooms[0].id);
        }
      } catch (e) {
        console.error("Error loading chat rooms", e);
      }
    } else {
      if (isStudent && loadedStudents.length > 0) {
        const currentStudentObj = loadedStudents.find(s => s.email && s.email.toLowerCase() === currentUserEmail.toLowerCase()) || loadedStudents[0];
        const defaultRoom: ChatRoom = {
          id: `teacher-student-${currentStudentObj.id}`,
          title: 'محادثة المعلم والاستفسارات',
          type: 'teacher-student',
          targetId: currentStudentObj.id,
          lastMessage: 'أهلاً بك يا بطل، اسأل معلمك عن أي استفسار دراسي.',
          lastMessageTime: Date.now()
        };
        setChatRooms([defaultRoom]);
        setActiveRoomId(defaultRoom.id);
        localStorage.setItem('edu_chat_rooms', JSON.stringify([defaultRoom]));
      } else {
        setChatRooms([]);
      }
    }
  }, [isStudent, currentUserEmail]);

  useEffect(() => {
    if (!activeRoomId) return;
    const savedMessages = localStorage.getItem(`edu_chat_msg_${activeRoomId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([]);
    }
  }, [activeRoomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeRoomId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: isStudent ? 'student' : 'teacher',
      text: textInput.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`edu_chat_msg_${activeRoomId}`, JSON.stringify(updatedMessages));

    const currentRoom = chatRooms.find(r => r.id === activeRoomId);

    const updatedRooms = chatRooms.map(room => {
      if (room.id === activeRoomId) {
        return {
          ...room,
          lastMessage: textInput.trim(),
          lastMessageTime: Date.now()
        };
      }
      return room;
    });
    setChatRooms(updatedRooms);
    localStorage.setItem('edu_chat_rooms', JSON.stringify(updatedRooms));

    setTextInput('');

    // الرد التلقائي الذكي
    if (autoReplyEnabled && currentRoom && isStudent) {
      setTimeout(() => {
        const replyText = 'أهلاً بك يا بني، لقد تلقيت استفسارك وسأقوم بالإجابة عليه وتوضيحه لك قريباً في الحصة القادمة!';
        const autoReplyMessage: Message = {
          id: `msg-reply-${Date.now()}`,
          senderId: 'teacher-main-account',
          senderName: 'المعلم',
          senderRole: 'teacher',
          text: replyText,
          timestamp: Date.now()
        };

        setMessages(prev => {
          const newMsgs = [...prev, autoReplyMessage];
          localStorage.setItem(`edu_chat_msg_${activeRoomId}`, JSON.stringify(newMsgs));
          return newMsgs;
        });

        setChatRooms(prevRooms => {
          const newR = prevRooms.map(r => {
            if (r.id === activeRoomId) {
              return { ...r, lastMessage: replyText, lastMessageTime: Date.now() };
            }
            return r;
          });
          localStorage.setItem('edu_chat_rooms', JSON.stringify(newR));
          return newR;
        });
      }, 1200);
    }
  };

  const startNewChat = (student: Student, chatType: 'teacher-student' | 'teacher-parent') => {
    const roomId = `${chatType}-${student.id}`;
    const roomTitle = chatType === 'teacher-student' 
      ? `الطالب: ${student.firstName} ${student.lastName}` 
      : `ولي أمر: ${student.firstName} ${student.lastName}`;

    const exists = chatRooms.find(r => r.id === roomId);
    
    if (!exists) {
      const newRoom: ChatRoom = {
        id: roomId,
        title: roomTitle,
        type: chatType,
        targetId: student.id,
        lastMessage: 'لا توجد رسائل.. ابدأ المحادثة الآن',
        lastMessageTime: Date.now()
      };
      const updatedRooms = [newRoom, ...chatRooms];
      setChatRooms(updatedRooms);
      localStorage.setItem('edu_chat_rooms', JSON.stringify(updatedRooms));
    }

    setActiveRoomId(roomId);
    setShowNewChatModal(false);
    setNewChatSearch('');
  };

  const handleDeleteRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedRooms = chatRooms.filter(r => r.id !== roomId);
    setChatRooms(updatedRooms);
    localStorage.setItem('edu_chat_rooms', JSON.stringify(updatedRooms));
    localStorage.removeItem(`edu_chat_msg_${roomId}`);
    if (activeRoomId === roomId) setActiveRoomId('');
  };

  const filteredRooms = chatRooms.filter(room =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentsForNewChat = allStudents.filter(st => 
    `${st.firstName} ${st.lastName}`.toLowerCase().includes(newChatSearch.toLowerCase())
  );

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0" 
      />

      <div className={`relative z-10 min-h-screen p-4 md:p-6 text-right ${isDarkMode ? 'text-white' : 'text-slate-900'}`} dir="rtl">
        
        {/* شريط التحكم العلوي */}
        <div className={`rounded-2xl p-4 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md border ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <MessageSquare className="w-6 h-6 text-indigo-500" />
              {isStudent ? '💬 التواصل والاستفسارات مع المعلم' : 'منصة تواصل المعلم الحية (شات فوري)'}
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isStudent ? 'اسأل معلمك عن دروسك وتلقى التوجيهات الدراسية مباشرة' : 'محادثات فورية نشطة مع الطلاب وأولياء الأمور مع ردود ذكية تلقائية'}
            </p>
          </div>
          
          {!isStudent && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  autoReplyEnabled 
                    ? (isDarkMode ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500')
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>الرد التلقائي: {autoReplyEnabled ? 'مفعل 🟢' : 'معطل 🔴'}</span>
              </button>

              <button
                onClick={() => setShowNewChatModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                بدء محادثة جديدة ➕
              </button>
            </div>
          )}
        </div>

        {/* الشات الرئيسي */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md border min-h-[580px] max-h-[720px] ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* القائمة اليمنى */}
          <div className={`border-l flex flex-col ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  placeholder="البحث في المحادثات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pr-9 pl-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-slate-100 text-slate-700 border-transparent'
                  }`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredRooms.length === 0 ? (
                <p className={`text-center text-xs py-12 px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  لا توجد محادثات نشطة حالياً.
                </p>
              ) : (
                filteredRooms.map((room) => {
                  const isActive = room.id === activeRoomId;
                  const isParentChat = room.type === 'teacher-parent';

                  return (
                    <div
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-2xl text-right transition-all cursor-pointer group relative ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : (isDarkMode ? 'hover:bg-slate-800/60 bg-slate-900/50 border border-slate-800/60 text-slate-200' : 'hover:bg-slate-200/60 bg-white border border-slate-100 text-slate-800')
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                        isActive ? 'bg-white/20 text-white' : isParentChat ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {isParentChat ? <Users className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline pr-1">
                          <h4 className="text-sm font-bold truncate">{room.title}</h4>
                          <span className={`text-[9px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(room.lastMessageTime)}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-indigo-100' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                          {room.lastMessage}
                        </p>
                      </div>

                      {!isStudent && (
                        <button
                          onClick={(e) => handleDeleteRoom(room.id, e)}
                          className={`absolute left-2 bottom-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-red-500 hover:bg-slate-800'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* القسم الأيسر (عرض المحادثة) */}
          <div className={`lg:col-span-2 flex flex-col ${isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
            {activeRoomId ? (
              <>
                {(() => {
                  const currentRoom = chatRooms.find(r => r.id === activeRoomId);
                  if (!currentRoom) return null;
                  return (
                    <div className={`p-4 border-b flex items-center justify-between shadow-sm ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                          {currentRoom.title.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{currentRoom.title}</h3>
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> متصل الآن
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* منطقة الرسائل */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className={`text-center text-xs py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>لا توجد رسائل متبادلة بعد. ابدأ المحادثة الآن!</p>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUserId;

                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] rounded-2xl p-3 shadow-md ${
                            isMe 
                              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none' 
                              : (isDarkMode ? 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none')
                          }`}>
                            <div className="flex items-center justify-between gap-4 mb-1 border-b border-black/10 pb-1 text-[10px] opacity-90">
                              <span className="font-bold">{msg.senderName}</span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1 opacity-75">
                              <span className="text-[9px]">{formatTime(msg.timestamp)}</span>
                              {isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* حقل الإدخال */}
                <form onSubmit={handleSendMessage} className={`p-4 border-t flex gap-3 items-center ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="اكتب رسالتك الفورية هنا..."
                    className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-lg transition-all">
                    <Send className="w-5 h-5 transform rotate-180" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className={`p-4 rounded-full mb-3 ${isDarkMode ? 'bg-indigo-950/60 text-indigo-400' : 'bg-indigo-50 text-indigo-500'}`}>
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>منصة الرسائل الفورية المباشرة</h3>
                <p className={`text-xs mt-1 max-w-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  اختر محادثة من القائمة الجانبية لبدء التواصل الفوري.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* مودال بدء شات جديد (للمعلم فقط) */}
        {!isStudent && showNewChatModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] flex flex-col border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">اختيار طالب لبدء المحادثة</h3>
                <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  placeholder="ابحث باسم الطالب..."
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  className={`w-full pr-9 pl-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700'
                  }`}
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredStudentsForNewChat.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">لم يتم العثور على طلاب مسجلين.</p>
                ) : (
                  filteredStudentsForNewChat.map((student) => (
                    <div key={student.id} className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">الصف: {student.class}</p>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => startNewChat(student, 'teacher-student')}
                          className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-[11px] font-bold border border-blue-500/30 transition-colors"
                        >
                          شات الطالب
                        </button>
                        <button
                          onClick={() => startNewChat(student, 'teacher-parent')}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/30 transition-colors"
                        >
                          شات ولي الأمر
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Communication;