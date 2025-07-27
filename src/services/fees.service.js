import { supabase } from './supabase';

export const feesService = {
  async getFees(filters = {}) {
    try {
      let query = supabase
        .from('student_fees')
        .select('*');

      if (filters.student_id) {
        query = query.eq('student_id', filters.student_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.due_date) {
        query = query.gte('due_date', filters.due_date);
      }

      // NOTE: Removed class/section filtering because we no longer join with student table
      const { data, error } = await query.order('due_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch fees');
    }
  },

  async getFee(id) {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('*') // Removed join with student and payments
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch fee');
    }
  },

  async createFee(feeData) {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .insert([feeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to create fee');
    }
  },

  async updateFee(id, updates) {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to update fee');
    }
  },

  async deleteFee(id) {
    try {
      const { error } = await supabase
        .from('student_fees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('Failed to delete fee');
    }
  },

  async payFee(id, paymentData) {
    try {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          fee_id: id,
          ...paymentData,
          payment_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      const { data: fee, error: feeError } = await supabase
        .from('student_fees')
        .update({ 
          status: 'paid',
          paid_amount: paymentData.amount,
          paid_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (feeError) throw feeError;

      return { payment, fee };
    } catch (error) {
      throw new Error('Failed to process payment');
    }
  },

  async getFeeStats() {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('amount, status, due_date');

      if (error) throw error;

      const stats = {
        total: data.length,
        totalAmount: data.reduce((sum, fee) => sum + (fee.amount || 0), 0),
        paid: data.filter(fee => fee.status === 'paid').length,
        pending: data.filter(fee => fee.status === 'pending').length,
        overdue: data.filter(fee =>
          fee.status === 'pending' &&
          new Date(fee.due_date) < new Date()
        ).length
      };

      return stats;
    } catch (error) {
      throw new Error('Failed to fetch fee statistics');
    }
  }
};
