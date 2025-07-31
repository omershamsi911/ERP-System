import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';


const IncomeStatement = ({ startDate, endDate }) => {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Fetch income data
        const { data: incomeData, error: incomeError } = await supabase
          .rpc('get_income_statement', {
            start_date: startDate,
            end_date: endDate
          });

        // Fetch expense data
        const { data: expenseData, error: expenseError } = await supabase
          .from('school_expenses')
          .select(`
            amount,
            expense_categories:category_id (name)
          `)
          .gte('expense_date', startDate)
          .lte('expense_date', endDate);

        if (incomeError || expenseError) throw incomeError || expenseError;

        setIncome(incomeData);
        setExpenses(expenseData);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading income statement...</div>;

  const totalIncome = income.reduce((sum, item) => sum + item.total_amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  return (
    <div className="report-container">
      <h2>Income Statement ({startDate} to {endDate})</h2>
      
      <div className="financial-section">
        <h3>Income</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {income.map((item, index) => (
              <tr key={`income-${index}`}>
                <td>{item.fee_category}</td>
                <td>{item.total_amount}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Total Income</strong></td>
              <td><strong>{totalIncome}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="financial-section">
        <h3>Expenses</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item, index) => (
              <tr key={`expense-${index}`}>
                <td>{item.expense_categories.name}</td>
                <td>{item.amount}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td><strong>Total Expenses</strong></td>
              <td><strong>{totalExpenses}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="financial-summary">
        <h3>Net Income</h3>
        <p>{netIncome >= 0 ? 'Profit' : 'Loss'}: {Math.abs(netIncome)}</p>
      </div>
    </div>
  );
};

export default IncomeStatement;