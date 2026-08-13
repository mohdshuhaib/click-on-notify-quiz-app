import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, XCircle, Search, Medal, ChevronLeft, ChevronRight } from "lucide-react";

export default function SubmissionsTable({ submissions, questions, quiz }: { submissions: any[], questions: any[], quiz: any }) {
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const paginatedSubmissions = submissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTime = (seconds: number) => {
    if (!seconds) return "--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (submissions.length === 0) {
    return <div className="text-center py-16 bg-neu-bg rounded-[32px] shadow-neu-flat"><p className="text-neu-text-light font-bold">No one has taken this quiz yet.</p></div>;
  }

  return (
    <>
      <div className="bg-neu-bg rounded-[32px] shadow-neu-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300/10 text-sm text-neu-text-light uppercase tracking-wider">
                <th className="p-6 font-black whitespace-nowrap">Rank</th>
                <th className="p-6 font-black whitespace-nowrap">Participant</th>
                <th className="p-6 font-black whitespace-nowrap">Score</th>
                <th className="p-6 font-black whitespace-nowrap">Time Taken</th>
                <th className="p-6 font-black whitespace-nowrap">Status</th>
                <th className="p-6 font-black whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/10">
              {paginatedSubmissions.map((sub) => {
                const percentage = Math.round((sub.score / sub.total_points) * 100);
                return (
                  <tr key={sub.id} className="hover:bg-slate-300/5 transition-colors">
                    <td className="p-6">
                      {sub.rank === 1 ? <Medal className="w-8 h-8 text-yellow-400" /> :
                       sub.rank === 2 ? <Medal className="w-8 h-8 text-slate-400" /> :
                       sub.rank === 3 ? <Medal className="w-8 h-8 text-amber-600" /> :
                       <span className="font-bold text-neu-text-light text-lg ml-2">#{sub.rank}</span>}
                    </td>
                    <td className="p-6">
                      <p className="font-black text-neu-text text-lg">{sub.respondent_name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sub.respondent_details && Object.entries(sub.respondent_details).map(([key, value], i) => {
                          if (key === 'default_name' || value === sub.respondent_name || !value) return null;
                          return (
                            <span key={i} className="inline-block text-xs font-bold text-neu-text-light bg-neu-bg shadow-neu-pressed-sm px-3 py-1 rounded-xl">
                              <span className="capitalize">{key}:</span> <span className="font-black text-neu-text">{String(value)}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-black text-neu-blue text-xl">{sub.score} <span className="text-sm text-neu-text-light">/ {sub.total_points}</span></span>
                        <span className="text-xs font-bold text-neu-text-light">{percentage}%</span>
                      </div>
                    </td>
                    <td className="p-6 font-mono font-bold text-neu-text">
                      {formatTime(sub.time_taken_seconds)}
                    </td>
                    <td className="p-6">
                      {sub.cheat_warnings > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neu-red bg-neu-bg shadow-neu-pressed-sm px-3 py-1.5 rounded-xl">
                          <AlertTriangle className="w-4 h-4" /> {sub.cheat_warnings} Warnings
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neu-green bg-neu-bg shadow-neu-pressed-sm px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" /> Clean
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => setSelectedSub(sub)} className="inline-flex items-center gap-2 text-sm font-bold text-neu-blue bg-neu-bg shadow-neu-flat hover:shadow-neu-pressed-sm active:shadow-neu-pressed px-4 py-2 rounded-xl transition-all">
                        <Search className="w-5 h-5" /> View Paper
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 flex items-center justify-between border-t border-slate-300/10">
            <span className="text-sm text-neu-text-light font-bold">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, submissions.length)} of {submissions.length} entries
            </span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-neu-bg shadow-neu-flat text-neu-text-light hover:text-neu-text active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-sm font-black text-neu-text px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-neu-bg shadow-neu-flat text-neu-text-light hover:text-neu-text active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- RESPONDENT PAPER MODAL --- */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center font-anek justify-center p-4 bg-neu-bg/80 backdrop-blur-sm">
          <div className="bg-neu-bg rounded-[32px] shadow-neu-flat w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-300/20">

            {/* Modal Header */}
            <div className="p-8 pb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-neu-text">{selectedSub.respondent_name}'s Paper</h3>
                <p className="text-sm font-bold text-neu-text-light mt-1">Score: <span className="text-neu-blue">{selectedSub.score}</span> | Time: <span className="text-neu-text">{formatTime(selectedSub.time_taken_seconds)}</span></p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-3 text-neu-text-light hover:text-neu-red bg-neu-bg rounded-xl shadow-neu-flat active:shadow-neu-pressed transition-all shrink-0">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body: The Questions */}
            <div className="p-8 pt-2 overflow-y-auto space-y-8 pb-12">
              {questions.map((q, i) => {
                const selectedOptionId = selectedSub.answers[q.id];
                const correctOption = q.options.find((o: any) => o.is_correct);
                const isCorrect = selectedOptionId === correctOption?.id;

                return (
                  <div key={q.id} className="p-6 rounded-2xl bg-neu-bg shadow-neu-pressed-sm border border-slate-300/10">
                    <div className="flex gap-4 mb-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-neu-flat ${isCorrect ? 'text-neu-green' : 'text-neu-red'}`}>
                         {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-neu-text text-lg leading-snug pt-1.5">{i + 1}. {q.question_text}</h4>
                        {q.statements && q.statements.length > 0 && (
                          <div className="mt-4 pl-4 border-l-4 border-neu-blue space-y-3">
                            {q.statements.map((stmt: string, sIndex: number) => (
                              <p key={sIndex} className="text-base font-bold text-neu-text-light">
                                <span className="text-neu-text opacity-50 mr-2">{String.fromCharCode(97 + sIndex)})</span>
                                {stmt}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pl-14">
                      {q.options.map((opt: any) => {
                        const isSelected = selectedOptionId === opt.id;
                        return (
                          <div key={opt.id} className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                            opt.is_correct ? 'bg-neu-bg shadow-neu-flat border border-neu-green/30 text-neu-green' :
                            isSelected && !isCorrect ? 'bg-neu-bg shadow-neu-flat border border-neu-red/30 text-neu-red' : 'bg-neu-bg shadow-neu-pressed-sm text-neu-text-light'
                          }`}>
                            <span className="font-bold">{opt.option_text}</span>
                            {opt.is_correct && <span className="text-[10px] uppercase font-black tracking-wider bg-neu-green/20 text-neu-green px-3 py-1 rounded-lg">Correct Answer</span>}
                            {isSelected && !opt.is_correct && <span className="text-[10px] uppercase font-black tracking-wider bg-neu-red/20 text-neu-red px-3 py-1 rounded-lg">They Picked</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}