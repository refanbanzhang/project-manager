"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      default: "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700 bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-100",
      primary: "bg-indigo-500 text-white border border-indigo-500 hover:bg-indigo-600",
      ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
      destructive: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    };
    const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };
    const v = variants[variant];
    const s = sizes[size];

    return <button ref={ref} className={`${base} ${v} ${s} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";
