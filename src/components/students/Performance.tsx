import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertTriangle, User, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Student {
  id: string;
  fullname: string; // Fixed: was 'name', should be 'fullname' per schema
  class: string;    // Fixed: was 'grade', should be 'class' per schema
  section: string;
}

interface Exam {
  id: string;
  term_details_id: string;
  student_id: string;
  exam_type: string;
  subject: string;
  total_marks: number;
  percentage: number | null;
  grade: string | null;
  marks_obtained: number | null;
  created_at: string;
}

interface Rechecking {
  id: string;
  student_id: string;
  subjects: string;
  completeness: number;
  accuracy: number;
  clarity: number;
  feedback: number;
  presentation: number;
}

interface ProgressReport {
  id: string;
  date: string;
  day: string | null;
  student_id: string;
  attendance_id: string | null;
  uniform_compliance: string;
  homework_completion: string;
  class_discipline: string;
  class_work: string | null;
  punctuality: string;
  class_participation: string | null;
  behavior: string;
}

interface Quiz {
  id: string;
  student_id: string;
  subject: string;
  cp: string | null;
  rubric: number;
  date: string;
}

interface PerformanceData {
  exams: Exam[];
  progressReports: ProgressReport[];
  quizzes: Quiz[];
  rechecking: Rechecking[];
  student: Student | null;
}

const StudentPerformanceDashboard = ({ studentId }: { studentId?: string }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    exams: [],
    progressReports: [],
    quizzes: [],
    rechecking: [],
    student: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Validate studentId
        if (!studentId || studentId === 'undefined' || studentId === 'null') {
          throw new Error('Student ID is required and must be valid');
        }
        
        // Fetch student data - Fixed field references
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, fullname, class, section') // Fixed: removed invalid exams reference
          .eq('id', studentId)
          .single();
        
        if (studentError) throw studentError;
        
        const [
          { data: examsData, error: examsError },
          { data: progressData, error: progressError },
          { data: quizzesData, error: quizzesError },
          { data: recheckingData, error: recheckingError }
        ] = await Promise.all([
          supabase.from('exams').select('*').eq('student_id', studentId),
          supabase.from('student_progress_report').select('*').eq('student_id', studentId),
          supabase.from('quiz').select('*').eq('student_id', studentId),
          supabase.from('rechecking_schedule').select('*').eq('student_id', studentId)
        ]);
        
        if (examsError || progressError || quizzesError || recheckingError) {
          throw examsError || progressError || quizzesError || recheckingError;
        }
        
        setPerformanceData({
          student: studentData,
          exams: examsData || [],
          progressReports: progressData || [],
          quizzes: quizzesData || [],
          rechecking: recheckingData || []
        });
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch data if studentId is valid
    if (studentId && studentId !== 'undefined' && studentId !== 'null') {
      fetchData();
    } else {
      setError('Invalid or missing student ID');
      setLoading(false);
    }
  }, [studentId]);

  const performanceAnalysis = useMemo(() => {
    const { exams, progressReports, quizzes, rechecking } = performanceData;
    
    const sortedExams = [...exams].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const subjectPerformance = {};
    sortedExams.forEach(exam => {
      if (!subjectPerformance[exam.subject]) {
        subjectPerformance[exam.subject] = [];
      }
      if (exam.percentage !== null) {
        subjectPerformance[exam.subject].push({
          type: exam.exam_type,
          percentage: exam.percentage,
          date: exam.created_at
        });
      }
    });

    // Calculate overall trend
    const overallTrend = sortedExams.length > 1 ? sortedExams.reduce((acc, exam, index, arr) => {
      if (index === 0 || exam.percentage === null) return acc;
      const prev = arr[index - 1];
      if (prev.percentage === null) return acc;
      return acc + (exam.percentage - prev.percentage);
    }, 0) / (sortedExams.length - 1) : 0;

    const subjectAverages = Object.keys(subjectPerformance).map(subject => {
      const scores = subjectPerformance[subject];
      const average = scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length;
      const trend = scores.length > 1 ? 
        scores[scores.length - 1].percentage - scores[0].percentage : 0;
      
      return {
        subject,
        average: Math.round(average * 100) / 100,
        trend,
        latest: scores[scores.length - 1]?.percentage || 0
      };
    });

    const predictions = subjectAverages.map(subj => {
      const predicted = subj.latest + (subj.trend * 0.5);
      return {
        ...subj,
        predicted: Math.min(100, Math.max(0, Math.round(predicted * 100) / 100))
      };
    });

    const behavioralScores = progressReports.map(report => {
      // Map string values to numeric scores
      const mapScore = (value: string) => {
        if (!value) return 6; // Handle null/undefined values
        const lowerValue = value.toLowerCase();
        if (lowerValue.includes('excellent')) return 10;
        if (lowerValue.includes('good')) return 8;
        if (lowerValue.includes('satisfactory')) return 6;
        if (lowerValue.includes('needs improvement')) return 4;
        return 6; // Default
      };
      
      const scores = {
        uniform_compliance: mapScore(report.uniform_compliance),
        homework_completion: mapScore(report.homework_completion),
        class_discipline: mapScore(report.class_discipline),
        punctuality: mapScore(report.punctuality),
        behavior: mapScore(report.behavior)
      };
      
      return {
        date: report.date,
        ...scores,
        overall: Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / 5) * 10) / 10
      };
    });

    
    
    return {
      subjectAverages,
      predictions,
      overallTrend: isNaN(overallTrend) ? 0 : overallTrend,
      behavioralScores,
      overallAverage: subjectAverages.length > 0 
        ? Math.round((subjectAverages.reduce((sum, subj) => sum + subj.average, 0) / subjectAverages.length) * 100) / 100
        : 0
    };
  }, [performanceData]);

  const generateCommentary = () => {
    const { overallAverage, overallTrend, predictions } = performanceAnalysis;
    
    let commentary:string[] = [];
    
    if (overallAverage >= 90) {
      commentary.push("🎉 Outstanding academic performance! The student consistently demonstrates excellence across subjects.");
    } else if (overallAverage >= 80) {
      commentary.push("👍 Strong academic performance with room for further improvement in specific areas.");
    } else if (overallAverage >= 70) {
      commentary.push("📈 Satisfactory performance with significant potential for improvement.");
    } else if (overallAverage > 0) {
      commentary.push("⚠️ Academic performance needs attention and focused intervention.");
    }

    if (overallTrend > 2) {
      commentary.push("📈 Excellent upward trend - the student is showing consistent improvement over time.");
    } else if (overallTrend > 0) {
      commentary.push("↗️ Positive trend - gradual improvement observed in recent assessments.");
    } else if (overallTrend < -2) {
      commentary.push("📉 Concerning downward trend - immediate attention and support recommended.");
    } else if (overallAverage > 0) {
      commentary.push("➡️ Stable performance - maintaining consistent academic standards.");
    }

    const strongSubjects = predictions.filter(subj => subj.average >= 85);
    const weakSubjects = predictions.filter(subj => subj.average < 75);

    if (strongSubjects.length > 0) {
      commentary.push(`🌟 Strong performance in: ${strongSubjects.map(s => s.subject).join(', ')}`);
    }

    if (weakSubjects.length > 0) {
      commentary.push(`📚 Areas needing attention: ${weakSubjects.map(s => s.subject).join(', ')}`);
    }

    const improvingSubjects = predictions.filter(subj => subj.predicted > subj.latest);
    if (improvingSubjects.length > 0) {
      commentary.push(`🔮 Predicted improvements in: ${improvingSubjects.map(s => s.subject).join(', ')}`);
    }

    return commentary.length > 0 ? commentary : ["No performance data available yet."];
  };

  const TabButton = ({ tabKey, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tabKey
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500 p-6 bg-red-50 rounded-lg max-w-md">
          <AlertTriangle className="mx-auto mb-4" size={36} />
          <h3 className="text-xl font-semibold mb-2">Data Loading Error</h3>
          <p className="mb-4">{error}</p>
          {(!studentId || studentId === 'undefined' || studentId === 'null') && (
            <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
              <p><strong>Debug Info:</strong></p>
              <p>Student ID received: {JSON.stringify(studentId)}</p>
              <p>Please ensure a valid student ID is passed to this component.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!performanceData.student) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto mb-4 text-gray-400" size={36} />
          <h3 className="text-xl font-semibold">Student not found</h3>
          <p className="text-gray-600">The requested student data could not be loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{performanceData.student.fullname}</h1>
              <p className="text-gray-600">{performanceData.student.class} {performanceData.student.section} • Performance Dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{performanceAnalysis.overallAverage}%</div>
            <div className="text-sm text-gray-500">Overall Average</div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <TabButton tabKey="overview" label="Overview" icon={Award} />
        <TabButton tabKey="trends" label="Trends" icon={TrendingUp} />
        <TabButton tabKey="subjects" label="Subjects" icon={BookOpen} />
        <TabButton tabKey="behavior" label="Behavior" icon={User} />
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {performanceAnalysis.subjectAverages.map((subject, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
                  {subject.trend > 0 ? (
                    <TrendingUp className="text-green-500" size={20} />
                  ) : subject.trend < 0 ? (
                    <TrendingDown className="text-red-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 bg-gray-300 rounded-full" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="font-medium">{subject.latest}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average</span>
                    <span className="font-medium">{subject.average}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Predicted</span>
                    <span className="font-medium text-blue-600">
                      {performanceAnalysis.predictions.find(p => p.subject === subject.subject)?.predicted}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
            <div className="space-y-3">
              {generateCommentary().map((comment, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData.exams.filter(e => e.percentage !== null)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  name="Performance %" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current vs Predicted Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceAnalysis.predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Legend />
                <Bar dataKey="latest" fill="#3B82F6" name="Current Performance" />
                <Bar dataKey="predicted" fill="#10B981" name="Predicted Performance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Exam Results</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Subject</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Exam Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Marks Obtained</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total Marks</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Percentage</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Grade</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.exams.map((exam, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-900">{exam.subject}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{exam.exam_type}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{exam.marks_obtained || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{exam.total_marks}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {exam.percentage !== null ? `${exam.percentage}%` : 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        {exam.grade ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            exam.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                            exam.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {exam.grade}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(exam.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {performanceData.exams.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No exam data available for this student
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h3>
            {performanceData.quizzes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.quizzes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="rubric" fill="#8B5CF6" name="Quiz Score (out of 10)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No quiz data available for this student
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'behavior' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Assessment</h3>
            {performanceAnalysis.behavioralScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="80%" 
                  data={[
                    { subject: 'Uniform', A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1].uniform_compliance },
                    { subject: 'Homework', A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1].homework_completion },
                    { subject: 'Discipline', A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1].class_discipline },
                    { subject: 'Punctuality', A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1].punctuality },
                    { subject: 'Behavior', A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1].behavior },
                  ]}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar
                    name="Latest Report"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No behavioral data available
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Quality Metrics</h3>
            {performanceData.rechecking.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performanceData.rechecking.map((check, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{check.subjects}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completeness</span>
                        <span className="text-sm font-medium">{check.completeness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accuracy</span>
                        <span className="text-sm font-medium">{check.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clarity</span>
                        <span className="text-sm font-medium">{check.clarity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Feedback</span>
                        <span className="text-sm font-medium">{check.feedback}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Presentation</span>
                        <span className="text-sm font-medium">{check.presentation}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No assessment quality data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPerformanceDashboard;