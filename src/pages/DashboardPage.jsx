import React, { useEffect, useState } from 'react';
import { useFees } from '../hooks/useFees';
import { useAttendance } from '../hooks/useAttendance';
import { useStudents } from '../hooks/useStudents';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { FaUserGraduate, FaMoneyBillWave, FaClock, FaUsers } from 'react-icons/fa';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingFees: 0,
    attendanceRate: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all hooks at the top
  const { getFee } = useFees();
  const { getAttendanceReport } = useAttendance();
  const { fetchStudents } = useStudents();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel for better performance
        const [studentsResponse, feesResponse, attendanceResponse] = await Promise.all([
          fetchStudents(),
          getFee(),
          getAttendanceReport()
        ]);

        // Calculate stats
        const activeStudents = studentsResponse.filter(s => s.status === 'active').length;
        const totalPending = 0;
        const attendanceRate = attendanceResponse?.attendancePercentage || 0;

        setStats({
          totalStudents: studentsResponse.length,
          activeStudents,
          pendingFees: totalPending,
          attendanceRate
        });

        // Generate recent activity from actual data
        const activities = [
          {
            icon: <FaUserGraduate />,
            title: 'New student registered',
            description: `${studentsResponse[0]?.fullname || 'A student'} was added`,
            timestamp: new Date()
          },
          {
            icon: <FaMoneyBillWave />,
            title: 'Fee payment received',
            description: feesResponse.length > 0 
              ? `$${feesResponse[0].final_amount} fee recorded` 
              : 'No recent payments',
            timestamp: new Date()
          }
        ];

        setRecentActivity(activities);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  // if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<FaUserGraduate />}
          color="border-blue-500"
        />
        <StatsCard
          title="Active Students"
          value={stats.activeStudents}
          icon={<FaUsers />}
          color="border-green-500"
        />
        <StatsCard
          title="Pending Fees"
          value={stats.pendingFees}
          icon={<FaMoneyBillWave />}
          color="border-yellow-500"
          currency
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={<FaClock />}
          color="border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivity} />

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg flex flex-col items-center">
              <FaUserGraduate className="text-2xl mb-2" />
              <span>
                <Link to="/students/add">
                  Add Student
                </Link>
                </span>
            </button>
            <button className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg flex flex-col items-center">
              <FaMoneyBillWave className="text-2xl mb-2" />
              <span>
                <Link to="/fees">
                  Collect Fee
                </Link>
              </span>
            </button>
            <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg flex flex-col items-center">
              <FaClock className="text-2xl mb-2" />
              <span>
                <Link to="/attendance">
                  Mark Attendance
                </Link>
              </span>
            </button>
            <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg flex flex-col items-center">
              <FaUsers className="text-2xl mb-2" />
              <span>
                <Link to="/reports">
                  View Reports
                </Link>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
