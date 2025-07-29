import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { formatDateForInput } from '../utils/helpers';

const AddStudentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state with separated student and family data
  const [formData, setFormData] = useState({
    student: {
      fullname: '',
      gr_number: '',
      class: '',
      section: '',
      dob: '',
      admission_date: formatDateForInput(new Date()),
      status: 'active',
    },
    family: {
      father_name: '',
      family_name: '',
      contact_number: '',
      email: '',
      address: ''
    }
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when field changes
    if (errors[section]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: null
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      student: {},
      family: {}
    };
    
    // Student validations
    if (!formData.student.fullname.trim()) newErrors.student.fullname = 'Full name is required';
    if (!formData.student.gr_number.trim()) newErrors.student.gr_number = 'GR Number is required';
    if (!formData.student.class) newErrors.student.class = 'Class is required';
    if (!formData.student.section) newErrors.student.section = 'Section is required';
    if (!formData.student.dob) newErrors.student.dob = 'Date of birth is required';
    
    // Family validations
    if (!formData.family.father_name.trim()) newErrors.family.father_name = "Father's name is required";
    if (!formData.family.family_name.trim()) newErrors.family.family_name = 'Family name is required';
    if (!formData.family.contact_number.trim()) newErrors.family.contact_number = 'Contact number is required';
    if (!formData.family.address.trim()) newErrors.family.address = 'Address is required';
    
    setErrors(newErrors);
    
    return (
      Object.keys(newErrors.student).length === 0 && 
      Object.keys(newErrors.family).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert([formData.family])
        .select()
        .single();
      
      if (familyError) throw familyError;
      
      // 2. Create student
      const { error: studentError } = await supabase
        .from('students')
        .insert([{
          ...formData.student,
          family_id: family.id,
          is_eldest: true // First student in family is eldest
        }]);
      
      if (studentError) throw studentError;
      
      navigate('/students');
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
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
          <h2 className="text-lg font-semibold mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="student.fullname"
                value={formData.student.fullname}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.student?.fullname ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.student?.fullname && (
                <p className="mt-1 text-sm text-red-600">{errors.student.fullname}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GR Number *
              </label>
              <input
                type="text"
                name="student.gr_number"
                value={formData.student.gr_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.student?.gr_number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.student?.gr_number && (
                <p className="mt-1 text-sm text-red-600">{errors.student.gr_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class *
              </label>
              <select
                name="student.class"
                value={formData.student.class}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.student?.class ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Class</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    Class {i + 1}
                  </option>
                ))}
              </select>
              {errors.student?.class && (
                <p className="mt-1 text-sm text-red-600">{errors.student.class}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <select
                name="student.section"
                value={formData.student.section}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.student?.section ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D'].map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
              {errors.student?.section && (
                <p className="mt-1 text-sm text-red-600">{errors.student.section}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="student.dob"
                value={formData.student.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.student?.dob ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.student?.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.student.dob}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                name="student.admission_date"
                value={formData.student.admission_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Family Info Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold mb-4">Family Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name *
              </label>
              <input
                type="text"
                name="family.father_name"
                value={formData.family.father_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.family?.father_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.family?.father_name && (
                <p className="mt-1 text-sm text-red-600">{errors.family.father_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Family Name *
              </label>
              <input
                type="text"
                name="family.family_name"
                value={formData.family.family_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.family?.family_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.family?.family_name && (
                <p className="mt-1 text-sm text-red-600">{errors.family.family_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                name="family.contact_number"
                value={formData.family.contact_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.family?.contact_number ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.family?.contact_number && (
                <p className="mt-1 text-sm text-red-600">{errors.family.contact_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="family.email"
                value={formData.family.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                name="family.address"
                value={formData.family.address}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.family?.address ? 'border-red-500' : 'border-gray-300'
                }`}
              ></textarea>
              {errors.family?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.family.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="pb-6">
          <h2 className="text-lg font-semibold mb-4">Student Status</h2>
          <div className="flex items-center space-x-4">
            {['active', 'inactive'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  name="student.status"
                  value={status}
                  checked={formData.student.status === status}
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