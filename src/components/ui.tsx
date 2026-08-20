export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        selected ? "bg-black text-white border-black" : "bg-white text-black border-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}

export function PrimaryButton({
  label, onClick, disabled, loading,
}: {
  label: string; onClick: () => void; disabled?: boolean; loading?: boolean;
}) {
  // loading 중에는 호출자가 disabled를 따로 넘기지 않아도 눌리지 않도록 한다.
  const isDisabled = Boolean(disabled) || Boolean(loading);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={Boolean(loading)}
      className={`w-full rounded-md py-3.5 text-base font-semibold text-white bg-black transition-opacity ${
        isDisabled ? "opacity-40" : "opacity-100 active:opacity-80"
      }`}
    >
      {loading ? "생성 중..." : label}
    </button>
  );
}

export function ScreenHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mt-4 mb-5">
      <p className="text-xs font-bold tracking-widest text-neutral-500 mb-1">{eyebrow}</p>
      <h1 className="text-2xl font-bold text-black mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-neutral-500 leading-relaxed">{subtitle}</p>}
    </div>
  );
}
