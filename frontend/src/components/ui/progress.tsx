export function Progress({ value = 0, className = "" }: any) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-zinc-800 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
