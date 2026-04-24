import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3002'
    : 'https://v4learnease.onrender.com');

export const apiUrl = (path: string) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize Supabase if URL is a valid http/https string and not a placeholder
const isValidUrl = (url?: string) => url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your_supabase');

export const supabase = isValidUrl(SUPABASE_URL) && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('your_supabase')
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY) 
  : null;
