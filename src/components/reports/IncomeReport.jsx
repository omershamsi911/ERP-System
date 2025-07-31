import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';


const IncomeReport = ({ startDate, endDate }) => {
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch fee payments
        const { data: feePayments, error: feeError } = await supabase
          .from('student_fee_payments')
          .select(`
            id,
            amount_paid,
            payment_date,
            payment_method,
            student_fees:student_fees_id (
              fee_category_id,
              fee_categories:fee_category_id (name)
            )
          `)
          .gte('payment_date', startDate)
          .lte('payment_date', endDate);

        // Fetch other income (you would need to add this table)
        const { data: otherIncome, error: incomeError } = await supabase
          .from('other_income')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate);

        if (feeError || incomeError) throw feeError || incomeError;

        // Combine data
        const combinedData = [
          ...feePayments.map(p => ({
            type: 'Fee Payment',
            category: p.student_fees.fee_categories.name,
            amount: p.amount_paid,
            date: p.payment_date,
            method: p.payment_method
          })),
          ...(otherIncome || []).map(i => ({
            type: 'Other Income',
            category: i.category,
            amount: i.amount,
            date: i.date,
            method: i.method
          }))
        ];

        setIncomeData(combinedData);
      } catch (error) {
        console.error('Error fetching income data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading income report...</div>;

  return (
    <div className="report-container">
      <h2>Income Report ({startDate} to {endDate})</h2>
      
      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          {incomeData.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.type}</td>
              <td>{item.category}</td>
              <td>{item.amount}</td>
              <td>{item.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="report-summary">
        <h3>Summary</h3>
        <p>Total Income: {incomeData.reduce((sum, item) => sum + item.amount, 0)}</p>
        <p>By Fee Payments: {incomeData.filter(i => i.type === 'Fee Payment').reduce((sum, item) => sum + item.amount, 0)}</p>
        <p>By Other Income: {incomeData.filter(i => i.type === 'Other Income').reduce((sum, item) => sum + item.amount, 0)}</p>
      </div>
    </div>
  );
};

export default IncomeReport;