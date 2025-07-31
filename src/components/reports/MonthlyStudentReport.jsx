import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const MonthlyStudentReport = ({ month, year }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        // Fetch new admissions
        const { data: newAdmissions, error: admissionError } = await supabase
          .from('students')
          .select('*')
          .gte('admission_date', startDate)
          .lte('admission_date', endDate);

        if (admissionError) throw admissionError;

        // Fetch attendance summary
        const { data: attendanceData, error: attendanceError } = await supabase
          .rpc('get_monthly_attendance_summary', {
            month_param: month,
            year_param: year
          });

        if (attendanceError) throw attendanceError;

        // Combine data
        const combinedData = newAdmissions.map(student => {
          const attendance = attendanceData.find(a => a.student_id === student.id) || {};
          return {
            ...student,
            ...attendance
          };
        });

        setStudents(combinedData);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [month, year]);

  if (loading) return <div>Loading student report...</div>;

  return (
    <div className="report-container">
      <h2>Monthly Student Report ({month}/{year})</h2>
      
      <h3>New Admissions</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>GR Number</th>
            <th>Name</th>
            <th>Class</th>
            <th>Admission Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.filter(s => s.admission_date).map((student) => (
            <tr key={student.id}>
              <td>{student.gr_number}</td>
              <td>{student.fullname}</td>
              <td>{student.class}</td>
              <td>{student.admission_date}</td>
              <td>{student.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Attendance Summary</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>GR Number</th>
            <th>Name</th>
            <th>Class</th>
            <th>Present Days</th>
            <th>Absent Days</th>
            <th>Attendance %</th>
          </tr>
        </thead>
        <tbody>
          {students.filter(s => s.present_days).map((student) => (
            <tr key={student.id}>
              <td>{student.gr_number}</td>
              <td>{student.fullname}</td>
              <td>{student.class}</td>
              <td>{student.present_days}</td>
              <td>{student.absent_days}</td>
              <td>{student.attendance_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyStudentReport;