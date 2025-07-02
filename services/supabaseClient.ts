
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vite requires environment variables to be prefixed with VITE_ to be exposed to the browser.
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your hosting environment (e.g., Vercel).
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;


let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  // If variables are present, create the real client.
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // If variables are missing, log a critical error and create a dummy client.
  // This prevents the app from crashing and allows it to load a fallback UI.
  console.error(
    "CRITICAL: Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. " +
    "The application will not connect to the backend. Please configure them in your hosting environment."
  );

  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado.', details: '', hint: '', code: '' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado.', details: '', hint: '', code: '' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado.', details: '', hint: '', code: '' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado.', details: '', hint: '', code: '' } }),
    }),
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado.', details: '', hint: '', code: '' } }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase no configurado.', name: 'AuthError', status: 500 } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase no configurado.', name: 'AuthError', status: 500 } }),
      signInWithOAuth: () => Promise.resolve({ data: { provider: 'google', url: '' }, error: { message: 'Supabase no configurado.', name: 'AuthError', status: 500 } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    // Add other top-level properties if needed, e.g., storage
  } as unknown as SupabaseClient; // Use a type assertion to satisfy TypeScript for the mock client.
}

// Export the initialized client (real or dummy).
export { supabase };
