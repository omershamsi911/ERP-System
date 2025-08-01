import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const RecheckingSchedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [evaluations, setEvaluations] = useState({});

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
        .order('full_name');
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass]);

  const handleEvaluationChange = (studentId, field, value) => {
    setEvaluations(prev => ({
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
      const evaluationRecords = students.map(student => ({
        student_id: student.id,
        subjects: selectedSubject,
        completeness: evaluations[student.id]?.completeness || 1,
        accuracy: evaluations[student.id]?.accuracy || 1,
        clarity: evaluations[student.id]?.clarity || 1,
        feedback: evaluations[student.id]?.feedback || 1,
        presentation: evaluations[student.id]?.presentation || 1
      }));

      const { error } = await supabase
        .from('rechecking_schedule')
        .insert(evaluationRecords);

      if (error) throw error;

      alert('Rechecking evaluations saved successfully!');
      setEvaluations({});

    } catch (error) {
      console.error('Error saving evaluations:', error);
      alert('Error saving evaluations');
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechecking Schedule</h2>
        <p className="text-gray-600">Evaluate student copies for completeness, accuracy, and presentation</p>
      </div>

      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {selectedClass && selectedSubject && students.length > 0 && (
        <div className="bg-white border rounded-lg">
          <form onSubmit={handleSubmit}>
            {/* Form Header */}
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">
                Rechecking Evaluations - {selectedSubject}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Rate each student on a scale of 1-5 for different criteria
              </p>
            </div>

            {/* Students List */}
            <div className="p-4">
              <div className="space-y-4">
                {students.map(student => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{student.full_name}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Completeness */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Completeness
                        </label>
                        <select
                          value={evaluations[student.id]?.completeness || 1}
                          onChange={(e) => handleEvaluationChange(student.id, 'completeness', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Accuracy */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accuracy
                        </label>
                        <select
                          value={evaluations[student.id]?.accuracy || 1}
                          onChange={(e) => handleEvaluationChange(student.id, 'accuracy', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Clarity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Clarity
                        </label>
                        <select
                          value={evaluations[student.id]?.clarity || 1}
                          onChange={(e) => handleEvaluationChange(student.id, 'clarity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Feedback */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback
                        </label>
                        <select
                          value={evaluations[student.id]?.feedback || 1}
                          onChange={(e) => handleEvaluationChange(student.id, 'feedback', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                              {rating} - {getRatingLabel(rating)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Presentation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Presentation
                        </label>
                        <select
                          value={evaluations[student.id]?.presentation || 1}
                          onChange={(e) => handleEvaluationChange(student.id, 'presentation', e.target.value)}
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
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <span>Completeness: {evaluations[student.id]?.completeness || 1}/5</span>
                        <span>Accuracy: {evaluations[student.id]?.accuracy || 1}/5</span>
                        <span>Clarity: {evaluations[student.id]?.clarity || 1}/5</span>
                        <span>Feedback: {evaluations[student.id]?.feedback || 1}/5</span>
                        <span>Presentation: {evaluations[student.id]?.presentation || 1}/5</span>
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
                {loading ? 'Saving...' : 'Save Rechecking Evaluations'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 