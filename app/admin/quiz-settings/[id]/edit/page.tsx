import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditQuizClient from "./EditQuizClient";

// Updated type signature for params to fix the Next.js 15 build error
export default async function EditQuizPage({
  params
}: {
  params: Promise<{ id: string | string[] }>
}) {
  const resolvedParams = await params;

  // Ensure the id is a flat string to pass to Supabase
  const quizId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Fetch Quiz Data
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("creator_id", user.id)
    .single();

  if (quizError || !quiz) redirect("/admin/quiz-settings");

  // 2. Fetch Questions and Options in a single optimized nested query
  const { data: questions } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("quiz_id", quiz.id)
    .order("sort_order", { ascending: true });

  // 4. Format the data to match our Frontend Types perfectly
  const formattedQuizState = {
    title: quiz.title,
    description: quiz.description || "",
    time_limit_seconds: quiz.time_limit_seconds || null,
    require_password: quiz.require_password,
    quiz_password: quiz.quiz_password || "",
    shuffle_questions: quiz.shuffle_questions,
    is_published: quiz.is_published,
    intro_fields: quiz.intro_fields || [],
    show_results: quiz.show_results !== undefined ? quiz.show_results : true,
    start_time: quiz.start_time || null,
    end_time: quiz.end_time || null,
  };

  const formattedQuestions = questions?.map(q => {
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
      id: q.id,
      text: parsedText,
      statements,
      points: q.points,
      options: q.options?.map((o: any) => ({
        id: o.id,
        text: o.option_text,
        isCorrect: o.is_correct
      })) || []
    };
  }) || [];

  return (
    <EditQuizClient
      quizId={quiz.id}
      initialQuizState={formattedQuizState}
      initialQuestions={formattedQuestions}
    />
  );
}
