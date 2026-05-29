import { createClient } from '@supabase/supabase-js';

// Env vars are preferred (set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in Vercel).
// Hardcoded fallbacks so the app works even without env var configuration.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://qgnhigobeueyqssdbxfz.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbmhpZ29iZXVleXFzc2RieGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjQ5NjgsImV4cCI6MjA5NTY0MDk2OH0.6zU2cN2WSucMy_MBN3lXnEazplWJ4yWaPXcg7OoDxPU';

export const supabase = createClient(url, key);
