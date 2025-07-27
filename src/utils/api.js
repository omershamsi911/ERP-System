import { supabase } from '../services/supabase';

// Generic API response handler
export const handleApiResponse = (response, error) => {
  if (error) {
    return {
      success: false,
      error: error.message || 'An error occurred',
      data: null
    };
  }
  
  return {
    success: true,
    data: response,
    error: null
  };
};

// Generic error handler
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.code === 'PGRST116') {
    return {
      success: false,
      error: 'No records found',
      data: null
    };
  }
  
  if (error.code === '23505') {
    return {
      success: false,
      error: 'Record already exists',
      data: null
    };
  }
  
  if (error.code === '23503') {
    return {
      success: false,
      error: 'Cannot delete record - it is referenced by other records',
      data: null
    };
  }
  
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    data: null
  };
};

// Generic success handler
export const handleApiSuccess = (data, message = 'Operation completed successfully') => {
  return {
    success: true,
    data,
    message,
    error: null
  };
};

// File upload helper
export const uploadFile = async (file, bucket = 'general', path = '') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        path: filePath,
        url: publicUrl
      }
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Download file helper
export const downloadFile = async (path, bucket = 'general') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete file helper
export const deleteFile = async (path, bucket = 'general') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return {
      success: true,
      data: null
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Pagination helper
export const createPagination = (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  return {
    from,
    to,
    page,
    limit
  };
};

// Search helper
export const createSearchFilter = (searchTerm, fields = []) => {
  if (!searchTerm || !fields.length) return null;
  
  const searchFilters = fields.map(field => `${field}.ilike.%${searchTerm}%`);
  return searchFilters.join(',');
};

// Date range helper
export const createDateRangeFilter = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  return {
    start: startDate,
    end: endDate
  };
};

// Sort helper
export const createSortFilter = (sortBy, sortOrder = 'asc') => {
  if (!sortBy) return null;
  
  return {
    column: sortBy,
    order: sortOrder
  };
};