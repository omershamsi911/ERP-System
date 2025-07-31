import React from 'react';
import {useTitle} from "../hooks/useTitle";
import ReportWrapper from '../components/reports/ReportWrapper'

export const ReportsPage = () => {
  useTitle('Student Fee Management Tab');
  return (
    <div>
      <ReportWrapper/>
    </div>
  );
};