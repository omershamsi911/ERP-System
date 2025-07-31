import React, { useState, useEffect } from 'react';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';

const StudentFeeStatus = ({ studentId }) => {
  const [feeStatus, setFeeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFeeStatus = async () => {
      try {
        setLoading(true);
        
        // Get current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentYear = currentDate.getFullYear();
        
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, fullname, class')
          .eq('id', studentId)
          .single();
        
        if (studentError) throw studentError;
        
        // Fetch fee records for the current month
        const { data: feeData, error: feeError } = await supabase
          .from('student_fees')
          .select('id, status, total_amount, discount_amount, fine_amount, final_amount, due_date')
          .eq('student_id', studentId)
          .filter('due_date', 'gte', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
          .filter('due_date', 'lte', `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);
        
        if (feeError) throw feeError;
        
        // Determine overall status
        let overallStatus = 'no-fees';
        let totalDue = 0;
        let totalPaid = 0;
        
        if (feeData && feeData.length > 0) {
          overallStatus = 'paid';
          feeData.forEach(fee => {
            totalDue += fee.final_amount;
            if (fee.status === 'paid') {
              totalPaid += fee.final_amount;
            } else {
              overallStatus = fee.status;
            }
          });
          
          // Handle partial payments
          if (overallStatus === 'paid' && totalPaid < totalDue) {
            overallStatus = 'partial';
          }
        }
        
        setFeeStatus({
          student: studentData,
          fees: feeData || [],
          overallStatus,
          totalDue,
          totalPaid,
          month: currentDate.toLocaleString('default', { month: 'long' }),
          year: currentYear
        });
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchFeeStatus();
    }
  }, [studentId]);
  
  const getStatusIcon = () => {
    switch (feeStatus?.overallStatus) {
      case 'paid':
        return <Check className="text-green-500" size={24} />;
      case 'partial':
        return <Clock className="text-yellow-500" size={24} />;
      case 'overdue':
        return <AlertTriangle className="text-red-500" size={24} />;
      case 'pending':
        return <Clock className="text-blue-500" size={24} />;
      default:
        return <X className="text-gray-500" size={24} />;
    }
  };
  
  const getStatusText = () => {
    switch (feeStatus?.overallStatus) {
      case 'paid':
        return 'Fully Paid';
      case 'partial':
        return 'Partially Paid';
      case 'overdue':
        return 'Overdue';
      case 'pending':
        return 'Payment Pending';
      default:
        return 'No Fees Due';
    }
  };
  
  const getStatusClass = () => {
    switch (feeStatus?.overallStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading fee status...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="bg-red-100 rounded-full p-3 inline-block">
          <X className="text-red-500" size={24} />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Error loading fee status</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {feeStatus.student.name}
            </h2>
            <p className="text-gray-600">
              {feeStatus.student.class} • {feeStatus.month} {feeStatus.year}
            </p>
          </div>
          
          <div className={`${getStatusClass()} px-4 py-2 rounded-full flex items-center`}>
            {getStatusIcon()}
            <span className="ml-2 font-medium">{getStatusText()}</span>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Due</p>
              <p className="text-xl font-bold text-gray-900">
                Rs. {feeStatus.totalDue.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-green-600">
                Rs. {feeStatus.totalPaid.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {feeStatus.fees.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Fee Details</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeStatus.fees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {fee.fee_type || 'Tuition Fee'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        Rs. {fee.final_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          fee.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : fee.status === 'overdue' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(fee.due_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {feeStatus.overallStatus === 'no-fees' && (
          <div className="mt-6 text-center py-8">
            <div className="bg-gray-100 rounded-full p-4 inline-block">
              <X className="text-gray-400" size={24} />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No Fees Due</h3>
            <p className="text-gray-600">
              No fee records found for {feeStatus.month} {feeStatus.year}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeeStatus;