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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center gap-4">
        <span className="font-bold text-slate-700">Question {index + 1}</span>

        <div className="flex items-center gap-3">
          {/* NEW: Custom Points Input */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-slate-100 px-3 py-1.5 border-r border-slate-200 flex items-center gap-1.5 text-slate-600">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Marks</span>
            </div>
            <input
              type="number"
              min="1"
              value={question.points || 1}
              onChange={(e) => updatePoints(parseInt(e.target.value) || 1)}
              className="w-16 px-3 py-1.5 text-sm font-bold text-slate-900 outline-none text-center focus:bg-blue-50 transition-colors"
            />
          </div>

          {canDelete && (
            <button
              onClick={onDelete}
              className="text-slate-400 hover:text-red-600 transition-colors p-1"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 font-anek">
        <input
          type="text"
          placeholder="Type your question here..."
          value={question.text}
          onChange={(e) => updateText(e.target.value)}
          className="w-full text-lg font-medium border-b-2 border-slate-200 px-0 py-2 focus:border-blue-600 focus:ring-0 outline-none placeholder:text-slate-300"
        />

        {question.statements !== undefined && question.statements.length > 0 && (
          <div className="space-y-3 pl-4 border-l-2 border-indigo-200 ml-2 mt-4">
            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Sub-Statements</h4>
            {question.statements.map((stmt, sIndex) => (
              <div key={sIndex} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 w-6 shrink-0">{String.fromCharCode(97 + sIndex)})</span>
                <input
                  type="text"
                  placeholder={`Statement ${sIndex + 1}`}
                  value={stmt}
                  onChange={(e) => updateStatementText(sIndex, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-600 transition-colors bg-white"
                />
                <button
                  onClick={() => removeStatement(sIndex)}
                  className="shrink-0 text-slate-300 hover:text-red-500 p-2"
                  title="Remove Statement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {question.options.map((opt, oIndex) => (
            <div key={opt.id} className="flex items-center gap-3">
              <button
                onClick={() => setCorrectOption(opt.id)}
                className={`shrink-0 ${opt.isCorrect ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
              >
                {opt.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </button>

              <input
                type="text"
                placeholder={`Option ${oIndex + 1}`}
                value={opt.text}
                onChange={(e) => updateOptionText(opt.id, e.target.value)}
                className={`flex-1 rounded-lg border px-4 py-2 outline-none transition-colors ${
                  opt.isCorrect ? 'border-green-300 bg-green-50/30 focus:border-green-500' : 'border-slate-200 focus:border-blue-600'
                }`}
              />

              <button
                onClick={() => removeOption(opt.id)}
                className="shrink-0 text-slate-300 hover:text-red-500 p-2 disabled:opacity-30 disabled:hover:text-slate-300"
                disabled={question.options.length <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={addOption}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Option
          </button>
          <button
            onClick={addStatement}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Statement
          </button>
        </div>
      </div>
    </div>
  );
}
