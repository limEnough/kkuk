import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | null = null;

export function createSupabaseClient(
  url: string,
  anonKey: string,
): SupabaseClient<Database> {
  if (client) return client;

  client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

  return client;
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!client) {
    throw new Error(
      'Supabase client not initialized. Call createSupabaseClient first.',
    );
  }
  return client;
}
