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
    err.status = 400; // Use a client error status code
    return err;
  };

  const createRpcError = (method: string) => ({
      message: `Supabase no configurado. Llamada a RPC '${method}' fallida.`,
      details: 'Asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas.',
      hint: '',
      code: 'SUPABASE_NOT_CONFIGURED'
  });

  // A more robust dummy client that won't crash the app.
  const dummyClient: any = {
    // The `auth` object is what was causing crashes. We make a more complete mock.
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_: any, callback: (event: string, session: Session | null) => void) => {
          // Immediately inform listeners that there's no session.
          setTimeout(() => callback('INITIAL_SESSION', null), 0);
          return { data: { subscription: { unsubscribe: () => {} } } };
      },
      // Return a proper error structure that the UI can display.
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: createAuthError('Supabase no está configurado. No se puede iniciar sesión.') }),
      signUp: async () => ({ data: { user: null, session: null }, error: createAuthError('Supabase no está configurado. No se puede crear cuenta.') }),
      signInWithOAuth: async () => ({ data: { user: null, session: null }, error: createAuthError('Supabase no está configurado. No se puede usar un proveedor externo.') }),
      signOut: async () => ({ error: null }),
    },
    // The `from` method needs to return an object with mock methods too.
    from: (_table: string) => ({
      select: () => Promise.resolve({ data: [], error: createRpcError('select') }),
      insert: () => Promise.resolve({ data: [], error: createRpcError('insert') }),
      update: () => Promise.resolve({ data: [], error: createRpcError('update') }),
      delete: () => Promise.resolve({ data: [], error: createRpcError('delete') }),
      // RPC calls also need to be mocked to return an error.
      rpc: () => Promise.resolve({ data: null, error: createRpcError('rpc') }),
    }),
    // Mock other top-level properties if needed, e.g., functions
    functions: {
        invoke: async () => ({
            data: null,
            error: createRpcError('functions.invoke'),
        }),
    },
  };

  supabase = dummyClient as SupabaseClient<Database>;
}

export { supabase };
