import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ResultsClient from "./components/ResultsClient";

export default async function QuizResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Fetch the single Quiz Details
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (quizError || !quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Quiz not found</h2>
        <p className="text-slate-600 mt-2">You do not have permission to view these results.</p>
        <Link href="/dashboard" className="text-blue-600 mt-4 inline-block hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // 2. Fetch Submissions
  // Make sure we fetch the respondent details including name, reg_id, place, district which were originally stored in `respondent_details` or joined via participants. Wait, in the old single page it fetched `participants(name, reg_id, place, district)`. Let's fetch that.
  const { data: submissions } = await supabase
    .from("quiz_submissions")
    .select("id, participant_id, score, total_points, answers, cheat_warnings, time_taken_seconds, submitted_at, participants(name, reg_id, place, district)")
    .eq("quiz_id", quiz.id);

  // Map participant data so the ResultsClient works the same
  const mappedSubmissions = submissions?.map(sub => {
    // Supabase TS might infer joined tables as arrays
    const participant = Array.isArray(sub.participants) ? sub.participants[0] : sub.participants;
    return {
      ...sub,
      respondent_name: participant?.name || "Unknown",
      respondent_details: {
        reg_id: participant?.reg_id,
        place: participant?.place,
        district: participant?.district
      }
    };
  }) || [];

  // 3. Fetch Questions and Options
  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, points, options (id, question_id, option_text, is_correct)")
    .eq("quiz_id", quiz.id)
    .order("sort_order", { ascending: true });

  const fullQuestions = questions?.map(q => {
    let parsedText = q.question_text;
    let statements: string[] | undefined = undefined;

    try {
      if (parsedText.startsWith('{') && parsedText.includes('"_type"')) {
        const parsed = JSON.parse(parsedText);
        if (parsed._type === 'complex') {
          parsedText = parsed.text;
          if (parsed.statements && parsed.statements.length > 0) {
            statements = parsed.statements;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    return {
      ...q,
      question_text: parsedText,
      statements,
      options: q.options || []
    };
  }) || [];

  return (
    <div className="max-w-6xl mx-auto pb-12 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="p-3 rounded-xl bg-neu-bg shadow-neu-flat hover:shadow-neu-pressed transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Winners & Results: {quiz.title}</h1>
          <p className="text-slate-600 text-sm mt-1">Analytics, rankings, and deep insights.</p>
        </div>
      </div>

      <ResultsClient
        quiz={quiz}
        submissions={mappedSubmissions}
        questions={fullQuestions}
      />
    </div>
  );
}