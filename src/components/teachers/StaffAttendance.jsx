import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const StaffAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [remarks, setRemarks] = useState('');
  const [existingAttendance, setExistingAttendance] = useState(null);

  useEffect(() => {
    loadExistingAttendance();
  }, [attendanceDate]);

  const loadExistingAttendance = async () => {
    if (!user || !attendanceDate) return;

    setLoading(true);
    try {
      const { data: attendanceData } = await supabase
        .from('attendance_staff')
        .select('*')
        .eq('staff_id', user.id)
        .eq('attendance_date', attendanceDate)
        .single();

      setExistingAttendance(attendanceData);
      
      if (attendanceData) {
        setAttendanceStatus(attendanceData.status);
        setRemarks(attendanceData.remarks || '');
      } else {
        setAttendanceStatus('present');
        setRemarks('');
      }
    } catch (error) {
      console.error('Error loading existing attendance:', error);
      setExistingAttendance(null);
      setAttendanceStatus('present');
      setRemarks('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendanceRecord = {
        staff_id: user.id,
        attendance_date: attendanceDate,
        status: attendanceStatus,
        remarks: remarks
      };

      if (existingAttendance) {
        // Update existing attendance
        const { error } = await supabase
          .from('attendance_staff')
          .update(attendanceRecord)
          .eq('id', existingAttendance.id);

        if (error) throw error;
      } else {
        // Insert new attendance
        const { error } = await supabase
          .from('attendance_staff')
          .insert([attendanceRecord]);

        if (error) throw error;
      }

      alert('Attendance saved successfully!');
      await loadExistingAttendance();

    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half_day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Attendance</h2>
        <p className="text-gray-600">Mark your daily attendance</p>
      </div>

      <div className="bg-white border rounded-lg">
        <form onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">
              Staff Attendance - {user?.full_name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mark your attendance for the selected date
            </p>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Attendance Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setAttendanceStatus('present')}
                  className={`p-3 rounded-lg border-2 font-medium ${
                    attendanceStatus === 'present'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="text-lg mb-1">✅</div>
                  Present
                </button>
                
                <button
                  type="button"
                  onClick={() => setAttendanceStatus('absent')}
                  className={`p-3 rounded-lg border-2 font-medium ${
                    attendanceStatus === 'absent'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                  }`}
                >
                  <div className="text-lg mb-1">❌</div>
                  Absent
                </button>
                
                <button
                  type="button"
                  onClick={() => setAttendanceStatus('late')}
                  className={`p-3 rounded-lg border-2 font-medium ${
                    attendanceStatus === 'late'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-lg mb-1">⏰</div>
                  Late
                </button>
                
                <button
                  type="button"
                  onClick={() => setAttendanceStatus('half_day')}
                  className={`p-3 rounded-lg border-2 font-medium ${
                    attendanceStatus === 'half_day'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                  }`}
                >
                  <div className="text-lg mb-1">⏳</div>
                  Half Day
                </button>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any remarks or notes..."
              />
            </div>

            {/* Current Status Display */}
            {existingAttendance && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(existingAttendance.status)}`}>
                    {existingAttendance.status.charAt(0).toUpperCase() + existingAttendance.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Last updated: {new Date(existingAttendance.created_at).toLocaleString()}
                  </span>
                </div>
                {existingAttendance.remarks && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Remarks:</strong> {existingAttendance.remarks}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="p-4 border-t bg-gray-50">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : existingAttendance ? 'Update Attendance' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>

      {/* Attendance History */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Recent Attendance History</h3>
        </div>
        <div className="p-4">
          <AttendanceHistory staffId={user?.id} />
        </div>
      </div>
    </div>
  );
};

// Attendance History Component
const AttendanceHistory = ({ staffId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staffId) {
      loadAttendanceHistory();
    }
  }, [staffId]);

  const loadAttendanceHistory = async () => {
    setLoading(true);
    try {
      const { data: historyData } = await supabase
        .from('attendance_staff')
        .select('*')
        .eq('staff_id', staffId)
        .order('attendance_date', { ascending: false })
        .limit(10);

      setHistory(historyData || []);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'half_day': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-2">
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No attendance history found</p>
      ) : (
        history.map(record => (
          <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">
                {new Date(record.attendance_date).toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </span>
            </div>
            {record.remarks && (
              <span className="text-sm text-gray-600 max-w-xs truncate">
                {record.remarks}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}; 