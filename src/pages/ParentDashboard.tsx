import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { StatCard, MetricCard } from '../components/Stats';
import {
  mockStudents,
  mockMessages,
  getGradesByStudentId,
  getAttendanceByStudentId,
  getBehaviorByStudentId,
} from '../data/index';
import {
  calculateAttendancePercentage,
  getGradeColor,
  getBehaviorColor,
  formatDate,
  getRelativeTime,
  BehaviorType,
} from '../lib/index';
import {
  User,
  GraduationCap,
  Calendar,
  Star,
  Mail,
  BarChart2,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

const ParentDashboard: React.FC = () => {
  // For demo purposes, we'll use the first student
  const [selectedStudent] = useState(mockStudents[0]);

  // Get student data
  const studentGrades = useMemo(
    () => getGradesByStudentId(selectedStudent.id),
    [selectedStudent.id]
  );

  const studentAttendance = useMemo(
    () => getAttendanceByStudentId(selectedStudent.id),
    [selectedStudent.id]
  );

  const studentBehavior = useMemo(
    () => getBehaviorByStudentId(selectedStudent.id),
    [selectedStudent.id]
  );

  // Calculate statistics
  const averageGrade = useMemo(() => {
    if (studentGrades.length === 0) return 0;
    const total = studentGrades.reduce((sum, grade) => sum + grade.numericValue, 0);
    return Math.round(total / studentGrades.length);
  }, [studentGrades]);

  const attendancePercentage = useMemo(
    () => calculateAttendancePercentage(studentAttendance),
    [studentAttendance]
  );

  const behaviorPoints = useMemo(() => {
    return studentBehavior.reduce((sum, behavior) => sum + (behavior.points || 0), 0);
  }, [studentBehavior]);

  // Get recent behavior notes (last 5)
  const recentBehavior = useMemo(
    () => studentBehavior.slice(0, 5),
    [studentBehavior]
  );

  // Get unread messages count
  const unreadMessagesCount = useMemo(
    () => mockMessages.filter((msg) => !msg.isRead && msg.recipientId === selectedStudent.parentId).length,
    [selectedStudent.parentId]
  );

  // Calculate grade summary by subject
  const gradeSummary = useMemo(() => {
    const subjects = Array.from(new Set(studentGrades.map((g) => g.subject)));
    return subjects.map((subject) => {
      const subjectGrades = studentGrades.filter((g) => g.subject === subject);
      const average =
        subjectGrades.reduce((sum, g) => sum + g.numericValue, 0) / subjectGrades.length;
      return {
        subject,
        average: Math.round(average),
        count: subjectGrades.length,
      };
    });
  }, [studentGrades]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم ولي الأمر</h1>
            <p className="mt-2 text-gray-600">متابعة الأداء الأكاديمي والسلوكي</p>
          </div>

          {/* Child Summary Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-6">
              {selectedStudent.avatar ? (
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.fullName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.fullName}</h2>
                <div className="flex items-center mt-2 gap-6 text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    <span>{selectedStudent.class}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <span className="text-sm">رقم الطالب: {selectedStudent.studentId}</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedStudent.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<BarChart2 className="w-6 h-6" />}
              title="متوسط درجات الابن"
              value={`${averageGrade}%`}
              variant={averageGrade >= 90 ? 'success' : averageGrade >= 70 ? 'primary' : 'warning'}
            />
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              title="نسبة الحضور"
              value={`${attendancePercentage}%`}
              variant={attendancePercentage >= 95 ? 'success' : attendancePercentage >= 85 ? 'primary' : 'warning'}
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              title="نقاط السلوك"
              value={behaviorPoints}
              variant={behaviorPoints >= 50 ? 'success' : behaviorPoints >= 0 ? 'primary' : 'danger'}
            />
          </div>

          {/* Unread Messages Alert */}
          {unreadMessagesCount > 0 && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">رسائل جديدة</h3>
                <p className="text-blue-700 text-sm">لديك {unreadMessagesCount} رسالة غير مقروءة من المعلمين</p>
              </div>
              <a href="#/communication" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                عرض الرسائل
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Behavior Notes */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  ملاحظات السلوك الأخيرة
                </h2>
              </div>

              {recentBehavior.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد ملاحظات سلوكية حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBehavior.map((behavior) => (
                    <div
                      key={behavior.id}
                      className={`p-4 rounded-lg border-r-4 ${
                        behavior.type === BehaviorType.POSITIVE
                          ? 'bg-green-50 border-green-500'
                          : behavior.type === BehaviorType.NEGATIVE
                          ? 'bg-red-50 border-red-500'
                          : 'bg-gray-50 border-gray-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{behavior.title}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                behavior.type === BehaviorType.POSITIVE
                                  ? 'bg-green-100 text-green-800'
                                  : behavior.type === BehaviorType.NEGATIVE
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {behavior.type === BehaviorType.POSITIVE
                                ? 'إيجابي'
                                : behavior.type === BehaviorType.NEGATIVE
                                ? 'سلبي'
                                : 'محايد'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-2">{behavior.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRelativeTime(behavior.date)}
                            </span>
                            {behavior.points !== undefined && behavior.points !== 0 && (
                              <span className={`flex items-center gap-1 font-medium ${behavior.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <Star className="w-3 h-3" />
                                {behavior.points > 0 ? '+' : ''}{behavior.points} نقطة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grade Summary Table */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  ملخص الدرجات حسب المادة
                </h2>
              </div>

              {gradeSummary.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد درجات مسجلة حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gradeSummary.map((summary, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">{summary.subject}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            summary.average >= 90 ? 'bg-green-500' :
                            summary.average >= 80 ? 'bg-blue-500' :
                            summary.average >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${summary.average}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold w-12 text-left ${getGradeColor(summary.average)}`}>
                        {summary.average}%
                      </span>
                      {summary.average >= 90 ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : summary.average < 70 ? (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
