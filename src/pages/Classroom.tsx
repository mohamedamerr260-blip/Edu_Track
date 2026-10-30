import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  BookOpen, 
  FileText, 
  Plus, 
  Download, 
  CheckCircle, 
  Trash2, 
  Calendar,
  Sparkles,
  Eye,
  X
} from 'lucide-react';

interface ClassroomPost {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'material' | 'announcement';
  authorName: string;
  createdAt: string;
  fileName?: string;
  fileSize?: string;
  fileDataUrl?: string; 
  completedBy?: string[]; 
}

const Classroom: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('teacher');
  const [currentUserId, setCurrentUserId] = useState<string>('user-1');
  const [currentUserName, setCurrentUserName] = useState<string>('المعلم');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('current_user') || localStorage.getItem('edu_current_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.role) setUserRole(userObj.role);
        if (userObj && userObj.id) setCurrentUserId(userObj.id);
        if (userObj && (userObj.name || userObj.firstName)) {
          setCurrentUserName(userObj.name || `${userObj.firstName} ${userObj.lastName || ''}`);
        }
      }
    } catch (e) {
      console.error("Error reading role", e);
    }
  }, []);

  const isStudent = userRole === 'student' || userRole === 'STUDENT';

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('edu_theme');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('edu_theme');
      if (saved !== null) setIsDarkMode(JSON.parse(saved));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const [posts, setPosts] = useState<ClassroomPost[]>(() => {
    const saved = localStorage.getItem('edu_classroom_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: 'post-1',
        title: 'ملخص وحدة البرمجة وتطوير الويب',
        description: 'أبنائنا الطلاب، تجدون في المرفق أدناه الملخص الشامل للوحدة الأولى يرجى قراءتها جيداً.',
        type: 'material',
        authorName: 'المعلم الأساسي',
        createdAt: 'منذ يومين',
        fileName: 'Programming_Summary.pdf',
        fileSize: '2.4 MB'
      }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'assignment' | 'material' | 'announcement'>('assignment');
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileSize, setNewFileSize] = useState('');

  // حالة معاينة الملف
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setNewFileSize(sizeMb);

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newPost: ClassroomPost = {
      id: `post-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      type: newType,
      authorName: currentUserName,
      createdAt: 'الآن',
      fileName: newFileName.trim() ? newFileName.trim() : undefined,
      fileSize: newFileSize ? newFileSize : (newFileName ? '1.2 MB' : undefined),
      fileDataUrl: newFileUrl ? newFileUrl : undefined,
      completedBy: []
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('edu_classroom_posts', JSON.stringify(updated));

    setNewTitle('');
    setNewDesc('');
    setNewFileName('');
    setNewFileUrl('');
    setNewFileSize('');
    setShowAddModal(false);
  };

  const handleDeletePost = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('edu_classroom_posts', JSON.stringify(updated));
  };

  const toggleCompleteAssignment = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const completedList = p.completedBy || [];
        const isAlreadyDone = completedList.includes(currentUserId);
        const newCompletedList = isAlreadyDone 
          ? completedList.filter(id => id !== currentUserId)
          : [...completedList, currentUserId];
        return { ...p, completedBy: newCompletedList };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('edu_classroom_posts', JSON.stringify(updated));
  };

  const handleDownloadFile = (post: ClassroomPost) => {
    if (post.fileDataUrl) {
      const link = document.createElement('a');
      link.href = post.fileDataUrl;
      link.download = post.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`الملف الافتراضي غير متوفر للتحميل المباشر حالياً.`);
    }
  };

  const handlePreviewFile = (post: ClassroomPost) => {
    if (post.fileDataUrl) {
      setPreviewFile({ name: post.fileName || 'معاينة الملف', url: post.fileDataUrl });
    } else {
      alert(`عذراً، الملف الافتراضي لا يدعم المعاينة المباشرة.`);
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen p-4 md:p-6 text-right ${isDarkMode ? 'text-white' : 'text-slate-900'}`} dir="rtl">
        
        {/* الهيدر العلوي لصفحة الفصل */}
        <div className={`rounded-2xl p-6 shadow-xl mb-8 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md border ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-500" />
              ساحة الفصل الذكي (Classroom)
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isStudent ? 'تابع الواجبات والملفات التعليمية التي يشاركها معلمك أول بأول' : 'شارك الواجبات، الملفات، والإعلانات لجميع الطلاب في مكان واحد'}
            </p>
          </div>

          {!isStudent && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              إضافة واجب أو ملف جديد ➕
            </button>
          )}
        </div>

        {/* قائمة المنشورات */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <p>لا توجد منشورات أو واجبات حالياً في ساحة الفصل.</p>
            </div>
          ) : (
            posts.map((post) => {
              const isCompleted = post.completedBy?.includes(currentUserId);

              return (
                <div 
                  key={post.id}
                  className={`rounded-2xl p-6 shadow-xl border backdrop-blur-md transition-all ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl font-bold text-white shadow-md ${
                        post.type === 'assignment' ? 'bg-purple-600' : post.type === 'material' ? 'bg-blue-600' : 'bg-amber-600'
                      }`}>
                        {post.type === 'assignment' ? <FileText className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          post.type === 'assignment' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {post.type === 'assignment' ? '📝 واجب دراسي' : post.type === 'material' ? '📁 ملف تعليمي' : '📢 إعلان'}
                        </span>
                        <h3 className="text-lg font-bold mt-1">{post.title}</h3>
                      </div>
                    </div>

                    {!isStudent && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-2"
                        title="حذف المنشور"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {post.description}
                  </p>

                  {post.fileName && (
                    <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border mb-4 ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-xs font-bold">{post.fileName}</p>
                          <p className="text-[10px] text-slate-400">{post.fileSize || 'ملف مرفق'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {post.fileDataUrl && (
                          <button 
                            onClick={() => handlePreviewFile(post)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            عرض مباشر 👁️
                          </button>
                        )}
                        <button 
                          onClick={() => handleDownloadFile(post)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تحميل 📥
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {post.authorName} • {post.createdAt}
                    </span>

                    {isStudent && post.type === 'assignment' && (
                      <button
                        onClick={() => toggleCompleteAssignment(post.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isCompleted 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isCompleted ? 'تم إنجاز الواجب ✅' : 'تحديد كمنجز'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* مودال معاينة الملف (يغطي الشاشة بالكامل فوق القائمة الجانبية والهيدر مع بلور قوي) */}
        {previewFile && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[9999] p-4 md:p-8">
            <div className={`rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col border ${
              isDarkMode ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  {previewFile.name}
                </h3>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                  title="إغلاق المعاينة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-hidden flex items-center justify-center bg-black/40">
                {previewFile.url.startsWith('data:image/') ? (
                  <img src={previewFile.url} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
                ) : (
                  <iframe src={previewFile.url} title="PDF Preview" className="w-full h-full rounded-xl border border-slate-700 bg-white" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* مودال إضافة منشور جديد (للمعلم) */}
        {!isStudent && showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[9999] p-4">
            <div className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 border ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <h3 className="text-xl font-bold mb-4">نشر واجب أو ملف لجميع الطلاب</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">نوع المنشور</label>
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value as any)}
                    className={`w-full p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="assignment">📝 واجب دراسي</option>
                    <option value="material">📁 ملف تعليمي / ملخص</option>
                    <option value="announcement">📢 إعلان عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">عنوان المنشور</label>
                  <input 
                    type="text" 
                    required
                    placeholder="مثال: واجب الدرس الثاني..."
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">التفاصيل والشرح</label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="اكتب تفاصيل الواجب أو التعليمات للطلاب..."
                    value={newDesc} 
                    onChange={(e) => setNewDesc(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">إرفاق ملف حقيقي (PDF، صور، مستندات)</label>
                  <input 
                    type="file" 
                    accept=".pdf,image/*,.doc,.docx"
                    onChange={handleFileChange}
                    className={`w-full p-2 rounded-xl border text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  />
                  {newFileName && (
                    <p className="text-[11px] text-emerald-400 mt-1">تم اختيار الملف: {newFileName}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all">نشر للكل 🚀</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 font-semibold py-3 rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Classroom;