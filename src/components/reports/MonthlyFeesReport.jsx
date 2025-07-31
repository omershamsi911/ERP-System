import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';


const MonthlyFeesReport = ({ month, year }) => {
  const [feesData, setFeesData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeesData = async () => {
      try {
        setLoading(true);
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        // Fetch fee payments
        const { data: payments, error: paymentsError } = await supabase
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
              students(fullname, class, gr_number),
              fee_categories(id, name )
            )
          `)
          .gte('payment_date', startDate)
          .lte('payment_date', endDate)
          .order('payment_date', { ascending: false });

        if (paymentsError) throw paymentsError;

        // Fetch fee summary
        const { data: feeSummary, error: summaryError } = await supabase
          .rpc('get_monthly_fee_summary', {
            month_param: month,
            year_param: year
          });

        if (summaryError) throw summaryError;

        console.log(payments);

        setFeesData(payments);
        setSummary(feeSummary[0]);
      } catch (error) {
        console.error('Error fetching fees data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeesData();
  }, [month, year]);

  if (loading) return <div>Loading fees report...</div>;

  return (
    <div className="report-container">
      <h2>Monthly Fees Report ({month}/{year})</h2>
      
      <div className="report-summary">
        <h3>Summary</h3>
        <p>Total Collected: {summary?.total_collected || 0}</p>
        <p>By Cash: {summary?.cash_amount || 0}</p>
        <p>By Bank Transfer: {summary?.bank_amount || 0}</p>
        <p>By Other Methods: {summary?.other_amount || 0}</p>
        <p>Pending Fees: {summary?.pending_amount || 0}</p>
      </div>

      <h3>Detailed Payments</h3>
      <table className="report-table">
        <thead>
          <tr>
            <th>Payment Date</th>
            <th>Fee Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {feesData.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.payment_date}</td>
              <td>{payment.student_fees.fee_type}</td>
              <td>{payment.student_fees.fee_categories.name}</td>
              <td>{payment.amount_paid}</td>
              <td>{payment.payment_method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyFeesReport;