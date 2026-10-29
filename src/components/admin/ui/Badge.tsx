const VARIANTS = {
  accent: "bg-accent/15 text-accent",
  muted: "bg-border text-muted",
  green: "bg-emerald-500/15 text-emerald-400",
  red: "bg-red-500/15 text-red-400",
} as const;

export default function Badge({
  children,
  variant = "muted",
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}
