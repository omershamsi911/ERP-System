import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';
import { FiLoader, FiDollarSign, FiCreditCard, FiCalendar, FiUser, FiBook, FiPercent, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const FeesReport = ({ startDate, endDate }) => {
  const [feesData, setFeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchFeesData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('student_fee_payments')
          .select(`
            id,
            amount_paid,
            payment_date,
            payment_method,
            receipt_number,
            student_fees (
              student_id,
              fee_type,
              total_amount,
              discount_amount,
              fine_amount,
              students(fullname, class, section, gr_number)
            )
          `)
          .gte('payment_date', startDate)
          .lte('payment_date', endDate)
          .order('payment_date', { ascending: false });

        if (error) throw error;
        setFeesData(data);
      } catch (error) {
        console.error('Error fetching fees data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeesData();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <FiLoader className="animate-spin text-2xl text-blue-500 mb-2" />
        <p className="text-gray-600">Loading fees report...</p>
      </div>
    );
  }

  const totalCollected = feesData.reduce((sum, payment) => sum + payment.amount_paid, 0);
  const totalDiscounts = feesData.reduce((sum, payment) => sum + (payment.student_fees.discount_amount || 0), 0);
  const totalFines = feesData.reduce((sum, payment) => sum + (payment.student_fees.fine_amount || 0), 0);

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
            Fees Collection Report
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
                    <FiUser className="mr-1" /> Student
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FiBook className="mr-1" /> Class/Section
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FiDollarSign className="mr-1" /> Amount
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feesData.map((payment) => (
                <React.Fragment key={payment.id}>
                  <motion.tr 
                    whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                    className="cursor-pointer"
                    onClick={() => toggleRowExpand(payment.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.payment_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.student_fees.students.fullname}
                      </div>
                      <div className="text-sm text-gray-500">
                        GR#{payment.student_fees.students.gr_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.student_fees.students.class} - {payment.student_fees.students.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {payment.student_fees.fee_type.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount_paid)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <FiCheckCircle className="mr-1" />
                        Paid
                      </span>
                    </td>
                  </motion.tr>
                  {expandedRow === payment.id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50"
                    >
                      <td colSpan="6" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                            <p className="mt-1 text-sm text-gray-900 capitalize">
                              {payment.payment_method.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Receipt Number</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {payment.receipt_number || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Fee Details</h4>
                            <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Total:</span>
                                <span className="ml-1 text-gray-900">
                                  {formatCurrency(payment.student_fees.total_amount)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Discount:</span>
                                <span className="ml-1 text-gray-900">
                                  {formatCurrency(payment.student_fees.discount_amount || 0)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Fine:</span>
                                <span className="ml-1 text-gray-900">
                                  {formatCurrency(payment.student_fees.fine_amount || 0)}
                                </span>
                              </div>
                            </div>
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

        {feesData.length === 0 && (
          <div className="text-center py-12">
            <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fee payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There were no fee payments between {formatDate(startDate)} and {formatDate(endDate)}
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
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <FiPercent className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Discounts</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(totalDiscounts)}
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
                  <FiAlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Fines</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(totalFines)}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Methods</h3>
            <div className="space-y-2">
              {Object.entries(
                feesData.reduce((acc, payment) => {
                  const method = payment.payment_method;
                  acc[method] = (acc[method] || 0) + payment.amount_paid;
                  return acc;
                }, {})
              ).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500 capitalize">
                    {method.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Fee Types</h3>
            <div className="space-y-2">
              {Object.entries(
                feesData.reduce((acc, payment) => {
                  const type = payment.student_fees.fee_type;
                  acc[type] = (acc[type] || 0) + payment.amount_paid;
                  return acc;
                }, {})
              ).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500 capitalize">
                    {type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeesReport;