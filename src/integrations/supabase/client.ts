// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pcmjvtaskhjjpfswmfte.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjbWp2dGFza2hqanBmc3dtZnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjQzNzgsImV4cCI6MjA2NDcwMDM3OH0.TWp0t6AxutGuyITTdxELv0GaFgWWj2KCMmNfqdcbTKA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);