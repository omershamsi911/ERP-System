import { supabase } from './supabase';

export const reportsService = {
  async getReports(filters = {}) {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          created_by:profiles(first_name, last_name, email)
        `);

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch reports');
    }
  },

  async getReport(id) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          created_by:profiles(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch report');
    }
  },

  async generateReport(reportType, filters = {}) {
    try {
      let reportData = null;

      switch (reportType) {
        case 'student':
          reportData = await this.generateStudentReport(filters);
          break;
        case 'attendance':
          reportData = await this.generateAttendanceReport(filters);
          break;
        case 'fees':
          reportData = await this.generateFeesReport(filters);
          break;
        case 'academic':
          reportData = await this.generateAcademicReport(filters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Save report to database
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          type: reportType,
          data: reportData,
          filters: filters,
          status: 'completed'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to generate report');
    }
  },

  async exportReport(reportId, format = 'pdf') {
    try {
      const report = await this.getReport(reportId);
      
      // In a real implementation, you would generate the actual file
      // For now, we'll return a mock export URL
      const exportData = {
        reportId,
        format,
        downloadUrl: `/api/reports/${reportId}/export?format=${format}`,
        generatedAt: new Date().toISOString()
      };

      return exportData;
    } catch (error) {
      throw new Error('Failed to export report');
    }
  },

  async saveReport(reportData) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to save report');
    }
  },

  async deleteReport(id) {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('Failed to delete report');
    }
  },

  async getReportTypes() {
    try {
      const reportTypes = [
        { id: 'student', name: 'Student Report', description: 'Student information and statistics' },
        { id: 'attendance', name: 'Attendance Report', description: 'Attendance records and analysis' },
        { id: 'fees', name: 'Fees Report', description: 'Fee collection and outstanding amounts' },
        { id: 'academic', name: 'Academic Report', description: 'Academic performance and grades' }
      ];

      return reportTypes;
    } catch (error) {
      throw new Error('Failed to fetch report types');
    }
  },

  // Helper methods for generating specific reports
  async generateStudentReport(filters = {}) {
    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          class:classes(name),
          section:sections(name)
        `);

      if (filters.class_id) {
        query = query.eq('class_id', filters.class_id);
      }
      if (filters.section_id) {
        query = query.eq('section_id', filters.section_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        totalStudents: data.length,
        byClass: this.groupBy(data, 'class.name'),
        bySection: this.groupBy(data, 'section.name'),
        students: data
      };
    } catch (error) {
      throw new Error('Failed to generate student report');
    }
  },

  async generateAttendanceReport(filters = {}) {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(first_name, last_name, email),
          class:classes(name),
          section:sections(name)
        `);

      if (filters.start_date && filters.end_date) {
        query = query.gte('date', filters.start_date).lte('date', filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      const present = data.filter(record => record.status === 'present').length;
      const absent = data.filter(record => record.status === 'absent').length;
      const late = data.filter(record => record.status === 'late').length;

      return {
        totalRecords: data.length,
        present,
        absent,
        late,
        attendanceRate: data.length > 0 ? Math.round((present / data.length) * 100) : 0,
        details: data
      };
    } catch (error) {
      throw new Error('Failed to generate attendance report');
    }
  },

  async generateFeesReport(filters = {}) {
    try {
      let query = supabase
        .from('fees')
        .select(`
          *,
          student:students(first_name, last_name, email),
          class:classes(name),
          section:sections(name)
        `);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalAmount = data.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const paidAmount = data.filter(fee => fee.status === 'paid')
        .reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);

      return {
        totalFees: data.length,
        totalAmount,
        paidAmount,
        outstandingAmount: totalAmount - paidAmount,
        paidCount: data.filter(fee => fee.status === 'paid').length,
        pendingCount: data.filter(fee => fee.status === 'pending').length,
        details: data
      };
    } catch (error) {
      throw new Error('Failed to generate fees report');
    }
  },

  async generateAcademicReport(filters = {}) {
    try {
      let query = supabase
        .from('academic_records')
        .select(`
          *,
          student:students(first_name, last_name, email),
          class:classes(name),
          section:sections(name)
        `);

      if (filters.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }

      const { data, error } = await query;

      if (error) throw error;

      const scores = data.map(record => record.score || 0).filter(score => score > 0);
      const averageScore = scores.length > 0 ? 
        Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

      return {
        totalRecords: data.length,
        averageScore,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        details: data
      };
    } catch (error) {
      throw new Error('Failed to generate academic report');
    }
  },

  // Utility method for grouping data
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = this.getNestedValue(item, key);
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  },

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }
};