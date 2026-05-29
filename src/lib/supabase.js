import { createClient } from '@supabase/supabase-js';

// Env vars are preferred (set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in Vercel).
// Hardcoded fallbacks so the app works even without env var configuration.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://lvncoeedifvnawnxmzzp.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bmNvZWVkaWZ2bmF3bnhtenpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTg1MjYsImV4cCI6MjA5NTYzNDUyNn0.Qly35OUUwVGHppYJiL-ZaeywTJEQOH_UXUzm-FA2h6I';

export const supabase = createClient(url, key);
