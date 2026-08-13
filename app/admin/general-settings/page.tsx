import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HardDrive } from "lucide-react";
import SettingsClient from "./components/SettingsClient";

export default async function GeneralSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the current single quiz (if it exists) to show stats or id for deletion
  const { data: quizzes, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .order('created_at', { ascending: true })
    .limit(1);
    
  const quiz = quizzes && quizzes.length > 0 ? quizzes[0] : null;

  const { count: participantsCount } = await supabase
    .from("participants")
    .select("*", { count: 'exact', head: true });

  const { count: submissionsCount } = await supabase
    .from("quiz_submissions")
    .select("*", { count: 'exact', head: true });

  const { count: questionsCount } = await supabase
    .from("questions")
    .select("*", { count: 'exact', head: true });

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-neu-bg p-6 rounded-[32px] shadow-neu-flat">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-3 rounded-xl bg-neu-bg shadow-neu-flat hover:shadow-neu-pressed transition-all text-neu-text">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neu-text">General Settings</h1>
              <p className="text-sm text-neu-text-light">Database resets and advanced configuration</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center text-neu-red">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        <SettingsClient 
          quizId={quiz?.id || null}
          stats={{
            participants: participantsCount || 0,
            submissions: submissionsCount || 0,
            questions: questionsCount || 0,
            hasQuiz: !!quiz
          }}
        />
      </div>
    </div>
  );
}
