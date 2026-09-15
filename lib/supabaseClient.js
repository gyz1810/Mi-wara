import { createClient } from "@supabase/supabase-js";

// Estas claves son publicas por diseno (protegidas por Row Level Security en Supabase),
// por eso es seguro dejarlas en el codigo del cliente.
const SUPABASE_URL = "https://pbygxqgfoapppktrscyv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWd4cWdmb2FwcHBrdHJzY3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDgyMzAsImV4cCI6MjEwMTIyNDIzMH0.1gNvvbSGQLNcXvQPJ7wNM5IwZMHFvu9lo9_rjqx27_g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
