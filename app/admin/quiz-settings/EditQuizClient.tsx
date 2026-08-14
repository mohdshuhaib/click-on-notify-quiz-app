"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { updateFullQuiz } from "./actions";
import { QuizState, Question } from "./types";

import QuizSettings from "./components/QuizSettings";
import QuestionCard from "./components/QuestionCard";
import StickySaveBar from "./components/StickySaveBar";

interface Props {
  quizId: string;
  initialQuizState: QuizState;
  initialQuestions: Question[];
  isMock?: boolean;
}

export default function EditQuizClient({ quizId, initialQuizState, initialQuestions, isMock = false }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [quiz, setQuiz] = useState<QuizState>(initialQuizState);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const addManualQuestion = () => {
    setQuestions([...questions, {
      id: crypto.randomUUID(),
      text: "",
      points: 1,
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: true },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
    }]);
  };

  const handleSave = async (isPublished: boolean) => {
    if (!quiz.title.trim()) {
      setErrorMsg("Quiz title is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIsSaving(true);
    setErrorMsg("");

    const result = await updateFullQuiz(quizId, { ...quiz, is_published: isPublished }, questions);

    if (result.error) {
      setErrorMsg(result.error);
      setIsSaving(false);
    } else {
      router.refresh();
      if (isPublished) {
         setErrorMsg("Quiz Published Successfully!");
      } else {
         setErrorMsg("Draft Saved Successfully!");
      }
      setTimeout(() => setErrorMsg(""), 3000);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-48 min-h-screen p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <Link href="/admin/dashboard" className="p-4 rounded-xl bg-neu-bg shadow-neu-flat text-neu-text-light hover:text-neu-blue active:shadow-neu-pressed transition-all">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-neu-text">{isMock ? "Mock Quiz Settings" : "Main Quiz Settings"}</h1>
          <p className="text-neu-text-light font-medium mt-1">
            {isMock ? "Setup practice test questions and rules." : "Update your main mega quiz configurations."}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className={`mb-8 p-6 rounded-2xl bg-neu-bg shadow-neu-pressed border-l-4 font-bold ${errorMsg.includes("Successfully") ? "border-neu-green text-neu-green" : "border-neu-red text-neu-red"}`}>
          {errorMsg}
        </div>
      )}

      {/* Modular Components - Loaded with existing data */}
      <QuizSettings quiz={quiz} onChange={setQuiz} />

      <div className="space-y-8 font-anek mt-12">
        <h2 className="text-2xl font-bold text-neu-text px-4">Questions</h2>
        {questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={index}
            canDelete={questions.length > 1}
            onChange={(updatedQ) => setQuestions(questions.map(old => old.id === q.id ? updatedQ : old))}
            onDelete={() => setQuestions(questions.filter(old => old.id !== q.id))}
          />
        ))}

        <button
          onClick={addManualQuestion}
          className="w-full py-6 mt-4 bg-neu-bg shadow-neu-flat rounded-[32px] text-neu-text font-bold hover:text-neu-blue hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6" /> Add Another Question
        </button>
      </div>

      {/* Spacer to ensure scrolling past the sticky bar on desktop */}
      <div className="h-40 md:h-64 w-full shrink-0"></div>

      <StickySaveBar
        questionCount={questions.length}
        isSaving={isSaving}
        onSave={handleSave}
      />

    </div>
  );
}
