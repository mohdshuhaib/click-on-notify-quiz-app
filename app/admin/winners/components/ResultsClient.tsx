"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import StatCards from "./StatCards";
import SubmissionsTable from "./SubmissionsTable";
import QuestionAnalytics from "./QuestionAnalytics";

interface Props {
  quiz: any;
  submissions: any[];
  questions: any[];
}

export default function ResultsClient({ quiz, submissions, questions }: Props) {

  // RANKING LOGIC: Sort by Score (Desc), then by Time Taken (Asc)
  const rankedSubmissions = useMemo(() => {
    return [...submissions]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score; // Highest score first
        // Tie-breaker: Lowest time first
        return (a.time_taken_seconds || 999999) - (b.time_taken_seconds || 999999);
      })
      .map((sub, index) => ({ ...sub, rank: index + 1 })); // Assign Rank 1, 2, 3...
  }, [submissions]);

  const handleExportToExcel = () => {
    const excelData = rankedSubmissions.map(sub => {
      const percentage = Math.round((sub.score / sub.total_points) * 100);
      const minutes = Math.floor((sub.time_taken_seconds || 0) / 60);
      const seconds = (sub.time_taken_seconds || 0) % 60;

      let baseData: any = {
        "Rank": sub.rank,
        "Name": sub.respondent_name,
        "Score": sub.score,
        "Total Points": sub.total_points,
        "Percentage": `${percentage}%`,
        "Time Taken": `${minutes}m ${seconds}s`,
        "Cheating Warnings": sub.cheat_warnings,
        "Submitted": new Date(sub.submitted_at).toLocaleString()
      };

      // Exact Custom Data mapping
      if (sub.respondent_details) {
        Object.entries(sub.respondent_details).forEach(([key, value]) => {
          if (key === 'default_name' || value === sub.respondent_name) return;
          baseData[key] = value;
        });
      }

      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    worksheet["!cols"] = [ { wch: 5 }, { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 20 } ];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const safeTitle = quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `${safeTitle}_results.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-end mb-8">
        <button
          onClick={handleExportToExcel}
          disabled={submissions.length === 0}
          className="flex items-center gap-2 px-6 py-4 bg-neu-bg text-neu-blue font-bold rounded-2xl shadow-neu-flat hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-none"
        >
          <Download className="w-5 h-5" /> Export Leaderboard
        </button>
      </div>

      <StatCards submissions={rankedSubmissions} />

      <h2 className="text-2xl font-black text-neu-text mb-6 mt-10">Live Leaderboard</h2>
      {/* Pass the quiz object here so we can read the field labels! */}
      <SubmissionsTable submissions={rankedSubmissions} questions={questions} quiz={quiz} />

      <div className="mt-12">
        <QuestionAnalytics questions={questions} submissions={rankedSubmissions} />
      </div>
    </div>
  );
}