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

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleMonthYearChange = (e) => {
    const { name, value } = e.target;
    setMonthYear(prev => ({ ...prev, [name]: parseInt(value) }));
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
        return <div>Select a report from the menu</div>;
    }
  };

  return (
    <div className="reports-container">
      <div className="report-controls">
        <h2>Reports</h2>
        
        <div className="date-selection">
          <label>
            Start Date:
            <input 
              type="date" 
              name="startDate" 
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </label>
          
          <label>
            End Date:
            <input 
              type="date" 
              name="endDate" 
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </label>
          
          <label>
            Month:
            <select 
              name="month" 
              value={monthYear.month}
              onChange={handleMonthYearChange}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </label>
          
          <label>
            Year:
            <input 
              type="number" 
              name="year" 
              value={monthYear.year}
              onChange={handleMonthYearChange}
              min="2000"
              max="2100"
            />
          </label>
        </div>
        
        <div className="report-buttons">
          <button onClick={() => setActiveReport('fees')}>Fees Report</button>
          <button onClick={() => setActiveReport('monthlyStudent')}>Monthly Student Report</button>
          <button onClick={() => setActiveReport('monthlyFees')}>Monthly Fees Report</button>
          <button onClick={() => setActiveReport('weekly')}>Weekly Report</button>
          <button onClick={() => setActiveReport('daily')}>Daily Report</button>
          <button onClick={() => setActiveReport('income')}>Income Report</button>
          <button onClick={() => setActiveReport('incomeStatement')}>Income Statement</button>
          <button onClick={() => setActiveReport('collection')}>Collection Report</button>
          <button onClick={() => setActiveReport('admission')}>Admission Report</button>
        </div>
      </div>
      
      <div className="report-display">
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportWrapper;