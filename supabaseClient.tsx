// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// As suas chaves vão aqui. É mais seguro guardá-las em variáveis de ambiente (.env)
// Mas para começar, pode colocar diretamente.
const supabaseUrl = 'https://hdqrcmxiyanhqligzrpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkcXJjbXhpeWFuaHFsaWd6cnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzE0NTYsImV4cCI6MjA2NjcwNzQ1Nn0.efbHgndvp-SHT1TjbjjbXht76Y_fUcRxAPiqeGmCpZU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);