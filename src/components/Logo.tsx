import cadiLogo from "@/assets/cadi-logo.png";

export function Logo({ className = "h-16", alt = "Cadi" }: { className?: string; alt?: string }) {
  return <img src={cadiLogo} alt={alt} className={`w-auto object-contain ${className}`} />;
}
