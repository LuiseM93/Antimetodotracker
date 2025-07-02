import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient<Database>;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
  console.error(
    "CRITICAL: Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. " +
    "The application will not connect to the backend."
  );

  const dummyClient: any = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { name: "AuthError", message: "Supabase no está configurado. No se puede iniciar sesión." } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { name: "AuthError", message: "Supabase no está configurado. No se puede crear cuenta." } }),
      signInWithOAuth: () => Promise.resolve({ data: { user: null, session: null }, error: { name: "AuthError", message: "Supabase no está configurado. No se puede usar un proveedor externo." } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
      insert: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
      update: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
      delete: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
      rpc: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
    }),
    functions: {
        invoke: async () => ({
            data: null,
            error: { message: "Supabase no configurado" },
        }),
    },
  };

  supabase = dummyClient as SupabaseClient<Database>;
}

export { supabase };