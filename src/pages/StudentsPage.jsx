import React from 'react';
import { StudentList } from '../components/students/StudentList';
import { useTitle } from '../hooks/useTitle';

export const StudentsPage = () => {
  useTitle('Student Management');
  return (
    <div>
      <StudentList />
    </div>
  );
};