"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface DropdownOption {
  id: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  renderTrigger?: (label: string, isOpen: boolean) => ReactNode;
  renderItem?: (option: DropdownOption, isSelected: boolean) => ReactNode;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  renderTrigger,
  renderItem,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.id === value);

  const defaultTrigger = (
    <button
      onClick={() => setOpen(!open)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-none border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
    >
      <span className="text-sm text-[var(--text-primary)]">{selectedOption?.label || placeholder}</span>
      <svg
        className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );

  const defaultItem = (option: DropdownOption, isSelected: boolean) => (
    <button
      onClick={() => {
        onChange(option.id);
        setOpen(false);
      }}
      className={`w-full px-3 py-2 text-sm text-left hover:bg-[var(--accent-soft)] transition-colors cursor-pointer ${
        isSelected ? "bg-[var(--accent-soft)]" : ""
      }`}
    >
      <span className="text-[var(--text-primary)]">{option.label}</span>
    </button>
  );

  return (
    <div className="relative">
      {renderTrigger ? renderTrigger(selectedOption?.label || placeholder, open) : defaultTrigger}

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 py-1 rounded-none border border-[var(--border-primary)] bg-[var(--bg-card)] z-20">
            {options.map((option) =>
              renderItem
                ? renderItem(option, option.id === value)
                : defaultItem(option, option.id === value)
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  statusMap: Record<string, string>;
}

const statusColorMap: Record<string, string> = {
  active: "bg-[var(--success)]",
  paused: "bg-[var(--warning)]",
  completed: "bg-[var(--accent)]",
  archived: "bg-[var(--text-tertiary)]",
};

export function StatusDropdown({ value, onChange, statusMap }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const statuses = Object.keys(statusMap);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-none border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-none ${statusColorMap[value]}`} />
        <span className="text-sm font-medium text-[var(--text-primary)]">{statusMap[value]}</span>
        <svg
          className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 py-1 rounded-none border border-[var(--border-primary)] bg-[var(--bg-card)] z-20">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  onChange(status);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--accent-soft)] transition-colors cursor-pointer ${
                  value === status ? "bg-[var(--accent-soft)]" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-none ${statusColorMap[status]}`} />
                <span className="text-[var(--text-primary)]">{statusMap[status]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface TypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
}

export function TypeDropdown({ value, onChange, options }: TypeDropdownProps) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}
