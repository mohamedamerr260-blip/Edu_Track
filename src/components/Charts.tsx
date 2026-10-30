import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Grade, Attendance, AttendanceStatus } from '../lib/index';

// Colors for charts
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

const PIE_COLORS = [COLORS.success, COLORS.danger, COLORS.warning, COLORS.info];

// Performance Line Chart - Student grades over months
interface PerformanceData {
  month: string;
  average: number;
}

interface PerformanceLineChartProps {
  data: PerformanceData[];
  height?: number;
}

export const PerformanceLineChart: React.FC<PerformanceLineChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="month"
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
        />
        <YAxis
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'Cairo, sans-serif',
          }}
          labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '14px' }}
        />
        <Line
          type="monotone"
          dataKey="average"
          stroke={COLORS.primary}
          strokeWidth={3}
          dot={{ fill: COLORS.primary, r: 5 }}
          activeDot={{ r: 7 }}
          name="المعدل"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Grades Bar Chart - Subjects comparison
interface SubjectGrade {
  subject: string;
  grade: number;
}

interface GradesBarChartProps {
  data: SubjectGrade[];
  height?: number;
}

export const GradesBarChart: React.FC<GradesBarChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="subject"
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
        />
        <YAxis
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'Cairo, sans-serif',
          }}
          labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '14px' }}
        />
        <Bar dataKey="grade" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="الدرجة">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.grade >= 90
                  ? COLORS.success
                  : entry.grade >= 80
                  ? COLORS.primary
                  : entry.grade >= 70
                  ? COLORS.warning
                  : COLORS.danger
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Attendance Pie Chart - Present/Absent/Late
interface AttendanceData {
  name: string;
  value: number;
  color: string;
}

interface AttendancePieChartProps {
  data: AttendanceData[];
  height?: number;
}

export const AttendancePieChart: React.FC<AttendancePieChartProps> = ({
  data,
  height = 300,
}) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'Cairo, sans-serif' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'Cairo, sans-serif',
          }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '14px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Subject Radar Chart - Student strengths/weaknesses
interface SubjectStrength {
  subject: string;
  score: number;
  fullMark: number;
}

interface SubjectRadarChartProps {
  data: SubjectStrength[];
  height?: number;
}

export const SubjectRadarChart: React.FC<SubjectRadarChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="subject"
          style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          style={{ fontSize: '10px', fontFamily: 'Cairo, sans-serif' }}
        />
        <Radar
          name="الدرجة"
          dataKey="score"
          stroke={COLORS.primary}
          fill={COLORS.primary}
          fillOpacity={0.6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'Cairo, sans-serif',
          }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '14px' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// Ranking Bar Chart - Students comparison
interface StudentRankingData {
  name: string;
  gpa: number;
  rank: number;
}

interface RankingBarChartProps {
  data: StudentRankingData[];
  height?: number;
}

export const RankingBarChart: React.FC<RankingBarChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          type="number"
          domain={[0, 4]}
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#6B7280"
          style={{ fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontFamily: 'Cairo, sans-serif',
          }}
          labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '14px' }}
        />
        <Bar dataKey="gpa" fill={COLORS.primary} radius={[0, 8, 8, 0]} name="المعدل">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.rank === 1
                  ? COLORS.success
                  : entry.rank === 2
                  ? COLORS.primary
                  : entry.rank === 3
                  ? COLORS.warning
                  : COLORS.info
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Helper function to prepare attendance data for pie chart
export const prepareAttendanceData = (attendance: Attendance[]): AttendanceData[] => {
  const present = attendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
  const absent = attendance.filter(a => a.status === AttendanceStatus.ABSENT).length;
  const late = attendance.filter(a => a.status === AttendanceStatus.LATE).length;
  const excused = attendance.filter(a => a.status === AttendanceStatus.EXCUSED).length;

  return [
    { name: 'حاضر', value: present, color: COLORS.success },
    { name: 'غائب', value: absent, color: COLORS.danger },
    { name: 'متأخر', value: late, color: COLORS.warning },
    { name: 'غياب بعذر', value: excused, color: COLORS.info },
  ].filter(item => item.value > 0);
};

// Helper function to prepare grades data for bar chart
export const prepareGradesData = (grades: Grade[]): SubjectGrade[] => {
  const subjectGrades: { [key: string]: number[] } = {};

  grades.forEach(grade => {
    if (!subjectGrades[grade.subject]) {
      subjectGrades[grade.subject] = [];
    }
    subjectGrades[grade.subject].push(grade.numericValue);
  });

  return Object.entries(subjectGrades).map(([subject, gradesList]) => ({
    subject,
    grade: Math.round(gradesList.reduce((sum, g) => sum + g, 0) / gradesList.length),
  }));
};

// Helper function to prepare performance data for line chart
export const preparePerformanceData = (grades: Grade[]): PerformanceData[] => {
  const monthlyGrades: { [key: string]: number[] } = {};

  grades.forEach(grade => {
    const month = new Date(grade.gradedDate).toLocaleDateString('ar-EG', {
      month: 'short',
      year: 'numeric',
    });
    if (!monthlyGrades[month]) {
      monthlyGrades[month] = [];
    }
    monthlyGrades[month].push(grade.numericValue);
  });

  return Object.entries(monthlyGrades)
    .map(([month, gradesList]) => ({
      month,
      average: Math.round(gradesList.reduce((sum, g) => sum + g, 0) / gradesList.length),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
};

// Helper function to prepare radar chart data
export const prepareRadarData = (grades: Grade[]): SubjectStrength[] => {
  const subjectGrades: { [key: string]: number[] } = {};

  grades.forEach(grade => {
    if (!subjectGrades[grade.subject]) {
      subjectGrades[grade.subject] = [];
    }
    subjectGrades[grade.subject].push(grade.numericValue);
  });

  return Object.entries(subjectGrades).map(([subject, gradesList]) => ({
    subject,
    score: Math.round(gradesList.reduce((sum, g) => sum + g, 0) / gradesList.length),
    fullMark: 100,
  }));
};
