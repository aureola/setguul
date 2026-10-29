export function TableCard({
  children,
  fixed = false,
}: {
  children: React.ReactNode;
  fixed?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className={`w-full border-collapse text-sm ${fixed ? "table-fixed" : "min-w-max"}`}>
        {children}
      </table>
    </div>
  );
}

export const theadRowClass = "border-b border-border text-left text-xs uppercase tracking-wide text-muted";
export const thClass = "px-4 py-3 font-semibold";
export const tdClass = "px-4 py-3.5";
export const trClass = "border-b border-border/60 transition last:border-b-0 hover:bg-border/20";
