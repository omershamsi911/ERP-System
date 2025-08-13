import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Edit, Trash2, Plus, ChevronDown, Search } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

const AttendancePage = () => {
   const { hasPermission } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');







    const canViewPage = hasPermission('manage_student_attendance_page');
    const canAddManual = hasPermission('add_manual_attendance');
    const canEdit = hasPermission('edit_attendance');
    const canDelete = hasPermission('delete_attendance');


  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    attendance_date: selectedDate,
    status: 'present',
    remarks: 'ontime'
  });

  // Fetch classes and sections
  useEffect(() => {
    const fetchClassesAndSections = async () => {
      try {
        // Fetch unique classes
        const { data: classData, error: classError } = await supabase
          .from('students')
          .select('class')
          .not('class', 'is', null);
        
        if (classError) throw classError;
        
        const uniqueClasses = [...new Set(classData.map(item => item.class))];
        setClasses(uniqueClasses);
        
        // Fetch unique sections
        const { data: sectionData, error: sectionError } = await supabase
          .from('students')
          .select('section')
          .not('section', 'is', null);
        
        if (sectionError) throw sectionError;
        
        const uniqueSections = [...new Set(sectionData.map(item => item.section))];
        setSections(uniqueSections);
      } catch (err) {
        console.error('Error fetching classes/sections:', err.message);
      }
    };
    
    fetchClassesAndSections();
  }, []);


  const goToPreviousDay = () => {
  const prevDay = new Date(selectedDate);
  prevDay.setDate(prevDay.getDate() - 1);
  setSelectedDate(prevDay.toISOString().split('T')[0]);
};

const goToNextDay = () => {
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  setSelectedDate(nextDay.toISOString().split('T')[0]);
};

// Add keyboard event listener
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.keyCode === 37) { // Left arrow key
      goToPreviousDay();
    } else if (e.keyCode === 39) { // Right arrow key
      goToNextDay();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [selectedDate]);

  // Fetch students and attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build student query with filters
        let studentQuery = supabase
          .from('students')
          .select('id, fullname, gr_number, class, section');
        
        if (selectedClass) {
          studentQuery = studentQuery.eq('class', selectedClass);
        }
        
        if (selectedSection) {
          studentQuery = studentQuery.eq('section', selectedSection);
        }
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await studentQuery;
        
        if (studentsError) throw studentsError;
        
        // Fetch attendance for selected date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_student')
          .select('*')
          .eq('attendance_date', selectedDate);
        
        if (attendanceError) throw attendanceError;
        
        setStudents(studentsData || []);
        setAttendanceRecords(attendanceData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDate, selectedClass, selectedSection]);

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle class filter change
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  // Handle section filter change
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // Filter students based on search term and filters
  const filteredStudents = students.filter(student => 
    student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.gr_number.toString().includes(searchTerm) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Handle status change
  const handleStatusChange = async (studentId, newStatus) => {
    try {
      setLoading(true);
      
      // Check if record already exists
      const existingRecord = attendanceRecords.find(record => 
        record.student_id === studentId && record.attendance_date === selectedDate
      );

      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance_student')
          .update({ status: newStatus })
          .eq('id', existingRecord.id)
          .select();
        
        if (error) throw error;
        
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.id === existingRecord.id ? data[0] : record
          )
        );
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance_student')
          .insert([{
            student_id: studentId,
            attendance_date: selectedDate,
            status: newStatus,
            remarks: 'ontime'
          }])
          .select();
        
        if (error) throw error;
        
        setAttendanceRecords(prev => [...prev, data[0]]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle remarks change
  const handleRemarksChange = async (recordId, newRemarks) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('attendance_student')
        .update({ remarks: newRemarks })
        .eq('id', recordId)
        .select();
      
      if (error) throw error;
      
      setAttendanceRecords(prev => 
        prev.map(record => 
          record.id === recordId ? data[0] : record
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      student_id: record.student_id,
      attendance_date: record.attendance_date,
      status: record.status,
      remarks: record.remarks
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance_student')
          .update(formData)
          .eq('id', editingRecord.id)
          .select();
        
        if (error) throw error;
        
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.id === editingRecord.id ? data[0] : record
          )
        );
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance_student')
          .insert([formData])
          .select();
        
        if (error) throw error;
        
        setAttendanceRecords(prev => [...prev, data[0]]);
      }
      
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        setLoading(true);
        
        const { error } = await supabase
          .from('attendance_student')
          .delete()
          .eq('id', recordId);
        
        if (error) throw error;
        
        setAttendanceRecords(prev => prev.filter(record => record.id !== recordId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get attendance status for a student
  const getAttendanceStatus = (studentId) => {
    const record = attendanceRecords.find(record => 
      record.student_id === studentId && record.attendance_date === selectedDate
    );
    return record ? record.status : null;
  };

  // Get attendance remarks for a student
  const getAttendanceRemarks = (studentId) => {
    const record = attendanceRecords.find(record => 
      record.student_id === studentId && record.attendance_date === selectedDate
    );
    return record ? record.remarks : null;
  };

  if (loading && !attendanceRecords.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
     <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Student Attendance</h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Updated Date Selector with Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={goToPreviousDay}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Previous day"
              >
                <ChevronDown className="transform rotate-90 w-5 h-5 text-gray-600" />
              </button>
              
              <div className="w-full md:w-auto">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button 
                onClick={goToNextDay}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Next day"
              >
                <ChevronDown className="transform -rotate-90 w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map((classItem) => (
                  <option key={classItem} value={classItem}>
                    {classItem}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="section-filter" className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                id="section-filter"
                value={selectedSection}
                onChange={handleSectionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by name, roll #, or class"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="mr-2" size={18} />
            Add Manual Entry
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const status = getAttendanceStatus(student.id);
                  const remarks = getAttendanceRemarks(student.id);
                  const record = attendanceRecords.find(record => 
                    record.student_id === student.id && record.attendance_date === selectedDate
                  );
                  
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.gr_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.fullname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.class}
                      </td>
                     
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        disabled={!canEdit}
                        className={`px-3 py-1 rounded-md text-sm ${status === 'present' ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-500 hover:bg-gray-100'} ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Check className="inline mr-1" size={16} /> Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        disabled={!canEdit}
                        className={`px-3 py-1 rounded-md text-sm ${status === 'absent' ? 'bg-red-100 text-red-800 font-medium' : 'text-gray-500 hover:bg-gray-100'} ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <X className="inline mr-1" size={16} /> Absent
                      </button>
                    </div>
                  </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                    {status && canEdit && (
                      <select
                        value={remarks || 'ontime'}
                        onChange={(e) => handleRemarksChange(record.id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="ontime">On Time</option>
                        <option value="late">Late</option>
                        <option value="leave">Leave</option>
                      </select>
                    )}
                  </td>
                  
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {record && (canEdit || canDelete) && (
                      <div className="flex justify-end space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => openEditModal(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Attendance Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Summary for {new Date(selectedDate).toLocaleDateString()}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Present</p>
            <p className="text-2xl font-bold text-green-800">
              {attendanceRecords.filter(r => r.status === 'present').length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Absent</p>
            <p className="text-2xl font-bold text-red-800">
              {attendanceRecords.filter(r => r.status === 'absent').length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Students</p>
            <p className="text-2xl font-bold text-blue-800">
              {students.length}
            </p>
          </div>
        </div>
      </div>
       {canAddManual && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="mr-2" size={18} />
          Add Manual Entry
        </button>
      )}
      
      <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center ${isModalOpen ? 'block' : 'hidden'}`}>
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
    <div className="flex justify-between items-center p-4 border-b">
      <h3 className="text-xl font-bold text-gray-800">
        {editingRecord ? 'Edit Attendance Record' : 'Add New Attendance Record'}
      </h3>
      <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>
    </div>
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.roll_number}) - {student.class}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="attendance_date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  id="attendance_date"
                  name="attendance_date"
                  value={formData.attendance_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="present"
                      checked={formData.status === 'present'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Present</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="absent"
                      checked={formData.status === 'absent'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Absent</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <select
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ontime">On Time</option>
                  <option value="late">Late</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;