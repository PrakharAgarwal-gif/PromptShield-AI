/**
 * Formatting helpers for timestamps, hashes, numbers, and badge styles.
 */

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
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-400',
        label: normalized.toUpperCase(),
      };
    case 'degraded':
    case 'investigating':
    case 'mitigated':
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-400',
        label: normalized.toUpperCase(),
      };
    case 'down':
    case 'failed':
    case 'critical':
    case 'open':
    case 'unhealthy':
      return {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dot: 'bg-rose-400',
        label: normalized.toUpperCase(),
      };
    case 'simulated':
      return {
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dot: 'bg-blue-400',
        label: 'SIMULATED (DRY RUN)',
      };
    case 'pending':
    case 'in_progress':
      return {
        bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        dot: 'bg-sky-400 animate-pulse',
        label: normalized.replace('_', ' ').toUpperCase(),
      };
    case 'maintenance':
      return {
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        dot: 'bg-purple-400',
        label: 'MAINTENANCE',
      };
    default:
      return {
        bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        dot: 'bg-slate-400',
        label: normalized.toUpperCase() || 'UNKNOWN',
      };
  }
}

