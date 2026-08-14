import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditQuizClient from "../quiz-settings/EditQuizClient";

export default async function EditMockQuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the one and only mock quiz (or create if it doesn't exist)
  let { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq('is_mock', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!quiz) {
    const { data: newQuiz, error } = await supabase
      .from('quizzes')
      .insert({
        title: 'Click on Notify Mock Test',
        description: 'Practice test for the upcoming mega quiz.',
        time_limit_seconds: 1800, // Default 30 mins
        is_published: false,
        is_mock: true
      })
      .select('*')
      .single();
    
    quiz = newQuiz;
  }

  if (!quiz) return <div>Error initializing mock quiz.</div>;

  // Fetch Questions and Options in a single optimized nested query
  const { data: questions } = await supabase
    .from("questions")
    .select("*, options(*)")
    .eq("quiz_id", quiz.id)
    .order("sort_order", { ascending: true });

  // Format the data to match our Frontend Types perfectly
  const formattedQuizState = {
    title: quiz.title,
    description: quiz.description || "",
    time_limit_seconds: quiz.time_limit_seconds || null,
    shuffle_questions: quiz.shuffle_questions,
    is_published: quiz.is_published,
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
      isMock={true}
    />
  );
}
