import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Plus, Edit, Trash2, Search, Printer, Download, ChevronDown, X } from 'lucide-react';

// Reusable Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium flex items-center ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Certification Component
const CertificationResultsPage = () => {
  const [activeTab, setActiveTab] = useState('certificates');
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState('');
  const [certificateData, setCertificateData] = useState({
    title: '',
    type: 'student',
    template: '',
    fields: []
  });

  // Certificate types
  const certificateTypes = [
    { id: 'student', name: 'Student Certificate' },
    { id: 'leaving', name: 'Leaving Certificate' },
    { id: 'merit', name: 'Merit Certificate' },
    { id: 'character', name: 'Character Certificate' },
    { id: 'provisional', name: 'Provisional Certificate' },
    { id: 'appreciation', name: 'Appreciation Certificate' },
    { id: 'staff_basic', name: 'Staff Basic Certificate' },
    { id: 'staff_month', name: 'Staff of the Month' },
    { id: 'custom', name: 'Custom Certificate' }
  ];

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch certificates
        const { data: certData } = await supabase
          .from('certificates')
          .select('*');
        
        // Fetch students
        const { data: studentData } = await supabase
          .from('students')
          .select('id, fullname, class, gr_number, dob, admission_date');
        
        // Fetch exams
        const { data: examData } = await supabase
          .from('exams')
          .select('id, date, exam_type, subject');
        
        // Fetch quizzes
        const { data: quizData } = await supabase
          .from('quiz')
          .select('id, date, subject, rubric');
        
        setCertificates(certData || []);
        setStudents(studentData || []);
        setExams(examData || []);
        setQuizzes(quizData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle certificate creation/update
  const handleSaveCertificate = async () => {
    try {
      setLoading(true);
      
      if (editingCert) {
        // Update existing certificate
        const { data } = await supabase
          .from('certificates')
          .update(certificateData)
          .eq('id', editingCert.id)
          .select();
        setCertificates(certs => certs.map(c => c.id === editingCert.id ? data[0] : c));
      } else {
        // Create new certificate
        const { data } = await supabase
          .from('certificates')
          .insert([certificateData])
          .select();
        setCertificates(certs => [...certs, data[0]]);
      }
      
      setIsModalOpen(false);
      setEditingCert(null);
    } catch (error) {
      console.error('Error saving certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle certificate deletion
  const handleDeleteCertificate = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate template?')) {
      try {
        setLoading(true);
        await supabase
          .from('certificates')
          .delete()
          .eq('id', id);
        setCertificates(certs => certs.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting certificate:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Generate certificate preview
  const generateCertificatePreview = () => {
    if (!selectedStudent || !selectedCertificate) return null;
    
    const student = students.find(s => s.id === selectedStudent);
    const certificate = certificates.find(c => c.id === selectedCertificate);
    
    if (!student || !certificate) return null;
    
    // Replace template placeholders with actual data
    let content = certificate.template;
    content = content.replace(/{{student_name}}/g, student.fullname);
    content = content.replace(/{{class}}/g, student.class);
    content = content.replace(/{{gr_number}}/g, student.gr_number);
    content = content.replace(/{{date}}/g, new Date().toLocaleDateString());
    
    return (
      <div className="border-2 border-gray-200 p-8 bg-white" style={{ minHeight: '500px' }}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  };

  // Generate result for selected student and exam
  const generateResult = () => {
    if (!selectedStudent || !selectedExam) return null;
    
    const student = students.find(s => s.id === selectedStudent);
    const exam = exams.find(e => e.id === selectedExam);
    
    if (!student || !exam) return null;
    
    return (
      <div className="border border-gray-200 p-6 bg-white printable">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{exam.name}</h2>
          <p className="text-gray-600">Result Sheet</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Student Name:</span>
            <span>{student.fullname}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Class:</span>
            <span>{student.class}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">GR Number:</span>
            <span>{student.gr_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Exam Date:</span>
            <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">Subject</th>
              <th className="p-2 border text-center">Marks</th>
              <th className="p-2 border text-center">Grade</th>
              <th className="p-2 border text-center">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {exam.subjects?.map((subject, index) => (
              <tr key={index}>
                <td className="p-2 border">{subject.name}</td>
                <td className="p-2 border text-center">-</td>
                <td className="p-2 border text-center">-</td>
                <td className="p-2 border text-center">-</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-6 flex justify-between">
          <div>
            <p className="font-medium">Class Teacher Remarks:</p>
            <p className="border-b-2 border-gray-300 min-w-[200px] h-8"></p>
          </div>
          <div>
            <p className="font-medium">Principal Signature:</p>
            <p className="border-b-2 border-gray-300 min-w-[200px] h-8"></p>
          </div>
        </div>
      </div>
    );
  };

  // Print result/certificate
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = document.querySelector('.printable').innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          @media print { 
            @page { size: A4; margin: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Certificates & Results</h1>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('certificates')}
          className={`py-4 px-6 font-medium ${activeTab === 'certificates' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Certificates
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`py-4 px-6 font-medium ${activeTab === 'results' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Results
        </button>
      </div>
      
      {activeTab === 'certificates' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Certificate Templates</h2>
            <Button onClick={() => {
              setCertificateData({
                title: '',
                type: 'student',
                template: '',
                fields: []
              });
              setIsModalOpen(true);
              setEditingCert(null);
            }}>
              <Plus size={18} className="mr-2" /> Create Template
            </Button>
          </div>
          
          {loading ? (
            <p className="text-center py-8">Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No certificate templates found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map(cert => (
                <Card key={cert.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{cert.title}</h3>
                      <p className="text-gray-600 text-sm capitalize">{cert.type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingCert(cert);
                          setCertificateData(cert);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-[120px] overflow-y-auto border border-gray-200 p-2 text-sm">
                    <div dangerouslySetInnerHTML={{ __html: cert.template.substring(0, 200) + '...' }} />
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Certificate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.fullname} (Class: {student.class}, GR#: {student.gr_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Certificate Template</label>
                <select
                  value={selectedCertificate}
                  onChange={(e) => setSelectedCertificate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a template</option>
                  {certificates.map(cert => (
                    <option key={cert.id} value={cert.id}>
                      {cert.title} ({cert.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {generateCertificatePreview()}
            
            <div className="mt-4 flex justify-end space-x-3">
              <Button variant="secondary">
                <Download size={18} className="mr-2" /> Download
              </Button>
              <Button onClick={handlePrint}>
                <Printer size={18} className="mr-2" /> Print Certificate
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Result</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.fullname} (Class: {student.class}, GR#: {student.gr_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select an exam</option>
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} ({new Date(exam.exam_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {generateResult()}
            
            <div className="mt-4 flex justify-end space-x-3">
              <Button variant="secondary">
                <Download size={18} className="mr-2" /> Download
              </Button>
              <Button onClick={handlePrint}>
                <Printer size={18} className="mr-2" /> Print Result
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Certificate Template Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCert(null);
        }} 
        title={editingCert ? 'Edit Certificate Template' : 'Create New Certificate Template'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={certificateData.title}
              onChange={(e) => setCertificateData({...certificateData, title: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Merit Certificate 2023"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
            <select
              value={certificateData.type}
              onChange={(e) => setCertificateData({...certificateData, type: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {certificateTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template HTML</label>
            <textarea
              value={certificateData.template}
              onChange={(e) => setCertificateData({...certificateData, template: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg h-64"
              placeholder={`Use placeholders like {{student_name}}, {{class}}, {{gr_number}}, {{date}}`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Fields</label>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm mb-2">You can use these placeholders in your template:</p>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <li className="bg-white p-1 px-2 rounded">{"{{student_name}}"}</li>
                <li className="bg-white p-1 px-2 rounded">{"{{class}}"}</li>
                <li className="bg-white p-1 px-2 rounded">{"{{gr_number}}"}</li>
                <li className="bg-white p-1 px-2 rounded">{"{{dob}}"}</li>
                <li className="bg-white p-1 px-2 rounded">{"{{admission_date}}"}</li>
                <li className="bg-white p-1 px-2 rounded">{"{{date}}"}</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCertificate}>Save Template</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CertificationResultsPage;