export default function Card({ children, className = "" }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-soft ${className}`}>{children}</section>;
}
