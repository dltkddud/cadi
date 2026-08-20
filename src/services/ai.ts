import mcmCatalog from "@/mcm_catalog.json";
import type { ClosetItem, ClosetAttributes, McmBag, StylingRecommendation, ClosetCategory, Season } from "@/types";

export const CATALOG: McmBag[] = (mcmCatalog as { bags: McmBag[] }).bags;
export const CATEGORY_OPTIONS: ClosetCategory[] = ["Top", "Bottom", "Outerwear", "Shoes", "Bag", "Accessory"];
export const SEASON_OPTIONS: Season[] = ["Spring", "Summer", "Fall", "Winter", "All-Season"];
export const QUICK_TAGS = ["비 오는 날 카페", "주말 데이트", "편안한 캐주얼", "오피스 미팅"];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** Edge Function을 호출할 수 있는 상태인지. 값이 없으면 `undefined/functions/...`로 요청이 나가는 것을 막는다. */
const canCallEdgeFunction = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/cadi-ai`;

/** Edge Function이 응답하지 않을 때까지 무한정 기다리지 않도록 하는 상한. */
const REQUEST_TIMEOUT_MS = 30_000;

async function callEdgeFunction(action: string, payload: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Edge Function 오류: ${res.status}`);
    const data = await res.json();
    if (data && typeof data === "object" && "error" in data) {
      throw new Error(String((data as { error: unknown }).error));
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const MOCK_ANALYSIS_POOL: ClosetAttributes[] = [
  { category: "Outerwear", sub_category: "오버사이즈 트렌치코트", primary_color: "베이지", style: ["미니멀", "클래식"], season: ["Fall", "Spring"], pattern: "무지" },
  { category: "Top", sub_category: "와이드 니트", primary_color: "아이보리", style: ["캐주얼", "편안한"], season: ["Fall", "Winter"], pattern: "무지" },
  { category: "Bottom", sub_category: "스트레이트 데님", primary_color: "블랙", style: ["캐주얼", "데일리"], season: ["All-Season"], pattern: "무지" },
];

function pickMockAnalysis(): ClosetAttributes {
  return { ...MOCK_ANALYSIS_POOL[Math.floor(Math.random() * MOCK_ANALYSIS_POOL.length)] };
}

function asNonEmptyString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/**
 * 모델 응답을 그대로 신뢰하지 않고 ClosetAttributes 형태로 맞춘다.
 * 예전에는 `data as ClosetAttributes`로 캐스팅만 했기 때문에, style/season이
 * 배열이 아니면 편집 화면에서 `.join()` / `.includes()`가 터져 앱이 죽었다.
 */
function normalizeAttributes(raw: unknown): ClosetAttributes {
  const value = (raw ?? {}) as Record<string, unknown>;

  const category = CATEGORY_OPTIONS.includes(value.category as ClosetCategory)
    ? (value.category as ClosetCategory)
    : "Top";

  const style = Array.isArray(value.style)
    ? value.style.map((entry) => String(entry).trim()).filter(Boolean)
    : [];

  const season = Array.isArray(value.season)
    ? value.season.filter((entry): entry is Season => SEASON_OPTIONS.includes(entry as Season))
    : [];

  return {
    category,
    sub_category: asNonEmptyString(value.sub_category, "이름 미정"),
    primary_color: asNonEmptyString(value.primary_color, "미정"),
    style: style.length ? style : ["데일리"],
    season: season.length ? season : ["All-Season"],
    pattern: asNonEmptyString(value.pattern, "무지"),
  };
}

export async function analyzeClosetImage(imageDataUrl: string): Promise<ClosetAttributes> {
  if (!canCallEdgeFunction) {
    console.warn("[Cadi] Supabase 환경변수가 없어 mock 분석 결과를 사용합니다.");
    await new Promise((resolve) => setTimeout(resolve, 500));
    return pickMockAnalysis();
  }

  try {
    const data = await callEdgeFunction("analyze-closet", { imageDataUrl });
    return normalizeAttributes(data);
  } catch (err) {
    console.warn("[Cadi] 분석 호출 실패, mock으로 대체합니다:", err);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return pickMockAnalysis();
  }
}

export function mockGenerateStyling(closet: ClosetItem[], prompt: string): StylingRecommendation {
  const outfitSource = closet.slice(0, 2);
  const lowerPrompt = prompt.toLowerCase();
  const scored = CATALOG.map((bag) => ({
    bag,
    score: bag.style_keywords.reduce((acc, kw) => acc + (lowerPrompt.includes(kw.toLowerCase()) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  const matchedBag = scored[0]?.bag ?? CATALOG[0];

  return {
    context_analysis: {
      weather: prompt.includes("비") ? "비" : "맑음",
      place: prompt.includes("카페") ? "카페" : prompt.includes("데이트") ? "레스토랑" : "외출",
      tpo: prompt, mood: "편안하지만 신경 쓴 듯한",
    },
    outfit: outfitSource.map((item) => ({
      closet_item_id: item.id,
      reason: `${item.sub_category}은(는) "${prompt}" 상황에 잘 어울리는 편안한 아이템이에요.`,
    })),
    matched_bag: { bag_id: matchedBag.id, bag_name: matchedBag.name, reason: matchedBag.coordination_tips },
    styling_intent: `"${prompt}"에 맞춰 ${outfitSource[0]?.sub_category ?? "기본 아이템"} 중심의 편안한 조합을 추천해요. 과하지 않으면서도 완성도 있는 룩을 위해 "${matchedBag.name}"을(를) 함께 매칭했어요.`,
  };
}

/** 추천 카드가 렌더 중에 터지지 않도록 필수 필드를 검증한다. */
function isStylingRecommendation(raw: unknown): raw is StylingRecommendation {
  if (!raw || typeof raw !== "object") return false;
  const value = raw as Record<string, unknown>;
  const context = value.context_analysis as Record<string, unknown> | undefined;
  const bag = value.matched_bag as Record<string, unknown> | undefined;

  return (
    !!context && typeof context === "object" &&
    typeof context.weather === "string" && typeof context.place === "string" && typeof context.mood === "string" &&
    Array.isArray(value.outfit) &&
    value.outfit.every((entry) => !!entry && typeof (entry as Record<string, unknown>).closet_item_id === "string") &&
    !!bag && typeof bag === "object" && typeof bag.bag_id === "string" &&
    typeof value.styling_intent === "string"
  );
}

export async function generateStyling(closet: ClosetItem[], prompt: string): Promise<StylingRecommendation> {
  if (!canCallEdgeFunction) {
    console.warn("[Cadi] Supabase 환경변수가 없어 mock 스타일링 결과를 사용합니다.");
    return mockGenerateStyling(closet, prompt);
  }

  const data = await callEdgeFunction("generate-styling", {
    closet: closet.map(({ id, category, sub_category, primary_color, style, season, pattern }) => ({
      id, category, sub_category, primary_color, style, season, pattern,
    })),
    prompt,
    catalog: CATALOG.map((b) => ({
      id: b.id, name: b.name, category: b.category,
      color_kor: b.color_kor, color: b.color, material: b.material,
      style_keywords: b.style_keywords, coordination_tips: b.coordination_tips,
    })),
  });

  if (!isStylingRecommendation(data)) {
    throw new Error("스타일링 응답 형식이 올바르지 않습니다.");
  }
  return data;
}
