import React, { useState, useEffect } from 'react';
import { Check, X, Calendar, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { supabase } from '../../services/supabase';

const StudentAttendanceSummary = ({ studentId }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, fullname, gr_number, class')
          .eq('id', studentId)
          .single();
        
        if (studentError) throw studentError;
        
        // Fetch today's attendance
        const { data: todayAttendance, error: todayError } = await supabase
          .from('attendance_student')
          .select('status, remarks')
          .eq('student_id', studentId)
          .eq('attendance_date', today)
          .single();
        
        if (todayError && todayError.code !== 'PGRST116') throw todayError; // Ignore "No rows found" error
        
        // Fetch monthly attendance
        const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
        
        const { data: monthlyAttendance, error: monthlyError } = await supabase
          .from('attendance_student')
          .select('attendance_date, status, remarks')
          .eq('student_id', studentId)
          .gte('attendance_date', startDate)
          .lte('attendance_date', endDate)
          .order('attendance_date', { ascending: true });
        
        if (monthlyError) throw monthlyError;
        
        // Calculate summary
        const presentDays = monthlyAttendance?.filter(a => a.status === 'present').length || 0;
        const absentDays = monthlyAttendance?.filter(a => a.status === 'absent').length || 0;
        const totalSchoolDays = new Date(currentYear, currentMonth, 0).getDate(); // Days in current month
        const attendancePercentage = Math.round((presentDays / totalSchoolDays) * 100);
        
        setAttendanceData({
          student: studentData,
          todayStatus: todayAttendance?.status || null,
          todayRemarks: todayAttendance?.remarks || null,
          monthlyRecords: monthlyAttendance || [],
          presentDays,
          absentDays,
          attendancePercentage,
          totalSchoolDays
        });
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchAttendanceData();
    }
  }, [studentId, currentMonth, currentYear]);

  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <Check className="text-green-500" size={20} />;
      case 'absent':
        return <X className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      default:
        return 'Not Marked';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRemarksText = (remarks) => {
    switch (remarks) {
      case 'ontime':
        return 'On Time';
      case 'late':
        return 'Late';
      case 'leave':
        return 'Leave';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="bg-red-100 rounded-full p-3 inline-block">
          <AlertTriangle className="text-red-500" size={24} />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Error loading attendance</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-600">No attendance data found for this student.</p>
      </div>
    );
  }

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        {/* Student Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{attendanceData.student.fullname}</h2>
            <p className="text-gray-600">
              Roll #: {attendanceData.student.gr_number} • Class: {attendanceData.student.class}
            </p>
          </div>
          
          {/* Today's Status */}
          <div className={`${getStatusClass(attendanceData.todayStatus)} px-4 py-2 rounded-full flex items-center`}>
            {getStatusIcon(attendanceData.todayStatus)}
            <span className="ml-2 font-medium">
              Today: {getStatusText(attendanceData.todayStatus)}
              {attendanceData.todayRemarks && ` (${getRemarksText(attendanceData.todayRemarks)})`}
            </span>
          </div>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => changeMonth('prev')}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronDown className="transform rotate-90 text-gray-600" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-800">
            {monthName} {currentYear}
          </h3>
          
          <button 
            onClick={() => changeMonth('next')}
            className="p-2 rounded-lg hover:bg-gray-100"
            disabled={currentMonth === new Date().getMonth() + 1 && currentYear === new Date().getFullYear()}
          >
            <ChevronDown className="transform -rotate-90 text-gray-600" />
          </button>
        </div>
        
        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Present Days</p>
            <p className="text-2xl font-bold text-green-800">
              {attendanceData.presentDays}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Absent Days</p>
            <p className="text-2xl font-bold text-red-800">
              {attendanceData.absentDays}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Attendance Percentage</p>
            <p className="text-2xl font-bold text-blue-800">
              {attendanceData.attendancePercentage}%
            </p>
          </div>
        </div>
        
        {/* Calendar View */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Daily Attendance</h3>
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() }).map((_, i) => (
              <div key={`empty-start-${i}`} className="h-10"></div>
            ))}
            
            {Array.from({ length: attendanceData.totalSchoolDays }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const record = attendanceData.monthlyRecords.find(r => r.attendance_date === dateStr);
              const isToday = new Date(dateStr).toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={day} 
                  className={`h-10 rounded-md flex items-center justify-center relative
                    ${record?.status === 'present' ? 'bg-green-50 text-green-800' : 
                      record?.status === 'absent' ? 'bg-red-50 text-red-800' : 
                      'bg-gray-50 text-gray-500'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {day}
                  {record && (
                    <span className="absolute bottom-0 text-xs">
                      {record.status === 'present' ? 
                        (record.remarks === 'late' ? 'L' : 'P') : 
                        (record.remarks === 'leave' ? 'LV' : 'A')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Calendar Legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 mr-1 rounded-sm"></div>
              <span>P = Present</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 mr-1 rounded-sm"></div>
              <span>L = Late</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 mr-1 rounded-sm"></div>
              <span>A = Absent</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 mr-1 rounded-sm"></div>
              <span>LV = Leave</span>
            </div>
          </div>
        </div>
        
        {/* Detailed Attendance Table */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Attendance Records</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.monthlyRecords.length > 0 ? (
                  attendanceData.monthlyRecords.map((record) => (
                    <tr key={record.attendance_date}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusText(record.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {getRemarksText(record.remarks)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-center text-sm text-gray-500">
                      No attendance records found for {monthName} {currentYear}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceSummary;