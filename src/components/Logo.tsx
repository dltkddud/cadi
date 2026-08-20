import cadiLogo from "@/assets/cadi-logo.png";

/**
 * 로고는 정적 경로 대신 에셋 import로 참조한다.
 * Vite가 base(`/cadi/`)와 해시를 자동으로 붙여 주므로
 * 로컬(`/`)과 GitHub Pages(`/cadi/`) 양쪽에서 동일하게 동작한다.
 */
export function Logo({
  className = "h-16 w-auto object-contain",
  alt = "Cadi",
}: {
  className?: string;
  alt?: string;
}) {
  return <img src={cadiLogo} alt={alt} className={className} />;
}
