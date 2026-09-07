// supabaseClient.js
// Usar EXACTAMENTE el mismo archivo (con las mismas variables de entorno)
// tanto en el proyecto "Panel de Control" como en el proyecto de la app móvil.
// Así ambos leen y escriben en la misma base de datos.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
