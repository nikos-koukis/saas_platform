"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Built on the native <dialog>, which brings focus trapping, inert background
 * content and Escape handling without a third-party library. Escape is
 * intercepted so the dialog only ever closes through React state.
 */
export function Modal({ open, onClose, title, description, className, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // showModal() makes the page behind inert, but it stays scrollable.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click that lands on the dialog itself landed on the backdrop.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-auto max-h-[min(90vh,42rem)] w-[calc(100%-2rem)] max-w-lg rounded-2xl",
        "border border-border bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-m-1 rounded-lg p-1 text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
      </header>

      <div className="max-h-[calc(min(90vh,42rem)-4.5rem)] overflow-y-auto px-5 py-4">
        {children}
      </div>
    </dialog>
  );
}
