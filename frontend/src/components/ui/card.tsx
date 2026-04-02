export function Card({ className = "", children, ...props }: any) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:-translate-y-0.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }: any) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }: any) {
  return <h3 className={`text-base font-semibold tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({ className = "", children }: any) {
  return <p className={`text-sm text-zinc-400 line-clamp-2 ${className}`}>{children}</p>;
}

export function CardContent({ className = "", children }: any) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }: any) {
  return <div className={`flex items-center justify-between p-5 pt-0 text-xs text-zinc-500 border-t border-zinc-800 ${className}`}>{children}</div>;
}
