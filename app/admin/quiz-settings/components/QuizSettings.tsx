import { Settings2, Trash2, UserPlus, CalendarDays, X } from "lucide-react";
import { QuizState, IntroField } from "../types";

interface Props {
  quiz: QuizState;
  onChange: (quiz: QuizState) => void;
}

export default function QuizSettings({ quiz, onChange }: Props) {
  const updateField = (field: keyof QuizState, value: any) => {
    onChange({ ...quiz, [field]: value });
  };

  // FIX: Safely translate the absolute ISO database string back into local browser time for the input
  const formatForInput = (isoString: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    // Shift the time by the user's local timezone offset so we get the exact local numbers
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16); // Outputs exact YYYY-MM-DDThh:mm
  };

  return (
    <div className="space-y-8 mb-12">
      {/* --- GENERAL SETTINGS CARD --- */}
      <div className="bg-neu-bg rounded-[32px] shadow-neu-flat p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-neu-bg rounded-xl shadow-neu-pressed-sm text-neu-blue">
            <Settings2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-neu-text">General Settings</h2>
        </div>

        <div className="space-y-6 font-anek">
          <div>
            <label className="block text-sm font-bold text-neu-text-light mb-2 ml-2">Quiz Title *</label>
            <input
              type="text"
              placeholder="e.g. Mega Quiz Competition"
              value={quiz.title || ""}
              onChange={e => updateField("title", e.target.value)}
              className="w-full rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-5 py-4 outline-none text-neu-text placeholder:text-neu-text-light/50 focus:ring-2 focus:ring-neu-blue/50 font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neu-text-light mb-2 ml-2">Description (Optional)</label>
            <textarea
              placeholder="Instructions or notes for the respondents..."
              value={quiz.description || ""}
              onChange={e => updateField("description", e.target.value)}
              rows={3}
              className="w-full rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-5 py-4 outline-none text-neu-text placeholder:text-neu-text-light/50 focus:ring-2 focus:ring-neu-blue/50 resize-none font-medium"
            />
          </div>

          {/* --- SCHEDULING SECTION WITH CLEAR BUTTONS --- */}
          <div className="grid sm:grid-cols-2 gap-6 pt-6 mt-2">
            <div>
              <label className="text-sm font-bold text-neu-text-light mb-2 ml-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neu-blue" /> Start Time (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  value={formatForInput(quiz.start_time)}
                  onChange={e => {
                    if (!e.target.value) {
                      updateField("start_time", null);
                    } else {
                      // Browser automatically parses this as Local Time
                      const localDate = new Date(e.target.value);
                      updateField("start_time", localDate.toISOString());
                    }
                  }}
                  className="flex-1 rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-4 py-3 outline-none text-neu-text focus:ring-2 focus:ring-neu-blue/50 font-medium"
                />
                {quiz.start_time && (
                  <button
                    type="button"
                    onClick={() => updateField("start_time", null)}
                    className="p-3 bg-neu-bg shadow-neu-flat rounded-xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all shrink-0"
                    title="Clear Start Time"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-neu-text-light mb-2 ml-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neu-blue" /> End Time (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  value={formatForInput(quiz.end_time)}
                  onChange={e => {
                    if (!e.target.value) {
                      updateField("end_time", null);
                    } else {
                      const localDate = new Date(e.target.value);
                      updateField("end_time", localDate.toISOString());
                    }
                  }}
                  className="flex-1 rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-4 py-3 outline-none text-neu-text focus:ring-2 focus:ring-neu-blue/50 font-medium"
                />
                {quiz.end_time && (
                  <button
                    type="button"
                    onClick={() => updateField("end_time", null)}
                    className="p-3 bg-neu-bg shadow-neu-flat rounded-xl text-neu-text-light hover:text-neu-red active:shadow-neu-pressed transition-all shrink-0"
                    title="Clear End Time"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-6">
            {/* Precise Timer Inputs */}
            <div>
              <label className="block text-sm font-bold text-neu-text-light mb-2 ml-2">Time Limit</label>
              <div className="flex items-center gap-3">

                {/* Minutes Input */}
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={typeof quiz.time_limit_seconds === 'number' ? Math.floor(quiz.time_limit_seconds / 60).toString() : ""}
                  onChange={e => {
                    if (e.target.value === "") {
                      const currentSecs = typeof quiz.time_limit_seconds === 'number' ? quiz.time_limit_seconds % 60 : 0;
                      updateField("time_limit_seconds", currentSecs === 0 ? null : currentSecs);
                      return;
                    }
                    const mins = parseInt(e.target.value) || 0;
                    const currentSecs = typeof quiz.time_limit_seconds === 'number' ? quiz.time_limit_seconds % 60 : 0;
                    updateField("time_limit_seconds", (mins * 60) + currentSecs);
                  }}
                  className="w-full rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-4 py-3 outline-none text-neu-text text-center focus:ring-2 focus:ring-neu-blue/50 font-bold text-lg"
                />
                <span className="text-neu-text-light font-bold">m</span>

                {/* Seconds Input */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Sec"
                  value={typeof quiz.time_limit_seconds === 'number' ? (quiz.time_limit_seconds % 60).toString() : ""}
                  onChange={e => {
                    if (e.target.value === "") {
                      const currentMins = typeof quiz.time_limit_seconds === 'number' ? Math.floor(quiz.time_limit_seconds / 60) : 0;
                      updateField("time_limit_seconds", currentMins === 0 ? null : currentMins * 60);
                      return;
                    }
                    const secs = parseInt(e.target.value) || 0;
                    const currentMins = typeof quiz.time_limit_seconds === 'number' ? Math.floor(quiz.time_limit_seconds / 60) : 0;
                    updateField("time_limit_seconds", (currentMins * 60) + secs);
                  }}
                  className="w-full rounded-2xl bg-neu-bg shadow-neu-pressed-sm px-4 py-3 outline-none text-neu-text text-center focus:ring-2 focus:ring-neu-blue/50 font-bold text-lg"
                />
                <span className="text-neu-text-light font-bold">s</span>

              </div>
            </div>

            <div className="flex flex-col justify-center gap-6 mt-4">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${quiz.shuffle_questions ? 'bg-neu-blue text-white shadow-neu-pressed-sm' : 'bg-neu-bg shadow-neu-pressed-sm text-transparent group-hover:shadow-neu-flat'}`}>
                   <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                </div>
                <input
                  type="checkbox"
                  checked={!!quiz.shuffle_questions}
                  onChange={e => updateField("shuffle_questions", e.target.checked)}
                  className="hidden"
                />
                <span className="text-base font-bold text-neu-text">Shuffle Questions</span>
              </label>


            </div>
          </div>


        </div>
      </div>


    </div>
  );
}
