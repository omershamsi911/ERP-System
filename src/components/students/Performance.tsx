import React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  User,
  BookOpen,
  BarChart3,
  Brain,
  Star,
  Target,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react"
import { supabase } from "../../services/supabase"

interface Student {
  id: string
  fullname: string
  class: string
  section: string
}

interface Exam {
  id: string
  term_details_id: string
  student_id: string
  exam_type: string
  subject: string
  total_marks: number
  percentage: number | null
  grade: string | null
  marks_obtained: number | null
  created_at: string
}

interface Rechecking {
  id: string
  student_id: string
  subjects: string
  completeness: number
  accuracy: number
  clarity: number
  feedback: number
  presentation: number
}

interface ProgressReport {
  id: string
  date: string
  day: string | null
  student_id: string
  attendance_id: string | null
  uniform_compliance: string
  homework_completion: string
  class_discipline: string
  class_work: string | null
  punctuality: string
  class_participation: string | null
  behavior: string
}

interface Quiz {
  id: string
  student_id: string
  subject: string
  cp: string | null
  rubric: number
  date: string
}

interface PerformanceData {
  exams: Exam[]
  progressReports: ProgressReport[]
  quizzes: Quiz[]
  rechecking: Rechecking[]
  student: Student | null
}

interface RegressionMetrics {
  slope: number
  intercept: number
  r2: number
  mse: number
}

const StudentPerformanceDashboard = ({ studentId }: { studentId?: string }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    exams: [],
    progressReports: [],
    quizzes: [],
    rechecking: [],
    student: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showPredictions, setShowPredictions] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [subjectPerformanceData, setSubjectPerformanceData] = useState<any>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        if (!studentId || studentId === "undefined" || studentId === "null") {
          throw new Error("Student ID is required and must be valid")
        }

        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id, fullname, class, section")
          .eq("id", studentId)
          .single()

        if (studentError) throw studentError

        const [
          { data: examsData, error: examsError },
          { data: progressData, error: progressError },
          { data: quizzesData, error: quizzesError },
          { data: recheckingData, error: recheckingError },
        ] = await Promise.all([
          supabase.from("exams").select("*").eq("student_id", studentId),
          supabase.from("student_progress_report").select("*").eq("student_id", studentId),
          supabase.from("quiz").select("*").eq("student_id", studentId),
          supabase.from("rechecking_schedule").select("*").eq("student_id", studentId),
        ])

        if (examsError || progressError || quizzesError || recheckingError) {
          throw examsError || progressError || quizzesError || recheckingError
        }

        setPerformanceData({
          student: studentData,
          exams: examsData || [],
          progressReports: progressData || [],
          quizzes: quizzesData || [],
          rechecking: recheckingData || [],
        })
      } catch (err) {
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    if (studentId && studentId !== "undefined" && studentId !== "null") {
      fetchData()
    } else {
      setError("Invalid or missing student ID")
      setLoading(false)
    }
  }, [studentId])

  // Linear regression helper function
  const calculateLinearRegression = (x: number[], y: number[]) => {
    const n = x.length
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0

    for (let i = 0; i < n; i++) {
      sumX += x[i]
      sumY += y[i]
      sumXY += x[i] * y[i]
      sumXX += x[i] * x[i]
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R-squared and MSE
    let ssr = 0
    let sst = 0
    const meanY = sumY / n

    for (let i = 0; i < n; i++) {
      const yPred = slope * x[i] + intercept
      ssr += Math.pow(yPred - meanY, 2)
      sst += Math.pow(y[i] - meanY, 2)
    }

    const r2 = ssr / sst
    let mse = 0

    for (let i = 0; i < n; i++) {
      const yPred = slope * x[i] + intercept
      mse += Math.pow(y[i] - yPred, 2)
    }
    mse /= n

    return { slope, intercept, r2, mse }
  }

  // Calculate subject-wise performance data
  useEffect(() => {
    if (performanceData.exams.length > 0 || performanceData.quizzes.length > 0) {
      const subjectData: Record<string, any> = {}
      
      // Process exam data
      performanceData.exams.forEach(exam => {
        if (!subjectData[exam.subject]) {
          subjectData[exam.subject] = {
            exams: [],
            quizzes: [],
            rechecking: [],
            midterm: null,
            final: null,
            quizAverage: 0,
            recheckingAverage: 0,
            prediction: 0
          }
        }
        
        if (exam.percentage !== null) {
          subjectData[exam.subject].exams.push({
            type: exam.exam_type,
            percentage: exam.percentage,
            date: exam.created_at
          })
          
          if (exam.exam_type === 'Midterm') {
            subjectData[exam.subject].midterm = exam.percentage
          } else if (exam.exam_type === 'Final') {
            subjectData[exam.subject].final = exam.percentage
          }
        }
      })
      
      // Process quiz data
      performanceData.quizzes.forEach(quiz => {
        if (subjectData[quiz.subject]) {
          subjectData[quiz.subject].quizzes.push({
            score: quiz.rubric,
            date: quiz.date
          })
        }
      })
      
      // Process rechecking data
      performanceData.rechecking.forEach(recheck => {
        if (subjectData[recheck.subjects]) {
          const avg = (recheck.completeness + recheck.accuracy + recheck.clarity + recheck.feedback + recheck.presentation) / 5
          subjectData[recheck.subjects].rechecking.push({
            score: avg,
            date: new Date().toISOString() // Use current date as placeholder
          })
          subjectData[recheck.subjects].recheckingAverage = avg
        }
      })
      
      // Calculate quiz averages
      Object.keys(subjectData).forEach(subject => {
        if (subjectData[subject].quizzes.length > 0) {
          const total = subjectData[subject].quizzes.reduce((sum: number, quiz: any) => sum + quiz.score, 0)
          subjectData[subject].quizAverage = total / subjectData[subject].quizzes.length
        }
      })
      
      // Calculate predictions
      Object.keys(subjectData).forEach(subject => {
        const data = subjectData[subject]
        const factors = [
          data.midterm || 0,
          data.final || 0,
          data.quizAverage * 10, // Convert 0-10 scale to 0-100
          data.recheckingAverage * 10 // Convert 0-10 scale to 0-100
        ].filter(val => val > 0)
        
        if (factors.length > 0) {
          // Weighted average: midterm 30%, final 40%, quiz 20%, rechecking 10%
          const weights = [0.3, 0.4, 0.2, 0.1]
          let weightedSum = 0
          let totalWeight = 0
          
          factors.forEach((val, index) => {
            weightedSum += val * weights[index]
            totalWeight += weights[index]
          })
          
          data.prediction = Math.min(100, Math.max(0, Math.round((weightedSum / totalWeight) * 10) / 10))
        } else {
          data.prediction = 0
        }
      })
      
      setSubjectPerformanceData(subjectData)
    }
  }, [performanceData])

  const performanceAnalysis = useMemo(() => {
    const { exams, progressReports, quizzes, rechecking } = performanceData

    const sortedExams = [...exams].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const subjectPerformance: Record<string, Array<{ 
      type: string; 
      percentage: number; 
      date: string; 
      timeIndex: number 
    }>> = {}
    
    sortedExams.forEach((exam, index) => {
      if (!subjectPerformance[exam.subject]) {
        subjectPerformance[exam.subject] = []
      }
      if (exam.percentage !== null) {
        subjectPerformance[exam.subject].push({
          type: exam.exam_type,
          percentage: exam.percentage,
          date: exam.created_at,
          timeIndex: index
        })
      }
    })

    const overallTrend =
      sortedExams.length > 1
        ? sortedExams.reduce((acc, exam, index, arr) => {
            if (index === 0 || exam.percentage === null) return acc
            const prev = arr[index - 1]
            if (prev.percentage === null) return acc
            return acc + (exam.percentage - prev.percentage)
          }, 0) /
          (sortedExams.length - 1)
        : 0

    const subjectAverages = Object.keys(subjectPerformance).map((subject) => {
      const scores = subjectPerformance[subject]
      const average = scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length
      const trend = scores.length > 1 ? scores[scores.length - 1].percentage - scores[0].percentage : 0

      return {
        subject,
        average: Math.round(average * 100) / 100,
        trend,
        latest: scores[scores.length - 1]?.percentage || 0,
        dataPoints: scores.length
      }
    })

    const behavioralScores = progressReports.map((report) => {
      const mapScore = (value: string) => {
        if (!value) return 6
        const lowerValue = value.toLowerCase()
        if (lowerValue.includes("excellent")) return 10
        if (lowerValue.includes("good")) return 8
        if (lowerValue.includes("satisfactory")) return 6
        if (lowerValue.includes("needs improvement")) return 4
        return 6
      }

      const scores = {
        uniform_compliance: mapScore(report.uniform_compliance),
        homework_completion: mapScore(report.homework_completion),
        class_discipline: mapScore(report.class_discipline),
        punctuality: mapScore(report.punctuality),
        behavior: mapScore(report.behavior),
      }

      return {
        date: report.date,
        ...scores,
        overall: Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / 5) * 10) / 10,
      }
    })

    
    
    return {
      subjectAverages,
      overallTrend: isNaN(overallTrend) ? 0 : overallTrend,
      behavioralScores,
      overallAverage:
        subjectAverages.length > 0
          ? Math.round((subjectAverages.reduce((sum, subj) => sum + subj.average, 0) / subjectAverages.length) * 100) /
            100
          : 0,
    }
  }, [performanceData])

  const generateCommentary = () => {
    const { overallAverage, overallTrend } = performanceAnalysis

    const commentary: string[] = []

    if (overallAverage >= 90) {
      commentary.push(
        "🎉 Outstanding academic performance! The student consistently demonstrates excellence across subjects.",
      )
    } else if (overallAverage >= 80) {
      commentary.push("👍 Strong academic performance with room for further improvement in specific areas.")
    } else if (overallAverage >= 70) {
      commentary.push("📈 Satisfactory performance with significant potential for improvement.")
    } else if (overallAverage > 0) {
      commentary.push("⚠️ Academic performance needs attention and focused intervention.")
    }

    if (overallTrend > 2) {
      commentary.push("📈 Excellent upward trend - the student is showing consistent improvement over time.")
    } else if (overallTrend > 0) {
      commentary.push("↗️ Positive trend - gradual improvement observed in recent assessments.")
    } else if (overallTrend < -2) {
      commentary.push("📉 Concerning downward trend - immediate attention and support recommended.")
    } else if (overallAverage > 0) {
      commentary.push("➡️ Stable performance - maintaining consistent academic standards.")
    }

    const strongSubjects = Object.keys(subjectPerformanceData).filter(
      subject => subjectPerformanceData[subject].prediction >= 85
    )
    const weakSubjects = Object.keys(subjectPerformanceData).filter(
      subject => subjectPerformanceData[subject].prediction < 75
    )

    if (strongSubjects.length > 0) {
      commentary.push(`🌟 Strong performance predicted in: ${strongSubjects.join(", ")}`)
    }

    if (weakSubjects.length > 0) {
      commentary.push(`📚 Areas needing attention: ${weakSubjects.join(", ")}`)
    }

    return commentary.length > 0 ? commentary : ["No performance data available yet."]
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "from-emerald-500 to-green-600"
    if (percentage >= 80) return "from-blue-500 to-indigo-600"
    if (percentage >= 70) return "from-yellow-500 to-orange-600"
    return "from-red-500 to-pink-600"
  }

  const TabButton = ({ tabKey, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`group flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
        activeTab === tabKey
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
          : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
      }`}
    >
      <Icon
        size={20}
        className={`transition-colors ${activeTab === tabKey ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
      />
      <span>{label}</span>
    </button>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading student performance data...</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Data Loading Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {(!studentId || studentId === "undefined" || studentId === "null") && (
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>Student ID received: {JSON.stringify(studentId)}</p>
              <p>Please ensure a valid student ID is passed to this component.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!performanceData.student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Student not found</h3>
          <p className="text-gray-600">The requested student data could not be loaded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="text-white" size={32} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={16} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {performanceData.student.fullname}
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Class {performanceData.student.class} {performanceData.student.section} • Performance Dashboard
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Activity className="w-4 h-4 mr-1" />
                    Active Student
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Clock className="w-4 h-4 mr-1" />
                    Updated Today
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-5xl font-bold bg-gradient-to-r ${getGradeColor(performanceAnalysis.overallAverage)} bg-clip-text text-transparent`}
              >
                {performanceAnalysis.overallAverage}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Overall Average</div>
              <div className="flex items-center justify-end mt-2">
                {performanceAnalysis.overallTrend > 0 ? (
                  <div className="flex items-center text-green-600">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="text-sm font-medium">Improving</span>
                  </div>
                ) : performanceAnalysis.overallTrend < 0 ? (
                  <div className="flex items-center text-red-600">
                    <TrendingDown size={16} className="mr-1" />
                    <span className="text-sm font-medium">Declining</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-600">
                    <Target size={16} className="mr-1" />
                    <span className="text-sm font-medium">Stable</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton tabKey="overview" label="Overview" icon={Award} />
          <TabButton tabKey="trends" label="Trends" icon={TrendingUp} />
          <TabButton tabKey="subjects" label="Subjects" icon={BookOpen} />
          <TabButton tabKey="behavior" label="Behavior" icon={User} />
          <TabButton tabKey="predictions" label="Predictions" icon={Brain} />
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Subject Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(subjectPerformanceData).map((subject, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{subject}</h3>
                    <div
                      className={`p-2 rounded-xl ${
                        subjectPerformanceData[subject].prediction > 75
                          ? "bg-green-100"
                          : subjectPerformanceData[subject].prediction > 60
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      {subjectPerformanceData[subject].prediction > 75 ? (
                        <TrendingUp className="text-green-600" size={20} />
                      ) : subjectPerformanceData[subject].prediction > 60 ? (
                        <Target className="text-yellow-600" size={20} />
                      ) : (
                        <TrendingDown className="text-red-600" size={20} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Predicted Score</span>
                      <span
                        className={`text-xl font-bold bg-gradient-to-r ${getGradeColor(
                          subjectPerformanceData[subject].prediction
                        )} bg-clip-text text-transparent`}
                      >
                        {subjectPerformanceData[subject].prediction}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getGradeColor(
                          subjectPerformanceData[subject].prediction
                        )} transition-all duration-500`}
                        style={{ width: `${subjectPerformanceData[subject].prediction}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-600">Midterm</span>
                        <span className="font-semibold">
                          {subjectPerformanceData[subject].midterm
                            ? `${subjectPerformanceData[subject].midterm}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-600">Final</span>
                        <span className="font-semibold">
                          {subjectPerformanceData[subject].final
                            ? `${subjectPerformanceData[subject].final}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-600">Quiz Avg</span>
                        <span className="font-semibold">
                          {subjectPerformanceData[subject].quizAverage
                            ? `${Math.round(subjectPerformanceData[subject].quizAverage * 10)}/100`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-600">Rechecking</span>
                        <span className="font-semibold">
                          {subjectPerformanceData[subject].recheckingAverage
                            ? `${Math.round(subjectPerformanceData[subject].recheckingAverage * 10)}/100`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Analysis Commentary */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                  <Star className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Performance Insights</h3>
              </div>

              <div className="grid gap-4">
                {generateCommentary().map((comment, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <p className="text-gray-700 font-medium leading-relaxed">{comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Academic Performance Trends</h3>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData.exams.filter((e) => e.percentage !== null)}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="subject" tick={{ fill: "#6B7280" }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${value}%`, "Performance"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#lineGradient)"
                    name="Performance %"
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#3B82F6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <div className="space-y-8">
            {selectedSubject ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span className="mr-2">&larr;</span> Back to Subjects
                </button>
                
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedSubject} Performance</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Performance Metrics</h4>
                    <div className="space-y-4">
                      {[
                        { label: "Midterm", value: subjectPerformanceData[selectedSubject]?.midterm || "N/A" },
                        { label: "Final", value: subjectPerformanceData[selectedSubject]?.final || "N/A" },
                        { 
                          label: "Quiz Average", 
                          value: subjectPerformanceData[selectedSubject]?.quizAverage 
                            ? `${Math.round(subjectPerformanceData[selectedSubject].quizAverage * 10)}/100` 
                            : "N/A" 
                        },
                        { 
                          label: "Rechecking Quality", 
                          value: subjectPerformanceData[selectedSubject]?.recheckingAverage 
                            ? `${Math.round(subjectPerformanceData[selectedSubject].recheckingAverage * 10)}/100` 
                            : "N/A" 
                        },
                        { 
                          label: "Predicted Score", 
                          value: subjectPerformanceData[selectedSubject]?.prediction 
                            ? `${subjectPerformanceData[selectedSubject].prediction}%` 
                            : "N/A" 
                        },
                      ].map((metric, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                          <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Assessment History</h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {subjectPerformanceData[selectedSubject]?.exams.map((exam: any, idx: number) => (
                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <span className="font-medium">{exam.type}</span>
                            <span className={`font-bold ${getGradeColor(exam.percentage).replace('bg-gradient-to-r', 'text')}`}>
                              {exam.percentage}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(exam.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      
                      {subjectPerformanceData[selectedSubject]?.quizzes.map((quiz: any, idx: number) => (
                        <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <span className="font-medium">Quiz</span>
                            <span className="font-bold text-indigo-600">
                              {quiz.score}/10
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(quiz.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Performance Trend</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Midterm', value: subjectPerformanceData[selectedSubject]?.midterm || 0 },
                        { name: 'Final', value: subjectPerformanceData[selectedSubject]?.final || 0 },
                        { name: 'Quiz Avg', value: subjectPerformanceData[selectedSubject]?.quizAverage * 10 || 0 },
                        { name: 'Rechecking', value: subjectPerformanceData[selectedSubject]?.recheckingAverage * 10 || 0 },
                        { name: 'Predicted', value: subjectPerformanceData[selectedSubject]?.prediction || 0 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, "Score"]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#4F46E5" 
                        name="Score"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Subject Performance</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(subjectPerformanceData).map((subject, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedSubject(subject)}
                      className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{subject}</h3>
                        <div
                          className={`p-2 rounded-xl ${
                            subjectPerformanceData[subject].prediction > 75
                              ? "bg-green-100"
                              : subjectPerformanceData[subject].prediction > 60
                                ? "bg-yellow-100"
                                : "bg-red-100"
                          }`}
                        >
                          {subjectPerformanceData[subject].prediction > 75 ? (
                            <TrendingUp className="text-green-600" size={20} />
                          ) : subjectPerformanceData[subject].prediction > 60 ? (
                            <Target className="text-yellow-600" size={20} />
                          ) : (
                            <TrendingDown className="text-red-600" size={20} />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Predicted Score</span>
                          <span
                            className={`text-xl font-bold bg-gradient-to-r ${getGradeColor(
                              subjectPerformanceData[subject].prediction
                            )} bg-clip-text text-transparent`}
                          >
                            {subjectPerformanceData[subject].prediction}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${getGradeColor(
                              subjectPerformanceData[subject].prediction
                            )} transition-all duration-500`}
                            style={{ width: `${subjectPerformanceData[subject].prediction}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-600">Midterm</span>
                            <span className="font-semibold">
                              {subjectPerformanceData[subject].midterm
                                ? `${subjectPerformanceData[subject].midterm}%`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-600">Final</span>
                            <span className="font-semibold">
                              {subjectPerformanceData[subject].final
                                ? `${subjectPerformanceData[subject].final}%`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-600">Quiz Avg</span>
                            <span className="font-semibold">
                              {subjectPerformanceData[subject].quizAverage
                                ? `${Math.round(subjectPerformanceData[subject].quizAverage * 10)}/100`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-600">Rechecking</span>
                            <span className="font-semibold">
                              {subjectPerformanceData[subject].recheckingAverage
                                ? `${Math.round(subjectPerformanceData[subject].recheckingAverage * 10)}/100`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === "predictions" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                  <Brain className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Performance Predictions</h3>
              </div>

              <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-bold text-gray-800 mb-2">Prediction Methodology</h4>
                <p className="text-gray-700 text-sm">
                  Predictions are calculated using a weighted model that incorporates:
                </p>
                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-sm text-gray-600">Midterm</div>
                    <div className="text-lg font-bold">30%</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-sm text-gray-600">Final</div>
                    <div className="text-lg font-bold">40%</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-sm text-gray-600">Quiz Avg</div>
                    <div className="text-lg font-bold">20%</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-sm text-gray-600">Rechecking</div>
                    <div className="text-lg font-bold">10%</div>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={Object.keys(subjectPerformanceData).map(subject => ({
                    subject,
                    prediction: subjectPerformanceData[subject].prediction,
                    midterm: subjectPerformanceData[subject].midterm || 0,
                    final: subjectPerformanceData[subject].final || 0,
                    quiz: subjectPerformanceData[subject].quizAverage * 10 || 0,
                    rechecking: subjectPerformanceData[subject].recheckingAverage * 10 || 0
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="midtermGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="finalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="quizGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="recheckingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="subject" tick={{ fill: "#6B7280" }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#6B7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${value}%`, "Score"]}
                    labelFormatter={(value) => `${value} Performance`}
                  />
                  <Legend />
                  <Bar
                    dataKey="midterm"
                    fill="url(#midtermGradient)"
                    name="Midterm"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="final"
                    fill="url(#finalGradient)"
                    name="Final"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="quiz"
                    fill="url(#quizGradient)"
                    name="Quiz Avg"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="rechecking"
                    fill="url(#recheckingGradient)"
                    name="Rechecking"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="prediction"
                    fill="url(#predictionGradient)"
                    name="Prediction"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Behavior Tab */}
        {activeTab === "behavior" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <User className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Behavioral Assessment</h3>
              </div>

              {performanceAnalysis.behavioralScores.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={[
                      {
                        subject: "Uniform",
                        A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1]
                          .uniform_compliance,
                      },
                      {
                        subject: "Homework",
                        A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1]
                          .homework_completion,
                      },
                      {
                        subject: "Discipline",
                        A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1]
                          .class_discipline,
                      },
                      {
                        subject: "Punctuality",
                        A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1]
                          .punctuality,
                      },
                      {
                        subject: "Behavior",
                        A: performanceAnalysis.behavioralScores[performanceAnalysis.behavioralScores.length - 1]
                          .behavior,
                      },
                    ]}
                  >
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B7280", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#6B7280", fontSize: 10 }} />
                    <Radar
                      name="Latest Report"
                      dataKey="A"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <User className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-lg font-medium">No behavioral data available</p>
                </div>
              )}
            </div>

            {/* Assessment Quality Metrics */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Assessment Quality Metrics</h3>
              </div>

              {performanceData.rechecking.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {performanceData.rechecking.map((check, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">{check.subjects}</h4>
                      <div className="space-y-3">
                        {[
                          { label: "Completeness", value: check.completeness },
                          { label: "Accuracy", value: check.accuracy },
                          { label: "Clarity", value: check.clarity },
                          { label: "Feedback", value: check.feedback },
                          { label: "Presentation", value: check.presentation },
                        ].map((metric, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-gradient-to-r ${getGradeColor(metric.value)} transition-all duration-500`}
                                  style={{ width: `${metric.value}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-gray-900 w-10">{metric.value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-lg font-medium">No assessment quality data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentPerformanceDashboard