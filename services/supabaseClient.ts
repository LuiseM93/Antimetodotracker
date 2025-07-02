import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your deployment environment (e.g., Vercel, Netlify).
// They are not meant to be hardcoded in the source code.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This warning is helpful for developers during setup.
  // In a production build, these variables must be present.
  console.warn("Supabase URL or Anon Key is missing. Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY environment variables for the app to connect to the backend.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
