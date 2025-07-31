import { supabase } from './supabase';

export const attendanceService = {
  async getAttendance(filters = {}) {
    try {
      let query = supabase
        .from('attendance_student')
        .select('*');

      if (filters.student_id) query = query.eq('student_id', filters.student_id);
      if (filters.class_id) query = query.eq('class_id', filters.class_id);
      if (filters.date) query = query.eq('attendance_date', filters.date);
      if (filters.status) query = query.eq('status', filters.status);

      const { data, error } = await query.order('attendance_date', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance');
    }
  },

  async getAttendanceRecord(id) {
    try {
      const { data, error } = await supabase
        .from('attendance_student')
        .select(`*`)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance record');
    }
  },

  async markAttendance(attendanceData) {
    try {
      const { data, error } = await supabase
        .from('attendance_student')
        .insert([{
          ...attendanceData,
          attendance_date: attendanceData.attendance_date || new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to mark attendance');
    }
  },

  async updateAttendance(id, updates) {
    try {
      const { data, error } = await supabase
        .from('attendance_student')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to update attendance');
    }
  },

  async deleteAttendance(id) {
    try {
      const { error } = await supabase
        .from('attendance_student')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('Failed to delete attendance');
    }
  },

  async getAttendanceReport(filters = {}) {
    try {
      let query = supabase
        .from('attendance_student')
        .select(`*`);

      if (filters.student_id) query = query.eq('student_id', filters.student_id);
      if (filters.class_id) query = query.eq('class_id', filters.class_id);
      if (filters.start_date && filters.end_date) {
        query = query
          .gte('attendance_date', filters.start_date)
          .lte('attendance_date', filters.end_date);
      }

      const { data, error } = await query.order('attendance_date', { ascending: false });
      if (error) throw error;

      const report = {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendancePercentage: 0,
        details: data
      };

      if (data.length > 0) {
        report.totalDays = data.length;
        report.presentDays = data.filter(r => r.status === 'present').length;
        report.absentDays = data.filter(r => r.status === 'absent').length;
        report.lateDays = data.filter(r => r.status === 'late').length;
        report.attendancePercentage = Math.round((report.presentDays / report.totalDays) * 100);
      }

      return report;
    } catch (error) {
      throw new Error('Failed to fetch attendance report');
    }
  },

  async getAttendanceStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_student')
        .select('status, attendance_date')
        .eq('attendance_date', today);

      if (error) throw error;

      const stats = {
        total: data.length,
        present: data.filter(r => r.status === 'present').length,
        absent: data.filter(r => r.status === 'absent').length,
        late: data.filter(r => r.status === 'late').length,
        attendanceRate: data.length > 0 ?
          Math.round((data.filter(r => r.status === 'present').length / data.length) * 100) : 0
      };

      return stats;
    } catch (error) {
      throw new Error('Failed to fetch attendance statistics');
    }
  }
};
