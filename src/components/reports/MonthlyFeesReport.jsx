import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';

import { 
  FiLoader, 
  FiDollarSign, 
  FiCreditCard, 
  FiCalendar,
  FiPieChart,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';
import { format, parseISO, lastDayOfMonth } from 'date-fns';

const MonthlyFeesReport = ({ month, year }) => {
  const [feesData, setFeesData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchFeesData = async () => {
      try {
        setLoading(true);
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = format(lastDayOfMonth(parseISO(startDate)), 'yyyy-MM-dd');

        // Fetch fee payments
        const { data: payments, error: paymentsError } = await supabase
          .from('student_fee_payments')
          .select(`
            *
          `)
          .gte('payment_date', startDate)
          .lte('payment_date', endDate)
          .order('payment_date', { ascending: false });

          console.log(payments);

        if (paymentsError) throw paymentsError;

        // Fetch fee summary
        const { data: feeSummary, error: summaryError } = await supabase
          .rpc('get_monthly_fee_summary', {
            month_param: month,
            year_param: year
          });

        if (summaryError) throw summaryError;

        setFeesData(payments);
        setSummary(feeSummary[0]);
      } catch (error) {
        console.error('Error fetching fees data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeesData();
  }, [month, year]);

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  };

  const getMonthName = () => {
    return format(new Date(year, month - 1, 1), 'MMMM yyyy');
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <FiDollarSign className="mr-1" />;
      case 'bank_transfer':
        return <FiTrendingUp className="mr-1" />;
      case 'credit_card':
        return <FiCreditCard className="mr-1" />;
      default:
        return <FiDatabase className="mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <FiLoader className="animate-spin text-2xl text-blue-500 mb-2" />
        <p className="text-gray-600">Loading monthly fees report...</p>
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
            Monthly Fees Report
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
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiPieChart className="inline mr-1" /> Summary
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiDollarSign className="inline mr-1" /> Payments ({feesData.length})
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
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <FiDollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Collected</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(summary?.total_collected)}
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
                      <FiCreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">By Cash</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(summary?.cash_amount)}
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
                      <FiTrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">By Bank Transfer</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(summary?.bank_amount)}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <FiAlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Fees</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(summary?.pending_amount)}
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
                  <FiDollarSign className="mr-2" /> Payment Methods Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiDollarSign className="mr-2 text-green-500" /> Cash
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(summary?.cash_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiTrendingUp className="mr-2 text-blue-500" /> Bank Transfer
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(summary?.bank_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiCreditCard className="mr-2 text-purple-500" /> Credit Card
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(summary?.other_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <FiPieChart className="mr-2" /> Collection Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-500" /> Collected
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(summary?.total_collected)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiAlertCircle className="mr-2 text-yellow-500" /> Pending
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(summary?.pending_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <FiClock className="mr-2 text-red-500" /> Overdue
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(summary?.overdue_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
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
                  <FiDollarSign className="mr-2" /> Detailed Payments ({feesData.length})
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Total collected: {formatCurrency(summary?.total_collected)}
                </p>
              </div>
              {feesData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee Details
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
                      {feesData.map((payment) => (
                        <React.Fragment key={payment.id}>
                          <motion.tr 
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                            className="cursor-pointer"
                            onClick={() => toggleRowExpand(payment.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.payment_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.student_fees.students.fullname}
                              </div>
                              <div className="text-sm text-gray-500">
                                GR#{payment.student_fees.students.gr_number} • {payment.student_fees.students.class}-{payment.student_fees.students.section}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">
                                {payment.student_fees.fee_type.replace(/_/g, ' ')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.student_fees.fee_categories.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount_paid)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {getPaymentMethodIcon(payment.payment_method)}
                                {payment.payment_method.replace(/_/g, ' ')}
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
                              <td colSpan="5" className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Fee Breakdown</h4>
                                    <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
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
                                      <div>
                                        <span className="text-gray-500">Paid:</span>
                                        <span className="ml-1 text-gray-900">
                                          {formatCurrency(payment.amount_paid)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Payment Details</h4>
                                    <div className="mt-1 text-sm text-gray-900 capitalize">
                                      {payment.payment_method.replace(/_/g, ' ')}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-900">
                                      {formatDate(payment.payment_date)}
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
              ) : (
                <div className="text-center py-12">
                  <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No fee payments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There were no fee payments in {getMonthName()}
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

export default MonthlyFeesReport;