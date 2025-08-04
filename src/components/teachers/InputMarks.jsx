import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const InputMarks = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [termDetails, setTermDetails] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [markType, setMarkType] = useState('exam');
  const [studentMarks, setStudentMarks] = useState([]);

  // Exam form state
  const [examData, setExamData] = useState({
    exam_type: '',
    total_marks: '',
    term_details_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Quiz form state
  const [quizData, setQuizData] = useState({
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      setSubjects(subjectsData || []);

      // Load classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      setClasses(classesData || []);

      // Load sections
      const { data: sectionsData } = await supabase
        .from('sections')
        .select('*')
        .order('name');
      setSections(sectionsData || []);

      // Load terms
      const { data: termsData } = await supabase
        .from('terms')
        .select('id, name')
        .order('name');
      setTerms(termsData || []);

      // Load term details
      const { data: termDetailsData } = await supabase
        .from('term_details')
        .select('id, term_id, subject, subject_id')
        .order('term_id');
      setTermDetails(termDetailsData || []);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedClass || !selectedSection) return;

    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('section_id', selectedSection)
        .order('fullname');

      // Initialize student marks array
      const initialMarks = studentsData.map(student => ({
        student_id: student.id,
        student_name: student.fullname,
        marks: '',
        cp: 'Excellent',
        rubric: 5
      }));

      setStudents(studentsData || []);
      setStudentMarks(initialMarks);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTermDetailsId = (subjectName, termId) => {
    const termDetail = termDetails.find(td => 
      td.subject === subjectName && td.term_id === termId
    );
    return termDetail ? termDetail.id : '';
  };

  useEffect(() => {
    if (selectedSubject && termDetails.length > 0 && terms.length > 0) {
      const availableTermDetails = termDetails.filter(td => td.subject === selectedSubject);
      if (availableTermDetails.length > 0) {
        const firstTermDetail = availableTermDetails[0];
        setExamData(prev => ({
          ...prev,
          term_details_id: firstTermDetail.id
        }));
      }
    }
  }, [selectedSubject, termDetails, terms]);

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection]);

  const handleStudentMarkChange = (index, field, value) => {
    setStudentMarks(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all marks are within range
    const invalidMarks = studentMarks.some(mark => {
      const marksValue = parseInt(mark.marks);
      return isNaN(marksValue) || marksValue < 0 || marksValue > parseInt(examData.total_marks);
    });

    if (invalidMarks) {
      alert(`Please ensure all marks are between 0 and ${examData.total_marks}`);
      setLoading(false);
      return;
    }

    try {
      const examRecords = studentMarks.map(mark => ({
        student_id: mark.student_id,
        exam_type: examData.exam_type,
        subject: selectedSubject,
        total_marks: parseInt(examData.total_marks),
        marks_obtained: parseInt(mark.marks) || 0,
        percentage: mark.marks ? 
          (parseInt(mark.marks) / parseInt(examData.total_marks)) * 100 : 0,
        grade: calculateGrade(mark.marks ? 
          (parseInt(mark.marks) / parseInt(examData.total_marks)) * 100 : 0),
        term_details_id: examData.term_details_id,
        date: examData.date
      }));

      const { error } = await supabase
        .from('exams')
        .insert(examRecords);

      if (error) throw error;

      alert('Exam marks saved successfully!');
      setExamData(prev => ({
        exam_type: '',
        total_marks: '',
        term_details_id: prev.term_details_id,
        date: new Date().toISOString().split('T')[0]
      }));
      setStudentMarks(prev => prev.map(m => ({ ...m, marks: '' })));

    } catch (error) {
      console.error('Error saving exam marks:', error);
      alert('Error saving exam marks');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all rubrics are within range (1-5)
    const invalidRubrics = studentMarks.some(mark => {
      const rubricValue = parseInt(mark.rubric);
      return isNaN(rubricValue) || rubricValue < 1 || rubricValue > 5;
    });

    if (invalidRubrics) {
      alert('Please ensure all rubrics are between 1 and 5');
      setLoading(false);
      return;
    }

    try {
      const quizRecords = studentMarks.map(mark => ({
        student_id: mark.student_id,
        subject: selectedSubject,
        cp: mark.cp,
        rubric: mark.rubric,
        date: quizData.date
      }));

      const { error } = await supabase
        .from('quiz')
        .insert(quizRecords);

      if (error) throw error;

      alert('Quiz marks saved successfully!');
      setQuizData({
        date: new Date().toISOString().split('T')[0]
      });
      setStudentMarks(prev => prev.map(m => ({ 
        ...m, 
        rubric: 5,
        cp: 'Excellent'
      })));

    } catch (error) {
      console.error('Error saving quiz marks:', error);
      alert('Error saving quiz marks');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getAvailableTerms = () => {
    if (!selectedSubject || terms.length === 0 || termDetails.length === 0) return [];
    
    const subjectTermDetails = termDetails.filter(td => td.subject === selectedSubject);
    
    return subjectTermDetails.map(td => {
      const term = terms.find(t => t.id === td.term_id);
      return {
        id: td.term_id,
        name: term ? term.name : 'Unknown Term',
        termDetailId: td.id
      };
    }).filter((term, index, self) => 
      index === self.findIndex(t => t.id === term.id)
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Input Marks</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setMarkType('exam')}
            className={`px-4 py-2 rounded ${markType === 'exam' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Exam Marks
          </button>
          <button
            onClick={() => setMarkType('quiz')}
            className={`px-4 py-2 rounded ${markType === 'quiz' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Quiz Marks
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
              setSelectedSubject('');
              // setStudents([]);
              // setStudentMarks([]);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setSelectedSubject('');
              // setStudents([]);
              // setStudentMarks([]);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedClass}
            required
          >
            <option value="">Select Section</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              // setStudents([]);
              // setStudentMarks([]);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedSection}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.name}>{subject.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Students Count
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded-md">
            {students.length} students
          </div>
        </div>
      </div>

      {selectedClass && selectedSection && selectedSubject && students.length > 0 && (
        <div className="bg-white border rounded-lg">
          <form onSubmit={markType === 'exam' ? handleExamSubmit : handleQuizSubmit}>
            {/* Form Header */}
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">
                {markType === 'exam' ? 'Exam Marks' : 'Quiz Marks'} - {selectedSubject}
              </h3>
            </div>

            {/* Form Fields */}
            <div className="p-4">
              {markType === 'exam' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Type
                    </label>
                    <input
                      type="text"
                      value={examData.exam_type}
                      onChange={(e) => setExamData(prev => ({ ...prev, exam_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mid-term, Final"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={examData.total_marks}
                      onChange={(e) => setExamData(prev => ({ ...prev, total_marks: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term
                    </label>
                    <select
                      value={examData.term_details_id ? 
                        termDetails.find(td => td.id === examData.term_details_id)?.term_id || '' : 
                        ''
                      }
                      onChange={(e) => {
                        const selectedTermId = e.target.value;
                        const termDetailsId = getTermDetailsId(selectedSubject, selectedTermId);
                        setExamData(prev => ({ ...prev, term_details_id: termDetailsId }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Term</option>
                      {getAvailableTerms().map(term => (
                        <option key={term.id} value={term.id}>{term.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={examData.date}
                      onChange={(e) => setExamData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={quizData.date}
                      onChange={(e) => setQuizData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Students List */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Students Marks</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        {markType === 'exam' ? (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marks (Max: {examData.total_marks || 'Not set'})
                          </th>
                        ) : (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              CP Grade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rubric (1-5)
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentMarks.map((mark, index) => (
                        <tr key={mark.student_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mark.student_name}
                          </td>
                          {markType === 'exam' ? (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max={examData.total_marks || 100}
                                value={mark.marks}
                                onChange={(e) => handleStudentMarkChange(index, 'marks', e.target.value)}
                                className="w-24 px-3 py-1 border border-gray-300 rounded text-center"
                                placeholder="0"
                                disabled={!examData.total_marks}
                                required
                              />
                            </td>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={mark.cp}
                                  onChange={(e) => handleStudentMarkChange(index, 'cp', e.target.value)}
                                  className="w-32 px-3 py-1 border border-gray-300 rounded"
                                  placeholder="CP Grade"
                                  required
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={mark.rubric}
                                  onChange={(e) => handleStudentMarkChange(index, 'rubric', e.target.value)}
                                  className="w-24 px-3 py-1 border border-gray-300 rounded text-center"
                                  placeholder="1-5"
                                  required
                                />
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : `Save ${markType === 'exam' ? 'Exam' : 'Quiz'} Marks`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};