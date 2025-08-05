import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, ChevronDown, X, Printer, FileText, Download } from 'lucide-react';
import { supabase } from '../services/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';

// Reusable Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input id={id} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const TabBar = ({ tabs, activeTab, setActiveTab }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

// Receipt Component
const Receipt = ({ payment, student, onClose }) => {
  const receiptRef = useRef(null);
  
  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`receipt-${payment.receipt_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Payment Receipt</h3>
          <div className="flex space-x-2">
            <Button onClick={downloadPDF} className="flex items-center">
              <Download size={16} className="mr-1" /> PDF
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div ref={receiptRef} className="bg-white p-8 border-2 border-dashed border-gray-300">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-blue-700">SCHOOL NAME</div>
              <div className="text-sm text-gray-600">123 Education Street, Learning City</div>
              <div className="text-sm text-gray-600">Phone: (123) 456-7890 | Email: info@school.edu</div>
            </div>
            
            <div className="border-t-2 border-b-2 border-gray-300 py-4 my-4">
              <div className="text-center text-xl font-bold">OFFICIAL FEE RECEIPT</div>
              <div className="text-center text-sm text-gray-600">Receipt No: {payment.receipt_number}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="font-semibold">Student Information:</div>
                <div>{student.fullname}</div>
                <div>GR Number: {student.gr_number}</div>
                <div>Class: {student.class} | Section: {student.section}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">Payment Details:</div>
                <div>Date: {new Date(payment.payment_date).toLocaleDateString()}</div>
                <div>Receipt No: {payment.receipt_number}</div>
                <div>Payment Mode: {payment.payment_method}</div>
              </div>
            </div>
            
            <table className="w-full mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">Tuition Fee</td>
                  <td className="p-2 border-b text-right">{payment.amount}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Late Fee</td>
                  <td className="p-2 border-b text-right">{payment.fine_amount || '0.00'}</td>
                </tr>
                <tr className="font-bold">
                  <td className="p-2">Total Paid</td>
                  <td className="p-2 text-right">Rs. {payment.total_amount}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="text-center mt-8 text-sm text-gray-500">
              <div>This is an official receipt from SCHOOL NAME</div>
              <div>Thank you for your payment!</div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <div>
                <div className="mb-2">________________________</div>
                <div>Cashier Signature</div>
              </div>
              <div>
                <div className="mb-2">________________________</div>
                <div>School Stamp</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button onClick={onClose} variant="secondary" className="mr-2">
              Close
            </Button>
            <Button onClick={() => window.print()} className="flex items-center">
              <Printer size={16} className="mr-1" /> Print Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Fee Management Component
const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  const tabs = [
    { id: 'dashboard', label: 'Fee Dashboard' },
    { id: 'collection', label: 'Fee Collection' },
    { id: 'structure', label: 'Fee Structure' },
    { id: 'fines', label: 'Fee Fines' },
    { id: 'memos', label: 'Memos & Vouchers' },
    { id: 'bulkvouchers', label: 'Voucher Generation'}
  ];

  useEffect(() => {
    if (location.hash === '#collection') {
      setActiveTab("collection")
    }
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fee Management System</h1>
        <p className="text-gray-600">Comprehensive fee management for school administration</p>
      </div>
      
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mt-6">
        {activeTab === 'dashboard' && <FeeDashboard />}
        {activeTab === 'collection' && <FeeCollectionTab />}
        {activeTab === 'structure' && <FeeStructure />}
        {activeTab === 'fines' && <FeeFines />}
        {activeTab === 'memos' && <MemoVoucherTab />}
        {activeTab === 'bulkvouchers' && <BulkVoucherTab />}
      </div>
    </div>
  );
};

// Dashboard Component
const FeeDashboard = () => {
  const [studentFees, setStudentFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0
  });
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch unique classes and sections
        const { data: classData } = await supabase
          .from('students')
          .select('class')
          .not('class', 'is', null);
        
        const { data: sectionData } = await supabase
          .from('students')
          .select('section')
          .not('section', 'is', null);
        
        setClasses([...new Set(classData.map(item => item.class))]);
        setSections([...new Set(sectionData.map(item => item.section))]);
        
        // Fetch all student fees
        const { data: feesData } = await supabase
          .from('student_fees')
          .select('*');
        
        setStudentFees(feesData || []);
        
        // Fetch students with filters
        await fetchStudents();
        
        // Calculate statistics
        calculateStats(feesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate statistics
  const calculateStats = (fees) => {
    const totalPaid = fees
      .filter(f => f.status === 'paid')
      .reduce((sum, fee) => sum + (fee.final_amount || 0), 0);
    
    const totalPending = fees
      .filter(f => f.status === 'pending')
      .reduce((sum, fee) => sum + (fee.final_amount || 0), 0);
    
    const totalOverdue = fees
      .filter(f => f.status === 'overdue')
      .reduce((sum, fee) => sum + (fee.final_amount || 0), 0);
    
    const total = totalPaid + totalPending + totalOverdue;
    const collectionRate = total > 0 ? Math.round((totalPaid / total) * 100) : 0;
    
    setStats({
      totalPaid,
      totalPending,
      totalOverdue,
      collectionRate
    });
  };

  // Fetch students based on current filters
  const fetchStudents = async () => {
    let query = supabase
      .from('students')
      .select('id, fullname, class, gr_number, section');
    
    if (selectedClass) {
      query = query.eq('class', selectedClass);
    }
    
    if (selectedSection) {
      query = query.eq('section', selectedSection);
    }
    
    const { data: studentsData } = await query;
    setStudents(studentsData || []);
  };

  // Refetch students when filters change
  useEffect(() => {
    fetchStudents();
  }, [selectedClass, selectedSection]);

  // Get filtered and mapped student fees
  const getFilteredStudentFees = (status) => {
    const feesByStatus = studentFees.filter(sf => sf.status === status);
    
    return feesByStatus
      .filter(sf => students.some(s => s.id === sf.student_id))
      .map(sf => {
        const student = students.find(s => s.id === sf.student_id) || {};
        return {
          ...sf,
          student,
          rollNumber: student.gr_number || 'N/A'
        };
      });
  };

  const paidStudents = getFilteredStudentFees('paid');
  const unpaidStudents = getFilteredStudentFees('pending');
  const defaulters = getFilteredStudentFees('overdue');

  const dashboardTabs = [
    { id: 'paid', label: `Paid (${paidStudents.length})` },
    { id: 'unpaid', label: `Unpaid (${unpaidStudents.length})` },
    { id: 'defaulters', label: `Defaulters (${defaulters.length})` },
  ];
  
  const [dashboardActiveTab, setDashboardActiveTab] = useState('paid');
  
  const renderStudentList = (students) => {
    if (loading) {
      return <p className="text-center text-gray-500 py-8">Loading...</p>;
    }
    
    if (students.length === 0) {
      return <p className="text-center text-gray-500 py-8">No students in this category.</p>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(({ id, student, final_amount, due_date, status, rollNumber }) => (
              <tr key={id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{student?.fullname || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">Roll #: {rollNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.class || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.section || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">Rs. {final_amount?.toLocaleString() || '0'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{due_date ? new Date(due_date).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    status === 'paid' ? 'bg-green-100 text-green-800' :
                    status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="border-l-4 border-green-500">
          <div className="text-gray-500">Total Paid</div>
          <div className="text-2xl font-bold">Rs. {stats.totalPaid.toLocaleString()}</div>
          <div className="text-sm text-green-600">Fully Collected</div>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <div className="text-gray-500">Pending Fees</div>
          <div className="text-2xl font-bold">Rs. {stats.totalPending.toLocaleString()}</div>
          <div className="text-sm text-yellow-600">Due Soon</div>
        </Card>
        <Card className="border-l-4 border-red-500">
          <div className="text-gray-500">Overdue Fees</div>
          <div className="text-2xl font-bold">Rs. {stats.totalOverdue.toLocaleString()}</div>
          <div className="text-sm text-red-600">Require Action</div>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <div className="text-gray-500">Collection Rate</div>
          <div className="text-2xl font-bold">{stats.collectionRate}%</div>
          <div className="text-sm text-blue-600">Current Month</div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Fee Status for {currentMonth}</h2>
            <p className="text-gray-600">Overview of student fee payments.</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="success" className="flex items-center">
              <Download size={16} className="mr-1" /> Export Report
            </Button>
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-full md:w-auto">
            <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              id="class-filter"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map((classItem) => (
                <option key={classItem} value={classItem}>
                  {classItem}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <label htmlFor="section-filter" className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              id="section-filter"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {dashboardTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setDashboardActiveTab(tab.id)}
                className={`${
                  dashboardActiveTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-6">
          {dashboardActiveTab === 'paid' && renderStudentList(paidStudents)}
          {dashboardActiveTab === 'unpaid' && renderStudentList(unpaidStudents)}
          {dashboardActiveTab === 'defaulters' && renderStudentList(defaulters)}
        </div>
      </Card>
    </div>
  );
};

// Fee Collection Component
const FeeCollectionTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation()
  const [paymentNotes, setPaymentNotes] = useState('');
  

 

  const searchStudents = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, fullname, class, gr_number, section')
        .ilike('fullname', `%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentFees = async (studentId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['pending', 'overdue']);
      
      if (error) throw error;
      setStudentFees(data || []);
    } catch (error) {
      console.error('Error fetching student fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchTerm('');
    fetchStudentFees(student.id);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedStudent || !paymentAmount) return;
    
    try {
      setLoading(true);
      
      // Generate a receipt number (in a real app, this would come from your backend)
      const receiptNumber = `RC-${Date.now().toString().slice(-6)}`;
      
      // Create payment data
      const paymentData = {
        student_id: selectedStudent.id,
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        receipt_number: receiptNumber,
        notes: paymentNotes,
        collected_by: 'Admin' // In real app, use logged in user
      };
      
      // In a real application, you would save this to your database
      // For now, we'll just simulate the payment
      const newPayment = {
        id: Date.now(),
        ...paymentData
      };
      
      // Show receipt
      setReceiptData({
        ...newPayment,
        student: selectedStudent
      });
      setIsPaymentModalOpen(false);
      setIsReceiptOpen(true);
      
      // Reset form
      setPaymentAmount('');
      setPaymentNotes('');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalDue = studentFees.reduce((sum, fee) => sum + (fee.final_amount || 0), 0);

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fee Collection</h2>
      
      <div className="mb-6">
        <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Student
        </label>
        <div className="relative">
          <div className="flex">
            <input
              id="student-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && searchStudents()}
              placeholder="Enter student name or GR number"
              className="w-full px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button onClick={searchStudents} className="rounded-l-none">
              <Search size={18} className="mr-1" /> Search
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-60 overflow-auto">
              {searchResults.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <span className="font-medium truncate">{student.fullname}</span>
                    <span className="ml-2 text-gray-500 truncate">GR#{student.gr_number}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Class {student.class} - {student.section}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {selectedStudent && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedStudent.fullname}</h3>
              <div className="text-sm text-gray-600">
                GR Number: {selectedStudent.gr_number} | 
                Class: {selectedStudent.class} | 
                Section: {selectedStudent.section}
              </div>
            </div>
            <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
              Change Student
            </Button>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Outstanding Fees</h4>
            {loading ? (
              <p>Loading fees...</p>
            ) : studentFees.length === 0 ? (
              <p className="text-green-600">No outstanding fees. All fees are paid.</p>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentFees.map((fee) => (
                        <tr key={fee.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fee.fee_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">Rs. {fee.final_amount?.toLocaleString() || '0'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                              fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan="2" className="px-6 py-3 text-right">Total Due:</td>
                        <td className="px-6 py-3 text-gray-900">Rs. {totalDue.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setIsPaymentModalOpen(true)}>
                    Collect Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        title="Collect Fee Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <div className="p-2 border border-gray-300 rounded-lg bg-gray-50">
              {selectedStudent?.fullname} (GR#{selectedStudent?.gr_number})
            </div>
          </div>
          
          <Input 
            label="Payment Amount (Rs.)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter amount"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          
          <Input 
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit}>
              Process Payment
            </Button>
          </div>
        </div>
      </Modal>
      
      {isReceiptOpen && receiptData && (
        <Receipt 
          payment={receiptData} 
          student={selectedStudent} 
          onClose={() => setIsReceiptOpen(false)} 
        />
      )}
    </Card>
  );
};

// Fee Structure Component
const FeeStructure = () => {
  const [classFees, setClassFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: classFeesData } = await supabase
        .from('class_fees')
        .select(`
          id,
          class,
          fee_type_id,
          amount,
          number_of_installments,
          fee_types (
            id,
            name,
            fee_category_id
          )
        `);
        
        const { data: feeTypesData } = await supabase
          .from('fee_types')
          .select('*');
        
        setClassFees(classFeesData || []);
        setFeeTypes(feeTypesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getFeeTypeName = (feeTypeId) => feeTypes.find(ft => ft.id === feeTypeId)?.name || 'Unknown';

  const openModalForNew = () => {
    setEditingFee(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (fee) => {
    setEditingFee(fee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        const { error } = await supabase
          .from('class_fees')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setClassFees(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        console.error('Error deleting fee structure:', error);
      }
    }
  };
  
  const FeeStructureForm = ({ fee, onSave, onCancel }) => {
    const [formData, setFormData] = useState(fee || {
      class: '',
      fee_type_id: '',
      amount: '',
      number_of_installments: 1
    });

    useEffect(() => {
      if (fee) {
        setFormData(fee);
      }
    }, [fee]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        if (formData.id) {
          const { data, error } = await supabase
            .from('class_fees')
            .update(formData)
            .eq('id', formData.id)
            .select();
          
          if (error) throw error;
          onSave(data[0]);
        } else {
          const { data, error } = await supabase
            .from('class_fees')
            .insert([formData])
            .select();
          
          if (error) throw error;
          onSave(data[0]);
        }
      } catch (error) {
        console.error('Error saving fee structure:', error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Class" id="class" name="class" value={formData.class} onChange={handleChange} placeholder="e.g., 9th Grade" required />
        <div>
          <label htmlFor="fee_type_id" className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
          <select id="fee_type_id" name="fee_type_id" value={formData.fee_type_id} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select a fee type</option>
            {feeTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
          </select>
        </div>
        <Input label="Amount" id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="e.g., 5000" required />
        <Input label="Number of Installments" id="number_of_installments" name="number_of_installments" type="number" value={formData.number_of_installments} onChange={handleChange} required />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary">Save Fee</Button>
        </div>
      </form>
    );
  };

  const handleSave = (feeData) => {
    if (editingFee) {
      setClassFees(prev => prev.map(f => f.id === feeData.id ? feeData : f));
    } else {
      setClassFees(prev => [...prev, feeData]);
    }
    closeModal();
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Fee Structure</h2>
          <p className="text-gray-600">Manage fees for different classes.</p>
        </div>
        <Button onClick={openModalForNew}>
          <Plus size={18} className="mr-2" /> Add New Fee
        </Button>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installments</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classFees.map((fee) => (
                <tr key={fee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getFeeTypeName(fee.fee_type_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {fee.amount?.toLocaleString() || '0'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.number_of_installments}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openModalForEdit(fee)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(fee.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingFee ? 'Edit Fee Structure' : 'Add New Fee Structure'}>
        <FeeStructureForm fee={editingFee} onSave={handleSave} onCancel={closeModal} />
      </Modal>
    </Card>
  );
};

// Fee Fines Component
const FeeFines = () => {
  const [fines, setFines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFine, setEditingFine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('fee_fines')
          .select('*');
        
        if (error) throw error;
        setFines(data || []);
      } catch (error) {
        console.error('Error fetching fines:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const openModalForNew = () => {
    setEditingFine(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (fine) => {
    setEditingFine(fine);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFine(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fine?')) {
      try {
        const { error } = await supabase
          .from('fee_fines')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setFines(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        console.error('Error deleting fine:', error);
      }
    }
  };

  const FineForm = ({ fine, onSave, onCancel }) => {
    const [formData, setFormData] = useState(fine || {
      name: '',
      amount: '',
      description: ''
    });

    useEffect(() => {
      if (fine) {
        setFormData(fine);
      }
    }, [fine]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        if (formData.id) {
          const { data, error } = await supabase
            .from('fee_fines')
            .update(formData)
            .eq('id', formData.id)
            .select();
          
          if (error) throw error;
          onSave(data[0]);
        } else {
          const { data, error } = await supabase
            .from('fee_fines')
            .insert([formData])
            .select();
          
          if (error) throw error;
          onSave(data[0]);
        }
      } catch (error) {
        console.error('Error saving fine:', error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Fine Name" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Late Fee" required />
        <Input label="Amount" id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="e.g., 500" required />
        <Input label="Description" id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe when this fine applies" />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary">Save Fine</Button>
        </div>
      </form>
    );
  };

  const handleSave = (fineData) => {
    if (editingFine) {
      setFines(prev => prev.map(f => f.id === fineData.id ? fineData : f));
    } else {
      setFines(prev => [...prev, fineData]);
    }
    closeModal();
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fee Fines</h2>
          <p className="text-gray-600">Manage various types of fines.</p>
        </div>
        <Button onClick={openModalForNew}>
          <Plus size={18} className="mr-2" /> Add New Fine
        </Button>
      </div>
      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fines.map((fine) => (
                <tr key={fine.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fine.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {fine.amount?.toLocaleString() || '0'}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-sm">{fine.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openModalForEdit(fine)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(fine.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingFine ? 'Edit Fine' : 'Add New Fine'}>
        <FineForm fine={editingFine} onSave={handleSave} onCancel={closeModal} />
      </Modal>
    </Card>
  );
};

// Memo/Voucher Component
const MemoVoucherTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [memoType, setMemoType] = useState('fee_reminder');
  const [memoContent, setMemoContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchStudents = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, fullname, class, gr_number, section')
        .ilike('fullname', `%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchTerm('');
    generateMemoContent(student, memoType);
  };

  const generateMemoContent = (student, type) => {
    const today = new Date().toLocaleDateString();
    let content = '';
    
    switch (type) {
      case 'fee_reminder':
        content = `Date: ${today}\n\nTo: The Parent/Guardian of\n${student.fullname}\nGR Number: ${student.gr_number}\nClass: ${student.class} - ${student.section}\n\nSubject: Reminder for Fee Payment\n\nDear Parent/Guardian,\n\nThis is to remind you that the school fee for the current month is pending. Please ensure the fee is paid by the due date to avoid any inconvenience.\n\nThank you for your cooperation.\n\nSincerely,\nAccounts Department`;
        break;
      case 'fee_voucher':
        content = `Date: ${today}\n\nStudent Name: ${student.fullname}\nGR Number: ${student.gr_number}\nClass: ${student.class} - ${student.section}\n\nFee Voucher\n\nPlease pay the following amount at the school fee counter or through bank transfer:\n\nAmount: Rs. __________\n\nBank Details:\nAccount Name: School Account\nAccount Number: 1234567890\nBank: Education Bank\nBranch: Learning City\n\nNote: Please mention student GR number in transaction details.`;
        break;
      case 'challan':
        content = `Date: ${today}\n\nStudent Name: ${student.fullname}\nGR Number: ${student.gr_number}\nClass: ${student.class} - ${student.section}\n\nFee Challan\n\nDescription: School Fee Payment\nAmount: Rs. __________\n\nPayment should be made within 7 days of issuance.`;
        break;
      default:
        content = '';
    }
    
    setMemoContent(content);
  };

  const handleMemoTypeChange = (e) => {
    const type = e.target.value;
    setMemoType(type);
    if (selectedStudent) {
      generateMemoContent(selectedStudent, type);
    }
  };

  const downloadMemo = () => {
    const element = document.createElement('a');
    const file = new Blob([memoContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${memoType}_${selectedStudent.gr_number}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const printMemo = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${memoType.replace(/_/g, ' ').toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .memo-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .content { white-space: pre-line; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="memo-container">
            <div class="header">
              <h2>${memoType.replace(/_/g, ' ').toUpperCase()}</h2>
            </div>
            <div class="content">${memoContent}</div>
            <div class="footer">
              <div>Date: ${new Date().toLocaleDateString()}</div>
              <div>Authorized Signature</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Memos & Vouchers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Student
            </label>
            <div className="relative">
              <div className="flex">
                <input
                  id="student-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                  placeholder="Enter student name or GR number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button onClick={searchStudents} className="rounded-l-none">
                  <Search size={18} className="mr-1" /> Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-60 overflow-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <span className="font-medium truncate">{student.fullname}</span>
                        <span className="ml-2 text-gray-500 truncate">GR#{student.gr_number}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Class {student.class} - {student.section}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {selectedStudent && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedStudent.fullname}</h3>
                  <div className="text-sm text-gray-600">
                    GR Number: {selectedStudent.gr_number} | 
                    Class: {selectedStudent.class} | 
                    Section: {selectedStudent.section}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                  Change Student
                </Button>
              </div>
              
              <div className="mt-4">
                <div className="mb-4">
                  <label htmlFor="memo-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    id="memo-type"
                    value={memoType}
                    onChange={handleMemoTypeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fee_reminder">Fee Reminder</option>
                    <option value="fee_voucher">Fee Voucher</option>
                    <option value="challan">Fee Challan</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Content
                  </label>
                  <textarea
                    value={memoContent}
                    onChange={(e) => setMemoContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    rows={10}
                  />
                </div>
                
                <div className="mt-4 flex space-x-3">
                  <Button onClick={() => setIsPreviewOpen(true)} className="flex items-center">
                    <FileText size={16} className="mr-1" /> Preview
                  </Button>
                  <Button variant="secondary" onClick={downloadMemo} className="flex items-center">
                    <Download size={16} className="mr-1" /> Download
                  </Button>
                  <Button onClick={printMemo} className="flex items-center">
                    <Printer size={16} className="mr-1" /> Print
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-l pl-6 hidden md:block">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Document Preview</h3>
          <div className="bg-white border rounded-lg p-6 h-full">
            {memoContent ? (
              <div className="whitespace-pre-line">{memoContent}</div>
            ) : (
              <div className="text-gray-400 text-center py-12">
                Select a student and document type to generate a preview
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)}
        title="Document Preview"
      >
        <div className="bg-white p-6 rounded-lg border">
          <div className="whitespace-pre-line mb-6">{memoContent}</div>
          <div className="flex justify-end">
            <Button onClick={() => setIsPreviewOpen(false)} variant="secondary">
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};


const BulkVoucherTab = () => {
  const [students, setStudents] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);
  const [classFees, setClassFees] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [voucherTemplate, setVoucherTemplate] = useState({
    fee_category_id: '',
    due_date: '',
    discount: 0,
    fine: 0,
    remarks: ''
  });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students with filters
        let studentsQuery = supabase
          .from('students')
          .select('id, fullname, class, section, gr_number');
        
        if (selectedClass) studentsQuery = studentsQuery.eq('class', selectedClass);
        if (selectedSection) studentsQuery = studentsQuery.eq('section', selectedSection);
        
        // Fetch unique classes and sections
        const { data: classData } = await supabase
          .from('students')
          .select('class')
          .not('class', 'is', null);
        
        const { data: sectionData } = await supabase
          .from('students')
          .select('section')
          .not('section', 'is', null);
        
        // Fetch fee categories
        const { data: feeCatData } = await supabase
          .from('fee_categories')
          .select('*');
        
        // Fetch class fees
        const { data: classFeesData } = await supabase
          .from('class_fees')
          .select('*');
        
        const [
          { data: studentsData },
          classDataRes,
          sectionDataRes,
          feeCatRes,
          classFeesRes
        ] = await Promise.all([
          studentsQuery,
          classData,
          sectionData,
          feeCatData,
          classFeesData
        ]);
        
        setStudents(studentsData || []);
        setClasses([...new Set(classDataRes.map(item => item.class))]);
        setSections([...new Set(sectionDataRes.map(item => item.section))]);
        setFeeCategories(feeCatRes || []);
        setClassFees(classFeesRes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedClass, selectedSection]);

  // Handle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedStudents([]);
  };

  // Handle template changes
  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setVoucherTemplate(prev => ({
      ...prev,
      [name]: name.endsWith('_id') || name === 'discount' || name === 'fine' 
        ? value
        : value
    }));
  };

  // Get class fee amount for a specific student
  const getClassFeeAmount = (studentClass) => {
    if (!voucherTemplate.fee_category_id) return 0;
    
    const classFee = classFees.find(fee => 
      fee.fee_category_id === voucherTemplate.fee_category_id && 
      fee.class === studentClass
    );
    
    return classFee ? classFee.amount : 0;
  };

  // Calculate final amount for a specific student
  const calculateFinalAmount = (studentClass) => {
    const baseAmount = getClassFeeAmount(studentClass);
    return baseAmount - voucherTemplate.discount + voucherTemplate.fine;
  };

  // Calculate average final amount for summary
  const calculateAverageAmount = () => {
    if (selectedStudents.length === 0) return 0;
    
    const total = selectedStudents.reduce((sum, studentId) => {
      const student = students.find(s => s.id === studentId);
      return sum + calculateFinalAmount(student.class);
    }, 0);
    
    return total / selectedStudents.length;
  };

  // Generate vouchers
  const generateVouchers = async () => {
    if (selectedStudents.length === 0) {
      setStatusMessage('Please select at least one student');
      return;
    }

    if (!voucherTemplate.fee_category_id || !voucherTemplate.due_date) {
      setStatusMessage('Please complete all required fields');
      return;
    }

    try {
      setLoading(true);
      const feeCategory = feeCategories.find(fc => fc.id === voucherTemplate.fee_category_id);
      
      if (!feeCategory) {
        setStatusMessage('Invalid fee category');
        return;
      }
      
      const vouchers = [];
      const errors = [];

      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        if (!student) {
          errors.push(`Student not found: ${studentId}`);
          continue;
        }
        
        const classFee = classFees.find(fee => 
          fee.fee_category_id === voucherTemplate.fee_category_id && 
          fee.class === student.class
        );
        
        if (!classFee) {
          errors.push(`No fee structure found for ${student.fullname} (Class ${student.class})`);
          continue;
        }
        
        const finalAmount = classFee.amount - voucherTemplate.discount + voucherTemplate.fine;
        
        vouchers.push({
          student_id: studentId,
          fee_type: feeCategory.name,
          fee_category_id: voucherTemplate.fee_category_id,
          class_fee_id: classFee.id,
          total_amount: classFee.amount,
          discount_amount: voucherTemplate.discount,
          fine_amount: voucherTemplate.fine,
          final_amount: finalAmount,
          due_date: voucherTemplate.due_date,
          status: 'unpaid',
          remarks: voucherTemplate.remarks
        });
      }

      if (vouchers.length === 0) {
        setStatusMessage('No valid vouchers to generate. ' + errors.join('; '));
        return;
      }

      // Insert into database
      const { error } = await supabase
        .from('student_fees')
        .insert(vouchers);
      
      if (error) throw error;
      
      setStatusMessage(`Successfully generated ${vouchers.length} vouchers. ${errors.length ? `Errors: ${errors.join('; ')}` : ''}`);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error generating vouchers:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Voucher Generation</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <div className="student-selection">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Select Students</h3>
            <div className="flex space-x-2">
              <Button onClick={selectAllStudents} variant="secondary">
                Select All
              </Button>
              <Button onClick={clearSelections} variant="secondary">
                Clear
              </Button>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-full md:w-auto">
              <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map((classItem) => (
                  <option key={classItem} value={classItem}>
                    {classItem}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="section-filter" className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                id="section-filter"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center py-8">Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No students found</p>
            ) : (
              <div className="space-y-2">
                {students.map(student => (
                  <div key={student.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium">{student.fullname}</div>
                      <div className="text-sm text-gray-500">
                        {student.class} - {student.section} | GR: {student.gr_number}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {selectedStudents.length} {selectedStudents.length === 1 ? 'student' : 'students'} selected
          </div>
        </div>
        
        {/* Voucher Template */}
        <div className="voucher-template">
          <h3 className="text-lg font-semibold mb-4">Voucher Template</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Category</label>
              <select
                name="fee_category_id"
                value={voucherTemplate.fee_category_id}
                onChange={handleTemplateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Category</option>
                {feeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} - {cat.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={voucherTemplate.due_date}
                onChange={handleTemplateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs.)</label>
                <input
                  type="number"
                  name="discount"
                  value={voucherTemplate.discount}
                  onChange={handleTemplateChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fine (Rs.)</label>
                <input
                  type="number"
                  name="fine"
                  value={voucherTemplate.fine}
                  onChange={handleTemplateChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={voucherTemplate.remarks}
                onChange={handleTemplateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
            
            {/* Fee Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Fee Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>Varies by class</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="text-green-600">- Rs. {voucherTemplate.discount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fine:</span>
                  <span className="text-red-600">+ Rs. {voucherTemplate.fine || '0.00'}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
                  <span>Average Final Amount:</span>
                  <span>Rs. {calculateAverageAmount().toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={generateVouchers}
                className="w-full flex justify-center"
                disabled={loading || selectedStudents.length === 0}
              >
                {loading ? (
                  <span>Generating Vouchers...</span>
                ) : (
                  <span>Generate {selectedStudents.length} Vouchers</span>
                )}
              </Button>
              
              {statusMessage && (
                <div className={`mt-3 text-center text-sm p-2 rounded ${
                  statusMessage.startsWith('Success') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
export default FeeManagement;