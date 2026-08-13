"use client";

import { useState } from "react";
import { AlertTriangle, Database, Trash2, Users, RefreshCcw, X, AlertCircle } from "lucide-react";
import { resetQuizSettings, resetParticipantsData, factoryResetAll } from "../actions";
import { useRouter } from "next/navigation";

interface Stats {
  participants: number;
  submissions: number;
  questions: number;
  hasQuiz: boolean;
}

export default function SettingsClient({ quizId, stats }: { quizId: string | null, stats: Stats }) {
  const router = useRouter();
  
  const [modalOpen, setModalOpen] = useState<"quiz" | "participants" | "factory" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    setError(null);

    let res;
    if (modalOpen === "quiz") {
      res = await resetQuizSettings();
    } else if (modalOpen === "participants") {
      res = await resetParticipantsData();
    } else if (modalOpen === "factory") {
      res = await factoryResetAll();
    }

    setLoading(false);

    if (res?.success) {
      setModalOpen(null);
      router.refresh();
    } else {
      setError(res?.message || "An error occurred.");
    }
  };

  return (
    <div className="space-y-8 font-anek">
      {/* Quiz Reset Card */}
      <div className="bg-neu-bg p-8 rounded-[32px] shadow-neu-flat">
        <div className="flex items-start justify-between flex-col md:flex-row gap-6">
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-blue shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neu-text">Reset Quiz Configuration</h2>
              <p className="text-neu-text-light font-bold mt-1 max-w-lg">
                This will delete the current quiz, all of its questions, options, settings, and any submissions tied to it. Participants will not be deleted.
              </p>
              <div className="mt-4 flex gap-4">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-neu-bg shadow-neu-pressed-sm px-3 py-1.5 rounded-xl text-neu-text-light">
                  Status: {stats.hasQuiz ? <span className="text-neu-green">Active Quiz</span> : <span className="text-neu-red">No Quiz Found</span>}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-neu-bg shadow-neu-pressed-sm px-3 py-1.5 rounded-xl text-neu-text-light">
                  {stats.questions} Questions
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setModalOpen("quiz")}
            disabled={!stats.hasQuiz}
            className="flex items-center gap-2 px-6 py-4 bg-neu-bg text-neu-red font-black rounded-2xl shadow-neu-flat hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-none w-full md:w-auto justify-center"
          >
            <Trash2 className="w-5 h-5" /> Reset Quiz
          </button>
        </div>
      </div>

      {/* Participants Reset Card */}
      <div className="bg-neu-bg p-8 rounded-[32px] shadow-neu-flat">
        <div className="flex items-start justify-between flex-col md:flex-row gap-6">
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-blue shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neu-text">Clear Participants Database</h2>
              <p className="text-neu-text-light font-bold mt-1 max-w-lg">
                This will permanently delete all registered participants and their respective quiz submissions. The quiz settings and questions will remain intact.
              </p>
              <div className="mt-4 flex gap-4">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-neu-bg shadow-neu-pressed-sm px-3 py-1.5 rounded-xl text-neu-text-light">
                  {stats.participants} Participants
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-neu-bg shadow-neu-pressed-sm px-3 py-1.5 rounded-xl text-neu-text-light">
                  {stats.submissions} Submissions
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setModalOpen("participants")}
            disabled={stats.participants === 0}
            className="flex items-center gap-2 px-6 py-4 bg-neu-bg text-neu-red font-black rounded-2xl shadow-neu-flat hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-none w-full md:w-auto justify-center"
          >
            <Trash2 className="w-5 h-5" /> Clear Participants
          </button>
        </div>
      </div>

      {/* Factory Reset Card */}
      <div className="bg-neu-bg p-8 rounded-[32px] shadow-neu-flat border-2 border-red-500/10">
        <div className="flex items-start justify-between flex-col md:flex-row gap-6">
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-red shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neu-text">Factory Reset System</h2>
              <p className="text-neu-red font-bold mt-1 max-w-lg">
                DANGER: This action is irreversible. It will wipe the entire database clean, returning the app to its original brand new state.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen("factory")}
            className="flex items-center gap-2 px-6 py-4 bg-neu-bg text-neu-red font-black rounded-2xl shadow-neu-flat hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all w-full md:w-auto justify-center"
          >
            <RefreshCcw className="w-5 h-5" /> Factory Reset
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-bg/80 backdrop-blur-sm">
          <div className="bg-neu-bg rounded-[32px] shadow-neu-flat w-full max-w-md p-8 border border-slate-300/20 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 text-neu-red">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-2xl font-black text-neu-text">Are you absolutely sure?</h3>
              </div>
              <button 
                onClick={() => { setModalOpen(null); setError(null); }}
                className="w-10 h-10 rounded-xl bg-neu-bg shadow-neu-flat flex items-center justify-center text-neu-text-light hover:text-neu-red active:shadow-neu-pressed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-neu-text-light font-bold mb-6">
              {modalOpen === "quiz" && "You are about to delete the active quiz, all its questions, and all linked submissions. This action cannot be undone."}
              {modalOpen === "participants" && "You are about to permanently delete all registered participants and their test scores. This action cannot be undone."}
              {modalOpen === "factory" && "You are about to completely wipe the entire system database. All configurations, questions, participants, and results will be lost forever."}
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-neu-bg shadow-neu-pressed-sm text-neu-red text-sm font-bold border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => { setModalOpen(null); setError(null); }}
                className="flex-1 py-4 px-6 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text-light font-black hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                disabled={loading}
                className="flex-1 py-4 px-6 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-red font-black hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" /> Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
