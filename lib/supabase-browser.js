"use client";
// Cliente de Supabase para el navegador: solo el login del panel. Guarda la sesión en el navegador.
import { createClient } from "@supabase/supabase-js";

let cliente;
export function supabaseNavegador() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (!cliente) cliente = createClient(url, key);
  return cliente;
}
