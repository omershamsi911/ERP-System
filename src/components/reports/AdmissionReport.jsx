import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';
import { FiLoader, FiUserCheck, FiUserX, FiCalendar, FiBook, FiHash, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AdmissionReport = ({ startDate, endDate }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchAdmissionData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('students')
          .select(`
            id,
            fullname,
            gr_number,
            class,
            section,
            admission_date,
            status,
            families:families(father_name, contact_number)
          `)
          .gte('admission_date', startDate)
          .lte('admission_date', endDate)
          .order('admission_date', { ascending: false });

        if (error) throw error;
        setAdmissions(data);
      } catch (error) {
        console.error('Error fetching admission data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissionData();
  }, [startDate, endDate]);

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <FiLoader className="animate-spin text-2xl text-blue-500 mb-2" />
        <p className="text-gray-600">Loading admission report...</p>
      </div>
    );
  }

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
            Admission Report
          </motion.h2>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <FiCalendar className="text-blue-500" />
            <span className="text-sm text-gray-600">
              {formatDate(startDate)} to {formatDate(endDate)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FiHash className="mr-1" /> GR Number
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FiBook className="mr-1" /> Class/Section
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admissions.map((student) => (
                <React.Fragment key={student.id}>
                  <motion.tr 
                    whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                    className="cursor-pointer"
                    onClick={() => toggleRowExpand(student.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(student.admission_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.gr_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.fullname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.class} - {student.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.status === 'active' ? (
                          <FiCheckCircle className="mr-1" />
                        ) : (
                          <FiXCircle className="mr-1" />
                        )}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Father's Name</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {student.families?.father_name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {student.families?.contact_number || 'N/A'}
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

        {admissions.length === 0 && (
          <div className="text-center py-12">
            <FiUserX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No admissions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There were no admissions between {formatDate(startDate)} and {formatDate(endDate)}
            </p>
          </div>
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
                  <FiUserCheck className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Admissions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{admissions.length}</div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {admissions.filter(s => s.status === 'active').length}
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
                  <FiXCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Students</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {admissions.filter(s => s.status !== 'active').length}
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

export default AdmissionReport;