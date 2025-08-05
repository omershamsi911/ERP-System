import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Plus, Edit, Trash2, Search, Printer, Download, ChevronDown, X, Filter } from 'lucide-react';

// Reusable Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
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
  const [activeTab, setActiveTab] = useState('results');
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
  
  // State for results
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [examResults, setExamResults] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentResults, setSelectedStudentResults] = useState(null);

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
          .select('id, fullname, class, section, gr_number, dob, admission_date, class_id, section_id');
        
        // Fetch exams
        const { data: examData } = await supabase
          .from('exams')
          .select('id, date, exam_type, subject, student_id, marks_obtained, total_marks, grade, remarks, term_details_id');
        
        // Fetch quizzes
        const { data: quizData } = await supabase
          .from('quiz')
          .select('id, date, subject, rubric, student_id, cp');
        
        // Fetch classes and sections
        const { data: classData } = await supabase
          .from('classes')
          .select('id, name')
          .order('name');
        
        const { data: sectionData } = await supabase
          .from('sections')
          .select('id, name')
          .order('name');
        
        const examTypes = [...new Set(examData?.map(exam => exam.exam_type))].map(type => ({
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1) // Capitalize first letter
        }));

        setExamTypes(examTypes);
        setCertificates(certData || []);
        setStudents(studentData || []);
        setExams(examData || []);
        setQuizzes(quizData || []);
        setClasses(classData || []);
        setSections(sectionData || []);
        
        if (classData && classData.length > 0) {
          setSelectedClass(classData[0].id);
        }
        if (sectionData && sectionData.length > 0) {
          setSelectedSection(sectionData[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch exam results when class, section or exam type changes
  useEffect(() => {
    const fetchExamResults = async () => {
      if (!selectedClass || !selectedSection) return;

      try {
        setLoading(true);

        // Fetch students in the selected class and section
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, fullname, gr_number, class_id, section_id')
          .eq('class_id', selectedClass)
          .eq('section_id', selectedSection);
        
        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          return;
        }
        
        setClassStudents(studentsData || []);
        
        // Fetch exam results for these students
        const studentIds = studentsData.map(s => s.id);
        const { data: resultsData, error: resultsError } = await supabase
          .from('exams')
          .select('*')
          .in('student_id', studentIds);
          console.log(resultsData)
          
        if (resultsError) {
          console.error('Error fetching exam results:', resultsError);
          return;
        }
        
        setExamResults(resultsData);
        
        // Fetch quiz results for these students
        const { data: quizResultsData, error: quizError } = await supabase
          .from('quiz')
          .select('*')
          .in('student_id', studentIds);
          
        if (quizError) {
          console.error('Error fetching quiz results:', quizError);
          return;
        }
        
        setQuizResults(quizResultsData || []);
        
        // Extract unique subjects from exams and quizzes
        const examSubjects = [...new Set(resultsData.map(r => r.subject))];
        console.log(examSubjects)
        const quizSubjects = [...new Set(quizResultsData.map(q => q.subject))];
        const allSubjects = [...new Set([...examSubjects, ...quizSubjects])];
        
        setClassSubjects(allSubjects);
      } catch (error) {
        console.error('Error processing results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamResults();
  }, [selectedClass, selectedSection, selectedExamType]);

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

  // Filter students based on search query
  const filteredStudents = classStudents.filter(student => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.fullname.toLowerCase().includes(query) ||
      student.gr_number.toLowerCase().includes(query)
    );
  });

  // Get results for a specific student
  const getStudentResults = (studentId) => {
    const student = classStudents.find(s => s.id === studentId);
    if (!student) return null;
    
    // Get exam results for this student
    const studentExams = examResults.filter(e => e.student_id === studentId);
    console.log("mei hon",examResults)
    
    // Get quiz results for this student
    const studentQuizzes = quizResults.filter(q => q.student_id === studentId);
    
    // Group by subject
    const resultsBySubject = {};
    
    // Process exam results
    studentExams.forEach(exam => {
      if (!resultsBySubject[exam.subject]) {
        resultsBySubject[exam.subject] = {
          exams: {},
          quizzes: []
        };
      }
      resultsBySubject[exam.subject].exams[exam.exam_type] = {
        marks_obtained: exam.marks_obtained,
        total_marks: exam.total_marks,
        grade: exam.grade,
        remarks: exam.remarks
      };
    });
    console.log("bysubject",resultsBySubject)
    
    // Process quiz results
    studentQuizzes.forEach(quiz => {
      if (!resultsBySubject[quiz.subject]) {
        resultsBySubject[quiz.subject] = {
          exams: {},
          quizzes: []
        };
      }
      resultsBySubject[quiz.subject].quizzes.push({
        date: quiz.date,
        rubric: quiz.rubric,
        cp: quiz.cp
      });
    });
    
    // Calculate cumulative scores per subject
    Object.keys(resultsBySubject).forEach(subject => {
      const subjectData = resultsBySubject[subject];
      const quizCount = subjectData.quizzes.length;
      const quizTotal = subjectData.quizzes.reduce((sum, quiz) => {
        // Assuming cp is a numeric score
        const score = parseFloat(quiz.cp) || 0;
        return sum + score;
      }, 0);
      
      const quizAvg = quizCount > 0 ? (quizTotal / quizCount) : 0;
      
      const midTerm = subjectData.exams.mid || {};
      const finalTerm = subjectData.exams.final || {};
      
      // Simple cumulative calculation (adjust weights as needed)
      const cumulative = 
        (quizAvg * 0.2) + 
        ((midTerm.marks_obtained || 0) * 0.3) + 
        ((finalTerm.marks_obtained || 0) * 0.5);
      
      resultsBySubject[subject].cumulative = Math.round(cumulative);
    });
    
    return {
      student,
      results: resultsBySubject
    };
  };

  // Display student results
  const displayStudentResults = () => {
    if (!selectedStudentResults) return null;
    
    const { student, results } = selectedStudentResults;
    const subjects = Object.keys(results);
    
    const selectedClassObj = classes.find(c => c.id === selectedClass);
    const selectedSectionObj = sections.find(s => s.id === selectedSection);
    
    return (
      <div className="border border-gray-200 p-6 bg-white printable">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Student Result</h2>
            <p className="text-gray-600">
              {selectedClassObj?.name || 'Class'} - {selectedSectionObj?.name || 'Section'} | 
              Term: {selectedExamType || 'All Terms'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">{student.fullname}</p>
            <p>GR Number: {student.gr_number}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-3 border text-left">Subject</th>
                <th className="p-3 border text-center">Quizzes</th>
                <th className="p-3 border text-center">Mid Term</th>
                <th className="p-3 border text-center">Final Exam</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => {
                const subjectData = results[subject];
                console.log("Subject", subject)
                console.log("main result hoon", results[subject])
                const quizCount = subjectData.quizzes.length;
                const quizAvg = quizCount > 0 ? 
                  (subjectData.quizzes.reduce((sum, quiz) => sum + (parseFloat(quiz.rubric) || 0), 0) / quizCount) : 
                  0;
                
                const midTerm = subjectData.exams.Midterm || {};
                // console.log("midterm", midTerm, "midterm 2", subjectData.exams.mid);
                const finalTerm = subjectData.exams.Final || {};
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 border font-medium">{subject}</td>
                    <td className="p-3 border text-center">
                      {quizCount > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{quizAvg.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({quizCount} quizzes)</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-3 border text-center">
                      {midTerm.marks_obtained ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{midTerm.marks_obtained}/{midTerm.total_marks}</span>
                          <span className="text-xs text-gray-500">{midTerm.grade}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-3 border text-center">
                      {finalTerm.marks_obtained ? (
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{finalTerm.marks_obtained}/{finalTerm.total_marks}</span>
                          <span className="text-xs text-gray-500">{finalTerm.grade}</span>
                        </div>
                      ) : '-'}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-lg mb-3">Quiz Details</h3>
            {subjects.map((subject, index) => {
              const subjectData = results[subject];
              if (subjectData.quizzes.length === 0) return null;
              
              return (
                <div key={index} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">{subject}</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Rubric</th>
                          <th className="p-2 text-left">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectData.quizzes.map((quiz, qIndex) => (
                          <tr key={qIndex} className={qIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-2">{new Date(quiz.date).toLocaleDateString()}</td>
                            <td className="p-2">{quiz.rubric}</td>
                            <td className="p-2 font-medium">{quiz.cp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3">Remarks</h3>
            {subjects.map((subject, index) => {
              const subjectData = results[subject];
              const remarks = [];
              
              if (subjectData.exams.mid && subjectData.exams.mid.remarks) {
                remarks.push({ type: 'Mid Term', remark: subjectData.exams.mid.remarks });
              }
              
              if (subjectData.exams.final && subjectData.exams.final.remarks) {
                remarks.push({ type: 'Final Exam', remark: subjectData.exams.final.remarks });
              }
              
              if (remarks.length === 0) return null;
              
              return (
                <div key={index} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">{subject}</h4>
                  <div className="space-y-2">
                    {remarks.map((remark, rIndex) => (
                      <div key={rIndex} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-sm">{remark.type}:</p>
                        <p>{remark.remark}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-8 flex justify-between border-t pt-4">
          <div>
            <p className="font-medium">Class Teacher Remarks:</p>
            <p className="mt-2 italic">Excellent performance overall. Shows great potential.</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Principal Signature:</p>
            <div className="mt-6 h-12 w-32 border-b border-gray-400"></div>
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
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .printable { width: 100%; }
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

  // Download results as PDF
  const handleDownload = () => {
    alert('PDF download functionality would be implemented here');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Results & Certificates</h1>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('results')}
          className={`py-4 px-6 font-medium ${activeTab === 'results' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Results
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`py-4 px-6 font-medium ${activeTab === 'certificates' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Certificates
        </button>
      </div>
      
      {activeTab === 'results' ? (
        <div className="space-y-6">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a section</option>
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Term</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Terms</option>
                  {examTypes.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name or GR number..."
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
                  />
                  <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Loading results...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No students match your search' : 'No students found in this class/section'}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-left">GR Number</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 font-medium">{student.fullname}</td>
                        <td className="p-3">{student.gr_number}</td>
                        <td className="p-3 text-center">
                          <Button 
                            onClick={() => setSelectedStudentResults(getStudentResults(student.id))}
                            variant="primary"
                            className="py-1 px-3 text-sm"
                          >
                            View Results
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          
          {selectedStudentResults && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedStudentResults.student.fullname}'s Results
                </h2>
                <div className="flex space-x-2">
                  <Button variant="success" onClick={handleDownload}>
                    <Download size={18} className="mr-2" /> Download PDF
                  </Button>
                  <Button onClick={handlePrint}>
                    <Printer size={18} className="mr-2" /> Print Results
                  </Button>
                </div>
              </div>
              {displayStudentResults()}
            </Card>
          )}
        </div>
      ) : (
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