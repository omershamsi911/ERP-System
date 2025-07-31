

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
  const [regressionMetrics, setRegressionMetrics] = useState<Record<string, RegressionMetrics>>({})

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

  const performanceAnalysis = useMemo(() => {
    const { exams, progressReports, quizzes, rechecking } = performanceData

    const sortedExams = [...exams].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const subjectPerformance: Record<string, Array<{ 
      type: string; 
      percentage: number; 
      date: string; 
      timeIndex: number 
    }>> = {}
    
    const metrics: Record<string, RegressionMetrics> = {}

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

    // Calculate regression metrics for each subject
    Object.keys(subjectPerformance).forEach(subject => {
      const scores = subjectPerformance[subject]
      if (scores.length > 1) {
        const x = scores.map(s => s.timeIndex)
        const y = scores.map(s => s.percentage)
        metrics[subject] = calculateLinearRegression(x, y)
      } else {
        // Not enough data for regression
        metrics[subject] = {
          slope: 0,
          intercept: scores.length ? scores[0].percentage : 0,
          r2: 0,
          mse: 0
        }
      }
    })
    
    setRegressionMetrics(metrics)

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

    const predictions = subjectAverages.map((subj) => {
      const subjectMetrics = metrics[subj.subject]
      let predicted = subj.latest
      
      if (subj.dataPoints > 1) {
        // Predict next value (current max index + 1)
        predicted = subjectMetrics.slope * subj.dataPoints + subjectMetrics.intercept
      }
      
      return {
        ...subj,
        predicted: Math.min(100, Math.max(0, Math.round(predicted * 100) / 100)),
        r2: metrics[subj.subject]?.r2 || 0,
        mse: metrics[subj.subject]?.mse || 0
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
      predictions,
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
    const { overallAverage, overallTrend, predictions } = performanceAnalysis

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

    const strongSubjects = predictions.filter((subj) => subj.average >= 85)
    const weakSubjects = predictions.filter((subj) => subj.average < 75)

    if (strongSubjects.length > 0) {
      commentary.push(`🌟 Strong performance in: ${strongSubjects.map((s) => s.subject).join(", ")}`)
    }

    if (weakSubjects.length > 0) {
      commentary.push(`📚 Areas needing attention: ${weakSubjects.map((s) => s.subject).join(", ")}`)
    }

    const improvingSubjects = predictions.filter((subj) => subj.predicted > subj.latest)
    if (improvingSubjects.length > 0) {
      commentary.push(`🔮 Predicted improvements in: ${improvingSubjects.map((s) => s.subject).join(", ")}`)
    }

    // Add regression quality metrics to commentary
    const highConfidenceSubjects = predictions.filter(subj => subj.r2 > 0.7)
    const lowConfidenceSubjects = predictions.filter(subj => subj.r2 > 0 && subj.r2 <= 0.4)
    
    if (highConfidenceSubjects.length > 0) {
      commentary.push(`✅ High-confidence predictions (R² > 0.7) for: ${highConfidenceSubjects.map(s => s.subject).join(", ")}`)
    }
    
    if (lowConfidenceSubjects.length > 0) {
      commentary.push(`⚠️ Low-confidence predictions (R² ≤ 0.4) for: ${lowConfidenceSubjects.map(s => s.subject).join(", ")}`)
    }

    return commentary.length > 0 ? commentary : ["No performance data available yet."]
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "from-emerald-500 to-green-600"
    if (percentage >= 80) return "from-blue-500 to-indigo-600"
    if (percentage >= 70) return "from-yellow-500 to-orange-600"
    return "from-red-500 to-pink-600"
  }

  const getConfidenceColor = (r2: number) => {
    if (r2 > 0.7) return "text-green-600"
    if (r2 > 0.4) return "text-yellow-600"
    return "text-red-600"
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
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Subject Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {performanceAnalysis.subjectAverages.map((subject, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{subject.subject}</h3>
                    <div
                      className={`p-2 rounded-xl ${subject.trend > 0 ? "bg-green-100" : subject.trend < 0 ? "bg-red-100" : "bg-gray-100"}`}
                    >
                      {subject.trend > 0 ? (
                        <TrendingUp className="text-green-600" size={20} />
                      ) : subject.trend < 0 ? (
                        <TrendingDown className="text-red-600" size={20} />
                      ) : (
                        <Target className="text-gray-600" size={20} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Current Score</span>
                      <span
                        className={`text-xl font-bold bg-gradient-to-r ${getGradeColor(subject.latest)} bg-clip-text text-transparent`}
                      >
                        {subject.latest}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getGradeColor(subject.latest)} transition-all duration-500`}
                        style={{ width: `${subject.latest}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Average: <span className="font-semibold">{subject.average}%</span>
                      </span>
                      <span className="text-gray-600">
                        Trend:{" "}
                        <span
                          className={`font-semibold ${subject.trend > 0 ? "text-green-600" : subject.trend < 0 ? "text-red-600" : "text-gray-600"}`}
                        >
                          {subject.trend > 0 ? "+" : ""}
                          {subject.trend.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analyze Future Performance Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Brain className="w-6 h-6" />
                <span>Analyze Future Performance</span>
                <div className={`transform transition-transform duration-300 ${showPredictions ? "rotate-180" : ""}`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Predictions Section */}
            {showPredictions && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 animate-in slide-in-from-top duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                    <Brain className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Future Performance Analysis</h3>
                </div>

                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-bold text-gray-800 mb-2">Regression Model Metrics</h4>
                  <p className="text-gray-700 text-sm">
                    Predictions use linear regression based on historical data. Metrics show model confidence:
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm text-gray-600">R² (Goodness of fit)</div>
                      <div className="text-lg font-bold">
                        {performanceAnalysis.predictions[0]?.r2 ? performanceAnalysis.predictions[0].r2.toFixed(2) : 'N/A'}
                      </div>
                      <div className="text-xs">
                        <span className={getConfidenceColor(performanceAnalysis.predictions[0]?.r2 || 0)}>
                          {performanceAnalysis.predictions[0]?.r2 > 0.7 
                            ? "High confidence" 
                            : performanceAnalysis.predictions[0]?.r2 > 0.4 
                              ? "Moderate confidence" 
                              : "Low confidence"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm text-gray-600">MSE (Error)</div>
                      <div className="text-lg font-bold">
                        {performanceAnalysis.predictions[0]?.mse ? performanceAnalysis.predictions[0].mse.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Lower is better</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm text-gray-600">Data Points</div>
                      <div className="text-lg font-bold">
                        {performanceAnalysis.predictions[0]?.dataPoints || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Used for training</div>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceAnalysis.predictions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
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
                      dataKey="latest"
                      fill="url(#currentGradient)"
                      name="Current Performance"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="predicted"
                      fill="url(#predictedGradient)"
                      name="Predicted Performance"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

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
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Detailed Exam Results</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 rounded-tl-xl">Subject</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Exam Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Marks Obtained</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total Marks</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Percentage</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Grade</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 rounded-tr-xl">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {performanceData.exams.map((exam, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{exam.subject}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{exam.exam_type}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{exam.marks_obtained || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{exam.total_marks}</td>
                        <td className="px-6 py-4 text-sm font-bold">
                          {exam.percentage !== null ? (
                            <span
                              className={`bg-gradient-to-r ${getGradeColor(exam.percentage)} bg-clip-text text-transparent`}
                            >
                              {exam.percentage}%
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {exam.grade ? (
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                exam.grade.startsWith("A")
                                  ? "bg-green-100 text-green-800"
                                  : exam.grade.startsWith("B")
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {exam.grade}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(exam.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {performanceData.exams.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-lg font-medium">No exam data available for this student</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Performance */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Quiz Performance</h3>
              </div>

              {performanceData.quizzes.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.quizzes}>
                    <defs>
                      <linearGradient id="quizGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="subject" tick={{ fill: "#6B7280" }} />
                    <YAxis domain={[0, 10]} tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="rubric"
                      fill="url(#quizGradient)"
                      name="Quiz Score (out of 10)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-lg font-medium">No quiz data available for this student</p>
                </div>
              )}
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