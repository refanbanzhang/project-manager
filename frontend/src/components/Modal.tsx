"use client";

import { Button } from "@heroui/react";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} modal-cyber rounded-none animate-in fade-in zoom-in-95 duration-300`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] font-[family-name:var(--font-heading)]">{title}</h2>
          <Button isIconOnly variant="ghost" size="sm" onPress={onClose} className="text-[var(--text-tertiary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-5">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-sm modal-cyber rounded-none animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center p-8 text-center gap-3">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-none bg-[var(--danger-soft)] border border-[var(--danger)]">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p
            className="text-sm text-[var(--text-secondary)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>
        <div className="flex justify-center gap-3 px-8 pb-8 pt-2">
          <Button variant="ghost" className="flex-1" onPress={onClose}>
            {cancelText}
          </Button>
          <Button variant="ghost" className={`flex-1 ${danger ? "bg-[var(--danger)] text-white" : ""}`} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
