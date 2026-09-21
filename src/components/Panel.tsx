'use client';

import { useEffect, useRef } from 'react';
import { places, type PlaceId } from '@/data/site';
import PlaceContent from './PlaceContent';

type Props = { id: PlaceId; onClose: () => void };

export default function Panel({ id, onClose }: Props) {
  const place = places.find((p) => p.id === id)!;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  // Keep Tab inside the dialog while it is open.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button');
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-night/70" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        onKeyDown={onKeyDown}
        className="rise relative max-h-[86dvh] w-full overflow-y-auto rounded-t-3xl border border-dusk bg-[#131847] px-6 pb-8 pt-7 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:px-10 sm:pb-10 sm:pt-9"
      >
        <div className="flex items-start justify-between gap-6">
          <h2
            id="panel-title"
            className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          >
            {place.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close and go back to the street"
            className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-mist transition-colors hover:bg-dusk hover:text-chalk"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-6">
          <PlaceContent id={id} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 font-display text-sm text-lamp underline underline-offset-4"
        >
          Back to the street
        </button>
      </div>
    </div>
  );
}
