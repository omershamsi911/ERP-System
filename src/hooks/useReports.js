import { useState, useEffect, useCallback } from 'react';
import { reportsService } from '../services/reports.service';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getReports(filters);
      setReports(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const getReport = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getReport(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (reportType, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.generateReport(reportType, filters);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (reportId, format = 'pdf') => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.exportReport(reportId, format);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to export report');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.saveReport(reportData);
      setReports(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to save report');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.deleteReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete report');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getReportTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getReportTypes();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch report types');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    getReport,
    generateReport,
    exportReport,
    saveReport,
    deleteReport,
    getReportTypes
  };
};