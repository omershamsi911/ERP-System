import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';
import { 
  FiLoader, 
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiPieChart,
  FiCreditCard
} from 'react-icons/fi';

const IncomeStatement = ({ startDate, endDate }) => {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Fetch income data
        const { data: incomeData, error: incomeError } = await supabase
          .rpc('get_income_statement', {
            start_date: startDate,
            end_date: endDate
          });

        // Fetch expense data
        const { data: expenseData, error: expenseError } = await supabase
          .from('school_expenses')
          .select(`
            amount,
            expense_categories:category_id (name)
          `)
          .gte('expense_date', startDate)
          .lte('expense_date', endDate);

        if (incomeError || expenseError) throw incomeError || expenseError;

        setIncome(incomeData);
        setExpenses(expenseData);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [startDate, endDate]);

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
        <p className="text-gray-600">Loading income statement...</p>
      </div>
    );
  }

  const totalIncome = income.reduce((sum, item) => sum + item.total_amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalIncome - totalExpenses;

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
            Income Statement
          </motion.h2>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <FiCalendar className="text-blue-500" />
            <span className="text-sm text-gray-600">
              {formatDate(startDate)} to {formatDate(endDate)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FiTrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(totalIncome)}
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
                  <FiTrendingDown className="h-6 w-6 text-white" />
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

          <div className={`bg-white overflow-hidden shadow rounded-lg ${netIncome >= 0 ? 'border-green-200 border-2' : 'border-red-200 border-2'}`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${netIncome >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  <FiDollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Net {netIncome >= 0 ? 'Profit' : 'Loss'}</dt>
                  <dd className="flex items-baseline">
                    <div className={`text-2xl font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(netIncome))}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FiTrendingUp className="mr-2" /> Income Breakdown ({income.length} categories)
              </h3>
            </div>
            {income.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {income.map((item, index) => (
                      <motion.tr 
                        key={`income-${index}`}
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.fee_category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.total_amount)}
                        </td>
                      </motion.tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <strong>Total Income</strong>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <strong>{formatCurrency(totalIncome)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiTrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No income data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There was no income between {formatDate(startDate)} and {formatDate(endDate)}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FiTrendingDown className="mr-2" /> Expense Breakdown ({expenses.length} categories)
              </h3>
            </div>
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((item, index) => (
                      <motion.tr 
                        key={`expense-${index}`}
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.expense_categories.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </motion.tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <strong>Total Expenses</strong>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <strong>{formatCurrency(totalExpenses)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiTrendingDown className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expense data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There were no expenses between {formatDate(startDate)} and {formatDate(endDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'} border ${netIncome >= 0 ? 'border-green-200' : 'border-red-200'}`}>
          <h3 className="text-lg font-medium flex items-center mb-2">
            {netIncome >= 0 ? (
              <>
                <FiTrendingUp className="mr-2 text-green-600" /> 
                <span className="text-green-600">Net Profit</span>
              </>
            ) : (
              <>
                <FiTrendingDown className="mr-2 text-red-600" /> 
                <span className="text-red-600">Net Loss</span>
              </>
            )}
          </h3>
          <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(netIncome))}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {netIncome >= 0 ? 'Your school is profitable' : 'Your school is operating at a loss'} during this period
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default IncomeStatement;