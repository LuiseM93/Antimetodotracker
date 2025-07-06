import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient<Database>;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      },
    }
  });
} else {
  console.error(
    "CRITICAL: Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. " +
    "The application will not connect to the backend."
  );

  // Crear un cliente dummy más completo para evitar errores
  const dummyClient: any = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: (_credentials) => Promise.resolve({
        data: { user: null, session: null },
        error: { name: "AuthError", message: "Supabase no está configurado. No se puede iniciar sesión." }
      }),
      signUp: (_credentials) => Promise.resolve({
        data: { user: null, session: null },
        error: { name: "AuthError", message: "Supabase no está configurado. No se puede crear cuenta." }
      }),
      signInWithOAuth: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { name: "AuthError", message: "Supabase no está configurado. No se puede usar un proveedor externo." } 
      }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: "Supabase no configurado" } }),
          order: () => ({
            order: () => Promise.resolve({ data: [], error: { message: "Supabase no configurado" } })
          })
        }),
        order: () => ({
          order: () => Promise.resolve({ data: [], error: { message: "Supabase no configurado" } })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: "Supabase no configurado" } })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: "Supabase no configurado" } })
            })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
          match: () => Promise.resolve({ error: { message: "Supabase no configurado" } })
        })
      }),
      insert: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
      update: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
      delete: () => Promise.resolve({ error: { message: "Supabase no configurado" } }),
    }),
    rpc: () => Promise.resolve({ data: [], error: { message: "Supabase no configurado" } }),
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