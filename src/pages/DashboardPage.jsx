import React, { useEffect, useState } from "react";
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
  FaCog
} from "react-icons/fa";
import { 
  FiUserPlus, 
  FiDollarSign, 
  FiCalendar, 
  FiBarChart2,
  FiArrowUpRight
} from "react-icons/fi";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { Link } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';

// StatsCard component with modern design
const StatsCard = ({ title, value, icon, color, currency = false, trend = null }) => {
  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-5 border border-gray-100 transition-all hover:shadow-xl ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">
            {currency ? "₹" : ""}{value}{trend && trend > 0 ? (
              <span className="text-green-500 text-sm ml-2">+{trend}%</span>
            ) : trend && trend < 0 ? (
              <span className="text-red-500 text-sm ml-2">{trend}%</span>
            ) : null}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-20 ${color.replace('border', 'bg')}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
        <span>Compared to last month</span>
        {trend !== null && (
          <span className={`flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <FiArrowUpRight /> : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingFees: 0,
    attendanceRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data for charts
  const [attendanceData, setAttendanceData] = useState([]);
  const [feesData, setFeesData] = useState([]);
  const [studentDistribution, setStudentDistribution] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  const { fetchFees } = useFees();
  const { getAttendanceReport } = useAttendance();
  const { fetchStudents } = useStudents();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [studentsResponse, feesResponse, attendanceResponse] =
          await Promise.all([
            fetchStudents(),
            fetchFees(),
            getAttendanceReport(),
          ]);

        const activeStudents = studentsResponse.filter(
          (s) => s.status === "active"
        ).length;
        const totalPending = feesResponse.filter(
          (f) => f.status === "pending"
        ).length;
        const attendanceRate = attendanceResponse?.attendancePercentage || 0;

        setStats({
          totalStudents: studentsResponse.length,
          activeStudents,
          pendingFees: totalPending,
          attendanceRate,
        });

        // Generate chart data
        generateChartData(studentsResponse, feesResponse);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateChartData = (students, fees) => {
    // Attendance data for line chart
    const attendance = [
      { day: 'Mon', attendance: 85 },
      { day: 'Tue', attendance: 88 },
      { day: 'Wed', attendance: 82 },
      { day: 'Thu', attendance: 90 },
      { day: 'Fri', attendance: 87 },
      { day: 'Sat', attendance: 78 },
    ];
    setAttendanceData(attendance);

    // Fees data for bar chart
    const feesData = [
      { month: 'Jan', collected: 45000, pending: 12000 },
      { month: 'Feb', collected: 52000, pending: 10000 },
      { month: 'Mar', collected: 48000, pending: 15000 },
      { month: 'Apr', collected: 55000, pending: 8000 },
      { month: 'May', collected: 60000, pending: 5000 },
      { month: 'Jun', collected: 62000, pending: 3000 },
    ];
    setFeesData(feesData);

    // Student distribution for pie chart
    const distribution = [
      { name: 'Class 10', value: 42 },
      { name: 'Class 9', value: 38 },
      { name: 'Class 8', value: 35 },
      { name: 'Class 7', value: 30 },
      { name: 'Class 6', value: 28 },
    ];
    setStudentDistribution(distribution);

    // Performance data for area chart
    const performance = [
      { subject: 'Math', avgScore: 85, topScore: 95 },
      { subject: 'Science', avgScore: 78, topScore: 92 },
      { subject: 'English', avgScore: 82, topScore: 98 },
      { subject: 'History', avgScore: 75, topScore: 88 },
      { subject: 'Geography', avgScore: 80, topScore: 90 },
    ];
    setPerformanceData(performance);
  };

  // Get current date for header
  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-2xl max-w-4px">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 flex items-center">
              <FaCalendarAlt className="mr-2" /> 
              {getCurrentDate()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<FaUserGraduate className="text-blue-500 text-xl" />}
            color="border-l-4 border-blue-500"
            trend={4.2}
          />
          <StatsCard
            title="Active Students"
            value={stats.activeStudents}
            icon={<FaUsers className="text-green-500 text-xl" />}
            color="border-l-4 border-green-500"
            trend={2.8}
          />
          <StatsCard
            title="Pending Fees"
            value={stats.pendingFees}
            icon={<FaMoneyBillWave className="text-yellow-500 text-xl" />}
            color="border-l-4 border-yellow-500"
            currency
            trend={-1.5}
          />
          <StatsCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<FaClock className="text-purple-500 text-xl" />}
            color="border-l-4 border-purple-500"
            trend={3.7}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            {/* Performance Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Subject Performance</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="avgScore" name="Average Score" fill="#8884d8" />
                    <Bar dataKey="topScore" name="Top Score" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fees Collection Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Fees Collection Trend</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">View Report</button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={feesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="collected" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCollected)" name="Collected Fees" />
                    <Area type="monotone" dataKey="pending" stroke="#ffc658" fillOpacity={1} fill="url(#colorPending)" name="Pending Fees" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions and Student Distribution */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/students/add"
                  className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 p-4 rounded-xl flex flex-col items-center transition-all hover:shadow-md"
                >
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
                    <FiUserPlus className="text-xl" />
                  </div>
                  <span className="font-medium">Add Student</span>
                </Link>

                <Link
                  to="/fees#collection"
                  className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 p-4 rounded-xl flex flex-col items-center transition-all hover:shadow-md"
                >
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mb-3">
                    <FiDollarSign className="text-xl" />
                  </div>
                  <span className="font-medium">Collect Fee</span>
                </Link>

                <Link
                  to="/attendance"
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 text-yellow-700 p-4 rounded-xl flex flex-col items-center transition-all hover:shadow-md"
                >
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mb-3">
                    <FiCalendar className="text-xl" />
                  </div>
                  <span className="font-medium">Mark Attendance</span>
                </Link>

                <Link
                  to="/reports"
                  className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 p-4 rounded-xl flex flex-col items-center transition-all hover:shadow-md"
                >
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-3">
                    <FiBarChart2 className="text-xl" />
                  </div>
                  <span className="font-medium">View Reports</span>
                </Link>
              </div>
            </div>

            {/* Student Distribution Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Student Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {studentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Trend */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Weekly Attendance Trend</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">View Report</button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={attendanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Attendance %"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};