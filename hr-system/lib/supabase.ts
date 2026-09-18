import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * يرجع null إذا لم تُضبط متغيرات البيئة، حتى يعمل النظام
 * على البيانات التجريبية في lib/data.ts أثناء التطوير.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
