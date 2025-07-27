import React, { useEffect, useState } from 'react';
import { useFees } from '../hooks/useFees';
import { useAttendance } from '../hooks/useAttendance';
import { useStudents } from '../hooks/useStudents';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { formatCurrency } from '../utils/helpers';
import { FaUserGraduate, FaMoneyBillWave, FaClock, FaUsers } from 'react-icons/fa';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingFees: 0,
    attendanceRate: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const { fetchPendingFees, pendingFees } = useFees();
  const { getAttendanceSummary } = useAttendance();
  const { fetchStudents } = useStudents(); // Don't destructure `students` here
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch students and use returned data directly
        const fetchedStudents = await fetchStudents();

        // Fetch pending fees
        await fetchPendingFees();

        // Fetch attendance summary
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const attendanceSummary = await getAttendanceSummary('1', 'A', month, year);

        // Calculate stats
        const activeStudents = fetchedStudents.filter(s => s.status === 'active').length;
        const totalPending = pendingFees.reduce((sum, fee) => sum + parseFloat(fee.final_amount || 0), 0);
        const attendanceRate = attendanceSummary?.data?.attendancePercentage || 0;

        setStats({
          totalStudents: fetchedStudents.length,
          activeStudents,
          pendingFees: totalPending,
          attendanceRate
        });

        // Generate recent activity (mocked for now)
        const activities = [
          {
            icon: <FaUserGraduate />,
            title: 'New student registered',
            description: 'John Doe was added to Class 1A',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            icon: <FaMoneyBillWave />,
            title: 'Fee payment received',
            description: 'Jane Smith paid $150 for tuition fee',
            timestamp: new Date(Date.now() - 7200000)
          },
          {
            icon: <FaClock />,
            title: 'Attendance marked',
            description: 'Class 2B attendance recorded for today',
            timestamp: new Date(Date.now() - 10800000)
          }
        ];

        setRecentActivity(activities);
        setLoading(false);
      } catch (err) {
        // setError(err.message || 'Failed to load dashboard data');
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
              <span>Add Student</span>
            </button>
            <button className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg flex flex-col items-center">
              <FaMoneyBillWave className="text-2xl mb-2" />
              <span>Collect Fee</span>
            </button>
            <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg flex flex-col items-center">
              <FaClock className="text-2xl mb-2" />
              <span>Mark Attendance</span>
            </button>
            <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg flex flex-col items-center">
              <FaUsers className="text-2xl mb-2" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
