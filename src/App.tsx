import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  User, 
  GraduationCap, 
  Plus, 
  Clock, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  QrCode,
  Download,
  Trash2,
  Play,
  Pause,
  Upload,
  BrainCircuit,
  Home
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import mammoth from "mammoth";
import confetti from "canvas-confetti";

import { cn, formatTime } from "@/src/lib/utils";
import { generateQuestions } from "@/src/lib/gemini";
import type { Quiz, Question, QuizResult } from "@/src/types";

// --- Components ---

const Footer = () => (
  <footer className="w-full py-6 mt-auto border-t border-gray-200 bg-white">
    <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
      <p>Thiết kế và xây dựng: <span className="font-semibold text-indigo-600">Trần Trung Hiếu</span></p>
    </div>
  </footer>
);

const Navbar = ({ role }: { role?: 'teacher' | 'student' }) => (
  <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
        <GraduationCap className="w-8 h-8" />
        <span className="hidden sm:inline">QuizAI System</span>
      </Link>
      <div className="flex items-center gap-4">
        {role === 'teacher' && (
          <Link to="/teacher" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
        )}
        <div className="h-8 w-px bg-gray-200 mx-2" />
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}</span>
        </div>
      </div>
    </div>
  </nav>
);

// --- Pages ---

const LandingPage = () => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Nền tảng Kiểm tra <span className="text-indigo-600">Thông minh</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          Hệ thống đánh giá trực tuyến hiện đại dành cho giáo dục đại học. 
          Tạo bài kiểm tra nhanh chóng với AI, quản lý kết quả chi tiết và bảo mật.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
          <Link 
            to="/teacher" 
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Dành cho Giảng viên</h2>
            <p className="text-sm text-slate-500">Tạo bài thi, quản lý câu hỏi và xem thống kê kết quả.</p>
          </Link>
          
          <Link 
            to="/student/join" 
            className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Dành cho Sinh viên</h2>
            <p className="text-sm text-slate-500">Tham gia làm bài kiểm tra bằng mã QR hoặc đường link.</p>
          </Link>
        </div>
      </motion.div>
    </main>
    <Footer />
  </div>
);

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: "", duration: 20, questionCount: 10, topic: "" });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAI = async () => {
    if (!newQuiz.title || !newQuiz.topic) return;
    setIsGenerating(true);
    try {
      const questions = await generateQuestions(newQuiz.topic, newQuiz.questionCount);
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newQuiz.title,
          duration: newQuiz.duration,
          questions: questions.map((q: any, i: number) => ({ ...q, id: i.toString() })),
          isOpen: true
        })
      });
      const data = await res.json();
      setQuizzes([data, ...quizzes]);
      setShowCreateModal(false);
    } catch (err) {
      alert("Lỗi khi tạo câu hỏi AI: " + err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        // Simple parser logic (expects: Question? A. B. C. D. Answer: A)
        // This is a placeholder for a more robust parser or AI-assisted parser
        alert("Đã đọc file Word. Hệ thống đang trích xuất câu hỏi...");
        
        // Mocking extraction for demo
        const mockQuestions: Question[] = [
          { id: "1", question: "Câu hỏi từ file Word 1?", options: ["A", "B", "C", "D"], correctAnswer: 0 },
          { id: "2", question: "Câu hỏi từ file Word 2?", options: ["A", "B", "C", "D"], correctAnswer: 1 },
        ];

        const res = await fetch("/api/quizzes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, ""),
            duration: 30,
            questions: mockQuestions,
            isOpen: true
          })
        });
        const data = await res.json();
        setQuizzes([data, ...quizzes]);
      } catch (err) {
        alert("Lỗi khi đọc file Word: " + err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const toggleQuizStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !currentStatus })
      });
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, isOpen: !currentStatus } : q));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar role="teacher" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Bài kiểm tra</h1>
            <p className="text-slate-500">Tạo mới và theo dõi các bài kiểm tra của bạn.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Tạo bài mới
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Chưa có bài kiểm tra nào</h3>
            <p className="text-slate-500 mb-6">Hãy bắt đầu bằng cách tạo một bài kiểm tra mới.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Tạo ngay &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <motion.div 
                layout
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    quiz.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {quiz.isOpen ? "Đang mở" : "Đã đóng"}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleQuizStatus(quiz.id, quiz.isOpen)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title={quiz.isOpen ? "Đóng bài thi" : "Mở bài thi"}
                    >
                      {quiz.isOpen ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <Link 
                      to={`/teacher/stats/${quiz.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Xem thống kê"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{quiz.title}</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.duration} phút</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    <span>{quiz.questions.length} câu hỏi</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/student/quiz/${quiz.id}`;
                        navigator.clipboard.writeText(url);
                        alert("Đã copy link bài thi!");
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Copy Link
                    </button>
                    <button 
                      onClick={() => {
                        // Show QR modal logic here
                        alert(`Mã bài thi: ${quiz.id}\nLink: ${window.location.origin}/student/quiz/${quiz.id}`);
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-700"
                    >
                      Mã QR
                    </button>
                  </div>
                  <Link 
                    to={`/student/quiz/${quiz.id}`}
                    target="_blank"
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Xem trước
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Tạo Bài kiểm tra mới</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tên bài kiểm tra</label>
                    <input 
                      type="text" 
                      value={newQuiz.title}
                      onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      placeholder="Ví dụ: Kiểm tra giữa kỳ AI"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Thời gian (phút)</label>
                      <input 
                        type="number" 
                        value={newQuiz.duration}
                        onChange={e => setNewQuiz({ ...newQuiz, duration: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Số câu hỏi</label>
                      <input 
                        type="number" 
                        value={newQuiz.questionCount}
                        onChange={e => setNewQuiz({ ...newQuiz, questionCount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-900 mb-3">Nguồn câu hỏi</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-500 uppercase">Cách 1: AI tự sinh</label>
                        <input 
                          type="text" 
                          placeholder="Chủ đề (VD: Machine Learning)"
                          value={newQuiz.topic}
                          onChange={e => setNewQuiz({ ...newQuiz, topic: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                          onClick={handleCreateAI}
                          disabled={isGenerating || !newQuiz.topic}
                          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                        >
                          {isGenerating ? "Đang tạo..." : <><BrainCircuit className="w-4 h-4" /> Sinh bằng AI</>}
                        </button>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-500 uppercase">Cách 2: Tải file Word</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept=".doc,.docx"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="w-full flex flex-col items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 px-4 py-4 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                            <Upload className="w-6 h-6" />
                            <span className="text-xs font-bold">Chọn file .docx</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  Hủy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

const TeacherStats = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, resultsRes] = await Promise.all([
          fetch(`/api/quizzes/${id}`),
          fetch(`/api/results/${id}`)
        ]);
        setQuiz(await quizRes.json());
        setResults(await resultsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!quiz) return <div>Không tìm thấy bài thi</div>;

  const avgScore = results.length > 0 ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1) : 0;
  const passCount = results.filter(r => (r.score / r.totalQuestions) >= 0.5).length;
  const failCount = results.length - passCount;

  const scoreDist = [
    { name: "0-2", count: results.filter(r => (r.score / r.totalQuestions) < 0.2).length },
    { name: "2-4", count: results.filter(r => (r.score / r.totalQuestions) >= 0.2 && (r.score / r.totalQuestions) < 0.4).length },
    { name: "4-6", count: results.filter(r => (r.score / r.totalQuestions) >= 0.4 && (r.score / r.totalQuestions) < 0.6).length },
    { name: "6-8", count: results.filter(r => (r.score / r.totalQuestions) >= 0.6 && (r.score / r.totalQuestions) < 0.8).length },
    { name: "8-10", count: results.filter(r => (r.score / r.totalQuestions) >= 0.8).length },
  ];

  const pieData = [
    { name: "Đạt", value: passCount },
    { name: "Chưa đạt", value: failCount },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar role="teacher" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/teacher" className="p-2 hover:bg-white rounded-lg transition-colors">
            <Home className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Thống kê: {quiz.title}</h1>
            <p className="text-slate-500">Tổng cộng {results.length} lượt làm bài.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase mb-1">Điểm trung bình</p>
            <p className="text-3xl font-bold text-indigo-600">{avgScore} / {quiz.questions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase mb-1">Tỷ lệ đạt</p>
            <p className="text-3xl font-bold text-emerald-600">{results.length > 0 ? ((passCount / results.length) * 100).toFixed(0) : 0}%</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 uppercase mb-1">Mã bài thi</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-mono font-bold text-slate-900">{quiz.id}</p>
              <QRCodeSVG value={`${window.location.origin}/student/quiz/${quiz.id}`} size={48} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Phân bố điểm số</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDist}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Tỷ lệ Đạt / Chưa đạt</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Danh sách kết quả</h3>
            <button 
              onClick={() => {
                const csv = [
                  ["STT", "Họ tên", "Mã SV", "Điểm", "Thời gian nộp"],
                  ...results.map((r, i) => [i + 1, r.studentName, r.studentId, r.score, new Date(r.submittedAt).toLocaleString()])
                ].map(e => e.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `ket_qua_${quiz.id}.csv`;
                link.click();
              }}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              <Download className="w-4 h-4" />
              Xuất CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">STT</th>
                  <th className="px-6 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Mã Sinh viên</th>
                  <th className="px-6 py-4">Điểm số</th>
                  <th className="px-6 py-4">Thời gian nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result, index) => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{result.studentName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{result.studentId}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-sm font-bold",
                        (result.score / result.totalQuestions) >= 0.5 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {result.score} / {result.totalQuestions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(result.submittedAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Chưa có sinh viên nào làm bài.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const StudentJoin = () => {
  const [quizId, setQuizId] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar role="student" />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Vào phòng thi</h1>
          <p className="text-center text-slate-500 mb-8">Nhập mã bài kiểm tra được giáo viên cung cấp.</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Mã bài thi (VD: a1b2c3d4)"
              value={quizId}
              onChange={e => setQuizId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono text-lg uppercase tracking-widest"
            />
            <button 
              onClick={() => navigate(`/student/quiz/${quizId}`)}
              disabled={!quizId}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
            >
              Tiếp tục
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const StudentQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'info' | 'quiz' | 'result'>('info');
  const [studentInfo, setStudentInfo] = useState({ name: "", id: "" });
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(-1));
      } catch (err) {
        alert("Không tìm thấy bài thi hoặc bài thi đã bị xóa.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (step === 'quiz' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const startQuiz = () => {
    if (!studentInfo.name || !studentInfo.id || !quiz) return;
    if (!quiz.isOpen) {
      alert("Bài thi này hiện đang đóng.");
      return;
    }
    setTimeLeft(quiz.duration * 60);
    setStep('quiz');
  };

  const handleSubmit = async (isAuto = false) => {
    if (!quiz || isSubmitting) return;
    
    if (!isAuto && answers.includes(-1)) {
      alert("Vui lòng hoàn thành tất cả câu hỏi trước khi nộp bài.");
      return;
    }

    setIsSubmitting(true);
    const score = answers.reduce((acc, ans, idx) => {
      return acc + (ans === quiz.questions[idx].correctAnswer ? 1 : 0);
    }, 0);

    const resultData = {
      quizId: quiz.id,
      studentName: studentInfo.name,
      studentId: studentInfo.id,
      score,
      totalQuestions: quiz.questions.length,
      answers
    };

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData)
      });
      const data = await res.json();
      setFinalResult(data);
      setStep('result');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert("Lỗi khi nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!quiz) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar role="student" />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200"
            >
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h1>
              <div className="flex gap-4 mb-8 text-sm text-slate-500">
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.duration} phút</div>
                <div className="flex items-center gap-1"><FileText className="w-4 h-4" /> {quiz.questions.length} câu hỏi</div>
              </div>
              
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và Tên</label>
                  <input 
                    type="text" 
                    value={studentInfo.name}
                    onChange={e => setStudentInfo({ ...studentInfo, name: e.target.value })}
                    placeholder="Nhập họ tên đầy đủ"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mã Sinh viên</label>
                  <input 
                    type="text" 
                    value={studentInfo.id}
                    onChange={e => setStudentInfo({ ...studentInfo, id: e.target.value })}
                    placeholder="Nhập mã số sinh viên"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button 
                  onClick={startQuiz}
                  disabled={!studentInfo.name || !studentInfo.id || !quiz.isOpen}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 mt-4"
                >
                  {quiz.isOpen ? "Bắt đầu làm bài" : "Bài thi đang đóng"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {answers.filter(a => a !== -1).length}/{quiz.questions.length}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến độ</p>
                    <div className="w-32 h-2 bg-slate-100 rounded-full mt-1">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all" 
                        style={{ width: `${(answers.filter(a => a !== -1).length / quiz.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg",
                  timeLeft < 60 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-900"
                )}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
                {!answers.includes(-1) && (
                  <button 
                    onClick={() => handleSubmit(false)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    Nộp bài sớm
                  </button>
                )}
              </div>

              <div className="space-y-8 pb-20">
                {quiz.questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex gap-4 mb-6">
                      <span className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-relaxed">{q.question}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 ml-0 sm:ml-12">
                      {q.options.map((opt, optIdx) => (
                        <button 
                          key={optIdx}
                          onClick={() => {
                            const newAnswers = [...answers];
                            newAnswers[idx] = optIdx;
                            setAnswers(newAnswers);
                          }}
                          className={cn(
                            "group flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                            answers[idx] === optIdx 
                              ? "border-indigo-600 bg-indigo-50 text-indigo-900" 
                              : "border-slate-100 hover:border-slate-200 text-slate-600"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                            answers[idx] === optIdx ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                          )}>
                            {answers[idx] === optIdx && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className="font-medium">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'result' && finalResult && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Hoàn thành!</h1>
              <p className="text-slate-500 mb-8">Chúc mừng bạn đã hoàn thành bài kiểm tra.</p>
              
              <div className="max-w-xs mx-auto bg-slate-50 p-6 rounded-2xl mb-8">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng điểm</p>
                <p className="text-5xl font-black text-indigo-600">{finalResult.score} / {finalResult.totalQuestions}</p>
              </div>

              <div className="text-left space-y-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                  Xem lại các câu sai
                </h3>
                <div className="space-y-4">
                  {quiz.questions.map((q, idx) => {
                    const isCorrect = answers[idx] === q.correctAnswer;
                    if (isCorrect) return null;
                    return (
                      <div key={q.id} className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                        <p className="text-sm font-bold text-slate-900 mb-2">{idx + 1}. {q.question}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-rose-600 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> 
                            Bạn chọn: {answers[idx] === -1 ? "(Bỏ trống)" : q.options[answers[idx]]}
                          </p>
                          <p className="text-emerald-600 flex items-center gap-2 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> 
                            Đáp án đúng: {q.options[q.correctAnswer]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {finalResult.score === finalResult.totalQuestions && (
                    <p className="text-center py-4 text-emerald-600 font-bold">Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi.</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => navigate("/")}
                className="mt-10 text-indigo-600 font-bold hover:underline"
              >
                Quay lại trang chủ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/stats/:id" element={<TeacherStats />} />
        <Route path="/student/join" element={<StudentJoin />} />
        <Route path="/student/quiz/:id" element={<StudentQuiz />} />
      </Routes>
    </Router>
  );
}
