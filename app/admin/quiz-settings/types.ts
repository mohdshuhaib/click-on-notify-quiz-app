export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  points: number;
  options: Option[];
  statements?: string[];
}

export interface IntroField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select';
  options?: string[]; // Used only if type is 'select'
  required: boolean;
}

export interface QuizState {
  title: string;
  description: string;
  time_limit_seconds: number | null;
  shuffle_questions: boolean;
  is_published: boolean;
  start_time: string | null; // NEW: Schedule Start
  end_time: string | null;   // NEW: Schedule End
}
