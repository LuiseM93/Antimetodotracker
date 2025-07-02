
import { createClient, SupabaseClient, Session, AuthError } from '@supabase/supabase-js';
import { Database } from './database.types';

// Vite requires environment variables to be prefixed with VITE_ to be exposed to the browser.
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your hosting environment (e.g., Vercel).
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;


let supabase: SupabaseClient<Database>;

if (supabaseUrl && supabaseAnonKey) {
  // If variables are present, create the real client.
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
  // If variables are missing, log a critical error and create a dummy client.
  // This prevents the app from crashing and allows it to load a fallback UI.
  console.error(
    "CRITICAL: Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. " +
    "The application will not connect to the backend. Please configure them in your hosting environment."
  );
  
  const createAuthError = (message: string): AuthError => {
    const err = new Error(message) as AuthError;
    err.name = 'AuthApiError';
    err.status = 500;
    return err;
  };
  
  const mockApiError = (method: string) => ({
      message: `Supabase no configurado. Llamada a '${method}' fallida.`,
      details: 'Asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas.',
      hint: '',
      code: 'SUPABASE_NOT_CONFIGURED'
  });

  const dummyClient: any = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_: any, callback: (event: string, session: Session | null) => void) => {
          setTimeout(() => callback('INITIAL_SESSION', null), 0);
          return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: createAuthError('Supabase no está configurado. No se puede iniciar sesión.') }),
      signUp: async () => ({ data: { user: null, session: null }, error: createAuthError('Supabase no está configurado. No se puede crear cuenta.') }),
      signInWithOAuth: async () => ({ data: null, error: createAuthError('Supabase no configurado. No se puede usar Google.') }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => ({
      select: () => Promise.resolve({ data: [], error: mockApiError('select') }),
      insert: () => Promise.resolve({ data: [], error: mockApiError('insert') }),
      update: () => Promise.resolve({ data: [], error: mockApiError('update') }),
      delete: () => Promise.resolve({ data: [], error: mockApiError('delete') }),
      rpc: () => Promise.resolve({ data: [], error: mockApiError('rpc') }),
    }),
    functions: {
        invoke: async () => ({
            data: null,
            error: mockApiError('functions.invoke'),
        }),
    },
  };

  supabase = dummyClient as SupabaseClient<Database>;
}

export { supabase };
