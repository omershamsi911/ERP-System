import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { useFees } from '../hooks/useFees';
import { useAttendance } from '../hooks/useAttendance';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { formatDate, formatCurrency } from '../utils/helpers';
import StudentPerformanceDashboard from '../components/students/Performance';
import StudentFeeStatus from '../components/students/StudentFees';
import StudentAttendanceSummary from '../components/students/StudentAttendance';

export const ViewStudentPage = () => {
  const { id } = useParams();
  const { getStudent, loading: studentLoading } = useStudents();
  const { fetchFees, fees, loading: feesLoading } = useFees();
  const { getAttendance, attendance, loading: attendanceLoading } = useAttendance();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');


  useEffect(() => {
    const fetchData = async () => {
      const studentData = await getStudent(id);
      setStudent(studentData);
      await fetchFees(id);
      const data = await getAttendance(id);
      (data)
    };
    fetchData();
  }, [id]);



  if (studentLoading) return <LoadingSpinner />;
  if (!student) return <div>Student not found</div>;

  const feeColumns = [
    { Header: 'Fee Type', accessor: 'fee_type' },
    { Header: 'Category', accessor: 'fee_categories.name' },
    { Header: 'Amount', accessor: 'final_amount', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Due Date', accessor: 'due_date', Cell: ({ value }) => formatDate(value) },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'paid' ? 'bg-green-100 text-green-800' : 
        value === 'overdue' ? 'bg-red-100 text-red-800' : 
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value}
      </span>
    ) }
  ];

  const attendanceColumns = [
    { Header: 'Date', accessor: 'attendance_date', Cell: ({ value }) => formatDate(value) },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'present' ? 'bg-green-100 text-green-800' : 
        value === 'absent' ? 'bg-red-100 text-red-800' : 
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value}
      </span>
    ) },
    { Header: 'Remarks', accessor: 'remarks' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
          <div>
            <h1 className="text-2xl font-bold">{student.fullname}</h1>
            <p className="text-gray-300">{student.class} - {student.section} | GR: {student.gr_number}</p>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button onClick={() => setActiveTab('overview')} className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Overview</button>
          <button onClick={() => setActiveTab('fees')} className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'fees' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Fees</button>
          <button onClick={() => setActiveTab('attendance')} className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'attendance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Attendance</button>
          <button onClick={() => setActiveTab('academic')} className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'academic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Academic Performance</button>
        </nav>
      </div>
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div className="flex"><div className="w-1/3 text-gray-600">Full Name</div><div className="w-2/3">{student.fullname}</div></div>
                <div className="flex"><div className="w-1/3 text-gray-600">Date of Birth</div><div className="w-2/3">{formatDate(student.dob)}</div></div>
                <div className="flex"><div className="w-1/3 text-gray-600">GR Number</div><div className="w-2/3">{student.gr_number}</div></div>
                <div className="flex"><div className="w-1/3 text-gray-600">Class</div><div className="w-2/3">{student.class} - {student.section}</div></div>
                <div className="flex"><div className="w-1/3 text-gray-600">Admission Date</div><div className="w-2/3">{formatDate(student.admission_date)}</div></div>
                <div className="flex"><div className="w-1/3 text-gray-600">Status</div><div className="w-2/3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{student.status}</span></div></div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Family Information</h2>
              {student.family_id ? (
                <div className="space-y-3">
                  <div className="flex"><div className="w-1/3 text-gray-600">Father's Name</div><div className="w-2/3">{student.families?.father_name || 'N/A'}</div></div>
                  <div className="flex"><div className="w-1/3 text-gray-600">Contact</div><div className="w-2/3">{student.families?.contact_number || 'N/A'}</div></div>
                  <div className="flex"><div className="w-1/3 text-gray-600">Email</div><div className="w-2/3">{student.families?.email || 'N/A'}</div></div>
                  <div className="flex"><div className="w-1/3 text-gray-600">Address</div><div className="w-2/3">{student.families?.address || 'N/A'}</div></div>
                </div>
              ) : (
                <p className="text-gray-500">No family information available</p>
              )}
            </div>
          </div>
        )}
        {activeTab === 'fees' && (
          <div>
            <StudentFeeStatus studentId={id}/>
          </div>
        )}
        {activeTab === 'attendance' && (
          <div>
            <StudentAttendanceSummary studentId={id}/>
          </div>
        )}
        {activeTab === 'academic' && (
          <div>
            <StudentPerformanceDashboard studentId={id}/>
          </div>
        )}
      </div>
    </div>
  );
}; 