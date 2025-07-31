import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const FeesReport = ({ startDate, endDate }) => {
  const [feesData, setFeesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeesData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('student_fee_payments')
          .select(`
            id,
            amount_paid,
            payment_date,
            payment_method,
            student_fees (
              student_id,
              fee_type,
              total_amount,
              discount_amount,
              fine_amount,
              students(fullname, class, gr_number)
            )
          `)
          .gte('payment_date', startDate)
          .lte('payment_date', endDate)
          .order('payment_date', { ascending: false });

        if (error) throw error;
        setFeesData(data);
      } catch (error) {
        console.error('Error fetching fees data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeesData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading fees report...</div>;

  return (
    <div className="report-container">
      <h2>Fees Report ({startDate} to {endDate})</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>GR Number</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Fee Type</th>
            <th>Amount</th>
            <th>Discount</th>
            <th>Fine</th>
            <th>Payment Date</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {feesData.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.student_fees.students.gr_number}</td>
              <td>{payment.student_fees.students.fullname}</td>
              <td>{payment.student_fees.students.class}</td>
              <td>{payment.student_fees.fee_type}</td>
              <td>{payment.student_fees.total_amount}</td>
              <td>{payment.student_fees.discount_amount}</td>
              <td>{payment.student_fees.fine_amount}</td>
              <td>{payment.payment_date}</td>
              <td>{payment.payment_method}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="report-summary">
        <h3>Summary</h3>
        <p>Total Collected: {feesData.reduce((sum, payment) => sum + payment.amount_paid, 0)}</p>
        <p>Total Discounts: {feesData.reduce((sum, payment) => sum + (payment.student_fees.discount_amount || 0), 0)}</p>
        <p>Total Fines: {feesData.reduce((sum, payment) => sum + (payment.student_fees.fine_amount || 0), 0)}</p>
      </div>
    </div>
  );
};

export default FeesReport;