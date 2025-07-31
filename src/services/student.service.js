import { supabase } from './supabase';

export const studentService = {
  async getStudents(filters = {}) {
    try {
      let query = supabase
        .from('students')
        .select('id, fullname, class, section, status, created_at, families(father_name), gr_number, dob, admission_date');

      if (filters.class) {
        query = query.eq('class', filters.class);
      }
      if (filters.section) {
        query = query.eq('section', filters.section);
      }
      if (filters.search) {
        // You may want to update this search logic for fullname
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch students');
    }
  },

  async getStudent(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, fullname, class, section, status, created_at, families(father_name), gr_number, dob, admission_date')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to fetch student');
    }
  },

  async createStudent(studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to create student');
    }
  },

  async updateStudent(id, updates) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Failed to update student');
    }
  },

  async deleteStudent(id) {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error('Failed to delete student');
    }
  },

  async getStudentStats() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, class, section'); // not class_id or section_id

      if (error) throw error;

      const stats = {
        total: data.length,
        byClass: {},
        bySection: {}
      };

      data.forEach(student => {
        if (student.class) {
          stats.byClass[student.class] = (stats.byClass[student.class] || 0) + 1;
        }
        if (student.section) {
          stats.bySection[student.section] = (stats.bySection[student.section] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      throw new Error('Failed to fetch student statistics');
    }
  }
};
