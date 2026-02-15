import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database";

let _adminClient: SupabaseClient<Database> | null = null;

export function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}
