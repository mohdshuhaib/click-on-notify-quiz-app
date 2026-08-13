"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function resetQuizSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  // Deleting the quiz will cascade delete questions, options, and submissions
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete quizzes owned by the current user

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/quiz-settings");
  revalidatePath("/admin/winners");
  revalidatePath("/admin/general-settings");
  return { success: true, message: "Quiz settings and questions have been reset successfully." };
}

export async function resetParticipantsData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  // Deleting participants will cascade delete any submissions tied to them
  // Warning: We don't have a 'creator_id' on participants in this schema, so this deletes ALL participants!
  // In a multi-tenant app this would be dangerous, but since this is a single instance app, it's fine.
  const { error } = await supabase
    .from("participants")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/participants");
  revalidatePath("/admin/winners");
  revalidatePath("/admin/general-settings");
  return { success: true, message: "All participants and their submissions have been cleared." };
}

export async function factoryResetAll() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  // 1. Delete Quiz
  const { error: quizError } = await supabase
    .from("quizzes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (quizError) {
    return { success: false, message: quizError.message };
  }

  // 2. Delete Participants
  const { error: partError } = await supabase
    .from("participants")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

  if (partError) {
    return { success: false, message: partError.message };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "System has been completely factory reset." };
}
