'use server'

import { createClient } from "@/utils/supabase/server";

export async function getPublicQuiz(quizId: string) {
  const supabase = await createClient();

  // 1. Fetch the quiz details
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title, description, time_limit_seconds, shuffle_questions, is_published, start_time, end_time')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz || !quiz.is_published) {
    return { status: "unavailable", error: "Quiz not found or not currently active." };
  }

  const now = new Date();

  // Check if it hasn't started yet
  if (quiz.start_time && now < new Date(quiz.start_time)) {
    return {
      status: "not_started",
      startTime: quiz.start_time,
      quizTitle: quiz.title,
      error: "Quiz hasn't started yet."
    };
  }

  // Check if it has already ended
  if (quiz.end_time && now > new Date(quiz.end_time)) {
    return {
      status: "ended",
      endTime: quiz.end_time,
      quizTitle: quiz.title,
      error: "Quiz has concluded."
    };
  }

  // 2. Fetch Questions and Options
  const { data: questions } = await supabase
    .from('questions')
    .select('id, question_text, points, options(id, question_id, option_text)')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true });

  if (!questions) return { status: "unavailable", error: "No questions found." };

  // Map options and parse complex questions
  const formattedQuestions = questions.map(q => {
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

    // Shuffle options to prevent adjacent cheating
    let shuffledOptions = q.options || [];
    if (shuffledOptions.length > 0) {
      shuffledOptions = [...shuffledOptions].sort(() => Math.random() - 0.5);
    }

    return {
      ...q,
      question_text: parsedText,
      statements,
      options: shuffledOptions
    };
  });

  // Shuffle questions if enabled
  if (quiz.shuffle_questions) {
    formattedQuestions.sort(() => Math.random() - 0.5);
  }

  return { status: "active", quiz, questions: formattedQuestions };
}

export async function submitQuizAndGrade(
  quizId: string,
  participantName: string,
  userAnswers: Record<string, string>,
  warnings: number,
  participantId: string,
  timeTakenSeconds: number
) {
  const supabase = await createClient();

  // 1. Fetch the REAL options to grade the test securely on the server
  const { data: realOptions } = await supabase
    .from('options')
    .select('id, question_id, is_correct')
    .in('question_id', Object.keys(userAnswers));

  const { data: questions } = await supabase
    .from('questions')
    .select('id, points')
    .eq('quiz_id', quizId);

  if (!realOptions || !questions) return { error: "Failed to grade quiz." };

  let score = 0;
  let totalPoints = 0;

  // 2. Calculate Score
  questions.forEach(q => {
    totalPoints += q.points;
    const selectedOptionId = userAnswers[q.id];
    const realOption = realOptions.find(o => o.id === selectedOptionId);

    if (realOption && realOption.is_correct) {
      score += q.points;
    }
  });

  // 3. Save to Database
  const { error } = await supabase
    .from('quiz_submissions')
    .insert({
      quiz_id: quizId,
      participant_id: participantId,
      score: score,
      total_points: totalPoints,
      answers: userAnswers,
      cheat_warnings: warnings,
      time_taken_seconds: timeTakenSeconds
    });

  if (error) {
    console.error("Submission Error:", error);
    return { error: "Failed to save submission." };
  }

  return { success: true, score, totalPoints };
}
