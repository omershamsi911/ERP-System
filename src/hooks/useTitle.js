import { useEffect } from 'react';

export const useTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} - School ERP System` : 'School ERP System';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};