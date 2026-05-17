export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-ink text-white hover:bg-moss",
    secondary: "bg-white text-ink border border-slate-200 hover:border-moss",
    danger: "bg-coral text-white hover:bg-red-500",
    gold: "bg-gold text-ink hover:bg-amber-400"
  };

  return (
    <button
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
