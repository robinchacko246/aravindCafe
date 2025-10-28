import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ||"https://dybtwaqhwelkximkeuqx.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YnR3YXFod2Vsa3hpbWtldXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzU2OTAsImV4cCI6MjA3NzIxMTY5MH0.eFXOMDXNLfxI1xlflR6NHqEPluk8gOnJjNuUZ_iOP_I'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please update .env.local file.')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

