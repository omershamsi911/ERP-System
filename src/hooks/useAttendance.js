import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendance.service';

export const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getAttendance(filters);
      setAttendance(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAttendance = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getAttendanceRecord(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance record');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (attendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.markAttendance(attendanceData);
      setAttendance(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAttendance = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.updateAttendance(id, updates);
      setAttendance(prev => prev.map(record => 
        record.id === id ? { ...record, ...data } : record
      ));
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update attendance');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAttendance = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await attendanceService.deleteAttendance(id);
      setAttendance(prev => prev.filter(record => record.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete attendance');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAttendanceReport = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getAttendanceReport(filters);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return {
    attendance,
    loading,
    error,
    fetchAttendance,
    getAttendance,
    markAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceReport
  };
};