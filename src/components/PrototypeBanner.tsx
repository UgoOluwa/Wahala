export function PrototypeBanner({ label }: { label: string }) {
  return (
    <p className="border-b border-line bg-danger-dim px-4 py-2 text-center text-[12px] leading-snug text-fg/80">
      {label}
    </p>
  );
}
