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
  const [termDetails, setTermDetails] = useState([]); // New state for term details
  const [terms, setTerms] = useState([]); // New state for terms
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [markType, setMarkType] = useState('exam'); // 'exam' or 'quiz'
  const [marks, setMarks] = useState({});

  // Exam form state
  const [examData, setExamData] = useState({
    exam_type: '',
    total_marks: '', 
    term_details_id: '' // This will now be set dynamically
  });

  // Quiz form state
  const [quizData, setQuizData] = useState({
    cp: 'Excellent',
    rubrics: 5,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load subjects (this would be based on teacher's assigned subjects)
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      setSubjects(subjectsData || []);

      // Load classes (this would be based on teacher's assigned classes)
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      setClasses(classesData || []);

      // Load terms first
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
      console.log("termDetailsData", termDetailsData);
      setTermDetails(termDetailsData || []);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .order('fullname');
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  // New function to get term details ID based on selected subject and term ID
  const getTermDetailsId = (subjectName, termId) => {
    const termDetail = termDetails.find(td => 
      td.subject === subjectName && td.term_id === termId
    );
    return termDetail ? termDetail.id : '';
  };

  // Update examData when subject changes
  useEffect(() => {
    if (selectedSubject && termDetails.length > 0 && terms.length > 0) {
      // Get the first available term for the selected subject
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
  }, [selectedClass]);

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const examRecords = students.map(student => ({
        student_id: student.id,
        exam_type: examData.exam_type,
        subject: selectedSubject,
        total_marks: parseInt(examData.total_marks),
        marks_obtained: parseInt(marks[student.id] || 0),
        percentage: marks[student.id] ? (parseInt(marks[student.id]) / parseInt(examData.total_marks)) * 100 : 0,
        grade: calculateGrade(marks[student.id] ? (parseInt(marks[student.id]) / parseInt(examData.total_marks)) * 100 : 0),
        term_details_id: examData.term_details_id // Now dynamically set
      }));


      const { error } = await supabase
        .from('exams')
        .insert(examRecords);

      if (error) throw error;

      alert('Exam marks saved successfully!');
      setMarks({});
      setExamData({ exam_type: '', total_marks: '', term_details_id: examData.term_details_id });

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

    try {
      const quizRecords = students.map(student => ({
        student_id: student.id,
        subject: selectedSubject,
        cp: quizData.cp,
        rubrics: quizData.rubrics,
        date: quizData.date
      }));

      const { error } = await supabase
        .from('quiz')
        .insert(quizRecords);

      if (error) throw error;

      alert('Quiz marks saved successfully!');
      setQuizData({ cp: 'Excellent', rubrics: 5, date: new Date().toISOString().split('T')[0] });

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

  // Get available terms for the selected subject
  const getAvailableTerms = () => {
    console.log("terms", terms);
    console.log("termDetails", termDetails);
    if (!selectedSubject || terms.length === 0 || termDetails.length === 0) return [];
    
    // Get term_details for the selected subject
    const subjectTermDetails = termDetails.filter(td => td.subject === selectedSubject);
    console.log("selectedSubject", selectedSubject);
    console.log("termDetails", termDetails);
    console.log("subjectTermDetails", subjectTermDetails);  
    // Map to terms with names
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

      {selectedClass && selectedSubject && students.length > 0 && (
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
                      Term Details ID
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                      {examData.term_details_id || 'Auto-selected'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CP Grade
                    </label>
                    <select
                      value={quizData.cp}
                      onChange={(e) => setQuizData(prev => ({ ...prev, cp: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="A">A</option>
                      <option value="Fair">Fair</option>
                      <option value="V. Good">V. Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                      <option value="Unsatisfactory">Unsatisfactory</option>
                      <option value="Zero">Zero</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rubrics (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={quizData.rubrics}
                      onChange={(e) => setQuizData(prev => ({ ...prev, rubrics: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
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
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Students</h4>
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{student.fullname}</span>
                    {markType === 'exam' ? (
                      <input
                        type="number"
                        min="0"
                        max={examData.total_marks || 100}
                        value={marks[student.id] || ''}
                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        className="w-24 px-3 py-1 border border-gray-300 rounded text-center"
                        placeholder="Marks"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">
                        CP: {quizData.cp} | Rubrics: {quizData.rubrics}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t bg-gray-50">
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