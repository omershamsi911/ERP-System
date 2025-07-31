import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';


const DailyReport = ({ date }) => {
  const [dailyData, setDailyData] = useState({
    admissions: [],
    feePayments: [],
    studentAttendance: [],
    staffAttendance: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        setLoading(true);
        
        // Fetch new admissions
        const { data: admissions, error: admissionsError } = await supabase
          .from('students')
          .select('*')
          .eq('admission_date', date);

        // Fetch fee payments
        const { data: feePayments, error: feeError } = await supabase
          .from('student_fee_payments')
          .select(`
            id,
            amount_paid,
            payment_method,
            student_fees:student_fees_id (
              student_id,
              students:student_id (fullname, gr_number, class)
            )
          `)
          .eq('payment_date', date);

        // Fetch student attendance
        const { data: studentAttendance, error: studentAttError } = await supabase
          .from('attendance_student')
          .select(`
            id,
            status,
            students:student_id (fullname, gr_number, class)
          `)
          .eq('attendance_date', date);

        // Fetch staff attendance
        const { data: staffAttendance, error: staffAttError } = await supabase
          .from('attendance_staff')
          .select(`
            id,
            status,
            users:staff_id (full_name)
          `)
          .eq('attendance_date', date);

        // Fetch expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('school_expenses')
          .select(`
            id,
            title,
            amount,
            expense_categories:category_id (name)
          `)
          .eq('expense_date', date);

        if (admissionsError || feeError || studentAttError || staffAttError || expensesError) {
          throw admissionsError || feeError || studentAttError || staffAttError || expensesError;
        }

        setDailyData({
          admissions,
          feePayments,
          studentAttendance,
          staffAttendance,
          expenses
        });
      } catch (error) {
        console.error('Error fetching daily data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyData();
  }, [date]);

  if (loading) return <div>Loading daily report...</div>;

  return (
    <div className="report-container">
      <h2>Daily Report for {date}</h2>
      
      <div className="report-section">
        <h3>New Admissions ({dailyData.admissions.length})</h3>
        {dailyData.admissions.length > 0 ? (
          <table className="report-table">
            <thead>
              <tr>
                <th>GR Number</th>
                <th>Name</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.admissions.map((student) => (
                <tr key={student.id}>
                  <td>{student.gr_number}</td>
                  <td>{student.fullname}</td>
                  <td>{student.class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No new admissions today</p>
        )}
      </div>

      <div className="report-section">
        <h3>Fee Payments ({dailyData.feePayments.length})</h3>
        {dailyData.feePayments.length > 0 ? (
          <>
            <table className="report-table">
              <thead>
                <tr>
                  <th>GR Number</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.feePayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.student_fees.students.gr_number}</td>
                    <td>{payment.student_fees.students.fullname}</td>
                    <td>{payment.student_fees.students.class}</td>
                    <td>{payment.amount_paid}</td>
                    <td>{payment.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Total Collected: {dailyData.feePayments.reduce((sum, p) => sum + p.amount_paid, 0)}</p>
          </>
        ) : (
          <p>No fee payments today</p>
        )}
      </div>

      <div className="report-section">
        <h3>Student Attendance</h3>
        <p>Present: {dailyData.studentAttendance.filter(a => a.status === 'present').length}</p>
        <p>Absent: {dailyData.studentAttendance.filter(a => a.status === 'absent').length}</p>
        <p>Late: {dailyData.studentAttendance.filter(a => a.status === 'late').length}</p>
      </div>

      <div className="report-section">
        <h3>Staff Attendance</h3>
        <p>Present: {dailyData.staffAttendance.filter(a => a.status === 'present').length}</p>
        <p>Absent: {dailyData.staffAttendance.filter(a => a.status === 'absent').length}</p>
        <p>Late: {dailyData.staffAttendance.filter(a => a.status === 'late').length}</p>
      </div>

      <div className="report-section">
        <h3>Expenses ({dailyData.expenses.length})</h3>
        {dailyData.expenses.length > 0 ? (
          <>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td>{expense.expense_categories.name}</td>
                    <td>{expense.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Total Expenses: {dailyData.expenses.reduce((sum, e) => sum + e.amount, 0)}</p>
          </>
        ) : (
          <p>No expenses today</p>
        )}
      </div>
    </div>
  );
};

export default DailyReport;