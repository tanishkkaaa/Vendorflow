import { Sparkles } from 'lucide-react';

/** Recurring visual motif marking anything AI-generated/assisted across the app. */
export function AIBadge({ label = 'AI', pulsing = false }: { label?: string; pulsing?: boolean }) {
  return (
    <span className="badge border border-accent/30 bg-accent-light text-accent-dark">
      <Sparkles size={12} className={pulsing ? 'animate-pulse' : ''} />
      {label}
    </span>
  );
}
