import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { formatDateForInput } from '../utils/helpers';

export const EditStudentPage = () => {
  const { id } = useParams();
  const { getStudent, updateStudent, loading, error } = useStudents();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchStudent = async () => {
      const student = await getStudent(id);
      if (student) {
        setFormData({
          fullname: student.fullname || '',
          gr_number: student.gr_number || '',
          class: student.class || '',
          section: student.section || '',
          dob: formatDateForInput(student.dob),
          admission_date: formatDateForInput(student.admission_date),
          status: student.status || 'active',
          email: student.email || '',
          contact_number: student.contact_number || ''
        });
      }
    };
    fetchStudent();
  }, [id, getStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const result = await updateStudent(id, formData);
      if (result.success) {
        navigate(`/students/${id}`);
      }
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  if (!formData) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Student</h1>
        <button onClick={() => navigate(`/students/${id}`)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">Back to Student</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${errors.fullname ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.fullname && <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GR Number *</label>
              <input type="text" name="gr_number" value={formData.gr_number} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${errors.gr_number ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.gr_number && <p className="mt-1 text-sm text-red-600">{errors.gr_number}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <input type="text" name="class" value={formData.class} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${errors.class ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.class && <p className="mt-1 text-sm text-red-600">{errors.class}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <input type="text" name="section" value={formData.section} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${errors.section ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.section && <p className="mt-1 text-sm text-red-600">{errors.section}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${errors.dob ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
              <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-gray-300">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-gray-300" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
        </div>
      </form>
    </div>
  );
}; 