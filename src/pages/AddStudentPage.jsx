import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { formatDateForInput } from '../utils/helpers';

const AddStudentPage = () => {
  const { createStudent, loading, error } = useStudents();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullname: '',
    gr_number: '',
    class: '',
    section: '',
    dob: '',
    admission_date: formatDateForInput(new Date()),
    status: 'active',
    email: '',
    contact_number: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!formData.gr_number.trim()) newErrors.gr_number = 'GR Number is required';
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.section) newErrors.section = 'Section is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await createStudent(formData);
      if (result.success) {
        navigate(`/students/${result.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create student:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Student</h1>
        <button 
          onClick={() => navigate('/students')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Back to Students
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.fullname ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fullname && (
                <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GR Number *
              </label>
              <input
                type="text"
                name="gr_number"
                value={formData.gr_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.gr_number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.gr_number && (
                <p className="mt-1 text-sm text-red-600">{errors.gr_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.class ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Class</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    Class {i + 1}
                  </option>
                ))}
              </select>
              {errors.class && (
                <p className="mt-1 text-sm text-red-600">{errors.class}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.section ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D'].map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
              {errors.section && (
                <p className="mt-1 text-sm text-red-600">{errors.section}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.dob ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="pb-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="flex items-center space-x-4">
            {['active', 'inactive'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700 capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Create Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;
export { AddStudentPage };