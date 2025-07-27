import { useState, useEffect, useCallback } from 'react';
import { feesService } from '../services/fees.service';

export const useFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFees = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await feesService.getFees(filters);
      setFees(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  }, []);

  const getFee = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await feesService.getFee(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch fee');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFee = useCallback(async (feeData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await feesService.createFee(feeData);
      setFees(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create fee');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFee = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await feesService.updateFee(id, updates);
      setFees(prev => prev.map(fee => 
        fee.id === id ? { ...fee, ...data } : fee
      ));
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update fee');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFee = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await feesService.deleteFee(id);
      setFees(prev => prev.filter(fee => fee.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete fee');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const payFee = useCallback(async (id, paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await feesService.payFee(id, paymentData);
      setFees(prev => prev.map(fee => 
        fee.id === id ? { ...fee, ...data } : fee
      ));
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return {
    fees,
    loading,
    error,
    fetchFees,
    getFee,
    createFee,
    updateFee,
    deleteFee,
    payFee
  };
};