import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** .env가 채워져 있는지. 값이 없으면 원격 저장 없이 로컬 상태로만 동작한다. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Cadi] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. " +
      ".env.example을 복사해 .env를 만들어주세요. 지금은 옷장 데이터가 저장되지 않습니다.",
  );
}

/**
 * 값이 없을 때 createClient는 모듈 로드 시점에 예외를 던진다.
 * 그러면 main.tsx까지 도달하지 못해 화면이 통째로 하얗게 비므로,
 * 설정이 없을 때는 client를 만들지 않고 null을 내보낸다.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
