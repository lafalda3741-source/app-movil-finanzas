// supabaseClient.js
// Usar EXACTAMENTE el mismo archivo (con las mismas variables de entorno)
// tanto en el proyecto "Panel de Control" como en el proyecto de la app móvil.
// Así ambos leen y escriben en la misma base de datos.

import { createClient } from "@supabase/supabase-js";

// Limpia comillas o espacios de más que a veces quedan pegados al copiar
// y pegar el valor en el panel de variables de entorno (Netlify, etc.).
function limpiarValorEnv(valor) {
  if (!valor) return "";
  return valor.trim().replace(/^["']+|["']+$/g, "");
}

const supabaseUrl = limpiarValorEnv(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = limpiarValorEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Faltan las variables VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
    "Revisá que estén cargadas en Site configuration → Environment variables de Netlify, " +
    "y que hayas vuelto a hacer 'Trigger deploy' después de cargarlas."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
