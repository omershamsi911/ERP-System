import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const StudentProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [progressData, setProgressData] = useState({});
  const [existingProgress, setExistingProgress] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
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

      // Load subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      setSubjects(subjectsData || []);

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
        // .eq('class_id', selectedClass)
        // .eq('section_id', selectedSection)
        .order('fullname');
      setStudents(studentsData || []);

      // Load existing progress data
      if (selectedSubject) {
        await loadExistingProgress();
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingProgress = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject) return;

    try {
      const { data: progressData } = await supabase
        .from('student_progress_report')
        .select('*')
        // .eq('class_id', selectedClass)
        // .eq('section_id', selectedSection)
        // .eq('subject', selectedSubject)
        .in('student_id', students.map(s => s.id));

      setExistingProgress(progressData || []);
      
      // Pre-fill progress form with existing data
      const progressMap = {};
      progressData?.forEach(record => {
        progressMap[record.student_id] = {
          uniform_compliance: record.uniform_compliance || 1,
          homework_completion: record.homework_completion || 1,
          class_participation: record.class_participation || 1,
          behavior: record.behavior || 1,
          // overall_progress: record.overall_progress || 1
        };
      });
      setProgressData(progressMap);
    } catch (error) {
      console.error('Error loading existing progress:', error);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (selectedSubject && students.length > 0) {
      loadExistingProgress();
    }
  }, [selectedSubject]);

  const handleProgressChange = (studentId, field, value) => {
    setProgressData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: parseInt(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const progressRecords = students.map(student => ({
        student_id: student.id,
        // class_id: selectedClass,
        // section_id: selectedSection,
        // subject: selectedSubject,
        uniform_compliance: progressData[student.id]?.uniform_compliance || 1,
        homework_completion: progressData[student.id]?.homework_completion || 1,
        class_participation: progressData[student.id]?.class_participation || 1,
        behavior: progressData[student.id]?.behavior || 1,
        // overall_progress: progressData[student.id]?.overall_progress || 1,
        date: new Date().toISOString().split('T')[0],
      }));

      // First, delete existing progress for this class/section/subject combination
      await supabase
        .from('student_progress_report')
        .delete()
        // .eq('class_id', selectedClass)
        // .eq('section_id', selectedSection)
        // .eq('subject', selectedSubject);

      // Insert new progress records
      const { error } = await supabase
        .from('student_progress_report')
        .insert(progressRecords);

      if (error) throw error;

      alert('Student progress saved successfully!');
      await loadExistingProgress();

    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Error saving progress');
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (value) => {
    const ratings = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratings[value] || 'Not Rated';
  };

  const getRatingColor = (value) => {
    switch (value) {
      case 1: return 'text-red-600';
      case 2: return 'text-orange-600';
      case 3: return 'text-yellow-600';
      case 4: return 'text-blue-600';
      case 5: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Progress Evaluation</h2>
        <p className="text-gray-600">Evaluate student progress in various areas by subject</p>
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
              setStudents([]);
              setProgressData({});
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
              setStudents([]);
              setProgressData({});
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
            onChange={(e) => setSelectedSubject(e.target.value)}
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
          <form onSubmit={handleSubmit}>
            {/* Form Header */}
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">
                Progress Evaluation - {selectedSubject}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Class: {classes.find(c => c.id === selectedClass)?.name} - 
                Section: {sections.find(s => s.id === selectedSection)?.name}
              </p>
            </div>

            {/* Students List */}
            <div className="p-4">
              <div className="space-y-6">
                {students.map(student => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">{student.fullname}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Uniform Compliance */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Uniform Compliance
                        </label>
                        <select
                          value={progressData[student.id]?.uniform_compliance || 1}
                          onChange={(e) => handleProgressChange(student.id, 'uniform_compliance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Homework Completion */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Homework Completion
                        </label>
                        <select
                          value={progressData[student.id]?.homework_completion || 1}
                          onChange={(e) => handleProgressChange(student.id, 'homework_completion', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Class Participation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class Participation
                        </label>
                        <select
                          value={progressData[student.id]?.class_participation || 1}
                          onChange={(e) => handleProgressChange(student.id, 'class_participation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Behavior */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Behavior
                        </label>
                        <select
                          value={progressData[student.id]?.behavior || 1}
                          onChange={(e) => handleProgressChange(student.id, 'behavior', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Overall Progress */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Overall Progress
                        </label>
                        <select
                          // value={progressData[student.id]?.overall_progress || 1}
                          // onChange={(e) => handleProgressChange(student.id, 'overall_progress', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <span className={getRatingColor(progressData[student.id]?.uniform_compliance || 1)}>
                          Uniform: {progressData[student.id]?.uniform_compliance || 1}/5
                        </span>
                        <span className={getRatingColor(progressData[student.id]?.homework_completion || 1)}>
                          Homework: {progressData[student.id]?.homework_completion || 1}/5
                        </span>
                        <span className={getRatingColor(progressData[student.id]?.class_participation || 1)}>
                          Participation: {progressData[student.id]?.class_participation || 1}/5
                        </span>
                        <span className={getRatingColor(progressData[student.id]?.behavior || 1)}>
                          Behavior: {progressData[student.id]?.behavior || 1}/5
                        </span>
                        <span className={getRatingColor(progressData[student.id]?.overall_progress || 1)}>
                          Overall: {progressData[student.id]?.overall_progress || 1}/5
                        </span>
                      </div>
                    </div>
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
                {loading ? 'Saving...' : 'Save Progress Evaluations'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};