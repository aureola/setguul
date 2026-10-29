import Card from "./Card";

export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
    </Card>
  );
}
