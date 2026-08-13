import { useState } from "react";
import { Trash2, CheckCircle2, Circle, Plus, Award, AlertTriangle } from "lucide-react";
import { Question } from "../types";

interface Props {
  question: Question;
  index: number;
  canDelete: boolean;
  onChange: (updatedQuestion: Question) => void;
  onDelete: () => void;
}

export default function QuestionCard({ question, index, canDelete, onChange, onDelete }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const updateText = (text: string) => onChange({ ...question, text });
  const updatePoints = (points: number) => onChange({ ...question, points });

  const addOption = () => {
    onChange({
      ...question,
      options: [...question.options, { id: crypto.randomUUID(), text: "", isCorrect: false }]
    });
  };

  const updateOptionText = (optId: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map(o => o.id === optId ? { ...o, text } : o)
    });
  };

  const removeOption = (optId: string) => {
    if (question.options.length <= 2) return;
    onChange({
      ...question,
      options: question.options.filter(o => o.id !== optId)
    });
  };

  const setCorrectOption = (optId: string) => {
    onChange({
      ...question,
      options: question.options.map(o => ({ ...o, isCorrect: o.id === optId }))
    });
  };

  const addStatement = () => {
    onChange({
      ...question,
      statements: [...(question.statements || []), ""]
    });
  };

  const updateStatementText = (index: number, text: string) => {
    const newStatements = [...(question.statements || [])];
    newStatements[index] = text;
    onChange({
      ...question,
      statements: newStatements
    });
  };

  const removeStatement = (index: number) => {
    const newStatements = [...(question.statements || [])];
    newStatements.splice(index, 1);
    onChange({
      ...question,
      statements: newStatements
    });
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neu-bg/80 backdrop-blur-sm">
          <div className="max-w-sm w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat text-center border border-neu-red/20">
            <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center mx-auto mb-4 text-neu-red">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neu-text mb-2">Delete Question?</h3>
            <p className="text-neu-text-light mb-8">Are you sure you want to delete Question {index + 1}? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold active:shadow-neu-pressed transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  onDelete();
                }}
                className="flex-1 py-4 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-red font-bold active:shadow-neu-pressed transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-neu-bg rounded-[32px] shadow-neu-flat overflow-hidden mb-8">
        <div className="p-4 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span className="font-black text-neu-text text-xl md:text-2xl">Question {index + 1}</span>

          <div className="flex items-center gap-2 md:gap-4 self-end sm:self-auto w-full sm:w-auto justify-end">
            {/* Custom Points Input */}
            <div className="flex items-center bg-neu-bg shadow-neu-pressed-sm rounded-xl md:rounded-2xl overflow-hidden shrink-0">
              <div className="px-3 md:px-4 py-2 md:py-3 flex items-center gap-1 md:gap-2 text-neu-text-light border-r border-slate-300/20">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-neu-blue" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Marks</span>
              </div>
              <input
                type="number"
                min="1"
                value={question.points || 1}
                onChange={(e) => updatePoints(parseInt(e.target.value) || 1)}
                className="w-12 md:w-16 px-2 md:px-3 py-2 md:py-3 text-base md:text-lg font-black text-neu-text bg-transparent outline-none text-center focus:bg-neu-bg/50 transition-colors"
              />
            </div>

            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-3 md:p-4 shrink-0 bg-neu-bg shadow-neu-flat rounded-xl md:rounded-2xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all"
              >
                <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8 font-anek pt-0">
          <textarea
            placeholder="Type your question here..."
            value={question.text}
            onChange={(e) => updateText(e.target.value)}
            rows={2}
            className="w-full text-lg md:text-2xl font-bold bg-neu-bg shadow-neu-pressed-sm rounded-xl md:rounded-2xl px-4 md:px-6 py-4 md:py-5 focus:ring-2 focus:ring-neu-blue/50 outline-none text-neu-text placeholder:text-neu-text-light/50 resize-none"
          />

          {question.statements !== undefined && question.statements.length > 0 && (
            <div className="space-y-3 md:space-y-4 pl-2 md:pl-4 border-l-[3px] md:border-l-4 border-neu-blue ml-1 md:ml-2">
              <h4 className="text-xs md:text-sm font-black text-neu-blue uppercase tracking-widest mb-2 md:mb-4">Sub-Statements</h4>
              {question.statements.map((stmt, sIndex) => (
                <div key={sIndex} className="flex items-center gap-2 md:gap-4">
                  <span className="text-base md:text-lg font-black text-neu-text-light w-5 md:w-8 shrink-0">{String.fromCharCode(97 + sIndex)})</span>
                  <input
                    type="text"
                    placeholder={`Statement ${sIndex + 1}`}
                    value={stmt}
                    onChange={(e) => updateStatementText(sIndex, e.target.value)}
                    className="flex-1 min-w-0 rounded-xl md:rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-3 md:px-5 py-3 md:py-4 outline-none text-neu-text focus:ring-2 focus:ring-neu-blue/50 font-bold text-base md:text-lg"
                  />
                  <button
                    onClick={() => removeStatement(sIndex)}
                    className="shrink-0 p-3 md:p-4 bg-neu-bg shadow-neu-flat rounded-xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all"
                    title="Remove Statement"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 md:space-y-4">
            {question.options.map((opt, oIndex) => (
              <div key={opt.id} className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => setCorrectOption(opt.id)}
                  className={`shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl shadow-neu-flat active:shadow-neu-pressed transition-all ${opt.isCorrect ? 'text-neu-green shadow-neu-pressed-sm bg-neu-bg/50' : 'text-neu-text-light hover:text-neu-blue'}`}
                >
                  {opt.isCorrect ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <Circle className="w-6 h-6 md:w-8 md:h-8" />}
                </button>

                <input
                  type="text"
                  placeholder={`Option ${oIndex + 1}`}
                  value={opt.text}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  className={`flex-1 min-w-0 rounded-xl md:rounded-2xl px-3 md:px-5 py-3 md:py-4 outline-none font-bold text-base md:text-lg transition-all ${
                    opt.isCorrect ? 'bg-neu-bg shadow-neu-pressed-sm text-neu-green ring-[1px] md:ring-2 ring-neu-green/30' : 'bg-neu-bg shadow-neu-flat text-neu-text focus:shadow-neu-pressed-sm focus:ring-2 focus:ring-neu-blue/30'
                  }`}
                />

                <button
                  onClick={() => removeOption(opt.id)}
                  className="shrink-0 p-3 md:p-4 bg-neu-bg shadow-neu-flat rounded-xl md:rounded-2xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all disabled:opacity-30 disabled:shadow-neu-flat"
                  disabled={question.options.length <= 2}
                >
                  <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 mt-6 md:mt-8">
            <button
              onClick={addOption}
              className="flex-1 py-4 md:py-5 bg-neu-bg shadow-neu-flat rounded-xl md:rounded-2xl text-neu-blue font-bold hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6" /> Add Option
            </button>
            <button
              onClick={addStatement}
              className="flex-1 py-4 md:py-5 bg-neu-bg shadow-neu-flat rounded-xl md:rounded-2xl text-neu-text font-bold hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6" /> Add Statement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
