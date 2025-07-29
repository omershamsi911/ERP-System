import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../shared/DataTable';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useStudents } from '../../hooks/useStudents';
import { useNotification } from '../../hooks/useNotification';

export const StudentList = () => {
  const { students, loading, error, deleteStudent } = useStudents();
  const { showSuccess, showError } = useNotification();
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const result = await deleteStudent(studentId);
        if (result.success) {
          showSuccess('Student deleted successfully');
        } else {
          showError(result.error || 'Failed to delete student');
        }
      } catch (error) {
        showError('An error occurred while deleting the student');
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
        const deletePromises = selectedStudents.map(id => deleteStudent(id));
        await Promise.all(deletePromises);
        setSelectedStudents([]);
        showSuccess(`${selectedStudents.length} students deleted successfully`);
      } catch (error) {
        showError('An error occurred while deleting students');
      }
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">#{value}</span>
      )
    },
    {
      key: 'first_name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {row.first_name?.[0]}{row.last_name?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.first_name} {row.last_name}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'class',
      label: 'Class',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-900">
          {row.class?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'section',
      label: 'Section',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-900">
          {row.section?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : value === 'inactive'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/students/${row.id}`}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View
          </Link>
          <Link
            to={`/students/edit/${row.id}`}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Selected ({selectedStudents.length})
            </button>
          )}
          <Link
            to="/students/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Student
          </Link>
        </div>
      </div>

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
          // Handle row selection for bulk operations
          setSelectedStudents(prev => 
            prev.includes(row.id) 
              ? prev.filter(id => id !== row.id)
              : [...prev, row.id]
          );
        }}
      />
    </div>
  );
};