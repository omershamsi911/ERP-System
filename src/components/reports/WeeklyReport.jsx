import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';


const WeeklyReport = ({ startDate, endDate }) => {
  const [studentData, setStudentData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        
        // Fetch student attendance
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_student')
          .select(`
            id,
            student_id,
            attendance_date,
            status,
            students:student_id (fullname, class, gr_number)
          `)
          .gte('attendance_date', startDate)
          .lte('attendance_date', endDate);

        if (attendanceError) throw attendanceError;

        // Fetch fee payments
        const { data: feePayments, error: feeError } = await supabase
          .from('student_fee_payments')
          .select(`
            id,
            amount_paid,
            payment_date,
            student_fees:student_fee_id (
              student_id,
              students:student_id (fullname, class, gr_number)
            )
          `)
          .gte('payment_date', startDate)
          .lte('payment_date', endDate);

        if (feeError) throw feeError;

        // Process attendance data to count by student
        const attendanceByStudent = attendanceData.reduce((acc, record) => {
          if (!acc[record.student_id]) {
            acc[record.student_id] = {
              student: record.students,
              present: 0,
              absent: 0,
              late: 0
            };
          }
          if (record.status === 'present') acc[record.student_id].present++;
          else if (record.status === 'absent') acc[record.student_id].absent++;
          else if (record.status === 'late') acc[record.student_id].late++;
          return acc;
        }, {});

        setStudentData(Object.values(attendanceByStudent));
        setFeeData(feePayments);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading weekly report...</div>;

  return (
    <div className="report-container">
      <h2>Weekly Report ({startDate} to {endDate})</h2>
      
      <div className="report-section">
        <h3>Student Attendance</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>GR Number</th>
              <th>Name</th>
              <th>Class</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
              <tr key={student.student.id}>
                <td>{student.student.gr_number}</td>
                <td>{student.student.fullname}</td>
                <td>{student.student.class}</td>
                <td>{student.present}</td>
                <td>{student.absent}</td>
                <td>{student.late}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="report-section">
        <h3>Fee Collections</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>GR Number</th>
              <th>Name</th>
              <th>Class</th>
              <th>Payment Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {feeData.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.student_fees.students.gr_number}</td>
                <td>{payment.student_fees.students.fullname}</td>
                <td>{payment.student_fees.students.class}</td>
                <td>{payment.payment_date}</td>
                <td>{payment.amount_paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="report-summary">
          <p>Total Collected: {feeData.reduce((sum, payment) => sum + payment.amount_paid, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;