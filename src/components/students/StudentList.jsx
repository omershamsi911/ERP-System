import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../shared/DataTable';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useStudents } from '../../hooks/useStudents';
import { useNotification } from '../../hooks/useNotification';
import { supabase } from '../../services/supabase';

export const StudentList = () => {
  const { students, loading, error, deleteStudent, updateStudent } = useStudents();
  const { showSuccess, showError } = useNotification();
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [families, setFamilies] = useState([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Fetch families for the dropdown
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const { data, error } = await supabase
          .from('families')
          .select('id, father_name, family_name')
          .order('father_name');
        
        if (error) throw error;
        setFamilies(data || []);
      } catch (error) {
        console.error('Error fetching families:', error);
      }
    };

    fetchFamilies();
  }, []);

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setLoadingUpdate(true);
        
        // Delete from Supabase
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentId);

        if (error) throw error;

        // Update local state or refetch
        const result = await deleteStudent(studentId);
        if (result.success) {
          showSuccess('Student deleted successfully');
        } else {
          showError(result.error || 'Failed to delete student');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        showError('An error occurred while deleting the student');
      } finally {
        setLoadingUpdate(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      showError('Please select students to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) {
      try {
        setLoadingUpdate(true);
        
        // Delete from Supabase
        const { error } = await supabase
          .from('students')
          .delete()
          .in('id', selectedStudents);

        if (error) throw error;

        // Update local state
        const deletePromises = selectedStudents.map(id => deleteStudent(id));
        await Promise.all(deletePromises);
        setSelectedStudents([]);
        showSuccess(`${selectedStudents.length} students deleted successfully`);
      } catch (error) {
        console.error('Error deleting students:', error);
        showError('An error occurred while deleting students');
      } finally {
        setLoadingUpdate(false);
      }
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student.id);
    setEditFormData({
      fullname: student.fullname,
      dob: student.dob,
      family_id: student.family_id,
      admission_date: student.admission_date,
      gr_number: student.gr_number,
      class: student.class,
      section: student.section,
      status: student.status
    });
  };

  const handleEditCancel = () => {
    setEditingStudent(null);
    setEditFormData({});
  };

  const handleEditSave = async (studentId) => {
    try {
      setLoadingUpdate(true);
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('students')
        .update(editFormData)
        .eq('id', studentId)
        .select(`
          *,
          families (
            id,
            father_name,
            family_name,
            contact_number,
            email,
            address
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      const result = await updateStudent(studentId, editFormData);
      if (result.success) {
        showSuccess('Student updated successfully');
        setEditingStudent(null);
        setEditFormData({});
      } else {
        showError(result.error || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      showError('An error occurred while updating the student');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderEditableCell = (value, field, studentId, type = 'text', options = null) => {
    if (editingStudent === studentId) {
      if (type === 'select') {
        return (
          <select
            value={editFormData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      } else if (type === 'family_select') {
        return (
          <select
            value={editFormData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Family</option>
            {families.map(family => (
              <option key={family.id} value={family.id}>
                {family.father_name} ({family.family_name})
              </option>
            ))}
          </select>
        );
      } else {
        return (
          <input
            type={type}
            value={editFormData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      }
    }
    
    return <span className="text-sm text-gray-900">{value}</span>;
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value.slice(0, 8)}</span>
      )
    },
    {
      key: 'fullname',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm font-medium text-gray-900">
          {renderEditableCell(value, 'fullname', row.id)}
        </div>
      )
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-900">
          {editingStudent === row.id ? 
            renderEditableCell(value, 'dob', row.id, 'date') :
            <span>{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
          }
        </div>
      )
    },
    {
      key: 'gr_number',
      label: 'GR Number',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-900">
          {renderEditableCell(value || 'N/A', 'gr_number', row.id)}
        </div>
      )
    },
    {
      key: 'class',
      label: 'Class',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-900">
          {renderEditableCell(value, 'class', row.id)}
        </div>
      )
    },
    {
      key: 'section',
      label: 'Section',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-900">
          {renderEditableCell(value, 'section', row.id)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, row) => {
        if (editingStudent === row.id) {
          return renderEditableCell(value, 'status', row.id, 'select', [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'pending', label: 'Pending' }
          ]);
        }
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'active' 
              ? 'bg-green-100 text-green-800' 
              : value === 'inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'admission_date',
      label: 'Admission Date',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-500">
          {editingStudent === row.id ? 
            renderEditableCell(value, 'admission_date', row.id, 'date') :
            <span>{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
          }
        </div>
      )
    },
    {
      key: 'families',
      label: "Father's Name",
      sortable: false,
      render: (value, row) => {
        if (editingStudent === row.id) {
          return renderEditableCell(value?.father_name || 'N/A', 'family_id', row.id, 'family_select');
        }
        return <span className="text-sm text-gray-900">{value?.father_name || 'N/A'}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {editingStudent === row.id ? (
            <>
              <button
                onClick={() => handleEditSave(row.id)}
                disabled={loadingUpdate}
                className="text-green-600 hover:text-green-900 text-sm font-medium disabled:opacity-50"
              >
                {loadingUpdate ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleEditCancel}
                disabled={loadingUpdate}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <Link
                to={`/students/view/${row.id}`}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                View
              </Link>
              <button
                onClick={() => handleEditClick(row)}
                disabled={loadingUpdate || editingStudent !== null}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                disabled={loadingUpdate || editingStudent !== null}
                className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
              >
                {loadingUpdate ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading students
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage student information and records
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          {selectedStudents.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={loadingUpdate || editingStudent !== null}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loadingUpdate ? 'Deleting...' : `Delete Selected (${selectedStudents.length})`}
            </button>
          )}
          <Link
            to="/students/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Student
          </Link>
        </div>
      </div>

      {/* Loading overlay for updates */}
      {loadingUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <LoadingSpinner size="small" />
            <span className="text-sm text-gray-700">Updating...</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Students
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => s.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    New This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => {
                      const created = new Date(s.created_at);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && 
                             created.getFullYear() === now.getFullYear();
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inactive Students
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {students.filter(s => s.status === 'inactive').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={students}
        columns={columns}
        loading={loading}
        searchable={true}
        pagination={true}
        itemsPerPage={10}
        onRowClick={(row) => {
          // Only allow row selection if not editing
          if (editingStudent === null) {
            setSelectedStudents(prev => 
              prev.includes(row.id) 
                ? prev.filter(id => id !== row.id)
                : [...prev, row.id]
            );
          }
        }}
      />
    </div>
  );
};