import { useState, useEffect, useCallback } from 'react';
import { studentService } from '../services/student.service';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudents(filters);
      setStudents(data);
      return data; // ✅ return data so it's usable outside
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
      return []; // ✅ return empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudent(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch student');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (studentData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.createStudent(studentData);
      setStudents(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create student');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.updateStudent(id, updates);
      setStudents(prev =>
        prev.map(student =>
          student.id === id ? { ...student, ...data } : student
        )
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update student');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await studentService.deleteStudent(id);
      setStudents(prev => prev.filter(student => student.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete student');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    fetchStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
  };
};
