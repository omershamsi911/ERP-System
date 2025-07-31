import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';


const CollectionReport = ({ startDate, endDate }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('student_fee_payments')
          .select(`
            id,
            amount_paid,
            payment_date,
            payment_method,
            received_by,
            users:received_by (full_name),
            student_fees:student_fees_id (
              student_id,
              students:student_id (fullname, gr_number, class)
            )
          `)
          .gte('payment_date', startDate)
          .lte('payment_date', endDate)
          .order('payment_date', { ascending: false });

        if (error) throw error;
        setCollections(data);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [startDate, endDate]);

  if (loading) return <div>Loading collection report...</div>;

  return (
    <div className="report-container">
      <h2>Collection Report ({startDate} to {endDate})</h2>
      
      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>GR Number</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Received By</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => (
            <tr key={collection.id}>
              <td>{collection.payment_date}</td>
              <td>{collection.student_fees.students.gr_number}</td>
              <td>{collection.student_fees.students.fullname}</td>
              <td>{collection.student_fees.students.class}</td>
              <td>{collection.amount_paid}</td>
              <td>{collection.payment_method}</td>
              <td>{collection.users.full_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="report-summary">
        <h3>Summary</h3>
        <p>Total Collected: {collections.reduce((sum, c) => sum + c.amount_paid, 0)}</p>
        <p>By Cash: {collections.filter(c => c.payment_method === 'cash').reduce((sum, c) => sum + c.amount_paid, 0)}</p>
        <p>By Bank Transfer: {collections.filter(c => c.payment_method === 'bank_transfer').reduce((sum, c) => sum + c.amount_paid, 0)}</p>
        <p>By Other Methods: {collections.filter(c => !['cash', 'bank_transfer'].includes(c.payment_method)).reduce((sum, c) => sum + c.amount_paid, 0)}</p>
      </div>
    </div>
  );
};

export default CollectionReport;