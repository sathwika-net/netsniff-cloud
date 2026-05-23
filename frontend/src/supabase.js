import { createClient } from '@supabase/supabase-js'

// Read the values from our .env.local file (Vite exposes VITE_ prefixed vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create one shared client the whole app uses to talk to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)