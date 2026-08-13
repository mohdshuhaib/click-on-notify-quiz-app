import { Target, XCircle } from "lucide-react";

export default function QuestionAnalytics({ questions, submissions }: { questions: any[], submissions: any[] }) {
  if (submissions.length === 0) return null;

  // Calculate stats for each question
  const stats = questions.map(q => {
    let wrongCount = 0;
    let correctCount = 0;
    const correctOptionId = q.options.find((o: any) => o.is_correct)?.id;

    submissions.forEach(sub => {
      const selectedOptionId = sub.answers[q.id];
      if (selectedOptionId === correctOptionId) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    return {
      ...q,
      wrongCount,
      correctCount,
      errorRate: Math.round((wrongCount / submissions.length) * 100)
    };
  });

  // Filter for minimum 3 mistakes, sort by highest error rate, take top 3
  const mostMissed = [...stats]
    .filter(q => q.wrongCount >= 3)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 3);

  // If no questions meet the threshold, show a positive message
  if (mostMissed.length === 0) {
    return (
      <div className="bg-neu-bg rounded-[32px] shadow-neu-flat p-8 mb-8">
        <div className="flex items-center gap-4 mb-6 border-b border-slate-300/10 pb-6">
          <div className="w-12 h-12 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-blue">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-neu-text">Most Missed Questions</h2>
        </div>
        <p className="text-neu-text-light text-center font-bold py-8 bg-neu-bg shadow-neu-pressed-sm rounded-2xl">
          No questions have been missed by 3 or more people yet. Great job! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neu-bg font-anek rounded-[32px] shadow-neu-flat p-8 mb-8">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-300/10 pb-6">
        <div className="w-12 h-12 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-blue">
          <Target className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-neu-text">Most Missed Questions (Top 3)</h2>
      </div>

      <div className="space-y-6">
        {mostMissed.map((q, i) => (
          <div key={q.id} className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center p-6 bg-neu-bg shadow-neu-pressed-sm rounded-2xl">
            <div className="flex-1">
              <p className="text-lg font-black text-neu-text line-clamp-2">
                <span className="text-neu-text-light mr-2">#{i + 1}</span> {q.question_text}
              </p>
              <p className="text-sm font-bold text-neu-text-light mt-2">Missed by {q.wrongCount} people</p>
            </div>
            <div className="flex items-center gap-6 shrink-0 bg-neu-bg shadow-neu-flat p-4 rounded-2xl">
              <div className="text-right">
                <p className="text-2xl font-black text-neu-red">{q.errorRate}%</p>
                <p className="text-[10px] uppercase font-bold text-neu-text-light">Error Rate</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-red">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}