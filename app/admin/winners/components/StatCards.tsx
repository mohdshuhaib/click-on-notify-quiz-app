import { Users, Target, Trophy, Clock } from "lucide-react";

export default function StatCards({ submissions }: { submissions: any[] }) {
  const totalSubmissions = submissions.length;
  const validScores = submissions.filter(s => s.total_points > 0);

  const averagePercentage = validScores.length > 0
    ? Math.round(validScores.reduce((acc, curr) => acc + (curr.score / curr.total_points), 0) / validScores.length * 100)
    : 0;

  const highestScore = validScores.length > 0
    ? Math.round(Math.max(...validScores.map(s => (s.score / s.total_points) * 100)))
    : 0;

  const validTimes = submissions.filter(s => s.time_taken_seconds > 0);
  const avgTimeSeconds = validTimes.length > 0
    ? Math.round(validTimes.reduce((acc, curr) => acc + curr.time_taken_seconds, 0) / validTimes.length)
    : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const stats = [
    { label: "Total Respondents", value: totalSubmissions, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Average Score", value: `${averagePercentage}%`, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Highest Score", value: `${highestScore}%`, icon: Trophy, color: "text-green-600", bg: "bg-green-50" },
    { label: "Avg Time Taken", value: formatTime(avgTimeSeconds), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-neu-bg rounded-[32px] p-6 shadow-neu-flat flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-neu-bg shadow-neu-pressed-sm ${stat.color}`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-neu-text-light uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-neu-text mt-1">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}