/**
 * Global application constants and badge mapping definitions.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

export const APP_CONFIG = {
  name: 'CloudOps Sentinel',
  version: '0.1.0',
  description: 'Enterprise Cloud Monitoring & Automated Self-Healing Platform',
  refreshInterval: 15000, // 15 seconds poll for live status
};

export const APPLICATION_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  DOWN: 'down',
  MAINTENANCE: 'maintenance',
};

export const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back',
};

export const INCIDENT_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const INCIDENT_STATUS = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  MITIGATED: 'mitigated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const INCIDENT_SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const INCIDENT_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const RECOVERY_ACTION_TYPES = [
  { value: 'restart_service', label: 'Restart Service', description: 'Safely restart the application service layer' },
  { value: 'rollback_deployment', label: 'Rollback Deployment', description: 'Revert to previous known healthy release' },
  { value: 'scale_replicas', label: 'Scale Replicas', description: 'Adjust instance capacity to mitigate overload' },
  { value: 'restart_container', label: 'Restart Container', description: 'Re-initialize crashed worker container' },
  { value: 'purge_cache', label: 'Purge Cache', description: 'Flush stale cache nodes and reload indices' },
];

export const ENVIRONMENTS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
];

