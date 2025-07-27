import { useState, useEffect, useCallback } from 'react';
import { academicService } from '../services/academic.service';

export const useAcademic = () => {
  const [academicData, setAcademicData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAcademicData = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getAcademicData(filters);
      setAcademicData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch academic data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAcademicRecord = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getAcademicRecord(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch academic record');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAcademicRecord = useCallback(async (recordData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.createAcademicRecord(recordData);
      setAcademicData(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create academic record');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAcademicRecord = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.updateAcademicRecord(id, updates);
      setAcademicData(prev => prev.map(record => 
        record.id === id ? { ...record, ...data } : record
      ));
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update academic record');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAcademicRecord = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await academicService.deleteAcademicRecord(id);
      setAcademicData(prev => prev.filter(record => record.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete academic record');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAcademicReport = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getAcademicReport(filters);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch academic report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicData();
  }, [fetchAcademicData]);

  return {
    academicData,
    loading,
    error,
    fetchAcademicData,
    getAcademicRecord,
    createAcademicRecord,
    updateAcademicRecord,
    deleteAcademicRecord,
    getAcademicReport
  };
};