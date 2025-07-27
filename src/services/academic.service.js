import { supabase } from './supabase';

export const academicService = {
  async getAcademicData(filters = {}) {
    try {
      let query = supabase
        .from('academic_records')
        .select(`
          *,
          student:students(first_name, last_name, email),
          class:classes(name),
          section:sections(name)
        `);

      // Apply filters
      if (filters.student_id) {
        query = query.eq('student_id', filters.student_id);
      }
      if (filters.class_id) {
        query = query.eq('class_id', filters.class_id);
      }
      if (filters.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch academic data');
    }
  },

  async getAcademicRecord(id) {
    try {
      const { data, error } = await supabase
        .from('academic_records')
        .select(`
          *,
          student:students(first_name, last_name, email),
          class:classes(name),
          section:sections(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch academic record');
    }
  },

  async createAcademicRecord(recordData) {
    try {
      const { data, error } = await supabase
        .from('academic_records')
        .insert([recordData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to create academic record');
    }
  },

  async updateAcademicRecord(id, updates) {
    try {
      const { data, error } = await supabase
        .from('academic_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to update academic record');
    }
  },

  async deleteAcademicRecord(id) {
    try {
      const { error } = await supabase
        .from('academic_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('Failed to delete academic record');
    }
  },

  async getAcademicReport(filters = {}) {
    try {
      let query = supabase
        .from('academic_records')
        .select(`
          *,
          student:students(first_name, last_name, email),
          class:classes(name),
          section:sections(name)
        `);

      // Apply filters
      if (filters.student_id) {
        query = query.eq('student_id', filters.student_id);
      }
      if (filters.class_id) {
        query = query.eq('class_id', filters.class_id);
      }
      if (filters.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Process report data
      const report = {
        totalRecords: data.length,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        details: data
      };

      if (data.length > 0) {
        const scores = data.map(record => record.score || 0).filter(score => score > 0);
        if (scores.length > 0) {
          report.averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
          report.highestScore = Math.max(...scores);
          report.lowestScore = Math.min(...scores);
        }
      }

      return report;
    } catch (error) {
      throw new Error('Failed to fetch academic report');
    }
  },

  async getAcademicStats() {
    try {
      const { data, error } = await supabase
        .from('academic_records')
        .select('score, academic_year, class_id');

      if (error) throw error;

      const stats = {
        totalRecords: data.length,
        averageScore: 0,
        byYear: {},
        byClass: {}
      };

      if (data.length > 0) {
        const scores = data.map(record => record.score || 0).filter(score => score > 0);
        if (scores.length > 0) {
          stats.averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        }

        // Group by academic year
        data.forEach(record => {
          if (record.academic_year) {
            if (!stats.byYear[record.academic_year]) {
              stats.byYear[record.academic_year] = { count: 0, totalScore: 0 };
            }
            stats.byYear[record.academic_year].count++;
            stats.byYear[record.academic_year].totalScore += record.score || 0;
          }
        });

        // Group by class
        data.forEach(record => {
          if (record.class_id) {
            if (!stats.byClass[record.class_id]) {
              stats.byClass[record.class_id] = { count: 0, totalScore: 0 };
            }
            stats.byClass[record.class_id].count++;
            stats.byClass[record.class_id].totalScore += record.score || 0;
          }
        });
      }

      return stats;
    } catch (error) {
      throw new Error('Failed to fetch academic statistics');
    }
  }
};