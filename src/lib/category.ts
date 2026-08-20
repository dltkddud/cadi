import type { ClosetCategory } from "@/types";

/** 영문 카테고리 → 화면에 보여줄 한국어 라벨. */
export const CATEGORY_LABELS: Record<ClosetCategory, string> = {
  Top: "상의",
  Bottom: "하의",
  Outerwear: "아우터",
  Shoes: "신발",
  Bag: "가방",
  Accessory: "액세서리",
};

const LABEL_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_LABELS).map(([category, label]) => [label, category as ClosetCategory]),
) as Record<string, ClosetCategory | undefined>;

/**
 * 한국어 라벨 → 영문 카테고리.
 * 예전에는 상의/하의/아우터만 분기하고 나머지를 전부 "Shoes"로 떨어뜨려
 * 가방과 액세서리가 신발로 분류됐다.
 */
export function categoryFromLabel(label: string): ClosetCategory {
  return LABEL_TO_CATEGORY[label] ?? "Accessory";
}

export function labelFromCategory(category: ClosetCategory): string {
  return CATEGORY_LABELS[category] ?? "액세서리";
}
