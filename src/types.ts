export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: Question[];
  isOpen: boolean;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentName: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  answers: number[]; // indices of selected options
  submittedAt: string;
}
