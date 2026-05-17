export default function MetricCard({ label, value, tone = "moss" }) {
  const tones = {
    moss: "bg-mint text-moss",
    gold: "bg-amber-100 text-amber-700",
    coral: "bg-red-100 text-red-700",
    ink: "bg-slate-100 text-ink"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className={`mb-4 inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-bold ${tones[tone]}`}>{value}</div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
