"use client";

export function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm font-semibold transition hover:bg-border disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-accent text-accent-contrast hover:bg-accent" : "text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">{children}</div>
  );
}

export function ToolbarSeparator() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}
