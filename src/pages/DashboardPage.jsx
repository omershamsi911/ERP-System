import React, { useEffect, useState, useMemo } from "react";
import { useFees } from "../hooks/useFees";
import { useAttendance } from "../hooks/useAttendance";
import { useStudents } from "../hooks/useStudents";
import { 
  FaUserGraduate, 
  FaMoneyBillWave, 
  FaClock, 
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaBell,
  FaBirthdayCake,
  FaTrophy,
  FaChartBar,
  FaGraduationCap,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { 
  FiUserPlus, 
  FiDollarSign, 
  FiCalendar, 
  FiBarChart2,
  FiArrowUpRight,
  FiGift,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity
} from "react-icons/fi";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { Link } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend,
  ComposedChart, ReferenceLine, Label
} from 'recharts';
import moment from "moment";
import {motion} from "framer-motion";

// Advanced Stats Card with real-time updates
const AdvancedStatsCard = ({ title, value, icon, color, subtitle, trend, isLoading, onClick }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    if (!isLoading && value !== undefined) {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          current = value;
          clearInterval(timer);
        }
        setAnimatedValue(Math.floor(current));
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [value, isLoading]);

  return (
    <div 
      className={`relative bg-white rounded-3xl shadow-xl p-6 border-l-4 ${color} transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group overflow-hidden`}
      onClick={onClick}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {title === "Fee Collection Rate" || title === "Attendance Rate" ? (isLoading ? (
  <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
) : (
  `${animatedValue.toLocaleString()}%`
)) : (isLoading ? (
  <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
) : (
  animatedValue.toLocaleString()
)
)}

            </h3>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-2xl bg-opacity-10 ${color.replace('border-l-4 border-', 'bg-')}`}>
            {React.cloneElement(icon, { className: `text-2xl ${color.replace('border-l-4 border-', 'text-')}` })}
          </div>
        </div>
        
        {trend !== null && (
          <div className="flex items-center justify-between">
            <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {trend > 0 ? <FiTrendingUp className="mr-1" /> : trend < 0 ? <FiTrendingDown className="mr-1" /> : null}
              {trend !== 0 ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : 'No change'}
            </div>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        )}
      </div>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const FeeCollectionChart = () => {
  // Use your custom fees hook
  const { fees, loading, fetchFees } = useFees();

  // Fetch fees on mount
  useEffect(() => {
    fetchFees(); // You can pass filters here if needed
  }, [fetchFees]);

  // Process data for chart
  const chartData = useMemo(() => {
    if (!fees || fees.length === 0) return [];

    // Initialize last 12 months keys with format 'MMM YY'
    const monthlyData = {};
    for (let i = 11; i >= 0; i--) {
      const month = moment().subtract(i, 'months');
      const key = month.format('MMM YY');
      monthlyData[key] = {
        month: key,
        collected: 0,
        pending: 0,
        overdue: 0,
        total: 0,
      };
    }

    fees.forEach(fee => {
      // Use due_date or created_at as reference date
      const feeDate = fee.due_date ? moment(fee.due_date) : moment(fee.created_at);
      const monthKey = feeDate.format('MMM YY');

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].total += fee.final_amount;

        if (fee.status === 'paid') {
          monthlyData[monthKey].collected += fee.final_amount;
        } else if (fee.status === 'unpaid') {
          const isOverdue = moment().isAfter(moment(fee.due_date));
          if (isOverdue) {
            monthlyData[monthKey].overdue += fee.final_amount;
          } else {
            monthlyData[monthKey].pending += fee.final_amount;
          }
        }
      }
    });

    return Object.values(monthlyData);
  }, [fees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            formatter={value => [`Rs${value.toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="collected" stackId="1" stroke="#10B981" fill="url(#collectedGradient)" name="Collected" />
          <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="url(#pendingGradient)" name="Pending" />
          <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
          <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} name="Total" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
const COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#64748B', '#84CC16'
];
// Real-time Attendance Analytics
const AttendanceAnalytics = ({ students }) => {
  const { attendance, loading, error, fetchAttendance } = useAttendance();
   const [showLegend, setShowLegend] = useState(true);
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const processedData = useMemo(() => {
    if (!attendance || !students || attendance.length === 0) {
      return { weekly: [], classWise: [], classNames: [] };
    }

    // Get current week boundaries (Monday to Sunday)
    const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
    const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
    
    const currentWeekAttendance = attendance.filter(record => 
      moment(record.attendance_date).isBetween(startOfWeek, endOfWeek, 'day', '[]')
    );

    // === Weekly Attendance ===
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let weeklyAttendance = [];

    for (let i = 0; i < 7; i++) {
      const date = moment().startOf('week').add(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');
      const dayName = weekDays[i];

      const dayAttendance = currentWeekAttendance.filter(
        record => moment(record.attendance_date).format('YYYY-MM-DD') === dateStr
      );

      const present = dayAttendance.filter(r => r.status === 'present').length;
      const absent = dayAttendance.filter(r => r.status === 'absent').length;
      const late = dayAttendance.filter(r => r.status === 'late').length;
      const total = dayAttendance.length;

      weeklyAttendance.push({
        day: dayName,
        date: date.format('MMM DD'),
        present,
        absent,
        late,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    }

    // === Class-wise Weekly Attendance ===
    const classNames = [...new Set(students.map(s => s.class || 'Unassigned'))].sort();
    
    // Create class-wise data for each day
    const classWiseData = weekDays.map(day => {
      const dayData = { day };
      
      classNames.forEach(className => {
        const classStudents = students.filter(s => s.class === className);
        
        // Get attendance for this day
        const dayIndex = weekDays.indexOf(day);
        const targetDate = moment().startOf('week').add(dayIndex, 'days').format('YYYY-MM-DD');
        
        const dayAttendance = currentWeekAttendance.filter(record => 
          moment(record.attendance_date).format('YYYY-MM-DD') === targetDate
        );
        
        // Filter attendance for students in this class
        const classAttendance = dayAttendance.filter(record => {
          const student = students.find(s => s.id === record.student_id);
          return student && student.class === className;
        });
        
        const present = classAttendance.filter(r => r.status === 'present').length;
        const total = classAttendance.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        dayData[className] = percentage;
      });
      
      return dayData;
    });

    return { 
      weekly: weeklyAttendance, 
      classWise: classWiseData,
      classNames 
    };
  }, [attendance, students]);

  // Define colors for different classes
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">Error: {error}</div>;
  }

  // Custom tooltip for weekly attendance
  const WeeklyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">{data.date} ({label})</p>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <p className="text-sm">Present: <span className="font-semibold">{data.present}</span></p>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <p className="text-sm">Late: <span className="font-semibold">{data.late}</span></p>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <p className="text-sm">Absent: <span className="font-semibold">{data.absent}</span></p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-indigo-600 font-bold">
              {data.percentage}% Attendance
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for class-wise chart
  const ClassWiseTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-3">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <p className="text-sm">
                  Class {entry.dataKey}: <span className="font-semibold">{entry.value}%</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Weekly Attendance Analytics
        </h3>
        <p className="text-gray-600 mt-1">
          {moment().startOf('week').format('MMM DD')} - {moment().endOf('week').format('MMM DD')}
        </p>
      </div>

      {/* Weekly Attendance Trend */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-800">School-wide Weekly Attendance</h4>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-sm">Late</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm">Absent</span>
            </div>
          </div>
        </div>
        
        <div className="h-72 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={processedData.weekly}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12, fontWeight: 500 }}
                tickMargin={10}
                axisLine={false}
              />
              
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              >
                <Label 
                  value="Attendance %" 
                  angle={-90} 
                  position="insideLeft" 
                  offset={-5}
                  style={{ textAnchor: 'middle', fontSize: 12 }}
                />
              </YAxis>
              
              <Tooltip content={<WeeklyTooltip />} />
              
              <Area
                type="monotone"
                dataKey="percentage"
                name="Attendance %"
                stroke="#10B981"
                fill="url(#colorPresent)"
                strokeWidth={2}
                activeDot={{ r: 6, fill: '#fff', stroke: '#10B981', strokeWidth: 2 }}
              />
              
              <ReferenceLine 
                y={80} 
                stroke="#F59E0B" 
                strokeDasharray="3 3" 
                strokeWidth={1.5}
              >
                <Label 
                  value="Target" 
                  position="insideTopRight" 
                  fill="#F59E0B"
                  fontSize={10}
                />
              </ReferenceLine>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class-wise Weekly Attendance */}
 (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h4 className="text-xl font-bold text-gray-800 tracking-tight">
          📈 Class-wise Weekly Attendance
        </h4>
        <div className="text-sm text-gray-500 mt-2 sm:mt-0">
          Showing <span className="font-semibold text-gray-700">{processedData.classNames.length}</span> classes
        </div>
      </div>

      {/* Chart Wrapper */}
      <div className="relative overflow-x-auto pb-6 -mx-4 group">
        {/* Scroll Indicator */}
        <div className="absolute right-2 top-2 bg-gradient-to-l from-white via-white/90 to-transparent h-6 w-12 z-20 hidden group-hover:block"></div>

        <div className="min-w-[950px] h-96 mx-4 rounded-3xl p-6 border border-amber-200 bg-white/70 backdrop-blur-md shadow-xl relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-25 -translate-x-1/2 -translate-y-1/2 z-0"></div>
          <div className="absolute bottom-0 right-0 w-36 h-36 bg-amber-200 rounded-full blur-2xl opacity-20 translate-x-1/3 translate-y-1/3 z-0"></div>

          <div className="relative z-10 w-full h-full">
            {processedData.classWise.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 italic">No class attendance data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData.classWise}
                  margin={{ top: 20, right: 30, left: 10, bottom: showLegend ? 70 : 30 }}
                  barGap={4}
                  barCategoryGap={12}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 13, fill: "#6b7280" }}
                    tickMargin={10}
                    axisLine={{ stroke: "#d1d5db" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 13, fill: "#6b7280" }}
                    tickFormatter={(value) => `${value}%`}
                    axisLine={{ stroke: "#d1d5db" }}
                  >
                    <Label
                      value="Attendance %"
                      angle={-90}
                      position="insideLeft"
                      offset={-5}
                      style={{ textAnchor: 'middle', fontSize: 12, fill: "#6b7280" }}
                    />
                  </YAxis>
                  <Tooltip content={<ClassWiseTooltip />} />
                  {processedData.classNames.map((className, index) => (
                    <Bar
                      key={className}
                      dataKey={className}
                      name={className}
                      fill={COLORS[index % COLORS.length]}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={20}
                      isAnimationActive={true}
                    >
                      {/* Animate on load using framer-motion */}
                      <motion.rect
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </Bar>
                  ))}
                  {showLegend && (
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      wrapperStyle={{ paddingTop: '10px' }}
                      content={({ payload }) => (
                        <div className="flex flex-wrap justify-center gap-2 px-4 pt-2 overflow-x-auto max-w-full">
                          {payload.map((entry, index) => (
                            <div
                              key={`legend-${index}`}
                              className="flex items-center text-xs text-gray-700 bg-white/80 border border-gray-200 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm whitespace-nowrap hover:bg-gray-100 transition"
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full mr-2"
                                style={{ backgroundColor: entry.color }}
                              ></div>
                              Class {entry.value}
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Legend Button */}
      {processedData.classNames.length > 6 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition"
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
        </div>
      )}
    </div>

    </div>
  );
};

// Real-time Birthday Alerts
const BirthdayAlerts = ({ students, loading }) => {
  const { todayBirthdays, upcomingBirthdays } = useMemo(() => {
    if (!students || students.length === 0) return { todayBirthdays: [], upcomingBirthdays: [] };
    
    const today = moment();
    
    const todayBirthdays = students.filter(student => {
      if (!student.dateOfBirth && !student.dob) return false;
      const dob = moment(student.dateOfBirth || student.dob);
      return dob.date() === today.date() && dob.month() === today.month();
    });
    
    const upcomingBirthdays = students.filter(student => {
      if (!student.dateOfBirth && !student.dob) return false;
      const dob = moment(student.dateOfBirth || student.dob);
      const nextBirthday = dob.clone().year(today.year());
      if (nextBirthday.isBefore(today)) {
        nextBirthday.add(1, 'year');
      }
      const diffDays = nextBirthday.diff(today, 'days');
      return diffDays > 0 && diffDays <= 7;
    }).sort((a, b) => {
      const dobA = moment(a.dateOfBirth || a.dob);
      const dobB = moment(b.dateOfBirth || b.dob);
      return dobA.date() - dobB.date();
    });
    
    return { todayBirthdays, upcomingBirthdays };
  }, [students]);

  const totalAlerts = todayBirthdays.length + upcomingBirthdays.length;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (totalAlerts === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg p-6 border border-purple-100">
        <div className="text-center py-8">
          <FaBirthdayCake className="mx-auto text-4xl text-purple-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Birthdays This Week</h3>
          <p className="text-gray-500">Check back soon for upcoming celebrations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center text-gray-800">
          <FaBirthdayCake className="text-pink-500 mr-3 text-2xl" /> 
          Birthday Celebrations
        </h3>
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full font-medium">
          {totalAlerts} alert{totalAlerts > 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-6">
        {todayBirthdays.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-pink-500 text-white p-2 rounded-lg mr-3">
                <FiGift className="text-lg" />
              </div>
              <div>
                <h4 className="font-semibold text-pink-800">Today's Birthdays</h4>
                <p className="text-sm text-pink-600">Celebrate with them!</p>
              </div>
            </div>
            <div className="grid gap-3">
              {todayBirthdays.map(student => (
                <div key={student.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-pink-500">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                      <FaUserGraduate className="text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800">{student.name}</h5>
                      <p className="text-sm text-gray-500">
                        {student.class ? `Class ${student.class}` : 'Class Not Assigned'}
                        {student.section ? ` - ${student.section}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        🎉 Today
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {upcomingBirthdays.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 text-white p-2 rounded-lg mr-3">
                <FaCalendarAlt className="text-lg" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-800">Upcoming Birthdays</h4>
                <p className="text-sm text-purple-600">Next 7 days</p>
              </div>
            </div>
            <div className="grid gap-3">
              {upcomingBirthdays.map(student => {
                const dob = moment(student.dateOfBirth || student.dob);
                const today = moment();
                const nextBirthday = dob.clone().year(today.year());
                if (nextBirthday.isBefore(today)) {
                  nextBirthday.add(1, 'year');
                }
                const diffDays = nextBirthday.diff(today, 'days');
                
                return (
                  <div key={student.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                        <FaUserGraduate className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800">{student.name}</h5>
                        <p className="text-sm text-gray-500">
                          {student.class ? `Class ${student.class}` : 'Class Not Assigned'}
                          {student.section ? ` - ${student.section}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                          {nextBirthday.format('MMM D')}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {diffDays} day{diffDays > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Student Performance Analytics
const StudentPerformanceAnalytics = ({ students, fees, attendance, loading }) => {
  const performanceData = useMemo(() => {
    if (!students || !fees || !attendance || students.length === 0) return [];
    
    const classPerformance = {};
    
    students.forEach(student => {
      const className = student.class || 'Unassigned';
      if (!classPerformance[className]) {
        classPerformance[className] = {
          class: className,
          totalStudents: 0,
          activeStudents: 0,
          feeCollection: 0,
          attendanceRate: 0,
        };
      }
      
      classPerformance[className].totalStudents++;
      if (student.status === 'active') {
        classPerformance[className].activeStudents++;
      }
      
      // FIXED: Corrected fee filtering
      const studentFees = fees.filter(fee => fee.student_id === student.id);
      const paidFees = studentFees.filter(fee => fee.status === 'paid');
      const feeRate = studentFees.length > 0 ? (paidFees.length / studentFees.length) * 100 : 0;
      classPerformance[className].feeCollection += feeRate;
      
      // FIXED: Corrected attendance filtering and date field
      const studentAttendance = attendance.filter(record => 
        record.student_id === student.id && 
        moment(record.attendance_date).isAfter(moment().subtract(30, 'days'))
      );
      const presentCount = studentAttendance.filter(record => record.status === 'present').length;
      const attendanceRate = studentAttendance.length > 0 ? (presentCount / studentAttendance.length) * 100 : 0;
      classPerformance[className].attendanceRate += attendanceRate;
    });
    
    // Calculate averages and performance score
    return Object.values(classPerformance).map(classData => {
      const feeCollection = Math.round(classData.feeCollection / classData.totalStudents);
      const attendanceRate = Math.round(classData.attendanceRate / classData.totalStudents);
      
      return {
        ...classData,
        feeCollection,
        attendanceRate,
        // FIXED: Correct performance score calculation
        performanceScore: Math.round((feeCollection + attendanceRate) / 2)
      };
    });
  }, [students, fees, attendance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
          <XAxis dataKey="class" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [`${value}${name.includes('Rate') || name.includes('Score') ? '%' : ''}`, name]}
          />
          <Legend />
          <Bar dataKey="attendanceRate" fill="#10B981" name="Attendance Rate" radius={[4, 4, 0, 0]} />
          <Bar dataKey="feeCollection" fill="#6366F1" name="Fee Collection" radius={[4, 4, 0, 0]} />
          <Bar dataKey="performanceScore" fill="#F59E0B" name="Performance Score" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    students: [],
    fees: [],
    attendance: [],
    loading: true,
    error: null
  });

  const { fetchStudents } = useStudents();
  const { fetchFees } = useFees();
  const { getAttendanceReport, fetchAttendance } = useAttendance();

  // Real-time stats calculation
  const stats = useMemo(() => {
    const { students, fees, attendance } = dashboardData;
    
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalFees = fees.reduce((total, fee) => total + (fee.final_amount), 0);
    const collectedFees = fees.filter(f => f.status === 'paid').reduce((total, fee) => total + (fee.final_amount), 0);
    ("Main collected hoon", totalFees)
    // const pendingFeesArray = fees.filter(f => f.status === 'unpaid');
    // let pendingFees = 0;
    // for(let i = 0; i < pendingFeesArray.length; i++) {
    //   pendingFees += pendingFeesArray[i].final_amount;
    // }
    // ("main fee hoon", fees)
    const pendingFees = fees
  .filter(f => f.status === 'unpaid')
  .reduce((total, fee) => total + fee.final_amount, 0);


    const overdueFees = fees.filter(f => f.status === 'unpaid' && moment().isAfter(moment(f.dueDate))).reduce((total, fee) => total + (fee.final_amount), 0);
    ("main overdue hoon", overdueFees)

    // Calculate attendance rate for last 30 days
    const recentAttendance = attendance.filter(record => 
      moment(record.date).isAfter(moment().subtract(30, 'days'))
    );
    const presentCount = recentAttendance.filter(record => record.status === 'present').length;
    const attendanceRate = recentAttendance.length > 0 ? Math.round((presentCount / recentAttendance.length) * 100) : 0;
    ("funny", attendance)
    
    // Calculate collection rate
    const collectionRate = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;
    
    return {
      totalStudents,
      activeStudents,
      pendingFees,
      overdueFees,
      collectedFees,
      collectionRate,
      attendanceRate,
      totalFees
    };
  }, [dashboardData]);

  const fetchAllData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      const [studentsData, feesData, attendanceData] = await Promise.all([
        fetchStudents(),
        fetchFees(),
        fetchAttendance()
      ]);
      ("bkc", attendanceData)
      setDashboardData({
        students: studentsData || [],
        fees: feesData || [],
        attendance: attendanceData,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      }));
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAllData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const currentDateTime = getCurrentDateTime();

  if (dashboardData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <FaExclamationTriangle className="mx-auto text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{dashboardData.error}</p>
          <button
            onClick={fetchAllData}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      {/* Advanced Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center mb-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl mr-4">
                  <FiActivity className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Dashboard
                  </h1>
                  <p className="text-gray-500 flex items-center text-sm">
                    <FaCalendarAlt className="mr-2" />
                    {currentDateTime.date} • {currentDateTime.time}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              
              
              <button
                onClick={fetchAllData}
                disabled={dashboardData.loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className={`${dashboardData.loading ? 'animate-spin' : ''}`}>
                  <FiActivity />
                </div>
                <span className="font-semibold">
                  {dashboardData.loading ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Advanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdvancedStatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<FaUsers />}
            color="border-blue-500"
            subtitle={`${stats.activeStudents} active`}
            trend={2.4}
            isLoading={dashboardData.loading}
            onClick={() => window.location.href = '/students'}
          />
          
          <AdvancedStatsCard
            title="Fee Collection Rate"
           value={stats.collectionRate}

            icon={<FaCheckCircle />}
            color="border-green-500"
            subtitle={`Rs ${stats.collectedFees} collected`}
            trend={5.2}
            isLoading={dashboardData.loading}
            onClick={() => window.location.href = '/fees'}
          />
          
          <AdvancedStatsCard
            title="Pending Fees"
            value={Math.round(stats.pendingFees)}
            icon={<FaMoneyBillWave />}
            color="border-yellow-500"
            subtitle={`Rs ${stats.overdueFees} overdue`}
            trend={-3.1}
            isLoading={dashboardData.loading}
            onClick={() => window.location.href = '/fees?filter=pending'}
          />
          
          <AdvancedStatsCard
            title="Attendance Rate"
            value={stats.attendanceRate}
            icon={<FaClock />}
            color="border-purple-500"
            subtitle="Last 30 days"
            trend={1.8}
            isLoading={dashboardData.loading}
            onClick={() => window.location.href = '/attendance'}
          />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Fee Collection Analytics */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FiDollarSign className="text-green-500 mr-3 text-3xl" />
                    Fee Collection Analytics
                  </h3>
                  <p className="text-gray-500 mt-1">Real-time collection trends and patterns</p>
                </div>
                <Link
                  to="/fees"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <FiArrowUpRight />
                  <span>View Details</span>
                </Link>
              </div>
              <FeeCollectionChart fees={dashboardData.fees} loading={dashboardData.loading} />
            </div>

            {/* Attendance Analytics */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaChartLine className="text-blue-500 mr-3 text-3xl" />
                    Attendance Analytics
                  </h3>
                  <p className="text-gray-500 mt-1">Daily trends and class-wise performance</p>
                </div>
                <Link
                  to="/attendance"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <FiArrowUpRight />
                  <span>View Details</span>
                </Link>
              </div>
              <AttendanceAnalytics 
                attendanceData={dashboardData.attendance} 
                students={dashboardData.students} 
                loading={dashboardData.loading} 
              />
            </div>
          </div>

          {/* Right Column - Quick Actions and Alerts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/students/add"
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="text-center">
                    <div className="bg-blue-500 text-white p-3 rounded-xl mx-auto mb-3 w-fit group-hover:bg-blue-600 transition-colors">
                      <FiUserPlus className="text-xl" />
                    </div>
                    <span className="font-semibold text-blue-800">Add Student</span>
                  </div>
                </Link>

                <Link
                  to="/fees"
                  className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="text-center">
                    <div className="bg-green-500 text-white p-3 rounded-xl mx-auto mb-3 w-fit group-hover:bg-green-600 transition-colors">
                      <FiDollarSign className="text-xl" />
                    </div>
                    <span className="font-semibold text-green-800">Collect Fee</span>
                  </div>
                </Link>

                <Link
                  to="/attendance"
                  className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="text-center">
                    <div className="bg-purple-500 text-white p-3 rounded-xl mx-auto mb-3 w-fit group-hover:bg-purple-600 transition-colors">
                      <FiCalendar className="text-xl" />
                    </div>
                    <span className="font-semibold text-purple-800">Mark Attendance</span>
                  </div>
                </Link>

                <Link
                  to="/reports"
                  className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="text-center">
                    <div className="bg-orange-500 text-white p-3 rounded-xl mx-auto mb-3 w-fit group-hover:bg-orange-600 transition-colors">
                      <FiBarChart2 className="text-xl" />
                    </div>
                    <span className="font-semibold text-orange-800">View Reports</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Student Distribution */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Student Distribution</h3>
              {dashboardData.loading ? (
                <div className="flex items-center justify-center h-48">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <StudentDistributionChart students={dashboardData.students} />
              )}
            </div>

            {/* Birthday Alerts */}
            <BirthdayAlerts students={dashboardData.students} loading={dashboardData.loading} />
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="mt-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-200/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaTrophy className="text-yellow-500 mr-3 text-3xl" />
                  Class Performance Analytics
                </h3>
                <p className="text-gray-500 mt-1">Comprehensive performance metrics across all classes</p>
              </div>
              <Link
                to="/students"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2"
              >
                <FiArrowUpRight />
                <span>Detailed Analysis</span>
              </Link>
            </div>
            <StudentPerformanceAnalytics 
              students={dashboardData.students} 
              fees={dashboardData.fees}
              attendance={dashboardData.attendance}
              loading={dashboardData.loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Student Distribution Chart Component
const StudentDistributionChart = ({ students }) => {
  const distributionData = useMemo(() => {
    if (!students || students.length === 0) return [];

    const classDistribution = {};
    students.forEach(student => {
      const className = student.class || 'Unassigned';
      classDistribution[className] = (classDistribution[className] || 0) + 1;
    });

    const colors = [
      '#6366F1', '#10B981', '#F59E0B',
      '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899',
    ];

    return Object.entries(classDistribution).map(([className, count], index) => ({
      name: className,
      value: count,
      color: colors[index % colors.length],
    }));
  }, [students]);

  if (distributionData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaUsers className="mx-auto text-4xl text-gray-300 mb-4" />
        <p>No student data available</p>
      </div>
    );
  }

  return (
    <div className="h-auto p-4  rounded-lg bg-white shadow-sm">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} students`, name]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 max-h-32 overflow-y-auto px-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {distributionData.map((entry, index) => (
            <div
              key={index}
              className="flex items-center text-xs text-gray-700 max-w-full"
            >
              <span
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="truncate">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};