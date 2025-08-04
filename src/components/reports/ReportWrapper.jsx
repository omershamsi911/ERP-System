import React, { useState } from 'react';
import FeesReport from './FeesReport';
import MonthlyStudentReport from './MonthlyStudentReport';
import MonthlyFeesReport from './MonthlyFeesReport';
import WeeklyReport from './WeeklyReport';
import DailyReport from './DailyReport';
import IncomeReport from './IncomeReport';
import IncomeStatement from './IncomeStatement';
import CollectionReport from './CollectionReport';
import AdmissionReport from './AdmissionReport';
import { FiCalendar, FiChevronDown, FiChevronUp, FiDollarSign, FiUser, FiBook, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ReportWrapper = () => {
  const [activeReport, setActiveReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [monthYear, setMonthYear] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleMonthYearChange = (e) => {
    const { name, value } = e.target;
    setMonthYear(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'fees':
        return <FeesReport startDate={dateRange.startDate} endDate={dateRange.endDate} />;
      case 'monthlyStudent':
        return <MonthlyStudentReport month={monthYear.month} year={monthYear.year} />;
      case 'monthlyFees':
        return <MonthlyFeesReport month={monthYear.month} year={monthYear.year} />;
      case 'weekly':
        return <WeeklyReport startDate={dateRange.startDate} endDate={dateRange.endDate} />;
      case 'daily':
        return <DailyReport date={dateRange.startDate} />;
      case 'income':
        return <IncomeReport startDate={dateRange.startDate} endDate={dateRange.endDate} />;
      case 'incomeStatement':
        return <IncomeStatement startDate={dateRange.startDate} endDate={dateRange.endDate} />;
      case 'collection':
        return <CollectionReport startDate={dateRange.startDate} endDate={dateRange.endDate} />;
      case 'admission':
        return <AdmissionReport startDate={dateRange.startDate} endDate={dateRange.endDate} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <FiBarChart2 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No report selected</h3>
            <p className="mt-2 text-sm text-gray-500">
              Select a report from the options below
            </p>
          </div>
        );
    }
  };

  const reportButtons = [
    { id: 'fees', label: 'Fees Report', icon: <FiDollarSign /> },
    { id: 'monthlyStudent', label: 'Monthly Student Report', icon: <FiUser /> },
    { id: 'monthlyFees', label: 'Monthly Fees Report', icon: <FiDollarSign /> },
    { id: 'weekly', label: 'Weekly Report', icon: <FiCalendar /> },
    { id: 'daily', label: 'Daily Report', icon: <FiCalendar /> },
    { id: 'income', label: 'Income Report', icon: <FiDollarSign /> },
    { id: 'incomeStatement', label: 'Income Statement', icon: <FiBook /> },
    { id: 'collection', label: 'Collection Report', icon: <FiDollarSign /> },
    { id: 'admission', label: 'Admission Report', icon: <FiUser /> }
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Reports Dashboard</h2>
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center">
                  <FiCalendar className="mr-2 text-blue-500" />
                  {dateRange.startDate} to {dateRange.endDate}
                </span>
              </div>
              
              <div className="bg-purple-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center">
                  <FiCalendar className="mr-2 text-purple-500" />
                  {getMonthName(monthYear.month)} {monthYear.year}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button 
              onClick={toggleFilters}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {showFilters ? <FiChevronUp className="mr-1" /> : <FiChevronDown className="mr-1" />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <div className="flex space-x-2">
                      <input 
                        type="date" 
                        name="startDate" 
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <span className="self-center text-gray-500">to</span>
                      <input 
                        type="date" 
                        name="endDate" 
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month & Year</label>
                    <div className="flex space-x-2">
                      <select 
                        name="month" 
                        value={monthYear.month}
                        onChange={handleMonthYearChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        name="year" 
                        value={monthYear.year}
                        onChange={handleMonthYearChange}
                        min="2000"
                        max="2100"
                        className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {reportButtons.map((report) => (
              <motion.button
                key={report.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveReport(report.id)}
                className={`p-4 rounded-lg shadow text-left transition-colors duration-200 ${
                  activeReport === report.id 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-blue-100 text-blue-600">
                    {report.icon}
                  </div>
                  <span className="ml-3 font-medium text-gray-900">{report.label}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
            {renderReport()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportWrapper;