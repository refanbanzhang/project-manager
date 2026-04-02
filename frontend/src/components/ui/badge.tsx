export function Badge({ children, variant = "default", className = "" }: any) {
  const variants: any = {
    default: "bg-zinc-800 text-zinc-300",
    primary: "bg-indigo-500/10 text-indigo-400",
    success: "bg-emerald-500/10 text-emerald-400",
    warning: "bg-amber-500/10 text-amber-400",
    destructive: "bg-red-500/10 text-red-400",
    outline: "border border-zinc-700 text-zinc-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
