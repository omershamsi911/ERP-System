import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const MarkAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [existingAttendance, setExistingAttendance] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      // Load classes assigned to this teacher (in real app, this would be filtered by teacher)
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .order('full_name');
      setStudents(studentsData || []);

      // Load existing attendance for the selected date
      await loadExistingAttendance();
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedClass || !attendanceDate) return;

    try {
      const { data: attendanceData } = await supabase
        .from('attendance_student')
        .select('*')
        .eq('attendance_date', attendanceDate)
        .in('student_id', students.map(s => s.id));

      setExistingAttendance(attendanceData || []);
      
      // Pre-fill attendance form with existing data
      const attendanceMap = {};
      attendanceData?.forEach(record => {
        attendanceMap[record.student_id] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading existing attendance:', error);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (students.length > 0) {
      loadExistingAttendance();
    }
  }, [attendanceDate, students]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        attendance_date: attendanceDate,
        status: attendance[student.id] || 'present',
        remarks: ''
      }));

      // First, delete existing attendance for this date and class
      const studentIds = students.map(s => s.id);
      await supabase
        .from('attendance_student')
        .delete()
        .eq('attendance_date', attendanceDate)
        .in('student_id', studentIds);

      // Insert new attendance records
      const { error } = await supabase
        .from('attendance_student')
        .insert(attendanceRecords);

      if (error) throw error;

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mark Student Attendance</h2>
        <p className="text-gray-600">Mark attendance for your assigned classes</p>
      </div>

      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <div className="bg-white border rounded-lg">
          <form onSubmit={handleSubmit}>
            {/* Form Header */}
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">
                Student Attendance - {new Date(attendanceDate).toLocaleDateString()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {students.length} students in class
              </p>
            </div>

            {/* Students List */}
            <div className="p-4">
              <div className="space-y-3">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{student.full_name}</span>
                      <span className="text-sm text-gray-500">({student.roll_number || 'N/A'})</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          attendance[student.id] === 'present' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          attendance[student.id] === 'absent' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          attendance[student.id] === 'late' 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">
                      {Object.values(attendance).filter(status => status === 'present').length}
                    </div>
                    <div className="text-gray-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-semibold">
                      {Object.values(attendance).filter(status => status === 'absent').length}
                    </div>
                    <div className="text-gray-600">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-600 font-semibold">
                      {Object.values(attendance).filter(status => status === 'late').length}
                    </div>
                    <div className="text-gray-600">Late</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t bg-gray-50">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 