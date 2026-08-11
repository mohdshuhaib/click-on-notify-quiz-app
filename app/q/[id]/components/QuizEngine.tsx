"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock, AlertTriangle, CheckCircle2, ShieldAlert,
  XCircle, ArrowLeft, ArrowRight, LayoutGrid, Check, Sparkles, X, ChevronRight, Loader2, Award
} from "lucide-react";
import { submitQuizAndGrade } from "../actions";
import Link from "next/link";

interface Option { id: string; option_text: string; }
interface Question { id: string; question_text: string; points: number; options: Option[]; }

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit_seconds: number | null;
  show_results: boolean;
}

export default function QuizEngine({ quiz, questions, participant }: { quiz: Quiz, questions: Question[], participant: any }) {
  // Start directly at intro
  const [phase, setPhase] = useState<'intro' | 'active' | 'finished'>('intro');

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.time_limit_seconds || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [warnings, setWarnings] = useState(0);
  const [warningModal, setWarningModal] = useState<{ show: boolean, currentCount: number } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  const MAX_WARNINGS = 3;

  const handleComplete = useCallback(async (forced: boolean = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }

    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Pass participant details
    const res = await submitQuizAndGrade(quiz.id, participant.name, answers, warnings, participant.id, timeTakenSeconds);

    if (res.success) {
      setResult({ score: res.score!, total: res.totalPoints! });
      setPhase('finished');
      setWarningModal(null);
    } else {
      alert("Error submitting quiz. Please notify your instructor.");
    }
    setIsSubmitting(false);
  }, [answers, participant, isSubmitting, quiz.id, warnings, startTime]);

  useEffect(() => {
    if (phase !== 'active') return;

    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete(true);
    }

    return () => {
      clearInterval(timer);
    };
  }, [phase, timeLeft, handleComplete]);

  useEffect(() => {
    if (warnings >= MAX_WARNINGS && phase === 'active') {
      handleComplete(true);
    }
  }, [warnings, phase, handleComplete]);

  useEffect(() => {
    if (phase !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings(prev => {
          const newCount = prev + 1;
          if (newCount < MAX_WARNINGS) {
            setWarningModal({ show: true, currentCount: newCount });
          }
          return newCount;
        });
      }
    };

    const disableContext = (e: Event) => e.preventDefault();
    const blockShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.metaKey && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.ctrlKey && e.shiftKey && e.key === 's') ||
        (e.metaKey && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key))
      ) {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch (err) { }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", disableContext);
    document.addEventListener("copy", disableContext);
    document.addEventListener("cut", disableContext);
    document.addEventListener("paste", disableContext);
    document.addEventListener("keydown", blockShortcuts);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", disableContext);
      document.removeEventListener("copy", disableContext);
      document.removeEventListener("cut", disableContext);
      document.removeEventListener("paste", disableContext);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, [phase]);

  const startQuiz = async () => {
    try { await document.documentElement.requestFullscreen(); } catch (e) { }
    setStartTime(Date.now());
    setPhase('active');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  if (phase === 'intro') {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-neu-bg">
        <div className="max-w-xl w-full bg-neu-bg rounded-[32px] p-8 md:p-12 shadow-neu-flat">
          <div className="w-20 h-20 rounded-full bg-neu-bg shadow-neu-flat flex items-center justify-center mx-auto mb-6 text-neu-blue">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-neu-text text-center mb-8">Examination Rules</h2>
          
          <div className="space-y-6 mb-10">
            <div className="p-6 rounded-2xl bg-neu-bg shadow-neu-pressed-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-neu-text"><CheckCircle2 className="w-5 h-5 text-neu-green" /> Verified Identity</div>
              <p className="text-neu-text-light text-sm pl-7">You are eligible for this quiz as <strong>{participant.name}</strong> (Reg ID: {participant.reg_id}). Only one time you can participate.</p>
            </div>

            <div className="p-6 rounded-2xl bg-neu-bg shadow-neu-pressed-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-neu-text"><Clock className="w-5 h-5 text-neu-blue" /> Time Limit</div>
              <p className="text-neu-text-light text-sm pl-7">
                {quiz.time_limit_seconds ? `You have exactly ${Math.floor(quiz.time_limit_seconds / 60)} minutes.` : 'No time limit.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neu-bg shadow-neu-pressed-sm space-y-2 border border-neu-red/20">
              <div className="flex items-center gap-2 font-bold text-neu-red"><AlertTriangle className="w-5 h-5" /> Strict Warning</div>
              <p className="text-neu-text-light text-sm pl-7">Sit in a good network area. Do not use back button, switch tabs, or take screenshots. {MAX_WARNINGS} warnings will auto-submit.</p>
            </div>
          </div>

          <button 
            onClick={startQuiz}
            className="w-full py-5 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold text-xl active:shadow-neu-pressed transition-all flex items-center justify-center gap-2"
          >
            I Agree, Start Test
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-neu-bg">
        <div className="max-w-md w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat text-center">
          <div className="w-24 h-24 rounded-full bg-neu-bg shadow-neu-flat flex items-center justify-center mx-auto mb-6 text-neu-green">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-neu-text mb-4">Test Submitted!</h2>
          <p className="text-neu-text-light mb-8">Thank you, {participant.name}. Your responses have been recorded safely.</p>
          
          {quiz.show_results && result ? (
            <div className="mb-8 p-6 rounded-2xl bg-neu-bg shadow-neu-pressed-sm">
              <p className="text-sm font-bold text-neu-text-light uppercase tracking-wider mb-2">Final Score</p>
              <p className="text-5xl font-black text-neu-blue">
                {result.score} <span className="text-2xl text-neu-text-light">/ {result.total}</span>
              </p>
            </div>
          ) : (
            <div className="mb-8 p-4 rounded-xl bg-neu-bg shadow-neu-pressed-sm text-sm text-neu-text-light">
              Scores are currently hidden by the admin.
            </div>
          )}

          <Link href="/dashboard" className="w-full block py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold active:shadow-neu-pressed transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neu-bg flex flex-col font-anek">
      {/* Warning Modal */}
      {warningModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neu-bg/80 backdrop-blur-md">
          <div className="max-w-sm w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat text-center border border-neu-red/20">
            <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center mx-auto mb-4 text-neu-red">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neu-red mb-2">Proctoring Alert!</h3>
            <p className="text-neu-text-light mb-6">You navigated away from the quiz tab.</p>
            <div className="inline-block px-4 py-2 rounded-xl bg-neu-bg shadow-neu-pressed-sm text-neu-red font-bold mb-8">
              Warning {warningModal.currentCount} / {MAX_WARNINGS}
            </div>
            <button onClick={() => setWarningModal(null)} className="w-full py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold active:shadow-neu-pressed">
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neu-bg/80 backdrop-blur-md">
          <div className="max-w-sm w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat text-center">
            <h3 className="text-2xl font-bold text-neu-text mb-4">Submit Quiz?</h3>
            <p className="text-neu-text-light mb-8">
              {questions.length - answeredCount > 0 
                ? `You have ${questions.length - answeredCount} unattempted questions.` 
                : "You have answered all questions."}
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold active:shadow-neu-pressed">
                Cancel
              </button>
              <button onClick={() => handleComplete(false)} className="flex-1 py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold active:shadow-neu-pressed">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-neu-text text-lg">{quiz.title}</h1>
        <button onClick={() => setShowSubmitModal(true)} className="px-6 py-2 rounded-xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold active:shadow-neu-pressed text-sm">
          Submit
        </button>
      </header>

      <div className="px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-neu-text text-xl">Q. {currentQuestionIndex + 1}</div>
        <div className="flex-1 max-w-sm mx-auto flex flex-col items-center">
          {timeLeft !== null && (
            <div className={`font-bold text-2xl tracking-widest ${timeLeft < 60 ? "text-neu-red animate-pulse" : "text-neu-blue"}`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="font-bold text-neu-text-light text-sm">
          <span className="text-neu-text">{answeredCount}</span>/{questions.length}
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-24 overflow-y-auto w-full max-w-3xl mx-auto flex flex-col">
        <div className="bg-neu-bg rounded-[32px] p-6 sm:p-10 shadow-neu-flat flex-1 flex flex-col mt-4 border border-white/40">
          
          <div className="flex justify-between items-start mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neu-text leading-snug">
              {currentQ.question_text}
            </h2>
            <div className="px-3 py-1 rounded-lg bg-neu-bg shadow-neu-pressed-sm text-neu-text-light font-bold text-sm shrink-0 whitespace-nowrap">
              {currentQ.points} Pts
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAnswers({ ...answers, [currentQ.id]: opt.id })}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-200 flex justify-between items-center ${
                    isSelected 
                      ? "bg-neu-bg shadow-neu-pressed text-neu-blue" 
                      : "bg-neu-bg shadow-neu-flat text-neu-text hover:shadow-neu-pressed-sm"
                  }`}
                >
                  <span className={`font-semibold text-[15px] sm:text-base ${isSelected ? 'font-bold' : ''}`}>
                    {opt.option_text}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? "shadow-neu-flat text-neu-blue" : "shadow-neu-pressed-sm text-transparent"
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 px-2">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="w-14 h-14 rounded-full bg-neu-bg shadow-neu-flat flex items-center justify-center text-neu-text disabled:opacity-50 disabled:shadow-none active:shadow-neu-pressed transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === questions.length - 1}
            className="w-14 h-14 rounded-full bg-neu-bg shadow-neu-flat flex items-center justify-center text-neu-blue disabled:opacity-50 disabled:shadow-none active:shadow-neu-pressed transition-all"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
