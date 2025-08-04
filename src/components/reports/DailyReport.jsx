import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';
import { 
  FiLoader, 
  FiUserPlus, 
  FiDollarSign, 
  FiUsers, 
  FiUser, 
  FiTrendingUp, 
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBook,
  FiTag,
  FiCreditCard
} from 'react-icons/fi';

const DailyReport = ({ date }) => {
  const [dailyData, setDailyData] = useState({
    admissions: [],
    feePayments: [],
    studentAttendance: [],
    staffAttendance: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        setLoading(true);
        
        // Fetch new admissions
        const { data: admissions, error: admissionsError } = await supabase
          .from('students')
          .select('*')
          .eq('admission_date', date);

        // Fetch fee payments
        const { data: feePayments, error: feeError } = await supabase
          .from('student_fee_payments')
          .select(`
            id,
            amount_paid,
            payment_method,
            student_fees:student_fee_id (
              student_id,
              students:student_id (fullname, gr_number, class, section)
            )
          `)
          .eq('payment_date', date);

        // Fetch student attendance
        const { data: studentAttendance, error: studentAttError } = await supabase
          .from('attendance_student')
          .select(`
            id,
            status,
            students:student_id (fullname, gr_number, class, section)
          `)
          .eq('attendance_date', date);

        // Fetch staff attendance
        const { data: staffAttendance, error: staffAttError } = await supabase
          .from('attendance_staff')
          .select(`
            id,
            status,
            staff_id,
            users (
              id,
              user_roles (
                role_id,
                roles (
                  id,
                  name
                )
              )
            )
          `)
          .eq('attendance_date', date);

        // Fetch expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('school_expenses')
          .select(`
            id,
            title,
            amount,
            description,
            expense_categories:category_id (name)
          `)
          .eq('expense_date', date);

        if (admissionsError || feeError || studentAttError || staffAttError || expensesError) {
          throw admissionsError || feeError || studentAttError || staffAttError || expensesError;
        }

        setDailyData({
          admissions,
          feePayments,
          studentAttendance,
          staffAttendance,
          expenses
        });
      } catch (error) {
        console.error('Error fetching daily data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyData();
  }, [date]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <FiLoader className="animate-spin text-2xl text-blue-500 mb-2" />
        <p className="text-gray-600">Loading daily report...</p>
      </div>
    );
  }

  const totalCollected = dailyData.feePayments.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalExpenses = dailyData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const presentStudents = dailyData.studentAttendance.filter(a => a.status === 'present').length;
  const absentStudents = dailyData.studentAttendance.filter(a => a.status === 'absent').length;
  const lateStudents = dailyData.studentAttendance.filter(a => a.status === 'late').length;
  const presentStaff = dailyData.staffAttendance.filter(a => a.status === 'present').length;
  const absentStaff = dailyData.staffAttendance.filter(a => a.status === 'absent').length;
  const lateStaff = dailyData.staffAttendance.filter(a => a.status === 'late').length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <motion.h2 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-2xl font-bold text-gray-800 mb-2 md:mb-0"
          >
            Daily Report
          </motion.h2>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <FiCalendar className="text-blue-500" />
            <span className="text-sm text-gray-600">
              {formatDate(date)}
            </span>
          </div>
        </div>

        <div className="flex overflow-x-auto mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'admissions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Admissions ({dailyData.admissions.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Payments ({dailyData.feePayments.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'attendance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Expenses ({dailyData.expenses.length})
          </button>
        </div>

        {activeTab === 'summary' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <FiUserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">New Admissions</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {dailyData.admissions.length}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <FiDollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Collected</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(totalCollected)}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <FiUsers className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Student Attendance</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {presentStudents}/{dailyData.studentAttendance.length}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <FiTrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(totalExpenses)}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <FiUsers className="mr-2" /> Student Attendance Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-500" /> Present
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {presentStudents} ({dailyData.studentAttendance.length > 0 ? Math.round((presentStudents / dailyData.studentAttendance.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiXCircle className="mr-2 text-red-500" /> Absent
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {absentStudents} ({dailyData.studentAttendance.length > 0 ? Math.round((absentStudents / dailyData.studentAttendance.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiClock className="mr-2 text-yellow-500" /> Late
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {lateStudents} ({dailyData.studentAttendance.length > 0 ? Math.round((lateStudents / dailyData.studentAttendance.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <FiUser className="mr-2" /> Staff Attendance Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-500" /> Present
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {presentStaff} ({dailyData.staffAttendance.length > 0 ? Math.round((presentStaff / dailyData.staffAttendance.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiXCircle className="mr-2 text-red-500" /> Absent
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {absentStaff} ({dailyData.staffAttendance.length > 0 ? Math.round((absentStaff / dailyData.staffAttendance.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiClock className="mr-2 text-yellow-500" /> Late
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {lateStaff} ({dailyData.staffAttendance.length > 0 ? Math.round((lateStaff / dailyData.staffAttendance.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'admissions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiUserPlus className="mr-2" /> New Admissions ({dailyData.admissions.length})
                </h3>
              </div>
              {dailyData.admissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GR Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyData.admissions.map((student) => (
                        <motion.tr 
                          key={student.id}
                          whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.gr_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.fullname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.class}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUserPlus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No new admissions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There were no new admissions on {formatDate(date)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiDollarSign className="mr-2" /> Fee Payments ({dailyData.feePayments.length})
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Total collected: {formatCurrency(totalCollected)}
                </p>
              </div>
              {dailyData.feePayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GR Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyData.feePayments.map((payment) => (
                        <motion.tr 
                          key={payment.id}
                          whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.student_fees.students.gr_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.student_fees.students.fullname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.student_fees.students.class} - {payment.student_fees.students.section}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.amount_paid)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.payment_method.replace(/_/g, ' ')}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No fee payments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There were no fee payments on {formatDate(date)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <FiUsers className="mr-2" /> Student Attendance
                  </h3>
                </div>
                {dailyData.studentAttendance.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            GR Number
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Class
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyData.studentAttendance.map((attendance) => (
                          <motion.tr 
                            key={attendance.id}
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {attendance.students.gr_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {attendance.students.fullname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {attendance.students.class} - {attendance.students.section}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${attendance.status === 'present' ? 'bg-green-100 text-green-800' : 
                                  attendance.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {attendance.status === 'present' ? (
                                  <FiCheckCircle className="mr-1" />
                                ) : attendance.status === 'absent' ? (
                                  <FiXCircle className="mr-1" />
                                ) : (
                                  <FiClock className="mr-1" />
                                )}
                                {attendance.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No student attendance records</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There were no student attendance records on {formatDate(date)}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <FiUser className="mr-2" /> Staff Attendance
                  </h3>
                </div>
                {dailyData.staffAttendance.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Staff Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyData.staffAttendance.map((attendance) => (
                          <motion.tr 
                            key={attendance.id}
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {attendance.users.full_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {attendance.users.role?.replace(/_/g, ' ') || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${attendance.status === 'present' ? 'bg-green-100 text-green-800' : 
                                  attendance.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {attendance.status === 'present' ? (
                                  <FiCheckCircle className="mr-1" />
                                ) : attendance.status === 'absent' ? (
                                  <FiXCircle className="mr-1" />
                                ) : (
                                  <FiClock className="mr-1" />
                                )}
                                {attendance.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No staff attendance records</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There were no staff attendance records on {formatDate(date)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'expenses' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <FiTrendingUp className="mr-2" /> Expenses ({dailyData.expenses.length})
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Total expenses: {formatCurrency(totalExpenses)}
                </p>
              </div>
              {dailyData.expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dailyData.expenses.map((expense) => (
                        <motion.tr 
                          key={expense.id}
                          whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {expense.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.expense_categories.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {expense.description || 'N/A'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There were no expenses on {formatDate(date)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyReport;