/**
 * Formatting helpers for timestamps, hashes, numbers, and badge styles.
 * Aurora Neon design tokens integrated.
 */

export const formatDate = formatDateTime;

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(d) + ' UTC';
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDateTime(isoString);
  } catch {
    return isoString;
  }
}

export function formatCommitHash(hash) {
  if (!hash) return '—';
  return hash.length > 7 ? hash.slice(0, 7) : hash;
}

export function getStatusBadgeConfig(status) {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'healthy':
    case 'successful':
    case 'resolved':
    case 'closed':
    case 'ready':
      return {
        bg: 'bg-aurora-mint/15 text-aurora-mint border-aurora-mint/30 shadow-sm',
        dot: 'bg-aurora-mint shadow-glow-mint',
        label: normalized.toUpperCase(),
      };
    case 'degraded':
    case 'investigating':
    case 'mitigated':
      return {
        bg: 'bg-aurora-amber/15 text-aurora-amber border-aurora-amber/30 shadow-sm',
        dot: 'bg-aurora-amber shadow-glow-amber',
        label: normalized.toUpperCase(),
      };
    case 'down':
    case 'failed':
    case 'critical':
    case 'open':
    case 'unhealthy':
      return {
        bg: 'bg-aurora-coral/15 text-aurora-coral border-aurora-coral/30 shadow-sm',
        dot: 'bg-aurora-coral shadow-glow-coral',
        label: normalized.toUpperCase(),
      };
    case 'simulated':
      return {
        bg: 'bg-aurora-cyan/15 text-aurora-cyan border-aurora-cyan/30 shadow-sm',
        dot: 'bg-aurora-cyan shadow-glow-cyan',
        label: 'SIMULATED (DRY RUN)',
      };
    case 'pending':
    case 'in_progress':
      return {
        bg: 'bg-aurora-lavender/15 text-aurora-lavender border-aurora-lavender/30 shadow-sm',
        dot: 'bg-aurora-lavender animate-pulse',
        label: normalized.replace('_', ' ').toUpperCase(),
      };
    case 'maintenance':
      return {
        bg: 'bg-aurora-purple/15 text-aurora-purple border-aurora-purple/30 shadow-sm',
        dot: 'bg-aurora-purple shadow-glow-purple',
        label: 'MAINTENANCE',
      };
    default:
      return {
        bg: 'bg-surface-elevated text-text-secondary border-surface-border',
        dot: 'bg-text-muted',
        label: normalized.toUpperCase() || 'UNKNOWN',
      };
  }
}
