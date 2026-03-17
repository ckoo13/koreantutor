import { supabase } from "./supabase";

// Simple spaced repetition: days until next review
function calcNextDue(correctCount: number): Date {
  const now = new Date();
  const days = correctCount <= 1 ? 1 : correctCount === 2 ? 3 : 7;
  now.setDate(now.getDate() + days);
  return now;
}

export async function recordAnswer(
  userId: string,
  itemType: string,
  itemId: number,
  correct: boolean
) {
  const { data: existing } = await supabase
    .from("user_progress")
    .select("correct_count, incorrect_count")
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .maybeSingle();

  const correctCount = (existing?.correct_count ?? 0) + (correct ? 1 : 0);
  const incorrectCount = (existing?.incorrect_count ?? 0) + (correct ? 0 : 1);
  const nextDue = correct ? calcNextDue(correctCount) : new Date();

  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      last_seen: new Date().toISOString(),
      next_due: nextDue.toISOString(),
    },
    { onConflict: "user_id,item_type,item_id" }
  );
}

export async function saveUnitScore(userId: string, unitId: number, score: number) {
  const { data: existing } = await supabase
    .from("unit_completion")
    .select("best_score")
    .eq("user_id", userId)
    .eq("unit_id", unitId)
    .maybeSingle();

  const bestScore = Math.max(score, existing?.best_score ?? 0);
  const completed = bestScore >= 70;

  await supabase.from("unit_completion").upsert(
    {
      user_id: userId,
      unit_id: unitId,
      best_score: bestScore,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,unit_id" }
  );
}

export async function getAllUnitCompletions(userId: string) {
  const { data } = await supabase
    .from("unit_completion")
    .select("*")
    .eq("user_id", userId);
  return data ?? [];
}

export async function getDueItems(userId: string) {
  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .lte("next_due", new Date().toISOString());
  return data ?? [];
}

export async function getUserProgress(userId: string) {
  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);
  return data ?? [];
}
