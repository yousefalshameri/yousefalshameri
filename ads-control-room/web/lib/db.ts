import postgres from "postgres";

const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL مو معرّف");
  // prepare:false عشان يشتغل مع pooler حق Supabase
  g.__sql ??= postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
  return g.__sql;
}
