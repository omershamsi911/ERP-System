import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';


const AdmissionReport = ({ startDate, endDate }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmissionData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('students')
          .select(`
            id,
            fullname,
            gr_number,
            class,
            section,
            admission_date,
            status,
            families:family_id (
              father_name,
              contact_number
            )
          `)
          .gte('admission_date', startDate)
          .lte('admission_date', endDate)
          .order('admission_date', { ascending: false });

        if (error) throw error;
        setAdmissions(data);
      } catch (error) {
        console.error('Error fetching admission data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissionData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading admission report...</div>;

  return (
    <div className="report-container">
      <h2>Admission Report ({startDate} to {endDate})</h2>
      
      <table className="report-table">
        <thead>
          <tr>
            <th>Admission Date</th>
            <th>GR Number</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Section</th>
            <th>Father's Name</th>
            <th>Contact</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {admissions.map((student) => (
            <tr key={student.id}>
              <td>{student.admission_date}</td>
              <td>{student.gr_number}</td>
              <td>{student.fullname}</td>
              <td>{student.class}</td>
              <td>{student.section}</td>
              <td>{student.families.father_name}</td>
              <td>{student.families.contact_number}</td>
              <td>{student.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="report-summary">
        <h3>Summary</h3>
        <p>Total Admissions: {admissions.length}</p>
        <p>Active: {admissions.filter(s => s.status === 'active').length}</p>
        <p>Inactive: {admissions.filter(s => s.status !== 'active').length}</p>
      </div>
    </div>
  );
};

export default AdmissionReport;