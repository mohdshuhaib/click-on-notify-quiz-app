import { Trash2, CheckCircle2, Circle, Plus, Award } from "lucide-react";
import { Question } from "../types";

interface Props {
  question: Question;
  index: number;
  canDelete: boolean;
  onChange: (updatedQuestion: Question) => void;
  onDelete: () => void;
}

export default function QuestionCard({ question, index, canDelete, onChange, onDelete }: Props) {

  const updateText = (text: string) => onChange({ ...question, text });

  // NEW: Update points function
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
    <div className="bg-neu-bg rounded-[32px] shadow-neu-flat overflow-hidden mb-8">
      <div className="p-6 md:p-8 flex justify-between items-center gap-4">
        <span className="font-black text-neu-text text-2xl">Question {index + 1}</span>

        <div className="flex items-center gap-4">
          {/* Custom Points Input */}
          <div className="flex items-center bg-neu-bg shadow-neu-pressed-sm rounded-2xl overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 text-neu-text-light border-r border-slate-300/20">
              <Award className="w-5 h-5 text-neu-blue" />
              <span className="text-xs font-black uppercase tracking-wider">Marks</span>
            </div>
            <input
              type="number"
              min="1"
              value={question.points || 1}
              onChange={(e) => updatePoints(parseInt(e.target.value) || 1)}
              className="w-16 px-3 py-3 text-lg font-black text-neu-text bg-transparent outline-none text-center focus:bg-neu-bg/50 transition-colors"
            />
          </div>

          {canDelete && (
            <button
              onClick={onDelete}
              className="p-4 bg-neu-bg shadow-neu-flat rounded-2xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 font-anek pt-0">
        <textarea
          placeholder="Type your question here..."
          value={question.text}
          onChange={(e) => updateText(e.target.value)}
          rows={2}
          className="w-full text-xl md:text-2xl font-bold bg-neu-bg shadow-neu-pressed-sm rounded-2xl px-6 py-5 focus:ring-2 focus:ring-neu-blue/50 outline-none text-neu-text placeholder:text-neu-text-light/50 resize-none"
        />

        {question.statements !== undefined && question.statements.length > 0 && (
          <div className="space-y-4 pl-4 border-l-4 border-neu-blue ml-2">
            <h4 className="text-sm font-black text-neu-blue uppercase tracking-widest mb-4">Sub-Statements</h4>
            {question.statements.map((stmt, sIndex) => (
              <div key={sIndex} className="flex items-center gap-4">
                <span className="text-lg font-black text-neu-text-light w-8 shrink-0">{String.fromCharCode(97 + sIndex)})</span>
                <input
                  type="text"
                  placeholder={`Statement ${sIndex + 1}`}
                  value={stmt}
                  onChange={(e) => updateStatementText(sIndex, e.target.value)}
                  className="flex-1 rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-5 py-4 outline-none text-neu-text focus:ring-2 focus:ring-neu-blue/50 font-bold text-lg"
                />
                <button
                  onClick={() => removeStatement(sIndex)}
                  className="shrink-0 p-4 bg-neu-bg shadow-neu-flat rounded-xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all"
                  title="Remove Statement"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {question.options.map((opt, oIndex) => (
            <div key={opt.id} className="flex items-center gap-4">
              <button
                onClick={() => setCorrectOption(opt.id)}
                className={`shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl shadow-neu-flat active:shadow-neu-pressed transition-all ${opt.isCorrect ? 'text-neu-green shadow-neu-pressed-sm bg-neu-bg/50' : 'text-neu-text-light hover:text-neu-blue'}`}
              >
                {opt.isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
              </button>

              <input
                type="text"
                placeholder={`Option ${oIndex + 1}`}
                value={opt.text}
                onChange={(e) => updateOptionText(opt.id, e.target.value)}
                className={`flex-1 rounded-2xl px-5 py-4 outline-none font-bold text-lg transition-all ${
                  opt.isCorrect ? 'bg-neu-bg shadow-neu-pressed-sm text-neu-green ring-2 ring-neu-green/30' : 'bg-neu-bg shadow-neu-flat text-neu-text focus:shadow-neu-pressed-sm focus:ring-2 focus:ring-neu-blue/30'
                }`}
              />

              <button
                onClick={() => removeOption(opt.id)}
                className="shrink-0 p-4 bg-neu-bg shadow-neu-flat rounded-2xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all disabled:opacity-30 disabled:shadow-neu-flat"
                disabled={question.options.length <= 2}
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-8">
          <button
            onClick={addOption}
            className="flex-1 py-5 bg-neu-bg shadow-neu-flat rounded-2xl text-neu-blue font-bold hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Plus className="w-6 h-6" /> Add Option
          </button>
          <button
            onClick={addStatement}
            className="flex-1 py-5 bg-neu-bg shadow-neu-flat rounded-2xl text-neu-text font-bold hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Plus className="w-6 h-6" /> Add Statement
          </button>
        </div>
      </div>
    </div>
  );
}
