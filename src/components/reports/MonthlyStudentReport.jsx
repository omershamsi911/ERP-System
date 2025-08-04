import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';
import { 
  FiLoader, 
  FiUser, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiPercent,
  FiBook,
  FiUserPlus,
  FiBarChart2
} from 'react-icons/fi';
import { format } from 'date-fns';

const MonthlyStudentReport = ({ month, year }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('admissions');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        // Fetch new admissions
        const { data: newAdmissions, error: admissionError } = await supabase
          .from('students')
          .select('*')
          .gte('admission_date', startDate)
          .lte('admission_date', endDate);

        if (admissionError) throw admissionError;

        // Fetch attendance summary
        const { data: attendanceData, error: attendanceError } = await supabase
          .rpc('get_monthly_attendance_summary', {
            month_param: month,
            year_param: year
          });

        if (attendanceError) throw attendanceError;

        // Combine data
        const combinedData = newAdmissions.map(student => {
          const attendance = attendanceData.find(a => a.student_id === student.id) || {};
          return {
            ...student,
            ...attendance
          };
        });

        setStudents(combinedData);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [month, year]);

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getMonthName = () => {
    return format(new Date(year, month - 1, 1), 'MMMM yyyy');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <FiLoader className="animate-spin text-2xl text-blue-500 mb-2" />
        <p className="text-gray-600">Loading student report...</p>
      </div>
    );
  }

  const newAdmissions = students.filter(s => s.admission_date);
  const attendanceStudents = students.filter(s => s.present_days);

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
            Monthly Student Report
          </motion.h2>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <FiCalendar className="text-blue-500" />
            <span className="text-sm text-gray-600">
              {getMonthName()}
            </span>
          </div>
        </div>

        <div className="flex overflow-x-auto mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'admissions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiUserPlus className="mr-1" /> Admissions ({newAdmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'attendance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiBarChart2 className="mr-1" /> Attendance ({attendanceStudents.length})
          </button>
        </div>

        {activeTab === 'admissions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {newAdmissions.length > 0 ? (
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
                          Admission Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newAdmissions.map((student) => (
                        <React.Fragment key={student.id}>
                          <motion.tr 
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                            className="cursor-pointer"
                            onClick={() => toggleRowExpand(student.id)}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(student.admission_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {student.status}
                              </span>
                            </td>
                          </motion.tr>
                          {expandedRow === student.id && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-50"
                            >
                              <td colSpan="5" className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Father's Name</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                      {student.father_name || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                      {student.contact_number || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                                    <p className="mt-1 text-sm text-gray-900">
                                      {student.address || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUserPlus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No new admissions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There were no new admissions in {getMonthName()}
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
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {attendanceStudents.length > 0 ? (
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
                          Present Days
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent Days
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceStudents.map((student) => (
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <FiCheckCircle className="mr-1" />
                              {student.present_days}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              <FiXCircle className="mr-1" />
                              {student.absent_days}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              <FiPercent className="mr-1" />
                              {student.attendance_percentage}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiBarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There were no attendance records in {getMonthName()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
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
                      {newAdmissions.length}
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
                  <FiCheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Attendance</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {attendanceStudents.length > 0 
                        ? Math.round(attendanceStudents.reduce((sum, s) => sum + s.attendance_percentage, 0) / attendanceStudents.length) 
                        : 0}%
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
                  <FiBook className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {students.filter(s => s.status === 'active').length}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MonthlyStudentReport;